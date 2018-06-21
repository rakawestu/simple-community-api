import Rx from 'rxjs/Rx'
import pg from 'pg'

import config from '../../config'

const pool = new pg.Pool({
  host: config.pgHost,
  port: config.pgPort,
  database: config.pgDatabase,
  user: config.pgUser,
  password: config.pgPassword,
  idleTimeoutMillis: 2000
})

const connectPostgres = () => {
  return Rx.Observable.create((observer) => {
    pool.connect()
      .then((client) => {
        if (!observer.closed) {
          observer.next(client)
          observer.complete()

          client.release()
        }
      })
      .catch((e) => {
        if (!observer.closed) {
          observer.error(e)
        }
      })
  })
}

export default connectPostgres
