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
			<el-table
				size="small"
				:data="tableData"
				:border="true"
				style="width: 100%"
				:max-height="320"
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
		</div>
		<div class="no-data" v-else>
			请通过右侧
			<span class="lh">显示字段设置</span> 字段栏来添加数据
		</div>
	</div>
    <!-- <mlCustomDetail ref="detailRef" /> -->
</template>

<script setup>
import { onMounted, reactive, ref, watch } from "vue";
import useCommonStore from "@/store/modules/common";
import { storeToRefs } from "pinia";
import { getDataList } from "@/api/crud";
// import mlCustomDetail from "@/components/mlCustomDetail/index.vue";
import FormatRow from "@/components/simpleTable/FormatRow.vue";
import { useRouter } from "vue-router";
import http from "@/utils/request";
const { allEntityName } = storeToRefs(useCommonStore());
const router = useRouter();


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

const initOption = () => {
	let { options } = cutField.value;
	if (options) {
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
			getTableData(options);
		}
	}
};

const getTableData = async (options) => {
    let entity = options.dataEntity == 33 ? "ApprovalTask" : allEntityName.value[options.dataEntity];
	tableLoading.value = true;
	let param = {
		mainEntity: entity,
		fieldsList: fieldsList.value.join(),
		pageSize: options.setChartConf.pageSize,
		pageNo: 1,
		filter: options.setChartFilter,
		sortFields: sortFields.value,
	};
	let res;
    if(entity == "ApprovalTask"){
        res = await http.post("/approval/listQuery", {
            mainEntity: param.mainEntity,
            fieldsList: param.fieldsList,
            filter: param.filter,
            pageSize: param.pageSize,
            pageNo: param.pageNo,
            sortFields: param.sortFields
    });
    }else {
        res = await getDataList(
            param.mainEntity,
            param.fieldsList,
            param.filter,
            param.pageSize,
            param.pageNo,
            param.sortFields
        );
    }
	if (res) {
		let list = res.data.dataList || [];
		let showSumcol = cutField.value?.options.setChartConf.showSumcol;
		// 如果需要汇总列
		if (showSumcol) {
			list.forEach((rowEl) => {
				const values = tableColumn.value.map((item) =>
					Number(rowEl[item.fieldName])
				);
				// console.log(values,'values')
				if (!values.every((value) => Number.isNaN(value))) {
					rowEl.sumcol = `${values.reduce((prev, curr) => {
						const value = Number(curr);
						if (!Number.isNaN(value)) {
							return prev + curr;
						} else {
							return prev;
						}
					}, 0)}`;
				} else {
					rowEl.sumcol = "N/A";
				}
			});
			tableColumn.value[tableColumn.value.length] = {
				alias: "汇总",
				fieldName: "sumcol",
			};
		}
		tableData.value = [...list];
	}
	tableLoading.value = false;
	// setTimeout(() => {

	//     tableLoading.value = false;
	// }, 500);
};

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
