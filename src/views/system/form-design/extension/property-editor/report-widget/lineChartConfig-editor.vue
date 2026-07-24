<template>
	<div v-if="optionModel.lineChartConfig">
		<el-form-item label="图表标题">
			<el-input v-model="optionModel.lineChartConfig.title" />
		</el-form-item>
		<el-form-item label="隐藏标题">
			<el-switch v-model="optionModel.lineChartConfig.hideTitle" />
		</el-form-item>
		<el-form-item label="宽度">
			<el-input v-model="optionModel.lineChartConfig.width" placeholder="100%" />
		</el-form-item>
		<el-form-item label="高度">
			<el-input-number v-model="optionModel.lineChartConfig.height" :min="120" :max="1200" style="width: 100%" />
		</el-form-item>
		<el-form-item label="显示图例">
			<el-switch v-model="optionModel.lineChartConfig.showLegend" />
		</el-form-item>
		<el-form-item label="显示数值">
			<el-switch v-model="optionModel.lineChartConfig.showLabel" />
		</el-form-item>
		<el-form-item label="维度指标设置">
			<el-button @click="openDimensionDialog">点击设置</el-button>
		</el-form-item>
		<el-drawer v-model="dimensionDialogVisible" title="维度指标设置" size="460">
			<div class="drawer-main">
				<div class="form-box" ref="formBoxRefs">
					<el-form label-width="60px">
						<el-form-item label="维度">
							<div class="input-box">
								<el-scrollbar max-height="132px">
									<VueDraggableNext
										v-model="draggableDimension"
										class="draggable-box"
										:group="{ name: dimensionGroupName, pull: false }"
										@add="(event) => addDimensionField(event, 'dimension')"
										@end="syncDimensional('dimension')"
									>
										<DimensionCom
											:model-value="dimension"
											chartType="lineChart"
											isDimension
											@onSort="onSort"
											@update:modelValue="(value) => updateDimensionList(value, 'dimension')"
										/>
									</VueDraggableNext>
								</el-scrollbar>
							</div>
						</el-form-item>
						<el-form-item label="指标">
							<div class="input-box">
								<el-scrollbar max-height="132px">
									<VueDraggableNext
										v-model="draggableMetrics"
										class="draggable-box"
										:group="{ name: dimensionGroupName, pull: false }"
										@add="(event) => addDimensionField(event, 'metrics')"
										@end="syncDimensional('metrics')"
									>
										<DimensionCom
											:model-value="metrics"
											chartType="lineChart"
											@onSort="onSort"
											@update:modelValue="(value) => updateDimensionList(value, 'metrics')"
										/>
									</VueDraggableNext>
								</el-scrollbar>
							</div>
						</el-form-item>
					</el-form>
				</div>
				<div class="item-box" :style="{ height: itemBoxHeight }">
					<div class="item-title">可用字段</div>
					<el-empty v-if="availableFields.length === 0" description="请先将折线图拖入已绑定元数据的循环容器" />
					<div v-else class="item-list-box">
						<el-scrollbar>
							<VueDraggableNext
								:list="availableFields"
								:sort="false"
								:group="{ name: dimensionGroupName, pull: 'clone', put: false }"
							>
								<div
									v-for="(item, index) in availableFields"
									:key="item.fieldName || item.name || index"
									class="item-list yichu"
									:title="item.fieldLabel"
								>
									{{ item.fieldLabel }}
								</div>
							</VueDraggableNext>
						</el-scrollbar>
					</div>
				</div>
			</div>
			<template #footer>
				<div style="flex: auto;padding-top: 10px;">
					<el-button type="primary" @click="dimensionDialogVisible = false">关闭</el-button>
				</div>
			</template>
		</el-drawer>
	</div>
</template>

<script>
import { VueDraggableNext } from 'vue-draggable-next'
import DimensionCom from '@/views/system/dashboard-design/charts/property-editor/components/DimensionCom.vue'

const cloneDeep = (data) => JSON.parse(JSON.stringify(data || []))

