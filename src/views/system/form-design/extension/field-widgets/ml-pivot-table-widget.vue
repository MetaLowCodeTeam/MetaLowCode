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
	computed: {
		config() {
			return this.field.options.pivotTableConfig || {}
		},
		tableTitle() {
			return this.config.title || this.field.options.label
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
		rowField() {
			return this.dimensionRows[0]?.fieldName || this.config.rowField || ''
		},
		columnField() {
			return this.dimensionCols[0]?.fieldName || this.config.columnField || ''
		},
		valueField() {
			return this.metrics[0]?.fieldName || this.config.valueField || ''
		},
		rowHeaderLabel() {
			return this.dimensionRows.map(this.getFieldAlias).filter(Boolean).join(' / ') || this.config.rowField || '维度行'
		},
		pivotColumns() {
			if (this.sourceRows.length > 0 && this.columnField) {
				return [...new Set(this.sourceRows.map(row => row[this.columnField]).filter(value => value !== undefined && value !== null))]
			}
			const columns = this.dimensionCols.map(this.getFieldAlias).filter(Boolean)
			if (columns.length > 0) {
				return columns
			}
			return this.metrics.map(this.getFieldAlias).filter(Boolean)
		},
		pivotRows() {
			if (this.sourceRows.length === 0 || !this.rowField || !this.valueField) {
				return this.previewRows
			}
			const rowMap = new Map()
			this.sourceRows.forEach(row => {
				const rowKey = row[this.rowField] || ''
				const colKey = this.columnField ? row[this.columnField] : this.getFieldAlias(this.metrics[0])
				const value = Number(row[this.valueField]) || 0
				if (!rowMap.has(rowKey)) {
					rowMap.set(rowKey, { key: rowKey, values: {}, counts: {}, total: 0, count: 0 })
				}
				const target = rowMap.get(rowKey)
				target.values[colKey] = (target.values[colKey] || 0) + value
				target.counts[colKey] = (target.counts[colKey] || 0) + 1
				target.total += value
				target.count += 1
			})
			const rows = Array.from(rowMap.values())
			if (this.config.aggregateType === 'avg') {
				rows.forEach(row => {
					Object.keys(row.values).forEach(col => {
						row.values[col] = row.counts[col] ? row.values[col] / row.counts[col] : 0
					})
					row.total = row.count ? row.total / row.count : 0
				})
			}
			if (this.config.aggregateType === 'count') {
				rows.forEach(row => {
					Object.keys(row.values).forEach(col => {
						row.values[col] = row.counts[col] || 0
					})
					row.total = row.count || 0
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
	},
	mounted() {
		this.handleOnMounted()
	},
	beforeUnmount() {
		this.unregisterFromRefList()
	},
	methods: {
		getFieldAlias(field) {
			return field?.alias || field?.fieldLabel || field?.label || field?.displayName || field?.fieldName || field?.name || ''
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
