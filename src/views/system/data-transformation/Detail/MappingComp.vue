<template>
	<!--  -->
	<div class="mapping-comp">
		<el-row
			:gutter="10"
			v-for="(item, inx) of myUseFields"
			:key="inx"
			:class="[inx != myUseFields.length - 1 ? 'mb-10' : '']"
		>
			<!-- 目标字段 -->
			<el-col :span="9">
				<el-select
					v-model="item.targetField"
					filterable
					class="w-100"
					@change="targetFieldChange(item)"
				>
					<el-option
						v-for="(op, inx) in targetFields"
						:key="inx"
						:label="op.fieldLabel + '(' + op.fieldType + ')'"
						:value="op.fieldName"
					/>
				</el-select>
			</el-col>
			<!-- 更新方式 -->
			<el-col :span="5">
				<el-select
					v-model="item.updateMode"
					filterable
					class="w-100"
					@change="updateModeChange(item)"
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
					v-if="item.updateMode == 'forField'"
					v-model="item.sourceField"
					filterable
					class="w-100"
				>
					<el-option
						v-for="(op, inx) in floatSourceFieldList(item)"
						:key="inx"
						:label="op.fieldLabel"
						:value="op.fieldName"
					/>
				</el-select>
				<!-- 固定值-布尔 -->
				<el-select
					v-if="
						item.updateMode == 'toFixed' &&
						item.fieldType == 'Boolean'
					"
					v-model="item.sourceField"
					filterable
					class="w-100"
				>
					<el-option label="正常" value="1" />
					<el-option label="禁用" value="0" />
				</el-select>
			</el-col>
			<!-- 删除 -->
			<el-col :span="1">
				<div class="del-icon-div" @click="onDel(inx)">
					<el-icon><Delete /></el-icon>
				</div>
			</el-col>
		</el-row>
		<el-row :gutter="10" class="mb-5" v-if="myUseFields.length > 0">
			<el-col :span="9">
				<span class="info-text">目标字段</span>
			</el-col>
			<el-col :span="6">
				<span class="info-text">更新方式</span>
			</el-col>
			<el-col :span="9">
				<span class="info-text">源字段</span>
			</el-col>
		</el-row>
		<div class="w-100">
			<el-button type="primary" plain @click="onAdd">添加</el-button>
		</div>
	</div>
</template>

<script setup>
import { ref, reactive, watchEffect } from "vue";

const props = defineProps({
	modelValue: null,
	// 源字段S
	sourcesFields: {
		type: Object,
		default: () => [],
	},
	// 目标字段S
	targetFields: {
		type: Object,
		default: () => [],
	},
});

// 源字段S
let mySourcesFields = ref([]);
// 目标字段S
let myTargetFields = ref([]);

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
// 使用的字段
let myUseFields = ref([]);

// 更新内容
const updateItem = reactive({
	// 目标字段
	targetField: "",
	// 更新方式
	updateMode: "forField",
	// 源字段
	sourceField: "",
	// 如果更新方式是 计算公式  判断是否是高级公式
	simpleFormula: false,
	fieldType: "",
	referenceName: "",
});

watchEffect(() => {
	mySourcesFields.value = props.sourcesFields;
	myTargetFields.value = props.targetFields;
	myUseFields.value = props.modelValue;
	console.log(mySourcesFields.value, "传入的左边字段集");
	console.log(myTargetFields.value, "传入的右边字段集");
	console.log(myUseFields.value, "传入使用字段");
});

// 添加
const onAdd = () => {
    let newUpdateItem = JSON.parse(JSON.stringify(updateItem));
    // if(myTargetFields.value.length > 0){
    //     newUpdateItem.targetField = myTargetFields.value[0].fieldName;
    // }
    // if(mySourcesFields.value.length > 0){
    //     newUpdateItem.sourceField = mySourcesFields.value[0].fieldName;
    // }
	myUseFields.value.push(newUpdateItem);

};
// 删除
const onDel = (inx) => {
	myUseFields.value.splice(inx, 1);
};

/**
 * 字段格式化 beg
 */

// 目标字段切换
const targetFieldChange = (item) => {
	let curtField = getCurField(item);
	item.fieldType = curtField.fieldType;
	item.referenceName = curtField.referenceName;
	item.sourceField = null;
};

// 更新方式切换
const updateModeChange = (item) => {
    item.sourceField = null;
}

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

/**
 * 字段格式化 end
 */
</script>
<style lang="scss" scoped>
.mapping-comp {
	width: 600px;
	background: #f7f7f7;
	border-radius: 4px;
	padding: 10px;
	box-sizing: border-box;
	.del-icon-div {
		height: 30px;
		box-sizing: border-box;
		padding-top: 4px;
		font-size: 18px;
		cursor: pointer;
		&:hover {
			color: var(--el-color-primary);
		}
	}
}
</style>
