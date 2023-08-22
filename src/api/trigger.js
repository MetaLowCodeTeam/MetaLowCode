/**
 * 触发器Api
 */
import http from "@/utils/request"

export default {
    detial: {
        // 字段更新-获取实体列表
        dataUpdateEntityList: async (entityCode) => {
            return await http.get("/trigger/dataUpdate/entityList", { entityCode });
        },
        // 计算公式验证
        aviatorValidate: async (expression) => {
            return await http.get("/trigger/aviator/validate", { expression });
        }

    },
}
