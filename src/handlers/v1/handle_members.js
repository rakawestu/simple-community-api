import url from 'url'
import Rx from 'rxjs/Rx'
import Schema from 'validate'
import uuidv4 from 'uuid/v4'
import Moment from 'moment'

import connectPostgres from '../../infrastructure/postgres/connect_postgres'
import createHttpError from '../../utils/create_http_error'
import validateMemberType from '../../utils/validate_member_type'
import validateDate from '../../utils/validate_date'
import convertDateToISO8601 from '../../utils/convert_date_to_iso8601'

const handleMembers = (request, response, requestBody) => {
  return Rx.Observable
    .defer(() => {
      switch (request.method.toUpperCase()) {
      case 'POST':
        return handleCreateMember(request, response, requestBody)
      case 'PUT':
        return handleUpdateMember(request, response, requestBody)
      case 'GET':
        return handleGetMembers(request)
      case 'DELETE':
        return handleDeleteMemberById(request)
      default: 
        return Rx.Observable.throw(createHttpError(405, `Unsupported request method '${request.method}'`))
      }
    })
}

const handleCreateMember = (request, response, requestBody) => {
  return Rx.Observable
    .defer(() => Rx.Observable.of(url.parse(request.url)))
    .map((parsedUrl) => parsedUrl.pathname.split('/').filter((path) => path !== ''))
    .switchMap((paths) => {
      if (paths.length != 1) return Rx.Observable.throw(400, 'Wrong path format')

      return Rx.Observable
        .defer(() => Rx.Observable.of(JSON.parse(requestBody)))
        .catch(() => Rx.Observable.throw(createHttpError(400, 'Invalid JSON provided')))
    })
    .switchMap((parsedRequestBody) => validateMemberRequest(parsedRequestBody).mapTo(parsedRequestBody))
    .switchMap((parsedRequestBody) => {
      return connectPostgres()
        .switchMap((client) => {
          const parsedBirthDate = convertDateToISO8601(parsedRequestBody.birth_date)
          const parsedJoinDate = parsedRequestBody.join_date? 
            convertDateToISO8601() : 
            Moment().toISOString()

          const query = {
            text :  'INSERT INTO members ' +
                '(id, full_name, city, member_type, birth_date, join_date) ' +
                'VALUES ($1, $2, $3, $4, $5, $6) ' +
                'RETURNING *',
            values: [uuidv4(), parsedRequestBody.full_name, parsedRequestBody.city, parsedRequestBody.member_type, parsedBirthDate, parsedJoinDate]
          }

          return Rx.Observable.fromPromise(client.query(query))
        })
        .catch((err) => {
          if (err.detail) return Rx.Observable.throw(createHttpError(400, err.detail))
          return Rx.Observable.throw(err)
        })
        .map((result) => ({
          statusCode: 201,
          message: 'Member created',
          data: {
            member: result.rows[0]
          }
        }))
    })
}

const handleUpdateMember = (request, response, requestBody) => {
  return Rx.Observable
    .defer(() => Rx.Observable.of(url.parse(request.url)))
    .map((parsedUrl) => parsedUrl.pathname.split('/').filter((path) => path !== ''))
    .switchMap((paths) => {
      if (paths.length != 2) return Rx.Observable.throw(400, 'Wrong path format')

      return Rx.Observable
        .defer(() => {
          const parsedJson = JSON.parse(requestBody)
          const data = {
            id: paths[1],
            request: parsedJson
          }

          return Rx.Observable.of(data)
        })
        .catch(() => Rx.Observable.throw(createHttpError(400, 'Invalid JSON provided')))
    })
    .switchMap((data) => validateMemberRequest(data.request).mapTo(data))
    .switchMap((data) => {
      return connectPostgres()
        .switchMap((client) => {
          const parsedRequestBody = data.request
          const parsedBirthDate = convertDateToISO8601(parsedRequestBody.birth_date)
          const parsedJoinDate = parsedRequestBody.join_date? 
            convertDateToISO8601() : 
            Moment().toISOString()

          const query = {
            text :  'UPDATE members ' +
                'SET full_name = $1, ' +
                'city = $2, ' +
                'member_type = $3, ' +
                'birth_date = $4, ' + 
                'join_date = $5, ' +
                'updated_at = CURRENT_TIMESTAMP ' +
                'WHERE id = $6 ' + 
                'RETURNING *',
            values: [parsedRequestBody.full_name, parsedRequestBody.city, parsedRequestBody.member_type, parsedBirthDate, parsedJoinDate, data.id]
          }

          return Rx.Observable.fromPromise(client.query(query))
        })
        .catch((err) => {
          if (err.detail) return Rx.Observable.throw(createHttpError(400, err.detail))
          return Rx.Observable.throw(err)
        })
        .switchMap((result) => {
          if (result.rowCount < 1) {
            return Rx.Observable.throw(createHttpError(404, 'Member with this ID is not found'))
          }

          return Rx.Observable.of({
            statusCode: 200,
            message: 'Member updated',
            data: {
              member: result.rows[0]
            }
          })
        })
    })
}

