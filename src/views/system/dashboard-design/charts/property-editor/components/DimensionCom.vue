<template>
    <div
        class="item-tag"
        v-for="(tag,inx) of list"
        :key="inx"
        :title="'原名：' + tag.fieldLabel"
        ref="buttonRef"
    >
        <el-popover
            placement="bottom"
            popper-class="fields-popover"
            :width="80"
            trigger="click"
            @hide="tag.showEdit = false"
            ref="fieldsPopoverRefs"
        >
            <div class="popover-div" v-if="!tag.showEdit">
                <div class="popover-item" @click="editAlias(tag)">修改显示名</div>
                <!-- 汇总方式 -->
                <el-popover
                    placement="right"
                    :width="60"
                    trigger="hover"
                    popper-class="fields-popover"
                    ref="summaryPopoverRefs"
                    v-if="!isDimension"
                >
                    <div class="popover-div">
                        <template v-for="(summary,summaryInx) of calcMode">
                            <div
                                :key="summaryInx"
                                class="popover-item"
                                :class="{'is-active':tag.calcMode == summary.code}"
                                v-if="summary.type == 'N|T' || summary.type == tag.type"
                                @click="onCalcModeChange(tag,summary.code,inx)"
                            >{{ summary.label }}</div>
                        </template>
                    </div>
                    <template #reference>
                        <div class="popover-item">
                            汇总方式
                            <span style="position: relative;top:2px;float: right;">
                                <el-icon>
                                    <ElIconArrowRight />
                                </el-icon>
                            </span>
                        </div>
                    </template>
                </el-popover>
                <!-- 排序 -->
                <el-popover
                    placement="right"
                    :width="60"
                    trigger="hover"
                    popper-class="fields-popover"
                    ref="sortPopoverRefs"
                >
                    <div class="popover-div">
                        <div
                            class="popover-item"
                            :class="{'is-active':!tag.sort}"
                            @click="onSort(tag,'',inx)"
                        >默认</div>
                        <div
                            class="popover-item"
                            :class="{'is-active':tag.sort == 'ASC'}"
                            @click="onSort(tag,'ASC',inx)"
                        >升序</div>
                        <div
                            class="popover-item"
                            :class="{'is-active':tag.sort == 'DESC'}"
                            @click="onSort(tag,'DESC',inx)"
                        >降序</div>
                    </div>
                    <template #reference>
                        <div class="popover-item">
                            排序
                            <span style="position: relative;top:2px;float: right;">
                                <el-icon>
                                    <ElIconArrowRight />
                                </el-icon>
                            </span>
                        </div>
                    </template>
                </el-popover>
                <!-- 数据格式 -->
                <div class="popover-item" v-if="!isDimension" @click="showDataFormat(tag,inx)">数据格式</div>
            </div>
            <div class="popover-div" style="padding: 10px;" v-else>
                <div class="w-100">
                    <el-input v-model="tag.editAlias" size="small"></el-input>
                </div>
                <div class="w-100 mt-10" style="text-align: right;">
                    <el-button size="small" @click="cannerAlias(inx)">取消</el-button>
                    <el-button size="small" type="primary" @click="confirmAlias(tag,inx)">确认</el-button>
                </div>
            </div>
            <template #reference>
                <span class="drop-down-box" :class="{'isDimension':isDimension}">
                    <span class="arrow-down">
                        <el-icon>
                            <ElIconArrowDown />
                        </el-icon>
                    </span>
                    <SvgIcon class="sort-icon ml-3" v-if="tag.sort=='ASC'" icon-name="fields-asc" />
                    <SvgIcon
                        class="sort-icon ml-3"
                        v-if="tag.sort=='DESC'"
                        icon-name="fields-desc"
                    />
                    {{ tag.alias }}{{ !isDimension ? '(计数)' : '' }}
                </span>
            </template>
        </el-popover>
        <span class="close-span" @click.stop="delCom(inx)">
            <el-icon>
                <ElIconCircleCloseFilled />
            </el-icon>
        </span>
    </div>
    <mlDialog title="数据格式" append-to-body width="450" v-model="dialogConf.isShow">
        <div class="pr-20">
            <el-form label-width="120">
                <el-form-item label="显示设置">
                    <div class="w-100">
                        <el-checkbox
                            :disabled="needDisabledType()"
                            v-model="dialogConf.data.thousandsSeparator"
                            label="千分符"
                        />
                    </div>
                    <div class="w-100">
                        <el-checkbox v-model="dialogConf.data.showDecimalPlaces" label="小数位数" />
                        <span class="decimal-places" v-if="dialogConf.data.showDecimalPlaces">
                            <el-input-number
                                style="width: 150px;"
                                size="small"
                                v-model="dialogConf.data.decimalPlaces"
                                :min="1"
                                :max="4"
                            />
                        </span>
                    </div>
                    <div class="w-100">
                        <el-checkbox
                            v-model="dialogConf.data.showNumericUnits"
                            label="数值量级"
                            :disabled="needDisabledType()"
                        />
                        <span class="decimal-places" v-if="dialogConf.data.showNumericUnits">
                            <el-select
                                v-model="dialogConf.data.numericUnits"
                                filterable
                                style="width: 150px;"
                                size="small"
                                placeholder
                                allow-create
                                default-first-option
                                clearable
                            >
                                <el-option
                                    v-for="item in options"
                                    :key="item.value"
                                    :label="item.label"
                                    :value="item.value"
                                />
                            </el-select>
                        </span>
                    </div>
                </el-form-item>
                <el-form-item label="效果预览">
                    <div
                        class="show-preview yichu"
                        :title="getPreviewNum() + (dialogConf.data.numericUnits == '无' ? '' : dialogConf.data.numericUnits)"
                    >
                        <span>{{ getPreviewNum() }}</span>
                        <span
                            class="sub"
                            v-if="dialogConf.data.showNumericUnits && dialogConf.data.numericUnits != '无'"
                        >{{ dialogConf.data.numericUnits }}</span>
                    </div>
                </el-form-item>
                <el-form-item label=" ">
                    <el-button @click="confirmDataFormat" type="primary">确定</el-button>
                    <el-button @click="dialogConf.isShow = false">取消</el-button>
                </el-form-item>
            </el-form>
        </div>
    </mlDialog>
