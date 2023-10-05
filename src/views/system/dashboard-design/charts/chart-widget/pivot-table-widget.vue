<template>
    <div class="pivot-table-widget" @click.stop="setSelected" v-loading="loading">
        <template v-if="!isNoData">
            <div class="table-box" id="container" :style="{'height': tableBoxHeight}">
                <SheetComponent
                    ref="s2"
                    :dataCfg="dataCfg"
                    :options="tableOptions"
                    :adaptive="adaptive"
                />
            </div>
            <div class="page-box">
                <el-pagination
                    style="justify-content:right"
                    v-model:current-page="paginationConf.page"
                    :page-size="paginationConf.pageSize"
                    layout="total, prev, pager, next"
                    :total="paginationConf.total"
                    @current-change="handleCurrentChange"
                />
            </div>
        </template>
        <template v-else>
            <div class="no-data">
                请通过右侧
                <span class="lh">维度指标设置</span> 维度、指标栏来添加数据
            </div>
        </template>
    </div>
</template>

<script setup>
import { SheetComponent } from "@antv/s2-vue";
import { onMounted, reactive, shallowRef, ref, watch } from "vue";
import "@antv/s2-vue/dist/style.min.css";
const adaptive = {
    width: true,
    height: true,
    getContainer: () => document.getElementById("container"),
};
defineOptions({
    name: "pivotTable-widget",
});
const props = defineProps({
    field: Object,
    designer: Object,
});
// 透视表
const s2 = shallowRef();
// 透视表参数
let s2DataConfig = {
    fields: {
        rows: ["province", "city"],
        columns: [],
        values: ["number", "price"],
    },
    meta: [
        // {
        //     field: "price",
        //     name: "价格",
        // },
    ],
    data: [],
};
// dataCfg 数据字段较多，建议使用 shallow, 如果有数据更改直接替换整个对象
let dataCfg = ref(s2DataConfig);
// 透视表设置
let tableOptions = ref({
    // height:60,
    totals: {
        row: {
            showGrandTotals: false,
            showSubTotals: false,
            reverseLayout: false,
            reverseSubLayout: false,
            subTotalsDimensions: ["number"],
            label: "汇总",
            calcTotals: {
                aggregation: "SUM",
            },
        },
        col: {
            showGrandTotals: true,
            showSubTotals: false,
            reverseLayout: false,
            reverseSubLayout: false,
            subTotalsDimensions: ["number"],
            label: "汇总",
            calcTotals: {
                aggregation: "SUM",
            },
        },
    },
});

let cutField = ref("");
let loading = ref(false);
let isNoData = ref(true);
let paginationConf = reactive({
    page: 1,
    pageSize: 20,
    total: 100,
});
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
        // 汇总行
        let showSummary = cutField.value?.options.setChartConf.showSummary;
        // 汇总列
        let showSumcol = cutField.value?.options.setChartConf.showSumcol;
        tableOptions.value.totals.row.showGrandTotals = showSummary;
        tableOptions.value.totals.col.showGrandTotals = showSumcol;
        s2.value?.instance.setOptions(tableOptions.value);
        let { dimensionRow, dimensionCol, metrics } = options.setDimensional;
        // 没有维度行或者指标=没有数据
        if (dimensionRow.length < 1 || metrics.length < 1) {
            isNoData.value = true;
            return;
        }
        // 元字段格式化名字
        dataCfg.value.meta = [];

        // 维度行设置
        dataCfg.value.fields.rows = [];
        setPivotTableConf(dimensionRow, "rows");

        // 指标设置
        dataCfg.value.fields.values = [];
        setPivotTableConf(metrics, "values");
        // 维度列设置
        if (dimensionCol.length > 0) {
            dataCfg.value.fields.columns = [];
            setPivotTableConf(dimensionCol, "columns");
        }

        // 获取表格数据
        getTableData();
        isNoData.value = false;
    } else {
        isNoData.value = true;
    }
};

// 设置透视表参数
const setPivotTableConf = (arr, key) => {
    arr.forEach((el) => {
        dataCfg.value.fields[key].push(el.code);
        dataCfg.value.meta.push({
            field: el.code,
            name: el.alias,
        });
    });
};
// 分页切换
const handleCurrentChange = (v) => {
    paginationConf.page = v;
    getTableData();
};
// 获取表格数据
const getTableData = () => {
    loading.value = true;
    setTimeout(() => {
        dataCfg.value.data = [
            {
                zhi: 1176,
                price: 25,
                hang: "透视表行测试数据",
                city: "济南市",
                lie: "家具",
                sub_type: "桌子",
            },
        ];
        paginationConf.total = dataCfg.value.data.length;
        loading.value = false;
        handleResize();
    }, 1000);
};

let tableBoxHeight = ref("300px");
const handleResize = () => {
    // 拿行配置
    let rowsList = dataCfg.value.fields.rows;
    // 拿列配置
    let columns = dataCfg.value.fields.columns;
    // 拿所有数据
    let dataList = dataCfg.value.data;
    // 格式化行信息
    let sumObj = {};
    rowsList.forEach((el, inx) => {
        sumObj[inx] = [];
        dataList.forEach((subEl) => {
            if (!sumObj[inx].includes(subEl[el])) {
                sumObj[inx].push(subEl[el]);
            }
        });
    });
    // 取最大的行数
    let rowLine = 0;
    for (const key in sumObj) {
        if (Object.hasOwnProperty.call(sumObj, key)) {
            const element = sumObj[key];
            if (element.length > rowLine) {
                rowLine = element.length;
            }
        }
    }
    // 行高
    let rowHeight = 32;
    tableBoxHeight.value =
        // 数据行高
        (rowLine > 9 ? 10 : rowLine) * rowHeight +
        // 列数行高
        columns.length * rowHeight +
        // 当前行高
        rowHeight +
        // 汇总行高
        (tableOptions.value.totals.row.showGrandTotals ? rowHeight : 0) +
        "px";
};

const setSelected = () => {
    props.designer?.setSelected(props.field);
};
</script>

<style lang="scss" scoped>
.pivot-table-widget {
    width: 100%;
    height: 100%;
}
.no-data {
    font-size: 14px;
    .lh {
        color: var(--el-color-primary);
    }
}
</style>