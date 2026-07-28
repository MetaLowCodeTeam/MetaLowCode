<template>
	<div class="data-model-report-list-page">
		<ml-single-list
			ref="mlSingleListRef"
			title="数据模型报表"
			mainEntity="DataModelReport"
			fieldsList="dataModelReportId,reprotName,reportName"
			fieldName="reprotName,reportName"
			:tableColumn="tableColumn"
			:sortFields="sortFields"
			queryUrl="/plugins/metaDataWarehouse/outerData/modelReport/listQuery"
		>
			<template #activeRow>
				<el-table-column label="操作" align="center" width="180" fixed="right">
					<template #default="scope">
						<el-button link type="primary" @click="goDesign(scope.row)">报表设计</el-button>
						<el-button link type="primary" @click="deleteRow(scope.row)">删除</el-button>
					</template>
				</el-table-column>
			</template>
		</ml-single-list>
	</div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import http from "@/utils/request";

const router = useRouter();
const appPath = import.meta.env.VITE_APP_PATH;
const mlSingleListRef = ref();

const sortFields = ref([
	{
		fieldName: "createdOn",
		type: "DESC",
	},
]);

const tableColumn = ref([
	{
		prop: "reprotName",
		label: "报表名称",
		formatter: (row) => row.reprotName || row.reportName || "",
	},
]);

const goDesign = (row) => {
	router.push({
		path: `${appPath}data-model-report`,
		query: {
			dataModelReportId: row.dataModelReportId,
			customRouteTitle: `可视化表单设计 - ${row.reprotName || row.reportName || ""}`,
		},
	});
};

const deleteRow = (row) => {
	ElMessageBox.confirm(`确定要删除"${row.reprotName || row.reportName || ""}"吗？`, "提示", {
		confirmButtonText: "确定",
		cancelButtonText: "取消",
		type: "warning",
	}).then(async () => {
		const res = await http.post("/plugins/metaDataWarehouse/outerData/modelReport/deleteRecord", null, {
			params: {
				dataModelReportId: row.dataModelReportId,
			},
		});
		if (res?.code === 200) {
			ElMessage.success("删除成功");
			mlSingleListRef.value?.getTableList?.();
		}
	}).catch(() => {});
};
</script>

<style scoped lang="scss">
.data-model-report-list-page {
	height: 100%;
	background: #fff;
}
</style>
