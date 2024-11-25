<style lang="scss" scoped>
.set-list-style {
	line-height: 1;
	max-height: 500px;
	overflow-y: auto;
	overflow-x: hidden;
	padding: 0 10px;
	.from-title {
		font-weight: bold;
		font-size: 18px;
		margin-bottom: 10px;
	}
}
.text-info {
	font-size: 14px;
	font-weight: bold;
	color: #a8abb2;
}
</style>

<template>
	<!--  -->
	<mlDialog title="卡片列表设置" v-model="isShow" width="600px">
		<div
			v-loading="loading"
			:element-loading-text="loadingText"
			class="set-list-style"
		>
			<el-row :gutter="20">
				<el-col :span="24">
					<div class="from-title">选择渲染表单（PC）</div>
					<div class="from-item mb-20">
						<el-select
							v-model="cardSetting.pcFormId"
							placeholder="请选择渲染表单"
							class="w-100"
						>
							<el-option
								v-for="item in formList"
								:key="item.formLayoutId"
								:label="item.layoutName"
								:value="item.formLayoutId"
							/>
						</el-select>
					</div>
				</el-col>
				<el-col :span="24">
					<div class="from-title">选择渲染表单（移动端）</div>
					<div class="from-item mb-20">
						<el-select
							v-model="cardSetting.mobileFormId"
							placeholder="请选择渲染表单"
							class="w-100"
						>
                            <el-option
								v-for="item in formList"
								:key="item.formLayoutId"
								:label="item.layoutName"
								:value="item.formLayoutId"
							/>
						</el-select>
					</div>
				</el-col>
				<el-col :span="24">
					<div class="from-title">
						一排展示几个
						<span class="text-info">
							<!-- （仅PC生效，移动端因尺寸问题固定展示1个） -->
							（仅PC生效，移动端暂不支持）
						</span>
					</div>
					<div class="from-item">
						<el-radio-group v-model="cardSetting.rowNum">
							<el-radio :value="1">1</el-radio>
							<el-radio :value="2">2</el-radio>
							<el-radio :value="3">3</el-radio>
							<el-radio :value="4">4</el-radio>
							<el-radio :value="6">6</el-radio>
						</el-radio-group>
					</div>
				</el-col>
			</el-row>
		</div>
		<template #footer>
			<div class="footer-div">
				<el-button @click="isShow = false" :loading="loading">
					取消
				</el-button>
				<el-button type="primary" @click="onSave" :loading="loading">
					保存
				</el-button>
			</div>
		</template>
	</mlDialog>
</template>

<script setup>
import { onMounted, watch, ref, watchEffect } from "vue";
import { ElMessage } from "element-plus";
/**
 * API
 */
import { getFormLayoutList } from "@/api/system-manager";
import layoutConfig from "@/api/layoutConfig";

import useCommonStore from "@/store/modules/common";
const { queryEntityNameByCode } = useCommonStore();

const props = defineProps({
	modelValue: null,
	layout: { type: Object, default: () => {} },
	// 实体模块名称
	modelName: {
		type: String,
		default: "",
	},
	entityCode: { type: Number },
});

const emits = defineEmits(["update:modelValue", "confirm"]);

let isShow = ref(false);

let loading = ref(false);
let loadingText = ref("");

let cardSetting = ref({
	// PC表单
	pcFormId: "",
	// 移动端表单
	mobileFormId: "",
	// 一排展示几个
	rowNum: 4,
});
// 保存时的ID
let layoutConfigId = ref("");

watch(
	() => isShow.value,
	(v) => {
		emits("update:modelValue", v);
	},
	{ deep: true }
);

let formList = ref([]);
// 加载表单
const loadFormList = async () => {
	loading.value = true;
	loadingText.value = "表单加载中...";
	let res = await getFormLayoutList(queryEntityNameByCode(props.entityCode));
	if (res) {
		formList.value = res.data;
	}
	loading.value = false;
};

watchEffect(() => {
	let { modelValue, modelName, layout } = props;
	isShow.value = props.modelValue;
	if (isShow.value) {
		layoutConfigId.value = "";
		if (layout.CARD) {
			cardSetting.value = Object.assign(
				cardSetting.value,
				JSON.parse(layout.CARD.config)
			);
			layoutConfigId.value = layout.CARD.layoutConfigId;
		}

		loadFormList();
	}
});

// 保存设置
const onSave = async () => {
	if (!cardSetting.value.pcFormId && !cardSetting.value.mobileFormId) {
		ElMessage.error("请至少选择一个渲染表单");
		return;
	}
	let param = {
		config: JSON.stringify(cardSetting.value),
		entityCode: props.entityCode,
	};

	loading.value = true;
	loadingText.value = "设置保存中...";
	let res = await layoutConfig.saveConfig(
		layoutConfigId.value,
		"CARD",
		param,
		props.modelName
	);
	if (res) {
		ElMessage.success("保存成功");
		emits("confirm");
		emits("update:modelValue", false);
	}
	loading.value = false;
};
</script>
