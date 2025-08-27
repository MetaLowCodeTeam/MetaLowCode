<template>
	<div
		class="pivot-table-widget"
		@click.stop="setSelected"
		:class="cutField?.options?.customClass"
	>
		<div
			class="table-box"
			v-if="tableColumn.length > 0"
			v-loading="tableLoading"
		>
            <div class="mb-10" v-if="showQueryPanel">
                <CustomQueryPanel 
                    :entityName="entity"
                    :filter="cutField?.options?.setQueryPanel?.queryPanelConf?.filter"
                    :forbidUserModifyField="cutField?.options?.setQueryPanel?.queryPanelConf?.forbidUserModifyField"
                    :hideQueryMatchType="cutField?.options?.setQueryPanel?.queryPanelConf?.hideQueryMatchType"
                    :labelPosition="cutField?.options?.setQueryPanel?.queryPanelConf?.labelPosition"
                    @onSearch="onSearch"
                    @reset="onSearch"
                />
            </div>
			<el-table
				size="small"
				:data="tableData"
				:border="true"
				style="width: 100%"
				:height="320"
				stripe
				:show-summary="cutField?.options.setChartConf.showSummary"
				:summary-method="getSummaries"
				class="tableAuto"
				@row-click="onRowClick"
			>
				<el-table-column
					v-for="(column, inx) of tableColumn"
					:key="inx"
					show-overflow-tooltip
					:label="column.alias"
					:prop="column.fieldName"
				>
					<!-- header -->
					<template #header>
						<div class="yichu">{{ column.alias }}</div>
					</template>
					<!-- <template #default="scope">
                        <div class="yichu">{{ scope.row[column.fieldName] }}</div>
                    </template> -->
					<template #default="scope">
						<FormatRow :row="scope.row" :column="column" />
					</template>
				</el-table-column>
			</el-table>
			<div class="pagination-box" v-if="myOptions.showTablePagination">
                <el-pagination
                    v-model:current-page="currentPage"
                    v-model:page-size="pageSize"
                    :page-sizes="[20, 40, 80, 100, 200, 300, 400, 500]"
                    layout="total, sizes, prev, pager, next, jumper"
                    :total="total"
                    @size-change="handleSizeChange"
                    @current-change="handleCurrentChange"
                />
            </div>
		</div>
		<div class="no-data" v-else>
			请通过右侧
			<span class="lh">显示字段设置</span> 字段栏来添加数据 或 设置<span class="lh"> 数据源 </span>添加数据
		</div>
	</div>
	<!-- <mlCustomDetail ref="detailRef" /> -->
</template>

<script setup>
import { onMounted, reactive, ref, watch, inject } from "vue";
import useCommonStore from "@/store/modules/common";
import { storeToRefs } from "pinia";
import { getDataList } from "@/api/crud";
// import mlCustomDetail from "@/components/mlCustomDetail/index.vue";
import FormatRow from "@/components/simpleTable/FormatRow.vue";
import { useRouter } from "vue-router";
import http from "@/utils/request";
const { allEntityName } = storeToRefs(useCommonStore());
const router = useRouter();
import useChartSourceData from "@/hooks/ChartSourceData";
const { getDataSourceData } = useChartSourceData();
const getFormConfig = inject('getFormConfig');
import { useRefreshDashboard } from '@/hooks/useRefreshDashboard';
import CustomQueryPanel from "@/components/mlSetConditions/CustomQueryPanel.vue";
defineOptions({
	name: "listTable-widget",
});
const props = defineProps({
	field: Object,
	designer: Object,
	detailRef: Object,
});

let cutField = ref("");
let tableColumn = ref([]);
let tableData = ref([]);
let tableLoading = ref(false);
let fieldsList = ref([]);
let sortFields = ref([]);
watch(
	() => props.field,
	() => {
		cutField.value = props.field;
		initOption();
	},
	{ deep: true }
);
onMounted(() => {
	cutField.value = props.field;
	initOption();
});

let currentPage = ref(1);
let pageSize = ref(20);
let total = ref(0);

let entity = ref("");
let myOptions = ref({});

let builtInFilter = ref({});
let showQueryPanel = ref(false);
const onSearch = (event) => {
    builtInFilter.value = event;
    getTableData();
}

const initOption = async () => {
	let { options } = cutField.value;
    // console.log(props.designer,'designer')
	if (options) {
        showQueryPanel.value = options.setQueryPanel?.isShow;
        let { dsEnabled, dsName, dataSetName } = options;
        if(dsEnabled && dsName) {
            tableLoading.value = true;
            let res = await getDataSourceData(options, getFormConfig()); 
            if(res) {
                let resData = dataSetName ? res[dataSetName] : res;
                tableColumn.value = resData.columnList.map(el => {
                    el.fieldName = el.prop;
                    return el
                });
                formatData(resData.dataList);
            }
            tableLoading.value = false;
            return;
        }
		let { showFields } = options.setDimensional;
		tableColumn.value = [...showFields];
		if (tableColumn.value.length > 0) {
			fieldsList.value = tableColumn.value.map((el) => el.fieldName);
			sortFields.value = [];
			tableColumn.value.forEach((el) => {
				el.prop = el.fieldName;
				if (el.sort) {
					sortFields.value.push({
						fieldName: el.fieldName,
						type: el.sort,
					});
				}
			});
			entity.value =
				options.dataEntity == 33
					? "ApprovalTask"
					: allEntityName.value[options.dataEntity];
            myOptions.value = options;
            currentPage.value = 1;
			getTableData();
		}
	}
};

