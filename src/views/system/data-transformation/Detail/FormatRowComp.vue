<template>
	<!-- 目标字段 -->
	<el-col :span="9">
		<el-select
			v-model="curtItem.targetField"
			filterable
			style="width: 100%"
			@change="targetFieldChange(curtItem)"
			:disabled="type == 2"
		>
			<el-option
				v-for="(op, inx) in myTargetFields"
				:key="inx"
				:label="op.fieldLabel + '(' + op.fieldType + ')'"
				:value="op.fieldName"
                :disabled="myUseFields.includes(op.fieldName)"
			/>
		</el-select>
	</el-col>
	<!-- 更新方式 -->
	<el-col :span="type == 2 ? 4 : 6">
		<el-select
			v-model="curtItem.updateMode"
			filterable
			style="width: 100%"
			@change="updateModeChange(curtItem)"
			:disabled="type == 2 || !curtItem.targetField"
		>
			<el-option
				v-for="(op, inx) in updateModes"
				:key="inx"
				:label="op.label"
				:value="op.value"
			/>
		</el-select>
	</el-col>
	<!-- 源字段 -->
	<el-col :span="9">
		<!-- 字段值 -->
		<el-select
			v-if="curtItem.updateMode == 'forField'"
			v-model="curtItem.sourceField"
			filterable
			style="width: 100%"
			:disabled="type == 2 || !curtItem.targetField"
		>
			<el-option
				v-for="(op, inx) in floatSourceFieldList(curtItem)"
				:key="inx"
				:label="op.fieldLabel"
				:value="op.fieldName"
			/>
		</el-select>
		<!-- 固定值-布尔 -->
		<el-select
			v-if="
				curtItem.updateMode == 'toFixed' &&
				curtItem.fieldType == 'Boolean'
			"
			v-model="curtItem.sourceField"
			filterable
			style="width: 100%"
			:disabled="type == 2 || !curtItem.targetField"
		>
			<el-option label="正常" value="1" />
			<el-option label="禁用" value="0" />
		</el-select>
		<!-- 固定值-时间 -->
		<el-date-picker
			v-if="
				curtItem.updateMode == 'toFixed' &&
				curtItem.fieldType == 'DateTime'
			"
			v-model="curtItem.sourceField"
			format="YYYY/MM/DD hh:mm:ss"
			value-format="YYYY-MM-DD hh:mm:ss a"
			type="datetime"
			:disabled="type == 2 || !curtItem.targetField"
			style="width: 100%"
		/>
		<!-- 固定值-日期 -->
		<el-date-picker
			v-if="
				curtItem.updateMode == 'toFixed' && curtItem.fieldType == 'Date'
			"
			v-model="curtItem.sourceField"
			format="YYYY/MM/DD"
			value-format="YYYY-MM-DD"
			type="date"
			:disabled="type == 2 || !curtItem.targetField"
			style="width: 100%"
		/>
		<!-- 固定值-文本 -->
		<el-input
			v-if="
				curtItem.updateMode == 'toFixed' &&
				curtItem.fieldType != 'Reference' &&
				curtItem.fieldType != 'Tag' &&
				curtItem.fieldType != 'Option' &&
				curtItem.fieldType != 'Boolean' &&
				curtItem.fieldType != 'DateTime' &&
				curtItem.fieldType != 'Date'
			"
			v-model="curtItem.sourceField"
			placeholder="固定值"
			:disabled="type == 2 || !curtItem.targetField"
		/>
		<!-- 固定值-引用 -->
		<el-input
			v-if="
				curtItem.updateMode == 'toFixed' &&
				curtItem.fieldType == 'Reference'
			"
			v-model="curtItem.sourceField.label"
			placeholder="固定值"
			:disabled="type == 2 || !curtItem.targetField"
		>
			<template #append>
				<el-button @click="openReferenceDialog(curtItem)">
					<el-icon>
						<ElIconSearch />
					</el-icon>
				</el-button>
			</template>
		</el-input>
		<!-- 固定值-单选、多选 -->
		<el-select
			v-if="
				curtItem.updateMode == 'toFixed' &&
				(curtItem.fieldType == 'Option' || curtItem.fieldType == 'Tag')
			"
			v-model="curtItem.sourceField"
			v-loading="optionItemLoading"
			filterable
			style="width: 100%"
			:disabled="type == 2 || !curtItem.targetField"
		>
			<el-option
				v-for="(tOp, tInx) of optionItems"
				:key="tInx"
				:label="tOp.label"
				:value="tOp"
			/>
		</el-select>
		<el-input
			v-if="curtItem.updateMode == 'forCompile'"
			v-model="curtItem.sourceField"
			placeholder="计算公式"
			autosize
			type="textarea"
			@click="checkMlFormula"
            :disabled="type == 2 || !curtItem.targetField"
		></el-input>
	</el-col>
	<el-dialog
		title="请选择"
		v-if="showReferenceDialogFlag"
		v-model="showReferenceDialogFlag"
		:show-close="true"
		class="small-padding-dialog"
		:width="'520px'"
		draggable
		:close-on-click-modal="false"
		:close-on-press-escape="false"
		:append-to-body="true"
	>
		<ReferenceSearchTable
			ref="referST"
			:entity="targetEntity.name"
			:refField="curtItem.targetField"
			@recordSelected="setReferRecord"
		></ReferenceSearchTable>
	</el-dialog>
	<div v-if="mlFormulaIsShow">
		<mlFormula
			v-model="mlFormulaIsShow"
			:fields="mlFormulaFields"
			:defaultFormulaVal="mlFormulaVal"
			:isAdvanced="mlIsAdvanced"
			@confirm="formulaConfirm"
		/>
	</div>
</template>

