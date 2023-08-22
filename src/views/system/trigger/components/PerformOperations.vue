<template>
    <!-- 就执行操作 -->
    <div class="perform-operations">
        <el-form label-width="120px">
            <el-form-item label="执行操作">
                <span class="blod">{{ trigger.actionType?.label}}</span>
            </el-form-item>
            <el-form-item label="操作内容">
                <div class="action-div" v-loading="contentLoading">
                    <el-form-item label="目标实体">
                        <el-row class="w-100 mb-15" :gutter="20">
                            <el-col :span="9">
                                <el-select
                                    v-model="trigger.selectTagEntity"
                                    filterable
                                    class="w-100"
                                    @change="targetFieldChange"
                                    :disabled="trigger.tagEntityIsDisabled"
                                >
                                    <el-option
                                        v-for="(op,inx) in trigger.dataUpdateEntityList"
                                        :key="inx"
                                        :label="op.label"
                                        :value="inx"
                                    />
                                </el-select>
                            </el-col>
                        </el-row>
                    </el-form-item>
                    <!-- 更新规则、聚合规则 -->
                    <el-form-item
                        v-if="trigger.actionType?.value == 1 || trigger.actionType?.value == 2"
                    >
                        <template #label>{{ trigger.actionType?.value == 1 ? '更新' : '聚合'}}规则</template>
                        <div class="w-100 mb-10" v-if="trigger.uptadeRuleList?.length > 0">
                            <el-row
                                :gutter="20"
                                class="uptade-rule-row w-100 mb-5"
                                v-for="(item,inx) of trigger.uptadeRuleList"
                                :key="inx"
                            >
                                <el-col :span="9">
                                    <span
                                        class="uptade-rule-span"
                                    >{{ getTargeFieldLabel(item.targetField) }}</span>
                                </el-col>
                                <el-col :span="5">
                                    <span
                                        class="uptade-rule-span"
                                    >{{ getUpdateModeLabel(item.updateMode) }}</span>
                                </el-col>
                                <el-col :span="9" class="uptade-rule-col-last">
                                    <span
                                        class="uptade-rule-span"
                                        :class="{'toFixed':item.updateMode == 'toFixed','forCompile':item.updateMode == 'forCompile'}"
                                    >{{ getSourceFieldLabel(item) }}</span>
                                    <span class="del-icon" @click="delUptadeRule(inx)">
                                        <el-icon>
                                            <ElIconCloseBold />
                                        </el-icon>
                                    </span>
                                </el-col>
                            </el-row>
                        </div>
                        <el-row
                            class="w-100 mb-10 uptade-rule"
                            :gutter="20"
                            v-loading="targetFieldLoading"
                        >
                            <!-- 目标字段 -->
                            <el-col :span="9">
                                <el-select
                                    v-model="seleteTargetField"
                                    filterable
                                    class="w-100"
                                    @change="uptadeRuleTargetFieldChange"
                                    value-key="fieldLabel"
                                >
                                    <el-option
                                        v-for="(op,inx) in targetFieldList"
                                        :key="inx"
                                        :label="op.fieldLabel"
                                        :value="op"
                                    />
                                </el-select>
                                <div class="w-100 info-text mt-3">目标字段</div>
                            </el-col>
                            <!-- 更新方式 -->
                            <el-col :span="5">
                                <el-select
                                    v-model="uptadeRule.updateMode"
                                    class="w-100"
                                    @change="uptadeModeChange"
                                >
                                    <el-option
                                        v-for="(op,inx) in uptadeModeList"
                                        :key="inx"
                                        :label="op.label"
                                        :value="op.value"
                                    />
                                </el-select>
                                <div class="w-100 info-text mt-3">更新方式</div>
                            </el-col>
                            <!-- 源字段 -->
                            <el-col :span="9">
                                <el-select
                                    v-if="uptadeRule.updateMode == 'forField'"
                                    v-model="uptadeRule.sourceField"
                                    filterable
                                    class="w-100"
                                >
                                    <el-option
                                        v-for="(op,inx) in floatSourceFieldList()"
                                        :key="inx"
                                        :label="op.fieldLabel"
                                        :value="op.fieldName"
                                    />
                                </el-select>

                                <el-select
                                    v-if="uptadeRule.updateMode == 'toFixed' && toFixedForFieldType == 'Boolean'"
                                    v-model="uptadeRule.sourceField"
                                    filterable
                                    class="w-100"
                                >
                                    <el-option label="正常" value="1" />
                                    <el-option label="禁用" value="0" />
                                </el-select>
                                <el-date-picker
                                    v-if="uptadeRule.updateMode == 'toFixed' && (toFixedForFieldType == 'DateTime' || toFixedForFieldType == 'Time')"
                                    v-model="uptadeRule.sourceField"
                                    format="YYYY/MM/DD hh:mm:ss"
                                    value-format="YYYY-MM-DD hh:mm:ss a"
                                    type="datetime"
                                />
                                <el-input
                                    v-if="uptadeRule.updateMode == 'toFixed' && toFixedForFieldType != 'Boolean' && toFixedForFieldType != 'DateTime' && toFixedForFieldType != 'Time'"
                                    v-model="uptadeRule.sourceField"
                                    placeholder="固定值"
                                ></el-input>
                                <el-input
                                    v-if="uptadeRule.updateMode == 'forCompile'"
                                    v-model="uptadeRule.sourceField"
                                    placeholder="计算公式"
                                    autosize
                                    type="textarea"
                                    @click="checkMlFormula"
                                ></el-input>
                                <div
                                    class="w-100 info-text mt-3"
                                    v-if="uptadeRule.updateMode !== 'toNull'"
                                >{{ getSourceFieldInfo() }}</div>
                            </el-col>
                        </el-row>
                    </el-form-item>
                    <el-form-item label=" ">
                        <el-button type="primary" plain @click="addUptadeRule">+ 添加</el-button>
                    </el-form-item>
                    <el-form-item
                        class="mt-20"
                        label="聚合数据条件"
                        v-if="trigger.actionType?.value == 2"
                    >
                        <el-row>
                            <el-col :span="24">
                                <div
                                    class="text-btn"
                                    @click="setCondition"
                                >{{ getSetConditionText() }}</div>
                            </el-col>
                            <el-col :span="24">
                                <div class="info-text">仅会聚合符合过滤条件的数据</div>
                            </el-col>
                        </el-row>
                    </el-form-item>
                </div>
            </el-form-item>
            <el-form-item label="执行优先级">
                <el-input-number
                    v-model="trigger.priority"
                    @change="priorityChange"
                    :min="-99999"
                    :max="99999"
                />
                <div class="w-100 info-text" style="line-height: 24px;">优先级高 (数字大) 的会被先执行</div>
            </el-form-item>
            <el-form-item label=" " class="mt-30">
                <el-button type="primary" @click="onSave" style="width:100px;height: 36px;">保存</el-button>
            </el-form-item>
        </el-form>
        <div v-if="mlFormulaIsShow">
            <mlFormula
                v-model="mlFormulaIsShow"
                :fields="mlFormulaFields"
                :defaultFormulaVal="mlFormulaVal"
                :isAdvanced="mlIsAdvanced"
                @confirm="formulaConfirm"
            />
        </div>
        <div v-if="dialogIsShow">
            <mlDialog title="聚合数据条件" append-to-body width="37%" v-model="dialogIsShow">
                <mlSetConditions
                    v-model="trigger.polymerization"
                    footer
                    @cancel="dialogIsShow = false"
                    @confirm="conditionConfirm"
                />
            </mlDialog>
        </div>
    </div>
