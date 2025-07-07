<template>
	<ml-dialog
		v-model="isShow"
		:title="title"
		width="700px"
		draggable
		:show-close="!loading"
	>
		<div v-loading="loading" element-loading-text="加载中...">
			<el-table
				:data="tableData"
				style="width: 100%"
				:border="true"
				max-height="500"
			>
                <el-table-column prop="createdOn" label="操作时间" width="160"/>
				<el-table-column prop="beginDate" label="开始时间" width="160"/>
				<el-table-column prop="expiryDate" label="到期时间" width="160"/>
				<el-table-column prop="remarks" label="备注" />
			</el-table>
		</div>
	</ml-dialog>
</template>

<script setup>
import { ref } from "vue";
import { queryTenantRenewalLogs } from "@/api/plugins";
import { $fromNow } from "@/utils/util";
const isShow = ref(false);
const loading = ref(false);
const title = ref("");
const tableData = ref([]);

const getTableData = async (recordId) => {
	loading.value = true;
	let res = await queryTenantRenewalLogs(recordId);
	if (res && res.code == 200) {
		tableData.value = res.data.map(item => {
            item.createdOn = $fromNow(item.createdOn, true);
            item.beginDate = item.beginDate || '长期';
			item.expiryDate = item.expiryDate || '长期';
			return item;
		});
	}
	loading.value = false;
};

const openDialog = (row) => {
	isShow.value = true;
	title.value = row.tenantName + "的续签记录";
	getTableData(row.tenantId);
};

defineExpose({
	openDialog,
});
</script>
<style scoped lang="scss">
.el-table {
	font-size: 14px;
}
</style>
