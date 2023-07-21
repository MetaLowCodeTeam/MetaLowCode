<template>
    <mlDialog v-model="isShow" :title="title" width="35%">
        <el-form label-position="top" label-width="100px">
            <el-form-item label="批注">
                <el-input
                    v-model="form.remark"
                    :autosize="{ minRows: 2, maxRows: 4 }"
                    type="textarea"
                    placeholder="输入批注(可选)"
                    maxlength="500"
                    show-word-limit
                />
            </el-form-item>
            <el-form-item>
                <template #label>
                    <el-icon class="icon filled-icon">
                        <el-icon-user-filled />
                    </el-icon>下一审批人(或签)
                </template>
                <el-input v-model="form.region" />
            </el-form-item>
            <el-form-item label="Activity form">
                <template #label>
                    <el-icon class="icon promotion-icon">
                        <el-icon-promotion />
                    </el-icon>本次审批结果将抄送给
                </template>
                <el-input v-model="form.region" />
            </el-form-item>
            <el-form-item style="margin-bottom: 0;">
                <div class="foot-btn w-100">
                    <el-button type="primary">同意</el-button>
                    <el-button type="danger">驳回</el-button>
                    <el-button @click="isShow = false">取消</el-button>
                </div>
            </el-form-item>
        </el-form>
    </mlDialog>
</template>

<script setup>
import { watch, ref, onMounted, reactive } from "vue";
const props = defineProps({
    modelValue: null,
    taskId: { type: String, default: "" },
    title: { type: String, default: "" },
});
const emit = defineEmits(["update:modelValue"]);
// 弹框是否显示
let isShow = ref(null);
// 审核数据
let form = reactive({});
watch(
    () => props.modelValue,
    () => {
        isShow.value = props.modelValue;
    },
    { deep: true }
);
watch(
    () => isShow,
    (v) => {
        emit("update:modelValue", v);
    },
    { deep: true }
);
onMounted(() => {
    isShow.value = props.modelValue;
});
</script>

<style lang="scss" scoped>
.icon {
    position: relative;
}
.filled-icon {
    top: 1px;
}
.foot-btn {
    text-align: right;
}
</style>