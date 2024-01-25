<template>
    <!--  -->
    <!--  -->
    <div class="complex-flow-box">
        <div class="complex-flow">
            <MetaFlowDesigner
                ref="MetaFlowDesignerRef"
                @nodeClick="openDrawer"
                @edgeClick="openDrawer"
                @nodeDelete="nodeDelete"
                @edgeDelete="nodeDelete"
                :graphData="graphData"
                @onSave="onSave"
                @clearData="clearData"
            />
        </div>
        <div
            class="complex-drawer"
            v-if="drawer"
            :class="[drawerData.type == 'bpmn:sequenceFlow' ? 'bg-drawer' : 'sm-drawer']"
        >
            <div class="drawer-header">
                <h4 v-if="!drawerIsEditTitle">
                    <span class="title">{{ drawerTitle }}</span>
                    <span class="edit-icon" @click="changeDrawerTitle">
                        <el-icon>
                            <ElIconEdit />
                        </el-icon>
                    </span>
                </h4>
                <el-input
                    v-else
                    ref="EditTitleInputRef"
                    v-model="drawerTitle"
                    clearable
                    @keyup.enter="confirmTitle"
                    @blur="confirmTitle"
                ></el-input>
            </div>
            <div class="drawer-body">
                <StartEvent
                    ref="StartEventRef"
                    v-if="drawerData.type == 'bpmn:startEvent'"
                    :formData="drawerData.formData"
                />
                <SequenceFlow
                    ref="SequenceFlowRef"
                    v-if="drawerData.type == 'bpmn:sequenceFlow'"
                    :formData="drawerData.formData"
                />
                <UserTask
                    ref="UserTaskRef"
                    v-if="drawerData.type == 'bpmn:userTask'"
                    :formData="drawerData.formData"
                />
            </div>
        </div>
    </div>
</template>

<script setup>
import "@/../lib/flow-designer/style.css";
import { ElMessage } from "element-plus";
import { nextTick, onMounted, reactive, ref } from "vue";
// 开始节点
import StartEvent from "./StartEvent.vue";
// 线节点
import SequenceFlow from "./SequenceFlow.vue";
// 用户任务节点
import UserTask from "./UserTask.vue";

// 公用方法
import { checkConditionList } from "@/utils/util";

// API
import { saveComplexFlow, getComplexFlow } from "@/api/approval";

import { useRouter } from "vue-router";

const Router = useRouter();

let approvalConfigId = ref("");
let graphData = ref("");

onMounted(() => {
    approvalConfigId.value = Router.currentRoute.value.query.approvalConfigId;
    // 加载流程数据
    loadComplexFlow();
});

const loadComplexFlow = async () => {
    //graphData.value = localStorage.getItem("TestXml");
    //return
    let res = await getComplexFlow(approvalConfigId.value);
    console.log(res, "res");
    if (res && res.code == 200) {
        graphData.value = res.data;
    }
};

// FL组件
let MetaFlowDesignerRef = ref("");
// 标题
let drawerTitle = ref("");
// 是否编辑
let drawerIsEditTitle = ref(false);
// 数据
let drawerData = ref({});
// 模态框
let drawer = ref(false);

// 各节点默认数据
let nodeDefaultData = reactive({
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
    "bpmn:sequenceFlow": {
        // 发起条件
        filter: {
            equation: "",
            items: [],
        },
    },
    "bpmn:userTask": {
        // 审批类型(1.人工审批 2.自动驳回)
        approvalType: 1,
        // 由审批（3.指定审批人  4. 指定部门负责人 5. 发起人部门负责人 6.数据所属部门负责人 7. 实体字段）
        nodeRoleType: 3,
        // 指定用户集合（由审批 3、4）
        nodeRoleList: [],
        // 部门层级(由审批 5、6)
        deptLevel: 0,
        // 字段名称(由审批 7)
        fieldName:"",
        // 同时允许自选
        userSelectFlag: false,
        // 允许审批人转审
        transferApproval: false,
        // 允许审批人加签
        addSignaturesApproval: false,
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
    },
});

// 节点触发事件
const NodeTypeFn = {
    "bpmn:startEvent": "getNodeModelById",
    "bpmn:sequenceFlow": "getEdgeModelById",
    "bpmn:userTask": "getNodeModelById",
};

// 节点删除
const nodeDelete = () => {
    drawer.value = false;
    drawerData.value = {};
};
// 节点点击
const openDrawer = (data) => {
    // 如果是网关、结束节点。不做任何处理
    if (data.type == "bpmn:parallelGateway" || data.type == "bpmn:endEvent") {
        return;
    }
    drawer.value = true;
    setNodeData();
    drawerData.value = data;
    drawerTitle.value = data.text?.value;
    drawerData.value.formData = {};
    if (data.properties?.flowJson) {
        drawerData.value.formData = getProperties(data.properties.flowJson);
    } else {
        drawerData.value.formData = cloneDeep(nodeDefaultData[data.type]);
    }
};

// 开始节点
let StartEventRef = ref("");
// 线节点
let SequenceFlowRef = ref("");
// 用户任务节点
let UserTaskRef = ref("");

// 获取节点属性
const getProperties = (jsonStr) => {
    return JSON.parse(decodeURIComponent(jsonStr));
};

