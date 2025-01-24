<style lang="scss" scoped>
.file-table {
	font-size: 14px !important;
}
</style>
<template>
	<ml-dialog
		title="文件下载和预览"
		v-model="isShow"
		width="600px"
		append-to-body
	>
		<el-table :data="filesList" :border="true" class="file-table">
			<el-table-column prop="name" label="文件名" />
			<el-table-column label="操作" width="160" :align="'center'">
				<template #default="scope">
					<el-button
						type="primary"
						link
						icon="Download"
						@click="downField(scope.row.url, scope.row.name)"
					>
						下载
					</el-button>
					<el-button
						type="primary"
						link
						icon="View"
						v-if="isPreview(scope.row.url)"
						@click="previewField(scope.row.url, scope.row.name)"
					>
						预览
					</el-button>
					<el-tooltip
						content="仅支持：docx、xlsx、pdf、pptx文件预览"
						placement="top"
						v-else
					>
						<el-button type="primary" link icon="View" disabled>
							预览
						</el-button>
					</el-tooltip>
				</template>
			</el-table-column>
		</el-table>
	</ml-dialog>
</template>
<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
let isShow = ref(false);

let filesList = ref([]);

const openDialog = (files) => {
	filesList.value = JSON.parse(JSON.stringify(files));
	isShow.value = true;
	console.log(filesList.value);
};

const downField = (url, fileName) => {
	window.open(
		import.meta.env.VITE_APP_BASE_API + url + "?fileName=" + fileName
	);
};

// 可预览文件类型
const previewType = ["docx", "xlsx", "pdf", "pptx"];

// 判断是否是预览
const isPreview = (url) => {
	return previewType.includes(url.split(".").pop());
};

const previewField = (src) => {
	let url = router.resolve({
		name: "FilePreview",
		query: {
			url: src,
		},
	});
	window.open(url.href);
};

defineExpose({
	openDialog,
});
</script>
