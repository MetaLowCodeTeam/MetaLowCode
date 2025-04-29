<template>
    <!-- 批量编辑 -->
    <ml-dialog title="批量编辑" v-model="isShow" append-to-body width="500" draggable>
        <div v-loading="loading" class="pr-30">
            <el-form label-width="100px">
                <el-form-item label="编辑字段">
                    <el-select
                        v-model="updateField"
                        class="m-2"
                        placeholder="选择字段"
                        style="width: 100%"
                        value-key="fieldName"
                        @change="getFieldTypeCom"
                        filterable
                    >
                        <el-option
                            v-for="item in fieldsList"
                            :key="item.fieldName"
                            :label="item.fieldLabel"
                            :value="item"
                        />
                    </el-select>
                </el-form-item>
                <el-form-item label="更新值">
                    <!-- 文本输入框 -->
                    <div v-if="updateCom =='textInput'" class="w-100">
                        <el-input v-model="updateValue" clearable />
                    </div>
                    <!-- 日期选择器 -->
                    <div v-else-if="updateCom =='datePicker'" class="w-100">
                        <el-date-picker
                            clearable
                            v-model="updateValue"
                            type="date"
                            style="width: 100%;"
                            format="YYYY/MM/DD"
                            value-format="YYYY-MM-DD"
                        />
                    </div>
                    <!-- 数字输入框 -->
                    <div v-else-if="updateCom =='numberInput'" class="w-100">
                        <el-input-number
                            v-model="updateValue"
                            :controls="false"
                            class="ml-number-input w-100"
                        />
                    </div>
                    <!-- 布尔类型 -->
                    <div v-else-if="updateCom =='booleanSelect'" class="w-100">
                        <el-select v-model="updateValue" class="w-100" placeholder=" ">
                            <el-option label="是" value="1" />
                            <el-option label="否" value="0" />
                        </el-select>
                    </div>
                    <!-- 用户选择框 -->
                    <div v-else-if="updateCom =='userSelect'" class="w-100">
                        <mlSelectUser
                            v-model="updateReference"
                            clearable
                            type="User"
                            style="width: 100%;"
                        />
                    </div>
                    <!-- 部门选择框 -->
                    <div v-else-if="updateCom =='departmentSelect'" class="w-100">
                        <mlSelectUser
                            v-model="updateReference"
                            clearable
                            type="Department"
                            style="width: 100%;"
                        />
                    </div>
                    <!-- 类型为Tag 和 option的 -->
                    <div v-else-if="updateCom =='optionData'" class="w-100">
                        <el-select v-model="updateValue" class="w-100" placeholder=" ">
                            <el-option
                                v-for="(userOp,userInx) of updateField.optionData"
                                :label="userOp.label || userOp.value"
                                :value="userOp.value"
                                :key="userInx"
                            />
                        </el-select>
                    </div>
                    <!-- 类型为Reference非部门、用户的选择框 -->
                    <div v-else-if="updateCom =='referenceSearch'" class="w-100">
                        <el-input v-model="updateValue" readonly>
                            <template #append>
                                <el-button @click="showReferenceDialogFlag = true">
                                    <el-icon>
                                        <ElIconSearch />
                                    </el-icon>
                                </el-button>
                            </template>
                        </el-input>
                        <ml-dialog
                            title="请选择"
                            class="reference-dialog"
                            v-model="showReferenceDialogFlag"
                            append-to-body
                            width="600px"
                            v-if="entityName && updateFieldType == 'Reference'"
                        >
                            <ReferenceSearchTable
                                :entity="entityName"
                                :refField="updateField.fieldName"
                                @recordSelected="setReferRecord"
                                :defaultSelected="updateReference[0]"
                            />
                        </ml-dialog>
                        <ml-dialog
                            title="请选择"
                            class="reference-dialog"
                            v-model="showReferenceDialogFlag"
                            append-to-body
                            width="600px"
                            v-if="entityName && updateFieldType == 'ReferenceList'"
                            scrollbarMaxHeight="600px"
                        >
                            <ReferenceSearchTable
                                :entity="entityName"
                                :refField="updateField.fieldName"
                                showCheckBox
                                ref="referST"
                                :defaultSelected="updateReference"
                            />
                            <template #footer v-if="updateFieldType == 'ReferenceList'">
                                <el-button @click="showReferenceDialogFlag = false">取消</el-button>
                                <el-button type="primary" @click="confirmReferenceList">确认</el-button>
                            </template>
                        </ml-dialog>
                    </div>
                </el-form-item>
            </el-form>
        </div>
        <template #footer>
            <el-button @click="isShow = false">取消</el-button>
            <el-button type="primary" @click="confirmUpdate">确认</el-button>
        </template>
    </ml-dialog>
