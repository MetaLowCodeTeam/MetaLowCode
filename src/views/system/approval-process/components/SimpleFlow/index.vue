<template>
    <el-container class="process-detail" v-loading="loading">
        <el-header class="process-title">
            {{ data.flowName }}
            <el-button
                type="primary"
                class="fr"
                @click="saveApprovalConfig"
                :disabled="!$TOOL.checkRole('r6016') || isLookPage"
            >保存</el-button>
        </el-header>
        <el-container class="main-container">
            <mlWorkflow v-model="data.nodeConfig" />
        </el-container>
    </el-container>
</template>

<script setup>
import mlWorkflow from "@/components/mlWorkflow/index.vue";
import { ElMessage } from "element-plus";
import { inject, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
const $API = inject("$API");
const $TOOL = inject("$TOOL");
const route = useRouter();
// 是否是查看页面
let isLookPage = ref(false);
let loading = ref(false);
let approvalConfigId = ref("");
let data = ref({
    approvalConfigId: "0000030-b105364997e64227b6f567bbd900a78b",
    flowName: "请假审批",
});

onMounted(() => {
    approvalConfigId.value = route.currentRoute.value.query.approvalConfigId;
    // 如果是查看页面
    let look = route.currentRoute.value.query.look;
    if (look == 1) {
        isLookPage.value = true;
    }
    getApprovalConfig();
});

const getApprovalConfig = async () => {
    loading.value = true;
    let res = await $API.approval.detail.get({
        approvalConfigId: approvalConfigId.value,
    });
    if (res) {
        data.value = Object.assign(data.value, res.data);
        // 新建的
        if (!data.value.nodeConfig) {
            data.value.nodeConfig = {
                nodeName: "发起人",
                type: 0,
                // 谁可以审批
                nodeRoleType: 2,
                // 指定用户
                nodeRoleList: [],
                // 发起条件
                filter: {
                    equation: "",
                    items: [],
                },
            };
        }
    }
    loading.value = false;
};

const saveApprovalConfig = async () => {
    loading.value = true;
    let res = await $API.approval.detail.save(data.value);
    if (res) {
        ElMessage.success("保存成功");
    }
    loading.value = false;
};
</script>

<style lang="scss" scoped>
.process-title {
    font-size: 14px;
    text-align: center;
    height: 55px !important;
    line-height: 55px !important;
}
.main-container {
    height: calc(100vh - 55px);
    overflow: auto;
}
</style>