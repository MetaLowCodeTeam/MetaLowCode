<template>
	<!--  -->
	<div
		class="reference-search-main"
		v-loading="loading"
		element-loading-text="数据加载中..."
	>
		<el-input
			v-model="filterText"
			placeholder="筛选关键字"
			class="mt-10 mb-10"
			clearable
		/>
		<el-scrollbar max-height="500px">
			<el-tree
				ref="customDTreeRef"
				class="w-100"
				:data="treeData"
				:props="defaultProps"
				@node-click="handleNodeClick"
				highlight-current
				:default-expanded-keys="firstLevelKeys"
				node-key="id"
				:filter-node-method="filterNode"
				:default-checked-keys="defaultCheckedKeys"
				:show-checkbox="showCheckbox"
				:accordion="accordion"
				@check="handleCheckChange"
				:expand-on-click-node="false"
				:check-strictly="checkStrictly"
				lazy
				:load="loadNode"
			/>
		</el-scrollbar>
	</div>
</template>

<script setup>
import { ref, watch } from "vue";
import { ElMessage, ElLoading, ElMessageBox } from "element-plus";
import http from "@/utils/request";
import { useRouter } from "vue-router";
const Router = useRouter();
const props = defineProps({
	defaultCheckedKeys: {
		type: Object,
		data: () => [],
	},
	defaultSelected: {
		type: Object,
		data: () => {},
	},
	showCheckbox: {
		type: Boolean,
		default: false,
	},
	accordion: {
		type: Boolean,
		default: false,
	},
	checkStrictly: {
		type: Boolean,
		default: false,
	},
	treeGroupListConf: {
		type: Object,
		default: () => {},
	},
	listExposed: {
		type: Object,
		default: () => {},
	},
});
const emit = defineEmits(["changeOtherFilters"]);

let loading = ref(false);
let treeData = ref([]);
let customDTreeRef = ref();

// 树节点配置
const defaultProps = {
	children: "children",
	label: "label",
	isLeaf: "leaf",
};

// 组装脚本可用的上下文参数
const getScriptExposedParams = (extraParams = {}) => {
	return {
		refExposed: props.listExposed,
		http,
		router: Router,
		appPath: import.meta.env.VITE_APP_PATH,
        customTreeRef: customDTreeRef,
		elementEvent: {
			ElMessageBox,
			ElLoading,
			ElMessage,
		},
		...extraParams,
	};
};

// 默认展开节点
let firstLevelKeys = ref([]);

// 默认选择节点
// let defaultCheckedKeys = ref([]);

// 节点过滤
let filterText = ref("");
// 监听搜索值
watch(filterText, (val) => {
	customDTreeRef.value?.filter(val);
});
// 执行树过滤
const filterNode = (value, data) => {
	if (!value) return true;
	return data.label.includes(value);
};

const loadTreeData = async () => {
	loading.value = true;
	try {
		let onLoadEvent = props.treeGroupListConf.onLoadEvent;
		let newOnLoadEvent = new Function("exposed", onLoadEvent);
		let res = await newOnLoadEvent.call(this, getScriptExposedParams());
		treeData.value = res || [];
		loading.value = false;
	} catch (error) {
		console.log(error, "error");
		ElMessage.error("脚本异常：" + error);
		loading.value = false;
	}
};

const loadNode = async (node, resolve) => {
	if (node.level === 0) {
		return resolve([]);
	}
	try {
		let onNodeExpandEvent = props.treeGroupListConf.onNodeExpandEvent;
		let newOnNodeExpandEvent = new Function("exposed", onNodeExpandEvent);
		let res = await newOnNodeExpandEvent.call(
			this,
			getScriptExposedParams({
				nodeData: node.data,
			})
		);
		resolve(res || []);
	} catch (error) {
		console.log(error, "error");
		ElMessage.error("脚本异常：" + error);
		resolve([]);
	}
};

let cutSelectedNode = ref([]);

// 树节点点击
const handleNodeClick = async (node) => {
	// 是否取消选中
	let clickState = "select";
	if (cutSelectedNode.value[0]?.id === node.id) {
		// 再次点击同一个节点，取消选中
		cutSelectedNode.value = [];
		clickState = "unselect";
		customDTreeRef.value?.setCurrentKey(null);
	} else {
		// 选中新节点
		cutSelectedNode.value[0] = {
			id: node.id,
			label: node.label,
			...node,
		};
		clickState = "select";
	}

	try {
		let onNodeClickEvent = props.treeGroupListConf.onNodeClickEvent;
		if (!onNodeClickEvent) return;
		let newOnNodeClickEvent = new Function("exposed", onNodeClickEvent);
		newOnNodeClickEvent.call(
			this,
			getScriptExposedParams({
				nodeData: node,
				clickState,
				currentSelectedNode: cutSelectedNode.value[0] || null,
			})
		);
	} catch (error) {
		console.log(error, "error");
		ElMessage.error("脚本异常：" + error);
	}
};

const handleCheckChange = () => {
	// console.log("触发次数")
	// emit("nodeCheckChange", customDTreeRef.value?.getCheckedNodes());
};

const getSelectedNode = () => {
	if (props.showCheckbox) {
		return customDTreeRef.value?.getCheckedNodes();
	} else {
		return cutSelectedNode.value;
	}
};

watch(
	() => props.treeGroupListConf,
	() => {
		if (JSON.stringify(props.treeGroupListConf) != "{}") {
			loadTreeData(props.treeGroupListConf);
		}
	},
	{
		deep: true,
		immediate: true,
	}
);

const resetChecked = () => {
	customDTreeRef.value?.setCheckedKeys([], false);
};

defineExpose({
	getSelectedNode,
});
</script>
<style lang="scss" scoped>
.reference-search-main {
	padding: 0 10px;
}
:deep(.el-tree-node__content) {
	height: 32px;
}
</style>
