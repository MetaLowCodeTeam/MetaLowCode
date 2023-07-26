<template>
    <div
        class="hello"
        data-1684916215247
        v-loading="pageLoading"
        :element-loading-text="loadingText"
    >
        <div class="db-div">
            <div class="db-title">
                <img src="~@/assets/imgs/blue.png" class="side-icon" alt="save" />
                <span class="db-title-span">表单模板设计</span>
            </div>
            <div class="db-dbs">
                <el-menu active-text-color="#E6F7FF" ref="Elmenu" :default-openeds="openeds">
                    <el-sub-menu v-for="(item,inx) of menuList" :key="inx" :index="item.index">
                        <template #title>
                            <el-icon>
                                <Document />
                            </el-icon>
                            <span class="item-title">{{ item.label }}</span>
                        </template>
                        <el-sub-menu
                            v-for="(erItem,erInx) of item.itemList"
                            :key="erInx"
                            :index="item.index + '-' + (erInx + 1)"
                        >
                            <template #title>
                                <span class="erItem-title">{{ erItem.label }}</span>
                            </template>
                            <el-menu-item
                                v-for="(subItem,subInx) of erItem.fieldList"
                                :key="subInx"
                                :index="item.index + '-' + (erInx + 1) + '-' + (subInx + 1)"
                            >
                                <VueDraggableNext
                                    v-model="erItem.fieldList"
                                    class="wrapper"
                                    :sort="false"
                                    :disabled="false"
                                >
                                    <span
                                        class="menu-item-list"
                                        @dragend="endDraggable(subItem)"
                                    >{{ subItem.name }}</span>
                                </VueDraggableNext>
                            </el-menu-item>
                        </el-sub-menu>
                    </el-sub-menu>
                </el-menu>
            </div>
        </div>
        <div class="center">
            <ml-report ref="MlReportRef" @cellClickFn="cellClickFn" @onSave="onSave" />
        </div>
        <div class="bd-right" :class="{'rightContentShow':rightContentShow}">
            <div class="bd-r-title">数据格式化</div>

            <!-- 日期格式化 -->
            <div class="mb-28" v-if="cellFormat.Date">
                <div class="filed">日期格式化</div>
                <el-select
                    v-model="cellFormat.dateFormat"
                    placeholder="请选择日期格式"
                    size="small"
                    @change="cellFormatChange('dateFormat')"
                >
                    <el-option key="1" value="yyyy年MM月dd日" label="2023年01月01日"></el-option>
                    <el-option key="2" value="yyyy.MM.dd" label="2023.01.01"></el-option>
                    <el-option key="3" value="yyyy-MM-dd" label="2023-01-01"></el-option>
                    <el-option key="4" value="yyyy/MM/dd" label="2023/01/01"></el-option>
                </el-select>
            </div>
            <!-- 日期时间格式化 -->
            <div class="mb-28" v-if="cellFormat.DateTime">
                <div class="filed">日期时间格式化</div>
                <el-select
                    v-model="cellFormat.dateTimeFormat"
                    placeholder="请选择日期时间格式"
                    size="small"
                    @change="cellFormatChange('dateTimeFormat')"
                    class="cell-format-select"
                >
                    <el-option key="1" value="yyyy年MM月dd日 HH时mm分ss秒" label="2023年01月01日 01时01分01秒"></el-option>
                    <el-option key="2" value="yyyy年MM月dd日 HH时mm分" label="2023年01月01日 01时01分"></el-option>
                    <el-option key="3" value="yyyy年MM月dd日 HH时" label="2023年01月01日 01时"></el-option>
                    <el-option key="4" value="yyyy/MM/dd HH:mm:ss" label="2023/01/01 01:01:01"></el-option>
                    <el-option key="5" value="yyyy/MM/dd HH:mm" label="2023/01/01 01:01"></el-option>
                </el-select>
            </div>
            <!-- 时间格式化 -->
            <div class="mb-28" v-if="cellFormat.Time">
                <div class="filed">时间格式化</div>
                <el-select
                    v-model="cellFormat.timeFormat"
                    placeholder="请选择时间格式"
                    size="small"
                    @change="cellFormatChange('timeFormat')"
                >
                    <el-option key="1" value="HH时mm分ss秒" label="01时01分01秒"></el-option>
                    <el-option key="2" value="HH时mm分" label="01时01分"></el-option>
                    <el-option key="3" value="HH时" label="01时"></el-option>
                    <el-option key="4" value="HH:mm:ss" label="01:01:01"></el-option>
                    <el-option key="5" value="HH:mm" label="01:01"></el-option>
                </el-select>
            </div>
            <!-- 金额转大小写 -->
            <div class="mb-28" v-if="cellFormat.Num">
                <div class="filed">金额转大小写</div>
                <el-checkbox
                    v-model="cellFormat.amountFormat"
                    @change="cellFormatChange('amountFormat')"
                >金额转大小写</el-checkbox>
            </div>
        </div>
    </div>
</template>

