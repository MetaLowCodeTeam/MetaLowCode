/**
 * 开发中心-高级功能模块
 */

import http from "@/utils/request"

// 保存自定义方法
export function saveCmRecord(recordId, body) {
    return http.post('/cm/saveRecord', body, { params: { recordId } });
}
