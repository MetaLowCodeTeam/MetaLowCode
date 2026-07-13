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
		<el-table :data="filesList" :border="true" class="file-table" max-height="400">
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
						v-if="isPreview(scope.row.url, scope.row.name)"
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
};

const downField = (url, fileName) => {
	window.open(
		import.meta.env.VITE_APP_BASE_API + url + "?fileName=" + fileName
	);
};

// 可预览文件类型
const previewType = ["docx", "xlsx", "pdf", "pptx"];

const getFileExtension = (url, fileName) => {
	const getExtension = (value) => {
		if (!value) {
			return "";
		}
		const cleanValue = value.split("?")[0].split("#")[0];
		const lastDotIndex = cleanValue.lastIndexOf(".");
		if (lastDotIndex === -1 || lastDotIndex === cleanValue.length - 1) {
			return "";
		}
		return cleanValue.slice(lastDotIndex + 1).toLowerCase();
	};

	return getExtension(url) || getExtension(fileName);
};

// 判断是否是预览
const isPreview = (url, fileName) => {
	return previewType.includes(getFileExtension(url, fileName));
};

const previewField = (src, fileName) => {
	const type = getFileExtension(src, fileName);
	let url = router.resolve({
		name: "FilePreview",
		query: {
			url: src,
			type,
		},
	});
	window.open(url.href);
};

defineExpose({
	openDialog,
});
</script>
