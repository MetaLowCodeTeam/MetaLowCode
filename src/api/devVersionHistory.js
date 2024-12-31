import http from '@/utils/request'

export function saveRecord(recordId, formModel) {
    return http.post('devVersionHistory/saveRecord', formModel, {
        params: { recordId },
    })
}

export function listQuery(entity, fields, filter, pageSize, pageNo, sortFields) {
    return http.post('devVersionHistory/listQuery', {
        'mainEntity': entity,
        'fieldsList': fields,
        filter,
        pageSize,
        pageNo,
        sortFields,
    })
}


export function exportDevelopSql(body) {
    return http.post('devVersionHistory/exportDevelopSql', body)
}

export function upgradeDevelopSql(file, config = {}) {
    return http.post('devVersionHistory/upgradeDevelopSql', file, config)
}
