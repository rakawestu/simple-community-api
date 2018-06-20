const sendJsendResponse = (response, statusCode = 500, data = null, message = null) => {
  response.writeHead(statusCode, {
    'Content-Type': 'application/json'
  })
  
  if (!data && !message) {
    response.end()
    return
  }
  
  const responseBody = {
    status: (statusCode >= 200 && statusCode < 400) ? 'succeeded' : 'failed'
  }
  if (data) responseBody.data = data
  if (message) responseBody.message = message
  
  const responseBodyString = JSON.stringify(responseBody)
  response.end(responseBodyString)
  
  return responseBodyString // Is it still necessary to return value?
}
  
export default sendJsendResponse