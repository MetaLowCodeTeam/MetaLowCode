import http, { request } from '@/utils/request'

export function refFieldQuery(entity, field, pageNo, pageSize, queryText, extraFilter) {
    return http.get('crud/refFieldQuery', { entity, 'refField': field, pageNo, pageSize, queryText, extraFilter });
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
    return http.post('crud/deleteRecord', {
        recordIds: [id],
        cascades: []
    })
}

export function deleteRecords(body) {
    return http.post('crud/deleteRecord', body)
}

/**
*
* 通用查询接口
* @param {*} mainEntity 实体名称
* @param {*} fieldsList 要显示的字段名称
* @param {*} filter { equation="AND", items:[{  "fieldName": "flowName", "op": "LK", "value": "修改"}] }  过滤
* @param {*} pageSize 默认页数大小
* @param {*} pageNo 页数大小
* @param {*} sortFields [{   "fieldName": "entityCode","type": "desc" }] 排序
* @param {*} advFilter { equation="AND", items:[{  "fieldName": "flowName", "op": "LK", "value": "修改"}] }  常用查询
* @param {*} quickFilter ""  快速查询
* @param {*} builtInFilter ""  { equation="AND", items:[{  "fieldName": "flowName", "op": "LK", "value": "修改"}] } 参数查询
* @param {*} filterEasySql ""  分组查询

*/
export function getDataList(entity, fields, filter, pageSize, pageNo, sortFields, advFilter, quickFilter, builtInFilter, statistics, filterEasySql) {
    return http.post('crud/listQuery', {
        'mainEntity': entity,
        'fieldsList': fields,
        filter, pageSize, pageNo, sortFields, advFilter, quickFilter, builtInFilter, statistics, filterEasySql
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
 * @param {*} firstReference 是否查询引用字段（不包含引用实体字段）  true or false 默认 false
 */
export function queryEntityFields(entityCode, queryReference, queryReserved, firstReference) {
    return http.get('/crud/queryEntityFields', { entityCode, queryReference, queryReserved, firstReference })
}

// 列显示
export function queryEntityListableFields(entityCode) {
    return http.get('/crud/queryEntityListableFields', { entityCode})
}

/**
 * 分配
 */
export function assignRecord(body) {
    return http.post('/crud/assignRecord', body)
}
/**
 * 共享
 */
export function shareRecord(body) {
    return http.post('/crud/shareRecord', body)
}
/**
 * 取消共享
 */
export function cancelShareRecord(body, userType) {
    return http.post('/crud/cancelShareRecord', body, { params: { userType } })
}

/**
 * 删除
 */
// export function deleteRecord(body) {
//     return http.post('/crud/deleteRecord', body)
// }


/**
 * 分组查询
 */
export function groupTreeQuery(body) {
    return http.post('/crud/groupTreeQuery', body)
}


/**
 * 批量编辑
 */
export function updateRecordList(body) {
    return http.post('/crud/updateRecordList', body)
}