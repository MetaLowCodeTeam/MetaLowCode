import http from '@/utils/request'

export function getExternalFormData(externalFormId) {
    return http.get('/external/getExternalFormData', { externalFormId });
}

export function saveRecord(externalFormId, body) {
    return http.post('/external/saveRecord', body, { params: { externalFormId } });
}

export function externalRefFieldQuery(externalFormId, field, pageNo, pageSize, queryText, extraFilter) {
    return http.get('/external/refFieldQuery', { externalFormId, 'refField': field, pageNo, pageSize, queryText, extraFilter });
}
