<template>
	<el-form-item label="开启查询面板" v-if="designer?.formConfig?.layoutType == 'PC'">
		<el-switch v-model="optionModel.setQueryPanel.isShow"/>
	</el-form-item>
    <el-form-item label="设置查询面板" v-if="optionModel.setQueryPanel.isShow && designer?.formConfig?.layoutType == 'PC'">
		<el-button @click="openDialog">
			{{ getSetConditionText() }}
		</el-button>
	</el-form-item>
    <SetQueryPanelDialog
		ref="setQueryPanelDialogRef"
		:entityName="entityName"
        :showSaveQueryValue="false"
		@conditionsConfirm="conditionsConfirm"
	/>
    
</template>

<script setup>
import { ref, watch, onMounted } from "vue";
import SetQueryPanelDialog from "@/components/mlSetConditions/SetQueryPanelDialog.vue";
import useCommonStore from "@/store/modules/common";
import { ElMessage } from "element-plus";
const { queryEntityNameByCode } = useCommonStore();
defineOptions({
	name: "setQueryPanel-editor",
});

const props = defineProps({
	optionModel: {
		type: Object,
		default: () => ({}),
	},
	designer: {
		type: Object,
		default: () => ({}),
	},
	selectedWidget: {
		type: Object,
		default: () => ({}),
	},
});

let queryPanelConf = ref({})

watch(() => props.optionModel.dataEntity, (newVal) => {
    if(props.optionModel?.setQueryPanel?.queryPanelConf?.filter){
        props.optionModel.setQueryPanel.queryPanelConf.filter.items = [];
    }
})
onMounted(() => {
    queryPanelConf.value = props.optionModel.setQueryPanel.queryPanelConf;
})


let entityName = ref("");
let setQueryPanelDialogRef = ref(null);
const openDialog = () => {
	if (!props.optionModel.dataEntity) {
		ElMessage.error("请先选择图标数据实体");
		return;
	}
	entityName.value = queryEntityNameByCode(props.optionModel.dataEntity);
	setQueryPanelDialogRef.value.openDialog(JSON.parse(JSON.stringify(queryPanelConf.value)));
};

const conditionsConfirm = (event) => {
    queryPanelConf.value = event;
	props.optionModel.setQueryPanel.queryPanelConf = JSON.parse(JSON.stringify(queryPanelConf.value));
};

const getSetConditionText = () => {
    let length = queryPanelConf.value?.filter?.items?.length || 0;
    return length > 0 ? `已设置条件（${length}）` : "点击设置";
}

</script>

<style scoped></style>
