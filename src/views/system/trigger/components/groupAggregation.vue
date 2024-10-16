<template>
    <!-- 分组聚合 -->
    <div class="action-div" v-loading="contentLoading">
        <el-form-item label="目标实体">
            <el-row class="w-100 mb-15" :gutter="20">
                <el-col :span="9">
                    <el-select
                        v-model="trigger.defaultTargetEntity"
                        filterable
                        class="w-100"
                        @change="targetEntityChange"
                        :disabled="trigger.isOnSave"
                        value-key="entityInx"
                    >
                        <template v-for="(op,inx) in tagEntitys" :key="inx">
                            <el-option :label="op.label" :value="op" />
                        </template>
                    </el-select>
                </el-col>
            </el-row>
        </el-form-item>
        <el-form-item class="mt-20" label="聚合目标条件">
            <el-row>
                <el-col :span="24">
                    <span
                        class="ml-a-span"
                        @click="setCondition('targetFilter')"
                    >{{ getSetConditionText('targetFilter') }}</span>
                </el-col>
                <el-col :span="24">
                    <div class="info-text">仅会聚合到符合条件的数据上</div>
                </el-col>
            </el-row>
        </el-form-item>
        <!-- 分组字段关联 -->
        <el-form-item class="mt-20">
            <template #label>分组字段关联</template>
            <div class="w-100 mb-10" v-if="groupItems.length > 0">
                <el-row
                    :gutter="20"
                    class="update-rule-row w-100 mb-5"
                    v-for="(item,inx) of groupItems"
                    :key="inx"
                >
                    <el-col :span="9">
                        <span class="update-rule-span">{{ item.targetField?.fieldLabel }}</span>
                    </el-col>
                    <el-col :span="9" class="update-rule-col-last">
                        <span class="update-rule-span">
                            {{ item.sourceField?.fieldLabel }}
                            <span
                                class="del-icon"
                                @click="delGroupItem(inx)"
                            >
                                <el-icon>
                                    <ElIconCloseBold />
                                </el-icon>
                            </span>
                        </span>
                    </el-col>
                </el-row>
            </div>
            <el-row class="w-100 mb-10 update-rule" :gutter="20" v-loading="changeTagEntityLoading">
                <el-col :span="9">
                    <el-select
                        v-model="selectGroupTagField"
                        filterable
                        class="w-100"
                        value-key="fieldLabel"
                        @change="groupTagFieldChange"
                    >
                        <template v-for="(op,inx) in getGroupEntityFields()" :key="inx">
                            <el-option :label="op.fieldLabel" :value="op" />
                        </template>
                    </el-select>
                    <div class="w-100 info-text mt-3">目标字段</div>
                </el-col>
                <el-col :span="9">
                    <el-select
                        v-model="selectGroupSourceField"
                        filterable
                        class="w-100"
                        value-key="fieldLabel"
                    >
                        <el-option
                            v-for="(op,inx) in getGroupSourceOptions()"
                            :key="inx"
                            :label="op.fieldLabel"
                            :value="op"
                        />
                    </el-select>
                    <div class="w-100 info-text mt-3">源字段</div>
                </el-col>
            </el-row>
        </el-form-item>
        <el-form-item label=" ">
            <el-button type="primary" plain @click="addGroupItem">+ 添加</el-button>
        </el-form-item>
        <!-- 聚合规则 -->
        <el-form-item class="mt-20">
            <template #label>聚合规则</template>
            <div class="w-100 mb-10" v-if="actionContentItems.length > 0">
                <el-row
                    :gutter="20"
                    class="update-rule-row w-100 mb-5"
                    v-for="(item,inx) of actionContentItems"
                    :key="inx"
                >
                    <el-col :span="9">
                        <span class="update-rule-span">{{ item.targetField }}</span>
                    </el-col>
                    <el-col :span="5">
                        <span class="update-rule-span">{{ item.calcMode }}</span>
                    </el-col>
                    <el-col :span="9" class="update-rule-col-last">
                        <span
                            class="update-rule-span"
                            :class="{'toFixed':item.calcMode == 'toFixed','forCompile':item.calcMode == 'forCompile'}"
                        >
                            {{ item.sourceField }}
                            <span
                                class="del-icon"
                                @click="delupdateRule(inx)"
                            >
                                <el-icon>
                                    <ElIconCloseBold />
                                </el-icon>
                            </span>
                        </span>
                    </el-col>
                </el-row>
            </div>
            <el-row class="w-100 mb-10 update-rule" :gutter="20" v-loading="changeTagEntityLoading">
                <el-col :span="9">
                    <el-select
                        v-model="selectTargetField"
                        filterable
                        class="w-100"
                        @change="targetFieldChange"
                        value-key="fieldLabel"
                    >
                        <template v-for="(op,inx) in getRuleEntityFields()" :key="inx">
                            <el-option :label="op.fieldLabel" :value="op" />
                        </template>
                    </el-select>
                    <div class="w-100 info-text mt-3">目标字段</div>
                </el-col>
                <el-col :span="5">
                    <el-select
                        v-model="updateRule.calcMode"
                        class="w-100"
                        @change="uptadeModeChange"
                    >
                        <el-option
                            v-for="(op,inx) in getUptadeMode()"
                            :key="inx"
                            :label="op.label"
                            :value="op.value"
                        />
                    </el-select>
                    <div class="w-100 info-text mt-3">聚合方式</div>
                </el-col>
                <el-col :span="9">
                    <el-select
                        v-if="updateRule.calcMode !== 'forCompile'"
                        v-model="updateRule.sourceField"
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
                    <el-input
                        v-else
                        v-model="updateRule.sourceField"
                        placeholder="计算公式"
                        autosize
                        type="textarea"
                        @click="checkMlFormula"
                    ></el-input>
                    <div
                        class="w-100 info-text mt-3"
                        v-if="updateRule.calcMode !== 'toNull'"
                    >{{ getSourceFieldInfo() }}</div>
                </el-col>
            </el-row>
        </el-form-item>
        <el-form-item label=" ">
            <el-button type="primary" plain @click="addUpdateRule">+ 添加</el-button>
        </el-form-item>
        <el-form-item class="mt-20" label="聚合数据条件">
            <el-row>
                <el-col :span="24">
                    <span
                        class="ml-a-span"
                        @click="setCondition('filter')"
                    >{{ getSetConditionText('filter') }}</span>
                </el-col>
                <el-col :span="24">
                    <div class="info-text">仅会聚合符合过滤条件的数据</div>
                </el-col>
                <el-col class="mt-10">
                    <el-checkbox v-model="trigger.actionContent.autoCreate">目标记录不存在时自动新建</el-checkbox>
                </el-col>
            </el-row>
        </el-form-item>
        <el-form-item class="mt-20" label="聚合后回填">
            <el-row>
                <el-select
                    v-model="trigger.actionContent.callbackField"
                    class="m-2"
                    placeholder="(可选)"
                    clearable
                >
                    <el-option
                        v-for="item in getCallbackFieldOptions()"
                        :key="item.fieldName"
                        :label="item.fieldLabel"
                        :value="item.fieldName"
                    />
                </el-select>
            </el-row>
        </el-form-item>

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
                    v-model="conditionConf"
                    footer
                    @cancel="dialogIsShow = false"
                    @confirm="conditionConfirm"
                    :entityName="trigger.entityName"
                />
            </mlDialog>
        </div>
    </div>
