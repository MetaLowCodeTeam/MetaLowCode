import http from '@/utils/request'

export function saveRecord(recordId, formModel) {
    return http.post('versionHistory/saveRecord', formModel, {
        params: { recordId },
    })
}

export function listQuery(entity, fields, filter, pageSize, pageNo, sortFields) {
    return http.post('versionHistory/listQuery', {
        'mainEntity': entity,
        'fieldsList': fields,
        filter,
        pageSize,
        pageNo,
        sortFields,
    })
}


export function exportDevelopSql(beginVersion, endVersion) {
    return http.get('versionHistory/exportDevelopSql', {
        params: { beginVersion, endVersion },
    })
}

export function upgradeDevelopSql(file, config = {}) {
    return http.post('versionHistory/upgradeDevelopSql', file, config)
}
