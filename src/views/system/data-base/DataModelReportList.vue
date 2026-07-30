<template>
	<div class="data-model-report-list-page">
		<ml-single-list
			ref="mlSingleListRef"
			title="数据模型报表"
			mainEntity="DataModelReport"
			fieldsList="dataModelReportId,reportName,reportName,modelConfig"
			fieldName="reportName"
			:tableColumn="tableColumn"
			:sortFields="sortFields"
			queryUrl="/plugins/metaDataWarehouse/outerData/modelReport/listQuery"
		>
			<template #addButton>
				<el-button type="primary" :icon="Plus" @click="openReportEdit()">新建</el-button>
			</template>
			<template #activeRow>
				<el-table-column label="操作" align="center" width="360" fixed="right">
					<template #default="scope">
						<div class="report-actions">
							<el-button
								link
								type="primary"
								:icon="EditPen"
								@click="goDesign(scope.row)"
							>
								报表设计
							</el-button>
							<el-button
								class="example-code-button"
								link
								type="primary"
								:icon="DocumentCopy"
								:loading="exampleLoadingId === scope.row.dataModelReportId"
								:disabled="!!exampleLoadingId && exampleLoadingId !== scope.row.dataModelReportId"
								@click="showExampleCode(scope.row)"
							>
								调用代码示例
							</el-button>
							<el-button link type="primary" :icon="Edit" @click="openReportEdit(scope.row)">
								编辑
							</el-button>
							<el-button
								link
								type="primary"
								:icon="Delete"
								@click="deleteRow(scope.row)"
							>
								删除
							</el-button>
						</div>
					</template>
				</el-table-column>
			</template>
		</ml-single-list>
		<el-dialog
			v-model="exampleDialogVisible"
			:title="exampleDialogTitle"
			width="min(960px, calc(100vw - 32px))"
			append-to-body
			destroy-on-close
		>
			<div
				class="example-code-content"
				v-loading="exampleCodeLoading"
				element-loading-text="正在生成调用代码示例..."
			>
				<ml-code-editor
					v-model="exampleCode"
					mode="javascript"
					height="60vh"
					disabled
				/>
			</div>
			<template #footer>
				<el-button
					type="primary"
					:icon="CopyDocument"
					:disabled="exampleCodeLoading || !exampleCode"
					@click="copyExampleCode"
				>
					复制代码
				</el-button>
				<el-button :icon="Close" @click="exampleDialogVisible = false">关闭</el-button>
			</template>
		</el-dialog>
		<ml-custom-edit ref="reportEditRef" name-field-name="reportName" @on-confirm="refreshTable" />
	</div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import { Close, CopyDocument, Delete, DocumentCopy, Edit, EditPen, Plus } from "@element-plus/icons-vue";
import mlCodeEditor from "@/components/mlCodeEditor/index.vue";
import mlCustomEdit from "@/components/mlCustomEdit/index.vue";
import { deleteRecord } from "@/api/crud";
import http from "@/utils/request";
import { copyText } from "@/utils/util";

const router = useRouter();
const appPath = import.meta.env.VITE_APP_PATH;
const mlSingleListRef = ref();
const exampleDialogVisible = ref(false);
const exampleDialogTitle = ref("调用代码示例");
const exampleCode = ref("");
const exampleCodeLoading = ref(false);
const exampleLoadingId = ref("");
const reportEditRef = ref();

const sortFields = ref([
	{
		fieldName: "createdOn",
		type: "DESC",
	},
]);

const tableColumn = ref([
	{
		prop: "reportName",
		label: "报表名称",
		formatter: (row) => row.reportName || "",
	},
]);

const goDesign = (row) => {
	router.push({
		path: `${appPath}data-model-report`,
		query: {
			dataModelReportId: row.dataModelReportId,
			customRouteTitle: `可视化表单设计 - ${row.reportName || ""}`,
		},
	});
};

const openReportEdit = (row) => {
	reportEditRef.value?.openDialog({
		entityName: "DataModelReport",
		detailId: row?.dataModelReportId,
		customDialogConfig: {
			width: "500px",
		},
		showFooterButtonConfig: {
			showConfirmRefreshBtn: false,
		},
	});
};

const refreshTable = () => {
	mlSingleListRef.value?.getTableList?.();
};

const parseModelConfig = (modelConfig) => {
	if (!modelConfig) return [];
	const config = typeof modelConfig === "string" ? JSON.parse(modelConfig) : modelConfig;
	if (!Array.isArray(config)) return [];
	return config.filter((item) => item?.dataCode && item?.mainModel);
};

const getModelId = (model) => {
	return model?.outerDataModelId || model?.outerDataModel?.id || model?.id;
};

const getParamType = (param) => {
	return Number(param?.paramType?.value ?? param?.paramType);
};

const formatParamValue = (param) => {
	const value = param?.defaultValue;
	if (value !== undefined && value !== null && value !== "") {
		return JSON.stringify(value);
	}
	return [2, 3, 4].includes(getParamType(param)) ? "null" : '""';
};

const escapeComment = (value) => {
	return String(value || "").replace(/\r?\n/g, " ");
};

