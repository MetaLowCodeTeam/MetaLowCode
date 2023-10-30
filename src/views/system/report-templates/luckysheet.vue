<template>
    <div
        data-1684916215247
        v-loading="pageLoading"
        :element-loading-text="loadingText"
        class="w-100"
    >
        <MlReport
            v-if="isLoad"
            @onSave="onSave"
            :reportName="reportName"
            :dbList="menuList"
            :sheets="sheets"
        />
    </div>
</template>

<script setup>
import { MlReport } from "vue3-manner-report";
import "./luckysheet.scss";
import http from "@/utils/request";
import { saveRecord } from "@/api/crud";
import {
    onBeforeMount,
    ref,
    inject,
    shallowRef,
} from "vue";
import { useRouter } from "vue-router";
const $ElMessage = inject("$ElMessage");
const router = useRouter();
let pageLoading = ref(false);
let loadingText = ref("数据加载中...");
// 数据是否加载完成
let isLoad = ref(false);
// 当前表唯一值
let reportConfigId = ref("");
// 当前实体
let entityCode = ref("");
// 菜单列表
let menuList = ref([]);

let defaultSheets = shallowRef([
    {
        name: "Cell", //工作表名称
        color: "", //工作表颜色
        index: 0, //工作表索引
        status: 1, //激活状态
        order: 0, //工作表的下标
        hide: 0, //是否隐藏
        row: 40, //行数
        column: 20, //列数
        defaultRowHeight: 19, //自定义行高
        defaultColWidth: 73, //自定义列宽
        celldata: [], //初始化使用的单元格数据
        config: {
            merge: {}, //合并单元格
            rowlen: {}, //表格行高
            columnlen: {}, //表格列宽
            rowhidden: {}, //隐藏行
            colhidden: {}, //隐藏列
            borderInfo: [], //边框
            authority: {}, //工作表保护
        },
        scrollLeft: 0, //左右滚动条位置
        scrollTop: 0, //上下滚动条位置
        luckysheet_select_save: [], //选中的区域
        calcChain: [], //公式链
        isPivotTable: false, //是否数据透视表
        pivotTable: {}, //数据透视表设置
        filter_select: {}, //筛选范围
        filter: null, //筛选配置
        luckysheet_alternateformat_save: [], //交替颜色
        luckysheet_alternateformat_save_modelCustom: [], //自定义交替颜色
        luckysheet_conditionformat_save: {}, //条件格式
        frozen: {}, //冻结行列配置
        chart: [], //图表配置
        zoomRatio: 1, // 缩放比例
        image: [], //图片
        showGridLines: 1, //是否显示网格线
        dataVerification: {}, //数据验证配置
    },
]);

// 传参
let sheets = ref();
let reportName = ref("");
onBeforeMount(() => {
    reportConfigId.value = router.currentRoute.value.query.reportConfigId;
    initData();
});

// 初始化数据
function initData() {
    pageLoading.value = true;
    Promise.all([getEntityData(), getWorkBook()]).then(() => {
        pageLoading.value = false;
        isLoad.value = true;
    });
}

// 获取菜单数据
function getEntityData() {
    return new Promise(async (resolve, reject) => {
        let menuRes = await http.get("/plugins/mannerReport/getEntityList", {
            reportConfigId: reportConfigId.value,
        });
        if (menuRes) {
            let resDataList = menuRes.data || [];
            menuList.value = resDataList;
        }
        resolve();
    });
}
// 获取报表数据
function getWorkBook() {
    return new Promise(async (resolve, reject) => {
        let res = await http.get("/crud/queryById", {
            entityId: reportConfigId.value,
            fieldNames: "reportConfigId,reportName,reportJson,entityCode",
        });
        if (res) {
            let resData = res.data;
            let reportJson = JSON.parse(resData.reportJson);
            entityCode.value = resData.entityCode;
            reportName.value = resData.reportName;
            // 如果是新建
            if (!reportJson) {
                sheets.value = defaultSheets.value;
            } else {
                sheets.value = reportJson;
            }
        }
        resolve();
    });
}
// 保存数据
async function onSave(event) {
    pageLoading.value = true;
    loadingText.value = "保存中...";
    let params = {
        entity: "ReportConfig",
        id: reportConfigId.value,
        formModel: {
            reportName: event.reportName,
            reportJson: event.reportJson,
            entityCode: entityCode.value,
        },
    };
    let res = await saveRecord(params.entity, params.id, params.formModel);
    if (res) {
        $ElMessage.success("保存成功");
    }
    pageLoading.value = false;
    loadingText.value = "加载中...";
}
</script>

<style lang="scss" scoped>
</style>