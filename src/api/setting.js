/**
 * 通用配置
 */

import http from "@/utils/request"

// 获取通用配置信息
export function getSettingInfo() {
    return http.get('/setting/info')
}

// 修改接口
export function updateSysSetting(body) {
    return http.post('/setting/updateSysSetting', body)
}




export function getPublicSetting() {
    return http.get('/setting/queryPublicSetting')
}