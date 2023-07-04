<template>
    <el-container class="process-detail" v-loading="loading">
        <el-header class="process-title">
            {{ data.name }}
            <el-button type="primary" class="fr" @click="saveApprovalConfig">保存</el-button>
        </el-header>
        <el-container class="main-container">
            <mlWorkflow v-model="data.nodeConfig" />
        </el-container>
    </el-container>
</template>

<script>
import mlWorkflow from "@/components/mlWorkflow";
export default {
    components: {
        mlWorkflow,
    },
    data() {
        return {
            loading: false,
            approvalConfigId: null,
            data: {},
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
            let res = await this.$API.system.approval.get({ approvalConfigId });
            if (res.code === 200) {
                this.data = JSON.parse(res.data);
                this.$route.meta.title = "张三啊";
            }
            this.loading = false;
        },
        async saveApprovalConfig() {
            let { data } = this;
            this.loading = true;
            let res = await this.$API.system.approval.save(data);
            if (res.code === 200) {
                this.$message.success("保存成功");
            }else {
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