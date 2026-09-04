<template>
    <div class="report-view" v-loading="loading">
        <header class="report-toolbar" data-export-ignore>
            <div class="report-toolbar__title">
                <el-icon class="report-toolbar__icon"><Document /></el-icon>
                <div>
                    <div class="report-toolbar__name">{{ reportFileName }}</div>
                    <div class="report-toolbar__meta">A4 {{ landscape ? "横版" : "竖版" }}预览</div>
                </div>
            </div>
            <div class="report-toolbar__actions">
<!--                <span class="report-toolbar__label">页面方向</span>-->
<!--                <el-radio-group-->
<!--                    v-model="landscape"-->
<!--                    size="small"-->
<!--                    :disabled="exportLoading"-->
<!--                    @change="handleLandscapeChange"-->
<!--                >-->
<!--                    <el-radio-button :label="false">竖版</el-radio-button>-->
<!--                    <el-radio-button :label="true">横版</el-radio-button>-->
<!--                </el-radio-group>-->
                <el-button
                    type="primary"
                    :icon="Download"
                    :loading="exportLoading"
                    @click="downloadWord"
                >
                    下载 Word
                </el-button>
                <el-button
                    type="primary"
                    plain
                    :icon="Tickets"
                    :loading="exportLoading"
                    @click="downloadPdf"
                >
                    导出 PDF
                </el-button>
            </div>
        </header>
        <main class="report-stage" v-if="showForm">
            <section
                class="report-page"
                :class="landscape ? 'report-page--landscape' : 'report-page--portrait'"
            >
                <div
                    v-if="activeWatermarkConfig"
                    class="report-watermark"
                    :style="watermarkPreviewStyle"
                    aria-hidden="true"
                />
                <div
                    class="report-content"
                    ref="reportContentRef"
                    :style="reportContentStyle"
                >
                    <v-form-render
                        ref="vFormRef"
                        :global-dsv="globalDsv"
                        :responsive-layout-disabled="true"
                    />
                </div>
            </section>
        </main>
    </div>
</template>

<script>
import { ElMessage } from "element-plus";
import { Document, Download, Tickets } from "@element-plus/icons-vue";
import http from "@/utils/request";
import { queryById } from "@/api/crud";
import { downloadBase64, globalDsvDefaultData } from "@/utils/util";
import {
    applyAllNativeReportTableStyles,
    normalizeReportWidgetCustomClasses,
    REPORT_TABLE_SPACING_AFTER_PX,
} from "@/views/system/form-design/extension/report-table-style";

