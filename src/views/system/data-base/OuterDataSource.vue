<template>
	<!--  -->
	<ml-single-list
		title="外部数据源"
		mainEntity="OuterDataSource"
		fieldsList="dataSourceName,dataSourceType,dataSourceAccount,isDisabled,createdOn,createdBy"
		:sortFields="sortFields"
		fieldName="dataSourceName"
		:tableColumn="tableColumn"
		ref="mlSingleListRef"
        @changeSwitch="changeSwitch"
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
		@updateData="updateTable"
	/>
</template>

<script setup>
import { ref } from "vue";
import OuterDataSourceEdit from "./components/OuterDataSource-edit.vue";
// 查看详情
import mlCustomDetail from "@/components/mlCustomDetail/index.vue";
import { saveRecord } from "@/api/crud";
import { ElMessage } from "element-plus";
// 默认排序
let sortFields = ref([
	{
		fieldName: "createdOn",
		type: "DESC",
	},
]);
let tableColumn = ref([
	{
		prop: "dataSourceName",
		label: "数据源名称",
	},
	{
		prop: "dataSourceType",
		label: "数据源类型",
		formatter: (row) => {
			return row.dataSourceType?.label;
		},
	},
	{
		prop: "dataSourceAccount",
		label: "数据源账号",
	},
	{
		prop: "isDisabled",
		label: "启用",
        align: "center",
        customSlot: "switch",
        isNegation: true,
	},

	{
		prop: "createdOn",
		label: "创建时间",
		align: "center",
		formatter: (row) => {
			return row.createdOn;
		},
	},
	{
		prop: "createdBy",
		label: "创建人",
		align: "center",
		formatter: (row) => {
			return row.createdBy?.name;
		},
	},
]);

const outerDataSourceEditRef = ref();
const openDialog = (recordId) => {
    let data = {
        detailId: recordId,
        entityName: 'OuterDataSource',
    }
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

const changeSwitch = async (row) => {
    mlSingleListRef.value.loading = true;
    let res = await saveRecord("OuterDataSource", row.outerDataSourceId, {
        isDisabled: row.isDisabled ? true : false,
    });
    if(res){
        ElMessage.success("修改成功");
        mlSingleListRef.value.getTableList();
    }else {
        mlSingleListRef.value.loading = false;
    }
}
</script>
<style lang="scss" scoped></style>
