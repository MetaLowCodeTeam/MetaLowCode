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

 /**
 * 
 * 通用查询接口
 * @param {*} mainEntity 实体名称
 * @param {*} fieldsList 要显示的字段名称
 * @param {*} pageSize 默认页数大小
 * @param {*} pageNo 页数大小
 * @param {*} filter { equation="AND", items:[{  "fieldName": "flowName", "op": "LK", "value": "修改"}] }  过滤
 * @param {*} sortFields [{   "fieldName": "entityCode","type": "desc" }] 排序
 */
export function getDataList(entity, fields, filter, pageSize, pageNo,sortFields) {
  return http.post('crud/listQuery', {
    'mainEntity': entity,
    'fieldsList': fields,
    filter, pageSize, pageNo,sortFields
  })
}

export function initDataList(entity) {
  return http.get('crud/initDataList', {entity})
}


/**
 * 通用获取实体列表接口（实体+列表页面的实体列表）
 * @param {*} entityName 实体名称
 */
export function getEntityCodeList(entityName) {
    return http.get('/crud/getEntityCodeList', {entityName})
}