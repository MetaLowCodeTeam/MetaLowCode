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
            @metadata-model-edit="handleMetadataModelEdit"
            @metadata-model-delete="handleMetadataModelDelete"
            :banned-widgets="[ 'reference','reference-list','outer-reference','cascader-option', 'input','textarea','number','radio','checkbox','select','time','time-range','date','date-range','switch','rate','color','slider','step-bar','static-text','html-text','button','divider','code-img','picture-upload','file-upload','rich-editor','cascader','slot','custom-render', 'check-tag','sign','location','tianditu-location','alert' ]"
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
            <template #metadataHeader>
                <div class="metadata-header-slot">
                    <span class="metadata-header-slot__title">数据模型</span>
                    <el-button type="primary" size="small" @click="openModelAssociationEdit">添加数据模型</el-button>
                </div>
            </template>
            <template #widgetSetting="{designer, formConfig, selectedWidget, optionModel}">
                <el-collapse-item name="reportField" title="关联模型" v-if="selectedWidget?.type === 'report-field'">
                    <el-form-item label="父字段">
                        <el-input :model-value="optionModel.modelName" disabled />
                    </el-form-item>
                </el-collapse-item>
            </template>
        </v-form-designer>
        <model-association-edit ref="modelAssociationEditRef" @save="handleModelConfigSave" />
    </div>
</template>

<script>
import { ElMessage } from "element-plus";
import { globalDsvDefaultData } from "@/utils/util";
import { queryById, saveRecord } from "@/api/crud";
import http from "@/utils/request";
import ModelAssociationEdit from "./ModelAssociationEdit.vue";

