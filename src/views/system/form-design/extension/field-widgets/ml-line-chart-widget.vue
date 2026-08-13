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
		<div v-show="!field.options.hidden" class="ml-line-chart" :class="field.options.customClass">
			<div v-if="chartTitle && !config.hideTitle" class="ml-line-chart__title">{{ chartTitle }}</div>
			<div class="ml-line-chart__body" :class="{ 'is-live': !exportAsImage }" :style="bodyStyle">
				<img
					v-if="exportAsImage && chartImage"
					class="ml-line-chart__image"
					:src="chartImage"
					:alt="chartTitle || field.options.label || '折线图'"
				/>
				<div
					ref="chartRef"
					class="ml-line-chart__renderer"
					:class="{ 'is-export-renderer': exportAsImage && chartImage }"
					:style="bodyStyle"
				></div>
			</div>
		</div>
	</static-content-wrapper>
</template>

<script>
import * as echarts from 'echarts'
import { markRaw } from 'vue'
import VisualDesign from '@/../lib/visual-design/designer.umd.js'

const { StaticContentWrapper, emitter, i18n, fieldMixin } = VisualDesign.VFormSDK


export default {
	name: 'ml-line-chart-widget',
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
	data() {
		return {
			chart: null,
			chartImage: '',
			reportFormDataCache: null,
			eventFunctionMapping: {},
			customChartOption: null,
			_pendingRender: false,
			_formDataReadyFired: false,
		}
	},
	computed: {
		config() {
			return this.field.options.lineChartConfig || {}
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
			// The designer needs the live ECharts canvas. Rendering it as a captured
			// image can keep an outdated chart geometry after option changes.
			return !this.designState && !this.designer
		},
		formModel() {
			return this.globalModel?.formModel || {}
		},
		reportFormData() {
			const cache = this.reportFormDataCache
			if (cache && typeof cache === 'object' && Object.keys(cache).length > 0) {
				return cache
			}
			return this.getGlobalDsv?.()?.__reportFormData || this.formModel || {}
		},
	},
	watch: {
		'field.options.lineChartConfig': {
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
		this.$nextTick(() => {
			this.tryFireLoopFormDataReady()
		})
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
			if (this.designState) return
			this.eventFunctionMapping.setFormData = (params) => {
				const data = params?.[0]
				if (data && typeof data === 'object' && Object.keys(data).length > 0) {
					this.reportFormDataCache = data
				}
				this.renderChart()
				this.handleOnFormDataReady(this.reportFormData)
			}
			this.on$('setFormData', this.eventFunctionMapping.setFormData)
		},
		reloadReportChartData(formData) {
			this.reportFormDataCache = formData || this.reportFormData
			this.renderChart()
		},
		getData() { return this.buildOption() },
		getValue() { return this.buildOption() },
		setValue(option) {
			if (!option || typeof option !== 'object' || Array.isArray(option)) return
			this.customChartOption = option
			this.renderChart()
		},
		setChartData(option) {
			this.setValue(option)
		},
		clearChartData() {
			this.customChartOption = null
			this.renderChart()
		},
		handleOnFormDataReady(formData) {
			if (this.designState || this.designer || (this.loopRowData && this._formDataReadyFired)) return
			if (this.field.options?.onFormDataReady) {
				if (this.loopRowData) {
					this._formDataReadyFired = true
				}
				const bindCode = this.config.bindModelCode || this.getFieldModelCode(this.config.setDimensional?.dimension?.[0]) || ''
				const scopeData = this.loopRowData || (bindCode && formData ? formData[bindCode] : formData)
				const fn = new Function("formData", "key", "value", this.field.options.onFormDataReady)
				fn.call(this, scopeData, bindCode, scopeData)
			}
		},
		tryFireLoopFormDataReady() {
			if (this.loopRowData && typeof this.loopRowData === 'object') {
				this.handleOnFormDataReady(this.loopRowData)
			}
		},
		clearChartData() {
			this.customChartOption = null
			this.renderChart()
		},
		buildDashboardChartData() {
			if (this.isDashboardChartData(this.field.options.chartData)) return this.field.options.chartData
			if (this.isDashboardChartData(this.config.chartData)) return this.config.chartData
			const dimensions = this.config.setDimensional?.dimension || this.field.options.setDimensional?.dimension || []
			const metrics = this.config.setDimensional?.metrics || this.field.options.setDimensional?.metrics || []
			const sourceRows = this.resolveSourceRows(dimensions, metrics)
			if (sourceRows.length > 0 && dimensions.length > 0 && metrics.length > 0) {
				return this.buildChartDataFromReportData(sourceRows, dimensions, metrics)
			}
			return this.designer || this.designState
				? { xAxis: ['示例一', '示例二', '示例三'], yAxis: [this.getFieldAlias(metrics[0]) || '指标'], series: [{ name: this.getFieldAlias(metrics[0]) || '指标', data: [120, 200, 150] }] }
				: { xAxis: [], yAxis: [], series: [] }
		},
		isDashboardChartData(data) { return data && !Array.isArray(data) && Array.isArray(data.xAxis) && Array.isArray(data.series) },
		resolveSourceRows(dimensions, metrics) {
			const modelCode = this.getFieldModelCode(dimensions[0]) || this.getFieldModelCode(metrics[0]) || this.field.options?.modelAssociationId
			const modelData = modelCode ? this.reportFormData?.[modelCode] : null
			if (Array.isArray(modelData)) return modelData
			if (modelData && typeof modelData === 'object') return [modelData]
			if (Array.isArray(this.reportFormData)) return this.reportFormData
			return []
		},
		buildChartDataFromReportData(sourceRows, dimensions, metrics) {
			const groupMap = new Map()
			sourceRows.forEach((row) => {
				const dimensionValues = dimensions.map((dimension) => this.formatDimensionValue(this.getRowFieldValue(row, dimension), dimension))
				const groupName = dimensionValues.join(' / ') || '空'
				if (!groupMap.has(groupName)) {
					groupMap.set(groupName, { name: groupName, metrics: metrics.map(() => this.createMetricAggregator()) })
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
		createMetricAggregator() { return { value: 0, count: 0, numberCount: 0, values: [], firstValue: undefined } },
		collectMetricValue(target, rawValue, calcMode) {
			const hasValue = rawValue !== undefined && rawValue !== null && rawValue !== ''
			if (hasValue) { if (target.firstValue === undefined) { target.firstValue = rawValue }; target.count += 1; target.values.push(rawValue) }
			if (calcMode === 'sum' || calcMode === 'average' || calcMode === 'max' || calcMode === 'min') {
				const numberValue = Number(rawValue)
				if (!Number.isNaN(numberValue)) {
					target.numberCount += 1
					if (calcMode === 'max') { target.value = target.numberCount === 1 ? numberValue : Math.max(target.value, numberValue) }
					else if (calcMode === 'min') { target.value = target.numberCount === 1 ? numberValue : Math.min(target.value, numberValue) }
					else { target.value += numberValue }
				}
			}
		},
		getMetricResult(target, calcMode) {
			if (calcMode === 'first') return target.firstValue === undefined ? '' : target.firstValue
			if (calcMode === 'textJoin') return target.values.join('，')
			if (calcMode === 'textDistinctJoin') return Array.from(new Set(target.values.map((v) => String(v)))).join('，')
			if (calcMode === 'count') return target.count
			if (calcMode === 'countSet') return new Set(target.values.map((v) => String(v))).size
			if (calcMode === 'average') return target.numberCount ? target.value / target.numberCount : 0
			return target.value
		},
		sortChartGroups(groups, dimensions, metrics) {
			const dimensionSort = dimensions.find((item) => item.sort)?.sort
			if (dimensionSort === 'ASC' || dimensionSort === 'DESC') {
				return groups.sort((a, b) => { const r = String(a.name).localeCompare(String(b.name), 'zh-Hans-CN'); return dimensionSort === 'DESC' ? -r : r })
			}
			const metricIndex = metrics.findIndex((item) => item.sort === 'ASC' || item.sort === 'DESC')
			if (metricIndex > -1) {
				const metric = metrics[metricIndex]
				return groups.sort((a, b) => {
					const aV = this.getMetricResult(a.metrics[metricIndex], metric?.calcMode || 'count')
					const bV = this.getMetricResult(b.metrics[metricIndex], metric?.calcMode || 'count')
					const r = (Number(aV) || 0) - (Number(bV) || 0)
					return metric.sort === 'DESC' ? -r : r
				})
			}
			return groups
		},
		parseRows() {
			const chartData = this.buildDashboardChartData()
			const firstSeries = chartData.series?.[0] || {}
			return (chartData.xAxis || []).map((name, index) => ({ name, value: firstSeries.data?.[index] || 0, metricName: firstSeries.name || '指标' }))
		},
		getFieldModelCode(field) {
			const names = [field?.options?.modelAssociationId, field?.modelAssociationId, field?.dataCode, field?.metaModelName, field?.name, field?.options?.name].filter(Boolean)
			for (const name of names) {
				if (name && this.reportFormData?.[name] !== undefined) return name
				if (name && name.includes('.')) { const mc = name.slice(0, name.indexOf('.')); if (this.reportFormData?.[mc] !== undefined) return mc }
			}
			return ''
		},
		getFieldRawName(field) {
			const mc = this.getFieldModelCode(field)
			const candidates = [field?.name, field?.options?.name, field?.fieldName].filter(Boolean)
			for (const c of candidates) { if (mc && c.startsWith(mc + '.')) return c.slice(mc.length + 1) }
			const dotted = candidates.find((c) => c.includes('.'))
			return dotted ? dotted.slice(dotted.lastIndexOf('.') + 1) : (candidates[0] || '')
		},
		getRowFieldValue(row, field) {
			if (!row || !field) return null
			const rawName = this.getFieldRawName(field)
			const candidates = [rawName, field.options?.name, field.fieldName, field.name].filter(Boolean)
			for (const c of candidates) { if (row[c] !== undefined) return row[c] }
			return null
		},
		getFieldAlias(field) { return field?.alias || field?.fieldLabel || field?.label || field?.displayName || field?.fieldName || field?.name || '' },
		formatDimensionValue(value, field) {
			if (value === null || value === undefined || value === '') return '空'
			if ((field?.type === 'Date' || field?.type === 'DateTime') && typeof value === 'string') return this.formatDateValue(value, field.dateFormat)
			return String(value)
		},
		formatDateValue(value, dateFormat) {
			const date = new Date(value)
			if (Number.isNaN(date.getTime())) return value
			const y = date.getFullYear(), m = String(date.getMonth() + 1).padStart(2, '0'), d = String(date.getDate()).padStart(2, '0'), q = Math.floor(date.getMonth() / 3) + 1
			const map = { 1: `${y}-${m}-${d}`, 2: `${y}年第${q}季度`, 3: `${y}-${m}`, 4: `${y}`, 5: `${m}`, 6: `${d}` }
			return map[dateFormat] || value
		},
		buildOption() {
			if (this.designState) {
				return {
					animation: false,
					grid: { top: 28, right: 20, bottom: 36, left: 48, containLabel: true },
					xAxis: { type: 'category', data: ['示例一', '示例二', '示例三'] },
					yAxis: { type: 'value' },
					series: [{ type: 'line', data: [120, 200, 150], smooth: true, label: { show: true, position: 'top' } }],
				}
			}
			// The designer can temporarily provide an incomplete option while a
			// widget is being edited. Keep its preview on the canonical chart shape;
			// runtime/report rendering still honors custom chart options below.
			if (this.customChartOption && !this.designState) {
				let opt = JSON.parse(JSON.stringify(this.customChartOption))
				if (!opt.animation) opt.animation = false
				if (!opt.grid) opt.grid = { top: 28, right: 20, bottom: 36, left: 48, containLabel: true }
				if (opt.legend === undefined) opt.legend = { show: !!this.config.showLegend }
				const rawYAxis = Array.isArray(opt.yAxis) ? opt.yAxis.find((axis) => axis && typeof axis === 'object') : opt.yAxis
				opt.yAxis = { ...(rawYAxis && typeof rawYAxis === 'object' ? rawYAxis : {}), type: 'value' }
				if (!opt.xAxis && opt.series && opt.series.length) {
					opt.xAxis = { type: 'category', data: [] }
				}
				const rawXAxis = Array.isArray(opt.xAxis) ? opt.xAxis.find((axis) => axis && typeof axis === 'object') : opt.xAxis
				const xAxisData = Array.isArray(rawXAxis?.data) ? rawXAxis.data : []
				opt.xAxis = {
					...(rawXAxis && typeof rawXAxis === 'object' ? rawXAxis : {}),
					type: 'category',
					data: xAxisData,
					boundaryGap: true,
					axisTick: { ...(rawXAxis?.axisTick || {}), alignWithLabel: true },
					axisLabel: { ...(rawXAxis?.axisLabel || {}), interval: 0, align: 'center' },
				}
				if (Array.isArray(opt.series)) {
					opt.series = opt.series.filter((s) => s && typeof s === 'object').map((s) => ({ type: 'line', ...s }))
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
					// Category labels and line points both use category centers.
					boundaryGap: true,
					axisTick: { alignWithLabel: true },
					axisLabel: { interval: 0, align: 'center' },
				},
				yAxis: { type: 'value' },
				series: (chartData.series || []).map((seriesItem) => ({
					...seriesItem,
					data: [...(seriesItem.data || [])],
					type: 'line',
					smooth: true,
					label: { show: !!this.config.showLabel, position: 'top' },
				})),
			}
		},
		renderChart() {
			if (this._rendering) {
				this._pendingRender = true
				return
			}
			this._rendering = true
			this._pendingRender = false
			this.$nextTick(() => {
				if (!this.$refs.chartRef) { this._rendering = false; return }
				if (!this.chart) this.chart = markRaw(echarts.init(this.$refs.chartRef, null, { renderer: 'canvas' }))
				if (this.exportAsImage) { this.chartImage = ''; this.chart.off('finished'); this.chart.on('finished', this.updateChartImage) }
				requestAnimationFrame(() => {
					try {
						this.chart.setOption(this.buildOption(), true)
						this.chart.resize()
					} catch (e) { /**/ }
					if (!this.exportAsImage) this.chartImage = ''
					this._rendering = false
					if (this._pendingRender) {
						this.renderChart()
					}
				})
			})
		},
		updateChartImage() {
			requestAnimationFrame(() => {
				if (!this.chart || !this.exportAsImage) return
				this.chartImage = this.chart.getDataURL({ type: 'png', pixelRatio: 2, backgroundColor: '#ffffff' })
			})
		},
		resizeChart() { if (this.chart) this.chart.resize() },
		disposeChart() { if (this.chart) { this.chart.off('finished'); this.chart.dispose(); this.chart = null } },
	},
}
</script>

<style scoped lang="scss">
.ml-line-chart { padding: 6px 0; color: #303133; }
.ml-line-chart__title { margin-bottom: 8px; font-size: 16px; font-weight: 600; line-height: 1.4; }
.ml-line-chart__body { position: relative; min-height: 180px; background: #fff; }
.ml-line-chart__image { display: block; width: 100%; height: 100%; object-fit: contain; }
.ml-line-chart__placeholder { display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; min-height: 180px; color: #909399; border: 1px dashed #dcdfe6; }
.ml-line-chart__renderer { width: 100%; height: 100%; }
.ml-line-chart__renderer.is-export-renderer { position: absolute; left: 0; top: 0; pointer-events: none; opacity: 0; z-index: -1; }
</style>
