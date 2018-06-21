# Simple Community Management API

## Endpoints 

### 1. GET Liveness

Ensures that the server is alive, though not necessarily ready to accept HTTP traffic.

Sample response(s):

```
HTTP 200 OK

{
  "status": "succeeded",
  "message": "OK"
}
```

### 2. GET Readiness

Detects that the server is ready to accept HTTP traffic. Please note that this endpoint should not be exposed into public.

Sample response(s):

```
HTTP 200 OK

{
  "status": "succeeded",
  "message": "Ready to accept traffic."
}
```

```
HTTP 500 Internal Server Error

{
  "status": "failed",
  "message": "One or more dependencies are not ready. Error message: 'connect ECONNREFUSED 127.0.0.1:5432'"
}
```

## How to Run

### Run Migration

`npm run migrate`

### Run Server

`npm run serve` 
