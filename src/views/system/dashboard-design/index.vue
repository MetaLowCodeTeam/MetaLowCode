<template>
    <!--  -->
    <v-form-designer
        ref="dbDesignerRef"
        :designer-config="designerConfig"
        class="visual-design"
        v-loading="loading"
    >
        <!-- 配置工具按钮 -->
        <template #customToolButtons>
            <el-button type="primary" link @click="clearCanvas">
                <el-icon>
                    <ElIconDelete />
                </el-icon>清空画布
            </el-button>
            <el-button type="primary" link @click="previewDesign">
                <el-icon>
                    <View />
                </el-icon>预览
            </el-button>
            <el-button type="primary" link @click="importJson">导入</el-button>
            <el-button type="primary" link @click="exportJson">导出</el-button>
            <el-button type="primary" link @click="saveDesign">
                <el-icon>
                    <Finished />
                </el-icon>保存设计
            </el-button>
        </template>
    </v-form-designer>
</template>

<script setup>
import VisualDesign from "@/../lib/visual-design/designer.umd.js";
import { dashboard_container_schema } from "@/views/system/dashboard-design/charts/charts-schema";
import { deepClone } from "@/utils/util";
import { saveRecord, queryById } from "@/api/crud";
import { onMounted, ref, onBeforeUnmount, nextTick } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
const router = useRouter();
const { Utils } = VisualDesign.VFormSDK;

let loading = ref(false);
let chartId = ref("");
let designerConfig = ref({
    componentLib: false, //隐藏表单组件库
    formTemplates: false,
    logoHeader: false,
    layoutTypeButton: false, //隐藏表单布局适配按钮组
    clearDesignerButton: false,
    previewFormButton: false,
    importJsonButton: false,
    exportJsonButton: false,
    exportCodeButton: false,
    generateSFCButton: false,
    toolbarMaxWidth: 300,
    chartLib: true,
});
let dbDesignerRef = ref();
onMounted(() => {
    chartId.value = router.currentRoute.value.query.chartId;
    if (!chartId.value) {
        router.push("/web/dashboard-list");
        return;
    }
    initFormConfig();
});

// 初始化数据
const initFormConfig = async () => {
    loading.value = true;
    let res = await queryById(chartId.value, "chartData");

    if (res) {
        if (!res.data.chartData) {
            clearCanvas();
        } else {
            let blankFormJson = JSON.parse(res.data.chartData);
            dbDesignerRef.value.setFormJson(blankFormJson);
        }
    } else {
        clearCanvas();
    }
    loading.value = false;
};

// 清空画布
const clearCanvas = () => {
    //清空后要插入dashboard-container!!
    const newDashboardCon = deepClone(dashboard_container_schema);
    newDashboardCon.id = "dbCon" + Utils.generateId();
    newDashboardCon.options.name = newDashboardCon.id;
    const blankFormJson = {
        widgetList: [newDashboardCon],
        formConfig: Utils.getDefaultFormConfig(),
    };
    dbDesignerRef.value.setFormJson(blankFormJson);
};

const previewDesign = () => {
    dbDesignerRef.value.previewForm();
};

const importJson = () => {
    dbDesignerRef.value.importJson();
};

const exportJson = () => {
    dbDesignerRef.value.exportJson();
};

const saveDesign = async () => {
    loading.value = true;
    let param = {
        entity: "Chart",
        formModel: {
            chartData: JSON.stringify(dbDesignerRef.value.getFormJson(false)),
        },
        id: chartId.value,
    };
    let res = await saveRecord(param.entity, param.id, param.formModel);
    if (res) {
        ElMessage.success("保存成功");
    }
    loading.value = false;
};

onBeforeUnmount(() => {
    clearCanvas();
});
</script>
<style lang='scss' scoped>
:deep(.toolbar-header .toolbar-container) {
    width: 100%;
}

:deep(.vue-grid-layout) {
    min-height: 450px !important;
}
</style>
<style>
.main-container.visual-design li {
    box-sizing: content-box !important;
}

.ds-setting-drawer .el-drawer__body {
    padding: 20px !important;
}

.chart-widget-item {
    height: 72px !important;

    div.svg-icon-label {
        display: flex;
        height: 72px !important;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;

        .svg-icon {
            margin-top: 6px !important;
            font-size: 20px !important;
        }
    }
}
</style>