</template>

<script setup>
import { queryEntityFields } from "@/api/crud";
import { ref, onMounted, inject, reactive, render } from "vue";
import mlFormula from "@/components/mlFormula/index.vue";
const $API = inject("$API");
const $ElMessage = inject("$ElMessage");
import useCommonStore from "@/store/modules/common";
import { storeToRefs } from "pinia";
const { allEntityName, unSystemEntityList } = storeToRefs(useCommonStore());
const props = defineProps({
    modelValue: null,
});
// 内容加载loading
let contentLoading = ref(false);
// 数据源
let trigger = ref({
    actionContent: {},
});
onMounted(() => {
    trigger.value = props.modelValue;
    trigger.value.entityName = allEntityName.value[trigger.value.entityCode];
    // 初始化 聚合数据条件
    if (!trigger.value.actionContent.filter) {
        trigger.value.actionContent.filter = {
            items: [],
        };
    }
    // 初始化 分组关联
    if (!trigger.value.actionContent.groupItem) {
        trigger.value.actionContent.groupItem = [];
    }
    // 初始化 聚合目标条件
    if (!trigger.value.actionContent.targetFilter) {
        trigger.value.actionContent.targetFilter = {
            items: [],
        };
    }
    // 获取操作内容数据
    getActionContentData();
});

/**
 * *************************************** 获取操作内容数据相关 beg
 */
// notNeed

