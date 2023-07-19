<template>
    <div class="hello" data-1684916215247>
        <div class="db-div" v-loading="isMaskShow">
            <div class="db-title">
                <img src="~@/assets/imgs/blue.png" class="side-icon" alt="save" />
                <span class="db-title-span">表单模板设计</span>
            </div>
            <div class="db-dbs">
                <el-menu active-text-color="#E6F7FF" ref="Elmenu" :default-openeds="openeds">
                    <el-sub-menu v-for="(item,inx) of dbList" :key="inx" :index="item.index">
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
            <div id="luckysheet"></div>
        </div>
        <div class="bd-right" v-loading="isMaskShow" :class="{'rightContentShow':rightContentShow}">
            <div class="bd-r-title">数据格式化</div>

            <!-- 日期格式化 -->
            <div class="mb-28" v-if="cellFormat.date">
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
            <div class="mb-28" v-if="cellFormat.dateTime">
                <div class="filed">日期时间格式化</div>
                <el-select
                    v-model="cellFormat.dateTimeFormat"
                    placeholder="请选择日期时间格式"
                    size="small"
                    @change="cellFormatChange('dateTimeFormat')"
                >
                    <el-option key="1" value="yyyy年MM月dd日 HH时mm分ss秒" label="2023年01月01日 01时01分01秒"></el-option>
                    <el-option key="2" value="yyyy年MM月dd日 HH时mm分" label="2023年01月01日 01时01分"></el-option>
                    <el-option key="3" value="yyyy年MM月dd日 HH时" label="2023年01月01日 01时"></el-option>
                    <el-option key="4" value="yyyy/MM/dd HH:mm:ss" label="2023/01/01 01:01:01"></el-option>
                    <el-option key="5" value="yyyy/MM/dd HH:mm" label="2023/01/01 01:01"></el-option>
                </el-select>
            </div>
            <!-- 时间格式化 -->
            <div class="mb-28" v-if="cellFormat.time">
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
            <div class="mb-28" v-if="cellFormat.num">
                <div class="filed">金额转大小写</div>
                <el-checkbox
                    v-model="cellFormat.amountFormat"
                    @change="cellFormatChange('amountFormat')"
                >金额转大小写</el-checkbox>
            </div>
        </div>
        <div class="save-loading" v-if="saveLoading">
            <div class="loading-div">
                <div class="loading-icon">
                    <i class="el-icon-loading"></i>
                </div>
                <div class="loading-text">数据保存中...</div>
            </div>
        </div>
    </div>
</template>

<script setup>
import "./luckysheet.scss";
import http from "@/utils/request";
import { onMounted, onBeforeUnmount, reactive, ref, inject } from "vue";
import { useRouter } from "vue-router";
import { Document } from "@element-plus/icons-vue";
import { VueDraggableNext } from "vue-draggable-next";
import { saveRecord } from "@/api/crud";
const message = inject("$ElMessage");
const cloneDeep = inject("$CloneDeep");
const router = useRouter();
// 保存loading
let saveLoading = ref(false);
// 遮罩层
let isMaskShow = ref(false);
// 默认展开的层级
let openeds = ref([]);
// 拖拽停止单元格横/纵坐标
let dragEndR = ref(0);
let dragEndC = ref(0);
// 是否正在拖拽
let isDraggable = ref(false);
// 单元格数据格式化
let cellFormat = reactive({});
let cloneCellFormat = reactive({
    // 时间格式化
    time: false,
    timeFormat: "",
    // 日期格式化
    date: false,
    dateFormat: "",
    // 日期时间格式化
    dateTime: false,
    dateTimeFormat: "",
    // 数字格式化
    num: false,
    // 金额格式化
    amountFormat: false,
});
// 当前选中单元格数据
let cutSelectCell = reactive({});
// 当前格子的批注
let cellPs = reactive({});
// 当前表唯一值
let gridKey = ref("");
// 右侧内容是否显示
let rightContentShow = ref(false);
// 左侧菜单列表
let dbList = ref([]);
// 实体CODE
let entityCode = ref("");

onMounted(() => {
    gridKey.value = router.currentRoute.value.query.gridKey;
    // 监听点击和按键
    window.addEventListener("keydown", handleKeydownEvent);
    window.addEventListener("click", handleDocumentClick);
    setTimeout(() => {
        // 获取左侧三级实体
        getEntityData();
        // 获取模板
        getWorkBook();
    }, 200);
});

