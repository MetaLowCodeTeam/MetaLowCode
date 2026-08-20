<template>
	<div class="outer-data-model-page">
		<ml-single-list
			:key="activeModelTab"
			mainEntity="OuterDataModel"
			fieldsList="modelName,dataSource,tags,ownerUser,ownerDepartment,isDisabled,outerDataModelId"
			:sortFields="sortFields"
			fieldName="dataSourceName"
			equation="OR"
			:tableColumn="tableColumn"
			:fixedFilter="modelTypeFilters[activeModelTab]"
			ref="mlSingleListRef"
			@highlightClick="viewDataList"
			@changeSwitch="changeSwitch"
		>
			<template #title>
				<el-tabs v-model="activeModelTab" class="model-type-tabs">
					<el-tab-pane label="常规模型" name="regular" />
					<el-tab-pane label="自定义模型" name="custom" />
				</el-tabs>
			</template>
			<template #addButton>
				<el-button type="primary" @click="openDialog()">新建</el-button>
			</template>
			<template #activeRow>
				<el-table-column
					label="操作"
					:align="'center'"
					width="190"
					fixed="right"
				>
					<template #default="scope">
						<div class="table-row-actions">
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
							<el-dropdown
								trigger="click"
								@command="(command) => handleMoreCommand(command, scope.row)"
							>
								<el-button type="primary" size="small" link>
									<el-icon class="mr-3"><ElIconMoreFilled /></el-icon>
									更多
								</el-button>
								<template #dropdown>
									<el-dropdown-menu>
										<el-dropdown-item command="delete">删除</el-dropdown-item>
										<el-dropdown-item command="allocation">分配</el-dropdown-item>
										<el-dropdown-item command="share">共享</el-dropdown-item>
										<el-dropdown-item command="unShare">取消共享</el-dropdown-item>
									</el-dropdown-menu>
								</template>
							</el-dropdown>
						</div>
					</template>
				</el-table-column>
			</template>
		</ml-single-list>
		<OuterDataModelEdit ref="outerDataModelEditRef" @updateData="updateTable" />
		<Allocation
			ref="allocationRef"
			:layoutConfig="{ idFieldName: 'outerDataModelId' }"
			@allocationSuccess="updateTable"
		/>
	</div>
</template>

<script setup>
import { ref } from "vue";
import { ElMessageBox, ElMessage } from "element-plus";
import OuterDataModelEdit from "./components/OuterDataModel-edit.vue";
import Allocation from "@/views/customize-menu/components/Allocation.vue";
import { deleteRecords } from "@/api/crud";
import { useRouter } from "vue-router";
import { saveRecord } from "@/api/crud";
const router = useRouter();

const activeModelTab = ref("regular");
const modelTypeFilters = {
	regular: [
		{
			fieldName: "modelType",
			op: "EQ",
			value: "1",
			value2: "",
		},
		{
			fieldName: "modelType",
			op: "NL",
			value: "",
			value2: "",
		},
	],
	custom: [
		{
			fieldName: "modelType",
			op: "EQ",
			value: "2",
			value2: "",
		},
	],
};

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
		prop: "tags",
		label: "标签",
		formatter: (row) => {
			const tags = Array.isArray(row.tags)
				? row.tags
				: String(row.tags || "").split(",");
			return tags.filter(Boolean).join("、") || "-";
		},
	},
	{
		prop: "ownerUser.name",
		label: "所属用户",
		formatter: (row) => row.ownerUser?.name || "-",
	},
	{
		prop: "ownerDepartment.name",
		label: "所属部门",
		formatter: (row) => row.ownerDepartment?.name || "-",
	},
	{
		prop: "isDisabled",
		label: "启用",
        align: "center",
        customSlot: "switch",
        isNegation: true,
	},
    {
        prop: "outerDataModelId",
        label: "数据列表",
        width: 120,
        align: "center",
        highlight: true,
        formatter: (row) => {
            return "查看数据";
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
		modelType: activeModelTab.value === "custom" ? "2" : "1",
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

const allocationRef = ref();
const openAllocationDialog = (row, type) => {
	allocationRef.value?.openDialog({
		type,
		pageType: "dashboardList",
		list: [row],
	});
};

const handleMoreCommand = (command, row) => {
	if (command === "delete") {
		deleteData(row.outerDataModelId);
		return;
	}
	openAllocationDialog(row, command);
};

const changeSwitch = async (row) => {
    mlSingleListRef.value.loading = true;
    let res = await saveRecord("OuterDataModel", row.outerDataModelId, {
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
<style lang="scss" scoped>
.outer-data-model-page {
	height: 100%;
	background: #fff;
}

.model-type-tabs {
	flex: 1;
	min-width: 0;
	margin-right: 32px;

	:deep(.el-tabs__header) {
		margin: 0;
	}

	:deep(.el-tabs__content) {
		display: none;
	}
}

:deep(.props-action-section) {
	display: flex;
	align-items: center;
	justify-content: space-between;

	.section-fr {
		display: flex;
		float: none;
		align-items: center;
	}
}

.table-row-actions {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 8px;

	:deep(.el-button) {
		margin-left: 0;
	}

	:deep(.el-dropdown) {
		display: inline-flex;
		align-items: center;
	}
}
</style>
