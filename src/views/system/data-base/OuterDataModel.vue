<template>
	<!--  -->
	<ml-single-list
		title="数据模型"
		mainEntity="OuterDataModel"
		fieldsList="modelName,dataSource,isDisabled"
		:sortFields="sortFields"
		fieldName="dataSourceName"
		:tableColumn="tableColumn"
		ref="mlSingleListRef"
	>
		<template #addButton>
			<el-button type="primary" @click="openDialog(null)">新建</el-button>
		</template>
		<template #activeRow>
			<el-table-column
				label="操作"
				:align="'center'"
				width="130"
				fixed="right"
			>
				<template #default="scope">
					<el-button
						type="primary"
						size="small"
						link
						@click="openDialog(scope.row.outerDataSourceId)"
						icon="Edit"
					>
						编辑
					</el-button>
					<el-button
						type="primary"
						size="small"
						link
						@click="openDetail(scope.row.outerDataSourceId)"
					>
						查看
					</el-button>
				</template>
			</el-table-column>
		</template>
	</ml-single-list>
	<OuterDataSourceEdit
		ref="outerDataSourceEditRef"
		@onConfirm="updateTable"
	/>
	<!-- 详情 -->
	<mlCustomDetail
		ref="detailRefs"
		entityName="OuterDataSource"
		@updateData="getTableList"
	/>
</template>

<script setup>
import { ref } from "vue";
import OuterDataSourceEdit from "./components/OuterDataSource-edit.vue";
// 查看详情
import mlCustomDetail from "@/components/mlCustomDetail/index.vue";
// 默认排序
let sortFields = ref([
	{
		fieldName: "createdOn",
		type: "DESC",
	},
]);
let tableColumn = ref([
	{
		prop: "modelName",
		label: "模型名称",
	},
	{
		prop: "dataSource",
		label: "数据源",
		formatter: (row) => {
			return row.dataSource?.name;
		},
	},
	{
		prop: "isDisabled",
		label: "是否禁用",
		formatter: (row) => {
			return row.isDisabled ? "是" : "否";
		},
	},
]);

const outerDataSourceEditRef = ref();
const openDialog = (recordId) => {
	let data = {
		detailId: recordId,
		entityName: "OuterDataModel",
	};
	outerDataSourceEditRef.value?.openDialog(data);
};

const detailRefs = ref();
const openDetail = (recordId) => {
	detailRefs.value?.openDialog(recordId);
};

const mlSingleListRef = ref();
const updateTable = () => {
	mlSingleListRef.value?.getTableList();
};
</script>
<style lang="scss" scoped></style>