const handleGetMembers = (request) => {
  return Rx.Observable
    .defer(() => Rx.Observable.of(url.parse(request.url)))
    .map((parsedUrl) => parsedUrl.pathname.split('/').filter((path) => path !== ''))
    .switchMap((paths) => {
      if (paths.length > 2) return Rx.Observable.throw(createHttpError(400, 'Wrong path format'))

      if (paths[1]) {
        return handleGetMemberById(paths[1])
      }

      return handleGetMultipleMembers()
    })
}

const handleGetMultipleMembers = () => {
  const query = 'SELECT * FROM members WHERE deleted_at IS NULL'
  return connectPostgres()
    .switchMap((client) => {
      return Rx.Observable.fromPromise(client.query(query))
    })
    .map((result) => ({
      statusCode: 200,
      data: {
        members: result.rows
      }
    }))
}

const handleGetMemberById = (memberId) => {
  const query = {
    text: 'SELECT * FROM members WHERE id = $1 AND deleted_at IS NULL',
    values: [memberId] 
  }

  return connectPostgres()
    .switchMap((client) => {
      return Rx.Observable.fromPromise(client.query(query))
    })
    .switchMap((result) => {
      if (result.rowCount < 1) {
        return Rx.Observable.throw(createHttpError(404, 'Member with this ID is not found'))
      }

      return Rx.Observable.of({
        statusCode: 200,
        data: {
          member: result.rows[0]
        }
      })
    })
}

const handleDeleteMemberById = (request) => {
  return Rx.Observable
    .defer(() => Rx.Observable.of(url.parse(request.url)))
    .map((parsedUrl) => parsedUrl.pathname.split('/').filter((path) => path !== ''))
    .switchMap((paths) => {
      if (paths.length != 2) return Rx.Observable.throw(createHttpError(400, 'Wrong path format'))

      return Rx.Observable.of(paths[1])
    })
    .switchMap((memberId) => {
      return connectPostgres()
        .switchMap((client) => {
          const query = {
            text: 'UPDATE members ' +
              'SET deleted_at = CURRENT_TIMESTAMP ' +
              'WHERE id = $1',
            values: [memberId]
          }

          return Rx.Observable.fromPromise(client.query(query))
        })
    })
    .map(() => ({
      statusCode: 200,
      message: 'Member was deleted'
    }))
}

const validateMemberRequest = (requestBody) => {
  const schema = new Schema({
    full_name : { type : 'string', required : true },
    city: { type: 'string', required : true },
    member_type: { type : 'string', required : true },
    birth_date: { type: 'string', required: true },
    join_date: { type: 'string', required: false }
  }, { typecast : true })

  if (!validateMemberType(requestBody.member_type)) {
    return Rx.Observable.throw(createHttpError(400, 'Invalid member type'))
  }
  
  if (!validateDate(requestBody.birth_date)) {
    return Rx.Observable.throw(createHttpError(400, 'Invalid birth date format'))
  }

  if (requestBody.join_date && !validateDate(requestBody.join_date)) {
    return Rx.Observable.throw(createHttpError(400, 'Invalid join date format'))
  }

  const errors = schema.validate(requestBody)

  if (errors.length > 0) {
    return Rx.Observable.throw(createHttpError(400, errors[0].message))
  }

  return Rx.Observable.of(true)
}

export default handleMembers