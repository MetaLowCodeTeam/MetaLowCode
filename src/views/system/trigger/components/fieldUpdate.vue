<template>
    <!-- 字段更新、聚合 -->
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
                        <el-option
                            v-for="(op,inx) in tagEntityList"
                            :key="inx"
                            :label="op.label"
                            :value="op"
                        />
                    </el-select>
                </el-col>
            </el-row>
        </el-form-item>
        <!-- 更新规则 -->
        <el-form-item>
            <template #label>更新规则</template>
            <div class="w-100 mb-10" v-if="trigger.actionContent?.items?.length > 0">
                <el-row
                    :gutter="20"
                    class="update-rule-row w-100 mb-5"
                    v-for="(item,inx) of trigger.actionContent.items"
                    :key="inx"
                >
                    <el-col :span="9">
                        <span class="update-rule-span">{{ getTargetFieldLabel(item.targetField) }}</span>
                    </el-col>
                    <el-col :span="5">
                        <span class="update-rule-span">{{ getUpdateModeLabel(item.updateMode) }}</span>
                    </el-col>
                    <el-col :span="9" class="update-rule-col-last">
                        <div 
                            v-if="item.updateMode == 'forCompile'"
                            class="forCompile update-rule-span"
                            style="width: calc(100% - 20px);cursor: pointer;"
                            @click="openPreview(item.sourceField, item.scriptType, inx)"
                        >
                            <div class="w-100 yichu">
                                {{ getSourceFieldLabel(item) }}
                            </div>
                            <span
                                class="del-icon"
                                @click.stop="delUpdateRule(inx)"
                            >
                                <el-icon>
                                    <ElIconCloseBold />
                                </el-icon>
                            </span>
                        </div>
                        <span
                            v-else
                            class="update-rule-span"
                            :class="{'toFixed':item.updateMode == 'toFixed','toNull':item.updateMode == 'toNull'}"
                        >
                            {{ getSourceFieldLabel(item) }}
                            <span
                                class="del-icon"
                                @click="delUpdateRule(inx)"
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
                        <el-option
                            v-for="(op,inx) in tagEntityFields"
                            :key="inx"
                            :label="op.fieldLabel"
                            :value="op"
                        />
                    </el-select>
                    <div class="w-100 info-text mt-3">目标字段</div>
                </el-col>
                <el-col :span="5">
                    <el-select
                        v-model="updateRule.updateMode"
                        class="w-100"
                        @change="updateModeChange"
                    >
                        <el-option
                            v-for="(op,inx) in getUpdateModeList()"
                            :key="inx"
                            :label="op.label"
                            :value="op.value"
                        />
                    </el-select>
                    <div class="w-100 info-text mt-3">更新方式</div>
                </el-col>
                <el-col :span="9">
                    <el-select
                        v-if="updateRule.updateMode == 'forField'"
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

                    <el-select
                        v-if="updateRule.updateMode == 'toFixed' && toFixedForFieldType == 'Boolean'"
                        v-model="updateRule.sourceField"
                        filterable
                        class="w-100"
                    >
                        <el-option label="正常" value="1" />
                        <el-option label="禁用" value="0" />
                    </el-select>
                    <el-date-picker
                        v-if="updateRule.updateMode == 'toFixed' && (toFixedForFieldType == 'DateTime' || toFixedForFieldType == 'Date')"
                        v-model="updateRule.sourceField"
                        format="YYYY/MM/DD hh:mm:ss"
                        value-format="YYYY-MM-DD hh:mm:ss a"
                        type="datetime"
                    />
                    <el-input
                        v-if="updateRule.updateMode == 'toFixed' &&  toFixedForFieldType != 'Reference' && toFixedForFieldType != 'ReferenceList' &&  toFixedForFieldType != 'Tag' &&  toFixedForFieldType != 'Option' && toFixedForFieldType != 'Boolean' && toFixedForFieldType != 'DateTime' && toFixedForFieldType != 'Date'"
                        v-model="updateRule.sourceField"
                        placeholder="固定值"
                    ></el-input>
                    <el-input
                        v-if="updateRule.updateMode == 'toFixed' &&  (toFixedForFieldType == 'Reference' || toFixedForFieldType == 'ReferenceList')"
                        v-model="updateRule.sourceField.label"
                        placeholder="固定值"
                    >
                        <template #append>
                            <el-button @click="showReferenceDialogFlag = true">
                                <el-icon>
                                    <ElIconSearch />
                                </el-icon>
                            </el-button>
                        </template>
                    </el-input>
                    <el-select
                        v-if="updateRule.updateMode == 'toFixed' && toFixedForFieldType == 'Option'"
                        v-model="updateRule.sourceField"
                        v-loading="optionItemLoading"
                        filterable
                        class="w-100"
                    >
                        <el-option
                            v-for="(tOp,tInx) of optionItems"
                            :key="tInx"
                            :label="tOp.label"
                            :value="tOp"
                        />
                    </el-select>
                    <el-select
                        v-if="updateRule.updateMode == 'toFixed' && toFixedForFieldType == 'Tag'"
                        v-model="updateRule.sourceField"
                        v-loading="optionItemLoading"
                        filterable
                        class="w-100"
                        multiple
                    >
                        <el-option
                            v-for="(tOp,tInx) of optionItems"
                            :key="tInx"
                            :label="tOp.label"
                            :value="tOp"
                        />
                    </el-select>
                    <el-input
                        v-if="updateRule.updateMode == 'forCompile' && updateRule.scriptType == 'aviator'"
                        v-model="updateRule.sourceField"
                        placeholder="计算公式"
                        autosize
                        type="textarea"
                        @click="checkMlFormula"
                    ></el-input>
                    <el-input 
                        v-if="updateRule.updateMode == 'forCompile' && updateRule.scriptType == 'liteFlowJava'"
                        v-model="updateRule.sourceField"
                        placeholder="计算公式"
                        @click="checkMlFormula"
                    />
                    <div
                        class="w-100 info-text mt-3"
                        v-if="updateRule.updateMode !== 'toNull'"
                    >{{ getSourceFieldInfo() }}</div>
                </el-col>
            </el-row>
        </el-form-item>
        <el-form-item label=" ">
            <el-button type="primary" plain @click="addUpdateRule" icon="check">确定</el-button>
        </el-form-item>
        <div v-if="mlFormulaIsShow">
            <mlFormula
                ref="mlFormulaRef"
                v-model="mlFormulaIsShow"
                :fields="mlFormulaFields"
                :defaultFormulaVal="mlFormulaVal"
                :isAdvanced="mlIsAdvanced"
                :scriptType="updateRule.scriptType"
                @confirm="formulaConfirm"
                @editValue="formulaEditValue"
            />
        </div>
        <el-dialog
            title="请选择"
            v-if="showReferenceDialogFlag"
            v-model="showReferenceDialogFlag"
            :show-close="true"
            class="small-padding-dialog"
            :width="'520px'"
            draggable
            :close-on-click-modal="false"
            :close-on-press-escape="false"
            :append-to-body="true"
        >
            <ReferenceSearchTable
                ref="referST"
                :entity="trigger.defaultTargetEntity.entityName"
                :refField="updateRule.targetField"
                @recordSelected="setReferRecord"
            ></ReferenceSearchTable>
        </el-dialog>
    </div>