</template>

<script setup>
import { watch, ref, onMounted, reactive, inject } from "vue";
import { queryEntityFields } from "@/api/crud";
import mlFormula from "@/components/mlFormula/index.vue";
const $ElMessage = inject("$ElMessage");
const props = defineProps({
    modelValue: null,
});
const emit = defineEmits(["update:modelValue", "onSave"]);
// 操作内容loading
let contentLoading = ref(false);

watch(
    () => props.modelValue,
    () => {
        trigger.value = props.modelValue;
    },
    { deep: true }
);
let trigger = ref({
    selectTagEntity: "",
});

onMounted(() => {
    trigger.value = props.modelValue;
});

// 优先级
const priorityChange = () => {
    emit("update:modelValue", trigger.value);
};

/**
 * ********************************************** 更新规则、聚合规则相关 beg
 */
// 目标字段loading
let targetFieldLoading = ref(false);
let targetFieldList = ref([]);
//  更新规则
let uptadeRule = reactive({
    // 目标字段
    targetField: "",
    // 更新方式
    updateMode: "forField",
    // 源字段
    sourceField: "",
    // 如果更新方式是 计算公式  判断是否是高级公式
    SimpleFormula: false,
});

// 当前选择的目标字段
let seleteTargetField = ref({});

// 更新方式
let uptadeModeList = ref([
    {
        label: "字段值",
        value: "forField",
    },
    {
        label: "固定值",
        value: "toFixed",
    },
    {
        label: "置空",
        value: "toNull",
    },
    {
        label: "计算公式",
        value: "forCompile",
    },
]);
// 更新方式-固定值-目标字段类型
let toFixedForFieldType = ref("");

