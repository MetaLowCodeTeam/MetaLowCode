<template>
    <div class="pivot-table-widget" @click.stop="setSelected" v-loading="loading">
        <div class="table-box" id="container" :style="{'height': tableBoxHeight}">
            <SheetComponent
                ref="s2"
                :dataCfg="dataCfg"
                :options="tableOptions"
                :adaptive="adaptive"
            />
        </div>
        <div class="page-box">分页信息 {{ tableOptions.totals.row.showGrandTotals }}</div>
        <!-- <div class="table-box" ref="tableBoxRefs">
            
        </div>
        <div>测试</div>-->
    </div>
</template>

<script setup>
import { SheetComponent, TableSheet } from "@antv/s2-vue";
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

let s2DataConfig = {
    fields: {
        rows: ["province", "city"],
        columns: ["type", "sub_type"],
        values: ["number"],
    },
    meta: [
        {
            field: "number",
            name: "数量",
        },
        {
            field: "province",
            name: "省份",
        },
        {
            field: "city",
            name: "城市",
        },
        {
            field: "type",
            name: "类别",
        },
        {
            field: "sub_type",
            name: "子类别",
        },
    ],
    data: [
        {
            number: 1176,
            province: "山东省",
            city: "济南市",
            type: "家具",
            sub_type: "桌子",
        },
        {
            number: 2258,
            province: "湖南省",
            city: "长沙市",
            type: "家具",
            sub_type: "桌子",
        },
        {
            number: 1176,
            province: "湖南省",
            city: "长沙A市",
            type: "家具",
            sub_type: "桌子",
        },
        {
            number: 442,
            province: "湖南省",
            city: "长沙B市",
            type: "家具",
            sub_type: "桌子",
        },
        {
            number: 3321,
            province: "湖南省",
            city: "长沙C市",
            type: "家具",
            sub_type: "桌子",
        },
        {
            number: 7789,
            province: "浙江省",
            city: "杭州市",
            type: "家具",
            sub_type: "桌子",
        },
        {
            number: 2367,
            province: "浙江省",
            city: "绍兴市",
            type: "家具",
            sub_type: "桌子",
        },
        {
            number: 3877,
            province: "浙江省",
            city: "宁波市",
            type: "家具",
            sub_type: "桌子",
        },
        {
            number: 4342,
            province: "浙江省",
            city: "舟山市",
            type: "家具",
            sub_type: "桌子",
        },
        {
            number: 5343,
            province: "浙江省",
            city: "杭州市",
            type: "家具",
            sub_type: "沙发",
        },
        {
            number: 632,
            province: "浙江省",
            city: "绍兴市",
            type: "家具",
            sub_type: "沙发",
        },
        {
            number: 7234,
            province: "浙江省",
            city: "宁波市",
            type: "家具",
            sub_type: "沙发",
        },
        {
            number: 834,
            province: "浙江省",
            city: "舟山市",
            type: "家具",
            sub_type: "沙发",
        },
        {
            number: 945,
            province: "浙江省",
            city: "杭州市",
            type: "办公用品",
            sub_type: "笔",
        },
        {
            number: 1304,
            province: "浙江省",
            city: "绍兴市",
            type: "办公用品",
            sub_type: "笔",
        },
        {
            number: 1145,
            province: "浙江省",
            city: "宁波市",
            type: "办公用品",
            sub_type: "笔",
        },
        {
            number: 1432,
            province: "浙江省",
            city: "舟山市",
            type: "办公用品",
            sub_type: "笔",
        },
        {
            number: 1343,
            province: "浙江省",
            city: "杭州市",
            type: "办公用品",
            sub_type: "纸张",
        },
        {
            number: 1354,
            province: "浙江省",
            city: "绍兴市",
            type: "办公用品",
            sub_type: "纸张",
        },
        {
            number: 1523,
            province: "浙江省",
            city: "宁波市",
            type: "办公用品",
            sub_type: "纸张",
        },
        {
            number: 1634,
            province: "浙江省",
            city: "舟山市",
            type: "办公用品",
            sub_type: "纸张",
        },
        {
            number: 1723,
            province: "四川省",
            city: "成都市",
            type: "家具",
            sub_type: "桌子",
        },
        {
            number: 1822,
            province: "四川省",
            city: "绵阳市",
            type: "家具",
            sub_type: "桌子",
        },
        {
            number: 1943,
            province: "四川省",
            city: "南充市",
            type: "家具",
            sub_type: "桌子",
        },
        {
            number: 2330,
            province: "四川省",
            city: "乐山市",
            type: "家具",
            sub_type: "桌子",
        },
        {
            number: 2451,
            province: "四川省",
            city: "成都市",
            type: "家具",
            sub_type: "沙发",
        },
        {
            number: 2244,
            province: "四川省",
            city: "绵阳市",
            type: "家具",
            sub_type: "沙发",
        },
        {
            number: 2333,
            province: "四川省",
            city: "南充市",
            type: "家具",
            sub_type: "沙发",
        },
        {
            number: 2445,
            province: "四川省",
            city: "乐山市",
            type: "家具",
            sub_type: "沙发",
        },
        {
            number: 2335,
            province: "四川省",
            city: "成都市",
            type: "办公用品",
            sub_type: "笔",
        },
        {
            number: 245,
            province: "四川省",
            city: "绵阳市",
            type: "办公用品",
            sub_type: "笔",
        },
        {
            number: 2457,
            province: "四川省",
            city: "南充市",
            type: "办公用品",
            sub_type: "笔",
        },
        {
            number: 2458,
            province: "四川省",
            city: "乐山市",
            type: "办公用品",
            sub_type: "笔",
        },
        {
            number: 4004,
            province: "四川省",
            city: "成都市",
            type: "办公用品",
            sub_type: "纸张",
        },
        {
            number: 3077,
            province: "四川省",
            city: "绵阳市",
            type: "办公用品",
            sub_type: "纸张",
        },
        {
            number: 3551,
            province: "四川省",
            city: "南充市",
            type: "办公用品",
            sub_type: "纸张",
        },
        {
            number: 352,
            province: "四川省",
            city: "乐山市",
            type: "办公用品",
            sub_type: "纸张",
        },
    ],
    test: 123,
};

const s2 = shallowRef();
// dataCfg 数据字段较多，建议使用 shallow, 如果有数据更改直接替换整个对象
let dataCfg = ref(s2DataConfig);
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
        // console.log("s2 instance:",);
        // });
        loading.value = true;
        setTimeout(() => {
            dataCfg.value.data = [
                {
                    number: 1176,
                    province: "山东省",
                    city: "济南市",
                    type: "家具",
                    sub_type: "桌子",
                },
            ];
            loading.value = false;
            handleResize();
        }, 1000);
    }
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
    // let rowHeight = 40
    // tableBoxHeight.value =
    //     // 数据行高
    //     (rowLine > 9 ? 10 : rowLine) * rowHeight +
    //     // 列数行高
    //     columns.length * rowHeight +
    //     // 当前行高
    //     rowHeight +
    //     // 汇总行高
    //     (tableOptions.value.totals.row.showGrandTotals ? rowHeight : 0) +
    //     "px";
};

const setSelected = () => {
    props.designer?.setSelected(props.field);
};
</script>

<style lang="scss" scoped>
.pivot-table-widget {
    width: 100%;
}
</style>