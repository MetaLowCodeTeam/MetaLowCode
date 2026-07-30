<template>
	<div v-if="config">
		<el-form-item label="字体大小">
			<el-input-number v-model="config.fontSize" :min="1" :max="100" />
			<span class="unit">px</span>
		</el-form-item>
		<el-form-item label="单元格内边距">
			<el-input v-model="config.cellPadding" placeholder="2px 4px" />
		</el-form-item>
		<el-form-item label="边框宽度">
			<el-input-number v-model="config.borderWidth" :min="0" :max="20" />
			<span class="unit">px</span>
		</el-form-item>
		<el-form-item label="边框颜色">
			<el-color-picker v-model="config.borderColor" />
		</el-form-item>
		<el-form-item label="行高">
			<el-input-number v-model="config.rowHeight" :min="0" :max="200" />
			<span class="unit">px</span>
		</el-form-item>
		<el-form-item label="空值展示">
			<el-input v-model="config.emptyText" placeholder="留空则不展示" />
		</el-form-item>
		<el-form-item label="表格布局">
			<el-radio-group v-model="config.tableLayout">
				<el-radio-button value="fixed">固定</el-radio-button>
				<el-radio-button value="auto">自动</el-radio-button>
			</el-radio-group>
		</el-form-item>
	</div>
</template>

<script>
import {
	applyNativeReportTableStyle,
	COMPACT_REPORT_TABLE_CONFIG,
	normalizeReportTableConfig,
	syncNativeTableEmptyText,
} from "../../report-table-style";

export default {
	name: "reportTableConfig-editor",
	props: {
		selectedWidget: Object,
		optionModel: Object,
	},
	computed: {
		config() {
			return this.optionModel?.reportTableConfig;
		},
	},
	created() {
		if (!this.optionModel.reportTableConfig) {
			this.optionModel.reportTableConfig = normalizeReportTableConfig(null, COMPACT_REPORT_TABLE_CONFIG);
		}
	},
	watch: {
		config: {
			deep: true,
			handler() {
				this.$nextTick(() => {
					syncNativeTableEmptyText(this.selectedWidget);
					applyNativeReportTableStyle(this.selectedWidget);
				});
			},
		},
	},
};
</script>

<style scoped>
.unit {
	margin-left: 6px;
	color: #909399;
}
</style>
