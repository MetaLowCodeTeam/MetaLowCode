<template>
	<!--  -->
	<ml-dialog 
        v-model="isShow" 
        :title="title" 
        width="500" 
        appendToBody 
        bodyNoPadding
    >
		<div 
            v-loading="loading" 
            element-loading-text="数据保存中..."
            class="main-body"
        >
			<el-form>
				<el-form-item label="父级目录">
					{{ curtForm.directoryLabel }}
				</el-form-item>
				<el-form-item 
                    label="上传文件" 
                    v-if="curtForm.fileType == 'file' && curtForm.operateType != 'edit'"
                >
					<ml-upload
						@on-success="onSuccess"
						class="ml-upload"
						uploadUrl="/file/upload"
                        skipMaxSize
					>
						<template #trigger>
							<el-button>
								<el-icon>
									<ElIconUpload />
								</el-icon>
								上传文件
							</el-button>
						</template>
					</ml-upload>
					<div class="w-100" v-if="curtForm.fileName">
						{{ curtForm.fileName }}
					</div>
				</el-form-item>
				<el-form-item
					:label="curtForm.fileType == 'file' ? '文件名称' : '目录名称'"
                    v-if="curtForm.operateType == 'edit' || curtForm.fileType !== 'file'"
				>
					<el-input
						v-model="curtForm.fileName"
						placeholder="请输入名称"
					/>
				</el-form-item>
			</el-form>
		</div>
		<template #footer>
			<el-button @click="isShow = false" :loading="loading">
				取消
			</el-button>
			<el-button type="primary" @click="confirm" :loading="loading">
				确定
			</el-button>
		</template>
	</ml-dialog>
</template>

<script setup>
import { ref } from "vue";
/**
 * API
 */
import { saveAttachment } from "@/api/attach";
import { ElMessage } from "element-plus";
const emit = defineEmits(["onSuccess"]);

let isShow = ref(false);
let title = ref("");
let loading = ref(false);

let curtForm = ref({});
const openDialog = (param) => {
    let actionText = param.operateType === 'edit' ? '编辑' : '新建';
    let fileTypeText = param.fileType === 'file' ? '文件' : '目录';
    title.value = `${actionText}${fileTypeText}`;
	isShow.value = true;
	curtForm.value = JSON.parse(JSON.stringify(param));
};

// 上传成功附件
const onSuccess = (data) => {
	curtForm.value = Object.assign(curtForm.value, {
		fileSize: data.fileSize,
		fileUrl: data.url,
		fileName: data.name,
	});
};

// 确认
const confirm = async () => {
	loading.value = true;
	let res = await saveAttachment(curtForm.value);
	if (res) {
		ElMessage.success("保存成功.");
        isShow.value = false;
		emit("onSuccess");
	}
	loading.value = false;
};

defineExpose({
	openDialog,
});
</script>
<style lang="scss" scoped>
.el-form-item {
	align-items: inherit;
}
.main-body {
    padding: 20px;
    padding-bottom: 10px;
}
</style>
