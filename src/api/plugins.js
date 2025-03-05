import http from '@/utils/request'


export function testDbConnection(body) {
    return http.get('/plugins/metaDataWarehouse/outerData/testDbConnection', body);
}
