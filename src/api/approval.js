
/**
 * 审批流程Api
 */
import http from "@/utils/request"

export default {
    detail: {
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
        startApproval: async (entityId, approvalConfigId, body) => {
            return await http.post("/approval/startApproval", body, { params: { entityId, approvalConfigId } });
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

// 驳回类为3(驳回到任意节点)时需要获取所有节点
export function getRejectNodeList(approvalTaskId) {
    return http.get('/plugins/metaWorkFlow/workflow/returnList', { approvalTaskId })
}

// 获取审批历史流程配置
export function getHisActivityIns(entityId) {
    return http.get('/approval/getHisActivityIns', { entityId })
}

// 获取审批信息
export function getRecordApprovalState(recordId) {
    return http.get('/approval/recordApprovalState', { recordId })
}



// 获取审批信息
export function createApprovalSystemFields(entityName) {
    return http.post('/approval/createApprovalSystemFields?entityName=' + entityName)
}

// 修改审批人
export function updateApprovalUser(approvalTaskId, body) {
    return http.post('/approval/updateApprovalUser', body, { params: { approvalTaskId } })
}

// 获取审批历史
export function getTaskDetailsById(entityId) {
    return http.get('/approval/getTaskDetailsById', { entityId })
}


/**
 * 复杂审批流程监控
 */

// 复杂审批流程监控列表
export function queryProcessInstanceList(body) {
    return http.post('/plugins/metaWorkFlow/workflow/process/queryProcessInstanceList', body)
}

// 中止
export function workflowProcessDiscontinue(body) {
    return http.post('/plugins/metaWorkFlow/workflow/process/discontinue', body)
}
// 挂起
export function workflowProcessSuspended(body) {
    return http.post('/plugins/metaWorkFlow/workflow/process/suspended', body)
}
// 恢复
export function workflowProcessRestore(body) {
    return http.post('/plugins/metaWorkFlow/workflow/process/restore', body)
}
// 删除
export function workflowProcessDelete(body) {
    return http.post('/plugins/metaWorkFlow/workflow/process/delete', body)
}
// 撤回
export function workflowProcessWithdraw(body) {
    return http.post('/plugins/metaWorkFlow/workflow/process/withdraw', body)
}
// 获取可重置的任务
export function queryTaskByInstanceId(processInstanceId) {
    return http.get('/plugins/metaWorkFlow/workflow/process/queryTaskByInstanceId', { processInstanceId })
}

// 重置任务
export function processReset(body) {
    return http.post('/plugins/metaWorkFlow/workflow/process/reset', body)
}


export function getApprovalConfigByEntity(entityName) {
    return http.get('/approval/getApprovalConfigByEntity', { entityName })
}
