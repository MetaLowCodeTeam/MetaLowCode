<template>
	<ml-dialog
		:title="title"
		v-model="isShow"
		width="550"
		:show-close="!loading"
	>
		<el-form label-width="80px" v-loading="loading">
			<el-form-item label="版本名称" class="is-required">
				<el-input
					placeholder="请输入版本名称"
					v-model="formData.versionName"
					:class="{ 'is-error': nameError }"
					@focus="nameError = false"
					maxlength="10"
				/>
			</el-form-item>
			<el-form-item label="备注">
				<el-input
					type="textarea"
					placeholder="请输入备注"
					v-model="formData.remarks"
					:rows="3"
				/>
			</el-form-item>
		</el-form>
		<template #footer>
			<el-button type="primary" @click="handleSubmit" :loading="loading">
				确定
			</el-button>
			<el-button @click="isShow = false" :loading="loading">
				取消
			</el-button>
		</template>
	</ml-dialog>
</template>

<script setup>
import { ref } from "vue";
import { ElMessage } from "element-plus";
import { saveRecord } from "@/api/versioning";
const emit = defineEmits(["refresh"]);
let isShow = ref(false);
let title = ref("");
let formData = ref({});
let loading = ref(false);

let nameError = ref(false);

const openDialog = (data) => {
	formData.value = Object.assign({}, data);
	isShow.value = true;
	title.value = "版本" + (formData.value.versioningId ? "编辑" : "新建");
};

defineExpose({
	openDialog,
});

const handleSubmit = async () => {
	if (!formData.value.versionName) {
		nameError.value = true;
		ElMessage.error("版本名称不能为空");
		return;
	}
    loading.value = true;
    let res = await saveRecord(formData.value.versioningId, {
        versionName: formData.value.versionName,
        remarks: formData.value.remarks,
    });
    if (res) {
        ElMessage.success("保存成功");
        isShow.value = false;
        emit("refresh");
    }
    loading.value = false;
};
</script>

<style lang="scss" scoped>
.el-form-item {
	align-items: initial;
}
</style>