// 目标实体（所有实体）
let tagEntitys = ref([]);
// 目标实体所有字段
let tagEntityFields = ref([]);
// 目标实体所有字段 key-value
let tagEntityFieldLable = ref({});
// 源实体所有字段
let cutEntityFields = ref([]);
// 源实体所有字段 key-value
let cutEntityFieldLable = ref({});
// 切换目标实体Loading
let changeTagEntityLoading = ref(false);

// 获取操作内容数据
const getActionContentData = async () => {
    contentLoading.value = true;
    // let { value } = trigger.value.actionType;
    // 获取目标实体所有字段、当前实体所有字段
    Promise.all([getTagEntitys(), getCutEntityFields()]).then(() => {
        contentLoading.value = false;
        if (tagEntitys.value.length > 0) {
            // 目标实体默认选中第1个
            let defalutInx = 0;
            // 如果是编辑过的，找到之前选中的数据
            if (trigger.value.isOnSave) {
                let { actionContent } = trigger.value;
                tagEntitys.value.forEach((el, elInx) => {
                    if (el.name == actionContent.entityName) {
                        defalutInx = elInx;
                    }
                });
            }

            // 设置选中
            trigger.value.defaultTargetEntity =
                unSystemEntityList.value[defalutInx];

            // 获取选中实体的所有字段
            getTagEntityFields(unSystemEntityList.value[defalutInx].entityCode);
        }
    });
};

// 获取实体（目标实体）
const getTagEntitys = () => {
    return new Promise(async (resolve, reject) => {
        // let res = await $API.trigger.detail.aggregationEntityList(
        //     trigger.value.entityCode
        // );
        // if (res && res.data) {
        tagEntitys.value = [];
        if (unSystemEntityList.value && unSystemEntityList.value.length > 0) {
            tagEntitys.value = unSystemEntityList.value.map((el, inx) => {
                el.entityInx = inx;
                return el;
            });
        }
        // }
        resolve();
    });
};
// 当前实体所有字段
const getCutEntityFields = () => {
    return new Promise(async (resolve, reject) => {
        let res = await queryEntityFields(trigger.value.entityCode, true, true, true);
        if (res) {
            cutEntityFields.value = res.data;
            res.data.forEach((el) => {
                cutEntityFieldLable.value[el.fieldName] = el.fieldLabel;
            });
        }
        resolve();
    });
};

// 获取目标实体所有字段
const getTagEntityFields = async (entityCode) => {
    changeTagEntityLoading.value = true;
    let res = await queryEntityFields(entityCode, false, true, true);
    if (res) {
        tagEntityFields.value = [];
        res.data.forEach((el) => {
            if (el.fieldType) {
                tagEntityFieldLable.value[el.fieldName] = el.fieldLabel;
                tagEntityFields.value.push(el);
            }
        });
        if (getRuleEntityFields().length > 0) {
            // 目标字段 默认选中 第一个
            selectTargetField.value = getRuleEntityFields()[0];
            updateRule.targetField = getRuleEntityFields()[0].fieldName;

            // 获取目标字段类型
            toFixedForFieldType.value = getUpdateRuleTargetFieldType(
                getRuleEntityFields()[0].fieldName
            );
            // 聚合方式默认选中
            updateRule.calcMode = getUptadeMode()[0].value;
            // 如果聚合方式不是 计算公式 ，源字段默认选中第一个
            if (updateRule.calcMode !== "forCompile") {
                updateRule.sourceField = floatSourceFieldList()[0]?.fieldName;
            }
            // 格式化规则列表
            formatActionContentItems();
        } else {
            selectTargetField.value = {};
            updateRule.targetField = "";
            updateRule.calcMode = "";
            updateRule.sourceField = "";
        }

        if (getGroupEntityFields().length > 0) {
            // 分组关联
            selectGroupTagField.value = getGroupEntityFields()[0];
            // 格式化分组列表
            formatGroupItems();
        }
    }

    changeTagEntityLoading.value = false;
};

/**
 * *************************************** 获取操作内容数据相关 end
 */

// 当前选择的目标字段
let selectTargetField = ref({});

/**
 * *************************************** 更新规则相关 beg
 */
//  更新规则
let updateRule = reactive({
    // 目标字段
    targetField: "",
    // 聚合方式
    calcMode: "",
    // 源字段
    sourceField: "",
    // 如果聚合方式是 计算公式  判断是否是高级公式
    simpleFormula: false,
});

