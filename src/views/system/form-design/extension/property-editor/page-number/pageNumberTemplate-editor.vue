<template>
	<el-form-item label="页码内容">
		<div class="page-number-template-editor">
			<el-input
				v-model="optionModel.pageNumberTemplate"
				type="textarea"
				:rows="3"
				maxlength="100"
				show-word-limit
			/>
			<div class="page-number-template-editor__tokens">
				<el-button size="small" @click="insertToken('{page}')">当前页码</el-button>
				<el-button size="small" @click="insertToken('{sectionPages}')">本节总页数</el-button>
				<el-button size="small" @click="insertToken('{totalPages}')">文档总页数</el-button>
			</div>
			<div class="page-number-template-editor__hint">
				示例：第 {page} 页，共 {sectionPages} 页
			</div>
		</div>
	</el-form-item>
</template>

<script>
export default {
	name: 'page-number-pageNumberTemplate-editor',
	props: {
		optionModel: Object,
	},
	methods: {
		insertToken(token) {
			this.optionModel.pageNumberTemplate = `${this.optionModel.pageNumberTemplate || ''}${token}`
		},
	},
}
</script>

<style scoped>
.page-number-template-editor {
	width: 100%;
	min-width: 0;
}

.page-number-template-editor__tokens {
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: 6px;
	width: 100%;
	margin-top: 8px;
}

.page-number-template-editor__tokens :deep(.el-button) {
	width: 100%;
	margin: 0;
	padding-right: 6px;
	padding-left: 6px;
}

.page-number-template-editor__tokens :deep(.el-button:last-child) {
	grid-column: 1 / -1;
}

.page-number-template-editor__hint {
	width: 100%;
	margin-top: 8px;
	color: #909399;
	font-size: 12px;
	line-height: 1.4;
	word-break: break-word;
}
</style>
