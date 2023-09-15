<template>
    <!-- 计算公式 -->
    <mlDialog v-model="isShow" width="550" title="计算公式" v-if="!isError">
        <div class="input-box" v-if="showAdvanced">
            <el-input
                v-model="formulaVal"
                placeholder="// 支持 AviatorScript"
                :autosize="{ minRows: 8}"
                type="textarea"
                @blur="formulaBlur"
                ref="contentInputRef"
            ></el-input>
            <span ref="buttonRef" v-click-outside="onClickOutside" class="field-span">{&nbsp;}</span>
        </div>
        <div class="foot-box mt-10" v-if="showAdvanced">
            <span class="help">如何使用高级计算公式?</span>
            <el-button type="primary" class="fr" @click="confirm">确定</el-button>
        </div>
        <div class="input-box" v-if="!showAdvanced">
            <div class="formula-val mb-10" v-if="formulaNumList.length > 0">
                <template v-for="(item,inx) of formulaNumList" :key="inx">
                    <el-dropdown
                        trigger="click"
                        v-if="item.value == 'field'"
                        @command="(e) => handleCommand(e,item)"
                    >
                        <span class="el-dropdown-link">
                            {{ item.label }}{{ item.dropdownText}}
                            <el-icon class="el-icon--right">
                                <el-icon-arrow-down />
                            </el-icon>
                        </span>
                        <template #dropdown>
                            <el-dropdown-menu>
                                <el-dropdown-item command="无">无</el-dropdown-item>
                                <el-dropdown-item command="sum">求和</el-dropdown-item>
                                <el-dropdown-item command="count">计数</el-dropdown-item>
                                <el-dropdown-item command="countSet">去重计数</el-dropdown-item>
                                <el-dropdown-item command="average">平均值</el-dropdown-item>
                                <el-dropdown-item command="max">最大值</el-dropdown-item>
                                <el-dropdown-item command="min">最小值</el-dropdown-item>
                            </el-dropdown-menu>
                        </template>
                    </el-dropdown>
                    <i
                        class="v"
                        :class="{'oper':item.value =='oper','num':item.value =='num'}"
                        v-else
                    >{{ item.label }}</i>
                </template>
            </div>
            <div class="formula-val mb-10" v-else>
                <span class="not-val">计算公式</span>
            </div>
            <div class="active-box">
                <div class="active-l fl">
                    <div
                        class="active-item text-ellipsis"
                        v-for="(item,inx) of fields"
                        :key="inx"
                        @click="fieldSelect(item)"
                    >
                        <span class="active-type">N</span>
                        {{ item.fieldLabel }}
                    </div>
                </div>
                <div class="active-r fl">
                    <el-row :gutter="5" class="mb-5" v-for="(item,inx) of calculator" :key="inx">
                        <el-col :span="6" v-for="(subItem,subInx) of item.value" :key="subInx">
                            <span
                                class="subitem-span"
                                :class="{'isConfirm':subItem == '确定'}"
                                @click="activeRClick(subItem)"
                            >{{ subItem }}</span>
                        </el-col>
                    </el-row>
                </div>
            </div>
        </div>

        <el-popover
            ref="popoverRef"
            :virtual-ref="buttonRef"
            trigger="click"
            placement="left"
            popper-class="formula-popover"
            virtual-triggering
        >
            <div
                class="field-item text-ellipsis"
                v-for="(item,inx) of fields"
                :key="inx"
                @click="fieldSelect(item)"
            >{{ item.fieldLabel }}</div>
        </el-popover>
    </mlDialog>
    <ml-dialog v-model="isError" width="500" not-header top="30vh" v-if="isError">
        <div class="save-success">
            <div>
                <el-icon class="save-icon" size="50">
                    <ElIconWarning />
                </el-icon>
            </div>
            <div class="mt-5 error-content">{{ errorContent }}</div>
            <div class="mt-5 save-info">计算公式可能存在错误，这会导致触发器执行失败。是否继续？</div>
            <div class="mt-20">
                <el-button @click="isError = false;">取消</el-button>
                <el-button type="warning" @click="isConfirm">确定</el-button>
            </div>
        </div>
    </ml-dialog>
</template>

