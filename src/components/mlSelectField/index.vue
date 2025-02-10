<template>
	<mlDialog :title="title" append-to-body width="38%" v-model="dialogIsShow">
		<div
			v-if="isQuickQuery"
			v-loading="loading"
			element-loading-text="字段加载中..."
		>
			<el-scrollbar max-height="400px" v-if="fieldList.length > 0">
				<FieldList
					:fieldList="fieldList"
					:layoutRow="6"
					@onSelect="fieldSelect"
				/>
			</el-scrollbar>
			<el-empty v-else description="没有数据" />
		</div>
		<el-tabs
			v-model="curTab"
			v-else
			v-loading="loading"
			element-loading-text="字段加载中..."
			style="margin-top: -20px"
			class="ml-tabs"
		>
			<el-tab-pane label="主表字段" name="mainFormFields">
				<el-scrollbar max-height="400px" v-if="fieldList.length > 0">
					<FieldList
						:fieldList="fieldList"
						:layoutRow="6"
						@onSelect="fieldSelect"
						disabledKey="reserved"
					/>
				</el-scrollbar>
				<el-empty v-else description="没有数据" />
			</el-tab-pane>
			<el-tab-pane label="从表字段" name="subFormFields" v-if="subFormFields.length > 0">
				<el-scrollbar max-height="400px" >
					<div
						v-for="(item, inx) of subFormFields"
						:key="inx"
						class="sub-item"
					>
						<div class="sub-title">
							{{ item.entityLabel }}
						</div>
						<div v-if="item.fieldList.length > 0">
							<FieldList
								:fieldList="item.fieldList"
								:layoutRow="6"
								@onSelect="fieldSelect"
								disabledKey="isReserved"
							/>
						</div>
						<el-empty v-else description="没有数据" />
					</div>
				</el-scrollbar>
			</el-tab-pane>
		</el-tabs>
		<template #footer>
			<el-button type="primary" @click="confirm">确认</el-button>
			<el-button @click="dialogIsShow = false">取消</el-button>
		</template>
	</mlDialog>
</template>
<!-- :disabled="field.reserved" -->
<script setup>
import { watch, ref, onMounted, inject } from "vue";
/**
 * API
 */
import { queryDetailEntityFields } from "@/api/crud";
/**
 * 组件
 */
import FieldList from "./FieldList.vue";

const $API = inject("$API");
const $ElMessage = inject("$ElMessage");
const props = defineProps({
	modelValue: { type: Object, default: () => {} },
	title: { type: String, defalut: "123" },
	nameFieldName: { type: String, defalut: "123" },
	isQuickQuery: { type: Boolean, defalut: false },
	quickQueryConf: { type: Object, default: () => {} },
	entityName: { type: String, defalut: "DemoContact" },
    // 实体模块名称
    modelName: {
        type: String,
        default: "",
    },
});
const emit = defineEmits(["update:modelValue", "onConfirm"]);
// 选中的数据列表
let selectedFields = ref([]);
// 弹框是否显示
let dialogIsShow = ref(false);
// 加载loadin
let loading = ref(false);
// 数据库字段列表
let fieldList = ref([]);
// 已存在的字段名称
let hasFieldNames = ref([]);
watch(
	() => props.modelValue,
	() => {
		selectedFields.value = props.modelValue;
	},
	{ deep: true }
);
onMounted(() => {
	selectedFields.value = props.modelValue;
});

// 存在字段对应的实体名称
let hasFieldFormEntity = ref({});

// 打开弹框
const openDialog = async () => {
	dialogIsShow.value = true;
	loading.value = true;
	hasFieldNames.value = selectedFields.value.map((el) => {
        hasFieldFormEntity.value[el.name] = el.formEntity;
        return el.name
    });
	await getAllFields();
	// 非列表快速查询
	if (!props.isQuickQuery) {
		await getDetailEntityFields();
	}
	loading.value = false;
};

