<template>
    <!-- 计算公式 -->
    <mlDialog v-model="isShow" width="850" title="计算公式" v-if="!isError">
        <!-- 脚本类型 -->
        <div class="script-type-box mb-10" v-if="!isPreview">
            <span>脚本类型</span>
            <el-select style="width: 240px" v-model="currentScriptType" placeholder="请选择脚本类型">
                <el-option label="AviatorScript" value="aviator"></el-option>
                <el-option label="Java" value="liteFlowJava" v-if="!publicSetting.tenantId"></el-option>
            </el-select>
            <span 
                class="help"
                @click="goHelp"
                v-if="currentScriptType == 'aviator'"
            >
                如何使用 AviatorScript 公式?
            </span>
        </div>
        <div 
            class="input-box" 
            v-if="showAdvanced && currentScriptType == 'aviator'" 
            :class="{'loading':checkLoading}"
            v-loading="checkLoading"
            element-loading-text="脚本校验中..."
        >
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
        <!-- <div class="foot-box mt-10" v-if="showAdvanced">
            <span class="help" @click="goHelp">如何使用高级计算公式?</span>
            <el-button type="primary" class="fr" @click="confirm">确定</el-button>
        </div> -->
        <div 
            class="input-box" 
            v-if="!showAdvanced && currentScriptType == 'aviator'"
            :class="{'loading':checkLoading}"
            v-loading="checkLoading"
            element-loading-text="脚本校验中..."
        >
            <div class="formula-val mb-10 need-change" v-if="formulaNumList.length > 0">
                <span class="change-span" @click.stop="showAdvanced = !showAdvanced">
                    <el-icon>
                        <ElIconConnection />
                    </el-icon>
                </span>
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
            <div class="formula-val mb-10 need-change default-icon" v-else>
                <span class="not-val">计算公式</span>
                <span class="change-span" @click.stop="showAdvanced = !showAdvanced">
                    <el-icon>
                        <ElIconConnection />
                    </el-icon>
                </span>
            </div>
            <div class="active-box">
                <div class="active-l fl">
                    <div
                        class="active-item text-ellipsis"
                        v-for="(item,inx) of fields"
                        :key="inx"
                        @click="fieldSelect(item,true)"
                        :title="item.fieldLabel"
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

        <LiteFlowJava 
            v-if="currentScriptType == 'liteFlowJava'" 
            v-model="javaScriptVal" 
            v-loading="checkLoading"
            element-loading-text="脚本校验中..."
        />

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
                :title="item.fieldLabel"
            >{{ item.fieldLabel }}</div>
        </el-popover>
        <template #footer>
            <el-button 
                @click="isShow = false" 
                :loading="checkLoading"
            >
                取消
            </el-button>
            <el-button 
                type="primary" 
                @click="confirm" 
                :loading="checkLoading"
            >
                确定
            </el-button>
        </template>
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
import LiteFlowJava from "./LiteFlowJava.vue";
import useCommonStore from "@/store/modules/common";
import { storeToRefs } from "pinia";
const { publicSetting } = storeToRefs(useCommonStore());
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
    // 脚本类型  aviator 或 javascript
    scriptType: { type: String, default: "aviator" },
});
const emits = defineEmits(["update:modelValue", "confirm", "editValue"]);
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
        value: ["*", "7", "8", "9"],
    },
    {
        row: 4,
        value: ["/", "(", ")", "0"],
    },
    {
        row: 5,
        value: [".", "回退", "清空", "确定"],
    },
]);
// 是否显示高级 计算方式
let showAdvanced = ref();
// 脚本类型  aviator 或 javascript
let currentScriptType = ref("aviator");
// java脚本
let javaScriptVal = ref("");
// 检查loading
let checkLoading = ref(false);

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
    showAdvanced.value = props.isAdvanced;
    currentScriptType.value = props.scriptType;
    if(currentScriptType.value == "liteFlowJava"){
        javaScriptVal.value = props.defaultFormulaVal;
    }else {
        formulaVal.value = props.defaultFormulaVal;
    }
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
const fieldSelect = (item, isNumber) => {
    if (isNumber) {
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
            formulaVal.value || "",
            blurIndex.value,
            `{${item.fieldName}}`
        );
        let setSelectionRange = blurIndex.value + item.fieldName.length + 2;
        contentInputRef.value.focus();
        setTimeout(() => {
            contentInputRef.value.ref.setSelectionRange(
                setSelectionRange,
                setSelectionRange
            );
        }, 10);
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
    if(currentScriptType.value == "liteFlowJava"){
        checkLoading.value = true;
        let res = await $API.trigger.detail.scriptValidator(javaScriptVal.value);
        if(res.data){
            if(isPreview.value){
                isEditValue(javaScriptVal.value);
                return
            }
            isConfirm({
                label: javaScriptVal.value,
                value: javaScriptVal.value,
                scriptType: currentScriptType.value,
            });
        }else{
            $ElMessage.error("脚本检查失败，请检查脚本语法。")
        }
        checkLoading.value = false;
        return
    }
    let checkVal = "";
    if (showAdvanced.value) {
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
        checkLoading.value = true;  
        let res = await $API.trigger.detail.aviatorValidate(checkVal);
        if (res) {
            // 错误的
            if (res.data) {
                isError.value = true;
                errorContent.value = res.data;
            }
            // 正确的
            else {
                if(isPreview.value){
                    isEditValue(numFormulaVal.value);
                    return
                }
                isConfirm({
                    label: formulaVal.value,
                    value: numFormulaVal.value,
                    scriptType: currentScriptType.value,
                });
            }
        }
        checkLoading.value = false;
    }
};
const isConfirm = (target) => {
    isShow.value = false;
    isError.value = false;
    emits("confirm", target);
    emits("update:modelValue", isShow.value);
};

const isEditValue = (value) => {
    checkLoading.value = false;
    emits("editValue", activeIndex.value, value);
}

// 跳转 如何使用高级计算公式 帮助文档
const goHelp = ()=>{
    window.open("https://www.yuque.com/boyan-avfmj/aviatorscript/cpow90")
}

let isPreview = ref(false);
let activeIndex = ref(0);
const openPreview = (val, scriptType, index) => {
    isPreview.value = true;
    currentScriptType.value = scriptType || "aviator";
    showAdvanced.value = true;
    if(currentScriptType.value == "liteFlowJava"){
        javaScriptVal.value = val;
    }else {
        formulaVal.value = val;
    }
    activeIndex.value = index;
}



defineExpose({
    openPreview,
})

</script>
<style lang='scss' scoped>
.input-box {
    position: relative;

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
        border: 1px dashed var(--el-color-primary);
        border-radius: 2px;
        padding: 7px 15px;
        padding-right: 34px;
        word-wrap: break-word;
        word-break: break-all;
        overflow: hidden;
        line-height: 16px;

        &.need-change {
            position: relative;
            padding-right: 26px;
            .change-span {
                position: absolute;
                font-size: 16px;
                top: 10px;
                right: 10px;
                cursor: pointer;
                &:hover {
                    color: #7b7b7b;
                }
            }
        }
        &.default-icon {
            .change-span {
                top: 8px;
            }
        }
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
            color: var(--el-color-primary);
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
                background: var(--el-color-primary);
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
        color: var(--el-color-primary);
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
                color: var(--el-color-primary);
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

.script-type-box {
    display: flex;
    align-items: center;
    span {
        margin-right: 10px;
    }
    .help {
        margin-left: 10px;
        cursor: pointer;
        color: var(--el-color-primary);
        &:hover {
            text-decoration: underline;
            color: var(--el-color-primary-light-3);
        }
    }
}
</style>