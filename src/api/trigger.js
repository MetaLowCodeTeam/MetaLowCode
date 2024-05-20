/**
 * 触发器Api
 */
import http from "@/utils/request"

export default {
    detail: {
        // 字段更新-获取目标实体（所有实体）
        dataUpdateEntityList: async (entityCode) => {
            return await http.get("/plugins/metaTrigger/trigger/dataUpdate/entityList", { entityCode });
        },
        // 自动创建-获取目标实体（所有实体）
        dataAutoCreate: async (entityCode) => {
            return await http.get("/plugins/metaTrigger/trigger/dataAutoCreate/entityList", { entityCode });
        },
        // 字段聚合-获取目标实体（所有实体）
        aggregationEntityList: async (entityCode) => {
            return await http.get("/plugins/metaTrigger/trigger/aggregation/entityList", { entityCode });
        },
        // 计算公式验证
        aviatorValidate: async (expression) => {
            return await http.post("/plugins/metaTrigger/trigger/aviator/validate", { expression });
        },
        // 保存
        triggerSave: async (recordId, dataMap) => {
            return await http.post("/plugins/metaTrigger/trigger/save?id=" + recordId, dataMap);
        },
        // 删除
        triggerDelete: async (recordId) => {
            return await http.post("/plugins/metaTrigger/trigger/delete?recordId=" + recordId);
        },
        // 立即执行
        execute: async (params) => {
            return await http.post("/plugins/metaTrigger/trigger/executeTrigger", params);
        },
        // 推送测试
        callBackTest: async (params) => {
            return await http.post("/plugins/metaTrigger/trigger/callBackTest", params);
        },
        // 判断通知类型是否可用
        querySendState: async () => {
            return await http.get("/note/querySendState");
        },
        // 转换用户信息
        idToIdName: async (idList) => {
            return await http.post("/plugins/metaTrigger/trigger/idToIdName", idList);
        },
        // 删除记录实体
        getDataDeleteEntityList: async (entityCode) => {
            return await http.get("/plugins/metaTrigger/trigger/dataDelete/entityList", { entityCode });
        },
        // 同时分配关联记录实体
        getAssignEntityList: async (entityCode) => {
            return await http.get("/plugins/metaTrigger/trigger/assign/entityList", { entityCode });
        },
        // 获取自动撤销审批列表
        getDataRevokeEntityList: async (entityCode) => {
            return await http.get("/plugins/metaTrigger/trigger/dataRevoke/entityList", { entityCode });
        }

    },
}