const formulaConfirm = (v) => {
    uptadeRule.sourceField = v;
};

// 目标实体切换
const targetFieldChange = () => {
    // 获取当前选中的目标实体数据
    let inx = trigger.value.selectTagEntity;
    let cutEntity = trigger.value.dataUpdateEntityList[inx];
    // 目标实体
    trigger.value.entityName = cutEntity.entityName;
    // 关联字段
    trigger.value.fieldName = cutEntity.fieldName;
    // 是否一对多
    trigger.value.N = cutEntity.N;
    // 清空已添加的更新规则
    trigger.value.uptadeRuleList = [];
    // 如果目标实体数据的code不存在，拿当前实体的所有字段
    if (!cutEntity.entityCode) {
        targetFieldList.value = trigger.value.entityFields;
        seleteTargetField.value = targetFieldList.value[0];
    } else {
        getTargetFieldList(cutEntity.entityCode);
    }
};

// 目标字段切换
const uptadeRuleTargetFieldChange = (e) => {
    uptadeRule.targetField = e.fieldName;
    // 获取字段的type
    toFixedForFieldType.value = getUptadeRuleTargetFieldType(e.fieldName);
    // 如果更新方式是字段值，源字段默认选中第一个
    if (uptadeRule.updateMode == "forField") {
        uptadeRule.sourceField = floatSourceFieldList()[0].fieldName;
    } else {
        uptadeRule.sourceField = "";
    }
};

// 获取目标字段类型
const getUptadeRuleTargetFieldType = (fieldName) => {
    let field = targetFieldList.value.filter((el) => el.fieldName == fieldName);
    return field[0].fieldType;
};

// 更新方式切换
const uptadeModeChange = (e) => {
    if (e.value == "forField") {
        // 源字段默认选中第一个
        uptadeRule.sourceField = floatSourceFieldList()[0].fieldName;
    } else {
        uptadeRule.sourceField = null;
    }
};

// 添加更新规则
const addUptadeRule = () => {
    // console.log(uptadeRule, "uptadeRule");
    let { targetField, updateMode, sourceField, SimpleFormula } = uptadeRule;
    if (!sourceField) {
        return;
    }
    if (targetField == sourceField) {
        $ElMessage.warning("目标字段与源字段不能为同一字段!");
        return;
    }
    if (
        targetField == "mobilePhone" &&
        updateMode == "toFixed" &&
        (sourceField.length != 11 || isNaN(sourceField))
    ) {
        $ElMessage.warning("手机号格式不正确!");
        return;
    }
    let chekTargetField = trigger.value.uptadeRuleList.filter(
        (el) => el.targetField == targetField
    );
    if (chekTargetField.length > 0) {
        $ElMessage.warning("目标字段重复!");
        return;
    }
    trigger.value.uptadeRuleList.push({
        targetField,
        updateMode,
        sourceField,
        SimpleFormula,
    });
};

