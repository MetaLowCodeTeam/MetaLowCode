<template>
    <!-- 仪表盘 -->
    <div class="dashboard" v-loading="loading">
        <v-form-render ref="dashboardWidget"></v-form-render>
        <div style="height: 500px;">   </div>
        <span class="change-dashboard">
            <el-icon size="20">
                <ElIconSetting />
            </el-icon>
        </span>
    </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { queryById } from "@/api/crud";
let dashboardWidget = ref();
let loading = ref(false);
onMounted(() => {
    initFormConfig();
});

const initFormConfig = async () => {
    loading.value = true;
    let res = await queryById(
        "0000052-f8025ff4f1a346bfa75bc83c1d2a8e59",
        "chartData"
    );
    if (res && res.data.chartData) {
        let blankFormJson = JSON.parse(res.data.chartData);
        dashboardWidget.value.setFormJson(blankFormJson);
    }
    loading.value = false;
};
</script>
<style lang='scss' scoped>
.dashboard {
    position: relative;
    .change-dashboard {
        position: fixed;
        right: 10px;
        top: 10px;
        width: 20px;
        height: 20px;
    }
}
</style>