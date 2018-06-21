import Moment from 'moment'

const validateDate = (dateAsString) => {
  const date = Moment(dateAsString)

  return date.isValid()
}

export default validateDate