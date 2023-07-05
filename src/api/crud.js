import http, { request } from '@/utils/request'

export function refFieldQuery(entity, field, pageNo, pageSize) {
  return http.get('crud/refFieldQuery', {entity, 'refField': field, pageNo, pageSize})
}

export function createRecord(entity) {
  return http.get('crud/formCreateQuery', {entity})
}

export function updateRecord(entity, id) {
  return http.get('crud/formUpdateQuery', {entity, id})
}

export function saveRecord(entity, id, formModel) {
  return http.post('crud/saveRecord', formModel, {
    params: {entity, id},
  })
}

export function deleteRecord(id) {
  return http.post('crud/deleteRecord', {}, {
    params: {id},
  })
}

export function getDataList(entity, fields, filter, pageSize, pageNo) {
  return http.post('crud/listQuery', {
    'mainEntity': entity,
    'fieldsList': fields,
    filter, pageSize, pageNo
  })
}

export function initDataList(entity) {
  return http.get('crud/initDataList', {entity})
}