</template>

<script setup>
import { queryEntityFields } from "@/api/crud";
import { ref, onMounted, inject, reactive, nextTick } from "vue";
import mlFormula from "@/components/mlFormula/index.vue";
import { getOptionItems, getTagItems } from "@/api/system-manager";
import ReferenceSearchTable from "@/components/mlReferenceSearch/reference-search-table.vue";
const $API = inject("$API");
const $ElMessage = inject("$ElMessage");
const props = defineProps({
    modelValue: null,
});
// 内容加载loading
let contentLoading = ref(false);
// 数据源
let trigger = ref({});
onMounted(() => {
    trigger.value = props.modelValue;
    // 获取操作内容数据
    getActionContentData();
});

/**
 * *************************************** 获取操作内容数据相关 beg
 */

// 目标实体（所有实体）
let tagEntityList = ref([]);
// 目标实体所有字段
let tagEntityFields = ref([]);
// 目标实体所有字段 key-value
let tagEntityFieldLabel = ref({});
// 源实体所有字段
let cutEntityFields = ref([]);
// 源实体所有字段 key-value
let cutEntityFieldLabel = ref({});
// 切换目标实体Loading
let changeTagEntityLoading = ref(false);
// 引用实体弹框
let showReferenceDialogFlag = ref(false);
// 获取操作内容数据
const getActionContentData = async () => {
    contentLoading.value = true;
    let { value } = trigger.value.actionType;
    // 字段更新、字段聚合
    if (value == 1 || value == 2) {
        // 获取目标实体所有字段、当前实体所有字段
        Promise.all([getTagEntityList(), getCutEntityFields()]).then(() => {
            contentLoading.value = false;
            if (tagEntityList.value.length > 0) {
                // 目标实体默认选中第1个
                let defaultInx = 0;
                // 如果是编辑过的，找到之前选中的数据
                if (trigger.value.isOnSave) {
                    let { actionContent } = trigger.value;
                    tagEntityList.value.forEach((el, elInx) => {
                        if (
                            el.fieldName == actionContent.fieldName &&
                            el.entityName == actionContent.entityName
                        ) {
                            defaultInx = elInx;
                        }
                    });
                }
                // 设置选中
                trigger.value.defaultTargetEntity =
                    tagEntityList.value[defaultInx];
                // 获取选中实体的所有字段
                getTagEntityFields(tagEntityList.value[defaultInx].entityCode);
            }
        });
    }
};

