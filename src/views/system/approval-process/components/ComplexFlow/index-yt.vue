<template>
    <!--  -->
    <!--  -->
    <div 
        v-if="!publicSetting.pluginIdList.includes('metaWorkFlow')"
        class="not-plugin"
    >
        复杂流程监控 插件未安装！
    </div>
    <div class="complex-flow-box" v-loading="loading" v-else>
        <div class="complex-flow">
            <MetaFlowDesigner
                ref="MetaFlowDesignerRef"
                @nodeClick="openDrawer"
                @edgeClick="openDrawer"
                @nodeDelete="nodeDelete"
                @edgeDelete="nodeDelete"
                :graphData="graphData"
                :patternConfig="patternConfig"
                :sequenceFlowConfig="sequenceFlowConfig"
                isCustomFlow
                @onSave="onSave"
                @clearData="clearData"
                :look="isLookPage || !$TOOL.checkRole('r6016')"
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
                <span class="close-icon" @click="drawer = false" v-if="!drawerIsEditTitle">
                    <el-icon>
                        <ElIconClose />
                    </el-icon>
                </span>
            </div>
            <div class="drawer-body">
                <user-task-custom  ref="UserTaskCustomRef"
                    v-if="drawerData.type == 'bpmn:userTask'"
                    :formData="drawerData.formData"
                    :processDetail="processDetail"
                    @setNodeData="setNodeData"
                    @changeProcessDetail="changeProcessDetail"
                    :selectProcessDetail="selectProcessDetail"
                />
            </div>
        </div>
    </div>
</template>

<script setup>
import "@/../lib/flow-designer/style.css";
import { ElMessage } from "element-plus";
import { inject, nextTick, onMounted, ref } from "vue";

import useCommonStore from "@/store/modules/common";

import { storeToRefs } from "pinia";

import UserTaskCustom from "./UserTask-Custom.vue";

// API
import { queryById, saveRecord } from "@/api/crud";

import { useRouter } from "vue-router";

// 节点默认配置
import { 
    // 排除的节点
    EliminateNode,
    // 节点触发事件
    NodeTypeFn,
} from "./nodeDefaultConfig";

const { publicSetting } = storeToRefs(useCommonStore());

const $TOOL = inject("$TOOL");

let patternConfig = ref({
    start: false,
    user: false,
    gateway: false,
    event: false,
    subProcess: false,
    boundaryEvent: false,
    end: false,
    customNode: true,
});

let sequenceFlowConfig = ref({
    stroke: "#000000",
});

let customNodeDefaultData = ref({});

const Router = useRouter();

// 是否是查看页面
let isLookPage = ref(false);

let recordId = ref("");
let graphData = ref("");
let loading = ref(false);

// 绑定明细数组
let processDetail = ref([]);

let recordData = ref({});

onMounted(() => {
    recordId.value = Router.currentRoute.value.query.recordId;
    // 如果是查看页面
    let look = Router.currentRoute.value.query.look;
    if (look == 1) {
        isLookPage.value = true;
    }
    // 加载流程数据
    loadComplexFlow();
});

