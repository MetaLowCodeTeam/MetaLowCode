<template>
	<el-scrollbar>
		<ReferenceSearchTree
			:treeConf="treeConf"
			@nodeCheckChange="nodeCheckChange"
			@nodeClick="nodeClick"
			:showCheckbox="props.treeGroupConf.isMultiple"
		/>
	</el-scrollbar>
</template>

<script setup>
import { ref, watchEffect } from "vue";
import ReferenceSearchTree from "@/components/mlReferenceSearch/reference-search-tree.vue";
const props = defineProps({
	treeGroupConf: {
		type: Object,
		default: () => {},
	},
});

const emit = defineEmits(['changeOtherFilters'])
let treeConf = ref({});

watchEffect(() => {
	treeConf.value = {
		treeDataEntityName: props.treeGroupConf.fieldReferTo,
		treeCascadeFieldName: props.treeGroupConf.referenceFieldParent,
	};
});

const nodeCheckChange = (list) => {
    formatTreeData(list)
};

const nodeClick = (node) => {
    if(node){
        formatTreeData([node])
    }else {
        emit('changeOtherFilters', [])
    }
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