const buildParamMapCode = (model) => {
	const modelParams = model?.ModelParam || model?.modelParam || [];
	if (!Array.isArray(modelParams) || !modelParams.length) {
		return "    \"paramMap\": {}";
	}
	const lines = modelParams
		.filter((param) => param?.paramName)
		.map((param) => {
			const comment = escapeComment(param.paramLabel || param.paramName);
			return `      // ${comment}\n      ${JSON.stringify(param.paramName)}: ${formatParamValue(param)}`;
		});
	if (!lines.length) {
		return "    \"paramMap\": {}";
	}
	return `    "paramMap": {\n${lines.join(",\n")}\n    }`;
};

const buildExampleCode = (row, modelConfig, modelMap) => {
	const paramItems = modelConfig.map((config) => {
		const model = modelMap[config.mainModel] || {};
		return [
			"  {",
			`    "dataCode": ${JSON.stringify(config.dataCode)},`,
			`    "modelId": ${JSON.stringify(config.mainModel)},`,
			`    "modelName": ${JSON.stringify(config.modelAssociationLabel || model.modelName || "")},`,
			`    "isArray": ${!!config.isArray},`,
			buildParamMapCode(model),
			"  }",
		].join("\n");
	});

	return `// 配置导出文件名（无需添加 .docx 或 .pdf 后缀）
let fileName = ${JSON.stringify(row.reportName || "数据模型报表")};
// 配置 A4 页面方向：false 为竖版，true 为横版
let landscape = false;
// 配置你的数据模型报表 id
let dataModelReportId = ${JSON.stringify(row.dataModelReportId)};
// 配置你的入参（只需要修改 paramMap）
let param = [
${paramItems.join(",\n")}
];
let { ElLoading } = exposed.elementEvent;
const checkLoading = ElLoading.service({
  lock: true,
  text: "Loading",
  background: "rgba(0, 0, 0, 0.7)",
});
let api = "/plugins/metaDataWarehouse/outerData/modelReport/cacheQueryModelDataBodyList";
exposed.http.post(api, param).then(res => {
  if (res?.code == 200) {
    let mainModelDataId = res.data;
    const appPath = exposed.appPath;
    // query 参数由 Vue Router 自动编码，查看页读取时会自动解码
    let newUrl = exposed.router.resolve({
      path: appPath + "data-model-report-view",
      query: {
        dataModelReportId,
        mainModelDataId,
        fileName,
        landscape,
      },
    });
    window.open(newUrl.href);
  }
  checkLoading.close();
}).catch(err => {
  console.info(err);
  checkLoading.close();
});`;
};

const showExampleCode = async (row) => {
	let modelConfig = [];
	try {
		modelConfig = parseModelConfig(row.modelConfig);
	} catch (error) {
		console.error("modelConfig parse error", error);
		ElMessage.error("模型配置格式错误，无法生成调用代码示例");
		return;
	}
	if (!modelConfig.length) {
		ElMessage.warning("当前报表尚未配置数据模型");
		return;
	}

	exampleDialogTitle.value = `调用代码示例 - ${row.reportName || "数据模型报表"}`;
	exampleCode.value = "";
	exampleDialogVisible.value = true;
	exampleCodeLoading.value = true;
	exampleLoadingId.value = row.dataModelReportId;
	try {
		const modelIds = modelConfig.map((item) => item.mainModel);
		const res = await http.post(
			"/plugins/metaDataWarehouse/outerData/modelReport/queryModelAndChildren",
			modelIds
		);
		if (res?.code !== 200 || !Array.isArray(res.data)) {
			ElMessage.error("模型信息查询失败，请稍后重试");
			exampleDialogVisible.value = false;
			return;
		}
		const modelMap = {};
		res.data.forEach((model) => {
			const modelId = getModelId(model);
			if (modelId) modelMap[modelId] = model;
		});
		exampleCode.value = buildExampleCode(row, modelConfig, modelMap);

		const missingCount = modelConfig.filter((item) => !modelMap[item.mainModel]).length;
		if (missingCount) {
			ElMessage.warning(`${missingCount} 个模型未查询到参数，已生成空 paramMap`);
		}
	} catch (error) {
		console.error("example code generate error", error);
		ElMessage.error("调用代码示例生成失败，请稍后重试");
		exampleDialogVisible.value = false;
	} finally {
		exampleCodeLoading.value = false;
		exampleLoadingId.value = "";
	}
};

const copyExampleCode = () => {
	if (!exampleCode.value) {
		ElMessage.warning("暂无可复制内容");
		return;
	}
	copyText(exampleCode.value, "复制失败");
};

const deleteRow = (row) => {
	ElMessageBox.confirm(`确定要删除"${row.reportName || ""}"吗？`, "提示", {
		confirmButtonText: "确定",
		cancelButtonText: "取消",
		type: "warning",
	}).then(async () => {
		const res = await deleteRecord(row.dataModelReportId);
		if (res) {
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

.example-code-content {
	min-height: 60vh;
}

.report-actions {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 12px;
	white-space: nowrap;

	:deep(.el-button + .el-button) {
		margin-left: 0;
	}
}

.example-code-button {
	min-width: 112px;
}
</style>
