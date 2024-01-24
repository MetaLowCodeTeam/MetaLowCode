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
import { saveComplexFlow } from "@/api/approval";
import { useRouter } from "vue-router";

const Router = useRouter();

let approvalConfigId = ref("");

onMounted(() => {
    approvalConfigId.value = Router.currentRoute.value.query.approvalConfigId;
});

let graphData =
    ref(`<bpmn:definitions id="Definitions" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" targetNamespace="http://logic-flow.org" exporter="logicflow" exporterVersion="1.2.10">	
  <bpmn:process isExecutable="true" id="Process">	
      <bpmn:startEvent id="Event_iAV14iS" name="开始" flowJson="%7B%22type%22%3A0%2C%22nodeRoleType%22%3A1%2C%22nodeRoleList%22%3A%5B%5D%2C%22filter%22%3A%7B%22equation%22%3A%22%22%2C%22items%22%3A%5B%5D%7D%7D">	
          <bpmn:outgoing>Flow_9t0kH4C</bpmn:outgoing>	
      </bpmn:startEvent>	
      <bpmn:userTask id="Activity_3fNkRr2" flowJson="%7B%22approvalType%22%3A1%2C%22nodeRoleType%22%3A1%2C%22nodeRoleList%22%3A%5B%5D%2C%22deptLevel%22%3A0%2C%22userSelectFlag%22%3Afalse%2C%22transferApproval%22%3Afalse%2C%22addSignaturesApproval%22%3Afalse%2C%22rejectType%22%3A1%2C%22emptyUserType%22%3A1%2C%22specificRole%22%3A%5B%5D%2C%22approvalMethodType%22%3A1%2C%22signUserNum%22%3A1%2C%22ccToUserList%22%3A%5B%5D%2C%22modifiableFields%22%3A%5B%5D%7D">	
          <bpmn:incoming>Flow_9t0kH4C</bpmn:incoming>	
          <bpmn:outgoing>Flow_HBojSbK</bpmn:outgoing>	
      </bpmn:userTask>	
      <bpmn:parallelGateway id="Gateway_6kIIcJR">	
          <bpmn:incoming>Flow_HBojSbK</bpmn:incoming>	
          <bpmn:outgoing>Flow_OYyy2wO</bpmn:outgoing>	
      </bpmn:parallelGateway>	
      <bpmn:endEvent id="Event_WuPdmCs" name="结束">	
          <bpmn:incoming>Flow_OYyy2wO</bpmn:incoming>	
      </bpmn:endEvent>	
      <bpmn:sequenceFlow id="Flow_9t0kH4C" sourceRef="Event_iAV14iS" targetRef="Activity_3fNkRr2" flowJson="%7B%22filter%22%3A%7B%22equation%22%3A%22OR%22%2C%22items%22%3A%5B%5D%2C%22type%22%3A1%7D%7D" />	
      <bpmn:sequenceFlow id="Flow_HBojSbK" sourceRef="Activity_3fNkRr2" targetRef="Gateway_6kIIcJR" flowJson="%7B%22filter%22%3A%7B%22equation%22%3A%22OR%22%2C%22items%22%3A%5B%5D%2C%22type%22%3A1%7D%7D" />	
      <bpmn:sequenceFlow id="Flow_OYyy2wO" sourceRef="Gateway_6kIIcJR" targetRef="Event_WuPdmCs" flowJson="%7B%22filter%22%3A%7B%22equation%22%3A%22OR%22%2C%22items%22%3A%5B%5D%2C%22type%22%3A1%7D%7D" />	
  </bpmn:process>	
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">	
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process">	
        <bpmndi:BPMNEdge id="Flow_9t0kH4C_di" bpmnElement="Flow_9t0kH4C">	
            <di:waypoint x="285" y="180" />	
            <di:waypoint x="380" y="180" />	
        </bpmndi:BPMNEdge>	
        <bpmndi:BPMNEdge id="Flow_HBojSbK_di" bpmnElement="Flow_HBojSbK">	
            <di:waypoint x="580" y="180" />	
            <di:waypoint x="695" y="180" />	
        </bpmndi:BPMNEdge>	
        <bpmndi:BPMNEdge id="Flow_OYyy2wO_di" bpmnElement="Flow_OYyy2wO">	
            <di:waypoint x="745" y="180" />	
            <di:waypoint x="815" y="180" />	
        </bpmndi:BPMNEdge>	
        <bpmndi:BPMNShape id="Event_iAV14iS_di" bpmnElement="Event_iAV14iS">	
          <dc:Bounds x="240" y="160" width="40" height="40" />	
          <bpmndi:BPMNLabel>	
            <dc:Bounds x="250" y="173" width="20" height="14" />	
          </bpmndi:BPMNLabel>	
        </bpmndi:BPMNShape>	
        <bpmndi:BPMNShape id="Activity_3fNkRr2_di" bpmnElement="Activity_3fNkRr2">	
          <dc:Bounds x="430" y="140" width="100" height="80" />	
        </bpmndi:BPMNShape>	
        <bpmndi:BPMNShape id="Gateway_6kIIcJR_di" bpmnElement="Gateway_6kIIcJR">	
          <dc:Bounds x="670" y="140" width="100" height="80" />	
        </bpmndi:BPMNShape>	
        <bpmndi:BPMNShape id="Event_WuPdmCs_di" bpmnElement="Event_WuPdmCs">	
          <dc:Bounds x="820" y="160" width="40" height="40" />	
          <bpmndi:BPMNLabel>	
            <dc:Bounds x="830" y="173" width="20" height="14" />	
          </bpmndi:BPMNLabel>	
        </bpmndi:BPMNShape>	
    </bpmndi:BPMNPlane>	
  </bpmndi:BPMNDiagram>	
</bpmn:definitions>`);

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
        drawerData.value.formData = nodeDefaultData[data.type];
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
    console.log(type, "type");
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

    let param = {
        approvalConfigId: approvalConfigId.value,
        bpmnXml: MetaFlowDesignerRef.value.getXmlData(),
    };
    let res = await saveComplexFlow(param);
    console.log(res);
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