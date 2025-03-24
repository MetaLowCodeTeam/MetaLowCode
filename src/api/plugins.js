import http from "@/utils/request"


export function saveTenantRecord(entity, recordId, formModel) {
    return http.post('/plugins/metaTenant/tenant/saveRecord', formModel, {
        params: { entity, recordId },
    })
}

export function deleteTenantRecord(recordId) {
    return http.post('/plugins/metaTenant/tenant/deleteRecord', recordId)
}

