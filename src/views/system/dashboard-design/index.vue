<template>
    <!--  -->
    <v-form-designer
        ref="dbDesignerRef"
        :designer-config="designerConfig"
		:banned-widgets="bannedWidgets"
        class="visual-design"
        v-loading="loading"
    >
        <!-- 配置工具按钮 -->
        <template #customToolButtons>
            <el-button type="primary" link @click="copyCanvas">
                <el-icon>
                    <ElIconCopyDocument />
                </el-icon>
                从{{ isMobile ? 'PC' : '移动端' }}复制
            </el-button>
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
import {deepClone, mlShortcutkeys} from "@/utils/util";
import { saveRecord, queryById } from "@/api/crud";
import { onMounted, ref, onBeforeUnmount, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
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
let bannedWidgets = ref(['section']);
let dbDesignerRef = ref();
// 是否移动端
let isMobile = ref(false);
const appPath = import.meta.env.VITE_APP_PATH;

// 快捷键
let mlShortcutCleanup = ref(null);

onMounted(async () => {
    chartId.value = router.currentRoute.value.query.chartId;
    let type = router.currentRoute.value.query.type;
    if (!chartId.value) {
        router.push(appPath + "dashboard-list");
        return;
    }
    if (type == "mobile") {
        isMobile.value = true;
    } else {
        isMobile.value = false;
    }
    let key = isMobile.value ? "mobileChartData" : "chartData";
    initFormConfig(key);

	mlShortcutCleanup.value = mlShortcutkeys(() => {
		window.advancedDevMode = !window.advancedDevMode;
		designerConfig.value.componentLib = !!window.advancedDevMode;

		if (window.advancedDevMode) {
			bannedWidgets.value.length = 0
			dbDesignerRef.value.refreshWidgetPanel()
		} else {
			bannedWidgets.value = ['section']
			dbDesignerRef.value.refreshWidgetPanel()
		}
	});
});

// 初始化数据
const initFormConfig = async (key) => {
    loading.value = true;
    let res = await queryById(chartId.value, key);
    if (res) {
        if (!res.data[key]) {
            clearCanvas();
        } else {
            let blankFormJson = JSON.parse(res.data[key]);
            if(blankFormJson?.formConfig?.layoutType != 'PC') {
                blankFormJson?.widgetList.forEach(el => {
                    el.widgetList.forEach(subEl => {
                        if(subEl.type == 'listTable') {
                            subEl.options.setQueryPanel.isShow = false;
                        }
                    })
                })
            }
            
            console.log(blankFormJson,'blankFormJson')
            dbDesignerRef.value.setFormJson(blankFormJson);
            if (isMobile.value) {
                dbDesignerRef.value.designer?.changeLayoutType("H5");
            }
        }
    } else {
        clearCanvas();
    }
    loading.value = false;
};

// 复制画布
const copyCanvas = () => {
    ElMessageBox.confirm(
        "从" +
            (isMobile.value ? "PC" : "移动端") +
            "复制图表将会清空当前配置，是否确认复制?",
        "提示：",
        {
            confirmButtonText: "确认",
            cancelButtonText: "取消",
            type: "warning",
        }
    )
        .then(async () => {
            // 先清空
            clearCanvas();
            // 如果是移动 就从PC复制，如果是PC就从移动复制
            let key = isMobile.value ? "chartData" : "mobileChartData";
            initFormConfig(key);
        })
        .catch(() => {});
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
    if (isMobile.value) {
        dbDesignerRef.value.designer?.changeLayoutType("H5");
    }
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
        formModel: {},
        id: chartId.value,
    };
    if (isMobile.value) {
        param.formModel.mobileChartData = JSON.stringify(
            dbDesignerRef.value.getFormJson(false)
        );
    } else {
        param.formModel.chartData = JSON.stringify(
            dbDesignerRef.value.getFormJson(false)
        );
    }
    let res = await saveRecord(param.entity, param.id, param.formModel);
    if (res) {
        ElMessage.success("保存成功");
    }
    loading.value = false;
};

onBeforeUnmount(() => {
    clearCanvas();
});

onUnmounted(() => {
    if(mlShortcutCleanup.value){
        mlShortcutCleanup.value();
    }
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

.chart-container-widget-item, .chart-widget-item {
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
