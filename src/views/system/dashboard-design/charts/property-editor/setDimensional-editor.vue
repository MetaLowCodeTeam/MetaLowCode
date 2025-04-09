<template>
    <el-form-item :label="chartType == 'listTable' ? '显示字段' : '维度指标设置'" v-if="!optionModel.dsEnabled">
        <el-button @click="openDrawer">点击设置</el-button>
    </el-form-item>
    <el-drawer v-model="drawer" title="维度指标设置" size="460">
        <div class="drawer-main">
            <div class="form-box" ref="formBoxRefs">
                <el-form label-width="60">
                    <el-form-item label="维度" v-if="isShowDimension()">
                        <div class="input-box">
                            <el-scrollbar max-height="132px">
                                <VueDraggableNext
                                    v-model="draggableDimension"
                                    class="draggable-box"
                                    :group="{ name: 'list', pull: false}"
                                    @add="(e) => addCom(e,'dimension')"
                                    @end="onDraggableEnd('dimension')"
                                >
                                    <DimensionCom
                                        v-model="dimension"
                                        :chartType="chartType"
                                        @onSort="onSort"
                                        isDimension
                                    />
                                </VueDraggableNext>
                            </el-scrollbar>
                        </div>
                    </el-form-item>
                    <el-form-item label="维度行" v-if="chartType == 'pivotTable'">
                        <div class="input-box">
                            <el-scrollbar max-height="132px">
                                <VueDraggableNext
                                    v-model="draggableDimensionRow"
                                    class="draggable-box"
                                    :group="{ name: 'list', pull: false}"
                                    @add="(e) => addCom(e,'dimensionRow')"
                                    @end="onDraggableEnd('dimensionRow')"
                                >
                                    <DimensionCom
                                        v-model="dimensionRow"
                                        @onSort="onSort"
                                        isDimension
                                        :chartType="chartType"
                                    />
                                </VueDraggableNext>
                            </el-scrollbar>
                        </div>
                    </el-form-item>
                    <el-form-item label="维度列" v-if="chartType == 'pivotTable'">
                        <div class="input-box">
                            <el-scrollbar max-height="132px">
                                <VueDraggableNext
                                    v-model="draggableDimensionCol"
                                    class="draggable-box"
                                    :group="{ name: 'list', pull: false}"
                                    @add="(e) => addCom(e,'dimensionCol')"
                                    @end="onDraggableEnd('dimensionCol')"
                                >
                                    <DimensionCom
                                        v-model="dimensionCol"
                                        @onSort="onSort"
                                        isDimension
                                        :chartType="chartType"
                                    />
                                </VueDraggableNext>
                            </el-scrollbar>
                        </div>
                    </el-form-item>
                    <el-form-item label="指标" v-if="chartType != 'listTable'">
                        <div class="input-box">
                            <el-scrollbar max-height="132px">
                                <VueDraggableNext
                                    v-model="draggableMetrics"
                                    class="draggable-box"
                                    :group="{ name: 'list', pull: false}"
                                    @add="(e) => addCom(e,'metrics')"
                                    @end="onDraggableEnd('metrics')"
                                >
                                    <DimensionCom
                                        v-model="metrics"
                                        @onSort="onSort"
                                        :chartType="chartType"
                                    />
                                </VueDraggableNext>
                            </el-scrollbar>
                        </div>
                    </el-form-item>
                    <el-form-item label="目标值" v-if="chartType == 'progressbar'">
                        <el-input-number
                            v-model="props.optionModel.setDimensional.targetValue"
                            :min="0"
                            class="w-100"
                        />
                    </el-form-item>
                    <el-form-item label="显示字段" v-if="chartType == 'listTable'">
                        <div class="input-box">
                            <el-scrollbar max-height="132px">
                                <VueDraggableNext
                                    v-model="draggableShowFields"
                                    class="draggable-box"
                                    :group="{ name: 'list', pull: false}"
                                    @add="(e) => addCom(e,'showFields')"
                                    @end="onDraggableEnd('showFields')"
                                >
                                    <DimensionCom
                                        v-model="showFields"
                                        @onSort="onSort"
                                        :chartType="chartType"
                                        isDimension
                                    />
                                </VueDraggableNext>
                            </el-scrollbar>
                        </div>
                    </el-form-item>
                </el-form>
            </div>
            <div
                class="item-box"
                ref="itemBoxRefs"
                :style="{'height': itemBoxHeight}"
                v-loading="loading"
            >
                <div class="item-title">可用字段</div>
                <div class="item-list-box">
                    <el-scrollbar>
                        <VueDraggableNext
                            :list="fields"
                            :sort="false"
                            :group="{ name: 'list', pull: 'clone',put: false }"
                        >
                            <div
                                class="item-list yichu"
                                v-for="(item,inx) of fields"
                                :key="inx"
                                :title="item.fieldLabel"
                            >
                                <!-- <span class="lh">{{ item.type }}</span> -->
                                {{ item.fieldLabel }}
                            </div>
                        </VueDraggableNext>
                    </el-scrollbar>
                </div>
            </div>
        </div>
        <template #footer>
            <div style="flex: auto;padding-top: 10px;">
                <!-- <el-button size="default" @click="onCancel">取消</el-button> -->
                <el-button size="default" type="primary" @click="drawer = false">关闭</el-button>
            </div>
        </template>
    </el-drawer>
