<style lang="scss" scoped>
.set-list-style {
	line-height: 1;
	max-height: 500px;
	overflow-y: auto;
	overflow-x: hidden;
	padding: 20px;
	.from-title {
		font-weight: bold;
		font-size: 18px;
		margin-bottom: 10px;
		text-align: left;
	}
}
.text-info {
	font-size: 14px;
	font-weight: bold;
	color: #a8abb2;
    margin-top: 10px;
    text-align: left;
}
</style>

<template>
	<!--  -->
	<mlDialog title="日历视图设置" v-model="isShow" width="600px">
		<div
			v-loading="loading"
			:element-loading-text="loadingText"
			class="set-list-style"
		>
			<el-row :gutter="20">
				<el-col :span="24">
					<div class="from-title">选择日期维度</div>
					<div class="from-item mb-20">
						<el-select
							v-model="calendarListSetting.calendarField"
							placeholder="请选择日期维度字段"
							class="w-100"
                            @change="handleCalendarFieldChange"
						>
							<el-option
								v-for="(item, inx) in formList"
								:key="inx"
								:label="item.fieldLabel"
								:value="item.fieldName"
							/>
						</el-select>
                        <div class="text-info" v-if="calendarListSetting.isReserved || !calendarListSetting.isUpdatable">
                            当前维度不支持拖动位置修改时间
                        </div>
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
import { queryEntityFields } from "@/api/crud";
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

let calendarListSetting = ref({
	// 日期维度字段
	calendarField: "",
	// 是否系统字段
	isReserved: false,
	// 是否可编辑字段
	isUpdatable: false,
    // 字段类型
    fieldType: "",
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
	let res = await queryEntityFields(props.entityCode, true, true);
	if (res) {
		formList.value = res.data.filter(
			(item) => item.fieldType === "Date" || item.fieldType === "DateTime"
		);
	}
	loading.value = false;
};

watchEffect(() => {
	let { layout } = props;
	isShow.value = props.modelValue;
	if (isShow.value) {
		layoutConfigId.value = "";
		if (layout.CALENDAR) {
			calendarListSetting.value = Object.assign(
				calendarListSetting.value,
				JSON.parse(layout.CALENDAR.config)
			);
			layoutConfigId.value = layout.CALENDAR.layoutConfigId;
		}

		loadFormList();
	}
});

const handleCalendarFieldChange = (v) => {
    let field = formList.value.find(item => item.fieldName === v);
    calendarListSetting.value.isReserved = field.isReserved;
    calendarListSetting.value.isUpdatable = field.isUpdatable;
    calendarListSetting.value.fieldType = field.fieldType;
}

// 保存设置
const onSave = async () => {
	if (!calendarListSetting.value.calendarField) {
		ElMessage.error("请至少选择一个日期维度");
		return;
	}
	let param = {
		config: JSON.stringify(calendarListSetting.value),
		entityCode: props.entityCode,
	};

	loading.value = true;
	loadingText.value = "设置保存中...";
	let res = await layoutConfig.saveConfig(
		layoutConfigId.value,
		"CALENDAR",
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
