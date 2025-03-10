<template>
	<!--  -->
	<ml-single-list
		title="数据模型"
		mainEntity="OuterDataModel"
		fieldsList="modelName,dataSource,isDisabled,outerDataModelId"
		:sortFields="sortFields"
		fieldName="dataSourceName"
		:tableColumn="tableColumn"
		ref="mlSingleListRef"
        @highlightClick="viewDataList"
	>
		<template #addButton>
			<el-button type="primary" @click="openDialog()">新建</el-button>
		</template>
		<template #activeRow>
			<el-table-column
				label="操作"
				:align="'center'"
				width="160"
				fixed="right"
			>
				<template #default="scope">
					<el-button
						type="primary"
						size="small"
						link
						@click="openDialog(scope.row)"
						icon="Edit"
					>
						编辑
					</el-button>
					<el-button
						type="primary"
						size="small"
						link
						@click="openDialog(scope.row, 'view')"
					>
						查看
					</el-button>
					<el-button
						type="primary"
						size="small"
						link
						@click="deleteData(scope.row.outerDataModelId)"
					>
						删除
					</el-button>

				</template>
			</el-table-column>
		</template>
	</ml-single-list>
	<OuterDataModelEdit ref="outerDataModelEditRef" @updateData="updateTable" />
</template>

<script setup>
import { ref } from "vue";
import { ElMessageBox, ElMessage } from "element-plus";
import OuterDataModelEdit from "./components/OuterDataModel-edit.vue";
import { deleteRecords } from "@/api/crud";
import { useRouter } from "vue-router";
const router = useRouter();
// 默认排序
let sortFields = ref([
	{
		fieldName: "modifiedOn",
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
    {
        prop: "outerDataModelId",
        label: "数据列表",
        width: 120,
        align: "center",
        highlight: true,
        formatter: (row) => {
            return "查看";
        },
    },
]);

// 查看编辑
const outerDataModelEditRef = ref();
const openDialog = (row, type) => {
	let titlePrefix =
		type === "view"
			? "查看："
			: row && row.outerDataModelId
			? "编辑："
			: "新建：";
	let data = {
		title: titlePrefix + (row ? row.modelName : "数据模型"),
		detailId: row && row.outerDataModelId ? row.outerDataModelId : null,
		entityName: "OuterDataModel",
		type: type,
	};
	outerDataModelEditRef.value?.openDialog(data);
};

// 删除
const deleteData = (id) => {
	// console.log(id);
	ElMessageBox.confirm("确定要删除吗？", "提示", {
		confirmButtonText: "确定",
		cancelButtonText: "取消",
		type: "warning",
	})
		.then(async () => {
			let param = {
				recordIds: [id],
				cascades: [],
			};
			mlSingleListRef.value.loading = true;
			let res = await deleteRecords(param);
			if (res) {
				ElMessage.success("删除成功");
				updateTable();
			}
		})
		.catch(() => {
			console.log("取消");
		});
};

// 查看数据列表
const viewDataList = (row) => {
    const appPath = import.meta.env.VITE_APP_PATH;
    // console.log(row,'row');
    router.push({
        path: `${appPath}data-model-query`,
        query: {
            outerDataModelId: row.outerDataModelId,
            routerName: row.modelName,
        }
    });

}

// 更新数据
const mlSingleListRef = ref();
const updateTable = () => {
	mlSingleListRef.value?.getTableList();
};
</script>
<style lang="scss" scoped></style>
