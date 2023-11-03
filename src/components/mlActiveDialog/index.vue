
<template>
    <!-- 列表页面新增、编辑通用弹框 -->
    <ml-dialog v-model="isShow" :title="dialogForm.title" width="30%">
        <el-form label-width="120px" v-loading="loading" @submit.prevent>
            <!-- <slot name="formitem"></slot> -->

            <el-form-item :label="dialogForm.fromEntityLabel" v-if="dialogForm.type == 'add'">
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
                label="选择触发器"
                v-if="dialogForm.type == 'add' && dialogForm.title == '添加触发器'"
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
            <el-form-item v-if="dialogForm.type == 'edit'">
                <el-checkbox v-model="dialogForm.form.isDisabled" label="是否禁用" />
                <el-tooltip
                    v-if="dialogForm.disabledTip"
                    effect="dark"
                    :content="dialogForm.disabledTip"
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
const { unSystemEntityList, processEntityList } = storeToRefs(useCommonStore());
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
        label: "数据效验",
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
    let { entityCode, isDisabled, actionType } = form;
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
            message.error(codeErrMsg[0]);
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
    loading.value = true;
    let res = await saveRecord(saveEntity, form[saveIdCode] || "", params);
    if (res) {
        if (type === "add") {
            let emitValue = {};
            emitValue[saveIdCode] = res.data.formData[saveIdCode];
            emitValue.entityCode = entityCode;
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

<style>
</style>