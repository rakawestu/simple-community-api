# Simple Community Management API

## Endpoints 

### 1. GET Liveness (GET /liveness)

Ensures that the server is alive, though not necessarily ready to accept HTTP traffic.

Sample response(s):

```
HTTP 200 OK

{
  "status": "succeeded",
  "message": "OK"
}
```

### 2. GET Readiness (GET /readiness)

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

### CREATE Member (POST /members)

Insert a community member into database.

Sample Request Body(ies):

```
{
	"full_name" : "People Full Name",
	"city": "City Name",
	"member_type" : "anggota|pengurus|ketua",
	"birth_date" : "yyyy-mm-dd",
	"join_date" : "yyyy-mm-dd" // optional
}
```

Those data will be saved as a single member of the community.

Sample Response(s):

```
{
	"status": "succeeded",
	"data": {
		"member": {
			"id": "zxcvbnml-asdf-qwer-poiu-123456789012",
			"full_name": "People Full Name",
			"city": "City Name",
			"member_type": "ketua|pengurus|anggota",
			"birth_date": "1992-05-13T00:00:00.000Z", // ISO 8601 formatted
			"join_date": "2018-01-02T00:00:00.000Z", // ISO 8601 formatted
			"created_at": "2018-06-21T18:08:21.593Z", // ISO 8601 formatted
			"updated_at": null,
			"deleted_at": null
		}
	},
	"message": "Member created"
}
```

### GET All Members (GET /members)

Get all registered member data.

Sample Response(s):

```
{
	"status": "succeeded",
	"data": {
		"members": [
			{
				"id": "zxcvbnml-asdf-qwer-poiu-123456789012",
				"full_name": "People Full Name",
				"city": "City Name",
				"member_type": "anggota|pengurus|ketua",
				"birth_date": "1994-09-11T00:00:00.000Z",
				"join_date": "2018-01-01T00:00:00.000Z",
				"created_at": "2018-06-21T17:42:12.782Z",
				"updated_at": null,
				"deleted_at": null
			},
			{
				"id": "70304280-7939-42b2-9200-f333ed595e76",
				"full_name": "People Full Name",
				"city": "City Name",
				"member_type": "ketua|pengurus|anggota",
				"birth_date": "1992-05-13T00:00:00.000Z", // ISO 8601 formatted
				"join_date": "2018-01-02T00:00:00.000Z", // ISO 8601 formatted
				"created_at": "2018-06-21T18:08:21.593Z", // ISO 8601 formatted
				"updated_at": null,
				"deleted_at": null
			}
		]
	}
}
```

#### Filter Members 

Filter registered member data using these query string parameters:
- `join_date` - Formatted in `yyyy-mm-dd`
- `member_type` - Only accept `ketua`, `pengurus` or `anggota`
- `city` - case insensitive

Complete example of the endpoint: `GET /members?join_date=2018-01-01&member_type=pengurus&city=namakota`

Response format should be same as Get All Members.

### GET Member by ID (GET /members/<member_id>)

Get specific member data by using their uuid.

Example response(s):

```
{
	"status": "succeeded",
	"data": {
		"member": {
			"id": "58068cec-3141-4b8d-915d-50e99be995ed",
			"full_name": "People Full Name",
			"city": "City Name",
			"member_type": "anggota|pengurus|ketua",
			"birth_date": "1994-09-11T00:00:00.000Z", // ISO 8601 formatted
			"join_date": "2018-01-01T00:00:00.000Z", // ISO 8601 formatted
			"created_at": "2018-06-21T17:42:12.782Z", // ISO 8601 formatted
			"updated_at": null,
			"deleted_at": null
		}
	}
}
```

### UPDATE Member (PUT /members/<member_id>)

Update specific member data.

Example Request Body(ies):

```
{
	"full_name" : "People Full Name",
	"city": "City Name",
	"member_type" : "anggota|pengurus|ketua",
	"birth_date" : "yyyy-mm-dd",
	"join_date" : "yyyy-mm-dd" // optional
}
```

Example Response(s):

```
{
	"status": "succeeded",
	"data": {
		"member": {
			"id": "70304280-7939-42b2-9200-f333ed595e76",
			"full_name": "People Full Name",
			"city": "City Name",
			"member_type": "ketua|pengurus|anggota",
			"birth_date": "1992-05-13T00:00:00.000Z", // ISO 8601 formatted
			"join_date": "2018-06-21T18:20:53.462Z", // ISO 8601 formatted
			"created_at": "2018-06-21T18:08:21.593Z", // ISO 8601 formatted
			"updated_at": "2018-06-21T18:20:53.462Z", // ISO 8601 formatted
			"deleted_at": null
		}
	},
	"message": "Member updated"
}
```

### Delete Member

Delete specific member data

Example Response(s):

```
{
	"status": "succeeded",
	"message": "Member was deleted"
}
```

## How to Run

### Run Migration

`npm run migrate`

### Run Server

`npm run serve` 

### Using Docker Compose

This will run API and its dependencies on one command.

```
docker-compose up -d
```
