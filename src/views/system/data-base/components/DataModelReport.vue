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
            @metadata-model-view="handleMetadataModelView"
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
        </v-form-designer>
        <model-association-edit ref="modelAssociationEditRef" @save="handleModelConfigSave" />
        <el-dialog
            v-model="fieldMappingDialogVisible"
            :title="fieldMappingDialogTitle"
            width="720px"
            append-to-body
            destroy-on-close
            class="field-mapping-dialog"
        >
            <div class="field-mapping-dialog__toolbar">
                <el-button link type="primary" @click="copyFieldMappingCode">
                    <el-icon><CopyDocument /></el-icon>复制
                </el-button>
            </div>
            <pre class="field-mapping-dialog__code"><code>{{ fieldMappingCode }}</code></pre>
        </el-dialog>
    </div>
</template>

<script>
import { ElMessage } from "element-plus";
import { globalDsvDefaultData } from "@/utils/util";
import http from "@/utils/request";
import { copyText } from "@/utils/util";
import ModelAssociationEdit from "./ModelAssociationEdit.vue";
import { CopyDocument } from "@element-plus/icons-vue";
import {
    applyAllNativeReportTableStyles,
    COMPACT_REPORT_TABLE_CONFIG,
    ensureNativeReportTableConfig,
    LEGACY_REPORT_TABLE_CONFIG,
    normalizeReportWidgetCustomClasses,
    syncNativeTableEmptyText,
} from "@/views/system/form-design/extension/report-table-style";

const REPORT_FIELD_DELIMITER = "##";
const LEGACY_REPORT_FIELD_DELIMITER = ".";

