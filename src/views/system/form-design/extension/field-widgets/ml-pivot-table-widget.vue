<template>
	<static-content-wrapper
		:designer="designer"
		:field="field"
		:design-state="designState"
		:parent-widget="parentWidget"
		:parent-list="parentList"
		:index-of-parent-list="indexOfParentList"
		:sub-form-row-index="subFormRowIndex"
		:sub-form-col-index="subFormColIndex"
		:sub-form-row-id="subFormRowId"
	>
		<div v-show="!field.options.hidden" class="ml-pivot-table" :class="field.options.customClass">
			<div v-if="tableTitle && !config.hideTitle" class="ml-pivot-table__title">
				<div v-if="htmlDisplayEnabled" v-html="sanitizeDisplayHtml(tableTitle)"></div>
				<template v-else>{{ tableTitle }}</template>
			</div>
			<table
				class="ml-pivot-table__table"
				:class="{ 'is-border': config.showBorder }"
				:style="tableStyle"
				v-bind="reportTableDataAttributes"
			>
				<thead>
					<tr v-for="(headerRow, headerRowIndex) in columnHeaderRows" :key="headerRowIndex">
						<th
							v-for="cornerCell in cornerHeaderRows[headerRowIndex]"
							:key="cornerCell.key"
							:colspan="cornerCell.colspan"
							:rowspan="cornerCell.rowspan"
							:style="headerStyle"
						>
							<div v-if="htmlDisplayEnabled" v-html="sanitizeDisplayHtml(cornerCell.label)"></div>
							<template v-else>{{ cornerCell.label }}</template>
						</th>
						<th
							v-for="headerCell in headerRow"
							:key="headerCell.key"
							:colspan="headerCell.colspan"
							:rowspan="headerCell.rowspan"
							:style="headerStyle"
						>
							<div v-if="htmlDisplayEnabled" v-html="sanitizeDisplayHtml(headerCell.label)"></div>
							<template v-else>{{ headerCell.label }}</template>
						</th>
						<th
							v-if="config.showSumcol && headerRowIndex === 0"
							:rowspan="columnHeaderRows.length"
							:style="headerStyle"
						>
							合计
						</th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="row in pivotDisplayRows" :key="row.key">
						<template v-for="(dimensionCell, index) in row.dimensionCells" :key="index">
							<th v-if="dimensionCell.rowspan > 0" :rowspan="dimensionCell.rowspan" :style="headerStyle">
								<div v-if="htmlDisplayEnabled" v-html="sanitizeDisplayHtml(dimensionCell.value)"></div>
								<template v-else>{{ dimensionCell.value }}</template>
							</th>
						</template>
						<td v-for="col in pivotColumns" :key="col" :style="cellStyle">
							<div v-if="htmlDisplayEnabled" v-html="sanitizeDisplayHtml(row.values[col], true)"></div>
							<template v-else>{{ formatValue(row.values[col]) }}</template>
						</td>
						<td v-if="config.showSumcol" :style="cellStyle">
							<div v-if="htmlDisplayEnabled" v-html="sanitizeDisplayHtml(row.total, true)"></div>
							<template v-else>{{ formatValue(row.total) }}</template>
						</td>
					</tr>
					<tr v-if="config.showSummary && pivotRows.length > 0">
						<th :colspan="rowDimensionHeaders.length" :style="headerStyle">合计</th>
						<td v-for="col in pivotColumns" :key="col" :style="cellStyle">
							<div v-if="htmlDisplayEnabled" v-html="sanitizeDisplayHtml(columnTotals[col], true)"></div>
							<template v-else>{{ formatValue(columnTotals[col]) }}</template>
						</td>
						<td v-if="config.showSumcol" :style="cellStyle">
							<div v-if="htmlDisplayEnabled" v-html="sanitizeDisplayHtml(grandTotal, true)"></div>
							<template v-else>{{ formatValue(grandTotal) }}</template>
						</td>
					</tr>
				</tbody>
			</table>
		</div>
	</static-content-wrapper>
</template>

