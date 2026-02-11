<template>
	<div
		v-if="mySlotTableConf?.type == 1"
		v-loading="loading"
		:style="{
			height:
				mySlotTableConf?.height > 0
					? mySlotTableConf?.height + 'px'
					: '',
			overflow: 'auto',
            padding: '10px 20px 0px 20px'
		}"
	>
		<v-form-render
			v-if="haveLayoutJson"
			ref="vFormRef"
			:global-dsv="globalDsv"
			:option-data="optionData"
		/>
	</div>
	<div
		v-if="mySlotTableConf?.type == 2"
		v-loading="loading"
		:style="{
			height:
				mySlotTableConf?.height > 0
					? mySlotTableConf?.height + 'px'
					: '',
			overflow: 'auto',
		}"
	>
		<v-form-render
			v-if="showFormRender"
			ref="DashboardWidgetRef"
			:global-dsv="globalDsv"
		></v-form-render>
	</div>
</template>

<script setup>
import { watch, ref, nextTick } from "vue";
import { queryById } from "@/api/crud";
import { getFormLayout } from "@/api/system-manager";
import { globalDsvDefaultData } from "@/utils/util";

const props = defineProps({
	slotTableConf: {
		type: Object,
		default: () => {},
	},
});

let mySlotTableConf = ref({});

let loading = ref(false);
let globalDsv = ref(globalDsvDefaultData());

// vFormRef 表单组件引用
let vFormRef = ref(null);
let haveLayoutJson = ref(false);
// 表单数据
let optionData = ref({});

// 加载表单数据
const loadFormData = async () => {
    loading.value = true;
    haveLayoutJson.value = false;
    let { entityName, formId } = mySlotTableConf.value;
    let res = await getFormLayout(entityName, formId);
    if(res?.code == 200 && res.data?.layoutJson) {
        haveLayoutJson.value = true;
        optionData.value = res.data.optionData || {};
        if(res.data.codeOptionData) {
            optionData.value = Object.assign(optionData.value, res.data.codeOptionData);
        }
        if(res.data.cascaderOptionData) {
            optionData.value = Object.assign(optionData.value, res.data.cascaderOptionData);
        }
        nextTick(() => {
            vFormRef.value?.setFormJson(res.data.layoutJson);
            nextTick(() => {
                vFormRef.value?.reloadOptionData();
            });
        });
    }
    loading.value = false;
};

// 是否显示图表
let showFormRender = ref(false);
// 图表组件引用
let DashboardWidgetRef = ref(null);
// 加载图表数据
const loadChartData = async () => {
	loading.value = true;
	showFormRender.value = false;
	let res = await queryById(mySlotTableConf.value.chartId, "chartData");
	if (res?.code == 200 && res.data?.chartData) {
		showFormRender.value = true;
		let blankFormJson = JSON.parse(res.data.chartData);
		nextTick(() => {
			if (DashboardWidgetRef.value) {
				DashboardWidgetRef.value.changeLanguage(
					localStorage.getItem("Language")
				);
				DashboardWidgetRef.value.setFormJson(blankFormJson);
			}
		});
	}
	loading.value = false;
};

watch(
	() => props.slotTableConf,
	() => {
		mySlotTableConf.value = props.slotTableConf;
		let { type } = mySlotTableConf.value;
		if (type == 1) {
			loadFormData();
		} else {
			loadChartData();
		}
	},
	{ immediate: true, deep: true }
);
</script>

<style lang="scss" scoped>
:deep(.render-form .table-box) {
    padding: 0 !important;
}
</style>