// 获取实体（目标实体）
const getTagEntityList = () => {
    return new Promise(async (resolve, reject) => {
        let res = await $API.trigger.detail.dataUpdateEntityList(
            trigger.value.entityCode
        );
        if (res) {
            tagEntityList.value = res.data.map((el, inx) => {
                el.entityInx = inx;
                return el;
            });
            res.data.forEach((el) => {
                tagEntityFieldLabel.value[el.fieldName] = el.fieldLabel;
            });
        }
        resolve();
    });
};
// 当前实体所有字段
const getCutEntityFields = () => {
    return new Promise(async (resolve, reject) => {
        let res = await queryEntityFields(trigger.value.entityCode, true, true, true, true);
        if (res) {
            cutEntityFields.value = res.data || [];
            res.data.forEach((el) => {
                cutEntityFieldLabel.value[el.fieldName] = el.fieldLabel;
            });
        }
        resolve();
    });
};

// 获取目标实体所有字段
const getTagEntityFields = async (entityCode) => {
    changeTagEntityLoading.value = true;
    let res = await queryEntityFields(entityCode, false, false, true, true);
    if (res) {
        tagEntityFields.value = res.data;
        if (
            tagEntityFields.value &&
            tagEntityFields.value.length > 0 &&
            res.data.length > 0
        ) {
            // 目标字段 默认选中 第一个
            selectTargetField.value = res.data[0];
            updateRule.targetField = res.data[0].fieldName;
            // 获取目标字段类型
            toFixedForFieldType.value = getUpdateRuleTargetFieldType(
                res.data[0].fieldName
            );
            if (toFixedForFieldType.value == "Reference") {
                updateRule.updateMode = "forField";
                updateRule.sourceField = {};
            }
            if (toFixedForFieldType.value == "Option") {
                updateRule.updateMode = "toFixed";
                updateRule.sourceField = "";
            }
            if (toFixedForFieldType.value == "Tag") {
                updateRule.updateMode = "toFixed";
                updateRule.sourceField = [];
            }
            // 如果更新方式是字段值
            if (updateRule.updateMode == "forField") {
                // 源字段 默认选中第一个
                updateRule.sourceField = floatSourceFieldList()[0]?.fieldName;
            }
            // 格式化规则列表
            formatActionContentItems();
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
    // 更新方式
    updateMode: "forField",
    // 源字段
    sourceField: "",
    // 如果更新方式是 计算公式  判断是否是高级公式
    simpleFormula: false,
    // 脚本类型  aviator 或 liteFlowJava
    scriptType: 'aviator',
    // 脚本id
    scriptId: "",
});

// 更新方式
let updateModeList = ref([
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

const getUpdateModeList = () => {
    // if (toFixedForFieldType.value == "Reference") {
    //     return [
    //         {
    //             label: "字段值",
    //             value: "forField",
    //         },
    //         {
    //             label: "固定值",
    //             value: "toFixed",
    //         },
    //         {
    //             label: "置空",
    //             value: "toNull",
    //         },
    //         {
    //             label: "计算公式",
    //             value: "forCompile",
    //         },
    //     ];
    // }
    // if (
    //     toFixedForFieldType.value == "Option" ||
    //     toFixedForFieldType.value == "Tag"
    // ) {
    //     return [
    //         {
    //             label: "字段值",
    //             value: "forField",
    //         },
    //         {
    //             label: "固定值",
    //             value: "toFixed",
    //         },
    //         {
    //             label: "置空",
    //             value: "toNull",
    //         },
    //     ];
    // } else {
        return updateModeList.value;
    // }
};

// 聚合方式
const updateModeLabel = reactive({
    forField: "字段值",
    toFixed: "固定值",
    toNull: "置空",
    forCompile: "计算公式",
});

// 更新方式-固定值-目标字段类型
let toFixedForFieldType = ref("");

// 删除规则
const delUpdateRule = (inx) => {
    trigger.value.actionContent.items.splice(inx, 1);
    actionContentItems.value.splice(inx, 1);
};

let optionItems = ref([]);
let optionItemLoading = ref(false);

// 目标字段切换
const targetFieldChange = async (e) => {
    updateRule.targetField = e.fieldName;
    // 获取字段的type
    toFixedForFieldType.value = getUpdateRuleTargetFieldType(e.fieldName);
    // 如果更新方式是字段值，源字段默认选中第一个
    if (updateRule.updateMode == "forField") {
        updateRule.sourceField = floatSourceFieldList()[0]?.fieldName;
    } else {
        updateRule.sourceField = "";
    }
    if (e.fieldType == "Tag" || e.fieldType == "Option") {
        optionItemLoading.value = true;
        let typeEntityName = trigger.value.defaultTargetEntity.entityName;
        let typeFieldName = e.fieldName;
        let res;
        if (e.fieldType == "Tag") {
            res = await getTagItems(typeEntityName, typeFieldName);
            updateRule.updateMode = "toFixed";
            updateRule.sourceField = [];
        } else {
            res = await getOptionItems(typeEntityName, typeFieldName);
            updateRule.updateMode = "toFixed";
            updateRule.sourceField = {};
        }
        if (res && res.data) {
            optionItems.value = res.data;
        }
        optionItemLoading.value = false;
    }
};

// 更新方式切换
const updateModeChange = (e) => {
    if (e.value == "forField") {
        // 源字段默认选中第一个
        updateRule.sourceField = floatSourceFieldList()[0]?.fieldName;
    } else {
        if (
            toFixedForFieldType.value == "Reference" ||
            toFixedForFieldType.value == "ReferenceList" ||
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



// 添加更新规则
const addUpdateRule = () => {
    let { targetField, updateMode, sourceField, simpleFormula, scriptType } = updateRule;
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
    if (
        targetField == "mobilePhone" &&
        updateMode == "toFixed" &&
        (sourceField.length != 11 || isNaN(sourceField))
    ) {
        $ElMessage.warning("手机号格式不正确!");
        return;
    }
    // 效验是否存在
    let chekTargetField = trigger.value.actionContent.items.filter(
        (el) => el.targetField == targetField
    );
    if (chekTargetField.length > 0) {
        $ElMessage.warning("目标字段重复!");
        return;
    }
    if (updateMode == "toNull") {
        // 效验是否必填
        let checkIsNullable = tagEntityFields.value.filter(
            (el) => el.fieldName == targetField
        );
        if (!checkIsNullable[0].isNullable) {
            $ElMessage.warning(
                "目标字段 [ " + checkIsNullable[0].fieldLabel + " ] 不能为空!"
            );
            return;
        }
    }
    trigger.value.actionContent.items.push({
        targetField,
        updateMode,
        sourceField,
        simpleFormula,
        scriptType,
        scriptId: getGuid() + "_" + targetField,
    });
    actionContentItems.value.push({
        targetField: formatTargetField(targetField),
        updateMode: formatUpdateMode(updateMode),
        sourceField: formatSourceField(updateRule),
        simpleFormula,
        scriptType,
        scriptId: getGuid() + "_" + targetField,
    });
    if (updateMode != "forField") {
        updateRule.sourceField = "";
    }
};

const getGuid = () => {
	return "xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx".replace(/[xy]/g, function (c) {
		var r = (Math.random() * 16) | 0,
			v = c == "x" ? r : (r & 0x3) | 0x8;
		return v.toString(16);
	});
};

// 格式化 目标字段
const formatTargetField = (targetField) => {
    return tagEntityFieldLabel.value[targetField];
};

// 格式化 更新方式
const formatUpdateMode = (updateMode) => {
    return updateModeLabel[updateMode];
};

// 格式化 源字段
const formatSourceField = (item) => {
    if (item.updateMode == "forCompile") {
        if (!item.simpleFormula) {
            return registerSourceField(item.sourceField);
        } else {
            return item.sourceField;
        }
    } else {
        return cutEntityFieldLabel.value[item.sourceField];
    }
};

const registerSourceField = (sourceField) => {
    let str = sourceField;
    let regStr = str.match(/{([a-zA-Z0-9$\.]+)}/g);
    if (!regStr) {
        return str;
    }
    regStr.forEach((el) => {
        let formatStr = el.substring(1);
        formatStr = formatStr.substring(0, formatStr.length - 1);
        let splitStr = formatStr.split("$");
        str = str.replace(
            el,
            `{${cutEntityFieldLabel.value[splitStr[0]]}(${
                updateModeLabel[splitStr[1]]
            })`
        );
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
            calcMode: formatUpdateMode(el.calcMode),
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
let timeType = ref(["DateTime", "Date"]);
let mlIsAdvanced = ref(false);
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
    updateRule.sourceField = formula.label;
    updateRule.scriptType = formula.scriptType;
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
    // 字符串字段
    let strField = ["Email", "Url", "TextArea", "Text"];
    let { fieldType, referenceName } = selectTargetField.value;
    // 如果是字符串字段，显示所有字符串字段
    // 如果不是就显示通类型字段
    if (strField.includes(fieldType)) {
        return cutEntityFields.value.filter(
            (el) => el.fieldType != "Reference" && el.fieldType != "ReferenceList"
        );
    } else {
        if (fieldType == "Reference" || fieldType == "ReferenceList") {
            let showFields = [];
            cutEntityFields.value.forEach((el) => {
                if (
                    el.fieldType == fieldType &&
                    el.referenceName == referenceName
                ) {
                    showFields.push(el);
                }
            });
            return showFields;
        } else {
            let showFields = [];
            cutEntityFields.value.forEach((el) => {
                if (el.fieldType == fieldType || el.fieldType == 'Text') {
                    showFields.push(el);
                }
            });
            if (showFields.length < 1) {
                return cutEntityFields.value.filter(
                    (el) => el.fieldType != "Reference" && el.fieldType != "ReferenceList"
                );
            } else {
                return showFields;
            }
        }
    }
};

// 获取目标字段显示label
const getTargetFieldLabel = (fieldName) => {
    let filterVal = tagEntityFields.value.filter(
        (el) => el.fieldName == fieldName
    );
    return filterVal[0]?.fieldLabel || "（该字段已删除）";
};

// 获取更新方式显示label
const getUpdateModeLabel = (value) => {
    let filterVal = updateModeList.value.filter((el) => el.value == value);
    return filterVal[0]?.label;
};

// 获取源字段显示label
const getSourceFieldLabel = (item) => {
    if (item.updateMode !== "forField") {
        if (item.sourceField == 1 && toFixedForFieldType.value == "Boolean") {
            return "正常";
        }
        if (item.sourceField == 0 && toFixedForFieldType.value == "Boolean") {
            return "禁用";
        }
        if (item.sourceField && item.sourceField.label) {
            return item.sourceField.label;
        }
        if (item.sourceField && Array.isArray(item.sourceField)) {
            let labels = item.sourceField.map((el) => el.label) || [];
            return labels.join();
        }
        return item.sourceField;
    }
    let filterVal = cutEntityFields.value?.filter(
        (el) => el.fieldName == item.sourceField
    );
    return filterVal[0]?.fieldLabel;
};

// 获取源字段info
const getSourceFieldInfo = () => {
    if (updateRule.updateMode == "forField") {
        return "源字段";
    }
    if (updateRule.updateMode == "toFixed") {
        return "固定值";
    }
    if (updateRule.updateMode == "forCompile") {
        return "计算公式";
    }
};


/**
 * *************************************** 数据格式化相关 end
 */

// 目标实体切换
const targetEntityChange = () => {
    // 获取当前选中的目标实体数据
    let cutEntity = trigger.value.defaultTargetEntity;
    // 目标实体
    trigger.value.actionContent.entityName = cutEntity.entityName;
    // 关联字段
    trigger.value.actionContent.fieldName = cutEntity.fieldName;
    // 是否一对多
    trigger.value.actionContent.N = cutEntity.N;
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

// 引用字段弹框选择
const setReferRecord = (e) => {
    updateRule.sourceField = e;
    showReferenceDialogFlag.value = false;
};

// 计算公式 预览
let mlFormulaRef = ref(null);
const openPreview = (value, scriptType, index) => {
    mlFormulaFields.value = cutEntityFields.value;
    mlFormulaIsShow.value = true;
    nextTick(()=>{
        mlFormulaRef.value?.openPreview(value, scriptType, index);
    })
}

const formulaEditValue = (index, value) => {
    trigger.value.actionContent.items[index].sourceField = value;
    mlFormulaIsShow.value = false;
}


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
        &.toNull {
            background: transparent;
            .del-icon {
                right: 0 !important;
                top: -4px !important;
            }
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
        &:hover {
            .del-icon {
                z-index: 1;
            }
        }
    }
}
</style>