// 聚合方式
const uptadeModeLabel = reactive({
    forCompile: "计算公式",
    concatSet: "去重拼接",
    concat: "拼接",
    min: "最小值",
    max: "最大值",
    average: "平均值",
    countSet: "去重计数",
    count: "计数",
    sum: "求和",
});

// 聚合方式-固定值-目标字段类型
let toFixedForFieldType = ref("");

// 删除规则
const delupdateRule = (inx) => {
    trigger.value.actionContent.items.splice(inx, 1);
    actionContentItems.value.splice(inx, 1);
};

// 目标字段切换
const targetFieldChange = (e) => {
    updateRule.targetField = e.fieldName;
    // 获取字段的type
    toFixedForFieldType.value = getUpdateRuleTargetFieldType(e.fieldName);
    updateRule.calcMode = getUptadeMode()[0].value;
    // 如果聚合方式不是 计算公式 ，源字段默认选中第一个
    if (updateRule.calcMode !== "forCompile") {
        updateRule.sourceField = floatSourceFieldList()[0]?.fieldName;
    } else {
        updateRule.sourceField = "";
    }
};

// 获取聚合方式
const getUptadeMode = () => {
    // 如果是数字类型
    if (numType.value.includes(toFixedForFieldType.value)) {
        return [
            {
                label: "求和",
                value: "sum",
            },
            {
                label: "计数",
                value: "count",
            },
            {
                label: "去重计数",
                value: "countSet",
            },
            {
                label: "平均值",
                value: "average",
            },
            {
                label: "最大值",
                value: "max",
            },
            {
                label: "最小值",
                value: "min",
            },
            {
                label: "计算公式",
                value: "forCompile",
            },
        ];
    }
    // 非数字类型
    else {
        return [
            {
                label: "计数",
                value: "count",
            },
            {
                label: "去重计数",
                value: "countSet",
            },
            {
                label: "拼接",
                value: "concat",
            },
            {
                label: "去重拼接",
                value: "concatSet",
            },
            {
                label: "计算公式",
                value: "forCompile",
            },
        ];
    }
};

// 聚合方式切换
const uptadeModeChange = (e) => {
    if (e.value == "forField") {
        // 源字段默认选中第一个
        updateRule.sourceField = floatSourceFieldList()[0]?.fieldName;
    } else {
        if (
            toFixedForFieldType.value == "Reference" ||
            toFixedForFieldType.value == "Option"
        ) {
            updateRule.sourceField = e == 'forCompile' ? '' : {};
        } else if (toFixedForFieldType.value == "Tag") {
            updateRule.sourceField = [];
        } else {
            updateRule.sourceField = null;
        }
    }
};

// 规则列表
let actionContentItems = ref([]);

// 添加聚合规则
const addUpdateRule = () => {
    let { targetField, calcMode, sourceField, simpleFormula, updateMode } =
        updateRule;
    if (!targetField) {
        return;
    }
    if (updateMode != "toNull" && !sourceField) {
        return;
    }
    if (
        trigger.value.actionContent.fieldName + "." + targetField ==
        sourceField
    ) {
        $ElMessage.warning("目标字段与源字段不能为同一字段!");
        return;
    }

    let chekTargetField = trigger.value.actionContent.items.filter(
        (el) => el.targetField == targetField
    );
    if (chekTargetField.length > 0) {
        $ElMessage.warning("目标字段重复!");
        return;
    }
    let forCompileVal = "";
    if (calcMode == "forCompile" && !simpleFormula) {
        forCompileVal = formulaVal.value;
    }
    trigger.value.actionContent.items.push({
        targetField,
        calcMode,
        sourceField: forCompileVal || sourceField,
        simpleFormula,
    });
    actionContentItems.value.push({
        targetField: formatTargetField(targetField),
        calcMode: formatCalcMode(calcMode),
        sourceField: formatSourceField(updateRule),
        simpleFormula,
    });
    if (calcMode == "forCompile") {
        updateRule.sourceField = "";
    }
};

// 格式化 目标字段
const formatTargetField = (targetField) => {
    return tagEntityFieldLable.value[targetField];
};

// 格式化 港式
const formatCalcMode = (calcMode) => {
    return uptadeModeLabel[calcMode];
};

// 格式化 源字段
const formatSourceField = (item) => {
    if (item.calcMode == "forCompile") {
        if (!item.simpleFormula) {
            return regSourceField(item.sourceField);
        } else {
            return item.sourceField;
        }
    } else {
        return cutEntityFieldLable.value[item.sourceField];
    }
};

