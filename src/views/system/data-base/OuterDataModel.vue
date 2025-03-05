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
			<el-button type="primary" @click="openDialog()">新建</el-button>
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
	<OuterDataModelEdit
		ref="outerDataModelEditRef"
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
import OuterDataModelEdit from "./components/OuterDataModel-edit.vue";
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

const outerDataModelEditRef = ref();
const openDialog = (row) => {
    console.log(row, 'row')
	let data = {
        title: row && row.outerDataModelId ? '编辑：' + row.modelName : '新建：数据模型',
		detailId: row && row.outerDataModelId ? row.outerDataModelId : null,
		entityName: "OuterDataModel",
	};
	outerDataModelEditRef.value?.openDialog(data);
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
