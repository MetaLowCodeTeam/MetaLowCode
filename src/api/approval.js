
import http from "@/utils/request"

export default {
    detial: {
        // 获取审批流程
        get: async (data) => {
            return await http.get("/approval/getFlowDefinitionByConfigId", data);
        },
        // 保存审批流程
        save: async (data) => {
            return await http.post("/approval/saveLastApprovalFlow", data);
        }
    },
}
