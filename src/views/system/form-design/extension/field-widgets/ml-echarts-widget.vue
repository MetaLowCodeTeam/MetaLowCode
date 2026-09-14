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
		<div v-show="!field.options.hidden" class="ml-echarts" :class="field.options.customClass">
			<div class="ml-echarts__body" :style="bodyStyle">
				<img
					v-if="chartImage"
					class="ml-echarts__image"
					:src="chartImage"
					:alt="field.options.label || 'ECharts'"
				/>
				<div
					ref="chartRef"
					class="ml-echarts__renderer"
					:class="{ 'is-export-renderer': chartImage }"
					:style="bodyStyle"
				></div>
				<div v-if="eventError" class="ml-echarts__error">{{ eventError }}</div>
			</div>
		</div>
	</static-content-wrapper>
</template>

<script>
import { markRaw } from 'vue'
import * as echarts from 'echarts'
import 'echarts-liquidfill'
import VisualDesign from '@/../lib/visual-design/designer.umd.js'

const { StaticContentWrapper, emitter, i18n, fieldMixin } = VisualDesign.VFormSDK

export default {
	name: 'ml-echarts-widget',
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
			chartOption: null,
			notMerge: true,
			eventError: '',
			eventFunctionMapping: {},
			_pendingRender: false,
			_formDataReadyFired: false,
		}
	},
	computed: {
		config() {
			return this.field.options.echartsConfig || {}
		},
		bodyStyle() {
			const height = Number(this.config.height) || 260
			return {
				width: this.config.width || '100%',
				height: `${height}px`,
			}
		},
		formModel() {
			return this.globalModel?.formModel || {}
		},
		reportFormData() {
			return this.getGlobalDsv?.()?.__reportFormData || this.formModel || {}
		},
	},
	watch: {
		'field.options.echartsConfig': {
			deep: true,
			handler() {
				this.renderChart()
			},
		},
	},
	inject: {
		refList: { default: null },
		globalModel: { default: null },
		getGlobalDsv: { default: null },
	},
	created() {
		this.registerToRefList()
		this.initEventHandler()
		this.initEchartsEventHandler()
		this.handleOnCreated()
	},
	mounted() {
		this.renderChart()
		this.handleOnMounted()
		this.$nextTick(() => {
			this.tryFireLoopFormDataReady()
		})
		window.addEventListener('resize', this.resizeEcharts)
	},
	beforeUnmount() {
		window.removeEventListener('resize', this.resizeEcharts)
		if (this.eventFunctionMapping.setFormData) {
			this.off$('setFormData', this.eventFunctionMapping.setFormData)
		}
		this.disposeEcharts()
		this.unregisterFromRefList()
	},
	methods: {
		initEchartsEventHandler() {
			if (this.designState) return
			this.eventFunctionMapping.setFormData = (params) => {
				this.handleOnFormDataReady(params?.[0] || this.reportFormData)
			}
			this.on$('setFormData', this.eventFunctionMapping.setFormData)
		},
		handleOnFormDataReady(formData) {
			if (this.designState || this.designer || (this.loopRowData && this._formDataReadyFired)) return
			if (!this.field.options?.onFormDataReady) return
			if (this.loopRowData) {
				this._formDataReadyFired = true
			}
			const scopeData = this.loopRowData || formData
			this.eventError = ''
			try {
				const fn = new Function('formData', 'key', 'value', this.field.options.onFormDataReady)
				const result = fn.call(this, scopeData, '', scopeData)
				if (result && typeof result.then === 'function') {
					result.catch(this.handleEventError)
				}
			} catch (error) {
				this.handleEventError(error)
			}
		},
		tryFireLoopFormDataReady() {
			if (this.loopRowData && typeof this.loopRowData === 'object') {
				this.handleOnFormDataReady(this.loopRowData)
			}
		},
		handleEventError(error) {
			console.error('ECharts onFormDataReady error', error)
			this.eventError = error?.message || 'ECharts 数据事件执行失败'
		},
		setValue(option, notMerge = true) {
			if (!option || typeof option !== 'object' || Array.isArray(option)) return
			this.eventError = ''
			this.chartOption = markRaw(option)
			this.notMerge = notMerge
			this.renderChart()
		},
		setEchartsOption(option, notMerge = true) {
			this.setValue(option, notMerge)
		},
		getEchartsInstance() {
			return this.chart
		},
		getData() {
			return this.chartOption
		},
		getValue() {
			return this.chartOption
		},
		clearEcharts() {
			this.chartOption = null
			this.chartImage = ''
			this.chart?.clear()
		},
		resizeEcharts() {
			if (this.chart) {
				this.chart.resize()
			}
		},
		buildOption() {
			if (this.chartOption) {
				return this.chartOption
			}
			if (this.designer || this.designState) {
				return {
					animation: false,
					title: {
						text: 'ECharts',
						left: 'center',
						top: 'middle',
						textStyle: { color: '#909399', fontSize: 20, fontWeight: 'normal' },
					},
					graphic: [{
						type: 'text',
						left: 'center',
						top: '58%',
						style: { text: '请在 onFormDataReady 中设置 option', fill: '#c0c4cc', fontSize: 13 },
					}],
				}
			}
			return { animation: false, series: [] }
		},
		renderChart() {
			if (this._rendering) {
				this._pendingRender = true
				return
			}
			this._rendering = true
			this._pendingRender = false
			this.$nextTick(() => {
				if (!this.$refs.chartRef) {
					this._rendering = false
					return
				}
				if (!this.chart) {
					this.chart = markRaw(echarts.init(this.$refs.chartRef, null, { renderer: 'canvas' }))
				}
				this.chartImage = ''
				this.chart.off('finished')
				this.chart.on('finished', this.updateChartImage)
				requestAnimationFrame(() => {
					try {
						this.chart.setOption(this.buildOption(), this.notMerge)
						this.chart.resize()
					} catch (error) {
						this.handleEventError(error)
					}
					this._rendering = false
					if (this._pendingRender) {
						this.renderChart()
					}
				})
			})
		},
		updateChartImage() {
			requestAnimationFrame(() => {
				if (!this.chart) return
				try {
					this.chartImage = this.chart.getDataURL({
						type: 'png',
						pixelRatio: 2,
						backgroundColor: '#ffffff',
					})
				} catch (error) {
					console.error('ECharts image export error', error)
				}
			})
		},
		disposeEcharts() {
			if (!this.chart) return
			this.chart.off('finished')
			this.chart.dispose()
			this.chart = null
		},
	},
}
</script>

<style scoped lang="scss">
.ml-echarts {
	padding: 6px 0;
}

.ml-echarts__body {
	position: relative;
	min-height: 120px;
	background: #fff;
}

.ml-echarts__image {
	display: block;
	width: 100%;
	height: 100%;
	object-fit: contain;
}

.ml-echarts__renderer {
	width: 100%;
	height: 100%;
}

.ml-echarts__renderer.is-export-renderer {
	position: absolute;
	top: 0;
	left: 0;
	z-index: -1;
	pointer-events: none;
	opacity: 0;
}

.ml-echarts__error {
	position: absolute;
	right: 8px;
	bottom: 8px;
	left: 8px;
	padding: 6px 10px;
	color: #f56c6c;
	font-size: 12px;
	background: rgb(254 240 240 / 92%);
	border: 1px solid #fde2e2;
	border-radius: 4px;
}
</style>