</template>

<script setup>
import { onMounted, watch, ref, reactive } from "vue";
const props = defineProps({
    modelValue: null,
    isDimension: { type: Boolean, default: false },
    chartType: { type: String, default: "" },
});
const emits = defineEmits(["update:modelValue", "onSort"]);

let list = ref([]);

watch(
    () => props.modelValue,
    () => {
        list.value = props.modelValue;
    },
    { deep: true }
);

let calcMode = ref([
    {
        label: "求和",
        type: "N",
        code: "sum",
    },
    {
        label: "计数",
        type: "N|T",
        code: "count",
    },
    {
        label: "去重计数",
        type: "N|T",
        code: "countSet",
    },
    {
        label: "平均值",
        type: "N",
        code: "average",
    },
    {
        label: "最大值",
        type: "N",
        code: "max",
    },
    {
        label: "最小值",
        type: "N",
        code: "min",
    },
]);

onMounted(() => {
    list.value = props.modelValue;
});
let options = ref([
    {
        value: "无",
        label: "无",
    },
    {
        value: "%",
        label: "%",
    },
    {
        value: "元",
        label: "元",
    },
    {
        value: "万元",
        label: "万元",
    },
    {
        value: "亿",
        label: "亿",
    },
    {
        value: "美元",
        label: "美元",
    },
    {
        value: "个",
        label: "个",
    },
    {
        value: "位",
        label: "位",
    },
    {
        value: "天",
        label: "天",
    },
]);

