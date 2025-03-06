import http from '@/utils/request'


// 外部数据源测试链接
export function testDbConnection(body) {
    return http.get('/plugins/metaDataWarehouse/outerData/testDbConnection', body);
}

// 查询模型字段
export function queryModelField(body) {
    return http.post('/plugins/metaDataWarehouse/outerData/queryModelField', body);
}