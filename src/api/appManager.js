// 应用管理
import http from "@/utils/request"




export function listQuery(entity, fields, filter, pageSize, pageNo, sortFields) {
    return http.post('/app/listQuery', {
        'mainEntity': entity,
        'fieldsList': fields,
        filter,
        pageSize,
        pageNo,
        sortFields,
    })
}

export function saveRecord(recordId, formModel) {
    return http.post('/app/saveRecord', formModel, {
        params: { recordId },
    })
}

export function deleteRecord(recordId) {
    return http.post('/app/deleteRecord', {}, {
        params: { recordId },
    })
}

// 导出
export function exportApp(appAbbrName, password) {
    return http.post('/app/exportApp', {}, {
        params: { appAbbrName, password },
    })
}

// 安装
export function installApp(file, config = {}) {
    return http.post('/app/installApp', file, config)
}