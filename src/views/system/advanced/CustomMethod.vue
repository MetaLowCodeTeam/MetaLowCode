<!-- 自定义方法 -->
<template>
	<mlSingleList
		title="自定义方法"
		mainEntity="CustomMethod"
		fieldsList="methodName,methodUrl,methodType,methodConfig,isDisabled"
		:sortFields="sortFields"
		fieldName="methodName,methodUrl"
		:tableColumn="tableColumn"
		ref="mlSingleListRef"
		queryUrl="/cm/listQuery"
		@changeSwitch="changeSwitch"
	>
		<template #addButton>
			<el-button type="primary" @click="actionBtn(null, 'add')">
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
						link
						type="primary"
						size="small"
						@click="actionBtn(scope.row, 'edit')"
					>
						编辑
					</el-button>
					<el-button
						link
						type="primary"
						size="small"
						@click="actionBtn(scope.row, 'view')"
					>
						查看
					</el-button>
                    <el-button
						link
						type="primary"
						size="small"
						@click="actionBtn(scope.row, 'delete')"
					>
						删除
					</el-button>
				</template>
			</el-table-column>
		</template>
	</mlSingleList>
	<EditCustomMethodDialog
		ref="editCustomMethodDialogRef"
		@refresh="refresh"
	/>
</template>

<script setup>
import { ref } from "vue";
import EditCustomMethodDialog from "./components/EditCustomMethodDialog.vue";
// API
import { saveCmRecord, deleteCmRecord } from "@/api/advancedApi";
import { ElMessageBox } from "element-plus";
let mlSingleListRef = ref("");
// 默认排序
let sortFields = ref([
	{
		fieldName: "createdOn",
		type: "DESC",
	},
]);

// const revisionType = ref({
//     1: "更新",
// });

let tableColumn = ref([
	{
		label: "接口名称",
		prop: "methodName",
	},
	{
		label: "接口地址",
		prop: "methodUrl",
		formatter: (row) => {
			return "/cm/call/" + row.methodUrl;
		},
	},
	{
		label: "接口类型",
		prop: "methodType",
		formatter: (row) => {
			return row.methodType?.label;
		},
	},
	{
		prop: "isDisabled",
		label: "启用",
		align: "center",
		customSlot: "switch",
		isNegation: true,
		width: 120,
	},
]);

// 刷新
const refresh = () => {
	mlSingleListRef.value.getTableList();
};

// 切换状态
const changeSwitch = async (row) => {
	mlSingleListRef.value.loading = true;
	let res = await saveCmRecord(row.customMethodId, {
		isDisabled: row.isDisabled,
	});
	if (res && res.code == 200) {
		refresh();
	} else {
		mlSingleListRef.value.loading = false;
	}
};

const editCustomMethodDialogRef = ref();

// 按钮事件
const actionBtn = (data, target) => {
    if(target == 'delete'){
        onDeleteCmRecord(data.customMethodId);
    }else{
		editCustomMethodDialogRef.value.openDialog(data, target);
    }
};

// 删除
const onDeleteCmRecord = async (customMethodId) => {
    ElMessageBox.confirm('确定要删除吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
    }).then(async () => {
        mlSingleListRef.value.loading = true;
        let res = await deleteCmRecord(customMethodId);
        if (res && res.code == 200) {
            refresh();
        }
        mlSingleListRef.value.loading = false;
    }).catch(() => {});
}
</script>
<style></style>
