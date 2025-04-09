<!-- 批量打印 -->
<template>
	<div
		class="batch-printing-container"
		v-loading="loading"
		element-loading-text="加载中..."
	>
		<el-container>
			<el-header class="batch-printing-header">
				<div class="select-col mr-10">
					<span class="mr-5">一排打印几个：</span>
					<el-select
						v-model="rowNum"
						placeholder="请选择"
						style="width: 100px"
					>
						<el-option
							v-for="item in rowNumList"
							:key="item"
							:label="item"
							:value="item"
						/>
					</el-select>
				</div>
                <div class="select-col mr-10">
					<span class="mr-5">第几行插入分页符：</span>
					<el-select
						v-model="rowPageNum"
						placeholder="请选择"
						style="width: 100px"
					>
						<el-option
							v-for="item in rowPageNumList"
							:key="item"
							:label="item"
							:value="item"
						/>
					</el-select>
				</div>
				<el-button type="primary" @click="handlePrint">
					开始打印
				</el-button>
			</el-header>
			<el-main class="batch-printing-main">
				<el-row :gutter="20">
					<el-col
						:span="24 / rowNum"
						v-for="(row, inx) of tableData"
						:class="{ 'page-break-before': inx % (rowNum * rowPageNum) === 0 }"
						:key="inx"
					>
						<MlCardItem
							:row="row"
							:form-layout="formLayout"
							:nameFieldName="entityInfo.nameFieldName"
							:idFieldName="entityInfo.idFieldName"
							:entity="entityInfo"
							isView
						/>
					</el-col>
				</el-row>
			</el-main>
			<el-footer class="batch-printing-footer">
				<el-pagination
					:current-page="page.no"
					:page-size="page.size"
					:total="page.total"
					:page-sizes="page.pageSizes"
					@current-change="pageChange"
					@size-change="handleSizeChange"
					layout="total, sizes, prev, pager, next, jumper"
				/>
			</el-footer>
		</el-container>
	</div>
</template>

<script setup>
import { onMounted, inject, ref, reactive } from "vue";
import { useRouter } from "vue-router";

// API
import { getDataList } from "@/api/crud";
// 公共方法
import useCommonStore from "@/store/modules/common";
const { queryEntityInfoByName } = useCommonStore();
// 卡片列表组件
import MlCardItem from "@/components/mlListCard/CardItem.vue";
// 打印方法
import Print from "@/utils/print";

const Router = useRouter();
const $TOOL = inject("$TOOL");

let batchPrintingConfig = ref({});

let entityInfo = ref({});
let fromId = ref("");

let loading = ref(false);

// 一排展示几个
let rowNum = ref(4);
let rowNumList = ref([1, 2, 3, 4, 6]);
// 第几行插入分页符
let rowPageNum = ref(2);
let rowPageNumList = ref([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);

let formLayout = ref({});

onMounted(() => {
	entityInfo.value = queryEntityInfoByName(
		Router.currentRoute.value.query.entity
	);
	fromId.value = Router.currentRoute.value.query.fromId;
	batchPrintingConfig.value = $TOOL.data.get("BatchPrintingConfig")[
		entityInfo.value.name
	];
	formLayout.value = batchPrintingConfig.value.listCardConf.formLayout;
	// 加载列表数据
	loadTableData();
});

/**
 * 分页 ---------------- begin
 */
let page = reactive({
	no: 1,
	size: 20,
	pageSizes: [20, 40, 80, 100],
	total: 0,
});
const pageChange = (no) => {
	page.no = no;
	loadTableData();
};
const handleSizeChange = (size) => {
	page.size = size;
	loadTableData();
};
/**
 * 分页 ---------------- end
 */

let tableData = ref([]);

const loadTableData = async () => {
	loading.value = true;
	let tableParam = batchPrintingConfig.value.queryParm;
	let res = await getDataList(
		tableParam.mainEntity,
		tableParam.fieldsList,
		tableParam.filter,
		page.size,
		page.no,
		[tableParam.sortFields],
		tableParam.advFilter,
		tableParam.quickFilter,
		tableParam.builtInFilter,
		tableParam.statistics,
		tableParam.filterEasySql,
		tableParam.defaultFilter
	);
	if (res && res.code == 200) {
		tableData.value = res.data.dataList;
		page.total = res.data.pagination.total;
	}
	loading.value = false;
};

const handlePrint = () => {
	Print(".batch-printing-main");
};
</script>

<style lang="scss" scoped>
.batch-printing-container {
	width: 100%;
	height: 100%;
	.batch-printing-header {
		display: flex;
		justify-content: right;
		.select-col {
			font-size: 14px;
		}
	}
	.batch-printing-main {
		height: calc(100% - 120px);
	}
	.batch-printing-footer {
		display: flex;
		justify-content: center;
	}
    .page-break-before {
        page-break-before: always;
    }
}
</style>
<style media="print">
.page-break-before {
    page-break-before: always;
}
</style>