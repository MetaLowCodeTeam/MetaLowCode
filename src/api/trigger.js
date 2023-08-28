/**
 * 触发器Api
 */
import http from "@/utils/request"

export default {
    detial: {
        // 字段更新-获取目标实体（所有实体）
        dataUpdateEntityList: async (entityCode) => {
            return await http.get("/trigger/dataUpdate/entityList", { entityCode });
        },
        // 字段聚合-获取目标实体（所有实体）
        aggregationEntityList: async (entityCode) => {
            return await http.get("/trigger/aggregation/entityList", { entityCode });
        },
        // 计算公式验证
        aviatorValidate: async (expression) => {
            return await http.post("/trigger/aviator/validate", { expression });
        },
        // 保存
        triggerSave: async (recordId, dataMap) => {
            return await http.post("/trigger/save?id=" + recordId, dataMap);
        },
        // 立即执行
        execute: async (params) => {
            return await http.post("/trigger/executeTrigger", params);
        },
        // 推送测试
        hookUrlTest: async (params) => {
            return await http.post("/trigger/hookUrlTest", params);
        },
    },
}
