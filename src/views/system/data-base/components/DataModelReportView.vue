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
            try {
                let dataModelReportId = this.$route.query.dataModelReportId;
                let mainModelDataId = this.$route.query.mainModelDataId;
                if (!dataModelReportId) {
                    ElMessage.error("参数缺失");
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
                        await this.loadModelData(mainModelDataId, config);
                    } else {
                        ElMessage.warning("该记录暂无报表配置");
                    }
                }
            } catch (error) {
                console.error("报表加载失败", error);
                ElMessage.error(error?.message || "报表加载失败");
            } finally {
                this.loading = false;
            }
        },
        async loadModelData(mainModelDataId, reportConfig) {
            let res = await http.post("/plugins/metaDataWarehouse/outerData/modelReport/queryModelDataFromReportById", null, {
                params: {
                    queryModelDataBodyListId: mainModelDataId,
                }
            });
            if (res?.code == 200 && res.data) {
                const reportData = await this.handleReportDataLoaded(res.data, reportConfig);
                this.globalDsv.__reportFormData = reportData;
                const formRef = this.$refs.vFormRef;
                formRef?.setFormData(reportData, true);
            }
        },

        async handleReportDataLoaded(reportData, reportConfig) {
            const eventCode = reportConfig?.formConfig?.onReportDataLoaded;
            if (!eventCode) {
                return reportData;
            }
            const eventHandler = new Function("reportData", eventCode);
            const result = await eventHandler.call(this.$refs.vFormRef, reportData);
            if (result === undefined) {
                return reportData;
            }
            if (!result || typeof result !== "object") {
                throw new Error("数据加载完成事件必须返回对象或 Promise<Object>");
            }
            return result;
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
                const res = await http.post("/plugins/metaDataWarehouse/htmlToWord/export", {
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
                const res = await http.post("/plugins/metaDataWarehouse/htmlToWord/exportPdf", {
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
            const exportContentEl = contentEl?.cloneNode(true);
            this.prepareExportContentWidth(exportContentEl);
            this.transformGridToExportTables(exportContentEl);
            const contentHtml = exportContentEl?.outerHTML || "";
            console.info("[DataModelReportView] export html prepared", {
                layoutTableCount: exportContentEl?.querySelectorAll?.("table.word-export-layout-table").length || 0,
                markerCount: (contentHtml.match(/__META_WORD_LAYOUT_TABLE__/g) || []).length,
                htmlLength: contentHtml.length,
            });
            const styles = Array.from(document.querySelectorAll("style, link[rel='stylesheet']"))
                .map((styleEl) => styleEl.outerHTML)
                .join("");
            const exportStyles = this.getWordExportStyle();
            return `<!DOCTYPE html><html><head><meta charset="utf-8">${styles}${exportStyles}</head><body>${contentHtml}</body></html>`;
        },

        prepareExportContentWidth(rootEl) {
            if (!rootEl) return;
            rootEl.style.width = "960px";
            rootEl.style.maxWidth = "960px";
            rootEl.style.margin = "0 auto";
            rootEl.style.boxSizing = "border-box";
        },

        getWordExportStyle() {
            return `<style data-front-word-export="true">
                .report-content { width: 960px !important; max-width: 960px !important; }
                table.word-export-layout-table,
                table.word-export-layout-table > tbody > tr,
                table.word-export-layout-table > tbody > tr > td {
                    border: 0 none transparent !important;
                    outline: 0 none transparent !important;
                    background: transparent !important;
                }
                table.word-export-layout-table {
                    width: 100% !important;
                    max-width: 100% !important;
                    border-collapse: collapse !important;
                    border-spacing: 0 !important;
                    table-layout: fixed !important;
                }
                table.word-export-layout-table > tbody > tr > td {
                    padding: 0 !important;
                    vertical-align: top !important;
                    box-sizing: border-box !important;
                }
                table.word-export-layout-table table,
                table.word-export-layout-table img,
                table.word-export-layout-table canvas,
                table.word-export-layout-table svg { max-width: 100% !important; }
            </style>`;
        },

        transformGridToExportTables(rootEl) {
            if (!rootEl) return;
            const gridList = Array.from(rootEl.querySelectorAll(".grid-container"));
            gridList.forEach((gridEl) => {
                const colList = Array.from(gridEl.children).filter((child) => child.classList?.contains("grid-cell"));
                if (!colList.length) return;

                const tableEl = document.createElement("table");
                tableEl.className = "word-export-layout-table";
                tableEl.setAttribute("data-word-layout-table", "true");
                tableEl.setAttribute("border", "0");
                tableEl.setAttribute("cellpadding", "0");
                tableEl.setAttribute("cellspacing", "0");
                tableEl.style.width = "100%";
                tableEl.style.maxWidth = "100%";
                tableEl.style.border = "0 none transparent";
                tableEl.style.borderCollapse = "collapse";
                tableEl.style.borderSpacing = "0";
                tableEl.style.tableLayout = "fixed";

                const tbodyEl = document.createElement("tbody");
                const rowEl = document.createElement("tr");

                colList.forEach((colEl) => {
                    const cellEl = document.createElement("td");
                    const span = this.getGridColSpan(colEl);
                    const rawWidthPercent = span ? (span / 24) * 100 : 100 / colList.length;
                    const widthPercent = colList.length > 1 ? Math.max(rawWidthPercent - 1, 1) : rawWidthPercent;
                    cellEl.style.width = `${widthPercent}%`;
                    cellEl.style.verticalAlign = "top";
                    cellEl.style.padding = "0";
                    cellEl.style.border = "0 none transparent";
                    cellEl.style.boxSizing = "border-box";
                    if (!rowEl.children.length) {
                        const markerEl = document.createElement("span");
                        markerEl.textContent = "__META_WORD_LAYOUT_TABLE__";
                        markerEl.style.fontSize = "1px";
                        markerEl.style.color = "transparent";
                        markerEl.style.lineHeight = "1px";
                        cellEl.appendChild(markerEl);
                    }
                    while (colEl.firstChild) {
                        cellEl.appendChild(colEl.firstChild);
                    }
                    rowEl.appendChild(cellEl);
                });

                tbodyEl.appendChild(rowEl);
                tableEl.appendChild(tbodyEl);
                gridEl.replaceWith(tableEl);
            });
        },

        getGridColSpan(colEl) {
            const className = colEl?.className || "";
            const spanClass = String(className).match(/\bel-col-(\d+)\b/);
            if (spanClass) {
                return Number(spanClass[1]);
            }
            const maxWidth = colEl?.style?.maxWidth || colEl?.style?.width || "";
            const widthMatch = maxWidth.match(/^([\d.]+)%$/);
            if (widthMatch) {
                return Math.round((Number(widthMatch[1]) / 100) * 24);
            }
            return 0;
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
