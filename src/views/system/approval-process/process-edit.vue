<template>
    <ml-dialog v-model="isShow" :title="dialogForm.title" width="30%">
        <el-form label-width="120px" v-loading="loading">
            <el-form-item label="选择应用实体" v-if="dialogForm.type == 'add'">
                <el-select
                    v-model="dialogForm.form.entityCode"
                    placeholder="选择应用实体"
                    style="width: 80%;"
                >
                    <el-option
                        :label="op.label"
                        :value="op.entityCode"
                        v-for="(op,inx) of entityList"
                        :key="inx"
                    />
                </el-select>
            </el-form-item>
            <el-form-item label="名称">
                <el-input v-model="dialogForm.form.flowName" style="width: 80%;"></el-input>
            </el-form-item>
            <el-form-item v-if="dialogForm.type == 'edit'">
                <el-checkbox v-model="dialogForm.form.isDisabled" label="是否禁用" />
                <el-tooltip effect="dark" content="禁用后正在使用此流程的审批记录不受影响" placement="top">
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
import { ref, onMounted, watch, inject } from "vue";
import { saveRecord } from "@/api/crud";
const props = defineProps({
    modelValue: null,
    entityList: {
        type: Array,
        default: () => [],
    },
    dialogForm: {
        type: Object,
        default: () => {},
    },
});
const emit = defineEmits(["update:modelValue", "saveProcess"]);
const message = inject("$ElMessage");
// 弹框是否显示
let isShow = ref(false);
let loading = ref(false);
watch(
    () => props.modelValue,
    () => {
        isShow.value = props.modelValue;
    },
    {
        deep: true,
    }
);
watch(
    () => isShow,
    (newVal) => {
        emit("update:modelValue", newVal);
    },
    {
        deep: true,
    }
);

onMounted(() => {
    isShow.value = props.modelValue;
});

const saveProcess = async () => {
    let { type, form } = props.dialogForm;
    let { entityCode, flowName, approvalConfigId, isDisabled } = form;
    if (type == "add") {
        if (!entityCode) {
            message.error("请选择应用实体");
            return;
        }
    }
    if (!flowName) {
        message.error("请输入审批流程名称");
        return;
    }
    loading.value = true;
    let res = await saveRecord("ApprovalConfig", approvalConfigId || "", {
        entityCode,
        flowName,
        isDisabled,
    });
    if (res.code == 200) {
        if (type === "add") {
            let approvalConfigId = res.data.formData.approvalConfigId;
            emit("saveProcess", { approvalConfigId });
        } else {
            emit("saveProcess");
            message.success("修改成功");
        }
        isShow.value = false;
    } else {
        message.error("保存失败：" + res.error);
    }

    loading.value = false;
};
</script>

<style>
</style>