<script setup>
import { onMounted, ref, watch, unref, reactive, inject } from "vue";
import { ClickOutside as vClickOutside } from "element-plus";
const $API = inject("$API");
const $ElMessage = inject("$ElMessage");
const buttonRef = ref();
const popoverRef = ref();
const props = defineProps({
    modelValue: null,
    // 源字段
    fields: { type: Array, default: () => [] },
    // 默认值
    defaultFormulaVal: { type: String, default: "" },
    // 是 高级的计算公式 还是 数字类型的 计算公式
    isAdvanced: { type: Boolean, default: false },
});
const emits = defineEmits(["update:modelValue", "confirm"]);
let isShow = ref(false);
// 默认值
let formulaVal = ref("");
// 数字类计算方式值
let formulaNumList = ref([]);
// 默认计算器
let calculator = ref([
    {
        row: 1,
        value: ["+", "1", "2", "3"],
    },
    {
        row: 2,
        value: ["-", "4", "5", "6"],
    },
    {
        row: 3,
        value: ["x", "7", "8", "9"],
    },
    {
        row: 4,
        value: ["÷", "(", ")", "0"],
    },
    {
        row: 5,
        value: [".", "回退", "清空", "确定"],
    },
]);
// 是否显示高级 计算方式
let showAdvanced = ref();

watch(
    () => isShow.value,
    (newVal) => {
        emits("update:modelValue", newVal);
    },
    {
        deep: true,
    }
);
onMounted(() => {
    isShow.value = props.modelValue;
    formulaVal.value = props.defaultFormulaVal;
    showAdvanced.value = props.isAdvanced;
});

// 右边计数器点击
const activeRClick = (item) => {
    if (item == "确定") {
        formulaVal.value = "";
        formulaNumList.value.forEach((el) => {
            formulaVal.value += el.label + (el.dropdownText || "");
        });

        confirm();
    } else if (item == "清空") {
        formulaNumList.value = [];
    } else if (item == "回退") {
        formulaNumList.value.splice(formulaNumList.value.length - 1, 1);
    } else {
        let formulaNumItem = {
            label: item,
        };
        // 点击的是非数字
        if (isNaN(item)) {
            formulaNumItem.value = "oper";
        } else {
            formulaNumItem.value = "num";
        }
        formulaNumList.value.push(formulaNumItem);
    }
};

// 字段弹出
const onClickOutside = () => {
    unref(popoverRef).popperRef?.delayHide?.();
};

let final = reactive({
    sum: "求和",
    count: "计数",
    countSet: "去重计数",
    average: "平均值",
    max: "最大值",
    min: "最小值",
});

// 获取内容Input
let contentInputRef = ref("");
// 获取input光标位置
let blurIndex = ref(0);
const formulaBlur = (val) => {
    blurIndex.value = val.srcElement.selectionStart;
};

const insertStr = (source, start, newStr) => {
    return source.slice(0, start) + newStr + source.slice(start);
};

// 字段选择
const fieldSelect = (item) => {
    if (!props.isAdvanced) {
        let formulaNumItem = {
            value: "field",
            label: `{${item.fieldLabel}`,
            dropdownText: "(求和)}",
            checkField: item.fieldName,
            checkDropdown: "sum",
        };
        formulaNumList.value.push(formulaNumItem);
    } else {
        formulaVal.value = insertStr(
            formulaVal.value,
            blurIndex.value,
            `{${item.fieldName}}`
        );
        let setSelectionRange = blurIndex.value + item.fieldName.length + 2
        contentInputRef.value.focus();
        setTimeout(() => {
            contentInputRef.value.ref.setSelectionRange(setSelectionRange, setSelectionRange);
        }, 0);
        popoverRef.value.hide();
    }
};

// 下拉选择
const handleCommand = (e, item) => {
    if (e === "无") {
        item.dropdownText = "}";
        item.checkDropdown = "";
    } else {
        item.dropdownText = `(${final[e]})`;
        item.checkDropdown = `(${e})`;
    }
};

// 效验计算公式是否错误
let isError = ref(false);
// 计算公式错误内容
let errorContent = ref("");
// 简易的val
let numFormulaVal = ref("");

