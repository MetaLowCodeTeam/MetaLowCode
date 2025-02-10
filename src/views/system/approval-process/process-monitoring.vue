<style lang="scss" scoped>
.process-monitoring-page {
	background: #fff;
	height: 100%;
	.process-monitoring-header {
		padding: 0 10px;
		height: 42px;
		line-height: 42px;
	}
	.process-monitoring-main {
		padding: 0;
		.process-monitoring-table {
			padding: 10px;
			height: calc(100% - 32px);
			:deep(.el-table) {
				td,
				th {
					font-size: 14px;
				}
			}
		}
	}
	.process-monitoring-footer {
		height: 52px;
		display: flex;
		align-items: center;
		padding: 0;
		:deep(.table-footer) {
			border: 0;
		}
	}
}
</style>
<template>
	<!--  -->
	<div
		class="process-monitoring-page"
		v-loading="loading"
		:element-loading-text="loadingText"
	>
		<el-container>
			<el-header class="process-monitoring-header">
				<PMHeader
					:multipleSelection="multipleSelection"
					@handleLoading="handleLoading"
					@refresh="onRefresh"
                    @onSearch="onSearch"
				/>
			</el-header>
			<el-main class="process-monitoring-main">
				<div class="process-monitoring-table">
					<PMTable
						:tableData="tableData"
						@handleSelectionChange="handleSelectionChange"
					/>
				</div>
			</el-main>
			<el-footer class="process-monitoring-footer">
				<PMFooter
					:page="page"
					@pageChange="pageChange"
					@handleSizeChange="handleSizeChange"
				/>
			</el-footer>
		</el-container>
	</div>
</template>

<script setup>
import { onMounted, reactive, ref } from "vue";
/**
 * API
 */
import { queryProcessInstanceList } from "@/api/approval";
/**
 * 组件
 */
import PMHeader from "./components/ProcessMonitoring/PMHeader.vue";
import PMTable from "./components/ProcessMonitoring/PMTable.vue";
import PMFooter from "./components/ProcessMonitoring/PMFooter.vue";
import { ElMessage } from "element-plus";

let page = reactive({
	size: 20,
	no: 1,
	total: 0,
});

let loading = ref(false);
let loadingText = ref("加载中...");

let keyword = ref("");

let tableData = ref([]);

onMounted(() => {
	getMonitoringList();
});

// 表格多选
let multipleSelection = ref([]);
const handleSelectionChange = (val) => {
	multipleSelection.value = val;
};

// 分页切换
const pageChange = (v) => {
	page.no = v;
	getMonitoringList();
};

const handleSizeChange = (size) => {
	page.size = size;
	getMonitoringList();
};

// 刷新
const onRefresh = (msg) => {
	getMonitoringList(() => {
        if(msg){
            ElMessage.success(msg);
        }
	});
};

// 搜索
const onSearch = (text) => {
    keyword.value = text;
    getMonitoringList();
}

// 获取数据列表
const getMonitoringList = async (cb) => {
    loadingFn(true);
	let res = await queryProcessInstanceList({
		pageNo: page.no,
		pageSize: page.size,
        keyword: keyword.value
	});
	if (res && res.code == 200) {
		tableData.value = res.data.dataList;
		page.total = res.data.pagination.total;
		if (cb) {
			cb();
		}
	}
	loadingFn(false);
};
const handleLoading = ({ target, text }) => {
	loadingFn(target, text);
};
const loadingFn = (target, text) => {
	loading.value = target;
	loadingText.value = text || "加载中...";
};
</script>
