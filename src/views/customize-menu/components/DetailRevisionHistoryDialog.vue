<style lang="scss" scoped>
.font-size {
	font-size: 13px;
}
</style>
<template>
	<!--  -->
	<ml-dialog v-model="isShow" title="修改记录">
		<div
			class="ml-dialog-body"
			v-loading="loading"
			element-loading-text="数据加载中..."
		>
			<el-empty
				v-if="showEmpty"
				:image-size="100"
				description="暂无修改历史"
			/>
			<template v-else>
				<el-table
					:data="tableData"
					style="width: 100%"
					:height="400"
					:header-cell-style="{
						background: '#f5f7fa',
						color: '#606266',
					}"
					:row-style="{ height: '40px' }"
					border
					stripe
					class="font-size"
                    @sort-change="handleSortChange"
				>
					<el-table-column
						prop="revisionBy.name"
						label="修改用户"
					></el-table-column>
					<el-table-column
						prop="revisionOn"
						label="修改时间"
                        sortable="custom"
					></el-table-column>
					<el-table-column label="操作" :align="'center'" width="100">
						<template #default="scope">
							<el-button
								:disabled="
									scope.row.revisionType &&
									scope.row.revisionType.value != 1 &&
									scope.row.revisionType.value != 5
								"
								link
								type="primary"
								size="small"
								@click="viewRow(scope.row)"
							>
								查看
							</el-button>
						</template>
					</el-table-column>
				</el-table>
				<div class="list-card-footer">
					<mlPagination
						:bottom="false"
						:no="pageConf.pageNo"
						:total="pageConf.total"
                        :size="pageConf.size"
						:pageSizes="pageConf.sizes"
						@pageChange="pageChange"
						@handleSizeChange="handleSizeChange"
						style="background: #fff"
					/>
				</div>
			</template>
		</div>
	</ml-dialog>
    <ml-revision-history 
        ref="historyDialog"
    />
</template>

<script setup>
import { ref } from "vue";

import { queryByRecordId } from "@/api/crud";
import MlRevisionHistory from "@/components/mlRevisionHistory/index.vue";

let isShow = ref(false);
let loading = ref(false);
let showEmpty = ref(false);
let curtRecordId = ref("");
let pageConf = ref({
	pageNo: 1,
	pageSize: 20,
    sizes: [20, 40, 80, 100],
	total: 0,
});
let tableData = ref([]);

// 排序相关
let sortBy = ref(null); // 默认降序，支持 ASC、DESC、NULL



const openDialog = (recordId) => {
	isShow.value = true;
	curtRecordId.value = recordId;
	loadTableData();
};

const pageChange = (v) => {
    pageConf.value.pageNo = v;
    loadTableData();
}
const handleSizeChange = (v) => {
    pageConf.value.pageSize = v;
    loadTableData();
}

// 处理排序变化
const handleSortChange = ({ prop, order }) => {
    // 将 Element Plus 的排序参数转换为字符串
    if (order === 'ascending') {
        sortBy.value = 'ASC';
    } else if (order === 'descending') {
        sortBy.value = 'DESC';
    } else {
        sortBy.value = null;
    }
    // 重新加载数据
    loadTableData();
}

const loadTableData = async () => {
	let { pageNo, pageSize } = pageConf.value;
	loading.value = true;
	showEmpty.value = false;
	let res = await queryByRecordId(curtRecordId.value, pageNo, pageSize, sortBy.value);
	if (res) {
		tableData.value = res.data.dataList || [];
		if (tableData.value.length < 1) {
			showEmpty.value = true;
		}
		pageConf.value.total = res.data.pagination.total;
	}
	loading.value = false;
};

// 查看变更历史
let historyDialog = ref(null);
const viewRow = async (row) => {
	historyDialog.value.openDialog(row.revisionHistoryId);
};


defineExpose({
	openDialog,
});
</script>