// 设置节点数据
let setNodeData = () => {
    // 判断是否存在数据，如果存在源数据
    if (!drawerData.value.type) {
        return;
    }
    console.log("存在源数据");
    let { type, id } = drawerData.value;
    let setPropertiesData = {};
    if (type == "bpmn:startEvent") {
        setPropertiesData = StartEventRef.value.getFormData();
    } else if (type == "bpmn:sequenceFlow") {
        setPropertiesData = SequenceFlowRef.value.getFormData();
    } else {
        setPropertiesData = UserTaskRef.value.getFormData();
    }

    setProperties(type, id, setPropertiesData);
    setNodeBorderColor(type, id, "");
};

// 设置节点自定义属性
const setProperties = (type, id, data) => {
    MetaFlowDesignerRef.value.lf[NodeTypeFn[type]](id).setProperties({
        flowJson: encodeURIComponent(JSON.stringify(data)),
    });
};

let EditTitleInputRef = ref("");
// 点击编辑修改title
const changeDrawerTitle = () => {
    drawerIsEditTitle.value = true;
    nextTick(() => {
        EditTitleInputRef.value.focus();
    });
};

// 确认编辑title
const confirmTitle = () => {
    MetaFlowDesignerRef.value.lf.updateText(
        drawerData.value.id,
        drawerTitle.value
    );
    drawerIsEditTitle.value = false;
};

// 保存
const onSave = async () => {
    setNodeData();
    let mflData = MetaFlowDesignerRef.value.getJsonData();

    let { nodes, edges } = mflData;
    // 把非结束节点的数据筛选出来
    let newNodes = nodes.filter(
        (el) => el.type != "bpmn:endEvent" && el.type != "bpmn:parallelGateway"
    );
    // 遍历节点
    for (let index = 0; index < newNodes.length; index++) {
        const el = newNodes[index];
        let properties;
        if (!el.properties.flowJson) {
            setProperties(el.type, el.id, nodeDefaultData[el.type]);
            properties = { ...nodeDefaultData[el.type] };
        } else {
            properties = getProperties(el.properties.flowJson);
        }
        // 如果是开始节点
        if (el.type == "bpmn:startEvent") {
            let { nodeRoleType, nodeRoleList } = properties;
            if (nodeRoleType == 3 && nodeRoleList.length < 1) {
                ElMessage.error("开始节点：请选择指定用户");
                setNodeBorderColor(el.type, el.id, "red");
                return;
            }
        }
        // 如果是用户审批节点
        if (el.type == "bpmn:userTask") {
            if(!el.text){
                ElMessage.error("用户节点：请填写节点名称");
                setNodeBorderColor(el.type, el.id, "red");
                return;
            }
        }
    }
    // 遍历线
    for (let index = 0; index < edges.length; index++) {
        const el = edges[index];
        let properties;
        if (!el.properties.flowJson) {
            setProperties(el.type, el.id, nodeDefaultData[el.type]);
            properties = { ...nodeDefaultData[el.type] };
        } else {
            properties = getProperties(el.properties.flowJson);
        }
        if (properties?.filter) {
            if (!checkConditionList(properties.filter.items)) {
                ElMessage.error("节点配置有误，请检查后重新配置");
                setNodeBorderColor(el.type, el.id, "red");
                return;
            }
        }
    }

    // 开始保存
    let flowJson = {};
    let formatEdges = MetaFlowDesignerRef.value.getJsonData().edges;
    let formatNodes = MetaFlowDesignerRef.value.getJsonData().nodes;
    formatEdges.forEach((el) => {
        flowJson[el.id] = el.properties.flowJson;
    });
    formatNodes.forEach((el) => {
        if (el.type != "bpmn:endEvent" && el.type != "bpmn:parallelGateway") {
            flowJson[el.id] = el.properties.flowJson;
        }
    });
    let param = {
        approvalConfigId: approvalConfigId.value,
        logicFlow: {
            logicFlowXml: MetaFlowDesignerRef.value.getXmlData(),
            flowJson,
        },
    };
    let res = await saveComplexFlow(param);
    if(res && res.code == 200){
        ElMessage.success("保存成功")
    }
};

// 设置节点变颜色
const setNodeBorderColor = (type, id, stroke) => {
    MetaFlowDesignerRef.value.lf[NodeTypeFn[type]](id).setProperties({
        stroke,
    });
};

// 重置
const clearData = () => {
    drawer.value = false;
    drawerData.value = {};
};

const cloneDeep = (data)=>{
    return JSON.parse(JSON.stringify(data));
}
</script>
<style lang='scss' scoped>
.complex-flow-box {
    width: 100%;
    height: 100%;
    display: flex;
}
.complex-flow {
    height: 100%;
    width: 100%;
}
.complex-drawer {
    &.bg-drawer {
        width: 800px;
    }
    &.sm-drawer {
        width: 480px;
    }
    background: #fff;
    height: 100%;
    box-sizing: border-box;
    // padding: 10px 0;
    border-left: 1px solid #eeeeee;
    box-shadow: -4px 1px 8px rgba(0, 0, 0, 0.08);
    position: relative;
    z-index: 1;
    .drawer-header {
        border-bottom: 1px solid #dcdfe6;
        padding: 0 20px;
        height: 46px;
        line-height: 46px;
        .title {
            font-size: 18px;
            margin-right: 5px;
            color: #606266;
        }
        .edit-icon {
            cursor: pointer;
            position: relative;
            top: 1px;
            font-size: 14px;
            &:hover {
                color: #333;
            }
        }
    }
    .drawer-body {
        box-sizing: border-box;
        padding: 20px 15px;
        height: calc(100% - 48px);
        overflow-x: hidden;
        overflow-y: auto;
    }
}
</style>