<script setup>
import "./luckysheet.scss";
import http from "@/utils/request";
import { saveRecord } from "@/api/crud";
import { onBeforeMount, reactive, ref,inject } from "vue";
import { useRouter } from "vue-router";
import { Document } from "@element-plus/icons-vue";
import { VueDraggableNext } from "vue-draggable-next";
const $ElMessage = inject("$ElMessage");
const router = useRouter();
let pageLoading = ref(false);
let loadingText = ref("数据加载中...");
// 当前表唯一值
let reportConfigId = ref("");
// 当前实体
let entityCode = ref("");
// 菜单列表
let menuList = ref([]);
// 默认展开的层级
let openeds = ref([]);
// 当前格子的批注
let cellPs = reactive({});
// 右边格式化是否显示
let rightContentShow = ref(false);
// 单元格数据格式化
let cellFormat = reactive({});
let cloneCellFormat = reactive({
    // 时间格式化
    Time: false,
    timeFormat: "",
    // 日期格式化
    Date: false,
    dateFormat: "",
    // 日期时间格式化
    DateTime: false,
    dateTimeFormat: "",
    // 数字格式化
    Num: false,
    // 金额格式化
    amountFormat: false,
});
// 点击单元格纵横坐标
let cellR = ref();
let cellC = ref();
// 当前点击的单元格数据
let cutSelectCell = reactive({});
// 当前表格
let MlReportRef = ref();
onBeforeMount(() => {
    reportConfigId.value = router.currentRoute.value.query.reportConfigId;
    initData();
});

// 拖拽事件
function endDraggable(subItem) {
    let cell = {
        m: "【" + subItem.name + "】",
        v: "【" + subItem.name + "】",
        ps: {
            value: JSON.stringify(subItem), //批准内容
            isshow: true, //批注框为显示状态
        },
    };
    MlReportRef.value.endDraggable(cell);
}

// 单元格点击
function cellClickFn(event) {
    cellR.value = event.r;
    cellC.value = event.c;
    let sheet = event.sheet;
    rightContentShow.value = false;
    // 获取选中数据
    cutSelectCell = Object.assign({}, sheet.data[cellR.value][cellC.value]);
    // 初始化数据格式化
    cellFormat = Object.assign({}, cloneCellFormat);
    if (cutSelectCell && cutSelectCell.ps) {
        initCellFormat(cutSelectCell.ps);
    }
}

// 初始化批注类型
const initCellFormat = (ps) => {
    cellPs = Object.assign({}, JSON.parse(ps.value));
    if (!cellPs.formatMap) {
        cellPs.formatMap = {};
    }
    // 获取当前类型
    let formatMap = cellPs.formatMap;
    let type = cellPs.type;
    let needShowRightContent = ["Date", "DateTime", "Time", "Num"];
    if (needShowRightContent.includes(type)) {
        rightContentShow.value = true;
    }

    // 当前类型设置显示
    cellFormat[type] = true;
    let cellKey;
    if (type == "num") {
        cellKey = "amountFormat";
    } else {
        cellKey = type + "Format";
    }
    // 设置当前类型的值
    cellFormat[cellKey] = formatMap[cellKey] || "";
};

// 数据格式化触发
function cellFormatChange(targe) {
    cellPs.formatMap[targe] = cellFormat[targe];
    cutSelectCell.ps.value = JSON.stringify(cellPs);
    MlReportRef.value.cellFormatChange(
        cellR.value,
        cellC.value,
        Object.assign({}, cutSelectCell)
    );
}

// 初始化数据
function initData() {
    pageLoading.value = true;
    Promise.all([getEntityData(), getWorkBook()]).then(() => {
        pageLoading.value = false;
    });
}

// 获取菜单数据
function getEntityData() {
    return new Promise(async (resolve, reject) => {
        let menuRes = await http.get("/report/getEntityList", {
            reportConfigId: reportConfigId.value,
        });
        if (menuRes.code === 200) {
            let resDataList = menuRes.data || [];
            openeds.value = [];
            resDataList.map((el, inx) => {
                el.index = inx + 1 + "";
                openeds.value.push(el.index);
            });
            menuList.value = resDataList;
            resolve();
        } else {
            message.error("获取菜单失败：" + menuRes.error);
            resolve();
        }
    });
}
// 获取报表数据
function getWorkBook() {
    return new Promise(async (resolve, reject) => {
        let res = await http.get("/crud/queryById", {
            entityId: reportConfigId.value,
            fieldNames: "reportConfigId,reportName,reportJson,entityCode",
        });
        if (res.code === 200) {
            let resData = res.data;
            let reportJson = JSON.parse(resData.reportJson);
            entityCode.value = resData.entityCode;
            setTimeout(() => {
                MlReportRef.value.createLuckysheet(
                    resData.reportName,
                    reportJson
                );
            }, 200);
            resolve();
        } else {
            message.error("获取内容失败：" + res.error);
            resolve();
        }
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
    if (res.code === 200) {
        $ElMessage.success("保存成功");
    } else {
        $ElMessage.error("保存失败：" + res.error);
    }
    pageLoading.value = false;
    loadingText.value = "加载中...";
}
</script>

<style lang="scss" scoped>
</style>