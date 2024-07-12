<template>
	<el-container direction="horizontal">
		<mlSingleList
			ref="mlSingleListRef"
			title="数据转换"
			:mainEntity="tableConf.entity"
			:fieldsList="tableConf.fieldsList"
			:sortFields="tableConf.sortFields"
			fieldName="roleName"
			:tableColumn="tableConf.tableColumn"
			:filterItems="tableConf.filterItems"
		>
			<template #addbutton>
				<el-button
					type="primary"
					@click="addRow"
					:disabled="!$TOOL.checkRole('r23-2')"
				>
					<el-icon size="14">
						<ElIconPlus />
					</el-icon>
					<span class="ml-5">新建记录转化</span>
				</el-button>
			</template>
			<template #activeRow>
				<el-table-column
					label="操作"
					:align="'center'"
					width="140"
					fixed="right"
				>
					<template #default="scope">
						<el-button
							size="small"
							type="primary"
							link
							:disabled="!$TOOL.checkRole('r23-3')"
							@click="editRow(scope.row)"
						>
							<span class="mr-3">
								<el-icon>
									<ElIconEdit />
								</el-icon>
							</span>
							<span>编辑</span>
						</el-button>
						<el-button
							size="small"
							link
							type="primary"
							:disabled="!$TOOL.checkRole('r23-4')"
							@click="deleteRow(scope.row)"
						>
							<span class="mr-3">
								<el-icon>
									<ElIconDelete />
								</el-icon>
							</span>
							<span>删除</span>
						</el-button>
					</template>
				</el-table-column>
			</template>
		</mlSingleList>
	</el-container>
	<Edit ref="EditRefs" />
</template>

<script setup>
import { inject, ref, shallowRef } from "vue";
/**
 * 组件
 */
// 新建 、 编辑
import Edit from "./Edit/index.vue";

const $TOOL = inject("$TOOL");

let mlSingleListRef = ref();
// 表格参数
let tableConf = ref({
	entity: "Role",
	fieldsList: "roleName, disabled, description,createdBy",
	// 默认搜索字段
	fieldName: "roleName",
	// 默认排序
	sortFields: [
		{
			fieldName: "createdBy",
			type: "DESC",
		},
	],
	// 过滤条件
	filterItems: [],
	tableColumn: [
		{
			prop: "roleName",
			label: "角色名称",
			width: "180",
		},
		{
			prop: "disabled",
			label: "是否禁用",
			align: "center",
			width: "120",
			formatter: (row) => {
				return row.disabled ? "是" : "否";
			},
		},
		{
			prop: "description",
			label: "角色描述",
		},
	],
});

/**
 * ************************************************************** 列表相关增删改
 */
let EditRefs = shallowRef();
// 添加行
const addRow = () => {
    EditRefs.value?.openDialog();
};
// 编辑行
const editRow = (row) => {};

// 删除行
const deleteRow = (row) => {
	// ElMessageBox.confirm("是否删除该权限角色?", "删除确认")
	//     .then(() => {
	//         deleteRowById(row.roleId)
	//             .then((res) => {
	//                 if (res.data.code == 200) {
	//                     ElMessage.success("删除成功");
	//                     mlSingleListRef.value.getTableList();
	//                 }
	//             })
	//             .catch((res) => {
	//                 ElMessage.error(res.message);
	//             });
	//     })
	//     .catch(() => {
	//         ElMessage.info("取消删除");
	//     });
};
</script>

<style lang="scss" scoped></style>