// 确认
const confirm = async () => {
    let checkVal = "";
    if (!showAdvanced) {
        checkVal = formulaVal.value;
    } else {
        formulaNumList.value.forEach((el) => {
            if (el.checkField) {
                checkVal +=
                    "{" +
                    el.checkField +
                    (el.checkDropdown ? `$${el.checkDropdown}` : "") +
                    "}";
            } else {
                checkVal += el.label;
            }
        });
        formulaNumList.value = [];
    }
    numFormulaVal.value = checkVal;
    if (checkVal) {
        let res = await $API.trigger.detial.aviatorValidate(checkVal);
        if (res.code == 200) {
            // 错误的
            if (res.data) {
                isError.value = true;
                errorContent.value = res.data;
            }
            // 正确的
            else {
                isConfirm();
            }
        } else {
            $ElMessage.error(res.error);
        }
    }
};
const isConfirm = () => {
    isShow.value = false;
    isError.value = false;
    emits("confirm", {
        label: formulaVal.value,
        value: numFormulaVal.value,
    });
    emits("update:modelValue", isShow.value);
};
</script>
<style lang='scss' scoped>
.input-box {
    position: relative;
    .change-span {
        position: absolute;
        right: 5px;
        top: 3px;
        font-weight: bold;
        width: 30px;
        height: 30px;
        line-height: 30px;
        color: #2c2c2c;
        .lt,
        .rt {
            float: left;
            margin-top: 8px;
        }
        .lt {
            margin-left: 4px;
        }
        .rt {
            margin-left: -4px;
        }
        cursor: pointer;
        border-radius: 5px;
        &:hover {
            background: #212121;
            color: #fff;
        }
    }
    .field-span {
        position: absolute;
        right: 10px;
        bottom: 15px;
        color: #646969;
        cursor: pointer;
        &:hover {
            color: #fff;
        }
    }
    .formula-val {
        border: 1px dashed $ml-primary;
        border-radius: 2px;
        padding: 7px 15px;
        padding-right: 34px;
        word-wrap: break-word;
        word-break: break-all;
        overflow: hidden;
        line-height: 16px;
        .v {
            font-style: normal;

            &.oper {
                margin: 0 3px;
            }
            &.num {
                color: #df5000;
            }
        }
        .not-val {
            color: #878787;
            user-select: none;
        }
        .el-dropdown-link {
            color: $ml-primary;
            cursor: pointer;
            line-height: 20px;
            .el-icon--right {
                font-size: 12px;
                margin-left: -3px;
                position: relative;
                top: 2px;
                margin-right: 3px;
            }
            &:hover {
                color: #fff;
                background: $ml-primary;
            }
        }
    }
}

:deep(.el-textarea__inner) {
    background: #212121;
    box-shadow: none;
    color: #f07178;
}

:deep(.el-dropdown) {
    display: inline !important;
}

.field-item {
    line-height: 26px;
    padding-left: 20px;
    cursor: default;
    margin-bottom: 5px;
    &:hover {
        background: #eee;
    }
}
.foot-box {
    height: 20px;
    line-height: 32px;
    .help {
        cursor: pointer;
        color: $ml-primary;
        &:hover {
            text-decoration: underline;
            color: #0d5bdd;
        }
    }
}

.active-box {
    height: 178px;
    .active-l {
        width: 240px;
        margin-right: 20px;
        height: 178px;
        overflow-x: hidden;
        overflow-y: auto;
        &::-webkit-scrollbar {
            display: none;
        }
        &:hover {
            &::-webkit-scrollbar {
                display: block;
            }
        }
        .active-item {
            height: 32px;
            line-height: 32px;
            padding-left: 15px;
            margin-bottom: 5px;
            background: #eeeeee;
            color: #404040;
            cursor: pointer;
            &:last-child {
                margin-bottom: 0;
            }
            .active-type {
                color: $ml-primary;
            }
            &:hover {
                background: #ccc;
            }
        }
    }
    .active-r {
        height: 178px;
        width: calc(100% - 260px);
        .subitem-span {
            display: block;
            line-height: 32px;
            text-align: center;
            background: #eeeeee;
            cursor: pointer;
            border-radius: 2px;
            user-select: none;
            &:hover {
                background: #ccc;
            }
            &.isConfirm {
                background: #5f99f5;
                color: #fff;
            }
        }
    }
}

.save-success {
    text-align: center;
    .save-icon {
        color: #e6a23c;
        position: relative;
        left: 12px;
    }
    .save-info {
        font-size: 13px;
        font-weight: bold;
        color: #404040;
    }
}
.error-content {
    background: #fafafa;
    overflow-x: auto;
    overflow-y: auto;
    height: 128px;
    padding: 20px;
    color: #ea4335;
}
</style>