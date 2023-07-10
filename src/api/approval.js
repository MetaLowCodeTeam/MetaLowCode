
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
    list: {
        // 获取实体列表
        getEntityList: async (data) => {
            return await http.get("/approval/getAllApprovalConfigEntity", data);
        },
        // 获取流程列表
        getApprovalList: async (data) => {
            return await http.post("/approval/getAllApprovalConfig", data);
        }
    },
}
