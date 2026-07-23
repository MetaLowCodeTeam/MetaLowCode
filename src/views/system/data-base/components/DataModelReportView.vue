<template>
    <div class="report-view" v-loading="loading">
        <div class="report-actions">
            <el-button type="primary" :loading="exportLoading" @click="downloadWord">下载 Word</el-button>
            <el-button type="primary" :loading="exportLoading" @click="downloadPdf" style="margin-left: 10px">导出 PDF</el-button>
        </div>
        <div class="report-content" ref="reportContentRef" v-if="showForm">
            <v-form-render
                ref="vFormRef"
                :global-dsv="globalDsv"
                :responsive-layout-disabled="true"
            />
        </div>
    </div>
</template>

<script>
import { ElMessage } from "element-plus";
import { queryById } from "@/api/crud";
import http from "@/utils/request";
import { downloadBase64, globalDsvDefaultData } from "@/utils/util";

export default {
    name: "DataModelReportView",
    data() {
        return {
            loading: false,
            exportLoading: false,
            showForm: false,
            globalDsv: {
                ...globalDsvDefaultData(),
                formStatus: 'read',
            },
        };
    },
    mounted() {
        document.body.classList.add("data-model-report-view-page");
        this.loadData();
    },
    beforeUnmount() {
        document.body.classList.remove("data-model-report-view-page");
    },
    methods: {
        async loadData() {
            this.loading = true;
            let dataModelReportId = this.$route.query.dataModelReportId;
            let mainModelDataId = this.$route.query.mainModelDataId;
            if (!dataModelReportId) {
                ElMessage.error("参数缺失");
                this.loading = false;
                return;
            }
            this.globalDsv.mainModelDataId = mainModelDataId || "";
            let res = await queryById(dataModelReportId, "reportConfig");
            if (res?.code == 200 && res.data) {
                let reportConfig = res.data.reportConfig;
                if (reportConfig) {
                    let config = typeof reportConfig === "string" ? JSON.parse(reportConfig) : reportConfig;
                    this.showForm = true;
                    await this.$nextTick();
                    this.$refs.vFormRef?.setFormJson(config);
                    await this.loadModelData(dataModelReportId, mainModelDataId, config);
                } else {
                    ElMessage.warning("该记录暂无报表配置");
                }
            }
            this.loading = false;
        },
        async loadModelData(dataModelReportId, mainModelDataId, formConfig) {
            let res = await http.post("/plugins/metaDataWarehouse/outerData/modelReport/queryModelDataFromReportById", null, {
                params: {
                    queryModelDataBodyListId: mainModelDataId,
                }
            });
            if (res?.code == 200 && res.data) {
                const formData = this.buildReportFormData(formConfig.widgetList, res.data);
                this.fillReportChartData(formConfig.widgetList, formData);
                this.globalDsv.__reportFormData = formData;
                const formRef = this.$refs.vFormRef;
                formRef?.setFormJson(formConfig);
                await this.$nextTick();
                if (formRef?.formDataModel) {
                    Object.keys(formData).forEach((key) => {
                        formRef.formDataModel[key] = formData[key];
                    });
                }
                formRef?.setFormData(formData, true);
                await this.$nextTick();
                await this.$nextTick();
                this.reloadReportFieldRefs(formData);
                setTimeout(() => {
                    this.reloadReportFieldRefs(formData);
                }, 50);
            }
        },

        reloadReportFieldRefs(formData) {
            const formRef = this.$refs.vFormRef;
            const refList = formRef?.widgetRefList || formRef?.refList || {};
            Object.keys(refList).forEach((refName) => {
                const ref = refList[refName];
                if (ref?.field?.type === "report-field" && typeof ref.reloadReportFieldValue === "function") {
                    ref.reloadReportFieldValue(formData);
                }
                if (ref?.field?.type === "ml-bar-chart" && typeof ref.reloadReportChartData === "function") {
                    ref.reloadReportChartData(formData);
                }
            });
        },

        async downloadWord() {
            if (!this.showForm) {
                ElMessage.warning("暂无可下载内容");
                return;
            }
            this.exportLoading = true;
            try {
                await this.$nextTick();
                const html = this.getExportHtml();
                const fileName = "测试.docx";
                const res = await http.post("/htmlToWord/export", {
                    fileName,
                    html,
                });
                const fileData = this.resolveExportFileData(res);
                const base64 = fileData.base64;
                const downloadName = fileData.fileName || fileName;
                const contentType = fileData.contentType || "";
                if (!base64) {
                    ElMessage.error("导出失败，未返回文件内容");
                    return;
                }
                await downloadBase64(base64, downloadName, contentType);
            } finally {
                this.exportLoading = false;
            }
        },

        async downloadPdf() {
            if (!this.showForm) {
                ElMessage.warning("暂无可下载内容");
                return;
            }
            this.exportLoading = true;
            try {
                await this.$nextTick();
                const html = this.getExportHtml();
                const fileName = "测试.pdf";
                const res = await http.post("/htmlToWord/exportPdf", {
                    fileName,
                    html,
                });
                const fileData = this.resolveExportFileData(res);
                const base64 = fileData.base64;
                const downloadName = fileData.fileName || fileName;
                const contentType = fileData.contentType || "";
                if (!base64) {
                    ElMessage.error("导出失败，未返回文件内容");
                    return;
                }
                await downloadBase64(base64, downloadName, contentType);
            } finally {
                this.exportLoading = false;
            }
        },

        resolveExportFileData(res) {
            const candidates = [
                res?.data,
                res?.data?.data,
                res,
            ].filter(Boolean);
            for (const item of candidates) {
                if (typeof item === "string") {
                    return { base64: item };
                }
                if (item && typeof item === "object") {
                    if (typeof item.base64 === "string") {
                        return item;
                    }
                    if (typeof item.fileContent === "string") {
                        return {
                            ...item,
                            base64: item.fileContent,
                        };
                    }
                    if (typeof item.content === "string") {
                        return {
                            ...item,
                            base64: item.content,
                        };
                    }
                }
            }
            return {};
        },

        getExportHtml() {
            const contentEl = this.$refs.reportContentRef || this.$el.querySelector(".report-content");
            const contentHtml = contentEl?.outerHTML || "";
            const styles = Array.from(document.querySelectorAll("style, link[rel='stylesheet']"))
                .map((styleEl) => styleEl.outerHTML)
                .join("");
            return `<!DOCTYPE html><html><head><meta charset="utf-8">${styles}</head><body>${contentHtml}</body></html>`;
        },

        buildReportFormData(widgetList, reportData) {
            const formData = this.cloneReportDataByModelCode(reportData);
            const visit = (list, loopStack = []) => {
                if (!Array.isArray(list)) return;
                list.forEach((item) => {
                    if (!item) return;
                    const currentLoopStack = this.getCurrentLoopStack(item, loopStack, reportData);
                    if (item.type === "report-field") {
                        this.fillReportFieldData(formData, item, currentLoopStack, reportData);
                    }
                    if (item.widgetList) visit(item.widgetList, currentLoopStack);
                    if (item.cols) item.cols.forEach((col) => visit(col.widgetList, currentLoopStack));
                    if (item.rows) item.rows.forEach((row) => (row.cols || []).forEach((col) => visit(col.widgetList, currentLoopStack)));
                    if (item.tabs) item.tabs.forEach((tab) => visit(tab.widgetList, currentLoopStack));
                });
            };
            visit(widgetList);
            return formData;
        },

        fillReportChartData(widgetList, formData) {
            const visit = (list) => {
                if (!Array.isArray(list)) return;
                list.forEach((item) => {
                    if (!item) return;
                    if (item.type === "ml-bar-chart") {
                        const chartData = this.buildBarChartData(item, formData);
                        if (chartData) {
                            item.options = item.options || {};
                            item.options.chartData = chartData;
                            item.options.barChartConfig = item.options.barChartConfig || {};
                            item.options.barChartConfig.chartData = chartData;
                        }
                    }
                    if (item.widgetList) visit(item.widgetList);
                    if (item.cols) item.cols.forEach((col) => visit(col.widgetList));
                    if (item.rows) item.rows.forEach((row) => (row.cols || []).forEach((col) => visit(col.widgetList)));
                    if (item.tabs) item.tabs.forEach((tab) => visit(tab.widgetList));
                });
            };
            visit(widgetList);
        },

        buildBarChartData(chartWidget, formData) {
            const chartConfig = chartWidget.options?.barChartConfig || {};
            const setDimensional = chartConfig.setDimensional || chartWidget.options?.setDimensional || {};
            const dimensions = setDimensional.dimension || [];
            const metrics = setDimensional.metrics || [];
            if (!dimensions.length || !metrics.length) {
                return null;
            }
            const modelCode = this.getChartFieldModelCode(dimensions[0], formData)
                || this.getChartFieldModelCode(metrics[0], formData)
                || chartWidget.options?.modelAssociationId
                || "";
            const sourceData = modelCode ? formData?.[modelCode] : formData;
            const rows = Array.isArray(sourceData) ? sourceData : (sourceData && typeof sourceData === "object" ? [sourceData] : []);
            if (!rows.length) {
                return { xAxis: [], yAxis: metrics.map((metric) => this.getChartFieldAlias(metric)), series: [] };
            }

            const groupMap = new Map();
            rows.forEach((row) => {
                const groupName = dimensions.map((dimension) => {
                    const value = row?.[this.getChartFieldName(dimension, modelCode)];
                    return value === undefined || value === null || value === "" ? "空" : String(value);
                }).join(" / ") || "空";
                if (!groupMap.has(groupName)) {
                    groupMap.set(groupName, metrics.map(() => this.createChartMetricAggregator()));
                }
                const metricAggregators = groupMap.get(groupName);
                metrics.forEach((metric, metricIndex) => {
                    const value = row?.[this.getChartFieldName(metric, modelCode)];
                    this.collectChartMetricValue(metricAggregators[metricIndex], value, metric.calcMode || "count");
                });
            });

            const xAxis = Array.from(groupMap.keys());
            return {
                xAxis,
                yAxis: metrics.map((metric) => this.getChartFieldAlias(metric)),
                series: metrics.map((metric, metricIndex) => ({
                    name: this.getChartFieldAlias(metric),
                    data: xAxis.map((name) => this.getChartMetricResult(groupMap.get(name)[metricIndex], metric.calcMode || "count")),
                })),
            };
        },

        createChartMetricAggregator() {
            return {
                value: 0,
                count: 0,
                numberCount: 0,
                values: [],
            };
        },

        collectChartMetricValue(target, rawValue, calcMode) {
            const hasValue = rawValue !== undefined && rawValue !== null && rawValue !== "";
            if (hasValue) {
                target.count += 1;
                target.values.push(rawValue);
            }
            if (calcMode === "sum" || calcMode === "average" || calcMode === "max" || calcMode === "min") {
                const numberValue = Number(rawValue);
                if (!Number.isNaN(numberValue)) {
                    target.numberCount += 1;
                    if (calcMode === "max") {
                        target.value = target.numberCount === 1 ? numberValue : Math.max(target.value, numberValue);
                    } else if (calcMode === "min") {
                        target.value = target.numberCount === 1 ? numberValue : Math.min(target.value, numberValue);
                    } else {
                        target.value += numberValue;
                    }
                }
            }
        },

        getChartMetricResult(target, calcMode) {
            if (calcMode === "count") {
                return target.count;
            }
            if (calcMode === "countSet") {
                return new Set(target.values.map((value) => String(value))).size;
            }
            if (calcMode === "average") {
                return target.numberCount ? target.value / target.numberCount : 0;
            }
            return target.value;
        },

        getChartFieldModelCode(field, formData) {
            const names = [
                field?.options?.modelAssociationId,
                field?.modelAssociationId,
                field?.dataCode,
                field?.metaModelName,
                field?.name,
                field?.options?.name,
            ].filter(Boolean);
            for (const name of names) {
                if (formData?.[name] !== undefined) {
                    return name;
                }
                if (name.includes(".")) {
                    const modelCode = name.slice(0, name.indexOf("."));
                    if (formData?.[modelCode] !== undefined) {
                        return modelCode;
                    }
                }
            }
            return "";
        },

        getChartFieldName(field, modelCode) {
            const names = [field?.name, field?.options?.name, field?.fieldName].filter(Boolean);
            for (const name of names) {
                if (modelCode && name.startsWith(modelCode + ".")) {
                    return name.slice(modelCode.length + 1);
                }
            }
            const dottedName = names.find((name) => name.includes("."));
            if (dottedName) {
                return dottedName.slice(dottedName.lastIndexOf(".") + 1);
            }
            return names[0] || "";
        },

        getChartFieldAlias(field) {
            return field?.alias || field?.fieldLabel || field?.label || field?.displayName || field?.fieldName || field?.name || "指标";
        },

        cloneReportDataByModelCode(reportData) {
            const formData = {};
            Object.keys(reportData || {}).forEach((key) => {
                const value = reportData[key];
                if (Array.isArray(value)) {
                    formData[key] = value.map((row) => ({ ...(row || {}) }));
                } else if (value && typeof value === "object") {
                    formData[key] = { ...value };
                } else {
                    formData[key] = value;
                }
            });
            return formData;
        },

        getCurrentLoopStack(item, loopStack, reportData) {
            if (item.type !== "loop-container") {
                return loopStack;
            }
            const loopCode = item.options?.modelAssociationId || item.options?.name || this.findLoopReportField(item.widgetList)?.options?.modelAssociationId;
            if (loopCode && Array.isArray(reportData?.[loopCode])) {
                return [...loopStack, loopCode];
            }
            return loopStack;
        },

        fillReportFieldData(formData, item, loopStack, reportData) {
            const widgetKey = item.options?.name;
            const modelCode = item.options?.modelAssociationId || item.dataCode || this.getModelCodeFromFieldName(item.name);
            const fieldName = this.getReportDataFieldName(item, modelCode);
            if (!widgetKey || !fieldName) return;

            const sourceData = modelCode ? reportData?.[modelCode] : reportData;
            if (Array.isArray(sourceData)) {
                this.setArrayModelField(formData, modelCode, sourceData, widgetKey, fieldName);
                this.setArrayFieldPlainValue(formData, sourceData, widgetKey, fieldName);
                return;
            }

            const value = sourceData && typeof sourceData === "object" ? sourceData[fieldName] : reportData?.[fieldName];
            if (value !== undefined) {
                formData[widgetKey] = value;
            }

            loopStack.forEach((loopCode) => {
                const loopRows = reportData?.[loopCode];
                if (!Array.isArray(loopRows)) return;
                if (!Array.isArray(formData[loopCode])) {
                    formData[loopCode] = loopRows.map(() => ({}));
                }
                loopRows.forEach((row, rowIndex) => {
                    formData[loopCode][rowIndex][widgetKey] = value ?? null;
                });
            });
        },

        setArrayModelField(formData, modelCode, sourceRows, widgetKey, fieldName) {
            if (!modelCode) return;
            if (!Array.isArray(formData[modelCode])) {
                formData[modelCode] = sourceRows.map(() => ({}));
            }
            sourceRows.forEach((row, rowIndex) => {
                formData[modelCode][rowIndex][widgetKey] = row?.[fieldName] ?? null;
            });
        },

        setArrayFieldPlainValue(formData, sourceRows, widgetKey, fieldName) {
            if (!Array.isArray(sourceRows) || !sourceRows.length) {
                formData[widgetKey] = null;
                return;
            }
            formData[widgetKey] = sourceRows[0]?.[fieldName] ?? null;
        },

        getReportDataFieldName(item, modelCode) {
            if (item.name && modelCode) {
                const prefix = modelCode + ".";
                if (item.name.startsWith(prefix)) {
                    return item.name.slice(prefix.length);
                }
            }
            if (item.name && item.name.includes(".")) {
                return item.name.slice(item.name.lastIndexOf(".") + 1);
            }
            const optionName = item.options?.name || "";
            if (modelCode && optionName.startsWith(modelCode + ".")) {
                return optionName.slice(modelCode.length + 1);
            }
            return item.name || optionName;
        },

        getModelCodeFromFieldName(fieldName) {
            if (!fieldName || !fieldName.includes(".")) return "";
            return fieldName.slice(0, fieldName.indexOf("."));
        },
        findLoopReportField(list) {
            if (!Array.isArray(list)) {
                return null;
            }
            for (const item of list) {
                if (!item) {
                    continue;
                }
                if (item.type === "report-field" && item.options?.modelAssociationId) {
                    return item;
                }
                const childLists = [item.widgetList];
                if (Array.isArray(item.cols)) {
                    item.cols.forEach((col) => childLists.push(col.widgetList));
                }
                if (Array.isArray(item.rows)) {
                    item.rows.forEach((row) => (row.cols || []).forEach((col) => childLists.push(col.widgetList)));
                }
                if (Array.isArray(item.tabs)) {
                    item.tabs.forEach((tab) => childLists.push(tab.widgetList));
                }
                for (const children of childLists) {
                    const found = this.findLoopReportField(children);
                    if (found) {
                        return found;
                    }
                }
            }
            return null;
        },
    },
};
</script>

<style scoped lang="scss">
.report-view {
    position: relative;
    padding: 20px;
    background: #fff;
    min-height: 100%;
    height: auto;
    overflow: visible;
    box-sizing: border-box;

    .report-actions {
        position: fixed;
        top: 16px;
        right: 20px;
        z-index: 1000;
    }

    .report-content {
        max-width: 1000px;
        margin: 0 auto;
        background: #fff;
    }

    :deep(.el-form),
    :deep(.container-wrapper),
    :deep(.loop-container),
    :deep(.loop-container-row) {
        background: #fff;
    }

    :deep(.container-wrapper),
    :deep(.loop-container-row) {
        display: flow-root;
        min-height: 1px;
    }
}
</style>

<style lang="scss">
body.data-model-report-view-page,
body.data-model-report-view-page #app,
body.data-model-report-view-page .aminui {
    min-height: 100%;
    height: auto;
    background: #fff !important;
}
</style>
