<template>
	<ml-dialog v-model="isShow" title="插槽列表设置">
		<div v-loading="loading" class="set-list-style">
			<el-row :gutter="20">
				<el-col :span="12">
					<div class="form-title">上插槽设置</div>
					<SlotListSetting-From v-model="slotTableConf.topSlot" />
				</el-col>
				<el-col :span="12">
					<div class="form-title">下插槽设置</div>
					<SlotListSetting-From v-model="slotTableConf.bottomSlot" />
				</el-col>
			</el-row>
		</div>
		<template #footer>
			<el-button @click="closeDialog">取消</el-button>
			<el-button type="primary" @click="confirmSlotTableConf">确定</el-button>
		</template>
	</ml-dialog>
</template>

<script setup>
import { ref } from "vue";
import SlotListSettingFrom from "./SlotListSetting-From.vue";
import layoutConfig from "@/api/layoutConfig";
import { ElMessage } from "element-plus";
const props = defineProps({
    entityCode: {
        type: [String, Number],
        default: "",
    },
    modelName: {
        type: String,
        default: "",
    },
    entityName: {
        type: String,
        default: "",
    },
})

const emits = defineEmits(["confirm"]);

let isShow = ref(false);
let loading = ref(false);

let slotTableConf = ref({
	// 上插槽
	topSlot: {
		// 是否开启
		open: false,
		// 1 表单 2 仪表盘
		type: 1,
        // 指定高度
        height: 0,
        // 实体名称
        entityName: "",
        // 表单ID
        formId: "",
        // 仪表盘ID
        chartId: "",      
        formError: false,
        chartError: false,
	},
	// 下插槽
	bottomSlot: {
		// 是否开启
		open: false,
		// 1 表单 2 仪表盘
		type: 1,
        // 指定高度
        height: 0,
        // 实体名称
        entityName: "",
        // 表单ID
        formId: "",
        // 仪表盘ID
        chartId: "",      
        formError: false,
        chartError: false,
	},
});


let currentConfig = ref({});
let layoutConfigId = ref(null);

const openDialog = (styleConfig) => {
    if(styleConfig && styleConfig.layoutConfigId){
        currentConfig.value = JSON.parse(styleConfig.config);
        layoutConfigId.value = styleConfig.layoutConfigId;
    }
    if(currentConfig.value && currentConfig.value.slotTableConf){
        slotTableConf.value = JSON.parse(JSON.stringify(currentConfig.value.slotTableConf));
    }
	isShow.value = true;
};

const closeDialog = () => {
	isShow.value = false;
};

// 保存配置
const confirmSlotTableConf = async () => {
    if(slotTableConf.value.topSlot.open){
        if(slotTableConf.value.topSlot.type === 1 && !slotTableConf.value.topSlot.formId){
            slotTableConf.value.topSlot.formError = true;
            ElMessage.error("请选择表单");
            return;
        }    
        if(slotTableConf.value.topSlot.type === 2 && !slotTableConf.value.topSlot.chartId){
            slotTableConf.value.topSlot.chartError = true;
            ElMessage.error("请选择仪表");
            return;
        }   
    }
    if(slotTableConf.value.bottomSlot.open){
        if(slotTableConf.value.bottomSlot.type === 1 && !slotTableConf.value.bottomSlot.formId){
            slotTableConf.value.bottomSlot.formError = true;
            ElMessage.error("请选择表单");
            return;
        }    
        if(slotTableConf.value.bottomSlot.type === 2 && !slotTableConf.value.bottomSlot.chartId){
            slotTableConf.value.bottomSlot.chartError = true;
            ElMessage.error("请选择仪表");
            return;
        }   
    }
    if(!slotTableConf.value.topSlot.height){
        slotTableConf.value.topSlot.height = 0;
    }
    if(!slotTableConf.value.bottomSlot.height){
        slotTableConf.value.bottomSlot.height = 0;
    }
    currentConfig.value.slotTableConf = JSON.parse(JSON.stringify(slotTableConf.value));
    let param = {
		config: JSON.stringify(currentConfig.value),
		entityCode: props.entityCode,
	};
	loading.value = true;
	let res = await layoutConfig.saveConfig(
		layoutConfigId.value,
		"STYLE",
		param,
		props.modelName
	);
	if (res) {
		ElMessage.success("保存成功");
		emits("confirm");
		isShow.value = false;
	}
	loading.value = false;
}

defineExpose({
	openDialog,
	closeDialog,
});
</script>

<style lang="scss" scoped>
.set-list-style {
	text-align: left;
	line-height: 32px;
	.form-title {
		font-weight: bold;
		font-size: 16px;
		margin-bottom: 5px;
		color: var(--el-color-primary);
		background: var(--el-color-primary-light-8); /* 浅蓝背景 */
		border-left: 4px solid var(--el-color-primary);
		box-sizing: border-box;
		padding-left: 10px;
	}
	.form-item {
		// line-height: 32px;
	}
}
</style>
