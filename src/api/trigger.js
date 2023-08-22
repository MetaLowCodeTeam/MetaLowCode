/**
 * 触发器Api
 */
import http from "@/utils/request"

export default {
    detial: {
        // 字段更新-获取实体列表
        dataUpdateEntityList: async (entityCode) => {
            return await http.get("/trigger/dataUpdate/entityList",{entityCode});
        },
    },
}