</template>

<script setup>
import { ref } from "vue";
/**
 * API
 */
import { updateRecordList } from "@/api/crud";
import { ElMessage } from "element-plus";
/**
 * 组件
 */
import ReferenceSearchTable from "@/components/mlReferenceSearch/reference-search-table.vue";

const emits = defineEmits(["onConfirm"]);

let isShow = ref(false);
let loading = ref(false);
// 可编辑的字段集
let fieldsList = ref([]);
// 要编辑的行
let rows = ref([]);
// 行ID字段
let idFieldName = ref("");
// 当前实体
let entityName = ref("");

/**
 * 更新值字段的组件
 */
// 欲编辑的字段
let updateField = ref({});
// 欲更新的值
let updateValue = ref("");
// 引用字段的key组合
let updateReference = ref([]);
// 欲更新的值
let updateCom = ref("textInput");
// 欲更新字段的类型
let updateFieldType = ref("");

// 打开弹框
const openDialog = (fields, selectRows, entity, idField) => {
    isShow.value = true;
    fieldsList.value = fields;
    rows.value = selectRows;
    entityName.value = entity;
    idFieldName.value = idField;
    updateField.value = {};
    updateValue.value = "";
    updateCom.value = "textInput";
    updateFieldType.value = "";
};

// 组件合集
const comList = {
    // 文本输入框
    textInput: ["Email", "Url", "TextArea", "Text"],
    // 日期选择器
    datePicker: ["DateTime", "Date"],
    // 数字输入框
    numberInput: ["Money", "Integer", "Decimal", "Percent"],
    // 布尔类型
    booleanSelect: ["Boolean"],
    // option下拉框
    optionData: ["Tag", "Option", "Status"],
};

/**
 * 类型为Reference非部门、用户的
 */
let showReferenceDialogFlag = ref(false);

// 单引用
const setReferRecord = (event) => {
    console.log(event, "event");
    updateReference.value = [event];
    updateValue.value = event.label;
    showReferenceDialogFlag.value = false;
};

// 多引用
let referST = ref("");
const confirmReferenceList = () => {
    let fieldNames = referST.value?.getIdNameField() || {};
    let rows = referST.value?.getMultipleSelection() || [];
    let labels = [];
    updateReference.value = rows.map(el => {
        labels.push(el[fieldNames.nameField]);
        return {
            id: el[fieldNames.idField],
            name: el[fieldNames.nameField]
        }
    });
    updateValue.value = labels.join(",");
    showReferenceDialogFlag.value = false;
    // console.log(updateReference.value, "updateReference.value");
}

// 获取字段对应的组件
const getFieldTypeCom = () => {
    let { fieldType, referenceName } = updateField.value;
    updateValue.value = null;
    updateReference.value = [];
    // 如果是引用字段
    if (fieldType == "Reference" || fieldType == "ReferenceList") {
        // 用户下拉框
        if (referenceName == "User") {
            updateCom.value = "userSelect";
        }
        // 部门下拉框
        else if (referenceName == "Department") {
            updateCom.value = "departmentSelect";
        }
        // 引用类型搜索组件
        else {
            updateCom.value = "referenceSearch";
        }
        updateFieldType.value = fieldType;
    }
    // 非引用字段
    else {
        for (const key in comList) {
            if (Object.hasOwnProperty.call(comList, key)) {
                const element = comList[key];
                if (element.includes(fieldType)) {
                    updateCom.value = key;
                    return;
                }
            }
        }
    }
};



// 确认更新
const confirmUpdate = async () => {
    let { fieldType } = updateField.value;
    let param = {
        entityName: entityName.value,
        recordIdList: rows.value.map((el) => el[idFieldName.value]),
        dataMap: {},
    };
    param.dataMap[updateField.value.fieldName] = "";

    if (fieldType == "Reference") {
        param.dataMap[updateField.value.fieldName] = updateReference.value[0].id;
    }
    else if (fieldType == "ReferenceList") {
        param.dataMap[updateField.value.fieldName] = updateReference.value;
    }
    else {
        param.dataMap[updateField.value.fieldName] = updateValue.value;
    }
    loading.value = true;
    let res = await updateRecordList(param);
    if (res && res.code == 200) {
        isShow.value = false;
        ElMessage.success("编辑成功");
        emits("onConfirm");
    }
    loading.value = false;
};

defineExpose({
    openDialog,
});
</script>
<style lang='scss' scoped>
</style>