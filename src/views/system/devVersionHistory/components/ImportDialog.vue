<style lang="scss" scoped>
.ml-upload {
	display: inline-block;
}
.file-name-span {
	position: relative;
	top: -1px;
	font-weight: bold;
	text-decoration: underline;
	margin-left: 15px;
}
</style>
<template>
	<ml-dialog
		:title="title"
		v-model="isShow"
		width="550"
		:show-close="!loading"
	>
		<div v-loading="loading">
			<ml-upload
				accept=".sql"
				customUpload
				@on-custom-upload="onCustomUpload"
				class="ml-upload"
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
			<span class="file-name-span" v-if="fromData.originalFilename">
				{{ fromData.originalFilename }}
			</span>
		</div>
		<template #footer>
			<el-button type="primary" @click="handleImport" :loading="loading">
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
import { upgradeDevelopSql } from "@/api/devVersionHistory";
import { ElMessage, ElMessageBox } from "element-plus";
import useCommonStore from "@/store/modules/common";
const { setPublicSettingByKey } = useCommonStore();
const emit = defineEmits(["refresh"]);
let isShow = ref(false);
let title = ref("");
let loading = ref(false);
let fromData = ref({});
const openDialog = async () => {
	isShow.value = true;
	title.value = "版本导入";
    fromData.value = {};
};




const onCustomUpload = (data) => {
	fromData.value.file = data;
	fromData.value.originalFilename = data.name;
};

const handleImport = async () => {
    
	if (!fromData.value.file) {
		ElMessage.error("请先上传文件");
		return;
	}
	let formData = new FormData();
	formData.append("file", fromData.value.file);
    loading.value = true;
	let res = await upgradeDevelopSql(formData, {
		headers: { "Content-Type": "multipart/form-data" },
	});
    if(res) {
        setPublicSettingByKey("developSqlVersion", res.data);
        ElMessageBox.confirm('导入成功！', '提示', {
            confirmButtonText: '确认并刷新',
            showCancelButton: false,
            showClose: false,
            closeOnClickModal: false,
            closeOnPressEscape: false,
            type: 'success',
        }).then(async () => {
            window.location.reload();
        }).catch(() => {
            // 取消
        })
        isShow.value = false;
    }
    loading.value = false;
};

defineExpose({
	openDialog,
});

</script>
