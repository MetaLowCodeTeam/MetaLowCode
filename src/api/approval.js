
/**
 * 审批流程Api
 */
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
        },
        // 获取审批配置列表
        getApprovalList: async (recordId) => {
            return await http.get("/approval/getEntityApprovalConfigList", { recordId });
        },
        // 提交审批
        startApproval: async (entityId, approvalConfigId) => {
            return await http.get("/approval/startApproval", { entityId, approvalConfigId });
        },
        // 提交复杂工作流
        startComplexFlowApproval: async (body) => {
            return await http.post("/plugins/metaWorkFlow/workflow/startRelatedProcess", body);
        },
    },
    list: {
        // 获取实体列表
        getEntityList: async (data) => {
            return await http.get("/approval/getAllApprovalConfigEntity", data);
        },
        /**
        * 
        * 审批流程专用
        * @param {*} mainEntity 实体名称
        * @param {*} fieldsList 要显示的字段名称
        * @param {*} pageSize 默认页数大小
        * @param {*} pageNo 页数大小
        * @param {*} filter { equation="AND", items:[{  "fieldName": "flowName", "op": "LK", "value": "修改"}] }  过滤
        * @param {*} advFilter { equation="AND", items:[{  "fieldName": "flowName", "op": "LK", "value": "修改"}] }  常用查询
        * @param {*} quickFilter ""  快速查询
        * @param {*} sortFields [{   "fieldName": "entityCode","type": "desc" }] 排序
        */
        getDataList: async (entity, fields, filter, pageSize, pageNo, sortFields, advFilter, quickFilter) => {
            return http.post('approval/listQuery', {
                'mainEntity': entity,
                'fieldsList': fields,
                filter, pageSize, pageNo, sortFields, advFilter, quickFilter
            })
        }

    },
}




export function getEntityApprovalTaskList(entity, value) {
    return http.get('/approval/getEntityApprovalTaskList', { entity, type: value })
}


/**
 * 复杂工作流
 */

// 保存流程
export function saveComplexFlow(body) {
    return http.post('/plugins/metaWorkFlow/workflow/deployProcess', body)
}

// 获取流程
export function getComplexFlow(approvalConfigId) {
    return http.get('/plugins/metaWorkFlow/workflow/getBpmnXmlStr', { approvalConfigId })
}