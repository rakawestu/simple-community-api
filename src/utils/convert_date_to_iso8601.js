import Moment from 'moment'

const convertDateToISO8601 = (dateAsString) => {
  const date = Moment.utc(dateAsString)

  return date.toISOString()
}

export default convertDateToISO8601