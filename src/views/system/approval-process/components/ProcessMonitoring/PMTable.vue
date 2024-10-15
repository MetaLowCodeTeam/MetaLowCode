<template>
	<!--  -->
	<el-table
		:data="myTableData"
		:border="true"
		style="width: 100%"
		height="100%"
		@selection-change="handleSelectionChange"
	>
		<el-table-column type="selection" width="50" :align="'center'" />
		<el-table-column prop="approvalConfig.name" label="流程名称" />
		<el-table-column prop="entityLabel" label="实体名称" />
		<el-table-column label="相关记录">
			<template #default="scope">
				<span class="ml-a-span" @click="openDetailDialog(scope.row)">
					{{ scope.row.record?.name }}
				</span>
			</template>
		</el-table-column>
		<el-table-column label="流程状态" width="120" :align="'center'">
			<!-- 
                * 审核中 1
                * 已驳回 2
                * 已完成 3
                * 撤销 4
                * 已中止 5
                * 已挂起 6
            -->
			<template #default="scope">
                <el-tag type="success" v-if="scope.row.approvalStatus == 1">
					审核中
				</el-tag>
                <el-tag type="danger" v-else-if="scope.row.approvalStatus == -1">
					已删除
				</el-tag>
                <el-tag type="info" v-else-if="scope.row.approvalStatus == 2">
					已驳回
				</el-tag>
                <el-tag type="info" v-else-if="scope.row.approvalStatus == 3">
					已完成
				</el-tag>
                <el-tag type="info" v-else-if="scope.row.approvalStatus == 4">
					已撤销
				</el-tag>
                <el-tag type="warning" v-else-if="scope.row.approvalStatus == 5">
					已中止
				</el-tag>
                <el-tag type="warning" v-else-if="scope.row.approvalStatus == 6">
					已挂起
				</el-tag>
			</template>
		</el-table-column>
	</el-table>
	<mlCustomDetail ref="detailRefs" />
</template>

<script setup>
import { ref, watchEffect } from "vue";
import mlCustomDetail from "@/components/mlCustomDetail/index.vue";
import { ElMessage } from "element-plus";
const props = defineProps({
	tableData: { type: Object, default: () => [] },
});

const emit = defineEmits(["handleSelectionChange"]);

let myTableData = ref([]);

const handleSelectionChange = (val) => {
	emit("handleSelectionChange", val);
};

let detailRefs = ref("");

const openDetailDialog = (row) => {
	let recordId = row.record?.id;
	if (recordId) {
		detailRefs.value.openDialog(recordId);
	} else {
		ElMessage.error("没有找到记录ID，该记录可能已被删除。");
	}
};

watchEffect(() => {
	myTableData.value = props.tableData;
});
</script>
<style lang="scss" scoped></style>
