export const COMPACT_REPORT_TABLE_CONFIG = Object.freeze({
	fontSize: 11,
	cellPadding: "2px 4px",
	borderWidth: 1,
	borderColor: "#000000",
	rowHeight: 20,
	emptyText: "—",
	tableLayout: "fixed",
});

export const LEGACY_REPORT_TABLE_CONFIG = Object.freeze({
	fontSize: 14,
	cellPadding: "8px 10px",
	borderWidth: 1,
	borderColor: "#dcdfe6",
	rowHeight: 0,
	emptyText: "",
	tableLayout: "auto",
});

const toFiniteNumber = (value, fallback, min = 0) => {
	const numberValue = Number(value);
	return Number.isFinite(numberValue) ? Math.max(numberValue, min) : fallback;
};

export const normalizeReportTableConfig = (config, defaults = COMPACT_REPORT_TABLE_CONFIG) => {
	const source = config && typeof config === "object" ? config : {};
	return {
		fontSize: toFiniteNumber(source.fontSize, defaults.fontSize, 1),
		cellPadding: String(source.cellPadding ?? defaults.cellPadding).trim() || defaults.cellPadding,
		borderWidth: toFiniteNumber(source.borderWidth, defaults.borderWidth),
		borderColor: String(source.borderColor ?? defaults.borderColor).trim() || defaults.borderColor,
		rowHeight: toFiniteNumber(source.rowHeight, defaults.rowHeight),
		emptyText: String(source.emptyText ?? defaults.emptyText),
		tableLayout: source.tableLayout === "auto" ? "auto" : "fixed",
	};
};

const normalizeClassList = (customClass) => {
	if (Array.isArray(customClass)) {
		return customClass.filter(Boolean).map(String);
	}
	return String(customClass || "").split(/\s+/).filter(Boolean);
};

const getWidgetStyleClass = (widget) => {
	const source = widget?.id || widget?.options?.name || "";
	const safeName = String(source).replace(/[^a-zA-Z0-9_-]/g, "-");
	return safeName ? `ml-report-table-${safeName}` : "";
};

export const ensureNativeReportTableConfig = (widget, defaults = LEGACY_REPORT_TABLE_CONFIG) => {
	if (!widget || widget.type !== "table") return false;
	const options = widget.options || (widget.options = {});
	let changed = false;
	if (!options.reportTableConfig || typeof options.reportTableConfig !== "object") {
		options.reportTableConfig = normalizeReportTableConfig(null, defaults);
		changed = true;
	} else {
		const normalized = normalizeReportTableConfig(options.reportTableConfig, defaults);
		if (JSON.stringify(normalized) !== JSON.stringify(options.reportTableConfig)) {
			options.reportTableConfig = normalized;
			changed = true;
		}
	}

	const styleClass = getWidgetStyleClass(widget);
	const classList = normalizeClassList(options.customClass);
	if (styleClass) {
		if (!classList.includes(styleClass)) {
			classList.push(styleClass);
			changed = true;
		}
	}
	if (!Array.isArray(options.customClass) || JSON.stringify(options.customClass) !== JSON.stringify(classList)) {
		options.customClass = classList;
		changed = true;
	}
	return changed;
};

const visitChildWidgets = (widget, visitor) => {
	const visitList = (widgetList = []) => {
		widgetList.forEach((child) => {
			if (!child) return;
			const shouldVisitChildren = visitor(child) !== false;
			if (!shouldVisitChildren) return;
			if (Array.isArray(child.widgetList)) visitList(child.widgetList);
			if (Array.isArray(child.cols)) child.cols.forEach((col) => visitList(col.widgetList || []));
			if (Array.isArray(child.rows)) {
				child.rows.forEach((row) => (row.cols || []).forEach((cell) => visitList(cell.widgetList || [])));
			}
			if (Array.isArray(child.tabs)) child.tabs.forEach((tab) => visitList(tab.widgetList || []));
		});
	};
	if (Array.isArray(widget?.widgetList)) visitList(widget.widgetList);
	if (Array.isArray(widget?.cols)) widget.cols.forEach((col) => visitList(col.widgetList || []));
	if (Array.isArray(widget?.rows)) {
		widget.rows.forEach((row) => (row.cols || []).forEach((cell) => visitList(cell.widgetList || [])));
	}
	if (Array.isArray(widget?.tabs)) widget.tabs.forEach((tab) => visitList(tab.widgetList || []));
};

