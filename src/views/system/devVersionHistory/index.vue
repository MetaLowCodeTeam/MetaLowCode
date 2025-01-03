<template>
	<!--  -->
	<mlSingleList
		:title="'开发版本管理（当前系统版本号：' + publicSetting.developSqlVersion + '）'"
		mainEntity="DevVersionHistory"
		fieldsList="versionName,version,createdOn,remarks"
		:sortFields="sortFields"
		fieldName="versionName"
		:tableColumn="tableColumn"
		ref="mlSingleListRef"
        queryUrl="/devVersionHistory/listQuery"
	>
		<template #addButton>
			<el-button type="primary" @click="openEditDialog">
				<span class="ml-5">新建</span>
			</el-button>
            <el-button type="primary" @click="beforeImportDialog">
				<span class="ml-5">导入</span>
			</el-button>
		</template>
		<template #activeRow>
			<el-table-column
				label="操作"
				fixed="right"
				:align="'center'"
				width="100"
			>
				<template #default="scope">
					<el-button 
                        link 
                        type="primary" 
                        size="small" 
                        @click="openEditDialog(scope.row)"
                    >
						编辑
					</el-button>
                    <el-button 
                        link 
                        type="primary" 
                        size="small" 
                        @click="openExportDialog(scope.row)"
                        v-if="scope.row.version !== 1"
                    >
						导出
					</el-button>
				</template>
			</el-table-column>
		</template>
	</mlSingleList>
	<EditDialog ref="editDialogRef" @refresh="refresh"/>
    <ExportDialog ref="exportDialogRef"/>
    <ImportDialog ref="importDialogRef"/>
</template>

<script setup>
import { ref } from "vue";
import { $fromNow } from "@/utils/util";
import { ElMessageBox } from 'element-plus'
import EditDialog from "./components/EditDialog.vue";
import ExportDialog from "./components/ExportDialog.vue";
import ImportDialog from "./components/ImportDialog.vue";
import useCommonStore from "@/store/modules/common";
import { storeToRefs } from "pinia";
const { publicSetting } = storeToRefs(useCommonStore());
// developSqlVersion
// 默认排序
let sortFields = ref([
	{
		fieldName: "createdOn",
		type: "DESC",
	},
]);
let tableColumn = ref([
	{
		prop: "versionName",
		label: "版本名称",
		align: "center",
		width: "300",
	},
	{
		prop: "version",
		label: "版本号",
		width: "160",
		align: "center",
	},
	{
		prop: "createdOn",
		label: "版本锁定时间",
		width: "160",
		align: "center",
		formatter: (row) => {
			return $fromNow(row.createdOn);
		},
	},
	{
		prop: "remarks",
		label: "备注",
	},
]);

const editDialogRef = ref();
const openEditDialog = (row) => {
	editDialogRef.value.openDialog(row);
};

const exportDialogRef = ref();
const openExportDialog = (row) => {
	exportDialogRef.value.openDialog(row);
};

const importDialogRef = ref();

const beforeImportDialog = async () => {
    ElMessageBox.confirm('因导入脚本涉及系统表修改和DDL脚本，执行过程可能发生冲突导致数据异常！请先对数据库进行整库备份，再进行导入操作。', '提示', {
        confirmButtonText: "我已备份，继续导入",
        cancelButtonText: '取消',
        type: 'warning',
    }).then(() => {
        openImportDialog();
    }).catch(()=>{});
}



const openImportDialog = () => {
	importDialogRef.value.openDialog();
};

const mlSingleListRef = ref();
const refresh = () => {
	mlSingleListRef.value.getTableList();
};
</script>
<style></style>