const regSourceField = (sourceField) => {
    let str = sourceField;
    let regStr = str.match(/{([a-zA-Z0-9$\.]+)}/g);
    if (!regStr) {
        return str;
    }
    regStr.forEach((el) => {
        let formatStr = el.substring(1);
        formatStr = formatStr.substring(0, formatStr.length - 1);
        let splitStr = formatStr.split("$");
        let replaceStr = `{${cutEntityFieldLable.value[splitStr[0]]}(${
            uptadeModeLabel[splitStr[1]]
        })}`;
        str = str.replace(el, replaceStr);
    });

    return str;
};

// 格式化规则列表
const formatActionContentItems = () => {
    actionContentItems.value = [];
    trigger.value.actionContent.items.forEach((el) => {
        // console.log(el);
        actionContentItems.value.push({
            targetField: formatTargetField(el.targetField),
            calcMode: formatCalcMode(el.calcMode),
            sourceField: formatSourceField(el),
            simpleFormula: el.simpleFormula,
        });
    });
};

/**
 * *************************************** 更新规则相关 end
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
let textType = ref(["Text", "TextArea"]);
let timeType = ref(["DateTime", "Date"]);
let mlIsAdvanced = ref(false);
let formulaVal = ref({});
// 判断计算公式显示
const checkMlFormula = () => {
    // 判断目标字段是不是数字类型
    // if (numType.value.includes(toFixedForFieldType.value)) {
    //     let numTypeFields = [];
    //     // 循环源字段，把所有的数字类型字段遍历出来
    //     cutEntityFields.value.forEach((el) => {
    //         if (numType.value.includes(el.fieldType)) {
    //             numTypeFields.push(el);
    //         }
    //     });
    //     // 如果源字段没有数字类型 显示 高级计算公式
    //     if (numTypeFields.length < 1) {
    //         showAdvancedFormula(
    //             cutEntityFields.value,
    //             true,
    //             updateRule.sourceField
    //         );
    //         return;
    //     }
    //     // 否则就显示 数字类型的 计算公式
    //     showAdvancedFormula(numTypeFields, false);
    // }
    // // 不是数字类型，显示高级计算公式
    // else {
    showAdvancedFormula(cutEntityFields.value, true, updateRule.sourceField);
    // }
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
    updateRule.simpleFormula = isAdvanced;
};

// 确认计算方式
const formulaConfirm = (formula) => {
    formulaVal.value = formula;
    updateRule.sourceField = formula.label;
};

/**
 * ********************************************** 计算公式显示相关 end
 */

/**
 * *************************************** 数据格式化相关 beg
 */

// 获取目标字段类型
const getUpdateRuleTargetFieldType = (fieldName) => {
    let field = tagEntityFields.value.filter((el) => el.fieldName == fieldName);
    return field[0].fieldType;
};

// 格式化源字段显示
const floatSourceFieldList = () => {
    let needShowNumType = ["sum", "average", "max", "min"];
    // 如果选择是数字类
    if (needShowNumType.includes(updateRule.calcMode)) {
        let showFields = [];
        cutEntityFields.value.forEach((el) => {
            if (numType.value.includes(el.fieldType)) {
                showFields.push(el);
            }
        });
        return showFields;
    } else {
        return cutEntityFields.value;
    }
};

// 获取源字段info
const getSourceFieldInfo = () => {
    if (updateRule.calcMode == "forCompile") {
        return "计算公式";
    } else {
        return "聚合字段";
    }
};

/**
 * *************************************** 数据格式化相关 end
 */

/**
 * ********************************************** 聚合规则 设置条件相关 beg
 */

