<template>
	<ml-dialog
		v-model="addFieldDialogVisible"
		:title="title"
		width="500px"
		append-to-body
	>
		<el-form :model="form" :rules="rules" ref="formRef">
			<el-form-item label="显示名称" prop="fieldLabel">
				<el-input
					v-model="form.fieldLabel"
					placeholder="请输入显示名称"
				/>
			</el-form-item>
			<el-form-item label="字段名称" prop="fieldName">
				<el-input
					v-model="form.fieldName"
					placeholder="请输入字段名称"
				/>
			</el-form-item>
			<el-form-item label="字段类型" prop="fieldType">
				<el-select
					v-model="form.fieldType"
					placeholder="请选择字段类型"
				>
					<el-option
						v-for="item in fieldTypeList"
						:key="item.value"
						:label="item.label"
						:value="item.value"
					/>
				</el-select>
			</el-form-item>
		</el-form>
		<template #footer>
			<el-button @click="closeDialog" size="default">取消</el-button>
			<el-button type="primary" @click="confirmField" size="default"
				>确认</el-button
			>
		</template>
	</ml-dialog>
</template>

<script setup>
import { ref } from "vue";
import { getGuid } from "@/utils/util";

const emit = defineEmits(["confirm"]);

// 目前支持的字段类型
const fieldTypeList = [
	{
		label: "文本(Text)",
		value: "Text",
	},
	{
		label: "整数(Integer)",
		value: "Integer",
	},
	{
		label: "精度小数(Decimal)",
		value: "Decimal",
	},
	{
		label: "日期(Date)",
		value: "Date",
	},
];

// 默认字段
const defaultField = {
	fieldName: "",
	fieldType: "",
	fieldLabel: "",
};

let formRef = ref(null);

let form = ref({});
let rules = ref({
	fieldLabel: [
		{ required: true, message: "请输入显示名称", trigger: "blur" },
	],
	fieldName: [
		{ required: true, message: "请输入字段名称", trigger: "blur" },
		{
			pattern: /^[a-zA-Z][a-zA-Z0-9]*$/,
			message: "字段名称必须以英文字母开头，只能包含英文字母和数字",
			trigger: "blur"
		}
	],
	fieldType: [{ required: true, message: "请选择字段类型", trigger: "blur" }],
});

let addFieldDialogVisible = ref(false);

let title = ref("添加查询字段");

const openDialog = (field) => {
	addFieldDialogVisible.value = true;
	form.value = {
		...defaultField,
		...field,
	};
    if (field) {
        title.value = "编辑查询字段";
    } else {
        title.value = "添加查询字段";
    }
};

const closeDialog = () => {
	addFieldDialogVisible.value = false;
};

const confirmField = () => {
	formRef.value.validate((valid) => {
		if (valid) {
			emit("confirm", form.value);
			closeDialog();
		}
	});
};

defineExpose({
	openDialog,
	closeDialog,
});
</script>

<style scoped>
/* Styles here */
</style>
