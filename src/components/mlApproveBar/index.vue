<template>
    <!-- 未提交 -->
    <!-- <div class="approval-bar info" v-if="approvalStatus.value == 0">当前记录尚未提交审批，请在信息完善后尽快提交</div> -->
    <div class="approval-bar warning" v-if="approvalStatus.value == 1">当前记录正在审批中</div>
    <div class="approval-bar success" v-if="approvalStatus.value == 3">当前记录已审批完成</div>
    <div
        class="approval-bar error"
        v-if="approvalStatus.value == 4"
    >审批已撤销，请在信息完善后再次提交</div>
    <div
        class="approval-bar error"
        v-if="approvalStatus.value == 2"
    >审批已驳回，请在信息完善后再次提交</div>
</template>

<script setup>
import {  watchEffect, ref } from "vue";

const props = defineProps({
    approvalInfo: {
        type: Object,
    },
});
let approvalStatus = ref({});

watchEffect(() => {
    approvalStatus.value = props.approvalInfo || {};
})


</script>
<style lang='scss' scoped>
.approval-bar {
    height: 45px;
    line-height: 45px;
    color: #fff;
    box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075) !important;
    border-radius: 2px;
    padding-left: 20px;
    margin-bottom: 10px;
    &.info {
        background: var(--el-color-info);
    }
    &.warning {
        background: var(--el-color-warning);
    }
    &.success {
        background: var(--el-color-success);
    }
    &.error {
        background: var(--el-color-error);
    }
}
</style>