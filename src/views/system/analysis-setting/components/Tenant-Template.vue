<template>
	<ml-dialog v-model="isShow" title="租户模板" width="800px">
		<mlSingleList
			title="租户模板"
			mainEntity="TenantTemplate"
			fieldsList="tenantName,isDefault"
			:sortFields="sortFields"
			fieldName="tenantName"
			:tableColumn="tableColumn"
			ref="mlSingleListRef"
			queryUrl="/plugins/metaTenant/tenantTemplate/listQuery"
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
					width="130"
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
	</ml-dialog>
	<mlCustomEdit
		ref="editRefs"
		entityName="TenantTemplate"
		@saveFinishCallBack="onRefresh"
		queryUrl="/plugins/metaTenant/tenantTemplate/saveRecord"
		queryUrlIdName="recordId"
	/>
</template>
<script setup>
import { ref } from "vue";
import mlCustomEdit from "@/components/mlCustomEdit/index.vue";
import { ElMessageBox, ElMessage } from "element-plus";
// 保存
import {
	tenantTemplateSaveRecord,
	tenantTemplateDeleteRecord,
} from "@/api/plugins";

// 默认排序
let sortFields = ref([
	{
		fieldName: "createdOn",
		type: "DESC",
	},
]);

// 表头
let tableColumn = ref([
	{
		prop: "tenantName",
		label: "模板名称",
		align: "center",
	},
	{
		prop: "isDefault",
		label: "默认模板",
		align: "center",
		customSlot: "switch",
	},
]);

const isShow = ref(false);

const openTenantTemplate = async () => {
	isShow.value = true;
};

let editRefs = ref();
const openTenantEdit = (row) => {
	let tempV = {};
	tempV.entityName = "TenantTemplate";
	tempV.detailId = row.tenantTemplateId || null;
	editRefs.value.openDialog(tempV);
};

// 刷新
let mlSingleListRef = ref();
const onRefresh = () => {
	mlSingleListRef.value.getTableList();
};

// 切换默认
const changeSwitch = async (data) => {
	mlSingleListRef.value.loading = true;
	let res = await tenantTemplateSaveRecord(
		{
			isDefault: data.isDefault,
		},
		{ entity: "TenantTemplate", recordId: data.tenantTemplateId }
	);
	if (res && res.code == 200) {
		mlSingleListRef.value.getTableList();
	} else {
		mlSingleListRef.value.loading = false;
	}
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
			let res = await tenantTemplateDeleteRecord(row.tenantTemplateId);
			if (res && res.code == 200) {
				onRefresh();
				ElMessage.success("删除成功");
			} else {
				mlSingleListRef.value.loading = false;
			}
		})
		.catch(() => {});
};

defineExpose({
	openTenantTemplate,
});
</script>
<style scoped lang="scss"></style>
