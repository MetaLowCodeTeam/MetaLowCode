<template>
    <el-container class="process-detail" v-loading="loading">
        <el-header class="process-title">
            {{ data.flowName }}
            <el-button type="primary" class="fr" @click="saveApprovalConfig">保存</el-button>
        </el-header>
        <el-container class="main-container">
            <mlWorkflow v-model="data.nodeConfig" />
        </el-container>
    </el-container>
</template>

<script>
import mlWorkflow from "@/components/mlWorkflow/index.vue";
export default {
    components: {
        mlWorkflow,
    },
    data() {
        return {
            loading: false,
            approvalConfigId: null,
            data: {
                approvalConfigId: "0000030-b105364997e64227b6f567bbd900a78b",
                flowName: "请假审批",
            },
        };
    },
    mounted() {
        this.approvalConfigId = this.$route.query.approvalConfigId;
        this.getApprovalConfig();
    },
    methods: {
        async getApprovalConfig() {
            let { approvalConfigId } = this;
            this.loading = true;
            let res = await this.$API.approval.detial.get({ approvalConfigId });
            if (res.code === 200) {
                this.data = Object.assign(this.data, res.data);
                // 新建的
                if (!this.data.nodeConfig) {
                    this.data.nodeConfig = {
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
            } else {
                this.$message.error("获取审核流程失败：" + res.error);
            }
            this.loading = false;
        },
        async saveApprovalConfig() {
            let { data } = this;
            this.loading = true;
            let res = await this.$API.approval.detial.save(data);
            if (res.code === 200) {
                this.$message.success("保存成功");
            } else {
                this.$message.error(res.error);
            }
            this.loading = false;
        },
    },
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