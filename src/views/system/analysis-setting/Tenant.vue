<!-- 多租户 -->
<template>
	<!--  -->
	<mlSingleList
		title="多租户"
		mainEntity="Tenant"
		fieldsList="tenantName,isDisabled,tenantState,tenantCode,initializeTemplate,appManagementSwitch"
		:sortFields="sortFields"
		fieldName="tenantName"
		:tableColumn="tableColumn"
		ref="mlSingleListRef"
		queryUrl="/plugins/metaTenant/tenant/listQuery"
		@changeSwitch="changeSwitch"
	>
		<template #beforeSearch>
			<el-button class="mr-10" type="primary" @click="openTenantTemplate">
				租户模板
			</el-button>
		</template>
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
					<el-dropdown trigger="click" @command="handleCommand($event, scope.row)">
						<el-button 
                            size="small" 
                            type="primary" 
                            link 
                            class="more-btn"
                        >
							更多
                            <el-icon class="more-icon">
                                <ArrowDownBold />
                            </el-icon>
						</el-button>
						<template #dropdown>
							<el-dropdown-menu>
								<el-dropdown-item command="delete">
                                    <el-icon>
                                        <Delete />
                                    </el-icon>
                                    删除
                                </el-dropdown-item>
								<el-dropdown-item command="copy" v-if="scope.row.tenantState.value == 2 && !scope.row.isDisabled">
                                    <el-icon>
                                        <CopyDocument />
                                    </el-icon>
                                    复制专属链接
                                </el-dropdown-item>        
							</el-dropdown-menu>
						</template>
					</el-dropdown>
				</template>
			</el-table-column>
		</template>
	</mlSingleList>
	<TenantEdit ref="tenantEditRef" @refresh="refresh" />
	<TenantTemplate ref="tenantTemplateRef" />
    <TenantCopy ref="tenantCopyRef" />
</template>
<script setup>
import { ref } from "vue";
import TenantEdit from "./components/Tenant-Edit.vue";
import { deleteTenantRecord, initializationDatabase } from "@/api/plugins";
// 租户模板
import TenantTemplate from "./components/Tenant-Template.vue";
// 复制租户专属链接
import TenantCopy from "./components/Tenant-Copy.vue";
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
]);

let tenantEditRef = ref("");
const openTenantEdit = (row, target) => {
	tenantEditRef.value.openDialog(row || {}, target);
};
// 打开租户模板
let tenantTemplateRef = ref("");
const openTenantTemplate = () => {
	tenantTemplateRef.value.openTenantTemplate();
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

let tenantCopyRef = ref("");
const copyTenant = (row) => {
    tenantCopyRef.value.openDialog(row);
    // let appPath = import.meta.env.VITE_APP_PATH;
    // let url = appPath + 'login?tenantCode=' + row.tenantCode + '&tenantId=' + row.tenantId;
    // copyText(location.origin + url);
}

// 更多
const handleCommand = (command, row) => {
    switch(command) {
        case "delete":
            deleteTenant(row);
            break;
        case "copy":
            copyTenant(row);
            break;
    }
};
</script>
<style scoped lang="scss">

.more-icon {
	margin-left: 3px;
	position: relative;
	top: -1px;
}
.more-btn {
    position: relative;
    top: 3px;
}
</style>
