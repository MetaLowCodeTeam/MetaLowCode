<!-- 批量打印 -->
<template>
	<div
		class="batch-printing-container"
		v-loading="loading"
		element-loading-text="加载中..."
	>
		<el-container>
			<el-header>
				<el-button type="primary" @click="handlePrint">打印</el-button>
			</el-header>
			<el-main class="batch-printing-main">
				<el-row :gutter="20">
					<el-col
						:span="24 / rowNum"
						v-for="(row, inx) of tableData"
						:key="inx"
					>
						<MlCardItem
							:row="row"
							:form-layout="formLayout"
							:nameFieldName="entityInfo.nameFieldName"
							:idFieldName="entityInfo.idFieldName"
							:entity="entityInfo"
						/>
					</el-col>
				</el-row>
			</el-main>
			<el-footer> 底部 </el-footer>
		</el-container>
	</div>
</template>

<script setup>
import { onMounted, inject, ref } from "vue";
import { useRouter } from "vue-router";

// API
import { getDataList } from "@/api/crud";
// 公共方法
import useCommonStore from "@/store/modules/common";
const { queryEntityInfoByName } = useCommonStore();
// 卡片列表组件
import MlCardItem from "@/components/mlListCard/CardItem.vue";
// 滚动条
import MlScrollbar from "@/components/mlScrollbar/index.vue";

const Router = useRouter();
const $TOOL = inject("$TOOL");

let batchPrintingConfig = ref({});

let entityInfo = ref({});
let fromId = ref("");

let loading = ref(false);

let rowNum = ref(4);
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

let tableData = ref([]);

const loadTableData = async () => {
	loading.value = true;
	let tableParam = batchPrintingConfig.value.queryParm;
	let res = await getDataList(
		tableParam.mainEntity,
		tableParam.fieldsList,
		tableParam.filter,
		tableParam.pageSize,
		tableParam.pageNo,
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
		console.log(tableData.value);
	}
	loading.value = false;
};
</script>

<style lang="scss" scoped>
.batch-printing-container {
	width: 100%;
	height: 100%;
	// padding: 20px;
	// box-sizing: border-box;
	.batch-printing-main {
		height: calc(100% - 120px);
	}
}
</style>
