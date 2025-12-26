<template>
	<el-scrollbar>
		<ReferenceSearchTree
			:treeConf="treeConf"
			@nodeCheckChange="nodeCheckChange"
			@nodeClick="nodeClick"
			:showCheckbox="props.treeGroupConf.isMultiple"
			:accordion="props.treeGroupConf.isAccordion"
			:checkStrictly="!props.treeGroupConf.isStrictly"
		/>
	</el-scrollbar>
</template>

<script setup>
import { ref, watchEffect } from "vue";
import ReferenceSearchTree from "@/components/mlReferenceSearch/reference-search-tree.vue";
import { ElMessage } from 'element-plus'
const props = defineProps({
	treeGroupConf: {
		type: Object,
		default: () => {},
	},
});

const emit = defineEmits(['changeOtherFilters', 'nodeClick'])
let treeConf = ref({});

watchEffect(() => {
	treeConf.value = {
		treeDataEntityName: props.treeGroupConf.fieldReferTo,
		treeCascadeFieldName: props.treeGroupConf.referenceFieldParent,
	};
});

const nodeCheckChange = (list) => {
    if(!props.treeGroupConf.isMultiple){
        return
    }
    formatTreeData(list)
};

const nodeClick = (node) => {
    if(props.treeGroupConf.isMultiple){
        return
    }
    if(node){
        ElMessage.success('已过滤数据')
        formatTreeData([node])
    }else {
        ElMessage.success('已取消数据过滤')
        emit('changeOtherFilters', [])
    }
    emit('nodeClick', node)
};

const formatTreeData = (data) => {
    let { referenceField, fieldReferType } = props.treeGroupConf;
    let filter = {
        equation: "OR",
        items: [],
    };
    data.forEach(el => {
        filter.items.push({
            fieldName: referenceField,
            // 多引用为包含，单引用为等于
            op: fieldReferType == "ReferenceList" ? "REF" : "EQ",
            value: el.id,
        })
    })
    emit('changeOtherFilters', [filter])
};
</script>

<style></style>
