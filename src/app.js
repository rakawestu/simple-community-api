import http from 'http'
import url from 'url'
import util from 'util'
import readBody from 'body'
import Rx from 'rxjs/Rx'
import Postgrator from 'postgrator'

import config from './config'

import logger from './infrastructure/logger'

import {
  convertErrorToJsend,
  logHttpTransaction,
  sendJsendResponse
} from './utils'

import { handleLiveness } from './handlers/v1'

const main = () => {
  const args = process.argv
  if (args.length > 2 && args[2].toLowerCase() === 'migrate') {
    migrate()
  } else {
    run()
  }
}

const run = () => {
  runHttpServer()
}

const migrate = () => {
  const postgrator = new Postgrator({
    migrationDirectory: `${__dirname}/../migrations`,
    driver: 'pg',
    host: config.pgHost,
    port: config.pgPort,
    database: config.pgDatabase,
    username: config.pgUser,
    password: config.pgPassword
  })

  postgrator.migrate()
    .then((appliedMigrations) => {
      if (appliedMigrations.length < 1) logger.info('Database structure already up-to-date.')
      else appliedMigrations.forEach((migration) => logger.info(`Migration '${migration.name}' succeeded.`))
    })
    .catch((error) => {
      logger.error(error.message)
      process.exit(-1) // For some reason, when error occured Postgrator won't quit. So we need to tell it to.
    })
}

const runHttpServer = () => {
  const httpServer = createHttpServer()
  httpServer.listen(config.serverPort, () => {
    logger.info(`Listening on port ${config.serverPort}`)
  })
}

const createHttpServer = () => {
  const routes = {
    '/liveness': handleLiveness
  }

  const handleNotFound = (request) => {
    const parsedUrl = url.parse(request.url)

    return Rx.Observable.of({
      statusCode: 404,
      message: `Can't find resource '${parsedUrl.path}'`
    })
  }

  return http.createServer((request, response) => {
    const startProcessingTime = Date.now()

    Rx.Observable.defer(() => Rx.Observable.of(url.parse(request.url)))
      .map((parsedUrl) => parsedUrl.pathname.toLowerCase())
      .switchMap((cleanUrl) => {
        const readRequestBodyAsync = util.promisify(readBody)
        return Rx.Observable.defer(() =>
          Rx.Observable.fromPromise(readRequestBodyAsync(request))
        ).switchMap((requestBody) => {
          return (
            Rx.Observable.defer(() => {
              // Determine which handler to execute
              const paths = cleanUrl
                .split('/')
                .filter((path) => path !== '')
                .map((path) => `/${path}`)
              const handler = routes[paths[0]]

              if (!handler) return handleNotFound(request)

              // Newrelic set transaction name
              //const newrelicTransactionName = paths[0].substring(1, paths[0].length - 1)
              //newrelic.setTransactionName(newrelicTransactionName)

              // The most interesting in Cartographer happen inside the code below.
              return handler(request, response, requestBody)
            })
              // Should *any* error happened in the stream above, we need to log it.
              .do({
                error(err) {
                  logger.warn(err.message)
                  logger.warn(err.stack)
                }
              })
              // .. after we log the error, we need to convert it to JSend format.
              .catch((err) => Rx.Observable.of(convertErrorToJsend(err)))
              // Finally, we insert `requestBody` onto the next stream for logging purpose.
              .map((result) => ({ result, requestBody }))
          )
        })
      })
      .subscribe({
        next({ result, requestBody }) {
          const responseBody = sendJsendResponse(
            response,
            result.statusCode,
            result.data,
            result.message
          )
          const endProcessingTime = Date.now()

          logHttpTransaction(
            request,
            response,
            requestBody,
            responseBody,
            endProcessingTime - startProcessingTime
          )
        },
        error(err) {
          // Because all error *should* have been catch by `catch` operator above, this line should not be reached.
          // However, I can't exactly predict that that will happen 100%. So, to prepare for the worst case, we still
          // send HTTP response telling the user that we're a bunch of responsible developer ;).
          sendJsendResponse(
            response,
            500,
            null,
            'This should not be reached. Please contact developer.'
          )

          logger.error(err.message)
          logger.error(err.stack)
        }
      })
  })
}

main()