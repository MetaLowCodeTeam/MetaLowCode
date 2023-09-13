import http, { request } from '@/utils/request'

export function refFieldQuery(entity, field, pageNo, pageSize) {
    return http.get('crud/refFieldQuery', { entity, 'refField': field, pageNo, pageSize })
}

export function createRecord(entity) {
    return http.get('crud/formCreateQuery', { entity })
}

export function updateRecord(entity, id) {
    return http.get('crud/formUpdateQuery', { entity, id })
}

export function saveRecord(entity, id, formModel) {
    return http.post('crud/saveRecord', formModel, {
        params: { entity, id },
    })
}

export function deleteRecord(id) {
    return http.post('crud/deleteRecord', {}, {
        params: { id },
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
* @param {*} advFilter { equation="AND", items:[{  "fieldName": "flowName", "op": "LK", "value": "修改"}] }  常用查询
* @param {*} quickFilter ""  快速查询
* @param {*} sortFields [{   "fieldName": "entityCode","type": "desc" }] 排序
*/
export function getDataList(entity, fields, filter, pageSize, pageNo, sortFields, advFilter, quickFilter) {
    return http.post('crud/listQuery', {
        'mainEntity': entity,
        'fieldsList': fields,
        filter, pageSize, pageNo, sortFields, advFilter, quickFilter
    })
}

export function initDataList(entity) {
    return http.get('crud/initDataList', { entity })
}


/**
 * 通用获取实体列表接口（实体+列表页面的实体列表）
 * @param {*} entityName 实体名称
 */
export function getEntityCodeList(entityName) {
    return http.get('/crud/getEntityCodeList', { entityName })
}

/**
 * 通用查询详情接口
 * @param {*} entityId 实体ID
 * @param {*} fieldNames 需要获取的字段名称
 */
export function queryById(entityId, fieldNames) {
    return http.get('/crud/queryById', { entityId, fieldNames })
}


/**
 * 通用查询-获取实体字段
 * @param {*} entityCode 实体
 * @param {*} queryReference 是否查询引用实体的字段（单引用）  true or false 默认 false
 * @param {*} queryReserved 是否查询系统字段  true or false 默认 false
 */
export function queryEntityFields(entityCode, queryReference, queryReserved) {
    return http.get('/crud/queryEntityFields', { entityCode, queryReference, queryReserved })
}

/**
 * 分配
 */
export function assignRecord(body) {
    return http.post('/crud/assignRecord', body)
}