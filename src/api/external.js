import http from '@/utils/request'

export function getExternalFormData(externalFormId, tenantId) {
    return http.get('/external/getExternalFormData', { externalFormId, tenantId });
}

export function saveRecord(externalFormId, tenantId, body) {
    return http.post('/external/saveRecord', body, { params: { externalFormId, tenantId } });
}

export function externalRefFieldQuery(externalFormId,field, pageNo, pageSize, queryText, extraFilter, sort, tenantId) {
    return http.get('/external/refFieldQuery', { externalFormId, 'refField': field, pageNo, pageSize, queryText, extraFilter, sort, tenantId });
}

// 外部表单获取数据
export function queryExternalFormById(entityId, fieldNames, body, externalFormId) {
    return http.post('/external/queryById', body, { params: { entityId, fieldNames, externalFormId } })
}