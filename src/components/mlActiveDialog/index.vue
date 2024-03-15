
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
            <el-form-item label="请选择绑定用户" v-if="dialogForm.saveEntity == 'ExternalForm'">
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
                    :disabled="dialogForm.type == 'edit'"
                >
                    <el-radio :label="1">基础工作流</el-radio>
                    <el-radio :label="2">复杂工作流</el-radio>
                </el-radio-group>
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
            </el-form-item>
            <el-form-item>
                <el-button @click="saveProcess" type="primary">保存</el-button>
                <el-button @click="isShow = false">取消</el-button>
            </el-form-item>
        </el-form>
    </ml-dialog>
</template>

<script setup>
import { ref, inject } from "vue";
import { saveRecord } from "@/api/crud";
import useCommonStore from "@/store/modules/common";
import { storeToRefs } from "pinia";
const { unSystemEntityList, processEntityList, publicSetting } = storeToRefs(
    useCommonStore()
);
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
    isShow.value = true;
};

const saveProcess = async () => {
    let { type, form, saveEntity, saveIdCode, checkCodes, codeErrMsg } =
        dialogForm.value;
    let { entityCode, isDisabled, actionType, flowType } = form;
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
    let res = await saveRecord(saveEntity, form[saveIdCode] || "", params);
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