<script>
import VisualDesign from '@/../lib/visual-design/designer.umd.js'
import { sanitizeReportHtml } from '@/views/system/form-design/extension/report-html-sanitizer'

const { StaticContentWrapper, emitter, i18n, fieldMixin } = VisualDesign.VFormSDK

export default {
	name: 'ml-pivot-table-widget',
	componentName: 'FieldWidget',
	mixins: [emitter, fieldMixin, i18n],
	components: {
		StaticContentWrapper,
	},
	props: {
		field: Object,
		parentWidget: Object,
		parentList: Array,
		indexOfParentList: Number,
		designer: Object,
		designState: { type: Boolean, default: false },
		subFormRowIndex: { type: Number, default: -1 },
		subFormColIndex: { type: Number, default: -1 },
		subFormRowId: { type: String, default: '' },
		loopRowData: { type: Object, default: null },
	},
	inject: {
		refList: { default: null },
		globalModel: { default: null },
		getGlobalDsv: { default: null },
	},
	data() {
		return {
			reportFormDataCache: null,
			eventFunctionMapping: {},
			_formDataReadyFired: false,
		}
	},
	computed: {
		htmlDisplayEnabled() {
			return !!this.field?.options?.htmlDisplayEnabled
		},
		config() {
			return this.field.options.pivotTableConfig || {}
		},
		tableTitle() {
			return this.config.title || this.field.options.label
		},
		reportFormData() {
			const cache = this.reportFormDataCache
			if (cache && typeof cache === 'object' && Object.keys(cache).length > 0) {
				return cache
			}
			return this.getGlobalDsv?.()?.__reportFormData || this.globalModel?.formModel || {}
		},
		tableStyle() {
			return {
				width: this.config.width || '100%',
				textAlign: this.config.textAlign || 'center',
				fontSize: `${this.toStyleNumber(this.config.fontSize, 14, 1)}px`,
				tableLayout: this.config.tableLayout === 'auto' ? 'auto' : 'fixed',
			}
		},
		headerStyle() {
			return this.getTableCellStyle()
		},
		cellStyle() {
			return this.getTableCellStyle()
		},
		reportTableDataAttributes() {
			return {
				'data-report-table-style': 'true',
				'data-report-font-size': String(this.toStyleNumber(this.config.fontSize, 14, 1)),
				'data-report-cell-padding': this.config.cellPadding || '8px 10px',
				'data-report-border-width': String(this.config.showBorder === false
					? 0
					: this.toStyleNumber(this.config.borderWidth, 1)),
				'data-report-border-color': this.config.borderColor || '#dcdfe6',
				'data-report-row-height': String(this.toStyleNumber(this.config.rowHeight, 0)),
				'data-report-table-layout': this.config.tableLayout === 'auto' ? 'auto' : 'fixed',
			}
		},
		sourceRows() {
			try {
				const directRows = this.resolveRowsFromReportData()
				if (directRows.length > 0) {
					return directRows
				}
				const rows = JSON.parse(this.config.dataJson || '[]')
				return Array.isArray(rows) ? rows : []
			} catch (e) {
				return []
			}
		},
		setDimensional() {
			return this.config.setDimensional || {}
		},
		dimensionRows() {
			return this.setDimensional.dimensionRow || []
		},
		dimensionCols() {
			return this.setDimensional.dimensionCol || []
		},
		metrics() {
			return this.setDimensional.metrics || []
		},
		rowHeaderLabel() {
			return this.dimensionRows.map(this.getFieldAlias).filter(Boolean).join(' / ') || this.config.rowField || '维度行'
		},
		rowDimensionHeaders() {
			const headers = this.dimensionRows.map(this.getFieldAlias)
			return headers.length > 0 ? headers.map((header) => header || '维度行') : [this.rowHeaderLabel]
		},
		cornerHeaderRows() {
			const headerRowCount = this.columnHeaderRows.length
			const cornerRows = Array.from({ length: headerRowCount }, () => [])
			const rowTitles = this.rowDimensionHeaders
			const columnTitles = this.dimensionCols.map(this.getFieldAlias).map((title) => title || '维度列')
			if (columnTitles.length === 0) {
				cornerRows[0] = rowTitles.map((title, index) => ({
					key: `row-dimension-${index}`,
					label: title,
					colspan: 1,
					rowspan: headerRowCount,
				}))
				return cornerRows
			}
			rowTitles.slice(0, -1).forEach((title, index) => {
				cornerRows[0].push({
					key: `row-dimension-${index}`,
					label: title,
					colspan: 1,
					rowspan: headerRowCount,
				})
			})
			columnTitles.forEach((title, index) => {
				if (index >= headerRowCount) {
					return
				}
				const isLastColumnDimension = index === columnTitles.length - 1
				cornerRows[index].push({
					key: `column-dimension-${index}`,
					label: isLastColumnDimension
						? `${rowTitles[rowTitles.length - 1]} / ${title}`
						: title,
					colspan: 1,
					rowspan: isLastColumnDimension ? headerRowCount - index : 1,
				})
			})
			return cornerRows
		},
		pivotColumnDefinitions() {
			if (this.dimensionCols.length === 0) {
				return this.metrics.map((metric, metricIndex) => ({
					key: this.buildPivotColumnKey([], metricIndex),
					label: this.getFieldAlias(metric) || '指标',
					dimensionValues: [],
					metricIndex,
				}))
			}
			if (this.sourceRows.length === 0) {
				return []
			}
			const dimensionMap = new Map()
			this.sourceRows.forEach((row) => {
				const dimensionValues = this.getDimensionValues(row, this.dimensionCols)
				const dimensionKey = JSON.stringify(dimensionValues)
				if (!dimensionMap.has(dimensionKey)) {
					dimensionMap.set(dimensionKey, dimensionValues)
				}
			})
			const dimensionGroups = Array.from(dimensionMap.values())
			dimensionGroups.sort((left, right) => this.compareDimensionValues(left, right, this.dimensionCols))
			return dimensionGroups.flatMap((dimensionValues) => {
				if (this.metrics.length > 1) {
					return this.metrics.map((metric, metricIndex) => ({
						key: this.buildPivotColumnKey(dimensionValues, metricIndex),
						label: this.getFieldAlias(metric) || '指标',
						dimensionValues,
						metricIndex,
					}))
				}
				return [{
					key: this.buildPivotColumnKey(dimensionValues, 0),
					label: dimensionValues[dimensionValues.length - 1] || '空',
					dimensionValues,
					metricIndex: 0,
				}]
			})
		},
		pivotColumns() {
			return this.pivotColumnDefinitions.map((column) => column.key)
		},
		columnHeaderRows() {
			if (this.dimensionCols.length === 0) {
				return [this.pivotColumnDefinitions.map((column) => ({
					key: `metric-${column.key}`,
					label: column.label,
					colspan: 1,
					rowspan: 1,
				}))]
			}
			if (this.pivotColumnDefinitions.length === 0) {
				const headerRowCount = this.dimensionCols.length + (this.metrics.length > 1 ? 1 : 0)
				return Array.from({ length: Math.max(headerRowCount, 1) }, () => [])
			}
			const headerRows = this.dimensionCols.map((dimension, dimensionIndex) => (
				this.buildColumnDimensionHeaderRow(dimensionIndex)
			))
			if (this.metrics.length > 1) {
				headerRows.push(this.pivotColumnDefinitions.map((column) => ({
					key: `metric-${column.key}`,
					label: column.label,
					colspan: 1,
					rowspan: 1,
				})))
			}
			return headerRows
		},
		pivotRows() {
			if (this.sourceRows.length === 0 || this.dimensionRows.length === 0 || this.metrics.length === 0) {
				return this.previewRows
			}
			const rowMap = new Map()
			this.sourceRows.forEach(row => {
				const dimensionValues = this.getDimensionValues(row, this.dimensionRows)
				const rowKey = JSON.stringify(dimensionValues)
				if (!rowMap.has(rowKey)) {
					rowMap.set(rowKey, { key: rowKey, dimensionValues, values: {}, metricMap: {}, total: 0 })
				}
				const target = rowMap.get(rowKey)
				this.metrics.forEach((metric, metricIndex) => {
					const dimensionValues = this.dimensionCols.length > 0
						? this.getDimensionValues(row, this.dimensionCols)
						: []
					const colKey = this.buildPivotColumnKey(dimensionValues, metricIndex)
					if (!target.metricMap[colKey]) {
						target.metricMap[colKey] = this.createMetricAggregator()
					}
					this.collectMetricValue(target.metricMap[colKey], this.getRowFieldValue(row, metric), metric?.calcMode || 'count')
				})
			})
			const rows = Array.from(rowMap.values())
			rows.forEach((row) => {
				const values = {}
				let total = 0
				this.pivotColumns.forEach((col) => {
					const metricTarget = row.metricMap[col] || this.createMetricAggregator()
					const colValue = this.getMetricResult(metricTarget, this.resolveColumnCalcMode(col))
					values[col] = colValue
					total += Number(colValue) || 0
				})
				row.values = values
				row.total = total
			})
			rows.sort((a, b) => {
				return this.compareDimensionValues(a.dimensionValues, b.dimensionValues, this.dimensionRows)
			})
			return rows
		},
		pivotDisplayRows() {
			const rows = this.pivotRows.map((row) => ({
				...row,
				dimensionCells: (row.dimensionValues || [row.key]).map((value) => ({ value, rowspan: 1 })),
			}))
			const dimensionCount = this.rowDimensionHeaders.length
			for (let dimensionIndex = 0; dimensionIndex < dimensionCount; dimensionIndex += 1) {
				let startIndex = 0
				while (startIndex < rows.length) {
					let endIndex = startIndex + 1
					while (
						endIndex < rows.length &&
						this.hasSameDimensionPrefix(rows[startIndex], rows[endIndex], dimensionIndex)
					) {
						endIndex += 1
					}
					rows[startIndex].dimensionCells[dimensionIndex].rowspan = endIndex - startIndex
					for (let rowIndex = startIndex + 1; rowIndex < endIndex; rowIndex += 1) {
						rows[rowIndex].dimensionCells[dimensionIndex].rowspan = 0
					}
					startIndex = endIndex
				}
			}
			return rows
		},
		previewRows() {
			return []
		},
		columnTotals() {
			return this.pivotColumns.reduce((result, col) => {
				result[col] = this.pivotRows.reduce((sum, row) => sum + (Number(row.values[col]) || 0), 0)
				return result
			}, {})
		},
		grandTotal() {
			return this.pivotRows.reduce((sum, row) => sum + (Number(row.total) || 0), 0)
		},
	},
	created() {
		this.registerToRefList()
		this.initEventHandler()
		this.handleOnCreated()
		this.initPivotEventHandler()
	},
	mounted() {
		this.syncReportFormDataFromGlobal()
		this.$nextTick(() => {
			this.syncReportFormDataFromGlobal()
			this.tryFireLoopFormDataReady()
		})
		this.handleOnMounted()
	},
	beforeUnmount() {
		this.unregisterFromRefList()
		if (this.eventFunctionMapping.setFormData) {
			this.off$('setFormData', this.eventFunctionMapping.setFormData)
		}
	},
	methods: {
		sanitizeDisplayHtml(value, formatted = false) {
			return sanitizeReportHtml(formatted ? this.formatValue(value) : value)
		},
		toStyleNumber(value, fallback, min = 0) {
			const numberValue = Number(value)
			return Number.isFinite(numberValue) ? Math.max(numberValue, min) : fallback
		},
		getTableCellStyle(extraStyle = {}) {
			const rowHeight = this.toStyleNumber(this.config.rowHeight, 0)
			const borderWidth = this.toStyleNumber(this.config.borderWidth, 1)
			return {
				textAlign: this.config.textAlign || 'center',
				padding: this.config.cellPadding || '8px 10px',
				height: rowHeight > 0 ? `${rowHeight}px` : undefined,
				minHeight: rowHeight > 0 ? `${rowHeight}px` : undefined,
				boxSizing: 'border-box',
				border: this.config.showBorder && borderWidth > 0
					? `${borderWidth}px solid ${this.config.borderColor || '#dcdfe6'}`
					: '0 none transparent',
				...extraStyle,
			}
		},
		initPivotEventHandler() {
			if (this.designState) return
			this.eventFunctionMapping.setFormData = (params) => {
				const broadcastData = params?.[0]
				const globalReportData = this.getGlobalReportData()
				const data = this.hasReportData(globalReportData) ? globalReportData : broadcastData
				if (this.hasReportData(data)) {
					this.reportFormDataCache = data
				}
				this.handleOnFormDataReady(this.reportFormData)
			}
			this.on$('setFormData', this.eventFunctionMapping.setFormData)
		},
		getGlobalReportData() {
			return this.getGlobalDsv?.()?.__reportFormData
		},
		hasReportData(data) {
			if (Array.isArray(data)) {
				return data.length > 0
			}
			return !!data && typeof data === 'object' && Object.keys(data).length > 0
		},
		syncReportFormDataFromGlobal() {
			const globalReportData = this.getGlobalReportData()
			if (this.hasReportData(globalReportData)) {
				this.reportFormDataCache = globalReportData
			}
		},
		reloadPivotData(formData) {
			if (formData) {
				this.reportFormDataCache = formData
			}
		},
		setValue(data) {
			if (Array.isArray(data)) {
				this.reportFormDataCache = data
				return
			}
			if (data && typeof data === 'object') {
				if (Array.isArray(data.data)) {
					this.reportFormDataCache = data.data
				}
				const cfg = this.field.options.pivotTableConfig || {}
				if (data.dimensionRow) {
					cfg.setDimensional = cfg.setDimensional || {}
					cfg.setDimensional.dimensionRow = Array.isArray(data.dimensionRow) ? data.dimensionRow : [data.dimensionRow]
				}
				if (data.dimensionCol) {
					cfg.setDimensional = cfg.setDimensional || {}
					cfg.setDimensional.dimensionCol = Array.isArray(data.dimensionCol) ? data.dimensionCol : [data.dimensionCol]
				}
				if (data.metrics) {
					cfg.setDimensional = cfg.setDimensional || {}
					cfg.setDimensional.metrics = Array.isArray(data.metrics) ? data.metrics : [data.metrics]
				}
			}
		},
		getValue() {
			return this.sourceRows
		},
		handleOnFormDataReady(formData) {
			if (this.designState || this.designer || (this.loopRowData && this._formDataReadyFired)) return
			if (this.field.options?.onFormDataReady) {
				if (this.loopRowData) {
					this._formDataReadyFired = true
				}
				const bindCode = this.config.bindModelCode || ''
				let scopeData
				if (this.loopRowData) {
					scopeData = this.loopRowData
				} else if (Array.isArray(formData)) {
					scopeData = formData
				} else if (bindCode && formData?.[bindCode]) {
					scopeData = formData[bindCode]
				} else {
					scopeData = formData
				}
				const fn = new Function("formData", "key", "value", this.field.options.onFormDataReady)
				fn.call(this, scopeData, bindCode, scopeData)
			}
		},
		tryFireLoopFormDataReady() {
			if (this.loopRowData && typeof this.loopRowData === 'object') {
				this.handleOnFormDataReady(this.loopRowData)
			}
		},
		getFieldAlias(field) {
			return field?.alias || field?.fieldLabel || field?.label || field?.displayName || field?.fieldName || field?.name || ''
		},
		resolveRowsFromReportData() {
			const bindCode = this.config.bindModelCode || this.getFieldModelCode(this.dimensionRows[0]) || this.getFieldModelCode(this.dimensionCols[0]) || this.getFieldModelCode(this.metrics[0]) || ''
			const reportData = this.reportFormData
			const fieldKeys = this.getCandidateFieldKeys()
			if (Array.isArray(reportData)) {
				return reportData
			}
			if (!reportData || typeof reportData !== 'object') {
				return []
			}
			if (bindCode) {
				const modelData = this.findModelData(reportData, bindCode)
				if (modelData !== undefined) {
					if (Array.isArray(modelData)) {
						return this.normalizeModelRows(modelData)
					}
					if (this.rowMatchesFields(modelData, fieldKeys)) {
						return [modelData]
					}
					const nestedRows = this.findRowsByFields(modelData, fieldKeys)
					return nestedRows.length > 0 ? nestedRows : this.normalizeModelRows(modelData)
				}
			}
			if (!fieldKeys.length) {
				return []
			}
			if (this.rowMatchesFields(reportData, fieldKeys)) {
				return [reportData]
			}
			return this.findRowsByFields(reportData, fieldKeys)
		},
		findModelData(source, modelCode, visited = new WeakSet()) {
			if (!source || !modelCode || typeof source !== 'object') {
				return undefined
			}
			if (visited.has(source)) {
				return undefined
			}
			visited.add(source)
			if (!Array.isArray(source) && Object.prototype.hasOwnProperty.call(source, modelCode)) {
				return source[modelCode]
			}
			for (const value of Object.values(source)) {
				if (!value || typeof value !== 'object') {
					continue
				}
				const found = this.findModelData(value, modelCode, visited)
				if (found !== undefined) {
					return found
				}
			}
			return undefined
		},
		normalizeModelRows(modelData) {
			if (Array.isArray(modelData)) {
				return modelData.filter((row) => row && typeof row === 'object')
			}
			if (modelData && typeof modelData === 'object') {
				return [modelData]
			}
			return []
		},
		findRowsByFields(source, fieldKeys, visited = new WeakSet()) {
			if (!source || typeof source !== 'object' || visited.has(source)) {
				return []
			}
			visited.add(source)
			if (Array.isArray(source)) {
				if (source.some((row) => this.rowMatchesFields(row, fieldKeys))) {
					return source.filter((row) => row && typeof row === 'object')
				}
				for (const item of source) {
					const rows = this.findRowsByFields(item, fieldKeys, visited)
					if (rows.length > 0) {
						return rows
					}
				}
				return []
			}
			for (const value of Object.values(source)) {
				const rows = this.findRowsByFields(value, fieldKeys, visited)
				if (rows.length > 0) {
					return rows
				}
			}
			return []
		},
		rowMatchesFields(row, fieldKeys) {
			return !!row && typeof row === 'object' && !Array.isArray(row) &&
				fieldKeys.some((key) => row[key] !== undefined)
		},
		getCandidateFieldKeys() {
			const fields = [...this.dimensionRows, ...this.dimensionCols, ...this.metrics].filter(Boolean)
			const keys = new Set()
			fields.forEach((field) => {
				const rawName = this.getFieldRawName(field)
				if (rawName) {
					keys.add(rawName)
					if (rawName.includes('##')) {
						keys.add(rawName.split('##').slice(1).join('##'))
					}
				}
				;[
					field?.fieldName,
					field?.name,
					field?.options?.bindingPath,
					field?.options?.keyName,
					field?.options?.name,
				].filter(Boolean).forEach((key) => keys.add(key))
			})
			return Array.from(keys)
		},
		getFieldModelCode(field) {
			const names = [
				field?.options?.modelAssociationId,
				field?.modelAssociationId,
				field?.dataCode,
				field?.metaModelName,
				field?.name,
				field?.options?.bindingPath,
				field?.fieldName,
				field?.options?.keyName,
				field?.options?.name,
			].filter(Boolean)
			for (const name of names) {
				if (name && this.reportFormData?.[name] !== undefined) {
					return name
				}
				if (name && name.includes('##')) {
					const modelCode = name.split('##')[0]
					if (this.reportFormData?.[modelCode] !== undefined) {
						return modelCode
					}
				}
				if (name && name.includes('.')) {
					const modelCode = name.slice(0, name.indexOf('.'))
					if (this.reportFormData?.[modelCode] !== undefined) {
						return modelCode
					}
				}
			}
			return ''
		},
		getFieldRawName(field) {
			const modelCode = this.getFieldModelCode(field)
			const candidates = [
				field?.options?.bindingPath,
				field?.options?.keyName,
				field?.name,
				field?.fieldName,
				field?.options?.name,
			].filter(Boolean)
			for (const candidate of candidates) {
				if (modelCode && candidate.includes(modelCode + '##')) {
					return candidate
				}
				if (modelCode && candidate.startsWith(modelCode + '.')) {
					return candidate.slice(modelCode.length + 1)
				}
			}
			const hashName = candidates.find((candidate) => candidate.includes('##'))
			if (hashName) {
				return hashName
			}
			const dottedName = candidates.find((candidate) => candidate.includes('.'))
			if (dottedName) {
				return dottedName.slice(dottedName.lastIndexOf('.') + 1)
			}
			return candidates[0] || ''
		},
		getRowFieldValue(row, field) {
			if (!row || !field) {
				return null
			}
			const rawName = this.getFieldRawName(field)
			const shortName = rawName.includes('##') ? rawName.split('##').slice(1).join('##') : rawName
			const candidates = [
				rawName,
				shortName,
				field?.fieldName,
				field?.options?.bindingPath,
				field?.options?.keyName,
				field?.name,
				field?.options?.name,
			].filter(Boolean)
			for (const candidate of candidates) {
				if (row[candidate] !== undefined) {
					return row[candidate]
				}
			}
			return null
		},
		getDimensionValues(row, fields = []) {
			return fields.map((field) => this.formatDimensionValue(this.getRowFieldValue(row, field), field))
		},
		compareDimensionValues(leftValues = [], rightValues = [], fields = []) {
			let result = 0
			for (let index = 0; index < fields.length; index += 1) {
				result = String(leftValues[index]).localeCompare(String(rightValues[index]), 'zh-Hans-CN')
				if (result !== 0) {
					break
				}
			}
			const direction = fields.find((item) => item.sort)?.sort
			return direction === 'DESC' ? -result : result
		},
		hasSameDimensionPrefix(leftRow, rightRow, dimensionIndex) {
			const leftValues = leftRow.dimensionValues || []
			const rightValues = rightRow.dimensionValues || []
			for (let index = 0; index <= dimensionIndex; index += 1) {
				if (leftValues[index] !== rightValues[index]) {
					return false
				}
			}
			return true
		},
		buildPivotColumnKey(dimensionValues, metricIndex) {
			return JSON.stringify([dimensionValues, metricIndex])
		},
		buildColumnDimensionHeaderRow(dimensionIndex) {
			const headerCells = []
			let startIndex = 0
			while (startIndex < this.pivotColumnDefinitions.length) {
				let endIndex = startIndex + 1
				while (endIndex < this.pivotColumnDefinitions.length) {
					const leftValues = this.pivotColumnDefinitions[startIndex].dimensionValues
					const rightValues = this.pivotColumnDefinitions[endIndex].dimensionValues
					let hasSamePrefix = true
					for (let index = 0; index <= dimensionIndex; index += 1) {
						if (leftValues[index] !== rightValues[index]) {
							hasSamePrefix = false
							break
						}
					}
					if (!hasSamePrefix) {
						break
					}
					endIndex += 1
				}
				const dimensionValues = this.pivotColumnDefinitions[startIndex].dimensionValues
				headerCells.push({
					key: `dimension-${dimensionIndex}-${startIndex}`,
					label: dimensionValues[dimensionIndex],
					colspan: endIndex - startIndex,
					rowspan: 1,
				})
				startIndex = endIndex
			}
			return headerCells
		},
		resolveColumnCalcMode(columnKey) {
			const column = this.pivotColumnDefinitions.find((item) => item.key === columnKey)
			const metric = this.metrics[column?.metricIndex ?? 0]
			return metric?.calcMode || this.metrics[0]?.calcMode || 'count'
		},
		createMetricAggregator() {
			return {
				value: 0,
				count: 0,
				numberCount: 0,
				values: [],
				firstValue: undefined,
			}
		},
		collectMetricValue(target, rawValue, calcMode) {
			const hasValue = rawValue !== undefined && rawValue !== null && rawValue !== ''
			if (hasValue) {
				if (target.firstValue === undefined) {
					target.firstValue = rawValue
				}
				target.count += 1
				target.values.push(rawValue)
			}
			if (calcMode === 'sum' || calcMode === 'average' || calcMode === 'max' || calcMode === 'min') {
				const numberValue = Number(rawValue)
				if (!Number.isNaN(numberValue)) {
					target.numberCount += 1
					if (calcMode === 'max') {
						target.value = target.numberCount === 1 ? numberValue : Math.max(target.value, numberValue)
					} else if (calcMode === 'min') {
						target.value = target.numberCount === 1 ? numberValue : Math.min(target.value, numberValue)
					} else {
						target.value += numberValue
					}
				}
			}
		},
		getMetricResult(target, calcMode) {
			if (calcMode === 'first') {
				return target.firstValue === undefined ? '' : target.firstValue
			}
			if (calcMode === 'textJoin') {
				return target.values.join('，')
			}
			if (calcMode === 'textDistinctJoin') {
				return Array.from(new Set(target.values.map((value) => String(value)))).join('，')
			}
			if (calcMode === 'count') {
				return target.count
			}
			if (calcMode === 'countSet') {
				return new Set(target.values.map((value) => String(value))).size
			}
			if (calcMode === 'average') {
				return target.numberCount ? target.value / target.numberCount : ''
			}
			if (calcMode === 'sum' || calcMode === 'max' || calcMode === 'min') {
				return target.numberCount ? target.value : ''
			}
			return target.value
		},
		formatDimensionValue(value, field) {
			if (value === null || value === undefined || value === '') {
				return '空'
			}
			if ((field?.type === 'Date' || field?.type === 'DateTime') && typeof value === 'string') {
				return this.formatDateValue(value, field.dateFormat)
			}
			return String(value)
		},
		formatDateValue(value, dateFormat) {
			const date = new Date(value)
			if (Number.isNaN(date.getTime())) {
				return value
			}
			const year = date.getFullYear()
			const month = String(date.getMonth() + 1).padStart(2, '0')
			const day = String(date.getDate()).padStart(2, '0')
			const quarter = Math.floor(date.getMonth() / 3) + 1
			const formatMap = {
				1: `${year}-${month}-${day}`,
				2: `${year}年第${quarter}季度`,
				3: `${year}-${month}`,
				4: `${year}`,
				5: `${month}`,
				6: `${day}`,
			}
			return formatMap[dateFormat] || value
		},
		formatValue(value) {
			if (value === null || value === undefined || value === '') {
				if (Object.prototype.hasOwnProperty.call(this.config, 'emptyText')) {
					return String(this.config.emptyText ?? '')
				}
				return this.config.showEmptyAsDash !== false ? '--' : ''
			}
			if (typeof value === 'string') {
				return value
			}
			const numberValue = Number(value) || 0
			return Number.isInteger(numberValue) ? numberValue : numberValue.toFixed(2)
		},
	},
}
</script>

<style scoped lang="scss">
.ml-pivot-table {
	padding: 6px 0;
	color: #303133;
}

.ml-pivot-table__title {
	margin-bottom: 8px;
	font-size: 16px;
	font-weight: 600;
	line-height: 1.4;
}

.ml-pivot-table__table {
	border-collapse: collapse;
	table-layout: fixed;
	background: #fff;
	font-size: 14px;
}

.ml-pivot-table__table th,
.ml-pivot-table__table td {
	padding: 8px 10px;
	font-weight: 400;
	word-break: break-word;
}

.ml-pivot-table__table th {
	font-weight: 600;
}

.ml-pivot-table__table.is-border th,
.ml-pivot-table__table.is-border td {
	border: 1px solid #dcdfe6;
}
</style>
