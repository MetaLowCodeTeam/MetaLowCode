<template>
	<ml-dialog title="自定义组件设置" v-model="isShow" width="500" append-to-body>
		<div>
			<el-form
				:model="formData"
				label-width="78px"
				ref="formRef"
				:rules="rules"
			>
				<el-form-item
					label="页签名称"
					prop="entityLabel"
					style="margin-bottom: 18px !important"
				>
					<el-input
						v-model="formData.entityLabel"
						placeholder="请输入页签名称"
						clearable
					/>
				</el-form-item>
				<el-form-item
					label="组件名称"
					prop="componentName"
					style="margin-bottom: 14px !important"
				>
					<el-input
						v-model="formData.componentName"
						placeholder="请输入组件名称"
						clearable
					/>
				</el-form-item>
				<el-form-item>
					<el-checkbox
						label="是否在PC端显示"
						v-model="formData.pcShow"
					/>
					<el-checkbox
						label="是否在移动端显示"
						v-model="formData.mobileShow"
					/>
				</el-form-item>
			</el-form>
		</div>
		<template #footer>
			<el-button @click="isShow = false">取消</el-button>
			<el-button type="primary" @click="confirm">确认</el-button>
		</template>
	</ml-dialog>
</template>
<script setup>
import { ref } from "vue";

const emits = defineEmits(["confirm"]);

const isShow = ref(false);

let formData = ref({
	entityLabel: "",
	entityName: "detail_custom_component_pc",
	componentName: "",
	isCustomComponent: true,
	pcShow: true,
	mobileShow: false,
});

let formRef = ref();

const rules = ref({
	entityLabel: [
		{ required: true, message: "请输入页签名称", trigger: "blur" },
	],
	componentName: [
		{ required: true, message: "请输入组件名称", trigger: "blur" },
	],
});

const openDialog = () => {
	isShow.value = true;
	formData.value.entityLabel = "";
	formData.value.componentName = "";
	formData.value.pcShow = true;
	formData.value.mobileShow = false;
};

const confirm = () => {
	formRef.value.validate((valid) => {
		if (valid) {
			emits("confirm", JSON.parse(JSON.stringify(formData.value)));
			isShow.value = false;
		}
	});
};

defineExpose({
	openDialog,
});
</script>
