<template>
	<!--  -->
	<ml-dialog
		:title="dialogConf.title"
		v-model="dialogConf.show"
		width="500"
		:showClose="!dialogConf.loading"
	>
		<el-form
			label-width="80px"
			v-loading="dialogConf.loading"
			:element-loading-text="dialogConf.loadingText"
			@submit.prevent
			class="action-form"
			:rules="rules"
			:model="formData"
			ref="ruleFormRef"
		>
			<el-form-item
				label="转化名称"
				prop="transformName"
				v-if="!props.isSubTransform"
				class="mb-15"
			>
				<el-input
					v-model="formData.transformName"
					placeholder="请输入转化名称"
					clearable
				></el-input>
			</el-form-item>
			<el-form-item label="源实体" prop="sourceEntity" class="mb-15">
				<el-select
					v-model="formData.sourceEntity"
					placeholder="请选择源实体"
					filterable
					style="width: 100%"
					:disabled="!!dialogConf.recordId"
					clearable
				>
					<el-option
						:label="op.label"
						:value="op.name"
						v-for="(op, inx) of getSourceEntityList()"
						:key="inx"
					/>
				</el-select>
			</el-form-item>
			<el-form-item label="目标实体" prop="targetEntity" class="mb-15">
				<el-select
					v-model="formData.targetEntity"
					placeholder="请选择目标实体"
					filterable
					style="width: 100%"
					:disabled="!!dialogConf.recordId"
					clearable
				>
					<el-option
						:label="op.label"
						:value="op.name"
						v-for="(op, inx) of getTargetEntityList()"
						:key="inx"
					/>
				</el-select>
			</el-form-item>
			<el-form-item
				label="启用"
				v-if="!!dialogConf.recordId"
                class="mb-0"
			>
				<el-switch
					:active-value="false"
					:inactive-value="true"
					v-model="formData.disabled"
				/>
			</el-form-item>
		</el-form>
		<template #footer>
			<el-button
				:loading="dialogConf.loading"
				@click="dialogConf.show = false"
				>取消</el-button
			>
			<el-button
				type="primary"
				@click="submitForm(ruleFormRef)"
				:loading="dialogConf.loading"
			>
				确认
			</el-button>
		</template>
	</ml-dialog>
</template>

<script setup>
import { reactive, ref } from "vue";
/**
 * 所有实体
 */
import useCommonStore from "@/store/modules/common";
import { storeToRefs } from "pinia";
import { ElMessage } from "element-plus";
import { saveTransform } from "@/api/transform";

const { unSystemEntityList } = storeToRefs(useCommonStore());

const emits = defineEmits(["saveFinish"]);

const props = defineProps({
	// 是否添加子表转换
	isSubTransform: {
		type: Boolean,
		default: false,
	},
});



// 子表转换
let subTransformData = reactive({
	sourceEntity: "",
	targetEntity: "",
});

// 获取实体
const getSourceEntityList = () => {
	if (props.isSubTransform) {
		return unSystemEntityList.value.filter(
			(el) =>
				el.detailEntityFlag &&
				!el.appAbbr &&
				el.mainEntityName == subTransformData.sourceEntity
		);
	}
	return unSystemEntityList.value.filter(
		(el) => !el.appAbbr
	);
};

const getTargetEntityList = () => {
	if (props.isSubTransform) {
		return unSystemEntityList.value.filter(
			(el) =>
				el.detailEntityFlag &&
				!el.appAbbr &&
				el.mainEntityName == subTransformData.targetEntity
		);
	}
	return unSystemEntityList.value.filter(
		(el) => !el.detailEntityFlag && !el.appAbbr
	);
};

// 弹框配置
let dialogConf = ref({
	show: false,
	loading: false,
	loadingText: "数据保存中...",
	title: "",
	recordId: "",
});
// 默认表单数据-打开弹框时清理
let defaultFormData = reactive({
	transformName: "",
	sourceEntity: "",
	targetEntity: "",
	disabled: false,
	isPreview: false,
});
// 表单数据
let formData = reactive({});
// 表单Ref
let ruleFormRef = ref();
// 表单校验
const rules = reactive({
	transformName: [
		{
			required: true,
			message: "请输入转化名称",
			trigger: "blur",
		},
	],
	sourceEntity: [
		{
			required: true,
			message: "请选择源实体",
			trigger: "change",
		},
	],
	targetEntity: [
		{
			required: true,
			message: "请选择目标实体",
			trigger: "change",
		},
	],
});

// 打开弹框
const openDialog = (row) => {
    // 默认ID空
	dialogConf.value.recordId = "";
	// 清空数据
	formData = Object.assign(formData, defaultFormData);
	if (props.isSubTransform) {
		dialogConf.value.title = row.title;
		dialogConf.value.show = true;
		subTransformData.sourceEntity = row.sourceEntity;
		subTransformData.targetEntity = row.targetEntity;
		return;
	}
	
	// 如果是编辑
	if (!!row) {
		// 赋值ID
		dialogConf.value.recordId = row.transformId;
		// 覆盖数据
		for (const key in formData) {
			if (Object.hasOwnProperty.call(formData, key)) {
				formData[key] = row[key];
			}
		}
	}
	dialogConf.value.title = (!!row ? "编辑" : "新建") + "数据转化";
	dialogConf.value.show = true;
};

// 提交表单
const submitForm = (formEl) => {
	if (!formEl) return;
	formEl.validate(async (valid) => {
		if (valid) {
			if (props.isSubTransform) {
				emits("saveFinish", formData);
                dialogConf.value.show = false;
				return;
			}
			doSave(dialogConf.value.recordId, formData);
		} else {
			console.log("error submit!");
		}
	});
};
// 执行保存
const doSave = async (recordId, data, msg) => {
	dialogConf.value.loading = true;
	let res = await saveTransform(data, {
		params: {
			entity: "Transform",
			recordId: recordId,
		},
	});
	// saveRecord('Transform', recordId, data)
	if (res) {
		ElMessage.success(msg || "保存成功");
		emits("saveFinish");
		dialogConf.value.show = false;
	}
	dialogConf.value.loading = false;
};

defineExpose({
	openDialog,
	doSave,
});
</script>
<style lang="scss" scoped>
.action-form {
	.el-form-item {
		// margin-top: 0 !important;
	}
}
</style>
