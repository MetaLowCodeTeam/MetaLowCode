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

// 外部数据源测试链接
export function testDbConnection(body) {
    return http.get('/plugins/metaDataWarehouse/outerData/testDbConnection', body);
}

// 查询模型字段
export function queryModelField(body) {
    return http.post('/plugins/metaDataWarehouse/outerData/queryModelField', body);
}


// 查询模型数据
export function queryModelById(body) {
    return http.get('/plugins/metaDataWarehouse/outerData/queryModelById', body);
}

// 查询模型列表数据
export function getOuterDataByDataModel(params, body) {
    return http.post('/plugins/metaDataWarehouse/outerData/getOuterDataByDataModel', body, { params });
}

