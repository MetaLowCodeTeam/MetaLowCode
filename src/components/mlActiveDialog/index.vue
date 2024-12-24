
<template>
    <!-- 列表页面新增、编辑通用弹框 -->
    <ml-dialog v-model="isShow" :title="dialogForm.title" width="30%">
        <el-form label-width="120px" v-loading="loading" @submit.prevent class="action-form">
            <el-form-item
                :label="dialogForm.fromEntityLabel"
                v-if="dialogForm.type == 'add' && dialogForm.saveEntity != 'ExternalForm'"
            >
                <el-select
                    v-model="dialogForm.form.entityCode"
                    :placeholder="dialogForm.fromEntityLabel"
                    style="width: 80%;"
                    filterable
                    @change="entityCodeChange"
                >
                    <el-option
                        :label="op.label"
                        :value="op.entityCode"
                        v-for="(op,inx) of isProcess ? processEntityList : unSystemEntityList"
                        :key="inx"
                    />
                </el-select>
            </el-form-item>
            <el-form-item
                :label="dialogForm.fromEntityLabel"
                v-if="dialogForm.type == 'add' && dialogForm.saveEntity == 'ExternalForm'"
            >
                <el-select
                    v-model="dialogForm.form.entityCode"
                    :placeholder="dialogForm.fromEntityLabel"
                    style="width: 80%;"
                    filterable
                >
                    <template v-for="(op,inx) of unSystemEntityList" :key="inx">
                        <el-option :label="op.label" :value="op.entityCode" v-if="!op.detailEntityFlag"/>
                    </template>
                </el-select>
            </el-form-item>
            <el-form-item
                label="选择触发器"
                v-if="dialogForm.type == 'add' && dialogForm.title == '添加触发器' && dialogForm.saveEntity != 'ExternalForm'"
            >
                <el-select
                    v-model="dialogForm.form.actionType"
                    placeholder="请选择触发器"
                    style="width: 80%;"
                >
                    <el-option
                        :label="op.label"
                        :value="op.code"
                        v-for="(op,inx) of triggerList"
                        :key="inx"
                    />
                </el-select>
            </el-form-item>
            <el-form-item
                v-for="(item,inx) of dialogForm.showFormItem"
                :key="inx"
                :label="item.label"
            >
                <el-input
                    v-if="item.type == 1"
                    v-model="dialogForm.form[item.code]"
                    style="width: 80%;"
                ></el-input>
            </el-form-item>
            <!-- 使用条件 -->
            <el-form-item 
                label="使用条件"
                v-if="dialogForm.saveEntity == 'ReportConfig'"
            >
                <SetConditionsDialog 
                    title="附加过滤条件"
                    :conditionConf="dialogForm.form.filterJson"
                    :entityName="queryEntityNameByCode(dialogForm.form.entityCode)"
                    :beforeOpenDialog="beforeOpenConditionsDialog"
                    @confirm="conditionConfirm"
                />
            </el-form-item>
            <el-form-item label="绑定用户" v-if="dialogForm.saveEntity == 'ExternalForm'">
                <mlSelectUser
                    v-model="dialogForm.form.bindUsers"
                    type="User"
                    clearable
                    style="width: 80%;"
                />
            </el-form-item>

            <el-form-item
                v-if="publicSetting?.pluginIdList.includes('metaWorkFlow') && dialogForm.title == '添加审批流程'"
            >
                <el-radio-group
                    v-model="dialogForm.form.flowType"
                    @change="flowTypeChange"
                >
                    <el-radio :value="1">基础工作流</el-radio>
                    <el-radio :value="2">复杂工作流</el-radio>
                </el-radio-group>
            </el-form-item>
            <el-form-item
                v-if="
                    publicSetting?.pluginIdList.includes('metaWorkFlow') && 
                    dialogForm.form.flowType == 2
                "
                label="流程标签"
                v-loading="loadLabelOptionLoading"
            >
                <el-select 
                    v-model="dialogForm.form.configTag" 
                    placeholder="请选择流程标签"
                    style="width: 80%;"
                >
                    <el-option
                        v-for="item in labelOptions"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                    />
                </el-select>
            </el-form-item>
            <el-form-item v-if="dialogForm.type == 'edit'">
                <el-checkbox v-model="dialogForm.form.isDisabled" label="是否禁用" />
                <el-tooltip
                    v-if="dialogForm.disabledTip"
                    effect="dark"
                    :content="dialogForm.disabledTip || 'error'"
                    placement="top"
                >
                    <el-icon size="15" class="ml-5 cursor-pointer">
                        <ElIconInfoFilled />
                    </el-icon>
                </el-tooltip>
                <span 
                    class="ml-a-span ml-40" 
                    v-if="dialogForm.saveEntity == 'ReportConfig'"
                    @click="openSetWatermarkDialog"
                >
                    水印设置
                </span>
            </el-form-item>
        </el-form>
        <template #footer>
            <div 
                class="fl pl-20" 
                style="font-size: 14px;text-align: left;"
                v-if="dialogForm.saveEntity == 'ReportConfig'"
            >
                <mlShareTo v-model="dialogForm.form.shareTo" />
            </div>
            <el-button @click="saveProcess" type="primary" :loading="loading">保存</el-button>
            <el-button @click="isShow = false" :loading="loading">取消</el-button>
        </template>
    </ml-dialog>
    <SetWatermark ref="SetWatermarkRefs" @confirm="confirmSetWatermark"/>
