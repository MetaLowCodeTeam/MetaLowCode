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
			<div v-if="tableTitle && !config.hideTitle" class="ml-pivot-table__title">{{ tableTitle }}</div>
			<table class="ml-pivot-table__table" :class="{ 'is-border': config.showBorder }" :style="tableStyle">
				<thead>
					<tr>
						<th :style="headerStyle">{{ rowHeaderLabel }}</th>
						<th v-for="col in pivotColumns" :key="col" :style="headerStyle">{{ col }}</th>
						<th v-if="config.showSumcol" :style="headerStyle">合计</th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="row in pivotRows" :key="row.key">
						<th :style="headerStyle">{{ row.key }}</th>
						<td v-for="col in pivotColumns" :key="col" :style="cellStyle">{{ formatValue(row.values[col]) }}</td>
						<td v-if="config.showSumcol" :style="cellStyle">{{ formatValue(row.total) }}</td>
					</tr>
					<tr v-if="config.showSummary">
						<th :style="headerStyle">合计</th>
						<td v-for="col in pivotColumns" :key="col" :style="cellStyle">{{ formatValue(columnTotals[col]) }}</td>
						<td v-if="config.showSumcol" :style="cellStyle">{{ formatValue(grandTotal) }}</td>
					</tr>
				</tbody>
			</table>
		</div>
	</static-content-wrapper>
</template>

<script>
import VisualDesign from '@/../lib/visual-design/designer.umd.js'

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
		}
	},
	computed: {
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
			}
		},
		headerStyle() {
			return {
				backgroundColor: '#f5f7fa',
				textAlign: this.config.textAlign || 'center',
			}
		},
		cellStyle() {
			return {
				textAlign: this.config.textAlign || 'center',
			}
		},
		sourceRows() {
			try {
				const bindCode = this.config.bindModelCode || this.getFieldModelCode(this.dimensionRows[0]) || this.getFieldModelCode(this.dimensionCols[0]) || this.getFieldModelCode(this.metrics[0]) || ''
				if (Array.isArray(this.reportFormDataCache)) {
					return this.reportFormDataCache
				}
				if (bindCode && this.reportFormData?.[bindCode]) {
					const data = this.reportFormData[bindCode]
					if (Array.isArray(data)) return data
					if (data && typeof data === 'object') return [data]
				}
				if (Array.isArray(this.reportFormData)) {
					return this.reportFormData
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
		pivotColumns() {
			if (this.sourceRows.length > 0) {
				if (this.dimensionCols.length > 0) {
					return [...new Set(this.sourceRows.map((row) => this.getCompositeDimensionValue(row, this.dimensionCols)).filter(Boolean))]
				}
				if (this.metrics.length > 1) {
					return this.metrics.map(this.getFieldAlias).filter(Boolean)
				}
			}
			const columns = this.dimensionCols.map(this.getFieldAlias).filter(Boolean)
			return columns.length > 0 ? columns : this.metrics.map(this.getFieldAlias).filter(Boolean)
		},
		pivotRows() {
			if (this.sourceRows.length === 0 || this.dimensionRows.length === 0 || this.metrics.length === 0) {
				return this.previewRows
			}
			const rowMap = new Map()
			this.sourceRows.forEach(row => {
				const rowKey = this.getCompositeDimensionValue(row, this.dimensionRows)
				if (!rowKey) {
					return
				}
				if (!rowMap.has(rowKey)) {
					rowMap.set(rowKey, { key: rowKey, values: {}, metricMap: {}, total: 0 })
				}
				const target = rowMap.get(rowKey)
				this.metrics.forEach((metric) => {
					const metricKey = this.getFieldAlias(metric) || '指标'
					const colKey = this.dimensionCols.length > 0
						? this.buildMetricColumnKey(this.getCompositeDimensionValue(row, this.dimensionCols), this.metrics.length > 1 ? metricKey : '')
						: metricKey
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
			const dimensionSort = this.dimensionRows.find((item) => item.sort)?.sort
			if (dimensionSort === 'ASC' || dimensionSort === 'DESC') {
				rows.sort((a, b) => {
					const result = String(a.key).localeCompare(String(b.key), 'zh-Hans-CN')
					return dimensionSort === 'DESC' ? -result : result
				})
			}
			return rows
		},
		previewRows() {
			const rowLabels = this.dimensionRows.map(this.getFieldAlias).filter(Boolean)
			if (rowLabels.length === 0) {
				return []
			}
			const columns = this.pivotColumns.length > 0 ? this.pivotColumns : ['指标']
			return rowLabels.map((label, index) => {
				const values = columns.reduce((result, col, colIndex) => {
					result[col] = (index + 1) * (colIndex + 1)
					return result
				}, {})
				const total = Object.values(values).reduce((sum, value) => sum + (Number(value) || 0), 0)
				return { key: label, values, total }
			})
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
		this.handleOnMounted()
	},
	beforeUnmount() {
		this.unregisterFromRefList()
		if (this.eventFunctionMapping.setFormData) {
			this.off$('setFormData', this.eventFunctionMapping.setFormData)
		}
	},
	methods: {
		initPivotEventHandler() {
			if (this.designState) return
			this.eventFunctionMapping.setFormData = (params) => {
				const data = params?.[0]
				if (data && typeof data === 'object' && Object.keys(data).length > 0) {
					this.reportFormDataCache = data
				}
				this.handleOnFormDataReady(this.reportFormData)
			}
			this.on$('setFormData', this.eventFunctionMapping.setFormData)
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
			if (this.designState || this.designer) return
			if (this.field.options?.onFormDataReady) {
				const bindCode = this.config.bindModelCode || ''
				let scopeData
				if (Array.isArray(formData)) {
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
		getFieldAlias(field) {
			return field?.alias || field?.fieldLabel || field?.label || field?.displayName || field?.fieldName || field?.name || ''
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
		getCompositeDimensionValue(row, fields = []) {
			const values = fields.map((field) => this.formatDimensionValue(this.getRowFieldValue(row, field), field)).filter((value) => value !== '')
			return values.join(' / ')
		},
		buildMetricColumnKey(columnKey, metricKey) {
			if (!columnKey) {
				return metricKey || '指标'
			}
			return metricKey ? `${columnKey} / ${metricKey}` : columnKey
		},
		resolveColumnCalcMode(columnKey) {
			if (this.dimensionCols.length === 0) {
				const metric = this.metrics.find((item) => (this.getFieldAlias(item) || '指标') === columnKey)
				return metric?.calcMode || this.metrics[0]?.calcMode || 'count'
			}
			if (this.metrics.length <= 1) {
				return this.metrics[0]?.calcMode || 'count'
			}
			const metric = this.metrics.find((item) => columnKey.endsWith(` / ${this.getFieldAlias(item) || '指标'}`))
			return metric?.calcMode || this.metrics[0]?.calcMode || 'count'
		},
		createMetricAggregator() {
			return {
				value: 0,
				count: 0,
				numberCount: 0,
				values: [],
			}
		},
		collectMetricValue(target, rawValue, calcMode) {
			const hasValue = rawValue !== undefined && rawValue !== null && rawValue !== ''
			if (hasValue) {
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
			if (calcMode === 'count') {
				return target.count
			}
			if (calcMode === 'countSet') {
				return new Set(target.values.map((value) => String(value))).size
			}
			if (calcMode === 'average') {
				return target.numberCount ? target.value / target.numberCount : 0
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
