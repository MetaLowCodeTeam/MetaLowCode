export const NodeDefaultData = {
    // 服务任务
    "bpmn:serviceTask": {
        taskType: 1,
        classPath: "",
        customData: {}
    },
    // 接收任务
    "bpmn:receiveTask": {
        taskType: 1,
        classPath: "",
        customData: {}
    },
    // 开始事件
    "bpmn:startEvent": {
        type: 0,
        // 谁可以发起此审批
        nodeRoleType: 1,
        // 指定用户
        nodeRoleList: [],
        // 发起条件
        filter: {
            equation: "",
            items: [],
        },
    },
    // 线
    "bpmn:sequenceFlow": {
        // 发起条件
        filter: {
            equation: "",
            items: [],
        },
    },
    // 用户任务
    "bpmn:userTask": {
        // 审批类型(1.人工审批 2.自动驳回 3. 发起子流程)
        approvalType: 1,
        // 由审批（3.指定审批人  4. 指定部门负责人 5. 发起人部门负责人 6.数据所属部门负责人 7. 实体字段）
        nodeRoleType: 3,
        // 指定用户集合（由审批 3、4）
        nodeRoleList: [],
        // 部门层级(由审批 5、6)
        deptLevel: 0,
        // 字段名称(由审批 7)
        fieldName: "",
        // 同时允许自选
        userSelectFlag: false,
        // 允许审批人转审
        transferApproval: false,
        // 允许审批人加签
        addSignaturesApproval: false,
        // 禁止审批人驳回
        prohibitRejection: false,
        // 禁止发起人撤回
        approvalCannotBeWithdrawn: false,
        // 驳回设置  类型 （1.驳回至未提交 2.驳回至上一步审核 3.驳回至任意步骤）
        rejectType: 1,
        // 审批人为空时（1.自动通过 2.指定审批人）
        emptyUserType: 1,
        //  审批人空时，指定用户
        specificRole: [],
        // 审批方式（1.会签 2.或签 3.部分或签）
        approvalMethodType: 1,
        // 审批方式->部分会签人数
        signUserNum: 1,
        // 审批结果抄送给谁
        ccToUserList: [],
        // 可修改字段
        modifiableFields: [],
        // 前置脚本
        createScript: "",
        // 后置脚本
        completeScript: "",
        // 数据转化ID
        transformId: null,
        // 审批配置ID
        approvalConfigId: null,
        // 是否阻断流程
        isBlocked: false,
        // 选择触发器
        triggerConfigIdList: [],
        // 指定表单
        formLayoutId: null,
    },
    // 中间捕获事件
    "bpmn:intermediateCatchEvent": {
        // 信号名称
        signalName: "SignalName_",
    },
    // 边界事件
    "bpmn:boundaryEvent": {
        // 边界事件类型
        boundaryType: "",
        // 时间边界事件类型
        timedType: 1,
        // 时间边界事件循环类型
        timeCycleType: 1,
        // 时间边界事件-cron表达式值
        timeCycle: "",
        // 时间边界事件-标准格式
        timeDuration: "",
        // 时间边界事件-日期时间
        timeDate: "",
    },
}

// 排除的节点
export const EliminateNode = [
    "bpmn:parallelGateway",
    "bpmn:endEvent",
    "bpmn:exclusiveGateway",
    "bpmn:inclusiveGateway",
    "bpmn:subProcess",
];

// 节点触发事件
export const NodeTypeFn = {
    "bpmn:startEvent": "getNodeModelById",
    "bpmn:sequenceFlow": "getEdgeModelById",
    "bpmn:userTask": "getNodeModelById",
    "bpmn:serviceTask": "getNodeModelById",
    "bpmn:receiveTask": "getNodeModelById",
    "bpmn:intermediateCatchEvent": "getNodeModelById",
    "bpmn:subProcess": "getNodeModelById",
    "bpmn:boundaryEvent": "getNodeModelById",
};

// 默认节点颜色
export const DefaultNodeColor = {
    "bpmn:intermediateCatchEvent": "#707070",
    "bpmn:boundaryEvent": "#ff8142"
}