<script setup>
import { ref, watchEffect, reactive } from "vue";
import mlFormula from "@/components/mlFormula/index.vue";
import ReferenceSearchTable from "@/components/mlReferenceSearch/reference-search-table.vue";
/**
 * API
 */
import { getOptionItems, getTagItems } from "@/api/system-manager";
const props = defineProps({
	modelValue: null,
    useFields: {
        type: Object,
        default: () => [],
    },
	// 目标实体
	targetEntity: {
		type: Object,
		default: () => {},
	},
	// 目标实体
	sourceEntity: {
		type: Object,
		default: () => {},
	},
	// 类型  1新增 2查看
	type: {
		type: Number,
		default: 1,
	},
});

let curtItem = ref({});
// 源字段S
let mySourcesFields = ref([]);
// 目标字段S
let myTargetFields = ref([]);
// 已存在的数据
let myUseFields = ref([]);

// 更新方式
const updateModes = reactive([
	{
		label: "字段值",
		value: "forField",
	},
	{
		label: "固定值",
		value: "toFixed",
	},
	{
		label: "置空",
		value: "toNull",
	},
	{
		label: "计算公式",
		value: "forCompile",
	},
]);

watchEffect(() => {
	mySourcesFields.value = props.sourceEntity.fields;
	myTargetFields.value = props.targetEntity.fields;
    myUseFields.value = props.useFields.map(el => el.targetField);
	curtItem.value = props.modelValue;
});

/**
 * 字段格式化 beg
 */

// 目标字段切换
const targetFieldChange = (item, target) => {
	let curtField = getCurField(item);
	let { fieldType, referenceName } = curtField;
	item.fieldType = fieldType;
	item.referenceName = referenceName;
	updateModeChange(item, target);
};

// 单选、多选项下拉数据
let optionItems = ref("");
// 下拉数据loading
let optionItemLoading = ref(false);

// 更新方式切换
const updateModeChange = async (item, target) => {
	let { fieldType, updateMode } = item;
	if (fieldType == "Tag" || fieldType == "Option") {
		let res;
		if (fieldType == "Tag") {
			res = await getTagItems(props.targetEntity.name, item.targetField);
		} else {
			res = await getOptionItems(
				props.targetEntity.name,
				item.targetField
			);
		}
		if (res && res.data) {
			optionItems.value = res.data;
		}
	}
	if (target == "edit") {
		return;
	}
	if (updateMode == "forCompile") {
		item.sourceField = "";
		return;
	}
	if (fieldType == "Reference" && updateMode == "toFixed") {
		item.sourceField = {};
	} else if (fieldType == "Tag" || fieldType == "Option") {
		item.sourceField = [];
	} else {
		item.sourceField = null;
	}
};

// 取当前选择字段
const getCurField = (item) => {
	let findTargetField = myTargetFields.value.filter(
		(el) => el.fieldName == item.targetField
	);
	if (findTargetField.length > 0) {
		return findTargetField[0];
	} else {
		return {};
	}
};

// 格式化源字段显示
const floatSourceFieldList = (item) => {
	// 字符串字段
	let strField = ["Email", "Url", "TextArea", "Text"];

	let { fieldType, referenceName } = item;
	// 如果是字符串字段，显示所有字符串字段
	// 如果不是就显示通类型字段
	if (strField.includes(fieldType)) {
		return mySourcesFields.value.filter(
			(el) => el.fieldType != "Reference"
		);
	} else {
		if (fieldType == "Reference") {
			let showFields = [];
			mySourcesFields.value.forEach((el) => {
				if (
					el.fieldType == fieldType &&
					el.referenceName == referenceName
				) {
					showFields.push(el);
				}
			});
			return showFields;
		} else {
			let showFields = [];
			mySourcesFields.value.forEach((el) => {
				if (el.fieldType == fieldType || el.fieldType == "Text") {
					showFields.push(el);
				}
			});
			if (showFields.length < 1) {
				return mySourcesFields.value.filter(
					(el) => el.fieldType != "Reference"
				);
			} else {
				return showFields;
			}
		}
	}
};

/**
 * 字段格式化 end
 */

/**
 * 引用类型弹框
 */
// 引用实体弹框
let showReferenceDialogFlag = ref(false);
// 引用实体目标字段
let curRefItem = ref("");
// 打开弹框
const openReferenceDialog = (item) => {
	curRefItem.value = item;
	showReferenceDialogFlag.value = true;
};

// 引用字段弹框选择
const setReferRecord = (e) => {
	curRefItem.value.sourceField = e;
	showReferenceDialogFlag.value = false;
};

/**
 * 计算公式
 */
// 是否显示计算公式
let mlFormulaIsShow = ref(false);
// 计算公式源字段
let mlFormulaFields = ref([]);
// 高级 计算公式 回显值
let mlFormulaVal = ref("");
let mlIsAdvanced = ref(false);
// 判断计算公式显示
const checkMlFormula = () => {
	showAdvancedFormula(
		mySourcesFields.value,
		true,
		curtItem.value.sourceField
	);
};
// 执行显示 计算公式
/**
 *
 * @param {*} sourceFields 源字段
 * @param {*} isAdvanced 是否高级 计算公式
 * @param {*} value   高级公式默认值
 */
const showAdvancedFormula = (sourceFields, isAdvanced, value) => {
	mlFormulaIsShow.value = true;
	mlFormulaFields.value = sourceFields;
	mlIsAdvanced.value = isAdvanced;
	mlFormulaVal.value = isAdvanced ? value : "";
	curtItem.value.simpleFormula = isAdvanced;
};

// 确认计算方式
const formulaConfirm = (formula) => {
	curtItem.value.sourceField = formula.label;
};

defineExpose({
	targetFieldChange,
});
</script>
<style lang="scss" scoped></style>
