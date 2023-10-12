<template>
    <!-- 未提交 -->
    <template v-if="myApproval.approvalStatus == 0">
        <el-button @click="submitApproval">提交审批</el-button>
    </template>
    <!-- 审核中 -->
    <template v-if="myApproval.approvalStatus == 1">
        <el-button>提交审批1</el-button>
    </template>
    <!-- 已驳回 -->
    <template v-if="myApproval.approvalStatus == 2">
        <el-button>提交审批2</el-button>
    </template>
    <!-- 已完成 -->
    <template v-if="myApproval.approvalStatus == 3">
        <el-button>提交审批3</el-button>
    </template>
    <!-- 已撤销 -->
    <template v-if="myApproval.approvalStatus == 4">
        <el-button>提交审批4</el-button>
    </template>
    <!-- 审批弹框 -->
    <mlDialog v-model="approvalDialog.isShow" :title="approvalDialog.title" width="600">213</mlDialog>
</template>

<script setup>
import { onMounted, watch, ref, reactive } from "vue";

const props = defineProps({
    approvalStatus: { type: Object, default: () => {} },
});
let myApproval = ref({});
watch(
    () => props.approvalStatus,
    () => {
        myApproval.value = props.approvalStatus;
        console.log(myApproval.value, "myApproval.value");
    },
    { deep: true }
);
onMounted(() => {
    myApproval.value = props.approvalStatus;
    console.log(myApproval.value, "myApproval.value");
});

let approvalDialog = reactive({
    isShow: false,
    title: "",
});

// 提交审批
const submitApproval = () => {
    approvalDialog.isShow = true;
    approvalDialog.title = "提交审批";
};
</script>
<style lang='scss' scoped>
</style>