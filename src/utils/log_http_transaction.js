import logger from '../infrastructure/logger'

const logHttpTransaction = (request, response, requestBody, responseBody, elapsedTime) => {
  logger.info(`
==
==  HTTP Transaction
==
[${request.method} ${request.url}] [${response.statusCode}]
Elapsed time: ${elapsedTime} ms
↑↑↑ REQUEST ↑↑↑
HEADERS: ${Object.keys(request.headers).reduce((acc, curr) => acc + curr + ': ' + request.headers[curr] + '\n', '\n')}
BODY:
${requestBody}
↓↓↓ RESPONSE ↓↓↓
BODY:
${responseBody}
`)
}

export default logHttpTransaction