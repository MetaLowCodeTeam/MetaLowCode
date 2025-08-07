/**
 * 开发中心-高级功能模块
 */

import http from "@/utils/request"

// 保存自定义方法
export function saveCmRecord(recordId, body) {
    return http.post('/cm/saveRecord', body, { params: { recordId } });
}

// 删除自定义方法
export function deleteCmRecord(recordId) {
    return http.post('/cm/deleteRecord', null, { params: { recordId } });
}

// 获取自定义方法
export function queryCustomListQuery() {
    return http.get('/cm/queryCustomListQuery');
}
