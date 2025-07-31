<template>
	<el-form-item label="开启查询面板">
		<el-switch v-model="setQueryPanel.isShow" @change="handleIsShowChange"/>
	</el-form-item>
	<el-form-item label="设置查询面板" v-if="setQueryPanel.isShow">
		<el-button @click="openDialog">
			点击设置
		</el-button>
	</el-form-item>
	<SetQueryPanelDialog
		ref="setQueryPanelDialogRef"
		:entityName="entityName"
		@conditionsConfirm="conditionsConfirm"
	/>
</template>

<script setup>
import { ref, watch } from "vue";
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

const emits = defineEmits(["update:optionModel"]);

let myOptionModel = ref({});

let setQueryPanel = ref({
	isShow: false,
	queryPanelConf: {},
});

watch(
	() => props.optionModel,
	(newVal) => {
		myOptionModel.value = Object.assign({}, myOptionModel.value, newVal);
		
		// 确保 setQueryPanel 结构存在
		if (!myOptionModel.value.setQueryPanel) {
			myOptionModel.value.setQueryPanel = {
				isShow: false,
				queryPanelConf: {}
			};
		}
		
        setQueryPanel.value = Object.assign({}, setQueryPanel.value, myOptionModel.value.setQueryPanel);
	},
	{
		immediate: true,
		deep: true,
	}
);

const handleIsShowChange = (val) => {
    // 使用解构赋值确保对象结构
    myOptionModel.value.setQueryPanel = {
        ...myOptionModel.value.setQueryPanel,
        isShow: val
    };
    emits("update:optionModel", myOptionModel.value);
}

// onMounted(() => {
//     setQueryPanel.value = Object.assign({}, props.optionModel.setQueryPanel);
// })


let entityName = ref("");


let setQueryPanelDialogRef = ref(null);
const openDialog = () => {
	// console.log(props.optionModel,'props.optionModel')
	// dialogVisible.value = true;
	if (!props.optionModel.dataEntity) {
		ElMessage.error("请先选择图标数据实体");
		return;
	}
	entityName.value = queryEntityNameByCode(props.optionModel.dataEntity);

	setQueryPanelDialogRef.value.openDialog(JSON.parse(JSON.stringify(setQueryPanel.value.queryPanelConf)));
};

const conditionsConfirm = (event) => {
	// console.log(event,'event')
};
</script>

<style scoped></style>
