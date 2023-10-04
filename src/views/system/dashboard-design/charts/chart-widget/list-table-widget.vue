
<template>
    <div class="pivot-table-widget" @click.stop="setSelected">
        <div class="table-box" v-if="tableColumn.length > 0" v-loading="tableLoading">
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
            >
                <el-table-column
                    v-for="(column,inx) of tableColumn"
                    :key="inx"
                    show-overflow-tooltip
                    :label="column.alias"
                    :prop="column.code"
                >
                    <!-- header -->
                    <template #header>
                        <div class="yichu">
                            {{ column.alias }}
                        </div>
                    </template>
                    <template #default="scope">
                        <div class="yichu">{{ scope.row[column.code] }}</div>
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <div class="no-data" v-else>
            请通过右侧
            <span class="lh">显示字段设置</span> 字段栏来添加数据
        </div>
    </div>
</template>

<script setup>
import { onMounted, reactive, ref, watch } from "vue";
defineOptions({
    name: "listTable-widget",
});
const props = defineProps({
    field: Object,
    designer: Object,
});

let cutField = ref("");
let tableColumn = ref([]);
let tableData = ref([]);
let tableLoading = ref(false);
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
            tableLoading.value = true;
            getTableData();
        }
    }
};

const getTableData = () => {
    setTimeout(() => {
        let list = [
            {
                date: "2016-05-03",
                name: "Tom",
                state: "California",
                city: "Los Angeles",
                address: "No. 189, Grove St, Los Angeles",
                age: "18",
                vipLive: 5,
            },
            {
                date: "2016-05-03",
                name: "ASSX",
                state: "California",
                city: "上海市闵行区浦江临港科技广场",
                address: "No. 189, Grove St, Los Angeles",
                age: "21",
                vipLive: 10,
            },
            {
                date: "2016-05-03",
                name: "Dcss",
                state: "California",
                city: "Los Angeles",
                address: "No. 189, Grove St, Los Angeles",
                age: "19",
                vipLive: 7,
            },
        ];
        let showSumcol = cutField.value?.options.setChartConf.showSumcol;
        // 如果需要汇总列
        if (showSumcol) {
            list.forEach((rowEl) => {
                const values = tableColumn.value.map((item) =>
                    Number(rowEl[item.code])
                );
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
                code: "sumcol",
            };
        }
        tableData.value = [...list];
        tableLoading.value = false;
    }, 500);
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