const handleSizeChange = (v) => {
    pageSize.value = v;
    getTableData();
};

const handleCurrentChange = (v) => {
    currentPage.value = v;
    getTableData();
}

const getTableData = async () => {
	tableLoading.value = true;
	let param = {
		mainEntity: entity.value,
		fieldsList: fieldsList.value.join(),
		pageSize: myOptions.value.showTablePagination
			? pageSize.value
			: myOptions.value.setChartConf.pageSize,
		pageNo: currentPage.value,
		filter: myOptions.value.setChartFilter,
		sortFields: sortFields.value,
        builtInFilter: showQueryPanel.value ? builtInFilter.value : null,
	};
	let res;
	if (entity.value == "ApprovalTask") {
		res = await http.post("/approval/listQuery", {
			mainEntity: param.mainEntity,
			fieldsList: param.fieldsList,
			filter: param.filter,
			pageSize: param.pageSize,
			pageNo: param.pageNo,
			sortFields: param.sortFields,
            advFilter: null,
            quickFilter: null,
            builtInFilter: param.builtInFilter,
		});
	} else {
		res = await getDataList(
			param.mainEntity,
			param.fieldsList,
			param.filter,
			param.pageSize,
			param.pageNo,
			param.sortFields,
            null,
            null,
            param.builtInFilter,
		);
	}
	if (res) {
		let list = res.data.dataList || [];
		total.value = res.data.pagination.total;
		formatData(list);
	}
	tableLoading.value = false;
	// setTimeout(() => {

	//     tableLoading.value = false;
	// }, 500);
};

const formatData = (datList) => {
    let showSumcol = cutField.value?.options.setChartConf.showSumcol;
    // 统一移除已存在的汇总列，防止重复追加
    const removeSumcolColumn = () => {
        tableColumn.value = tableColumn.value.filter(
            (col) => col.fieldName !== "sumcol" && col.prop !== "sumcol"
        );
    };

    if (showSumcol) {
        // 计算时排除汇总列本身
        const baseColumns = tableColumn.value.filter(
            (col) => col.fieldName !== "sumcol" && col.prop !== "sumcol"
        );
        datList.forEach((rowEl) => {
            const values = baseColumns.map((item) =>
                Number(rowEl[item.fieldName] ?? rowEl[item.prop])
            );
            if (!values.every((value) => Number.isNaN(value))) {
                const sum = values.reduce((prev, curr) => {
                    const value = Number(curr);
                    return Number.isNaN(value) ? prev : prev + value;
                }, 0);
                rowEl.sumcol = `${sum}`;
            } else {
                rowEl.sumcol = "N/A";
            }
        });
        // 确保只追加一次“汇总”列
        removeSumcolColumn();
        tableColumn.value.push({
            alias: "汇总",
            fieldName: "sumcol",
            prop: "sumcol",
        });
    } else {
        // 未启用时移除“汇总”列
        removeSumcolColumn();
    }
    tableData.value = [...datList];
}

// 汇总行
const getSummaries = (param) => {
	const { columns, data } = param;
	const sums = [];
	columns.forEach((column, index) => {
		if (index === 0) {
			sums[index] = "汇总：";
			return;
		}
		const values = data.map((item) => Number(item[column.property]));
		if (!values.every((value) => Number.isNaN(value))) {
			sums[index] = `${values.reduce((prev, curr) => {
				const value = Number(curr);
				if (!Number.isNaN(value)) {
					return prev + curr;
				} else {
					return prev;
				}
			}, 0)}`;
		} else {
			sums[index] = "N/A";
		}
	});

	return sums;
};

const onRowClick = (row, column, event) => {
	// console.log(router,'router')
	if (!!cutField.value.options.onRowClick) {
		let customFn = new Function(
			"row",
			"column",
			"event",
			"detailRef",
			"router",
			cutField.value.options.onRowClick
		);
		customFn.call(this, row, column, event, props.detailRef, router);
	}
};

const setSelected = () => {
	props.designer?.setSelected(props.field);
};

useRefreshDashboard(props, initOption);


const getData = () => {
    return tableData.value;
}
defineExpose({
    getData
})
</script>

<style lang="scss" scoped>
.pivot-table-widget {
	height: 100%;
	width: 100%;
	.table-box {
		width: 100%;
		height: 100%;
	}
}
.no-data {
	font-size: 14px;
	.lh {
		color: var(--el-color-primary);
	}
}
.pagination-box {
    display: flex;
    justify-content: center;
    margin-top: 10px;
}
// .el-table {
//     // 解决table组件内容滚动时页面滚动条同步滚动
//     overflow: auto;
//     // 必须设置
//     position: relative;

//     :deep(.el-table__fixed-header-wrapper) thead th > .cell {
//         white-space: nowrap !important; /* 禁止表头换行 */
//     }

//     :deep(.el-table__header-wrapper) thead th > .cell {
//         white-space: nowrap !important; /* 禁止表头换行 */
//     }

//     :deep(.el-table__body-wrapper) {
//         //height: 100% !important;
//     }
// }
// :deep(.el-table .cell) {
//   white-space: nowrap;
// }
</style>
