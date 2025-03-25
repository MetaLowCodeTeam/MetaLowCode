import http from "@/utils/request"

// 保存租户
export function saveTenantRecord(entity, recordId, formModel) {
    return http.post('/plugins/metaTenant/tenant/saveRecord', formModel, {
        params: { entity, recordId },
    })
}
    
// 删除租户
export function deleteTenantRecord(recordId) {
    return http.post('/plugins/metaTenant/tenant/deleteRecord', null, {
        params: { recordId }
    })
}

// 初始化租户数据库
export function initializationDatabase(recordId) {
    return http.post('/plugins/metaTenant/tenant/initialization', null, {
        params: { recordId }
    })
}