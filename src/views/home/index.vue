<template>
    <!-- 仪表盘 -->
    <div class="dashboard" v-loading="loading">
        <template v-if="dashboardList.length > 0">
            <v-form-render v-if="showFormRender" ref="dashboardWidget"></v-form-render>
            <el-popover
                placement="bottom"
                :width="200"
                trigger="click"
                content="this is content, this is content, this is content"
            >
                <div class="dashboard-list">
                    <el-scrollbar>
                        <div
                            class="dashboard-item yichu"
                            v-for="(item,inx) of dashboardList"
                            :key="inx"
                            :class="{'is-active':item.chartId == cutUseChartId}"
                            :title="item.chartName"
                            @click="initFormConfig(item.chartId)"
                        >{{ item.chartName }}</div>
                    </el-scrollbar>
                </div>
                <template #reference>
                    <span class="change-dashboard">
                        <el-icon size="20">
                            <ElIconSetting />
                        </el-icon>
                    </span>
                </template>
            </el-popover>
        </template>
        <el-empty v-else description="暂无视图" />
    </div>
</template>

<script setup>
import { inject, nextTick, onMounted, ref } from "vue";
import { getDataList, queryById } from "@/api/crud";
// import { ElMessage } from "element-plus";
const $TOOL = inject("$TOOL");
let dashboardWidget = ref("");
let loading = ref(false);
// 仪表盘列表
let dashboardList = ref([]);
// 仪表盘默认ID
let dashboardDefaultId = ref("");
// 本地缓存默认ID
let defaultChartId = ref("");
// 最终使用ID
let cutUseChartId = ref("");
// 是否显示仪表盘
let showFormRender = ref(false);
onMounted(() => {
    // 获取仪表盘数据
    getDashboardList();
});

const getDashboardList = async () => {
    loading.value = true;
    defaultChartId.value = $TOOL.data.get("defaultChartId");
    let filter = {
        equation: "AND",
        items: [{ fieldName: "chartData", op: "NT",value:"" }],
    };
    let res = await getDataList(
        "Chart",
        "chartName,defaultChart",
        filter
    );
    if (res && res.data) {
        dashboardList.value = res.data.dataList || [];
        // 如果没有数据
        if (dashboardList.value.length < 1) {
            return;
        }
        // 如果有本地缓存ID
        if (defaultChartId.value) {
            // 查找缓存ID是否存在于已有LIST中
            let filterChartId = dashboardList.value.filter(
                (el) => el.chartId == defaultChartId.value
            );
            // 如果存在就使用
            if (filterChartId.length > 0) {
                initFormConfig(defaultChartId.value);
                return;
            }
        }
        // 查找有没有默认
        let filterDefaultId = dashboardList.value.filter(
            (el) => el.defaultChart
        );
        if (filterDefaultId.length > 0) {
            dashboardDefaultId.value = filterDefaultId[0].chartId;
            initFormConfig(dashboardDefaultId.value);
            return;
        }
        // 如果都没有
        initFormConfig(dashboardList.value[0].chartId);
    } else {
        loading.value = false;
    }
};

const initFormConfig = async (chartId) => {
    loading.value = true;
    cutUseChartId.value = chartId;
    showFormRender.value = false;
    $TOOL.data.set("defaultChartId", chartId);
    let res = await queryById(chartId, "chartData");
    if (res && res.data.chartData) {
        showFormRender.value = true;
        let blankFormJson = JSON.parse(res.data.chartData);
        nextTick(() => {
            dashboardWidget.value.setFormJson(blankFormJson);
        });
    }
    loading.value = false;
};
</script>
<style lang='scss' scoped>
.dashboard {
    height: 100%;
    position: relative;
    .change-dashboard {
        position: fixed;
        right: 20px;
        top: 155px;
        width: 20px;
        height: 20px;
        cursor: pointer;
        &:hover {
            color: #979e9d;
        }
    }
}
.dashboard-list {
    max-height: 300px;
    .dashboard-item {
        height: 32px;
        line-height: 32px;
        padding-left: 5px;
        cursor: pointer;
        &:hover {
            background: #edefef;
        }
        &.is-active {
            background: var(--el-color-primary);
            color: #fff;
            border-radius: 3px;
        }
    }
}
</style>