</template>

<script setup>
import { ref, inject } from "vue";
import { saveRecord } from "@/api/crud";
import useCommonStore from "@/store/modules/common";
import { storeToRefs } from "pinia";
// 水印设置组件
import SetWatermark from './components/setWatermark.vue';
// 条件弹框
import SetConditionsDialog from "@/components/mlSetConditions/Dialog.vue";
import { getTagItems } from "@/api/system-manager";
import mlShareTo from "@/components/mlShareTo/index.vue";
const $API = inject("$API");
const { unSystemEntityList, processEntityList, publicSetting } = storeToRefs(
    useCommonStore()
);
const { queryEntityNameByCode } = useCommonStore();
const emit = defineEmits(["update:modelValue", "saveProcess"]);
const message = inject("$ElMessage");
let props = defineProps({
    isProcess: { type: Boolean, default: false },
});

// 弹框是否显示
let isShow = ref(false);
let loading = ref(false);
let triggerList = ref([
    {
        label: "字段更新",
        code: 1,
    },
    {
        label: "字段聚合",
        code: 2,
    },
    {
        label: "分组聚合",
        code: 3,
    },
    {
        label: "自动创建",
        code: 15,
    },
    {
        label: "数据校验",
        code: 4,
    },
    {
        label: "发送通知",
        code: 5,
    },
    {
        label: "自动审批",
        code: 6,
    },
    {
        label: "自动撤销审批",
        code: 7,
    },
    {
        label: "自动分配",
        code: 8,
    },
    {
        label: "自动共享",
        code: 9,
    },
    {
        label: "自动取消共享",
        code: 10,
    },
    {
        label: "自动删除",
        code: 12,
    },
    {
        label: "回调URL",
        code: 14,
    },
]);

let dialogForm = ref({});
const openDialog = (data) => {
    dialogForm.value = data;
    labelOptions.value = [];
    let { form, saveEntity } = dialogForm.value;
    // 格式化水印设置
    if(saveEntity == 'ReportConfig' && form.pdfWatermark) {
        form.pdfWatermark = JSON.parse(form.pdfWatermark)
    }
    if(!form.shareTo) {
        form.shareTo = "ALL";
    }
    if(form.filterJson) {
        form.filterJson = JSON.parse(form.filterJson);
    }
    if(data.saveEntity == 'ApprovalConfig' && data.type == 'edit') {
        flowTypeChange();
    }
    isShow.value = true;
};

