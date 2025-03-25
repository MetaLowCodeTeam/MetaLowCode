<!-- 多租户 -->
<template>
	<!--  -->
	<mlSingleList
		title="多租户"
		mainEntity="Tenant"
		fieldsList="tenantName,isDisabled,tenantState,tenantCode"
		:sortFields="sortFields"
		fieldName="tenantName"
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
			<el-table-column label="租户状态" :align="'center'" width="200">
				<template #default="scope">
					<span v-if="scope.row.tenantState.value == 1">
						<el-tag type="info">
							{{ scope.row.tenantState.label }}
						</el-tag>
					</span>
					<span v-else-if="scope.row.tenantState.value == 2">
						<el-tag type="success">
							{{ scope.row.tenantState.label }}
						</el-tag>
					</span>
					<span v-else class="ml-a-span">
						<el-tag type="danger">
							{{ scope.row.tenantState.label }}
						</el-tag>
						<el-tooltip content="点击初始化数据库" placement="top">
							<span
								class="ml-5 icon-top-2"
								@click="initDatabase(scope.row)"
							>
								<el-icon>
									<Coin />
								</el-icon>
							</span>
						</el-tooltip>
					</span>
				</template>
			</el-table-column>
			<el-table-column
				label="操作"
				fixed="right"
				:align="'center'"
				width="200"
			>
				<template #default="scope">
					<!-- <el-button
						type="primary"
						size="small"
						link
                        icon="Coin"
						v-if="scope.row.tenantState.value == 3"
                        @click="initDatabase(scope.row)"
					>
						初始化数据库
					</el-button> -->
					<el-button
						size="small"
						type="primary"
						link
						icon="View"
						@click="openTenantEdit(scope.row, 'view')"
					>
						查看
					</el-button>
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
import { deleteTenantRecord, initializationDatabase } from "@/api/plugins";
import { ElMessageBox, ElMessage } from "element-plus";
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
	// {
	// 	prop: "tenantState",
	// 	label: "租户状态",
	// 	align: "center",
	// 	formatter: (row) => {
	// 		return row.tenantState.value == 2 ? `<span style="color: red;">{{ row.tenantState?.label }}</span>` : row.tenantState?.label;
	// 	},
	// },
]);

let tenantEditRef = ref("");
const openTenantEdit = (row, target) => {
	tenantEditRef.value.openDialog(row || {}, target);
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
	ElMessageBox.confirm("是否确认删除?", "提示：", {
		confirmButtonText: "确认",
		cancelButtonText: "取消",
		type: "warning",
	})
		.then(async () => {
			mlSingleListRef.value.loading = true;
			let res = await deleteTenantRecord(row.tenantId);
			if (res) {
				ElMessage.success("删除成功");
				refresh();
			}
			mlSingleListRef.value.loading = false;
		})
		.catch(() => {});
};

// 初始化数据库
const initDatabase = async (row) => {
	ElMessageBox.confirm("是否确认初始化数据库?", "提示：", {
		confirmButtonText: "确认",
		cancelButtonText: "取消",
		type: "warning",
	})
		.then(async () => {
			mlSingleListRef.value.loading = true;
			let res = await initializationDatabase(row.tenantId);
			if (res) {
				ElMessage.success("系统开始初始化数据库。。。");
				refresh();
			}
			mlSingleListRef.value.loading = false;
		})
		.catch(() => {});
};
</script>
