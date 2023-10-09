<template>
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
                    <Delete />
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

<script>
import VisualDesign from "@/../lib/visual-design/designer.umd.js";
import { dashboard_container_schema } from "@/views/system/dashboard-design/charts/charts-schema";
import { deepClone } from "@/utils/util";
import { saveRecord, queryById } from "@/api/crud";
const { Utils } = VisualDesign.VFormSDK;

export default {
    name: "dashboard-design",
    prop: {},
    data() {
        return {
            loading: false,
            chartId: "",
            designerConfig: {
                formTemplates: false,
                logoHeader: false,
                clearDesignerButton: false,
                previewFormButton: false,
                importJsonButton: false,
                exportJsonButton: false,
                exportCodeButton: false,
                generateSFCButton: false,
                toolbarMaxWidth: 300,
                chartLib: true,
            },
        };
    },
    created() {
        // console.log()
        this.chartId = this.$route.query.chartId;
        if (!this.chartId) {
            this.$router.push("/dashboard-list");
        }
    },
    mounted() {
        this.initFormConfig();
    },
    methods: {
        async initFormConfig() {
            this.loading = true;
            let res = await queryById(this.chartId, "chartData");
            if (res) {
                if (!res.data.chartData) {
                    this.clearCanvas();
                } else {
                    let blankFormJson = JSON.parse(res.data.chartData)
                    this.$refs.dbDesignerRef.setFormJson(blankFormJson);
                    console.log(JSON.parse(res.data.chartData),'JSON.parse(res.data.chartData)')
                }
            }else {
                this.clearCanvas();
            }
            this.loading = false;
        },
        clearCanvas() {
            //清空后要插入dashboard-container!!
            const newDashboardCon = deepClone(dashboard_container_schema);
            newDashboardCon.id = "dbCon" + Utils.generateId();
            newDashboardCon.options.name = newDashboardCon.id;
            const blankFormJson = {
                widgetList: [newDashboardCon],
                formConfig: Utils.getDefaultFormConfig(),
            };
            this.$refs.dbDesignerRef.setFormJson(blankFormJson);
        },

        previewDesign() {
            this.$refs.dbDesignerRef.previewForm();
        },

        importJson() {
            this.$refs.dbDesignerRef.importJson();
        },

        exportJson() {
            this.$refs.dbDesignerRef.exportJson();
        },

        async saveDesign() {
            // this.$message.info("待实现...");
            // this.loading = true;
            this.loading = true;
            // console.log()
            let param = {
                entity: "Chart",
                formModel: {
                    chartData: JSON.stringify(this.$refs.dbDesignerRef.getFormJson(false)),
                },
                id: this.chartId,
            };
            let res = await saveRecord(param.entity, param.id, param.formModel);
            if (res) {
                this.$message.success("保存成功");
            }
            this.loading = false;
            // console.log(this.$refs.dbDesignerRef.getFormJson(false),'this.$refs.vfDesigner.getFormJson(false)')
        },
    },
};
</script>

<style scoped>
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
</style>