const saveProcess = async () => {
    let { 
        type, 
        form, 
        saveEntity, 
        saveIdCode, 
        checkCodes, 
        codeErrMsg,
    } = dialogForm.value;
    let { 
        entityCode, 
        isDisabled, 
        actionType, 
        flowType, 
        pdfWatermark, 
        configTag,
        filterJson,
        shareTo
    } = form;
    if (type == "add" && saveEntity == "ExternalForm" && !entityCode) {
        message.error("请选择源实体");
        return;
    }
    if (type == "add" && saveEntity != "TriggerConfig" && !entityCode) {
        message.error("请选择应用实体");
        return;
    }
    if (type == "add" && saveEntity == "TriggerConfig" && !actionType) {
        message.error("请选择触发器");
        return;
    }
    // 开始验证必填
    for (let index = 0; index < checkCodes.length; index++) {
        const el = checkCodes[index];
        if (!form[el]) {
            message.error(codeErrMsg[index]);
            return;
        }
    }
    // 开始塞入 params
    let params = {
        entityCode,
        isDisabled: isDisabled ? isDisabled : false,
        pdfWatermark: JSON.stringify(pdfWatermark),
        configTag: configTag || null,
        filterJson: JSON.stringify(filterJson),
        shareTo
    };
    checkCodes.forEach((el) => {
        params[el] = form[el];
    });
    // 审批流程
    if (props.isProcess) {
        params.flowType = flowType;
    }
    if (saveEntity == "ExternalForm" && form.bindUsers.length < 1) {
        message.error("请选择绑定用户");
        return;
    }
    if (saveEntity == "ExternalForm" && form.bindUsers.length > 0) {
        params.bindUsers = form.bindUsers[0].id;
    }
    loading.value = true;
    let res;
    if(saveEntity == 'TriggerConfig') {
        res = await $API.trigger.detail.triggerSave(form[saveIdCode] || "", params);
    }else{
        res = await saveRecord(saveEntity, form[saveIdCode] || "", params);
    }
    if (res) {
        if (type === "add") {
            let emitValue = {};
            emitValue[saveIdCode] = res.data.formData[saveIdCode];
            emitValue.entityCode = entityCode;
            emitValue.flowType = res.data.formData.flowType;
            emit("saveProcess", emitValue);
        } else {
            emit("saveProcess");
            message.success("修改成功");
        }
        isShow.value = false;
    }

    loading.value = false;
};



/**
 * 水印设置相关  
 */
let SetWatermarkRefs = ref();
// 打开水印设置弹框
const openSetWatermarkDialog = () => {
    SetWatermarkRefs.value?.openDialog(dialogForm.value.form.pdfWatermark);
}
// 确认设置样式
const confirmSetWatermark = (v) => {
    dialogForm.value.form.pdfWatermark = JSON.parse(JSON.stringify(v));
}

let labelOptions = ref([]);
let loadLabelOptionLoading = ref(false);
// 类型切换
const flowTypeChange = async () => {
    if(labelOptions.value.length > 0) {
        return
    }
    loadLabelOptionLoading.value = true;
    let res = await getTagItems("ApprovalConfig", "configTag");
    if(res) {
        labelOptions.value = res.data;
    }
    loadLabelOptionLoading.value = false;

}

/***
 *  ****************************************** 过滤条件相关 beg
 */

// 切换实体
const entityCodeChange = () => {
    dialogForm.value.form.filterJson = {
        equation: 'OR',
        items: [],
    };
}

// 打开弹框前
const beforeOpenConditionsDialog = () => {
    if(!dialogForm.value.form.entityCode) {
        message.error('请选择应用实体');
        return false;
    }
    return true;
}

// 确认条件
const conditionConfirm = (v) => {
    dialogForm.value.form.filterJson = v;
}

/***
 *  ****************************************** 过滤条件相关 end
 */
defineExpose({
    openDialog,
    dialogForm,
    saveProcess,
});
</script>
<style lang="scss" scoped>
.action-form {
    .el-form-item {
        margin-bottom: 12px !important;
    }
}
</style>