export default {
    name: "DataModelReportView",
    components: {
        Document,
        Download,
        Tickets,
    },
    setup() {
        return {
            Download,
            Tickets,
        };
    },
    computed: {
        reportHorizontalMargin() {
            const value = Number(this.reportGeneralConfig?.horizontalMargin);
            if (!Number.isFinite(value)) {
                return 0;
            }
            return Math.max(0, Math.min(200, Math.round(value)));
        },

        reportContentStyle() {
            const horizontalMargin = `${this.reportHorizontalMargin}px`;
            return {
                paddingLeft: horizontalMargin,
                paddingRight: horizontalMargin,
            };
        },

        activeWatermarkConfig() {
            const watermark = this.watermarkConfig;
            const value = String(watermark?.value || "").trim();
            if (!watermark || watermark.enabled === false || !value) {
                return null;
            }
            const clamp = (valueToClamp, min, max, fallback) => {
                const valueNumber = Number(valueToClamp);
                const normalized = Number.isFinite(valueNumber) ? valueNumber : fallback;
                return Math.max(min, Math.min(max, normalized));
            };
            return {
                ...watermark,
                enabled: true,
                value,
                fontColor: watermark.fontColor || "rgb(128,128,128)",
                opacity: clamp(watermark.opacity, 1, 100, 18),
                fontSize: clamp(watermark.fontSize, 12, 48, 16),
                rotationAngle: clamp(watermark.rotationAngle, -90, 90, -30),
                gapX: clamp(watermark.gapX, 40, 320, 120),
                gapY: clamp(watermark.gapY, 40, 260, 96),
            };
        },

        watermarkPreviewStyle() {
            const watermark = this.activeWatermarkConfig;
            if (!watermark) {
                return {};
            }
            const estimatedTextWidth = watermark.value.length * watermark.fontSize;
            const tileWidth = Math.max(watermark.gapX, estimatedTextWidth + watermark.fontSize * 2);
            const tileHeight = Math.max(watermark.gapY, watermark.fontSize * 4);
            const centerX = tileWidth / 2;
            const centerY = tileHeight / 2;
            const escapeXml = (value) => String(value)
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&apos;");
            const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${tileWidth}" height="${tileHeight}">
                <text x="${centerX}" y="${centerY}"
                    dominant-baseline="middle" text-anchor="middle"
                    fill="${escapeXml(watermark.fontColor)}"
                    fill-opacity="${watermark.opacity / 100}"
                    font-size="${watermark.fontSize}"
                    font-family="Arial, Microsoft YaHei, sans-serif"
                    transform="rotate(${watermark.rotationAngle} ${centerX} ${centerY})">${escapeXml(watermark.value)}</text>
            </svg>`;
            return {
                backgroundImage: `url("data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}")`,
                backgroundRepeat: "repeat",
                backgroundSize: `${tileWidth}px ${tileHeight}px`,
            };
        },
    },
    data() {
        return {
            loading: false,
            exportLoading: false,
            showForm: false,
            landscape: false,
            reportFileName: "数据模型报表",
            reportGeneralConfig: {
                horizontalMargin: 0,
            },
            watermarkConfig: null,
            globalDsv: {
                ...globalDsvDefaultData(),
                formStatus: 'read',
            },
        };
    },
    mounted() {
        this.initializeViewOptions();
        document.body.classList.add("data-model-report-view-page");
        this.loadData();
    },
    beforeUnmount() {
        document.body.classList.remove("data-model-report-view-page");
    },
    methods: {
        initializeViewOptions() {
            const routeFileName = Array.isArray(this.$route.query.fileName)
                ? this.$route.query.fileName[0]
                : this.$route.query.fileName;
            this.reportFileName = String(routeFileName || "数据模型报表")
                .trim()
                .replace(/\.(?:docx?|pdf)$/i, "") || "数据模型报表";

            const routeLandscape = Array.isArray(this.$route.query.landscape)
                ? this.$route.query.landscape[0]
                : this.$route.query.landscape;
            this.landscape = routeLandscape === true
                || String(routeLandscape).toLowerCase() === "true"
                || String(routeLandscape) === "1";
        },

        handleLandscapeChange(value) {
            this.landscape = value === true || String(value).toLowerCase() === "true";
            this.$router.replace({
                path: this.$route.path,
                query: {
                    ...this.$route.query,
                    landscape: this.landscape,
                },
            }).catch(() => {});
        },

        async loadData() {
            this.loading = true;
            this.reportGeneralConfig = {
                horizontalMargin: 0,
            };
            this.watermarkConfig = null;
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
                        this.reportGeneralConfig = {
                            horizontalMargin: config?.formConfig?.reportGeneral?.horizontalMargin ?? 0,
                        };
                        this.watermarkConfig = config?.formConfig?.watermark
                            ? { ...config.formConfig.watermark }
                            : null;
                        normalizeReportWidgetCustomClasses(config.widgetList || []);
                        this.showForm = true;
                        await this.$nextTick();
                        this.$refs.vFormRef?.setFormJson(config);
                        await this.$nextTick();
                        this.applyNativeTableStyles(config);
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
                await this.$nextTick();
                this.applyNativeTableStyles(reportConfig);
            }
        },

        applyNativeTableStyles(reportConfig) {
            applyAllNativeReportTableStyles(
                reportConfig?.widgetList || [],
                this.$refs.reportContentRef || this.$el
            );
        },

        async handleReportDataLoaded(reportData, reportConfig) {
            const eventCode = reportConfig?.formConfig?.onReportDataLoaded;
            if (!eventCode) {
                return reportData;
            }
            const eventHandler = new Function("reportData", eventCode);
            const eventContext = this.createReportEventContext(this.$refs.vFormRef);
            const result = await eventHandler.call(eventContext, reportData);
            if (result === undefined) {
                return reportData;
            }
            if (!result || typeof result !== "object") {
                throw new Error("数据加载完成事件必须返回对象或 Promise<Object>");
            }
            return result;
        },

        setReportWatermark(watermark) {
            const currentWatermark = this.watermarkConfig || {
                enabled: false,
                value: "",
                fontColor: "rgb(128,128,128)",
                opacity: 18,
                fontSize: 16,
                rotationAngle: -30,
                gapX: 120,
                gapY: 96,
            };
            let nextWatermark = typeof watermark === "string"
                ? {
                    value: watermark.trim(),
                    enabled: !!watermark.trim(),
                }
                : watermark;
            if (!nextWatermark || typeof nextWatermark !== "object" || Array.isArray(nextWatermark)) {
                throw new Error("水印配置必须是字符串或对象");
            }
            nextWatermark = { ...nextWatermark };
            if (
                nextWatermark.enabled === undefined
                && Object.prototype.hasOwnProperty.call(nextWatermark, "value")
            ) {
                nextWatermark.enabled = !!String(nextWatermark.value || "").trim();
            }
            this.watermarkConfig = {
                ...currentWatermark,
                ...nextWatermark,
            };
            return this.getReportWatermark();
        },

        getReportWatermark() {
            return this.watermarkConfig ? { ...this.watermarkConfig } : null;
        },

        clearReportWatermark() {
            return this.setReportWatermark({
                enabled: false,
                value: "",
            });
        },

        createReportEventContext(formRef) {
            const watermarkApi = {
                setReportWatermark: this.setReportWatermark.bind(this),
                getReportWatermark: this.getReportWatermark.bind(this),
                clearReportWatermark: this.clearReportWatermark.bind(this),
            };
            return new Proxy(formRef || {}, {
                get(target, property) {
                    if (Object.prototype.hasOwnProperty.call(watermarkApi, property)) {
                        return watermarkApi[property];
                    }
                    return Reflect.get(target, property, target);
                },
                has(target, property) {
                    return Object.prototype.hasOwnProperty.call(watermarkApi, property)
                        || Reflect.has(target, property);
                },
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
                const fileName = this.getExportFileName("docx");
                const res = await http.post("/plugins/metaDataWarehouse/htmlToWord/export", {
                    fileName,
                    html,
                    landscape: this.landscape,
                    horizontalMargin: this.reportHorizontalMargin,
                    watermark: this.activeWatermarkConfig,
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
                const fileName = this.getExportFileName("pdf");
                const res = await http.post("/plugins/metaDataWarehouse/htmlToWord/exportPdf", {
                    fileName,
                    html,
                    landscape: this.landscape,
                    horizontalMargin: this.reportHorizontalMargin,
                    watermark: this.activeWatermarkConfig,
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

        getExportFileName(extension) {
            return `${this.reportFileName}.${extension}`;
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
            const reportConfig = this.$refs.vFormRef?.getFormJson?.();
            this.applyNativeTableStyles(reportConfig);
            const contentEl = this.$refs.reportContentRef || this.$el.querySelector(".report-content");
            const exportContentEl = contentEl?.cloneNode(true);
            this.prepareExportContentWidth(exportContentEl);
            this.normalizeReportTableBordersForExport(exportContentEl);
            this.normalizeReportTableSpacingForExport(exportContentEl);
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
            const contentWidth = this.landscape ? "1040px" : "720px";
            rootEl.style.width = contentWidth;
            rootEl.style.maxWidth = contentWidth;
            rootEl.style.margin = "0 auto";
            rootEl.style.boxSizing = "border-box";
            rootEl.style.paddingLeft = "0";
            rootEl.style.paddingRight = "0";
        },

        normalizeReportTableBordersForExport(rootEl) {
            if (!rootEl?.querySelectorAll) return;
            rootEl.querySelectorAll("table[data-report-table-style='true']").forEach((tableEl) => {
                const borderWidth = Number(tableEl.getAttribute("data-report-border-width"));
                const normalizedWidth = Number.isFinite(borderWidth) ? Math.max(borderWidth, 0) : 0;
                const borderColor = tableEl.getAttribute("data-report-border-color") || "#000000";
                const border = normalizedWidth > 0
                    ? `${normalizedWidth}px solid ${borderColor}`
                    : "0 none transparent";

                // Word 不会像浏览器一样可靠地折叠相邻单元格的完整四边框。
                // 每条共享边仅交给右侧/下侧单元格绘制，外侧右边和下边由 table 绘制。
                tableEl.style.setProperty("border", "0 none transparent", "important");
                tableEl.style.setProperty("border-right", border, "important");
                tableEl.style.setProperty("border-bottom", border, "important");
                tableEl.style.setProperty("border-collapse", "collapse", "important");
                tableEl.style.setProperty("border-spacing", "0", "important");
                tableEl.setAttribute("cellspacing", "0");

                const cellList = Array.from(tableEl.rows || [])
                    .flatMap((rowEl) => Array.from(rowEl.cells || []))
                    .filter((cellEl) => cellEl.closest("table") === tableEl);
                cellList.forEach((cellEl) => {
                    cellEl.style.setProperty("border", "0 none transparent", "important");
                    cellEl.style.setProperty("border-top", border, "important");
                    cellEl.style.setProperty("border-left", border, "important");
                });
            });
        },

        normalizeReportTableSpacingForExport(rootEl) {
            if (!rootEl?.querySelectorAll) return;
            rootEl.querySelectorAll("table[data-report-table-spacing-after]").forEach((tableEl) => {
                const configuredSpacing = Number(tableEl.getAttribute("data-report-table-spacing-after"));
                const spacing = Number.isFinite(configuredSpacing)
                    ? Math.max(0, configuredSpacing)
                    : REPORT_TABLE_SPACING_AFTER_PX;

                // 页面间距来自组件外层 margin；导出时改成明确的段落高度，避免 Word
                // 与 PDF 对 div margin 的折叠规则不同而出现间距丢失或叠加。
                const wrapperEl = tableEl.closest(".container-wrapper");
                wrapperEl?.style.setProperty("margin-bottom", "0", "important");
                tableEl.style.setProperty("margin-bottom", "0", "important");

                const spacerEl = document.createElement("p");
                spacerEl.className = "report-table-export-spacer";
                spacerEl.setAttribute("data-report-table-export-spacer", "true");
                // XHTMLImporter 对空段落及 CSS height 的保留不稳定。后端通过该标记
                // 将段落转换为固定行高，Word 与 PDF 共用同一份文档模型。
                spacerEl.textContent = "__META_REPORT_TABLE_SPACER__";
                spacerEl.style.setProperty("margin", "0", "important");
                spacerEl.style.setProperty("padding", "0", "important");
                spacerEl.style.setProperty("height", `${spacing}px`, "important");
                spacerEl.style.setProperty("min-height", `${spacing}px`, "important");
                spacerEl.style.setProperty("line-height", `${spacing}px`, "important");
                spacerEl.style.setProperty("font-size", "1px", "important");
                spacerEl.style.setProperty("color", "transparent", "important");
                tableEl.insertAdjacentElement("afterend", spacerEl);
            });
        },

        getWordExportStyle() {
            const contentWidth = this.landscape ? "1040px" : "720px";
            return `<style data-front-word-export="true">
                .report-content { width: ${contentWidth} !important; max-width: ${contentWidth} !important; }
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
                .report-content table th,
                .report-content table td {
                    min-width: 0 !important;
                    max-width: 100% !important;
                    white-space: normal !important;
                    overflow-wrap: anywhere !important;
                    word-break: break-all !important;
                }
                .report-table-export-spacer {
                    display: block !important;
                    margin: 0 !important;
                    padding: 0 !important;
                }
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
    --toolbar-height: 72px;
    position: relative;
    background: #eef1f5;
    min-height: 100%;
    height: auto;
    box-sizing: border-box;

    .report-toolbar {
        position: sticky;
        top: 0;
        z-index: 1000;
        min-height: var(--toolbar-height);
        padding: 12px 24px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 20px;
        box-sizing: border-box;
        background: rgba(255, 255, 255, 0.96);
        border-bottom: 1px solid var(--el-border-color-light);
        box-shadow: 0 2px 10px rgba(31, 45, 61, 0.06);
        backdrop-filter: blur(8px);
    }

    .report-toolbar__title,
    .report-toolbar__actions {
        display: flex;
        align-items: center;
    }

    .report-toolbar__title {
        min-width: 0;
        gap: 12px;
    }

    .report-toolbar__icon {
        flex: none;
        width: 36px;
        height: 36px;
        border-radius: 8px;
        color: var(--el-color-primary);
        background: var(--el-color-primary-light-9);
        font-size: 20px;
    }

    .report-toolbar__name {
        max-width: 360px;
        overflow: hidden;
        color: var(--el-text-color-primary);
        font-size: 15px;
        font-weight: 600;
        line-height: 22px;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .report-toolbar__meta {
        color: var(--el-text-color-secondary);
        font-size: 12px;
        line-height: 18px;
    }

    .report-toolbar__actions {
        flex: none;
        gap: 12px;

        :deep(.el-button + .el-button) {
            margin-left: 0;
        }
    }

    .report-toolbar__label {
        color: var(--el-text-color-regular);
        font-size: 13px;
        white-space: nowrap;
    }

    .report-stage {
        min-height: calc(100vh - var(--toolbar-height));
        padding: 32px;
        display: flex;
        align-items: flex-start;
        justify-content: center;
        overflow: auto;
        box-sizing: border-box;
    }

    .report-page {
        position: relative;
        flex: none;
        padding: 36px;
        box-sizing: border-box;
        background: #fff;
        box-shadow: 0 4px 24px rgba(31, 45, 61, 0.14);
        transition: width 200ms ease, min-height 200ms ease;
    }

    .report-page--portrait {
        width: min(794px, calc(100vw - 64px));
        min-height: 1123px;
    }

    .report-page--landscape {
        width: min(1123px, calc(100vw - 64px));
        min-height: 794px;
    }

    .report-content {
        position: relative;
        z-index: 1;
        width: 100%;
        margin: 0 auto;
        box-sizing: border-box;
        background: transparent;
    }

    .report-watermark {
        position: absolute;
        z-index: 2;
        inset: 0;
        overflow: hidden;
        pointer-events: none;
        user-select: none;
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

@media (max-width: 900px) {
    .report-view {
        .report-toolbar {
            align-items: flex-start;
            padding: 12px 16px;
            flex-direction: column;
        }

        .report-toolbar__actions {
            width: 100%;
            flex-wrap: wrap;
        }

        .report-stage {
            padding: 16px;
        }

        .report-page--portrait,
        .report-page--landscape {
            width: calc(100vw - 32px);
            padding: 20px;
        }
    }
}
</style>

<style lang="scss">
body.data-model-report-view-page,
body.data-model-report-view-page #app,
body.data-model-report-view-page .aminui {
    height: 100%;
    min-height: 0;
    background: #eef1f5 !important;
}

body.data-model-report-view-page {
    overflow: hidden;
}

body.data-model-report-view-page .aminui-wrapper,
body.data-model-report-view-page .aminui-body,
body.data-model-report-view-page .adminui-main {
    min-height: 0;
    overflow: hidden;
}

body.data-model-report-view-page .report-view,
body.data-model-report-view-page .report-stage {
    min-height: 0;
}

body.data-model-report-view-page .report-view {
    height: 100%;
    display: flex;
    flex-direction: column;
}

body.data-model-report-view-page .report-stage {
    flex: 1;
}
</style>
