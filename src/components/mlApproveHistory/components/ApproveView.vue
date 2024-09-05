<template>
	<div
		class="complex-flow"
		v-loading="loadingConf.loading"
		:element-loading-text="loadingConf.loadingText"
	>
		<MetaFlowDesigner
			ref="MetaFlowDesignerRef"
			:graphData="graphData"
			look
		/>
	</div>
</template>

<script setup>
import "@/../lib/flow-designer/style.css";
import { nextTick, onMounted, reactive, ref } from "vue";
const props = defineProps({
	entityId: { type: String, default: "" },
});
/**
 * API
 */
import { getHisActivityIns } from "@/api/approval.js";

let loadingConf = reactive({
	loading: false,
	loadingText: "流程加载中...",
});

// 流程图数据
let graphData = ref("");

onMounted(() => {
	// 加载流程事件
	loadFlowDesignerFn();
});

// 节点触发事件
// const NodeTypeFn = {
// 	"bpmn:startEvent": "getNodeModelById",
// 	"bpmn:sequenceFlow": "getEdgeModelById",
// 	"bpmn:userTask": "getNodeModelById",
// };
let MetaFlowDesignerRef = ref();
const loadFlowDesignerFn = async () => {
	loadingConf.loading = true;
	let res = await getHisActivityIns(props.entityId);
	if (res) {
		graphData.value = res.data.bpmnXmlStr;
		nextTick(() => {
			// // 获取流程配置
			let lf = MetaFlowDesignerRef.value?.lf || {};
			let mflData = MetaFlowDesignerRef.value.getJsonData();
            // 所有节点ID
            let allNodeId = [];
            mflData.edges.forEach(el => {
                setProperties(lf, 'sequenceFlow', el.id, {
					stroke: "#999",
				},false);
                allNodeId.push(el.id)
            })
            mflData.nodes.forEach(el => {
                allNodeId.push(el.id)
            })
            const { editConfigModel } = lf.graphModel;
			editConfigModel.updateEditConfig({
				isSilentMode: true,
			});
			// 获取要渲染的数据
			let hisActivityInsList = res.data.hisActivityInsList || [];
			// 遍历要渲染的数据
			hisActivityInsList.forEach((el) => {
				// 不是开始、结束节点
                if(el.activityType !== 'startEvent' && el.activityType !== 'endEvent'){
                    let properties = {
                        stroke: "green",
                    };
                    if(el.activityState == 'reject'){
                        properties.stroke = "#F56C6C";
                    }
                    setProperties(lf, el.activityType, el.activityId, properties, true);
                }
			});
		});
	}
	loadingConf.loading = false;
	
};

// 获取节点类型对应的ID函数
const getByIdFunc = (type) => {
	// 线
	if (type == "sequenceFlow") {
		return "getEdgeModelById";
	}
	// 节点
	else {
		return "getNodeModelById";
	}
};

/**
 * 设置节点自定义属性
 * @param {*} type   节点类型
 * @param {*} id     节点ID
 * @param {*} properties 节点自定义属性
 */
const setProperties = (lf, type, id, properties, isAnimatio) => {
    if(lf[getByIdFunc(type)](id)){
        lf[getByIdFunc(type)](id).setProperties(properties);
    }
	// 如果是线
	if (type == "sequenceFlow" && isAnimatio) {
		lf.openEdgeAnimation(id);
	}
};

// 获取节点属性
const getProperties = (jsonStr) => {
	return JSON.parse(decodeURIComponent(jsonStr));
};
</script>
<style lang="scss" scoped>
.complex-flow {
	height: 100%;
}
</style>