// 删除规则
const delUptadeRule = (inx) => {
    trigger.value.uptadeRuleList.splice(inx, 1);
};

// 获取目标字段List
const getTargetFieldList = async (entityCode) => {
    let res = await queryEntityFields(entityCode);
    if (res.code === 200) {
        targetFieldList.value = res.data;
        // 目标字段 默认选中 第一个
        seleteTargetField.value = res.data[0];
        uptadeRule.targetField = res.data[0].fieldName;
        // 获取目标字段类型
        toFixedForFieldType.value = getUptadeRuleTargetFieldType(
            res.data[0].fieldName
        );
        // 如果更新方式是字段值
        if (uptadeRule.updateMode == "forField") {
            // 源字段 默认选中第一个
            uptadeRule.sourceField = floatSourceFieldList()[0].fieldName;
        }
    } else {
        $ElMessage.error("获取目标字段数据失败：" + res.error);
    }
};

// 获取目标字段显示label
const getTargeFieldLabel = (fieldName) => {
    let filterVal = targetFieldList.value.filter(
        (el) => el.fieldName == fieldName
    );
    return filterVal[0]?.fieldLabel || "（该字段已删除）";
};

// 获取更新方式显示label
const getUpdateModeLabel = (value) => {
    let filterVal = uptadeModeList.value.filter((el) => el.value == value);
    return filterVal[0]?.label;
};

// 获取源字段显示label
const getSourceFieldLabel = (item) => {
    if (item.updateMode !== "forField") {
        if (item.sourceField == 1) {
            return "正常";
        }
        if (item.sourceField == 0) {
            return "禁用";
        }
        return item.sourceField;
    }
    let filterVal = trigger.value.entityFields?.filter(
        (el) => el.fieldName == item.sourceField
    );
    return filterVal[0]?.fieldLabel;
    // return fieldName
};
// 格式化源字段显示
const floatSourceFieldList = () => {
    // 字符串字段
    let strField = ["Email", "Url", "TextArea", "Text"];
    let { fieldType } = seleteTargetField.value;
    // 如果是字符串字段，显示所有字符串字段
    // 如果不是就显示通类型字段
    if (strField.includes(fieldType)) {
        return trigger.value.entityFields;
    } else {
        let showFields = [];
        trigger.value.entityFields?.forEach((el) => {
            if (el.fieldType == fieldType) {
                showFields.push(el);
            }
        });
        if (showFields.length < 1) {
            return trigger.value.entityFields;
        } else {
            return showFields;
        }
    }
};

// 获取源字段info
const getSourceFieldInfo = () => {
    if (uptadeRule.updateMode == "forField") {
        return "源字段";
    }
    if (uptadeRule.updateMode == "toFixed") {
        return "固定值";
    }
    if (uptadeRule.updateMode == "forCompile") {
        return "计算公式";
    }
};

/**
 * ********************************************** 更新规则、聚合规则相关 end
 */

/**
 * ********************************************** 计算公式显示相关 beg
 */
// 是否显示计算公式
let mlFormulaIsShow = ref(false);
// 计算公式源字段
let mlFormulaFields = ref([]);
// 高级 计算公式 回显值
let mlFormulaVal = ref("");
let numType = ref(["Integer", "Decimal", "Percent", "Money"]);
let mlIsAdvanced = ref(false);
// 判断计算公式显示
const checkMlFormula = () => {
    // 判断目标字段是不是数字类型
    if (numType.value.includes(toFixedForFieldType.value)) {
        let numTypeFields = [];
        // 循环源字段，把所有的数字类型字段遍历出来
        trigger.value.entityFields.forEach((el) => {
            // if (numType.value.includes(el.fieldType)) {
            numTypeFields.push(el);
            // }
        });
        // 如果源字段没有数字类型 显示 高级计算公式
        if (numTypeFields.length < 1) {
            showAdvancedFormula(
                trigger.value.entityFields,
                true,
                uptadeRule.sourceField
            );
            return;
        }
        // 否则就显示 数字类型的 计算公式
        showAdvancedFormula(numTypeFields, false);
    }
    // 不是数字类型，显示高级计算公式
    else {
        showAdvancedFormula(
            trigger.value.entityFields,
            true,
            uptadeRule.sourceField
        );
    }
};
// 执行显示 计算公式
/**
 *
 * @param {*} sourceFields 源字段
 * @param {*} isAdvanced 是否高级 计算公式
 * @param {*} value   高级公式默认值
 */
