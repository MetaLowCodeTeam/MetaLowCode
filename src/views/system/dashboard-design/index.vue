<template>
	<v-form-designer ref="vfDesigner" :designer-config="designerConfig"
					 class="visual-design">
		<!-- 配置工具按钮 -->
		<template #customToolButtons>
			<el-button type="primary" link @click="saveDesign"><el-icon><Finished /></el-icon>保存设计</el-button>
		</template>
	</v-form-designer>
</template>

<script>

export default {
	name: "dashboard-design",
	prop: {
	},
	data() {
		return {
			designerConfig: {
				formTemplates: false,
				logoHeader: false,
				exportCodeButton: false,
				generateSFCButton: false,
				toolbarMaxWidth: 300,
			},
		}
	},
	created() {

	},
	mounted() {

	},
	methods: {
		saveDesign() {
			this.$message.info('待实现...')
		},

	}
}
</script>

<style scoped>
:deep(.toolbar-header .toolbar-container) {
	width: 100%;
}

</style>
<style>
.main-container.visual-design li {
	box-sizing: content-box !important;
}

.ds-setting-drawer .el-drawer__body {
	padding: 20px !important;
}

</style>
