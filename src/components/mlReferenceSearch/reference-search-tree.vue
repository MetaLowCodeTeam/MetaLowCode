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
				ref="treeRef"
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
			/>
		</el-scrollbar>
	</div>
</template>

<script setup>
import { nextTick, ref, watch, watchEffect } from "vue";
import { queryRecordTree } from "@/api/crud";
const props = defineProps({
	treeConf: {
		type: Object,
		data: () => {},
	},
    defaultCheckedKeys: {
		type: Object,
		data: () => [],
	},
    defaultSelected: {
		type: Object,
		data: () => {},
	},
    showCheckbox : {
        type: Boolean,
        default: false
    },
    accordion: {
        type: Boolean,
        default: false
    },
    checkStrictly: {
        type: Boolean,
        default: false
    }
});
const emit = defineEmits(['nodeClick', 'nodeCheckChange']);
// 节点配置
let myTreeConf = ref({});
let loading = ref(false);
let treeData = ref([]);
let treeRef = ref();

// 树节点配置
const defaultProps = {
	children: "children",
	label: "label",
};

// 默认展开节点
let firstLevelKeys = ref([]);

// 默认选择节点
// let defaultCheckedKeys = ref([]);

// 节点过滤
let filterText = ref("");
// 监听搜索值
watch(filterText, (val) => {
	treeRef.value?.filter(val);
});
// 执行树过滤
const filterNode = (value, data) => {
	if (!value) return true;
	return data.label.includes(value);
};

const loadTreeData = async (entityName, parentFieldName) => {
	loading.value = true;
	let res = await queryRecordTree(entityName, parentFieldName);
	if (res) {
		treeData.value = res.data;
		if (treeData.value.length > 0) {
			firstLevelKeys.value = [treeData.value[0].id];
		}
        if(!props.showCheckbox && props.defaultSelected?.id){
            let { id } = props.defaultSelected;
            nextTick(() => {
                treeRef.value?.setCurrentKey(id, true)
            })
        }
        if(props.showCheckbox && props.defaultSelected && props.defaultSelected.length > 0){
            treeRef.value?.setCheckedKeys(props.defaultSelected.map(el => el.id))
        }
	}
	loading.value = false;
};

let cutSelectedNode = ref([]);

// 树节点点击
const handleNodeClick = (node) => {
    // 如果当前节点已经被选中，则清空选中
    if (cutSelectedNode.value[0]?.id === node.id) {
        cutSelectedNode.value = [];
        treeRef.value?.setCurrentKey(null);
    } else {
        // 否则选中当前节点
        cutSelectedNode.value[0] = {
            id: node.id,
            label: node.label,
        };
    }
    emit('nodeClick', cutSelectedNode.value[0] || null);
};

const handleCheckChange = () => {
    // console.log("触发次数")
    emit('nodeCheckChange', treeRef.value?.getCheckedNodes());
}

watchEffect(() => {
	myTreeConf.value = props.treeConf;
	let { treeDataEntityName, treeCascadeFieldName } = myTreeConf.value;
	if (treeDataEntityName && treeCascadeFieldName) {
		loadTreeData(treeDataEntityName, treeCascadeFieldName);
	}
});

const getSelectedNode = () => {
    if(props.showCheckbox){
        return treeRef.value?.getCheckedNodes();
    }else {
        return cutSelectedNode.value;
    }   
}

const resetChecked = () => {
    treeRef.value?.setCheckedKeys([], false);
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
