import Rx from 'rxjs/Rx'

/* eslint-disable-next-line */
const handleLiveness = (request, response) => {
  return Rx.Observable.of({
    statusCode: 200,
    message: 'OK'
  })
}

export default handleLiveness
