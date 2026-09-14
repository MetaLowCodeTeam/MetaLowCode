<template>
	<el-dialog v-model="dialogVisible" title="关联模型" width="800px" class="model-association-dialog">
		<div class="header-row">
			<el-input
				v-model="searchText"
				placeholder="搜索名称或主模型"
				clearable
				@clear="handleSearch"
				@keyup.enter="handleSearch"
			/>
			<el-button type="primary" @click="openNewDialog">新建</el-button>
		</div>
		<el-table :data="tableData" v-loading="loading" border style="width: 100%">
			<el-table-column prop="modelAssociationLabel" label="名称" />
			<el-table-column label="主模型">
				<template #default="scope">
					{{ scope.row.mainModel?.name }}
				</template>
			</el-table-column>
			<el-table-column label="是否单条">
				<template #default="scope">
					{{ scope.row.isArray ? '是' : '否' }}
				</template>
			</el-table-column>
			<el-table-column label="操作" width="120" align="center">
				<template #default="scope">
					<el-button type="primary" size="small" link @click="editRow(scope.row)">编辑</el-button>
					<el-button type="primary" size="small" link @click="deleteRow(scope.row)">删除</el-button>
				</template>
			</el-table-column>
		</el-table>
		<div class="pagination-wrap">
			<el-pagination
				v-model:currentPage="pageConfig.currentPage"
				v-model:pageSize="pageConfig.pageSize"
				:page-sizes="[10, 20, 40, 80, 100]"
				:total="pageConfig.total"
				layout="total, sizes, prev, pager, next, jumper"
				@size-change="loadListData"
				@current-change="loadListData"
			/>
		</div>
	</el-dialog>
	<ModelAssociationEdit ref="modelAssociationEditRef" @updateList="loadListData" />
</template>

<script setup>
import { ref } from "vue";
import { ElMessageBox, ElMessage } from "element-plus";
import { crudListQuery } from "@/api/crud";
import http from "@/utils/request";
import ModelAssociationEdit from "./ModelAssociationEdit.vue";
const dialogVisible = ref(false);
const loading = ref(false);
const searchText = ref("");
const tableData = ref([]);
const subModelId = ref("");
const subModelName = ref("");

const pageConfig = ref({
	currentPage: 1,
	pageSize: 20,
	pageSizes: [10, 20, 40, 80, 100],
	total: 0,
});

const loadListData = async () => {
	loading.value = true;
	try {
		let filter = null;
		if (searchText.value) {
			filter = {
				equation: "OR",
				items: [
					{ fieldName: "modelAssociationLabel", op: "LK", value: searchText.value},
					{ fieldName: "mainModel.modelName", op: "LK", value: searchText.value},
				],
			};
		}
		let params = {
			mainEntity: "ModelAssociation",
			fieldsList: "modelAssociationLabel,mainModel,isArray",
			pageNo: pageConfig.value.currentPage,
			pageSize: pageConfig.value.pageSize,
			filter: filter,
			defaultFilter: {
				equation: "AND",
				items: [
					{ fieldName: "subModel", op: "EQ", value: subModelId.value },
				],
			},
			sortFields: [{ fieldName: "createdOn", type: "DESC" }],
		};
		let res = await http.post("/plugins/metaDataWarehouse/outerData/modelAssociation/listQuery", params);
		if (res?.code == 200) {
			tableData.value = res.data.dataList || [];
			pageConfig.value.total = res.data?.pagination?.total || 0;
		}
	} catch (error) {
		console.error(error);
	} finally {
		loading.value = false;
	}
};

const handleSearch = () => {
	pageConfig.value.currentPage = 1;
	loadListData();
};

const openDialog = (id, name) => {
	subModelId.value = id;
	subModelName.value = name;
	searchText.value = "";
	pageConfig.value.currentPage = 1;
	dialogVisible.value = true;
	loadListData();
};

const openNewDialog = () => {
	modelAssociationEditRef.value?.openDialog({
		subModelId: subModelId.value,
		subModelName: subModelName.value,
		editId: "",
	});
};

const editRow = (row) => {
	modelAssociationEditRef.value?.openDialog({
		subModelId: subModelId.value,
		subModelName: subModelName.value,
		editId: row.modelAssociationId,
		editLabel: row.modelAssociationLabel,
	});
};

const deleteRow = (row) => {
	ElMessageBox.confirm(`确定要删除"${row.modelAssociationLabel}"吗？`, "提示", {
		confirmButtonText: "确定",
		cancelButtonText: "取消",
		type: "warning",
	}).then(async () => {
		let res = await http.post("/plugins/metaDataWarehouse/outerData/modelAssociation/deleteRecord", null, {
			params: { modelAssociationId: row.modelAssociationId },
		});
		if (res?.code == 200) {
			ElMessage.success("删除成功");
			loadListData();
		}
	}).catch(() => {});
};

const modelAssociationEditRef = ref();
defineExpose({ openDialog });
</script>

<style scoped lang="scss">
.header-row {
	display: flex;
	gap: 12px;
	margin-bottom: 10px;
	.el-input {
		flex: 1;
	}
}
.pagination-wrap {
	display: flex;
	justify-content: center;
	margin-top: 16px;
}
</style>

<style lang="scss">
.model-association-dialog .el-dialog__header {
	border-bottom: none !important;
}
</style>