export const syncNativeTableEmptyText = (widget) => {
	if (!widget || widget.type !== "table") return;
	const emptyText = normalizeReportTableConfig(widget.options?.reportTableConfig).emptyText;
	visitChildWidgets(widget, (child) => {
		if (child.type === "table") return false;
		if (child.type === "report-field") {
			const options = child.options || (child.options = {});
			options.emptyDisplayText = emptyText;
		}
	});
};

const applyConfigToTableElement = (tableEl, config) => {
	if (!tableEl) return;
	const normalized = normalizeReportTableConfig(config);
	tableEl.setAttribute("data-report-table-style", "true");
	tableEl.setAttribute("data-report-font-size", String(normalized.fontSize));
	tableEl.setAttribute("data-report-cell-padding", normalized.cellPadding);
	tableEl.setAttribute("data-report-border-width", String(normalized.borderWidth));
	tableEl.setAttribute("data-report-border-color", normalized.borderColor);
	tableEl.setAttribute("data-report-row-height", String(normalized.rowHeight));
	tableEl.setAttribute("data-report-table-layout", normalized.tableLayout);
	tableEl.style.fontSize = `${normalized.fontSize}px`;
	tableEl.style.tableLayout = normalized.tableLayout;
	tableEl.style.borderCollapse = "collapse";
	tableEl.style.width = tableEl.style.width || "100%";
	const cellList = Array.from(tableEl.rows || []).flatMap((rowEl) => Array.from(rowEl.cells || []));
	cellList.forEach((cellEl) => {
		cellEl.style.padding = normalized.cellPadding;
		cellEl.style.height = normalized.rowHeight > 0 ? `${normalized.rowHeight}px` : "";
		cellEl.style.minHeight = normalized.rowHeight > 0 ? `${normalized.rowHeight}px` : "";
		cellEl.style.border = normalized.borderWidth > 0
			? `${normalized.borderWidth}px solid ${normalized.borderColor}`
			: "0 none transparent";
		cellEl.style.boxSizing = "border-box";
	});
};

export const applyNativeReportTableStyle = (widget, root = document) => {
	if (!widget || widget.type !== "table" || !root?.querySelectorAll) return;
	const styleClass = getWidgetStyleClass(widget);
	if (!styleClass) return;
	root.querySelectorAll(`.table-container.${styleClass}`).forEach((containerEl) => {
		const tableEl = Array.from(containerEl.children).find((child) => child.tagName === "TABLE")
			|| containerEl.querySelector("table");
		applyConfigToTableElement(tableEl, widget.options?.reportTableConfig);
	});
};

export const applyAllNativeReportTableStyles = (widgetList = [], root = document) => {
	const visit = (list = []) => {
		list.forEach((widget) => {
			if (!widget) return;
			if (widget.type === "table") {
				applyNativeReportTableStyle(widget, root);
			}
			if (Array.isArray(widget.widgetList)) visit(widget.widgetList);
			if (Array.isArray(widget.cols)) widget.cols.forEach((col) => visit(col.widgetList || []));
			if (Array.isArray(widget.rows)) {
				widget.rows.forEach((row) => (row.cols || []).forEach((cell) => visit(cell.widgetList || [])));
			}
			if (Array.isArray(widget.tabs)) widget.tabs.forEach((tab) => visit(tab.widgetList || []));
		});
	};
	visit(widgetList);
};

export const normalizeReportWidgetCustomClasses = (widgetList = []) => {
	let changed = false;
	const visit = (list = []) => {
		list.forEach((widget) => {
			if (!widget) return;
			const options = widget.options;
			if (options && Object.prototype.hasOwnProperty.call(options, "customClass") && !Array.isArray(options.customClass)) {
				options.customClass = normalizeClassList(options.customClass);
				changed = true;
			}
			if (Array.isArray(widget.widgetList)) visit(widget.widgetList);
			if (Array.isArray(widget.cols)) widget.cols.forEach((col) => visit(col.widgetList || []));
			if (Array.isArray(widget.rows)) {
				widget.rows.forEach((row) => (row.cols || []).forEach((cell) => visit(cell.widgetList || [])));
			}
			if (Array.isArray(widget.tabs)) widget.tabs.forEach((tab) => visit(tab.widgetList || []));
		});
	};
	visit(widgetList);
	return changed;
};
