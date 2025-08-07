<template>
    <div 
        class="pivot-table-widget" 
        @click.stop="setSelected" 
        v-loading="loading"
        :class="cutField?.options?.customClass"
    >
        <template v-if="!isNoData">
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
            <div class="table-box" id="container" :style="{'height': tableBoxHeight}">
                <SheetComponent
                    ref="s2"
                    :dataCfg="dataCfg"
                    :options="tableOptions"
                    :adaptive="adaptive"
                />
            </div>
        </template>
        <template v-else>
            <div class="no-data">
                请通过右侧
                <span class="lh">维度指标设置</span> 维度、指标栏来添加数据 或 设置<span class="lh"> 数据源 </span>添加数据
            </div>
        </template>
    </div>
</template>

<script setup>
import { onMounted, reactive, shallowRef, ref, watch, inject, defineAsyncComponent } from "vue";

// 异步加载透视表组件
const SheetComponent = defineAsyncComponent({
    loader: async () => {
        // 同时加载样式和组件
        await import('@antv/s2-vue/dist/style.min.css');
        const { SheetComponent } = await import('@antv/s2-vue');
        return SheetComponent;
    },
    loadingComponent: {
        template: `
            <div v-loading="true" element-loading-text="正在加载透视表组件..." 
                 style="height: 200px; display: flex; align-items: center; justify-content: center; border: 1px dashed #d9d9d9; border-radius: 4px;">
                <span style="color: #999;">透视表加载中...</span>
            </div>
        `
    },
    errorComponent: {
        template: `
            <div style="height: 200px; display: flex; align-items: center; justify-content: center; border: 1px dashed #ff4d4f; border-radius: 4px;">
                <el-alert title="透视表组件加载失败" type="error" description="请检查网络连接后重试" show-icon />
            </div>
        `
    },
    delay: 200,
    timeout: 30000
});
import { queryChartData } from "@/api/chart";
import useChartSourceData from "@/hooks/ChartSourceData";
import CustomQueryPanel from "@/components/mlSetConditions/CustomQueryPanel.vue";
import useCommonStore from "@/store/modules/common";
import { storeToRefs } from "pinia";
import { useRefreshDashboard } from '@/hooks/useRefreshDashboard';
const { allEntityName } = storeToRefs(useCommonStore());
const { getDataSourceData } = useChartSourceData();
const getFormConfig = inject('getFormConfig');

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
                calcFunc: (query, data, spreadsheet) => {
                    let calc = 0;
                    data.forEach(el => {
                        let val = el[query.$$extra$$];
                        if(val) {
                            calc += parseFloat(val.replace(/,/g, ''));
                        }
                    })
                    return Number.isInteger(calc) ? calc : Number(calc.toFixed(2));
                },
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
                calcFunc: (query, data, spreadsheet) => {
                    let calc = 0;
                    data.forEach(el => {
                        let val = el[query.$$extra$$];
                        if(val) {
                            calc += parseFloat(val.replace(/,/g, ''));
                        }
                    })
                    return Number.isInteger(calc) ? calc : Number(calc.toFixed(2));
                },
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
let entity = ref("");
let builtInFilter = ref({});
let showQueryPanel = ref(false);
const onSearch = (event) => {
    builtInFilter.value = event;
    getTableData();
}

const initOption = async () => {
    let { options } = cutField.value;
    if (options) {
        entity.value =
				options.dataEntity == 33
					? "ApprovalTask"
					: allEntityName.value[options.dataEntity];
        showQueryPanel.value = options.setQueryPanel.isShow;
        // 汇总行
        let showSummary = options.setChartConf.showSummary;
        // 汇总列
        let showSumcol = options.setChartConf.showSumcol;
        tableOptions.value.totals.row.showGrandTotals = showSummary;
        tableOptions.value.totals.col.showGrandTotals = showSumcol;
        s2.value?.instance.setOptions(tableOptions.value);
        let { dsEnabled, dsName, dataSetName } = options;
        if(dsEnabled && dsName) {
            loading.value = true;
            let res = await getDataSourceData(options, getFormConfig()); 
            if(res) {
                let resData = dataSetName ? res[dataSetName] : res;
                // 元数据
                dataCfg.value.meta = resData.meta;
                // 字段
                dataCfg.value.fields = resData.fields;
                // 数据
                dataCfg.value.data = resData.data;
                handleResize();
            }
            loading.value = false;
            isNoData.value = false;
            return;
        }
        let { dimensionRow, dimensionCol, metrics } = options.setDimensional;
        // 没有维度行或者指标=没有数据
        if (dimensionRow.length < 1 || metrics.length < 1) {
            isNoData.value = true;
            return;
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
        dataCfg.value.fields[key].push(el.fieldName);
        dataCfg.value.meta.push({
            field: el.fieldName,
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
const getTableData = async () => {
    loading.value = true;
    let { options,type } = cutField.value;
    if (!options) {
        return;
    }
    let otherFilters = showQueryPanel.value ? [builtInFilter.value] : [];
    let res = await queryChartData(options,type,otherFilters);
    if (res && res.data) {
        // 元数据
        dataCfg.value.meta = res.data.meta;
        // 字段
        dataCfg.value.fields = res.data.fields;
        // 数据
        dataCfg.value.data = res.data.data;
        handleResize();
    }
    loading.value = false;
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
    let rowHeight = 36;
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

// 监听mitt事件触发
useRefreshDashboard(props, initOption);


const getData = () => {
    return dataCfg.value;
}
defineExpose({
    getData
})
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