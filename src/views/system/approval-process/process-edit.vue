<template>
    <ml-dialog v-model="isShow" :title="dialogForm.title" width="30%">
        <el-form label-width="120px">
            <el-form-item label="选择应用实体">
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
            <el-form-item>
                <el-button type="primary">确定</el-button>
                <el-button @click="isShow = false">取消</el-button>
            </el-form-item>
        </el-form>
    </ml-dialog>
</template>
 
<script setup>
import { ref, onMounted, reactive, watch } from "vue";

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
const emit = defineEmits(["update:modelValue"]);
// 弹框是否显示
let isShow = ref(false);
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
</script>

<style>
</style>