</template>
<script setup>
import { onMounted, ref, watch, inject, nextTick, reactive } from "vue";
import { VueDraggableNext } from "vue-draggable-next";
import DimensionCom from "./components/DimensionCom.vue";
import { queryEntityFields } from "@/api/crud";
defineOptions({
    name: "setDimensional-editor",
});
const props = defineProps({
    designer: Object,
    selectedWidget: Object,
    optionModel: Object,
});

const $ElMessage = inject("$ElMessage");
const emits = defineEmits(["update:optionModel"]);

let myOptionModel = ref({});
// // 记录元数据
// let meteOption = ref({});

watch(
    () => props.optionModel,
    () => {
        initDimensional();
    },
    { deep: true }
);
onMounted(() => {
    document.body.ondrop = function (event) {
        event.preventDefault();
        event.stopPropagation();
    };
    initDimensional();
});
// 图表类型
let chartType = ref("");
// 维度
let dimension = ref([]);
// 维度行
let dimensionRow = ref([]);
// 维度列
let dimensionCol = ref([]);
// 指标
let metrics = ref([]);
// 显示字段
let showFields = ref([]);

// 拖拽维度
let draggableDimension = ref([]);
// 拖拽维度行
let draggableDimensionRow = ref([]);
// 拖拽维度列
let draggableDimensionCol = ref([]);
// 拖拽指标
let draggableMetrics = ref([]);
// 拖拽显示字段
let draggableShowFields = ref([]);

// 初始化纬度、指标
const initDimensional = () => {
    myOptionModel.value = props.optionModel;
    chartType.value = props.selectedWidget.type;
    dimension.value = props.optionModel.setDimensional?.dimension || [];
    metrics.value = props.optionModel.setDimensional?.metrics || [];
    showFields.value = props.optionModel.setDimensional?.showFields || [];
    dimensionRow.value = props.optionModel.setDimensional?.dimensionRow || [];
    dimensionCol.value = props.optionModel.setDimensional?.dimensionCol || [];
    // 初始化拖拽绑定数据
    initDraggableModel();
    nextTick(() => {
        setItemBoxHeight();
    });
};

const initDraggableModel = () => {
    draggableDimension.value = cloneDeep(dimension.value)
    draggableDimensionRow.value = cloneDeep(dimensionRow.value)
    draggableDimensionCol.value = cloneDeep(dimensionCol.value)
    draggableMetrics.value = cloneDeep(metrics.value)
    draggableShowFields.value = cloneDeep(showFields.value)
}

const cloneDeep = (data) => {
    return JSON.parse(JSON.stringify(data))
}

/**
 * 所有字段
 */
let fields = ref([]);

const fieldsAdd = reactive({
    // 别名
    alias: "",
    // 显示编辑名称
    showEdit: false,
    // 编辑后胡名称
    editAlias: "",
    // 字段类型
    type: "N",
    // 排序
    sort: "",
    // 时间格式化处理
    dateFormat: 1,
    // 汇总方式
    calcMode: "count",
    // 千分符
    thousandsSeparator: false,
    // 小数位数
    showDecimalPlaces: false,
    decimalPlaces: 2,
    // 数值量级
    showNumericUnits: false,
    numericUnits: "无",
});

let loading = ref(false);

