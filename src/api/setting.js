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


export function registerLicenseApi(body) {
    return http.post('/setting/registerLicense', body)
}

// 

/**
 * 钉钉集成
 */
// -- 同步钉钉组织架构
export function getDingtalkSyncUser(defaultRole) {
    return http.get('/organizationSync/dingtalkSyncUser', { defaultRole })
}

// -- 异步任务状态
export function getHeavyTask(taskId) {
    return http.get('/heavyTask/taskState?taskId=' + taskId);
}
