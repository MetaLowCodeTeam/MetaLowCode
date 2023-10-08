<template>
	<v-form-designer ref="dbDesignerRef" :designer-config="designerConfig"
					 class="visual-design">
		<!-- 配置工具按钮 -->
		<template #customToolButtons>
			<el-button type="primary" link @click="clearCanvas"><el-icon><Delete /></el-icon>清空画布</el-button>
			<el-button type="primary" link @click="previewDesign"><el-icon><View /></el-icon>预览</el-button>
			<el-button type="primary" link @click="importJson">导入</el-button>
			<el-button type="primary" link @click="exportJson">导出</el-button>
			<el-button type="primary" link @click="saveDesign"><el-icon><Finished /></el-icon>保存设计</el-button>
		</template>
	</v-form-designer>
</template>

<script>
import VisualDesign from '@/../lib/visual-design/designer.umd.js'
import {dashboard_container_schema} from "@/views/system/dashboard-design/charts/charts-schema";
import {deepClone} from "@/utils/util";

const { Utils } = VisualDesign.VFormSDK

export default {
	name: "dashboard-design",
	prop: {
	},
	data() {
		return {
			designerConfig: {
				formTemplates: false,
				logoHeader: false,
				clearDesignerButton: false,
				previewFormButton: false,
				importJsonButton: false,
				exportJsonButton: false,
				exportCodeButton: false,
				generateSFCButton: false,
				toolbarMaxWidth: 300,
                chartLib: true
			},
		}
	},
	created() {

	},
	mounted() {

	},
	methods: {
		clearCanvas() {
			//清空后要插入dashboard-container!!
			const newDashboardCon = deepClone(dashboard_container_schema)
			newDashboardCon.id = 'dbCon' + Utils.generateId()
			newDashboardCon.options.name = newDashboardCon.id
			const blankFormJson = {
				widgetList: [ newDashboardCon ],
				formConfig: Utils.getDefaultFormConfig()
			}
			this.$refs.dbDesignerRef.setFormJson(blankFormJson)
		},

		previewDesign() {
			this.$refs.dbDesignerRef.previewForm()
		},

		importJson() {
			this.$refs.dbDesignerRef.importJson()
		},

		exportJson() {
			this.$refs.dbDesignerRef.exportJson()
		},

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

:deep(.vue-grid-layout) {
	min-height: 450px !important;
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
