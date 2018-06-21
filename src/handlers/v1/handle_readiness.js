import Rx from 'rxjs/Rx'
import connectPostgres from '../../infrastructure/postgres/connect_postgres'

const handleReadiness = (request, response) => {
  return connectPostgres()
    .switchMap((client) => Rx.Observable.fromPromise(client.query('SELECT 1;')))
    .mapTo({
      statusCode: 200,
      message: 'Ready to accept traffic.'
    })
    .catch((err) => Rx.Observable.of({
      statusCode: 500,
      message: 'One or more dependencies are not ready. Error message: ${err.message}'
    }))
}

export default handleReadiness