// 删除字段
const delCom = (inx) => {
    list.value.splice(inx, 1);
    emits("update:modelValue", list.value);
};
let fieldsPopoverRefs = ref();
let sortPopoverRefs = ref();
// 字段修改别名
const editAlias = (tag) => {
    tag.editAlias = tag.alias;
    tag.showEdit = true;
};
const confirmAlias = (tag, inx) => {
    if (tag.editAlias) {
        tag.alias = tag.editAlias;
        cannerAlias(inx);
    }
};
// 取消修改别名
const cannerAlias = (inx) => {
    fieldsPopoverRefs.value[inx].hide();
};

// 字段汇总方式切换
let summaryPopoverRefs = ref();
const onCalcModeChange = (tag, target, inx) => {
    summaryPopoverRefs.value[inx].hide();
    sortPopoverRefs.value[inx].hide();
    tag.calcMode = target;
    emits("update:modelValue", list.value);
};
// 字段排序
const onSort = (tag, target, inx) => {
    fieldsPopoverRefs.value[inx].hide();
    sortPopoverRefs.value[inx].hide();
    emits("update:modelValue", list.value);
    emits("onSort", { tag, target });
};

// 部分表格禁用千分符、数值量级
let needDisabledType = () => {
    let chartTypes = ["barChart", "barXChart", "lineChart"];
    if (chartTypes.includes(props.chartType)) {
        return true;
    }
    return false;
};

/***
 * 数据格式弹框
 */

let dialogConf = reactive({
    isShow: false,
    data: {},
    inx: 0,
});

const showDataFormat = (tag, inx) => {
    dialogConf.data = { ...tag };
    dialogConf.inx = inx;
    dialogConf.isShow = true;
};
// 效果预览
const getPreviewNum = () => {
    let { showFormat, thousandsSeparator, showDecimalPlaces, decimalPlaces } =
        dialogConf.data;
    let previewStr = "99999999";
    if (showDecimalPlaces) {
        previewStr = Number(previewStr).toFixed(decimalPlaces);
    }
    if (thousandsSeparator) {
        previewStr = numberToCurrencyNo(previewStr);
    }
    return previewStr;
};
const numberToCurrencyNo = (value) => {
    if (!value) return 0;
    // 获取整数部分
    const intPart = Math.trunc(value);
    // 整数部分处理，增加,
    const intPartFormat = intPart
        .toString()
        .replace(/(\d)(?=(?:\d{3})+$)/g, "$1,");
    // 预定义小数部分
    let floatPart = "";
    // 将数值截取为小数部分和整数部分
    const valueArray = value.toString().split(".");
    if (valueArray.length === 2) {
        // 有小数部分
        floatPart = valueArray[1].toString(); // 取得小数部分
        return intPartFormat + "." + floatPart;
    }
    return intPartFormat + floatPart;
};

const confirmDataFormat = () => {
    list.value[dialogConf.inx] = dialogConf.data;
    dialogConf.isShow = false;
    emits("update:modelValue", list.value);
};
</script>

<style lang="scss" scoped>
.item-tag {
    display: inline-block;
    line-height: 24px;
    cursor: pointer;
    position: relative;
    color: #fff;
    .drop-down-box {
        display: inline-block;
        background: var(--el-color-primary);
        color: #fff;
        margin-right: 5px;
        border-radius: 20px;
        height: 24px;
        line-height: 24px;
        padding: 0 25px;
        padding-left: 10px;
        &.isDimension {
            background: var(--el-color-success);
        }
        .arrow-down {
            position: relative;
            top: 2px;
        }
    }

    .close-span {
        display: none;
        position: absolute;
        right: 10px;
        top: 2px;
    }
    &:hover {
        .close-span {
            display: inline-block;
        }
    }
}
.decimal-places {
    margin-left: 5px;
    position: relative;
    top: -2px;
}
.show-preview {
    height: 60px;
    line-height: 60px;
    background: #f5f6f8;
    width: 100%;
    text-align: center;
    font-size: 20px;
    font-weight: bold;
    color: #404040;
    .sub {
        font-size: 14px;
        margin-left: 5px;
    }
}
</style>