export default {
    name: "DataModelReport",
    components: {
        ModelAssociationEdit,
    },
    data() {
        return {
            designerConfig: {
                componentLib: false,
                formTemplates: false,
                eventCollapse: false,
                metadataLib: true,
                metadataModelManage: true,
                reportWidgets: true,
                logoHeader: false,
                exportCodeButton: false,
                generateSFCButton: false,
                toolbarMaxWidth: 300,
                layoutTypeButton: false,
                metadataContainer: false,
                advancedFields: false,
                customFields: false,
                keepContainers: ['column-1-grid','column-2-grid','column-3-grid','column-4-grid','table','loop-container'],
            },
            globalDsv: {
                ...globalDsvDefaultData(),
            },
            fieldListData: {},
            metaFieldsResult: null,
            modelConfigList: [],
            usedFieldNames: {},
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
    watch: {
        '$route.query.dataModelReportId'(newId, oldId) {
            if (!newId || newId === oldId) {
                return;
            }
            this.dataModelReportId = newId;
            this.loadDesign();
        },
    },
    methods: {
        resetDesignState() {
            this.modelConfigList = [];
            this.usedFieldNames = {};
            this.fieldListData = { fieldList: [] };
            this.metaFieldsResult = {
                main: { entityName: "", entityLabel: "", isArray: false, fieldList: [] },
                detail: [],
            };
            this.$refs.vfDesigner?.clearDesigner?.();
            this.$refs.vfDesigner?.setFieldListData?.(this.fieldListData);
            this.$refs.vfDesigner?.setMetaFields?.(this.metaFieldsResult);
        },

        handleFWU() {
            this.$nextTick(() => this.syncUsedFields());
        },

        handleFWR() {
            this.$nextTick(() => this.syncUsedFields());
        },

        handleFJU() {
			this.$nextTick(() => this.syncUsedFields());
        },

        syncUsedFields(delay = 0) {
			let used = {};
			const allWidgets = this.$refs.vfDesigner?.getFieldWidgets?.() || [];
			allWidgets.forEach((fw) => {
				this.getWidgetUsedFieldKeys(fw).forEach((key) => {
                    used[key] = 1;
                });
			});
			this.usedFieldNames = used;
            setTimeout(() => {
                this.$refs.vfDesigner?.setMetaFields?.(this.buildFilteredMetaFields());
            }, delay);
        },

        getWidgetUsedFieldKeys(widget) {
            const keys = new Set();
            [
                widget?.name,
                widget?.options?.name,
                widget?.metaFieldName,
                widget?.options?.keyName,
                widget?.displayName,
                widget?.label,
                widget?.options?.label,
            ].filter(Boolean).forEach((key) => keys.add(key));
            const dataCode = widget?.dataCode || widget?.metaModelName || widget?.options?.modelAssociationId;
            const fieldName = this.getFieldNameFromWidget(widget);
            if (dataCode && fieldName) {
                keys.add(dataCode + "." + fieldName);
            }
            return Array.from(keys);
        },

        getFieldNameFromWidget(widget) {
            if (widget?.name && widget.name.includes(".")) {
                return widget.name.slice(widget.name.lastIndexOf(".") + 1);
            }
            const optionName = widget?.options?.name || "";
            const dataCode = widget?.dataCode || widget?.metaModelName || widget?.options?.modelAssociationId;
            if (dataCode && optionName.startsWith(dataCode + ".")) {
                return optionName.slice(dataCode.length + 1);
            }
            return widget?.fieldName || widget?.name || "";
        },

        isMetaFieldUsed(fld) {
            return this.getWidgetUsedFieldKeys(fld).some((key) => this.usedFieldNames[key]);
        },

        buildFilteredMetaFields() {
			if (!this.metaFieldsResult) return null;
			let result = {
				main: {
					entityName: this.metaFieldsResult.main.entityName,
					entityLabel: this.metaFieldsResult.main.entityLabel,
                    dataCode: this.metaFieldsResult.main.dataCode,
                    mainModel: this.metaFieldsResult.main.mainModel,
					isArray: this.metaFieldsResult.main.isArray,
					fieldList: [],
				},
				detail: [],
			};
			this.metaFieldsResult.main.fieldList.forEach((fld) => {
				result.main.fieldList.push(fld);
			});
			this.metaFieldsResult.detail.forEach((de) => {
				let detailItem = {
					entityName: de.entityName,
					entityLabel: de.entityLabel,
                    dataCode: de.dataCode,
                    mainModel: de.mainModel,
					isArray: de.isArray,
					fieldList: [],
				};
				de.fieldList.forEach((fld) => {
					detailItem.fieldList.push(fld);
				});
				result.detail.push(detailItem);
			});
			return result;
		},

        async loadDesign() {
            this.pageLoading = true;
            this.resetDesignState();
			let res2 = await queryById(this.dataModelReportId, "reportConfig,modelConfig");
			if (res2?.code == 200) {
                this.modelConfigList = this.parseModelConfig(res2.data?.modelConfig);
                await this.refreshMetaFields();
				try {
					let config = typeof res2.data?.reportConfig === "string" ? JSON.parse(res2.data.reportConfig) : res2.data?.reportConfig;
					if (config) {
                        this.$refs.vfDesigner.setFormJson(config);
                        this.syncAllLoopContainerDisplayNames();
                        this.syncUsedFields();
					}
				} catch (e) {
					console.error("reportConfig parse error", e);
				}
			}
            this.pageLoading = false;
        },

        async saveDesign() {
			let formJson = this.$refs.vfDesigner.getFormJson();
			if (!formJson) return;
			this.pageLoading = true;
			let res = await saveRecord("DataModelReport", this.dataModelReportId, {
				reportConfig: JSON.stringify(formJson),
				modelConfig: JSON.stringify(this.getCleanModelConfig()),
			});
			if (res?.code == 200) {
				ElMessage.success("保存成功");
			}
			this.pageLoading = false;
        },

        openModelAssociationEdit() {
            this.$refs.modelAssociationEditRef?.openDialog({
                subModelId: "",
                subModelName: "",
            });
        },

        handleMetadataModelEdit(group) {
            const config = this.modelConfigList.find((item) => item.dataCode === group?.dataCode);
            if (!config) return;
            this.$refs.modelAssociationEditRef?.openDialog({
                ...config,
                editId: config.dataCode,
                editLabel: config.modelAssociationLabel,
            });
        },

        handleMetadataModelDelete(group) {
            const config = this.modelConfigList.find((item) => item.dataCode === group?.dataCode);
            if (!config) return;
            if (this.hasCanvasModelUsed(config.dataCode)) {
                ElMessage.warning(`请先删除画布中已拖入的「${config.modelAssociationLabel}」相关字段，再删除该数据模型`);
                return;
            }
            this.$confirm(`是否确认删除${config.modelAssociationLabel}`, "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
            }).then(async () => {
                this.modelConfigList = this.modelConfigList.filter((item) => item.dataCode !== config.dataCode);
                await this.refreshMetaFields();
            }).catch(() => {});
        },

        hasCanvasModelUsed(dataCode) {
            const formJson = this.$refs.vfDesigner?.getFormJson?.();
            let used = false;
            const visit = (widgetList = []) => {
                if (!Array.isArray(widgetList) || used) return;
                widgetList.forEach((widget) => {
                    if (!widget || used) return;
                    const widgetCode = widget.dataCode || widget.metaModelName || widget.options?.modelAssociationId;
                    if (widgetCode === dataCode) {
                        used = true;
                        return;
                    }
                    if (widget.type === "loop-container" && (widget.options?.name === dataCode || widget.options?.modelAssociationId === dataCode)) {
                        used = true;
                        return;
                    }
                    if (Array.isArray(widget.widgetList)) visit(widget.widgetList);
                    if (Array.isArray(widget.cols)) widget.cols.forEach((col) => visit(col.widgetList || []));
                    if (Array.isArray(widget.rows)) widget.rows.forEach((row) => (row.cols || []).forEach((cell) => visit(cell.widgetList || [])));
                    if (Array.isArray(widget.tabs)) widget.tabs.forEach((tab) => visit(tab.widgetList || []));
                });
            };
            visit(formJson?.widgetList || []);
            return used;
        },

        async handleModelConfigSave(data) {
            const oldConfig = this.modelConfigList.find((item) => item.dataCode === data.dataCode);
            const cleanData = {
                dataCode: data.dataCode,
                mainModel: data.mainModel,
                modelAssociationLabel: data.modelAssociationLabel,
                isArray: data.isArray,
            };
            const oldIndex = this.modelConfigList.findIndex((item) => item.dataCode === cleanData.dataCode);
            if (oldIndex > -1) {
                this.modelConfigList.splice(oldIndex, 1, cleanData);
            } else {
                this.modelConfigList.push(cleanData);
            }
            this.syncLoopContainerDisplayName(cleanData, oldConfig);
            await this.refreshMetaFields();
        },

        syncLoopContainerDisplayName(config, oldConfig, reloadDesigner = true) {
            const formJson = this.$refs.vfDesigner?.getFormJson?.();
            if (!formJson?.widgetList) return;
            const visit = (widgetList = []) => {
                widgetList.forEach((widget) => {
                    if (!widget) return;
                    if (widget.type === "loop-container") {
                        const options = widget.options || (widget.options = {});
                        const childBound = this.getLoopContainerChildModelCode(widget);
                        const matchedByCode = options.name === config.dataCode || childBound === config.dataCode;
                        const matchedByOldLabel = oldConfig && options.name === oldConfig.modelAssociationLabel;
                        if (matchedByCode || matchedByOldLabel) {
                            options.name = config.dataCode;
                            options.displayName = config.modelAssociationLabel;
                            options.modelAssociationId = config.dataCode;
                        }
                    }
                    if (Array.isArray(widget.widgetList)) visit(widget.widgetList);
                    if (Array.isArray(widget.cols)) widget.cols.forEach((col) => visit(col.widgetList || []));
                    if (Array.isArray(widget.rows)) widget.rows.forEach((row) => (row.cols || []).forEach((cell) => visit(cell.widgetList || [])));
                    if (Array.isArray(widget.tabs)) widget.tabs.forEach((tab) => visit(tab.widgetList || []));
                });
            };
            visit(formJson.widgetList);
            if (reloadDesigner) {
                this.$refs.vfDesigner?.setFormJson?.(formJson);
            }
        },

        getLoopContainerChildModelCode(loopWidget) {
            let code = "";
            const visit = (widgetList = []) => {
                for (const widget of widgetList) {
                    if (!widget || code) continue;
                    if (widget.type === "report-field" && widget.options?.isArray && widget.options?.modelAssociationId) {
                        code = widget.options.modelAssociationId;
                        return;
                    }
                    if (Array.isArray(widget.widgetList)) visit(widget.widgetList);
                    if (Array.isArray(widget.cols)) widget.cols.forEach((col) => visit(col.widgetList || []));
                    if (Array.isArray(widget.rows)) widget.rows.forEach((row) => (row.cols || []).forEach((cell) => visit(cell.widgetList || [])));
                    if (Array.isArray(widget.tabs)) widget.tabs.forEach((tab) => visit(tab.widgetList || []));
                }
            };
            visit(loopWidget.widgetList || []);
            return code;
        },

        syncAllLoopContainerDisplayNames(reloadDesigner = true) {
            this.modelConfigList.forEach((config) => {
                this.syncLoopContainerDisplayName(config, null, reloadDesigner);
            });
        },

        parseModelConfig(modelConfig) {
            if (!modelConfig) return [];
            try {
                const config = typeof modelConfig === "string" ? JSON.parse(modelConfig) : modelConfig;
                return Array.isArray(config) ? config.map((item) => ({
                    dataCode: item.dataCode,
                    mainModel: item.mainModel,
                    modelAssociationLabel: item.modelAssociationLabel,
                    isArray: !!item.isArray,
                })).filter((item) => item.dataCode && item.mainModel) : [];
            } catch (e) {
                console.error("modelConfig parse error", e);
                return [];
            }
        },

        getCleanModelConfig() {
            return this.modelConfigList.map((item) => ({
                dataCode: item.dataCode,
                mainModel: item.mainModel,
                modelAssociationLabel: item.modelAssociationLabel,
                isArray: !!item.isArray,
            }));
        },

        async refreshMetaFields() {
            if (!this.modelConfigList.length) {
                this.fieldListData = { fieldList: [] };
                this.metaFieldsResult = {
                    main: { entityName: "", entityLabel: "", isArray: false, fieldList: [] },
                    detail: [],
                };
                this.$refs.vfDesigner?.setFieldListData?.(this.fieldListData);
                this.$refs.vfDesigner?.setMetaFields?.(this.metaFieldsResult);
                return;
            }

            const modelIds = this.modelConfigList.map((item) => item.mainModel);
            let res = await http.post("/plugins/metaDataWarehouse/outerData/modelReport/queryModelAndChildren", modelIds);
            if (res?.code != 200) return;

            const modelMap = {};
            (res.data || []).forEach((model) => {
                const id = model.outerDataModelId || model.outerDataModel?.id || model.id;
                if (id) {
                    modelMap[id] = model;
                }
            });

            const groups = this.modelConfigList.map((config) => {
                const model = modelMap[config.mainModel] || {};
                return this.buildMetaGroup(config, model);
            });
            const allFields = [];
            groups.forEach((group) => {
                group.fieldList.forEach((field) => {
                    allFields.push({ name: field.name, label: field.label });
                });
            });

            this.fieldListData = { fieldList: allFields };
            this.metaFieldsResult = {
                main: groups[0] || { entityName: "", entityLabel: "", isArray: false, fieldList: [] },
                detail: groups.slice(1),
            };
            this.$refs.vfDesigner.setFieldListData(this.fieldListData);
            this.$refs.vfDesigner.setMetaFields(this.metaFieldsResult);
            this.syncAllLoopContainerDisplayNames(false);
            this.syncUsedFields();
        },

        buildMetaGroup(config, model) {
            const entityLabel = config.modelAssociationLabel;
            const modelName = model.modelName || entityLabel;
            const fields = model.ModelField || model.modelField || model.fieldList || [];
            return {
                entityName: config.dataCode,
                entityLabel,
                dataCode: config.dataCode,
                mainModel: config.mainModel,
                isArray: !!config.isArray,
                fieldList: fields.map((fld) => this.buildMetaField(config, modelName, fld)),
            };
        },

        buildMetaField(config, modelName, fld) {
            const fieldName = fld.fieldName || fld.name;
            const fieldLabel = fld.fieldLabel || fld.label || fieldName;
            const isArray = !!config.isArray;
            const name = config.dataCode + "." + fieldName;
            const safeCode = config.dataCode.replace(/[^a-zA-Z0-9]/g, "");
            return {
                name,
                label: fieldLabel,
                displayName: config.modelAssociationLabel + "." + fieldLabel,
                type: "report-field",
                icon: isArray ? "sub-form" : "text-field",
                formItemFlag: true,
                nameReadonly: true,
                dataCode: config.dataCode,
                metaModelName: config.dataCode,
                options: {
                    name: isArray ? "reportfield" + safeCode + fieldName : name,
                    label: fieldLabel,
                    modelName,
                    outerDataModelId: config.mainModel,
                    modelAssociationId: config.dataCode,
                    isArray,
                    textAlign: 'left',
                    fontSize: '',
                    fontStyle: 'normal',
                    fontWeight: 'normal',
                },
            };
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

:deep(.field-widget-item > span) {
    display: flex;
    align-items: center;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

:deep(.field-widget-item > span .svg-icon) {
    flex: 0 0 auto;
}

:deep(.widget-collapse .el-collapse-item__header) {
    min-width: 0;
    overflow: hidden;
    width: calc(100% - 8px);
    max-width: calc(100% - 8px);
    box-sizing: border-box;
}

:deep(.widget-collapse .el-collapse-item__header.is-active .metadata-collapse-title),
:deep(.widget-collapse .el-collapse-item__header.is-active .metadata-collapse-title__text),
:deep(.widget-collapse .el-collapse-item__header:focus .metadata-collapse-title),
:deep(.widget-collapse .el-collapse-item__header:focus .metadata-collapse-title__text) {
    color: #303133;
}

:deep(.widget-collapse .metadata-title-row) {
    display: inline-flex;
    align-items: center;
    min-width: 0;
    width: calc(100% - 24px);
    max-width: calc(100% - 24px);
    flex: 0 1 calc(100% - 24px);
    overflow: hidden;
}

:deep(.widget-collapse .metadata-collapse-title) {
    display: inline-flex;
    align-items: center;
    min-width: 0;
    flex: 1 1 auto;
    overflow: hidden;
    color: #303133;
}

:deep(.widget-collapse .metadata-collapse-title__icon) {
    flex: 0 0 auto;
    margin-left: 0;
}

:deep(.metadata-type-badge) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
    min-width: 16px;
    padding: 0 3px;
    height: 16px;
    margin-right: 4px;
    border: 1px solid #A8ABB2;
    border-radius: 8px;
    color: #606266;
    font-size: 11px;
    font-style: normal;
    font-weight: 600;
    line-height: 16px;
    box-sizing: border-box;
}

:deep(.metadata-title-actions) {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    flex: 0 0 auto;
    margin-left: 6px;
    font-style: normal;
    color: #909399;
}

:deep(.metadata-title-action-icon) {
    width: 14px;
    height: 14px;
    cursor: pointer;
}

:deep(.metadata-title-action-icon:hover) {
    color: #6554f0;
}

:deep(.widget-collapse .metadata-collapse-title__text) {
    display: block;
    flex: 1 1 auto;
    width: 0;
    min-width: 0;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: #303133;
}

:deep(.field-widget-item .metadata-field-content) {
    display: flex;
    align-items: center;
    min-width: 0;
    width: 100%;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

:deep(.field-widget-item .metadata-field-content__icon) {
    flex: 0 0 auto;
    margin-left: 0;
}

:deep(.field-widget-item .metadata-field-content__text) {
    display: block;
    flex: 1 1 auto;
    width: 0;
    min-width: 0;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.metadata-header-slot {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 12px 12px 8px;
}

.metadata-header-slot__title {
    color: #303133;
    font-size: 16px;
    font-weight: 600;
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
