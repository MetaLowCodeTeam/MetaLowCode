import http from '@/utils/request'

export function saveRecord(recordId, formModel) {
    return http.post('versioning/saveRecord', formModel, {
        params: { recordId },
    })
}

export function listQuery(entity, fields, filter, pageSize, pageNo, sortFields) {
    return http.post('versioning/listQuery', {
        'mainEntity': entity,
        'fieldsList': fields,
        filter,
        pageSize,
        pageNo,
        sortFields,
    })
}


export function exportDevelopSql(beginVersion, endVersion) {
    return http.get('versioning/exportDevelopSql', {
        params: { beginVersion, endVersion },
    })
}

export function upgradeDevelopSql(file, config = {}) {
    return http.post('versioning/upgradeDevelopSql', file, config)
}