let dialogIsShow = ref(false);
// 条件框传值
let conditionConf = ref({});
// 当期操作对象
let cutActionConf = ref("");
// 设置条件
const setCondition = (val) => {
    cutActionConf.value = val;
    let filter = trigger.value.actionContent[val];
    filter = initFilter(filter);
    conditionConf.value = JSON.parse(JSON.stringify(filter));
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
const getSetConditionText = (val) => {
    let filter = trigger.value.actionContent[val];
    let length = filter && filter.items ? filter.items.length : 0;
    return length > 0 ? `已设置条件（${length}）` : "点击设置";
};

// 确认设置条件
const conditionConfirm = (e) => {
    trigger.value.actionContent[cutActionConf.value] = e;
    dialogIsShow.value = false;
};

/**
 * ********************************************** 聚合规则 设置条件相关 end
 */

// 目标实体切换
const targetEntityChange = () => {
    // 获取当前选中的目标实体数据
    let cutEntity = trigger.value.defaultTargetEntity;
    // 目标实体
    trigger.value.actionContent.entityName = cutEntity.entityName;
    // 关联字段
    trigger.value.actionContent.fieldName = cutEntity.fieldName;
    // 清空已添加的更新规则
    trigger.value.actionContent.items = [];
    // 如果目标实体数据的code不存在，拿当前实体的所有字段
    if (!cutEntity.entityCode) {
        tagEntityFields.value = cutEntityFields.value;
        selectTargetField.value = tagEntityFields.value[0];
    } else {
        getTagEntityFields(cutEntity.entityCode);
    }
};

// 聚合规则所有字段
const getRuleEntityFields = () => {
    return tagEntityFields.value.filter(
        (el) => el.fieldType && (numType.value.includes(el.fieldType) || timeType.value.includes(el.fieldType))
    );
};

/**
 * ********************************************** 分组规则
 */
// 分组字段关联
let groupItems = ref([]);
// 分组字段关联实体所有字段
const getGroupEntityFields = () => {
    return tagEntityFields.value.filter(
        (el) =>
            (el.fieldType &&
                (textType.value.includes(el.fieldType) ||
                    numType.value.includes(el.fieldType) ||
                    el.fieldType == "Reference")) ||
            el.fieldType == "Date" ||
            el.fieldType == "DateTime"
    );
};

//  分组关联目标字段
let selectGroupTagField = ref({});
let selectGroupSourceField = ref({});

// 分组关联目标字段切换
const groupTagFieldChange = () => {
    if (getGroupSourceOptions().length > 0) {
        selectGroupSourceField.value = getGroupSourceOptions()[0];
    } else {
        selectGroupSourceField.value = {};
    }
};

// 分组关联源字段下拉框数据
const getGroupSourceOptions = () => {
    let { fieldType } = selectGroupTagField.value;
    return cutEntityFields.value.filter((el) => el.fieldType == fieldType);
};

// 添加分组关联
const addGroupItem = () => {
    let tagFieldName = selectGroupTagField.value?.fieldName;
    let sourceFieldName = selectGroupSourceField.value?.fieldName;
    if (!tagFieldName || !sourceFieldName) {
        return;
    }

    let chekTargetField = trigger.value.actionContent.groupItem.filter(
        (el) => el.targetField == tagFieldName
    );
    if (chekTargetField.length > 0) {
        $ElMessage.warning("目标字段重复!");
        return;
    }
    groupItems.value.push({
        targetField: selectGroupTagField.value,
        sourceField: selectGroupSourceField.value,
    });
    trigger.value.actionContent.groupItem.push({
        targetField: tagFieldName,
        targetFieldName: selectGroupTagField.value.fieldLabel,
        sourceField: sourceFieldName,
        sourceFieldName: selectGroupSourceField.value.fieldLabel,
    });
};

// 删除分组关联
const delGroupItem = (inx) => {
    trigger.value.actionContent.groupItem.splice(inx, 1);
    groupItems.value.splice(inx, 1);
};

// 格式化分组规则
const formatGroupItems = () => {
    groupItems.value = [];
    trigger.value.actionContent.groupItem.forEach((el) => {
        groupItems.value.push({
            targetField: { fieldLabel: el.targetFieldName },
            sourceField: { fieldLabel: el.sourceFieldName },
        });
    });
};

// 获取聚合回填下拉框数据
const getCallbackFieldOptions = () => {
    let name = trigger.value.defaultTargetEntity?.name;
    return cutEntityFields.value.filter(
        (el) => el.fieldType == "Reference" && el.referenceName == name
    );
};
</script>
<style lang='scss' scoped>
.update-rule-row {
    .update-rule-span {
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
    .update-rule-col-last {
        position: relative;
        word-break: break-all;
        .update-rule-span {
            position: relative;
            .del-icon {
                position: absolute;
                right: -16px;
                top: 6px;
                //margin-left: 2px;
                color: #9999b1;
                cursor: pointer;
                z-index: -1;
                &:hover {
                    color: #000;
                }
            }
        }
    }
    &:hover .update-rule-col-last .update-rule-span {
        .del-icon {
            z-index: 1;
        }
    }
}
</style>