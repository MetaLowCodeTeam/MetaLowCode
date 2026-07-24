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
		<div v-show="!field.options.hidden" class="ml-bar-chart" :class="field.options.customClass">
			<div v-if="chartTitle && !config.hideTitle" class="ml-bar-chart__title">{{ chartTitle }}</div>
			<div class="ml-bar-chart__body" :class="{ 'is-live': !exportAsImage }" :style="bodyStyle">
				<img
					v-if="exportAsImage && chartImage"
					class="ml-bar-chart__image"
					:src="chartImage"
					:alt="chartTitle || field.options.label || '柱状图'"
				/>
				<div
					ref="chartRef"
					class="ml-bar-chart__renderer"
					:class="{ 'is-export-renderer': exportAsImage && chartImage }"
					:style="bodyStyle"
				></div>
			</div>
		</div>
	</static-content-wrapper>
</template>

<script>
import * as echarts from 'echarts'
import VisualDesign from '@/../lib/visual-design/designer.umd.js'

const { StaticContentWrapper, emitter, i18n, fieldMixin } = VisualDesign.VFormSDK

export default {
	name: 'ml-bar-chart-widget',
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
	data() {
		return {
			chart: null,
			chartImage: '',
			reportFormDataCache: null,
			eventFunctionMapping: {},
			customChartOption: null,
		}
	},
	computed: {
		config() {
			return this.field.options.barChartConfig || {}
		},
		chartTitle() {
			return this.config.title || this.field.options.label
		},
		bodyStyle() {
			const height = Number(this.config.height) || 260
			return {
				width: this.config.width || '100%',
				height: `${height}px`,
			}
		},
		exportAsImage() {
			return true
		},
		formModel() {
			return this.globalModel?.formModel || {}
		},
		reportFormData() {
			return this.reportFormDataCache || this.getGlobalDsv?.()?.__reportFormData || this.formModel || {}
		},
	},
	watch: {
		'field.options.barChartConfig': {
			deep: true,
			handler() {
				this.renderChart()
			},
		},
	},
	created() {
		this.registerToRefList()
		this.initEventHandler()
		this.initReportChartEventHandler()
		this.handleOnCreated()
	},
	mounted() {
		this.renderChart()
		this.handleOnMounted()
		window.addEventListener('resize', this.resizeChart)
	},
	beforeUnmount() {
		window.removeEventListener('resize', this.resizeChart)
		this.disposeChart()
		if (this.eventFunctionMapping.setFormData) {
			this.off$('setFormData', this.eventFunctionMapping.setFormData)
		}
		this.unregisterFromRefList()
	},
	inject: {
		refList: { default: null },
		globalModel: { default: null },
		getGlobalDsv: { default: null },
	},
	methods: {
		initReportChartEventHandler() {
			if (this.designState) {
				return
			}
			this.eventFunctionMapping.setFormData = (params) => {
				this.reportFormDataCache = params?.[0] || {}
				this.renderChart()
			}
			this.on$('setFormData', this.eventFunctionMapping.setFormData)
		},
		reloadReportChartData(formData) {
			this.reportFormDataCache = formData || this.reportFormData
			this.renderChart()
		},
		getData() {
			return this.buildOption()
		},
		setChartData(option) {
			this.customChartOption = option || null
			this.renderChart()
		},
		clearChartData() {
			this.customChartOption = null
			this.renderChart()
		},
		buildDashboardChartData() {
			if (this.isDashboardChartData(this.field.options.chartData)) {
				return this.field.options.chartData
			}
			if (this.isDashboardChartData(this.config.chartData)) {
				return this.config.chartData
			}
			const dimensions = this.config.setDimensional?.dimension || this.field.options.setDimensional?.dimension || []
			const metrics = this.config.setDimensional?.metrics || this.field.options.setDimensional?.metrics || []
			const sourceRows = this.resolveSourceRows(dimensions, metrics)
			if (sourceRows.length > 0 && dimensions.length > 0 && metrics.length > 0) {
				return this.buildChartDataFromReportData(sourceRows, dimensions, metrics)
			}
			return this.designer || this.designState
				? {
					xAxis: ['示例一', '示例二', '示例三'],
					yAxis: [this.getFieldAlias(metrics[0]) || '指标'],
					series: [{
						name: this.getFieldAlias(metrics[0]) || '指标',
						data: [120, 200, 150],
					}],
				}
				: { xAxis: [], yAxis: [], series: [] }
		},
		isDashboardChartData(data) {
			return data && !Array.isArray(data) && Array.isArray(data.xAxis) && Array.isArray(data.series)
		},
		resolveSourceRows(dimensions, metrics) {
			const modelCode = this.getFieldModelCode(dimensions[0]) || this.getFieldModelCode(metrics[0]) || this.field.options?.modelAssociationId
			const modelData = modelCode ? this.reportFormData?.[modelCode] : null
			if (Array.isArray(modelData)) {
				return modelData
			}
			if (modelData && typeof modelData === 'object') {
				return [modelData]
			}
			if (Array.isArray(this.reportFormData)) {
				return this.reportFormData
			}
			return []
		},
		buildChartDataFromReportData(sourceRows, dimensions, metrics) {
			const groupMap = new Map()
			sourceRows.forEach((row) => {
				const dimensionValues = dimensions.map((dimension) => this.formatDimensionValue(this.getRowFieldValue(row, dimension), dimension))
				const groupName = dimensionValues.join(' / ') || '空'
				if (!groupMap.has(groupName)) {
					groupMap.set(groupName, {
						name: groupName,
						metrics: metrics.map(() => this.createMetricAggregator()),
					})
				}
				const target = groupMap.get(groupName)
				metrics.forEach((metric, metricIndex) => {
					this.collectMetricValue(target.metrics[metricIndex], this.getRowFieldValue(row, metric), metric?.calcMode || 'count')
				})
			})
			const groups = this.sortChartGroups(Array.from(groupMap.values()), dimensions, metrics)
			return {
				xAxis: groups.map((group) => group.name),
				yAxis: metrics.map((metric) => this.getFieldAlias(metric) || '指标'),
				series: metrics.map((metric, metricIndex) => ({
					name: this.getFieldAlias(metric) || '指标',
					data: groups.map((group) => this.getMetricResult(group.metrics[metricIndex], metric?.calcMode || 'count')),
				})),
			}
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
		sortChartGroups(groups, dimensions, metrics) {
			const dimensionSort = dimensions.find((item) => item.sort)?.sort
			if (dimensionSort === 'ASC' || dimensionSort === 'DESC') {
				return groups.sort((a, b) => {
					const result = String(a.name).localeCompare(String(b.name), 'zh-Hans-CN')
					return dimensionSort === 'DESC' ? -result : result
				})
			}
			const metricIndex = metrics.findIndex((item) => item.sort === 'ASC' || item.sort === 'DESC')
			if (metricIndex > -1) {
				const metric = metrics[metricIndex]
				return groups.sort((a, b) => {
					const aValue = this.getMetricResult(a.metrics[metricIndex], metric?.calcMode || 'count')
					const bValue = this.getMetricResult(b.metrics[metricIndex], metric?.calcMode || 'count')
					const result = (Number(aValue) || 0) - (Number(bValue) || 0)
					return metric.sort === 'DESC' ? -result : result
				})
			}
			return groups
		},
		parseRows() {
			const chartData = this.buildDashboardChartData()
			const firstSeries = chartData.series?.[0] || {}
			return (chartData.xAxis || []).map((name, index) => ({
				name,
				value: firstSeries.data?.[index] || 0,
				metricName: firstSeries.name || '指标',
			}))
		},
		getFieldModelCode(field) {
			const names = [
				field?.options?.modelAssociationId,
				field?.modelAssociationId,
				field?.dataCode,
				field?.metaModelName,
				field?.name,
				field?.options?.name,
			].filter(Boolean)
			for (const name of names) {
				if (name && this.reportFormData?.[name] !== undefined) {
					return name
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
			const candidates = [field?.name, field?.options?.name, field?.fieldName].filter(Boolean)
			for (const candidate of candidates) {
				if (modelCode && candidate.startsWith(modelCode + '.')) {
					return candidate.slice(modelCode.length + 1)
				}
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
			const candidates = [
				rawName,
				field.options?.name,
				field.fieldName,
				field.name,
			].filter(Boolean)
			for (const candidate of candidates) {
				if (row[candidate] !== undefined) {
					return row[candidate]
				}
			}
			return null
		},
		getFieldAlias(field) {
			return field?.alias || field?.fieldLabel || field?.label || field?.displayName || field?.fieldName || field?.name || ''
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
		buildOption() {
			if (this.customChartOption) {
				let opt = JSON.parse(JSON.stringify(this.customChartOption))
				if (!opt.animation) opt.animation = false
				if (!opt.grid) opt.grid = { top: 28, right: 20, bottom: 36, left: 48, containLabel: true }
				if (opt.legend === undefined) opt.legend = { show: !!this.config.showLegend }
				if (!opt.yAxis) opt.yAxis = { type: 'value' }
				if (!opt.xAxis && opt.series && opt.series.length) {
					opt.xAxis = { type: 'category', data: [] }
				}
				return opt
			}
			const chartData = this.buildDashboardChartData()
			return {
				animation: false,
				color: ['#409eff'],
				grid: { top: 28, right: 20, bottom: 36, left: 48, containLabel: true },
				legend: { show: !!this.config.showLegend },
				xAxis: {
					type: 'category',
					data: [...(chartData.xAxis || [])],
					axisTick: { alignWithLabel: true },
				},
				yAxis: {
					type: 'value',
				},
				series: (chartData.series || []).map((seriesItem) => ({
					...seriesItem,
					data: [...(seriesItem.data || [])],
					type: 'bar',
					barMaxWidth: 42,
					label: {
						show: !!this.config.showLabel,
						position: 'top',
					},
				})),
			}
		},
		renderChart() {
			if (this._rendering) return
			this._rendering = true
			this.$nextTick(() => {
				if (!this.$refs.chartRef) {
					this._rendering = false
					return
				}
				if (!this.chart) {
					this.chart = echarts.init(this.$refs.chartRef, null, { renderer: 'canvas' })
				}
				if (this.exportAsImage) {
					this.chartImage = ''
					this.chart.off('finished')
					this.chart.on('finished', this.updateChartImage)
				}
				requestAnimationFrame(() => {
					try {
						this.chart.setOption(this.buildOption(), true)
						this.chart.resize()
					} catch (e) {
						console.warn('chart error:', e)
					}
					if (!this.exportAsImage) {
						this.chartImage = ''
					}
					this._rendering = false
				})
			})
		},
		updateChartImage() {
			requestAnimationFrame(() => {
				if (!this.chart || !this.exportAsImage) {
					return
				}
				this.chartImage = this.chart.getDataURL({
					type: 'png',
					pixelRatio: 2,
					backgroundColor: '#ffffff',
				})
			})
		},
		resizeChart() {
			if (this.chart) {
				this.chart.resize()
			}
		},
		disposeChart() {
			if (this.chart) {
				this.chart.off('finished')
				this.chart.dispose()
				this.chart = null
			}
		},
	},
}
</script>

<style scoped lang="scss">
.ml-bar-chart {
	padding: 6px 0;
	color: #303133;
}

.ml-bar-chart__title {
	margin-bottom: 8px;
	font-size: 16px;
	font-weight: 600;
	line-height: 1.4;
}

.ml-bar-chart__body {
	position: relative;
	min-height: 180px;
	background: #fff;
}

.ml-bar-chart__image {
	display: block;
	width: 100%;
	height: 100%;
	object-fit: contain;
}

.ml-bar-chart__placeholder {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 100%;
	height: 100%;
	min-height: 180px;
	color: #909399;
	border: 1px dashed #dcdfe6;
}

.ml-bar-chart__renderer {
	width: 100%;
	height: 100%;
}

.ml-bar-chart__renderer.is-export-renderer {
	position: absolute;
	left: 0;
	top: 0;
	pointer-events: none;
	opacity: 0;
	z-index: -1;
}
</style>