const showAdvancedFormula = (sourceFields, isAdvanced, value) => {
    mlFormulaIsShow.value = true;
    mlFormulaFields.value = sourceFields;
    mlIsAdvanced.value = isAdvanced;
    mlFormulaVal.value = isAdvanced ? value : "";
    uptadeRule.SimpleFormula = isAdvanced;
};
/**
 * ********************************************** 计算公式显示相关 end
 */

/**
 * ********************************************** 聚合规则 设置条件相关 beg
 */

let dialogIsShow = ref(false);
// 条件框传值
let conditionConf = ref({});
// 设置条件
const setCondition = () => {
    let { polymerization } = Object.assign({}, trigger.value);
    polymerization = initFilter(polymerization);
    conditionConf.value = polymerization;
    dialogIsShow.value = true;
};
// 初始化条件
const initFilter = (filter) => {
    let { equation } = filter;
    if (!equation || equation === "OR") {
        filter.type = 1;
        filter.equation = "OR";
    } else if (equation === "AND") {
        filter.type = 2;
        filter.equation = "AND";
    } else {
        filter.type = 3;
    }
    return filter;
};

// 获取设置条件文案
const getSetConditionText = () => {
    let { polymerization } = trigger.value;
    let length =
        polymerization && polymerization.items
            ? polymerization.items.length
            : 0;
    return length > 0 ? `已设置条件（${length}）` : "点击设置";
};

// 确认设置条件
const conditionConfirm = (e) => {
    trigger.value.polymerization = e;
    dialogIsShow.value = false;
    emit("update:modelValue", trigger.value);
};

/**
 * ********************************************** 聚合规则 设置条件相关 end
 */

// 保存调用
const onSave = () => {
    // 需要定期执行
    // if ((trigger.whenNum & 512) > 0) {
    //     trigger.cron = triggerTakeActionRef.value.getCronVal();
    // }

    // console.log(trigger.value, "保存调用...");
    emit("onSave");
    // saveRecord
};

defineExpose({
    contentLoading,
    getTargetFieldList,
});
</script>
<style lang="scss" scoped>
.action-div {
    width: 70%;
    padding: 20px 60px 20px 40px;
    border-radius: 4px;
    background: #f7f7f7;
}
.blod {
    font-weight: bold;
}

.uptade-rule {
    .info-text {
        font-size: 13px;
    }
}
:deep(.el-form-item__content) {
    padding-left: 10px;
}
:deep(.el-textarea__inner) {
    //el_input中的隐藏属性
    resize: none; //禁止拉伸
    color: #f07178;
}
.uptade-rule-row {
    .uptade-rule-span {
        display: inline-block;
        background: #fbbc05;
        line-height: 20px;
        color: #fff;
        padding: 5px 10px;
        border-radius: 2px;
        &.toFixed {
            background: #fff;
            color: #000;
            border: 1px solid #dcdfe6;
        }
        &.forCompile {
            color: #f07178;
        }
    }
    .uptade-rule-col-last {
        .del-icon {
            margin-left: 2px;
            color: #9999b1;
            cursor: pointer;
            position: relative;
            z-index: -1;
            &:hover {
                color: #000;
            }
        }
    }
    &:hover {
        .del-icon {
            z-index: 1;
        }
    }
}
</style>