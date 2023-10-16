
<template>
    <!-- 列表页面新增、编辑通用弹框 -->
    <ml-dialog v-model="isShow" :title="dialogForm.title" width="30%">
        <el-form label-width="120px" v-loading="loading">
            <slot name="formitem" :dialogForm="dialogForm"></slot>
            <el-form-item :label="fromEntityLabel" v-if="dialogForm.type == 'add'">
                <el-select
                    v-model="dialogForm.form.entityCode"
                    :placeholder="fromEntityLabel"
                    style="width: 80%;"
                    filterable
                >
                    <el-option
                        :label="op.label"
                        :value="op.entityCode"
                        v-for="(op,inx) of entityList"
                        :key="inx"
                    />
                </el-select>
            </el-form-item>
            <el-form-item v-for="(item,inx) of showFormItem" :key="inx" :label="item.label">
                <el-input
                    v-if="item.type == 1"
                    v-model="dialogForm.form[item.code]"
                    style="width: 80%;"
                ></el-input>
            </el-form-item>
            <el-form-item v-if="dialogForm.type == 'edit'">
                <el-checkbox v-model="dialogForm.form.isDisabled" label="是否禁用" />
                <el-tooltip v-if="disabledTip" effect="dark" :content="disabledTip" placement="top">
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
    // 要保存的实体
    saveEntity: { type: String, default: "" },
    // 要保存的Id
    saveIdCode: { type: String, default: "" },
    // 保存时需要验证的code
    checkCodes: { type: Array, default: () => [] },
    // 验证失败的msg
    codeErrMsg: { type: Array, default: () => [] },
    // 是否禁用提示信息
    disabledTip: { type: String, default: "" },
    // 编辑框显示的输入框
    showFormItem: { type: Array, default: () => [] },
    fromEntityLabel: { type: String, default: "选择应用实体" },
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
    let { saveEntity, saveIdCode, dialogForm, checkCodes, codeErrMsg } = props;
    let { type, form } = dialogForm;
    let { entityCode, isDisabled } = form;
    if (type == "add") {
        if (!entityCode) {
            message.error("请选择应用实体");
            return;
        }
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
</script>

<style>
</style>