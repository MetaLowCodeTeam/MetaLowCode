<template>
    <el-container>
        <el-aside width="380px">
            <div class="fields-list">
                <div class="fields-list-header">&lt;单选项&gt;字段列表</div>
            </div>
        </el-aside>

        <el-container class="main-container">
            <el-header class="props-action-section">操作区</el-header>

            <el-main style="margin: 0 auto">
                <el-button @click="test">点击查看审核流程（demo）</el-button>
            </el-main>
        </el-container>
    </el-container>
</template>
  
  <script>
export default {
    name: "OptionManager",
    data() {
        return {};
    },
    mounted() {},
    methods: {
        test() {
            this.$router.push({
                path: "/process-detail",
                query: { approvalConfigId: "0000030-b105364997e64227b6f567bbd900a78b" },
            });
        },
    },
};
</script>
  
  <style lang="scss" scoped>
.main-container {
    min-width: 720px;
    border-left: 2px solid #eeeeee;
    background: #ffffff;
}

.el-aside {
    background-color: #ffffff;
}

.fields-list {
    .fields-list-header {
        font-size: 14px;
        text-align: center;
        height: 54px;
        line-height: 54px;
        border-bottom: 1px dashed #eeeeee;
    }
}
</style>
  