<!-- 多租户 -->
<template>
	<!--  -->
	<mlSingleList
		title="多租户"
		mainEntity="BackupDatabase"
		fieldsList="tenantName,isDisabled,tenantState,tenantCode"
		:sortFields="sortFields"
		fieldName="database"
		:tableColumn="tableColumn"
		ref="mlSingleListRef"
		queryUrl="/plugins/metaTenant/tenant/listQuery"
		@changeSwitch="changeSwitch"
	>
		<template #addButton>
			<el-button type="primary" @click="openTenantEdit(false)">
				<el-icon size="14">
					<ElIconPlus />
				</el-icon>
				<span class="ml-5">添加</span>
			</el-button>
		</template>
		<template #activeRow>
			<el-table-column
				label="操作"
				fixed="right"
				:align="'center'"
				width="140"
			>
				<template #default="scope">
					<el-button
						size="small"
						type="primary"
						link
						icon="Edit"
						@click="openTenantEdit(scope.row)"
					>
						编辑
					</el-button>
					<el-button
						size="small"
						type="primary"
						link
						icon="Delete"
						@click="deleteTenant(scope.row)"
					>
						删除
					</el-button>
				</template>
			</el-table-column>
		</template>
	</mlSingleList>
	<TenantEdit ref="tenantEditRef" @refresh="refresh" />
</template>
<script setup>
import { ref } from "vue";
import TenantEdit from "./components/Tenant-Edit.vue";
// 默认排序
let sortFields = ref([
	{
		fieldName: "modifiedOn",
		type: "DESC",
	},
]);
// 表头
let tableColumn = ref([
	{
		prop: "tenantName",
		label: "租户名称",
		align: "center",
	},
	{
		prop: "tenantState",
		label: "租户状态",
		align: "center",
		formatter: (row) => {
			return row.tenantState?.label;
		},
	},
	{
		prop: "tenantCode",
		label: "租户编码",
		align: "center",
	},
	{
		prop: "isDisabled",
		label: "启用",
		align: "center",
		customSlot: "switch",
		isNegation: true,
		width: 80,
	},
]);

let tenantEditRef = ref("");
const openTenantEdit = (row) => {
	tenantEditRef.value.openDialog(row || {});
};
let mlSingleListRef = ref("");
const refresh = () => {
	mlSingleListRef.value.getTableList();
};
// 启用
const changeSwitch = async (row) => {
	let tempForm = {
		tenantId: row.tenantId,
		isDisabled: row.isDisabled,
	};
	mlSingleListRef.value.loading = true;
	await tenantEditRef.value.onSave(tempForm);
	mlSingleListRef.value.loading = false;
};
// 删除
const deleteTenant = async (row) => {
	// mlSingleListRef.value.loading = true;
	// await tenantEditRef.value.onSave(tempForm);
	// mlSingleListRef.value.loading = false;
};
</script>
