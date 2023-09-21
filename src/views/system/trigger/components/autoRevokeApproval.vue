<template>
    <div class="action-div" v-loading="contentLoading">
        <el-form-item label="撤销记录">
            <el-select
                v-model="trigger.actionContent.items"
                multiple
                placeholder="选择撤销记录"
                style="width: 100%"
                clearable
                filterable
                value-key="label"
            >
                <el-option
                    v-for="(op,inx) of approvalList"
                    :key="inx"
                    :value="op"
                    :label="op.label"
                ></el-option>
            </el-select>
            <div class="w-100">
                <span class="info-text">可撤销源实体记录或其关联记录</span>
            </div>
        </el-form-item>
    </div>
</template>

<script setup>
import { ref, onMounted, inject } from "vue";
const $API = inject("$API");
const $ElMessage = inject("$ElMessage");
const props = defineProps({
    modelValue: null,
});
// 内容加载loading
let contentLoading = ref(false);

// 数据源
let trigger = ref({
    actionContent: {},
});

let approvalList = ref([]);
onMounted(() => {
    trigger.value = props.modelValue;

    getApprovalList();
});

// 获取 当前实体 审批列表
const getApprovalList = async () => {
    contentLoading.value = true;
    let res = await $API.trigger.detial.getDataDeleteEntityList(
        trigger.value.entityCode
    );
    if (res) {
        approvalList.value = res.data;
    }
    contentLoading.value = false;
};
</script>

<style>
</style>