// 获取所有字段
const getAllFields = async () => {
	let param = { entity: props.entityName };

	let res;
	if (props.isQuickQuery) {
		param.queryReference = false;
		res = await $API.common.getFieldListOfFilter(param);
	} else {
		res = await $API.common.getFieldListOfEntity(param);
	}
	if (res) {
		let resList = [];
		res.data.forEach((el) => {
            let showType = ['TextArea','Text','Money','Decimal','Integer'];
            let flag = props.isQuickQuery ? showType.includes(el.type) : el.type !== 'PrimaryKey';
			if (flag) {
				el.isSelected = false;
				if (hasFieldNames.value.includes(el.name)) {
					let filterFields = selectedFields.value.filter(
						(subEl) => el.name == subEl.name
					);
					el.isRequired = filterFields[0].isRequired;
					el.isEdit = filterFields[0].isEdit;
					el.isSelected = true;
				}
				// 如果是快速查询字段，且没有默认值，且是名称字段
				if (
					props.isQuickQuery &&
					selectedFields.value.length < 1 &&
					el.name == props.nameFieldName
				) {
					el.isSelected = true; 
				}
				resList.push(el);
			}
		});
		fieldList.value = resList;
	}
};

// 选择字段
const fieldSelect = (field) => {
	if (field.reserved && !props.isQuickQuery) {
		return;
	}
	if (field.isReserved && !props.isQuickQuery) {
		return;
	}
	field.isSelected = !field.isSelected;
};

// 确认
const confirm = async () => {
    // 主表数据
	selectedFields.value = fieldList.value.filter((el) => el.isSelected);
	
    // 从表数据
	if (!props.isQuickQuery) {
		subFormFields.value.forEach((el) => {
			el.fieldList.forEach((subEl) => {
				if (subEl.isSelected) {
					selectedFields.value.push(subEl);
				}
			});
		});
	}

	selectedFields.value.forEach((el) => {
		el.isEdit = true;
		// el.isRequired = false;
	});
	if (props.isQuickQuery) {
		if (selectedFields.value.length < 1) {
			$ElMessage.warning("请至少选择 1 个搜索字段");
			return;
		}
		let { entityCode, layoutConfigId } = props.quickQueryConf;
		let param = {
			config: JSON.stringify([...selectedFields.value]),
			entityCode,
			applyType: "SEARCH",
		};
		loading.value = true;
		let res = await $API.layoutConfig.saveConfig(
			layoutConfigId,
			"SEARCH",
			param,
            props.modelName
		);
		if (res) {
			$ElMessage.success("保存成功！");
			dialogIsShow.value = false;
			emit("onConfirm");
		}
		loading.value = false;
	} else {
		emit("update:modelValue", selectedFields.value);
		dialogIsShow.value = false;
	}
};

/**
 * 从表相关
 */
let curTab = ref("mainFormFields");
let subFormFields = ref([]);

const getDetailEntityFields = async () => {
	let res = await queryDetailEntityFields(props.entityName);

	if (res) {
		let resList = [];
		res.data.forEach((el) => {
			if (el.entityName != props.entityName) {
				el.fieldList.forEach((subEl) => {
					subEl.isSelected = false;
					subEl.name = subEl.fieldName;
					subEl.label = subEl.fieldLabel;
                    subEl.formEntity = el.entityName;
                    subEl.formEntityLabel = el.entityLabel;
					if (hasFieldNames.value.includes(subEl.fieldName) && hasFieldFormEntity.value[subEl.fieldName] == el.entityName) {
						let filterFields = selectedFields.value.filter(
							(subEl2) => subEl.fieldName == subEl2.name
						);
						subEl.isRequired = filterFields[0].isRequired;
						subEl.isEdit = filterFields[0].isEdit;
						subEl.isSelected = true;
					}
				});
				resList.push(el);
			}
		});
		subFormFields.value = resList;
	}
};

// 暴露方法给父组件调用
defineExpose({
	openDialog,
});
</script>

<style lang="scss" scoped>
.ml-tabs {
	.sub-item {
		.sub-title {
			border-top: 1px solid #e4e7ed;
			padding-top: 10px;
			font-weight: bold;
			font-size: 15px;
			margin-bottom: 15px;
		}
		&:first-child {
			.sub-title {
				border-top: 0;
				padding-top: 0px;
			}
		}
	}
}
</style>
