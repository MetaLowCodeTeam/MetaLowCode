<template>
    <div class="form-design-box-div" v-loading="pageLoading">
        <v-form-designer
            ref="vfDesigner"
            :designer-config="designerConfig"
            :global-dsv="globalDsv"
            :field-list-data="fieldListData"
            @field-widget-used="handleFWU"
            @field-widget-removed="handleFWR"
            @form-json-updated="handleFJU"
            :banned-widgets="['reference','reference-list','outer-reference','cascader-option']"
            class="visual-design"
        >
            <!-- 配置工具按钮 -->
            <template #customToolButtons>
                <el-button type="primary" link @click="saveDesign">
                    <el-icon>
                        <Finished />
                    </el-icon>保存
                </el-button>
            </template>
            <template #widgetSetting="{designer, formConfig, selectedWidget, optionModel}">
                <el-collapse-item name="reportField" title="关联模型" v-if="selectedWidget?.type === 'report-field'">
                    <el-form-item label="父字段">
                        <el-input :model-value="optionModel.modelName" disabled />
                    </el-form-item>
                </el-collapse-item>
            </template>
        </v-form-designer>
    </div>
</template>

<script>
import { globalDsvDefaultData } from "@/utils/util";
import http from "@/utils/request";

export default {
    name: "DataModelReport",
    components: {
    },
    data() {
        return {
            designerConfig: {
                componentLib: false,
                formTemplates: false,
                eventCollapse: false,
                metadataLib: true,
                logoHeader: false,
                exportCodeButton: false,
                generateSFCButton: false,
                toolbarMaxWidth: 300,
                layoutTypeButton: false,
            },
            globalDsv: {
                ...globalDsvDefaultData(),
            },
            fieldListData: {},
            metaFieldsResult: null,
            pageLoading: false,
        };
    },
    created() {
        window.advancedDevMode = true;
        this.dataModelReportId = this.$route.query.dataModelReportId;
        this.designerConfig.componentLib = !!window.advancedDevMode;
        this.designerConfig.eventCollapse = !!window.advancedDevMode;
    },
    mounted() {
        this.loadDesign();
    },
    methods: {
        handleFWU(fwName, subFormName) {
            setTimeout(() => {
                this.$refs.vfDesigner.setMetaFields(this.metaFieldsResult);
            }, 800);
        },

        handleFWR(fwName, subFormName) {
            setTimeout(() => {
                this.$refs.vfDesigner.setMetaFields(this.metaFieldsResult);
            }, 800);
        },

        handleFJU() {
            setTimeout(() => {
                this.$refs.vfDesigner.setMetaFields(this.metaFieldsResult);
            }, 300);
        },

        async loadDesign() {
            this.pageLoading = true;
            let res = await http.get("/plugins/metaDataWarehouse/outerData/modelAssociation/queryModelAndChildren", {
                dataModelReportId: this.dataModelReportId 
            });
            if (res?.code == 200 && res.data?.length > 0) {
                this.$refs.vfDesigner.clearDesigner();
                let list = res.data;
                let allFields = [];
                let mainEntity = list[0];
                list.forEach((el) => {
                    (el.ModelField || []).forEach((fld) => {
                        allFields.push({ name: el.outerDataModelId + '.' + fld.fieldName, label: fld.fieldLabel });
                    });
                });
                this.fieldListData = { fieldList: allFields };

                let metaMain = {
                    entityName: mainEntity.modelName,
                    entityLabel: mainEntity.modelName,
                    fieldList: [],
                };
                (mainEntity.ModelField || []).forEach((fld) => {
                    metaMain.fieldList.push({
                        name: mainEntity.outerDataModelId + '.' + fld.fieldName,
                        label: fld.fieldLabel,
                        displayName: mainEntity.modelName + '.' + fld.fieldLabel,
                        type: "report-field",
                        icon: "text-field",
                        formItemFlag: true,
                        options: {
                            name: fld.fieldName,
                            label: fld.fieldLabel,
                            modelName: mainEntity.modelName,
                            outerDataModelId: mainEntity.outerDataModelId,
                            textAlign: 'left',
                            fontSize: '',
                            fontStyle: 'normal',
                            fontWeight: 'normal',
                        },
                    });
                });

                let metaDetail = [];
                for (let i = 1; i < list.length; i++) {
                    let el = list[i];
                    let detailItem = {
                        entityName: el.modelName,
                        entityLabel: el.modelName,
                        fieldList: [],
                    };
                    (el.ModelField || []).forEach((fld) => {
                        detailItem.fieldList.push({
                            name: el.outerDataModelId + '.' + fld.fieldName,
                            label: fld.fieldLabel,
                            displayName: el.modelName + '.' + fld.fieldLabel,
                            type: "report-field",
                            icon: "text-field",
                            options: {
                                name: fld.fieldName,
                                label: fld.fieldLabel,
                                modelName: el.modelName,
                                outerDataModelId: el.outerDataModelId,
                                textAlign: 'left',
                                fontSize: '',
                                fontStyle: 'normal',
                                fontWeight: 'normal',
                            },
                        });
                    });
                    metaDetail.push(detailItem);
                }

                this.metaFieldsResult = { main: metaMain, detail: metaDetail };
                this.$refs.vfDesigner.setFieldListData(this.fieldListData);
                this.$refs.vfDesigner.setMetaFields(this.metaFieldsResult);
            }
            this.pageLoading = false;
        },

        saveDesign() {
            let formJson = this.$refs.vfDesigner.getFormJson();
            console.info("保存表单：", formJson);
        },

    },
};
</script>

<style lang="scss" scoped>
:deep(.toolbar-header .toolbar-container) {
    width: 100%;
}

:deep(.setting-panel-container .el-tabs__item) {
    padding: 0 10px !important;
}

:deep(#tab-2),
:deep(#tab-3),
:deep(#pane-2),
:deep(#pane-3) {
    display: none !important;
}



</style>
<style>
.main-container.visual-design li {
    box-sizing: content-box !important;
}

.form-design-box-div {
    height: 100%;
    overflow: auto;
}
</style>