export default {
	name: 'lineChartConfig-editor',
	components: {
		VueDraggableNext,
		DimensionCom,
	},
	inject: {
		getServerMetaFields: {
			default: null,
		},
	},
	props: {
		designer: Object,
		selectedWidget: Object,
		optionModel: Object,
	},
	data() {
		return {
			dimensionDialogVisible: false,
			dimension: [],
			metrics: [],
			draggableDimension: [],
			draggableMetrics: [],
			dimensionGroupName: 'bar-chart-dimension-fields',
			itemBoxHeight: 'calc(100% - 175px)',
			currentAvailableFields: [],
			fieldTemplate: {
				alias: '',
				showEdit: false,
				editAlias: '',
				type: 'N',
				sort: '',
				dateFormat: 1,
				calcMode: 'count',
				thousandsSeparator: false,
				showDecimalPlaces: false,
				decimalPlaces: 2,
				showNumericUnits: false,
				numericUnits: '无',
			},
		}
	},
	computed: {
		availableFields() {
			const loopModel = this.getCurrentLoopModel()
			return (loopModel?.fieldList || []).map((field) => {
				const fieldLabel = field.options?.label || field.fieldLabel || field.label || field.displayName || field.options?.name || field.name
				const fieldName = field.options?.name || field.fieldName || field.name
				return {
					...this.fieldTemplate,
					...field,
					fieldLabel,
					fieldName,
					alias: fieldLabel,
					type: field.fieldType || field.type || field.options?.type || 'Text',
				}
			})
		},
	},
	watch: {
		optionModel: {
			deep: true,
			immediate: true,
			handler() {
				this.initDimensional()
			},
		},
	},
	methods: {
		initDimensional() {
			if (this.optionModel.setDimensional && !this.optionModel.lineChartConfig.setDimensional) {
				this.optionModel.lineChartConfig.setDimensional = cloneDeep(this.optionModel.setDimensional)
			}
			if (this.optionModel.setDimensional) {
				delete this.optionModel.setDimensional
			}
			if (!this.optionModel.lineChartConfig.setDimensional) {
				this.optionModel.lineChartConfig.setDimensional = { dimension: [], metrics: [] }
			}
			this.dimension = this.optionModel.lineChartConfig.setDimensional.dimension || []
			this.metrics = this.optionModel.lineChartConfig.setDimensional.metrics || []
			this.draggableDimension = cloneDeep(this.dimension)
			this.draggableMetrics = cloneDeep(this.metrics)
		},
		addDimensionField(event, target) {
			const field = cloneDeep([this.availableFields[event.oldIndex]])[0]
			if (!field) {
				return
			}
			if (target === 'dimension') {
				if (this.dimension.length >= 2) {
					this.$message.warning('添加失败，最多添加2个维度')
					this.initDimensional()
					return
				}
				this.dimension.push(field)
			} else if (target === 'metrics') {
				if (this.metrics.length >= 1) {
					this.$message.warning('添加失败，最多添加1个指标')
					this.initDimensional()
					return
				}
				this.metrics.push(field)
			}
			this.commitDimensional()
		},
		syncDimensional(target) {
			if (!this.optionModel.lineChartConfig.setDimensional) {
				this.optionModel.lineChartConfig.setDimensional = { dimension: [], metrics: [] }
			}
			if (target === 'dimension') {
				this.dimension = cloneDeep(this.draggableDimension.length ? this.draggableDimension : this.dimension)
				this.optionModel.lineChartConfig.setDimensional.dimension = this.dimension
			} else if (target === 'metrics') {
				this.metrics = cloneDeep(this.draggableMetrics.length ? this.draggableMetrics : this.metrics)
				this.optionModel.lineChartConfig.setDimensional.metrics = this.metrics
			}
			this.draggableDimension = cloneDeep(this.optionModel.lineChartConfig.setDimensional.dimension)
			this.draggableMetrics = cloneDeep(this.optionModel.lineChartConfig.setDimensional.metrics)
		},
		commitDimensional() {
			if (!this.optionModel.lineChartConfig.setDimensional) {
				this.optionModel.lineChartConfig.setDimensional = { dimension: [], metrics: [] }
			}
			this.optionModel.lineChartConfig.setDimensional.dimension = this.dimension
			this.optionModel.lineChartConfig.setDimensional.metrics = this.metrics
			this.draggableDimension = cloneDeep(this.dimension)
			this.draggableMetrics = cloneDeep(this.metrics)
		},
		updateDimensionList(value, target) {
			if (target === 'dimension') {
				this.dimension = value || []
			} else if (target === 'metrics') {
				this.metrics = value || []
			}
			this.commitDimensional()
		},
		onSort(event) {
			this.dimension.forEach((item) => { item.sort = '' })
			this.metrics.forEach((item) => { item.sort = '' })
			event.tag.sort = event.target
			this.optionModel.lineChartConfig.setDimensional.dimension = this.dimension
			this.optionModel.lineChartConfig.setDimensional.metrics = this.metrics
			this.draggableDimension = cloneDeep(this.dimension)
			this.draggableMetrics = cloneDeep(this.metrics)
		},
		openDimensionDialog() {
			this.dimensionDialogVisible = true
			this.$nextTick(() => {
				this.setItemBoxHeight()
			})
		},
		setItemBoxHeight() {
			const formHeight = this.$refs.formBoxRefs?.offsetHeight
			this.itemBoxHeight = formHeight ? `calc(100% - ${formHeight + 60}px)` : 'calc(100% - 175px)'
		},
		getCurrentLoopModel() {
			const metaFields = this.getMetaFields()
			const models = this.getMetaModels(metaFields)
			const loopContainer = this.getCurrentLoopContainer()
			const loopName = loopContainer?.options?.name

			if (loopName) {
				const matched = this.findMetaModelByName(models, loopName)
				if (matched) {
					return matched
				}
			}

			const boundLoops = this.collectBoundLoopContainers(this.designer?.widgetList || [], models)
			return boundLoops.length === 1 ? boundLoops[0].model : null
		},
		getCurrentLoopContainer() {
			const path = this.findWidgetPath(this.designer?.widgetList || [], this.selectedWidget)
			if (!path || path.length === 0) {
				return null
			}
			return path.slice(0, -1).reverse().find((widget) => widget?.type === 'loop-container') || null
		},
		getMetaFields() {
			if (this.designer?.rawMetaFields) {
				return this.designer.rawMetaFields
			}
			if (typeof this.getServerMetaFields === 'function') {
				const injectedMetaFields = this.getServerMetaFields()
				if (injectedMetaFields) {
					return injectedMetaFields
				}
			}
			return this.designer?.serverMetaFields ||
				this.designer?.metaFields ||
				{}
		},
		getMetaModels(metaFields) {
			const models = []
			if (metaFields?.main) {
				models.push(metaFields.main)
			}
			if (Array.isArray(metaFields?.detail)) {
				models.push(...metaFields.detail)
			}
			return models
		},
		findMetaModelByName(models, name) {
			const targetName = this.normalizeName(name)
			if (!targetName) {
				return null
			}
			return models.find((model) => this.getModelNames(model).includes(targetName)) || null
		},
		getModelNames(model) {
			return [
				model?.entityName,
				model?.entityLabel,
				model?.modelName,
				model?.modelLabel,
				model?.name,
				model?.label,
				model?.outerDataModelId,
				model?.el?.name,
				model?.el?.label,
			].map(this.normalizeName).filter(Boolean)
		},
		normalizeName(value) {
			return value === undefined || value === null ? '' : String(value).trim()
		},
		findWidgetPath(widgetList, targetWidget, parents = []) {
			if (!Array.isArray(widgetList) || !targetWidget) {
				return null
			}
			const targetId = this.normalizeName(targetWidget.id)
			const targetName = this.normalizeName(targetWidget.options?.name)
			const targetType = this.normalizeName(targetWidget.type)
			for (const widget of widgetList) {
				if (!widget) {
					continue
				}
				const nextParents = parents.concat(widget)
				const sameId = targetId && this.normalizeName(widget.id) === targetId
				const sameName = targetName && this.normalizeName(widget.options?.name) === targetName
				const sameType = targetType && this.normalizeName(widget.type) === targetType
				if (sameId || (sameName && sameType)) {
					return nextParents
				}
				const childLists = []
				if (Array.isArray(widget.widgetList)) {
					childLists.push(widget.widgetList)
				}
				if (Array.isArray(widget.cols)) {
					widget.cols.forEach((col) => childLists.push(col.widgetList))
				}
				if (Array.isArray(widget.rows)) {
					widget.rows.forEach((row) => row.cols?.forEach((cell) => childLists.push(cell.widgetList)))
				}
				if (Array.isArray(widget.tabs)) {
					widget.tabs.forEach((tab) => childLists.push(tab.widgetList))
				}
				for (const childList of childLists) {
					const found = this.findWidgetPath(childList, targetWidget, nextParents)
					if (found) {
						return found
					}
				}
			}
			return null
		},
		collectBoundLoopContainers(widgetList, models, result = []) {
			if (!Array.isArray(widgetList)) {
				return result
			}
			for (const widget of widgetList) {
				if (!widget) {
					continue
				}
				if (widget.type === 'loop-container') {
					const model = this.findMetaModelByName(models, widget.options?.name)
					if (model) {
						result.push({ widget, model })
					}
				}
				const childLists = []
				if (Array.isArray(widget.widgetList)) {
					childLists.push(widget.widgetList)
				}
				if (Array.isArray(widget.cols)) {
					widget.cols.forEach((col) => childLists.push(col.widgetList))
				}
				if (Array.isArray(widget.rows)) {
					widget.rows.forEach((row) => row.cols?.forEach((cell) => childLists.push(cell.widgetList)))
				}
				if (Array.isArray(widget.tabs)) {
					widget.tabs.forEach((tab) => childLists.push(tab.widgetList))
				}
				childLists.forEach((childList) => this.collectBoundLoopContainers(childList, models, result))
			}
			return result
		},
	},
}
</script>

<style scoped lang="scss">
.drawer-main {
	height: 100%;
	border-bottom: 1px solid #e5e5e5;

	.form-box {
		padding: 20px 20px 0;
		border-top: 1px solid #e5e5e5;

		.input-box {
			width: 100%;
			min-height: 32px;
			padding: 3px 10px;
			border: 1px solid #e5e5e5;
			border-radius: 4px;

			.draggable-box {
				min-height: 32px;

				:deep(.item-list) {
					display: none;
				}
			}
		}
	}

	.item-box {
		padding: 20px 0;
		border-top: 1px solid #e5e5e5;

		.item-title {
			padding-left: 20px;
			font-size: 14px;
			font-weight: 700;
		}

		.item-list-box {
			height: calc(100% - 20px);
			margin-top: 12px;
		}
	}
}

.item-list {
	height: 32px;
	padding-left: 20px;
	line-height: 32px;
	cursor: move;
	user-select: none;
}

.item-list:hover {
	background: #f5f7fa;
}
</style>
