const convertErrorToJsend = (err) => {
  if (err && err.message && err.statusCode) {
    return {
      statusCode: err.statusCode,
      message: err.message
    }
  }
  if (err && err.message) {
    return {
      statusCode: 500,
      message: err.message
    }
  }
  
  return {
    statusCode: 500,
    message: 'Something went wrong. Please contact developer.'
  }
}
  
export default convertErrorToJsend
  