// 该实体所有表单
const loadComplexFlow = async () => { 
    loading.value = true;
    let res = await queryById(recordId.value);
    if (res && res.code == 200) {
        let recordFlowChart = res.data.recordFlowChart;
        recordData.value = res.data;
        processDetail.value = res.data.ProcessDetail || [];
        if(recordFlowChart) {
            recordFlowChart = JSON.parse(recordFlowChart);
            graphData.value = recordFlowChart.logicFlowXml;
        }else {
            graphData.value = {};
        }
    }
    loading.value = false;
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

// 节点删除
const nodeDelete = () => {
    drawer.value = false;
    drawerData.value = {};
};

// 获取所有节点的selectProcessDetail数据
let selectProcessDetail = ref([]);
const getSelectProcessDetail = () => {
    selectProcessDetail.value = [];
    MetaFlowDesignerRef.value.getJsonData().nodes.forEach(el => {
        if(el.properties?.flowJson) {
            let flowJson = getProperties(el.properties.flowJson);
            if(flowJson.processDetail) {
                selectProcessDetail.value.push(flowJson.processDetail);
            }
        }
    });
    console.log(selectProcessDetail.value,'selectProcessDetail.value')
}

// 节点点击
const openDrawer = (data) => {
    // 如果是网关、结束节点。不做任何处理
    if (EliminateNode.includes(data.type)) {
        return;
    }
    drawer.value = true;
    drawerData.value = data;
    drawerTitle.value = data.text?.value;
    drawerData.value.formData = {};
    if (data.properties?.flowJson) {
        drawerData.value.formData = getProperties(data.properties.flowJson);
    } else {
        drawerData.value.formData = initNodeFlowJson(data);
    }
    // 获取所有节点的selectProcessDetail数据
    getSelectProcessDetail();
};

const initNodeFlowJson = (data) => {
    let newData = cloneDeep(customNodeDefaultData.value);
    return newData;
}


// 获取节点属性
const getProperties = (jsonStr) => {
    return JSON.parse(decodeURIComponent(jsonStr));
};

// 设置节点数据
let setNodeData = (data) => {
    let { type, id, formData} = drawerData.value;
    setProperties(type, id, data, data.properties);
};

// 设置节点自定义属性
const setProperties = (type, id, data, config) => {
    MetaFlowDesignerRef.value.lf[NodeTypeFn[type]](id).setProperties({
        flowJson: encodeURIComponent(JSON.stringify(data)),
        ...config,
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
    if (!$TOOL.checkRole("r6016")) {
        ElMessage.error("暂无操作权限");
        return;
    }
    let mflData = MetaFlowDesignerRef.value.getJsonData();
    let { nodes, edges } = mflData;
    // 把非结束节点的数据筛选出来
    let newNodes = nodes.filter(
        (el) => !EliminateNode.includes(el.type)
    );
    // 遍历节点
    for (let index = 0; index < newNodes.length; index++) {
        const el = newNodes[index];
        let properties;
        if (!el.properties.flowJson) {
            let newData = initNodeFlowJson(el);
            setProperties(el.type, el.id, newData);
            properties = newData;
        } else {
            properties = getProperties(el.properties.flowJson);
        }
        if(el.text && el.text.value) {
            if(!isNaN(el.text.value)){
                ElMessage.error("节点名称不能为纯数字");
                setNodeBorderColor(el.type, el.id, "red");
                return
            }
            // el.text.value 加个正则，不能包含 < > & ' "
            let reg = /[<>&'"]/g;
            if(reg.test(el.text.value)){
                ElMessage.error("节点名称不能包含：“<”、“>”、“&”、“'”、“\"”");
                setNodeBorderColor(el.type, el.id, "red");
                return
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
        if (!EliminateNode.includes(el.type)) {
            flowJson[el.id] = el.properties.flowJson;
        }
    });
    let logicFlowXml = MetaFlowDesignerRef.value.getXmlData() || '';
    logicFlowXml = logicFlowXml.replace('<dc:Bounds x="null"','<dc:Bounds x="365"');
    logicFlowXml = logicFlowXml.replace('width="null" height="14"','width="50" height="14"');
    let param = {
        recordId: recordId.value,
        recordFlowChart: JSON.stringify({
            logicFlowXml,
            flowJson,
        }),
        // sourceFlowData: 
    };
    // return
    loading.value = true;
    let res = await saveRecord("ProcessRoute", param.recordId, param);
    if (res && res.code == 200) {
        ElMessage.success("保存成功");
    }
    loading.value = false;
};

// 设置节点变颜色
const setNodeBorderColor = (type, id, stroke) => {
    let properties = {};
    // 中间事件节点
    if(type == "bpmn:intermediateCatchEvent") {
        properties = { 
            rectNodeNodeStyle: {
                fill: stroke,
            }
        }
    }else {
        if(type == "bpmn:sequenceFlow") {
            properties = {
                stroke: stroke
            }
        }else {
            properties = {
                rectNodeNodeStyle: {
                    stroke
                }
            }
        }
     
    }
    MetaFlowDesignerRef.value.lf[NodeTypeFn[type]](id).setProperties(properties);
};

// 重置
const clearData = () => {
    drawer.value = false;
    drawerData.value = {};
};

const cloneDeep = (data) => {
    return JSON.parse(JSON.stringify(data));
};

const changeProcessDetail = (data) => {
    drawerTitle.value = data.processname;
    MetaFlowDesignerRef.value.lf.updateText(
        drawerData.value.id,
        data.processname
    );
    nextTick(() => {
        getSelectProcessDetail();
    })
};
</script>
<style lang='scss' scoped>
.complex-flow-box {
    width: 100%;
    height: 100%;
    display: flex;
    position: relative;
    .z-model {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background: rgba($color: #000000, $alpha: 0.3);
        z-index: 7;
    }
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
        // border-bottom: 1px solid #dcdfe6;
        padding: 0 20px;
        height: 46px;
        line-height: 46px;
        position: relative;
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
        .close-icon {
            position: absolute;
            right: 15px;
            top: 2px;
            font-size: 16px;
            cursor: pointer;
        }
    }
    .drawer-body {
        box-sizing: border-box;
        height: calc(100% - 48px);
        overflow-x: hidden;
        overflow-y: auto;
        .border-container {
            border-top: 1px solid #dcdfe6;
            padding: 10px 15px;
        }
        :deep(.el-collapse-item__header){
            padding: 0 15px;
        }
        :deep(.el-collapse-item__content){
            padding: 0 15px;
            padding-bottom: 15px;
        }
    }
}
:deep(.item-imitate-open) {
    background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAYAAAByDd+UAAAAAXNSR0IArs4c6QAAAVlJREFUSEvtVVFOg0AUnFd7EHsS2w+aeArLLcCfyo9wC7yFSTEpnkTu0dbRt2U3mBSBFasf3YSEBPbNe7Mzs4IzLzkzHi6AozP+vyiNnnntM2J2K1Xbvi8TGoAp7gSY4/gMX4QD4wQldkiaDTjAqOBcgO1wBABERcETgNcskNIxo80TK/2WBZJobQP4IzCgTANZtDWq4HKFLQWhNmMA4w3fIPA6rzSQTuFZ0HQpM4kKrj93PPhQKUT4uBSlsnNFL8yVetEX5blzx4kfuMfsO0U2t9THtpbfptOCWlr9AYlKz2QIM3FBSlxQreDluT6CsQ3db7h6n+DmD0RT+8TLFmr4AxZdwjGCIXJjizGMzz3CNlAjlilyAokzvgMlcu9JG9Fm6tlcPkabSRkXbU3pjhLemlp1vtoMtRitseR7NWnh3tfTEE/5/tsZvL6Fe13AYxc/Ve8y4egsfwB9kKSGcDSb6QAAAABJRU5ErkJggg==) center center no-repeat !important;
}
</style>