let needType = ref([
    "Integer",
    "Decimal",
    "Percent",
    "Money",
    "Text",
    "TextArea",
    "DateTime",
    "Date",
    "Reference",
    "AnyReference",
    "Boolean",
    "Option",
    "Status",
    "Tag",
    "Picture",
    "File"
]);
const getEntityFields = async () => {
    loading.value = true;
    let res = await queryEntityFields(props.optionModel.dataEntity, true, true, false, false, true);
    // fields.forEach()
    if (res && res.data) {
        fields.value = [];
        res.data.forEach((el) => {
            if (needType.value.includes(el.fieldType)) {
                let newFieldsAdd = { ...fieldsAdd };
                newFieldsAdd.alias = el.fieldLabel;
                newFieldsAdd.type =  el.fieldType;
                // newFieldsAdd.type = numType.value.includes(el.fieldType)
                //     ? "N"
                //     : "T";
                let newField = Object.assign(newFieldsAdd, { ...el });
                fields.value.push({ ...newField });
            }
        });
        nextTick(() => {
            setItemBoxHeight();
        });
    }
    loading.value = false;
};

let drawer = ref(false);
const openDrawer = () => {
    if (!props.optionModel.dataEntity) {
        $ElMessage.warning("请先选择图标数据实体");
        return;
    }
    drawer.value = true;
    getEntityFields();
};
const onCancel = () => {
    // let widget__list__selected = localStorage.getItem("widget__list__selected");
    // if (widget__list__selected) {
    // let mete = JSON.parse(widget__list__selected);
    // console.log(mete.options,'mete.options')
    // console.log(props.optionModel,'props.optionModel')
    // console.log(props.optionModel,'props.optionModel')
    // emits("update:optionModel", {title:"14"});
    // }
    // drawer.value = false;
};

let itemBoxHeight = ref("");

// 设置可选字段高度
let formBoxRefs = ref();
let itemBoxRefs = ref();
const setItemBoxHeight = () => {
    let formHeight = formBoxRefs.value?.offsetHeight;
    if (formHeight) {
        formHeight += 60;
        itemBoxHeight.value = "calc(100% - " + formHeight + "px)";
    } else {
        itemBoxHeight.value = "calc(100% - 175px)";
    }
};
/**
 * 拖拽
 */

 
// 新加字段
const addCom = (e, target) => {
    let cutField = { ...fields.value[e.oldIndex] };
    // let checkHasDimensionRow = dimensionRow.value.filter(
    //     (el) => el.fieldLabel == cutField.fieldLabel
    // );
    // let checkHasDimensionCol = dimensionCol.value.filter(
    //     (el) => el.fieldLabel == cutField.fieldLabel
    // );
    // let checkHasDimension = dimension.value.filter(
    //     (el) => el.fieldLabel == cutField.fieldLabel
    // );
    let checkHasMetrics = metrics.value.filter(
        (el) => el.fieldLabel == cutField.fieldLabel
    );
    let checkHasShowFields = showFields.value.filter(
        (el) => el.fieldLabel == cutField.fieldLabel
    );
    if(target == 'dimensionRow' || target == 'dimensionCol' || target == 'dimension'){
        checkHasMetrics = [];
    }
    // if (checkHasDimension.length > 0) {
    //     $ElMessage.warning("添加失败，同一字段不能重复添加维度");
    //     return;
    // }
    // if (checkHasDimensionRow.length > 0) {
    //     $ElMessage.warning("添加失败，同一字段不能重复添加维度行");
    //     return;
    // }
    // if (checkHasDimensionCol.length > 0) {
    //     $ElMessage.warning("添加失败，同一字段不能重复添加维度列");
    //     return;
    // }
    if (checkHasMetrics.length > 0) {
        $ElMessage.warning("添加失败，同一字段不能重复添加指标");
        return;
    }
    if (checkHasShowFields.length > 0) {
        $ElMessage.warning("添加失败，同一字段不能重复添加显示字段");
        return;
    }
    let dimensionLength = dimension.value.length;
    let metricsLength = metrics.value.length;
    let { type } = props.selectedWidget;
    let max3 = ["barChart", "barXChart", "lineChart", "radarChart"];
    // 添加维度
    if (target == "dimension") {
        // 1个维度或多个指标
        // 2个维度或1个指标
        if (max3.includes(type)) {
            if (dimensionLength > 1) {
                $ElMessage.warning("添加失败，最多添加2个维度");
                return;
            }
            if (metricsLength > 1 && dimensionLength > 0) {
                $ElMessage.warning("添加失败，多个指标最多只能添加1个维度");
                return;
            }
        }
        // 如果是饼图、漏斗图 最多添加1个维度
        if (
            (type == "pieChart" || type == "funnelChart") &&
            dimensionLength > 0
        ) {
            $ElMessage.warning("添加失败，最多添加1个维度");
            return;
        }
        dimension.value.push(cutField);
    }
    // 添加指标
    else if (target == "metrics") {
        // 1个维度或多个指标
        // 2个维度或1个指标
        if (max3.includes(type)) {
            if (dimensionLength > 1 && metricsLength > 0) {
                $ElMessage.warning("添加失败，2个维度最多只能添加1个指标");
                return;
            }
        }
        // 如果是饼图、进度条 最多添加1个指标
        if (
            (type == "pieChart" ||
                type == "progressbar" ||
                type == "statistic") &&
            metricsLength > 0
        ) {
            $ElMessage.warning("添加失败，最多添加1个指标");
            return;
        }
        metrics.value.push(cutField);
    }
    // 添加显示字段
    else if (target == "showFields") {
        showFields.value.push(cutField);
    }
    // 添加维度行
    else if (target == "dimensionRow") {
        dimensionRow.value.push(cutField);
    }
    // 添加维度列
    else if (target == "dimensionCol") {
        dimensionCol.value.push(cutField);
    }
    // 初始化拖拽绑定数据
    initDraggableModel();
};
const onSort = (e) => {
    dimension.value.forEach((el) => {
        el.sort = "";
    });
    dimensionRow.value.forEach((el) => {
        el.sort = "";
    });
    dimensionCol.value.forEach((el) => {
        el.sort = "";
    });
    metrics.value.forEach((el) => {
        el.sort = "";
    });
    showFields.value.forEach((el) => {
        el.sort = "";
    });
    e.tag.sort = e.target;
    // 初始化拖拽绑定数据
    initDraggableModel();
};