// 初始化表格
const initLuckysheet = (gridKey, title, sheets) => {
    let defaultSheetData = [
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
                borderInfo: {}, //边框
                authority: {}, //工作表保护
            },
            scrollLeft: 0, //左右滚动条位置
            scrollTop: 315, //上下滚动条位置
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
    ];
    luckysheet.create({
        gridKey: gridKey,
        container: "luckysheet", // 设定DOM容器的id
        title: title || "Luckysheet Demo", // 设定表格名称
        lang: "zh", // 设定表格语言
        plugins: ["chart"],
        // showinfobar: false, // 是否显示顶部信息栏
        allowEdit: true,
        index: "0", //工作表索引
        status: "1", //激活状态
        order: "0", //工作表的顺序
        hide: "0", //是否隐藏
        myFolderUrl: '/templates-list',
        data: sheets || defaultSheetData,
        showtoolbarConfig: {
            save: true,
            currencyFormat: true, //货币格式
            percentageFormat: true, //百分比格式
            numberDecrease: true, // '减少小数位数'
            numberIncrease: true, // '增加小数位数
            moreFormats: true, // '更多格式'
            border: true, // '边框'
            textWrapMode: true, // '换行方式'
            textRotateMode: false, // '文本旋转方式'
            image: true, // '插入图片'
            chart: false, // '图表'（图标隐藏，但是如果配置了chart插件，右击仍然可以新建图表）
            postil: false, //'批注'
            pivotTable: false, //'数据透视表'
            function: false, // '公式'
            frozenMode: false, // '冻结方式'
            sortAndFilter: true, // '排序和筛选'
            conditionalFormat: false, // '条件格式'
            dataVerification: false, // '数据验证'
            splitColumn: true, // '分列'
            screenshot: true, // '截图'
            protection: false, // '工作表保护'
            print: true, // '打印'
        },
        cellRightClickConfig: {
            copyAs: true, // 复制为
            deleteCell: true, // 删除单元格
            hideRow: true, // 隐藏选中行和显示选中行
            hideColumn: true, // 隐藏选中列和显示选中列
            matrix: true, // 矩阵操作选区
            sort: true, // 排序选区
            filter: true, // 筛选选区
            chart: true, // 图表生成
            image: true, // 插入图片
            data: false, // 数据验证
            cellFormat: true, // 设置单元格格式
            clear: true,
        },
        hook: {
            cellDragStop: cellDragStopFn,
            clearCellContent: clearCellContentFn,
            cellClick: cellClickFn,
        },
    });
};
// 拖拽记录单元格横纵坐标
const cellDragStopFn = (cell, position) => {
    dragEndR.value = position.r;
    dragEndC.value = position.c;
    // 是正在拖拽
    isDraggable.value = true;
};
//拖拽结束事件
const endDraggable = (subItem) => {
    // 如果不是拖拽，不设置指
    if (!isDraggable.value) {
        return;
    }
    luckysheet.setCellValue(
        dragEndR.value,
        dragEndC.value,
        {
            m: "【" + subItem.name + "】",
            v: "【" + subItem.name + "】",
            ps: {
                value: JSON.stringify(subItem), //批准内容
                isshow: true, //批注框为显示状态
            },
        },
        null
    );
    // 拖拽保存后设置标签是否拖拽为false
    isDraggable.value = false;
};
// 清除内容触发
const clearCellContentFn = () => {
    cellFormat = cloneDeep(cloneCellFormat);
};
// 单元格点击触发
const cellClickFn = (event) => {
    dragEndR.value = event.r;
    dragEndC.value = event.c;
    let sheet = event.sheet;
    rightContentShow.value = false;
    // 获取选中数据
    cutSelectCell = cloneDeep(sheet.data[dragEndR.value][dragEndC.value]);
    // 初始化数据格式化
    cellFormat = cloneDeep(cloneCellFormat);
    if (cutSelectCell && cutSelectCell.ps) {
        initCellFormat(cutSelectCell.ps);
    }
};
// 初始化批注类型
const initCellFormat = (ps) => {
    cellPs = cloneDeep(JSON.parse(ps.value));
    if (!cellPs.formatMap) {
        cellPs.formatMap = {};
    }
    // 获取当前类型
    let formatMap = cellPs.formatMap;
    let type = cellPs.type;
    let needShowRightContent = ["date", "dateTime", "time", "num"];
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

// 获取左侧菜单
const getEntityData = async () => {
    isMaskShow.value = true;
    let res = await http.get("/report/getEntityList", {
        reportConfigId: gridKey.value,
    });
    if (res.code === 200) {
        let resDataList = res.data || [];
        let openeds = [];
        resDataList.map((el, inx) => {
            el.index = inx + 1 + "";
            openeds.push(el.index);
        });
        openeds.value = openeds;
        dbList.value = resDataList;
    } else {
        message.error("获取菜单失败：" + res.error);
    }
    isMaskShow.value = false;
};

// 获取表格数据
const getWorkBook = async () => {
    isMaskShow.show = true;
    let res = await http.get("/crud/queryById", {
        entityId: gridKey.value,
        fieldNames: "reportConfigId,reportName,reportJson,entityCode",
    });
    if (res.code === 200) {
        let resData = res.data;
        let sheets = JSON.parse(resData.reportJson);
        entityCode.value = resData.entityCode;
        initLuckysheet(resData.reportConfigId, resData.reportName, sheets);
    } else {
        message.error("获取内容失败：" + res.error);
    }
    2;
    isMaskShow.value = false;
};

// 数据格式化触发
const cellFormatChange = (targe) => {
    cellPs.formatMap[targe] = cellFormat[targe];
    cutSelectCell.ps.value = JSON.stringify(cellPs);
    luckysheet.setCellValue(
        dragEndR.value,
        dragEndC.value,
        cloneDeep(cutSelectCell),
        null
    );
};

// 监听按键
const handleKeydownEvent = (event) => {
    if (event.keyCode == "83" && event.code === "KeyS" && event.ctrlKey) {
        event.preventDefault();
        event.returnValue = false; // 阻止直接保存网页
        onSave();
    }
};

// 监听页面点击
const handleDocumentClick = (event) => {
    if (event.target.className.indexOf("icon-baocun2") >= 0) {
        // 保存
        onSave();
    }
};

// 保存
const onSave =async () => {
    // saveRecord
    let params = {
        entity: "ReportConfig",
        id: gridKey.value,
        formModel: {
            reportName: luckysheet.getWorkbookName(),
            reportJson: JSON.stringify(luckysheet.getAllSheets()),
            entityCode: entityCode.value,
        },
    };
    saveLoading.value = true;
    let res = await saveRecord(params.entity,params.id,params.formModel);
    if(res.code === 200){
        message.success("保存成功");
    }else {
        message.error('保存失败：' + res.error);
    }
    saveLoading.value = false;
};

// 在页面销毁的时候解除
onBeforeUnmount(() => {
    window.removeEventListener("keydown", handleKeydownEvent);
    window.removeEventListener("click", handleDocumentClick);
});
</script>

<style lang="scss" scoped>
</style>