export default {
    name: "DataModelReport",
    components: {
        ModelAssociationEdit,
        CopyDocument,
    },
    data() {
        return {
            designerConfig: {
                componentLib: false,
                formTemplates: false,
                eventCollapse: false,
                reportEventOnly: true,
                reportGeneralSetting: true,
				reportWatermarkSetting: true,
                ensureUniqueFieldName: true,
                metadataLib: true,
                metadataModelManage: true,
                reportWidgets: true,
                logoHeader: false,
                previewFormButton: false,
                exportCodeButton: false,
                generateSFCButton: false,
                toolbarMaxWidth: 300,
                layoutTypeButton: false,
                metadataContainer: false,
                advancedFields: false,
                customFields: false,
                keepContainers: ['column-1-grid','column-2-grid','column-3-grid','column-4-grid','table','loop-container','page-header-container','page-footer-container'],
            },
            globalDsv: {
                ...globalDsvDefaultData(),
            },
            fieldListData: {},
            metaFieldsResult: null,
            modelConfigList: [],
            usedFieldNames: {},
            pageLoading: false,
            normalizingReportFields: false,
            nativeTableCompactDefaultsReady: false,
            fieldMappingDialogVisible: false,
            fieldMappingDialogTitle: "字段映射",
            fieldMappingCode: "",
        };
    },
    created() {
        window.advancedDevMode = true;
        this.dataModelReportId = this.$route.query.dataModelReportId;
        this.designerConfig.componentLib = !!window.advancedDevMode;
        this.designerConfig.eventCollapse = !!window.advancedDevMode;
    },
    mounted() {
        this.observeNativeTableChanges();
        this.loadDesign();
    },
    beforeUnmount() {
        this.nativeTableObserver?.disconnect();
        this.nativeTableObserver = null;
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
        composeReportFieldPath(modelCode, fieldName) {
            if (!modelCode || !fieldName) {
                return "";
            }
            return modelCode + REPORT_FIELD_DELIMITER + fieldName;
        },

        observeNativeTableChanges() {
            if (typeof MutationObserver === "undefined") return;
            this.nativeTableObserver = new MutationObserver((mutationList) => {
                const tableAdded = mutationList.some((mutation) => Array.from(mutation.addedNodes || []).some((node) => {
                    if (node?.nodeType !== 1) return false;
                    return node.matches?.(".table-container") || !!node.querySelector?.(".table-container");
                }));
                if (tableAdded) {
                    this.$nextTick(() => this.handleDesignerWidgetsChanged());
                }
            });
            this.nativeTableObserver.observe(this.$el, {
                childList: true,
                subtree: true,
            });
        },

        parseReportFieldPath(path = "", modelCode = "") {
            if (!path) {
                return { modelCode: "", fieldName: "" };
            }
            if (path.includes(REPORT_FIELD_DELIMITER)) {
                const [parsedModelCode, ...rest] = path.split(REPORT_FIELD_DELIMITER);
                return {
                    modelCode: parsedModelCode || modelCode || "",
                    fieldName: rest.join(REPORT_FIELD_DELIMITER),
                };
            }
            if (modelCode && path.startsWith(modelCode + LEGACY_REPORT_FIELD_DELIMITER)) {
                return {
                    modelCode,
                    fieldName: path.slice(modelCode.length + LEGACY_REPORT_FIELD_DELIMITER.length),
                };
            }
            if (path.includes(LEGACY_REPORT_FIELD_DELIMITER)) {
                const splitIndex = path.lastIndexOf(LEGACY_REPORT_FIELD_DELIMITER);
                return {
                    modelCode: path.slice(0, splitIndex),
                    fieldName: path.slice(splitIndex + LEGACY_REPORT_FIELD_DELIMITER.length),
                };
            }
            return {
                modelCode: modelCode || "",
                fieldName: path,
            };
        },

        normalizeReportFieldPath(path = "", modelCode = "") {
            const parsed = this.parseReportFieldPath(path, modelCode);
            return this.composeReportFieldPath(parsed.modelCode || modelCode, parsed.fieldName);
        },

        resetDesignState() {
            this.nativeTableCompactDefaultsReady = false;
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

        handleFWU(widget) {
            if (widget?.type === "table") {
                ensureNativeReportTableConfig(widget, COMPACT_REPORT_TABLE_CONFIG);
                syncNativeTableEmptyText(widget);
            }
            this.$nextTick(() => this.handleDesignerWidgetsChanged());
        },

        handleFWR() {
            this.$nextTick(() => this.handleDesignerWidgetsChanged());
        },

        handleFJU() {
			this.$nextTick(() => this.handleDesignerWidgetsChanged());
        },

        handleDesignerWidgetsChanged() {
            if (this.normalizingReportFields) {
                return;
            }
            const changed = this.normalizeReportFieldWidgets();
            if (!changed) {
                this.syncUsedFields();
            }
            this.$nextTick(() => this.applyNativeTableStyles());
        },

        applyNativeTableStyles(formJson) {
            if (formJson === undefined) {
                const designer = this.$refs.vfDesigner;
                formJson = designer && typeof designer.getFormJson === 'function'
                    ? designer.getFormJson()
                    : undefined;
            }
            applyAllNativeReportTableStyles(formJson?.widgetList || [], this.$el);
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
                widget?.options?.bindingPath,
                widget?.displayName,
                widget?.label,
                widget?.options?.label,
            ].filter(Boolean).forEach((key) => keys.add(key));
            const dataCode = widget?.dataCode || widget?.metaModelName || widget?.options?.modelAssociationId;
            const fieldName = this.getFieldNameFromWidget(widget);
            if (dataCode && fieldName) {
                keys.add(this.composeReportFieldPath(dataCode, fieldName));
                keys.add(dataCode + LEGACY_REPORT_FIELD_DELIMITER + fieldName);
            }
            return Array.from(keys);
        },

        getFieldNameFromWidget(widget) {
            const dataCode = widget?.dataCode || widget?.metaModelName || widget?.options?.modelAssociationId || "";
            const keyName = widget?.options?.keyName || "";
            if (keyName) {
                return this.parseReportFieldPath(keyName, dataCode).fieldName;
            }
            const bindingPath = widget?.options?.bindingPath || "";
            if (bindingPath) {
                return this.parseReportFieldPath(bindingPath, dataCode).fieldName;
            }
            if (widget?.name) {
                return this.parseReportFieldPath(widget.name, dataCode).fieldName;
            }
            const optionName = widget?.options?.name || "";
            if (optionName) {
                const parsed = this.parseReportFieldPath(optionName, dataCode).fieldName;
                if (parsed) {
                    return parsed;
                }
            }
            return widget?.fieldName || widget?.name || "";
        },

        getReportFieldBindingPath(widget) {
            if (!widget || widget.type !== "report-field") {
                return "";
            }
            const options = widget.options || {};
            const dataCode = widget.dataCode || widget.metaModelName || options.modelAssociationId || "";
            const keyName = options.keyName || "";
            if (options.bindingPath) {
                return this.normalizeReportFieldPath(options.bindingPath, dataCode);
            }
            if (widget.name) {
                const widgetPath = this.normalizeReportFieldPath(widget.name, dataCode);
                if (widgetPath) {
                    return widgetPath;
                }
            }
            if (dataCode && keyName) {
                const parsedKeyName = this.parseReportFieldPath(keyName, dataCode).fieldName;
                return this.composeReportFieldPath(dataCode, parsedKeyName);
            }
            if (dataCode && options.name) {
                const optionPath = this.normalizeReportFieldPath(options.name, dataCode);
                if (optionPath) {
                    return optionPath;
                }
            }
            return "";
        },

        normalizeSingleReportField(widget) {
            if (!widget || widget.type !== "report-field") {
                return false;
            }
            const options = widget.options || (widget.options = {});
            const modelConfig = this.modelConfigList.find((item) => item.dataCode === (widget.dataCode || widget.metaModelName || options.modelAssociationId));
            const bindingPath = this.getReportFieldBindingPath(widget);
            const fieldName = bindingPath
                ? this.parseReportFieldPath(bindingPath, widget.dataCode || widget.metaModelName || options.modelAssociationId).fieldName
                : this.getFieldNameFromWidget(widget);
            const uniqueName = widget.id || options.name;
            let changed = false;

            if (bindingPath && widget.name !== bindingPath) {
                widget.name = bindingPath;
                changed = true;
            }
            if (bindingPath && options.bindingPath !== bindingPath) {
                options.bindingPath = bindingPath;
                changed = true;
            }
            if (bindingPath && options.keyName !== bindingPath) {
                options.keyName = bindingPath;
                changed = true;
            }
            if (options.keyNameEnabled !== true) {
                options.keyNameEnabled = true;
                changed = true;
            }
            if (uniqueName && options.name !== uniqueName) {
                options.name = uniqueName;
                changed = true;
            }
            if (modelConfig?.modelAssociationLabel && options.modelLabel !== modelConfig.modelAssociationLabel) {
                options.modelLabel = modelConfig.modelAssociationLabel;
                changed = true;
            }
            if (options.imageDisplayEnabled === undefined) {
                options.imageDisplayEnabled = false;
                changed = true;
            }
            if (options.htmlDisplayEnabled === undefined) {
                options.htmlDisplayEnabled = false;
                changed = true;
            }
            if (!options.imageWidth) {
                options.imageWidth = "80px";
                changed = true;
            }
            if (!options.imageHeight) {
                options.imageHeight = "100px";
                changed = true;
            }

            return changed;
        },

        normalizeHtmlDisplayWidget(widget) {
            if (!widget || !["ml-text", "ml-pivot-table"].includes(widget.type)) {
                return false;
            }
            const options = widget.options || (widget.options = {});
            let changed = false;
            if (options.htmlDisplayEnabled === undefined) {
                options.htmlDisplayEnabled = false;
                changed = true;
            }
            if (widget.type === "ml-text" && options.onFormDataReady === undefined) {
                options.onFormDataReady = "";
                changed = true;
            }
            return changed;
        },

        normalizeReportFieldWidgets(reloadDesigner = true) {
            const formJson = this.$refs.vfDesigner?.getFormJson?.();
            if (!formJson?.widgetList) {
                return false;
            }
            let changed = false;
            const visit = (widgetList = []) => {
                widgetList.forEach((widget) => {
                    if (!widget) return;
                    if (widget.type === "table") {
                        const tableDefaults = this.nativeTableCompactDefaultsReady
                            ? COMPACT_REPORT_TABLE_CONFIG
                            : LEGACY_REPORT_TABLE_CONFIG;
                        if (ensureNativeReportTableConfig(widget, tableDefaults)) {
                            changed = true;
                        }
                        syncNativeTableEmptyText(widget);
                    }
                    if (this.normalizeSingleReportField(widget)) {
                        changed = true;
                    }
                    if (this.normalizeHtmlDisplayWidget(widget)) {
                        changed = true;
                    }
                    if (Array.isArray(widget.widgetList)) visit(widget.widgetList);
                    if (Array.isArray(widget.cols)) widget.cols.forEach((col) => visit(col.widgetList || []));
                    if (Array.isArray(widget.rows)) widget.rows.forEach((row) => (row.cols || []).forEach((cell) => visit(cell.widgetList || [])));
                    if (Array.isArray(widget.tabs)) widget.tabs.forEach((tab) => visit(tab.widgetList || []));
                });
            };
            visit(formJson.widgetList);

            if (changed && reloadDesigner) {
                this.normalizingReportFields = true;
                this.$refs.vfDesigner?.setFormJson?.(formJson);
                this.syncAllLoopContainerDisplayNames(false);
                this.$nextTick(() => {
                    this.normalizingReportFields = false;
                    this.syncUsedFields();
                    this.applyNativeTableStyles(formJson);
                });
            } else {
                this.$nextTick(() => this.applyNativeTableStyles(formJson));
            }

            return changed;
        },

        normalizeLoopContainerWidgets(reloadDesigner = true) {
            const formJson = this.$refs.vfDesigner?.getFormJson?.();
            if (!formJson?.widgetList) {
                return false;
            }
            let changed = false;
            const visit = (widgetList = []) => {
                widgetList.forEach((widget) => {
                    if (!widget) return;
                    if (widget.type === "loop-container") {
                        const options = widget.options || (widget.options = {});
                        if (options.modelAssociationId === undefined) {
                            options.modelAssociationId = "";
                            changed = true;
                        }
                        if (options.displayName === undefined) {
                            options.displayName = "";
                            changed = true;
                        }
                    }
                    if (Array.isArray(widget.widgetList)) visit(widget.widgetList);
                    if (Array.isArray(widget.cols)) widget.cols.forEach((col) => visit(col.widgetList || []));
                    if (Array.isArray(widget.rows)) widget.rows.forEach((row) => (row.cols || []).forEach((cell) => visit(cell.widgetList || [])));
                    if (Array.isArray(widget.tabs)) widget.tabs.forEach((tab) => visit(tab.widgetList || []));
                });
            };
            visit(formJson.widgetList);
            if (changed && reloadDesigner) {
                this.$refs.vfDesigner?.setFormJson?.(formJson);
            }
            return changed;
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
			let res2 = await http.post("/plugins/metaDataWarehouse/outerData/modelReport/queryById", null, {
                params: {
                    entityId: this.dataModelReportId,
                    fieldNames: "reportConfig,modelConfig",
                },
            });
			if (res2?.code == 200) {
                this.modelConfigList = this.parseModelConfig(res2.data?.modelConfig);
                await this.refreshMetaFields();
				try {
					let config = typeof res2.data?.reportConfig === "string" ? JSON.parse(res2.data.reportConfig) : res2.data?.reportConfig;
					if (config) {
                        config.formConfig = config.formConfig || {};
                        config.formConfig.reportGeneral = {
                            horizontalMargin: 0,
                            ...(config.formConfig.reportGeneral || {}),
                        };
                        normalizeReportWidgetCustomClasses(config.widgetList || []);
                        this.$refs.vfDesigner.setFormJson(config);
                        this.normalizeLoopContainerWidgets();
                        const normalized = this.normalizeReportFieldWidgets();
                        this.syncAllLoopContainerDisplayNames();
                        if (!normalized) {
                            this.syncUsedFields();
                        }
					}
				} catch (e) {
					console.error("reportConfig parse error", e);
				}
			}
            this.nativeTableCompactDefaultsReady = true;
            this.pageLoading = false;
        },

        async saveDesign() {
			let formJson = this.$refs.vfDesigner.getFormJson();
			if (!formJson) return;
			const footerValidationMessage = this.validatePageFooterContainers(formJson.widgetList || []);
			if (footerValidationMessage) {
				ElMessage.warning(footerValidationMessage);
				return;
			}
			this.pageLoading = true;
			let res = await http.post("/plugins/metaDataWarehouse/outerData/modelReport/saveRecord", {
				reportConfig: JSON.stringify(formJson),
				modelConfig: JSON.stringify(this.getCleanModelConfig()),
			}, {
                params: {
                    entity: "DataModelReport",
                    id: this.dataModelReportId,
                },
			});
			if (res?.code == 200) {
				ElMessage.success("保存成功");
			}
            this.pageLoading = false;
        },

		validatePageFooterContainers(widgetList = []) {
			const allowedChildTypes = new Set([
				'grid', 'table', 'page-number', 'ml-text', 'report-field',
				'static-text', 'html-text', 'divider',
			]);
			const visitFooterChildren = (children = []) => {
				for (const child of children) {
					if (!allowedChildTypes.has(child?.type)) {
						return `页脚容器不支持「${child?.displayName || child?.options?.label || child?.type || '未知组件'}」`;
					}
					const nestedLists = [
						child?.widgetList,
						...(child?.cols || []).map((col) => col?.widgetList),
						...(child?.rows || []).flatMap((row) => (row?.cols || []).map((col) => col?.widgetList)),
					];
					for (const nestedList of nestedLists) {
						const message = visitFooterChildren(nestedList || []);
						if (message) return message;
					}
				}
				return '';
			};
			const visit = (children = [], insideContainer = false) => {
				for (const child of children) {
					if (child?.type === 'page-footer-container') {
						if (insideContainer) return '页脚容器只能放在报表画布最外层';
						const message = visitFooterChildren(child.widgetList || []);
						if (message) return message;
					}
					const nestedLists = [
						child?.widgetList,
						...(child?.cols || []).map((col) => col?.widgetList),
						...(child?.rows || []).flatMap((row) => (row?.cols || []).map((col) => col?.widgetList)),
						...(child?.tabs || []).map((tab) => tab?.widgetList),
					];
					for (const nestedList of nestedLists) {
						const message = visit(nestedList || [], true);
						if (message) return message;
					}
				}
				return '';
			};
			return visit(widgetList, false);
		},

        openModelAssociationEdit() {
            this.$refs.modelAssociationEditRef?.openDialog({
                subModelId: "",
                subModelName: "",
                existingDataCodes: this.modelConfigList.map((item) => item.dataCode),
            });
        },

        handleMetadataModelEdit(group) {
            const config = this.modelConfigList.find((item) => item.dataCode === group?.dataCode);
            if (!config) return;
            this.$refs.modelAssociationEditRef?.openDialog({
                ...config,
                editId: config.dataCode,
                editLabel: config.modelAssociationLabel,
                existingDataCodes: this.modelConfigList.map((item) => item.dataCode),
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

        handleMetadataModelView(group) {
            const code = this.buildModelFieldMappingCode(group);
            if (!code) {
                ElMessage.warning("当前数据模型暂无可查看字段");
                return;
            }
            this.fieldMappingDialogTitle = `${group?.entityLabel || group?.dataCode || "数据模型"} 字段映射`;
            this.fieldMappingCode = code;
            this.fieldMappingDialogVisible = true;
        },

        buildModelFieldMappingCode(group) {
            const fieldList = Array.isArray(group?.fieldList) ? group.fieldList : [];
            if (!fieldList.length) {
                return "";
            }
            const lines = fieldList.map((field) => {
                const name = String(field?.name || "");
                const comment = this.escapeFieldMappingComment(field?.label || field?.name || "");
                return `  //${comment}\n  "${name}": ""`;
            });
            return `{\n${lines.join(",\n")}\n}`;
        },

        escapeFieldMappingComment(label) {
            return String(label).replace(/\r?\n/g, " ");
        },

        copyFieldMappingCode() {
            if (!this.fieldMappingCode) {
                ElMessage.warning("暂无可复制内容");
                return;
            }
            copyText(this.fieldMappingCode, "复制失败");
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
                    if (widget.type === "loop-container" && widget.options?.modelAssociationId === dataCode) {
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
                        const matchedByCode = options.modelAssociationId === config.dataCode
                            || childBound === config.dataCode
                            || options.name === config.dataCode;
                        const matchedByLabel = options.name === config.modelAssociationLabel
                            || options.displayName === config.modelAssociationLabel
                            || (oldConfig && (
                                options.name === oldConfig.modelAssociationLabel
                                || options.displayName === oldConfig.modelAssociationLabel
                            ));
                        if (matchedByCode || matchedByLabel) {
                            options.displayName = config.modelAssociationLabel;
                            options.modelAssociationId = config.dataCode;
                            if (
                                options.name === config.modelAssociationLabel
                                || options.name === oldConfig?.modelAssociationLabel
                                || options.name === config.dataCode
                            ) {
                                options.name = config.dataCode;
                            }
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
            const name = this.composeReportFieldPath(config.dataCode, fieldName);
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
                    keyNameEnabled: true,
                    keyName: name,
                    bindingPath: name,
                    modelLabel: config.modelAssociationLabel,
                    label: fieldLabel,
                    modelName,
                    outerDataModelId: config.mainModel,
                    modelAssociationId: config.dataCode,
                    isArray,
                    textAlign: 'left',
                    fontSize: '',
                    fontStyle: 'normal',
                    fontWeight: 'normal',
                    htmlDisplayEnabled: false,
                    imageDisplayEnabled: false,
                    imageWidth: '80px',
                    imageHeight: '100px',
                    onCreated: '',
                    onMounted: '',
                    onFormDataReady: '',
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

:deep(#tab-3),
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

.field-mapping-dialog__toolbar {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 8px;
}

.field-mapping-dialog__code {
    margin: 0;
    padding: 14px 16px;
    max-height: 420px;
    overflow: auto;
    border: 1px solid #e4e7ed;
    border-radius: 8px;
    background: #f8fafc;
    color: #1f2937;
    font-size: 13px;
    line-height: 1.7;
    white-space: pre-wrap;
    word-break: break-all;
    box-sizing: border-box;
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