const onDraggableEnd = (target) => {
    switch (target) {
        case "dimension":
            dimension.value = cloneDeep(draggableDimension.value)
            myOptionModel.value.setDimensional.dimension = dimension.value;
            break;
        case "dimensionRow":
            dimensionRow.value = cloneDeep(draggableDimensionRow.value)
            myOptionModel.value.setDimensional.dimensionRow = dimensionRow.value;
            break;
        case "dimensionCol":
            dimensionCol.value = cloneDeep(draggableDimensionCol.value)
            myOptionModel.value.setDimensional.dimensionCol = dimensionCol.value;
            break;
        case "metrics":
            metrics.value = cloneDeep(draggableMetrics.value)
            myOptionModel.value.setDimensional.metrics = metrics.value;
            break;
        case "showFields":
            showFields.value = cloneDeep(draggableShowFields.value)
            myOptionModel.value.setDimensional.showFields = showFields.value;
            break;
    
        default:
            break;
    }
}

// 维度是否显示
const isShowDimension = () => {
    let notNeedDimension = [
        "progressbar",
        "listTable",
        "pivotTable",
        "statistic",
    ];
    return showFn(notNeedDimension);
};

// 显示方法
const showFn = (notNeed) => {
    if (notNeed.includes(chartType.value)) {
        return false;
    }
    return true;
};
</script>
<style lang="scss" scoped>
.drawer-main {
    // padding: 20px;
    height: 100%;
    border-bottom: 1px solid #e5e5e5;
    .form-box {
        border-top: 1px solid #e5e5e5;
        padding: 20px;
        padding-bottom: 0;
        .input-box {
            border-radius: 4px;
            border: 1px solid #e5e5e5;
            padding: 3px 10px;
            width: 100%;
            min-height: 32px;
            .draggable-box {
                min-height: 32px;
                .item-list {
                    display: none;
                }
            }
        }
    }
    .item-box {
        border-top: 1px solid #e5e5e5;
        padding: 20px 0;
        .item-title {
            font-size: 14px;
            font-weight: bold;
            padding-left: 20px;
        }
        .item-list-box {
            height: calc(100% - 12px);
            .item-list {
                padding-left: 15px;
                height: 32px;
                line-height: 32px;
                cursor: all-scroll;
                user-select: none;
                .lh {
                    color: var(--el-color-primary);
                }
                &:hover {
                    background: #e6e6e6;
                }
            }
        }
    }
}
</style>
