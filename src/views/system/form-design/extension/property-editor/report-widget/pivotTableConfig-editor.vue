<template>
	<div v-if="optionModel.pivotTableConfig">
		<el-form-item label="表格标题">
			<el-input v-model="optionModel.pivotTableConfig.title" />
		</el-form-item>
		<el-form-item label="隐藏标题">
			<el-switch v-model="optionModel.pivotTableConfig.hideTitle" />
		</el-form-item>
		<el-form-item label="宽度">
			<el-input v-model="optionModel.pivotTableConfig.width" placeholder="100%" />
		</el-form-item>
		<el-form-item label="显示边框">
			<el-switch v-model="optionModel.pivotTableConfig.showBorder" />
		</el-form-item>
		<el-form-item label="字体大小">
			<el-input-number v-model="optionModel.pivotTableConfig.fontSize" :min="1" :max="100" />
			<span class="style-unit">px</span>
		</el-form-item>
		<el-form-item label="单元格内边距">
			<el-input v-model="optionModel.pivotTableConfig.cellPadding" placeholder="2px 4px" />
		</el-form-item>
		<el-form-item label="边框宽度">
			<el-input-number v-model="optionModel.pivotTableConfig.borderWidth" :min="0" :max="20" />
			<span class="style-unit">px</span>
		</el-form-item>
		<el-form-item label="边框颜色">
			<el-color-picker v-model="optionModel.pivotTableConfig.borderColor" />
		</el-form-item>
		<el-form-item label="行高">
			<el-input-number v-model="optionModel.pivotTableConfig.rowHeight" :min="0" :max="200" />
			<span class="style-unit">px</span>
		</el-form-item>
		<el-form-item label="空值展示">
			<el-input v-model="optionModel.pivotTableConfig.emptyText" placeholder="留空则不展示" />
		</el-form-item>
		<el-form-item label="表格布局">
			<el-radio-group v-model="optionModel.pivotTableConfig.tableLayout">
				<el-radio-button value="fixed">固定</el-radio-button>
				<el-radio-button value="auto">自动</el-radio-button>
			</el-radio-group>
		</el-form-item>
		<el-form-item label="文字对齐">
			<el-radio-group v-model="optionModel.pivotTableConfig.textAlign">
				<el-radio-button value="left">居左</el-radio-button>
				<el-radio-button value="center">居中</el-radio-button>
				<el-radio-button value="right">居右</el-radio-button>
			</el-radio-group>
		</el-form-item>
		<el-form-item label="汇总行显示">
			<el-switch v-model="optionModel.pivotTableConfig.showSummary" />
		</el-form-item>
		<el-form-item label="汇总列显示">
			<el-switch v-model="optionModel.pivotTableConfig.showSumcol" />
		</el-form-item>
		<el-form-item label="绑定数据模型">
			<el-select v-model="optionModel.pivotTableConfig.bindModelCode" placeholder="请选择数据模型" filterable clearable>
				<el-option v-for="m in modelOptions" :key="m.value" :label="m.label" :value="m.value" />
			</el-select>
		</el-form-item>
		<el-form-item label="维度指标设置">
			<el-button @click="openDimensionDialog">点击设置</el-button>
		</el-form-item>
		<el-drawer v-model="dimensionDialogVisible" title="维度指标设置" size="460">
			<div class="drawer-main">
				<div class="form-box" ref="formBoxRefs">
					<el-form label-width="60px">
						<el-form-item label="维度行">
							<div class="input-box">
								<el-scrollbar max-height="132px">
									<VueDraggableNext
										v-model="draggableDimensionRow"
										class="draggable-box"
										:group="{ name: dimensionGroupName, pull: false }"
										@add="(event) => addDimensionField(event, 'dimensionRow')"
										@end="syncDimensional('dimensionRow')"
									>
										<DimensionCom
											:model-value="dimensionRow"
											chartType="pivotTable"
											isDimension
											enable-width-ratio
											@onSort="onSort"
											@update:modelValue="(value) => updateDimensionList(value, 'dimensionRow')"
										/>
									</VueDraggableNext>
								</el-scrollbar>
							</div>
						</el-form-item>
						<el-form-item label="维度列">
							<div class="input-box">
								<el-scrollbar max-height="132px">
									<VueDraggableNext
										v-model="draggableDimensionCol"
										class="draggable-box"
										:group="{ name: dimensionGroupName, pull: false }"
										@add="(event) => addDimensionField(event, 'dimensionCol')"
										@end="syncDimensional('dimensionCol')"
									>
										<DimensionCom
											:model-value="dimensionCol"
											chartType="pivotTable"
											isDimension
											@onSort="onSort"
											@update:modelValue="(value) => updateDimensionList(value, 'dimensionCol')"
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
											chartType="pivotTable"
											enable-width-ratio
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
					<el-empty v-if="availableFields.length === 0" description="请先将透视图拖入已绑定元数据的循环容器" />
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
import { ElMessage } from 'element-plus'

const cloneDeep = (data) => JSON.parse(JSON.stringify(data || []))

export default {
	name: 'pivotTableConfig-editor',
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
			dimensionRow: [],
			dimensionCol: [],
			metrics: [],
			draggableDimensionRow: [],
			draggableDimensionCol: [],
			draggableMetrics: [],
			dimensionGroupName: 'pivot-table-dimension-fields',
			itemBoxHeight: 'calc(100% - 240px)',
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
		modelOptions() {
			const models = this.getMetaModels(this.getMetaFields())
			return models.filter((m) => m.dataCode).map((m) => ({
				label: m.entityLabel || m.dataCode,
				value: m.dataCode,
			}))
		},
		availableFields() {
			const bindCode = this.optionModel.pivotTableConfig?.bindModelCode
			const models = this.getMetaModels(this.getMetaFields())
			const targetModel = models.find((m) => m.dataCode === bindCode) || this.getCurrentLoopModel()
			return (targetModel?.fieldList || []).map((field) => {
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
			if (this.optionModel.setDimensional && !this.optionModel.pivotTableConfig.setDimensional) {
				this.optionModel.pivotTableConfig.setDimensional = cloneDeep(this.optionModel.setDimensional)
			}
			if (this.optionModel.setDimensional) {
				delete this.optionModel.setDimensional
			}
			if (!this.optionModel.pivotTableConfig.setDimensional) {
				this.optionModel.pivotTableConfig.setDimensional = { dimensionRow: [], dimensionCol: [], metrics: [] }
			}
			if (this.optionModel.pivotTableConfig.showSumcol === undefined) {
				this.optionModel.pivotTableConfig.showSumcol = true
			}
			if (this.optionModel.pivotTableConfig.showEmptyAsDash === undefined) {
				this.optionModel.pivotTableConfig.showEmptyAsDash = true
			}
			const legacyStyleDefaults = {
				fontSize: 14,
				cellPadding: '8px 10px',
				borderWidth: 1,
				borderColor: '#dcdfe6',
				rowHeight: 0,
				emptyText: this.optionModel.pivotTableConfig.showEmptyAsDash === false ? '' : '--',
				tableLayout: 'fixed',
			}
			Object.entries(legacyStyleDefaults).forEach(([key, value]) => {
				if (this.optionModel.pivotTableConfig[key] === undefined) {
					this.optionModel.pivotTableConfig[key] = value
				}
			})
			this.dimensionRow = this.optionModel.pivotTableConfig.setDimensional.dimensionRow || []
			this.dimensionCol = this.optionModel.pivotTableConfig.setDimensional.dimensionCol || []
			this.metrics = this.optionModel.pivotTableConfig.setDimensional.metrics || []
			this.draggableDimensionRow = cloneDeep(this.dimensionRow)
			this.draggableDimensionCol = cloneDeep(this.dimensionCol)
			this.draggableMetrics = cloneDeep(this.metrics)
		},
		addDimensionField(event, target) {
			const field = cloneDeep([this.availableFields[event.oldIndex]])[0]
			if (!field) {
				return
			}
			if (target === 'metrics' && this.hasDuplicateMetric(field)) {
				ElMessage.warning('添加失败，同一字段不能重复添加指标')
				this.initDraggableModel()
				return
			}
			if (target === 'dimensionRow') {
				this.dimensionRow.push(field)
			} else if (target === 'dimensionCol') {
				this.dimensionCol.push(field)
			} else if (target === 'metrics') {
				this.metrics.push(field)
			}
			this.commitDimensional()
		},
		syncDimensional(target) {
			if (!this.optionModel.pivotTableConfig.setDimensional) {
				this.optionModel.pivotTableConfig.setDimensional = { dimensionRow: [], dimensionCol: [], metrics: [] }
			}
			if (target === 'dimensionRow') {
				this.dimensionRow = cloneDeep(this.draggableDimensionRow.length ? this.draggableDimensionRow : this.dimensionRow)
				this.optionModel.pivotTableConfig.setDimensional.dimensionRow = this.dimensionRow
			} else if (target === 'dimensionCol') {
				this.dimensionCol = cloneDeep(this.draggableDimensionCol.length ? this.draggableDimensionCol : this.dimensionCol)
				this.optionModel.pivotTableConfig.setDimensional.dimensionCol = this.dimensionCol
			} else if (target === 'metrics') {
				this.metrics = cloneDeep(this.draggableMetrics.length ? this.draggableMetrics : this.metrics)
				this.optionModel.pivotTableConfig.setDimensional.metrics = this.metrics
			}
			this.initDraggableModel()
		},
		commitDimensional() {
			if (!this.optionModel.pivotTableConfig.setDimensional) {
				this.optionModel.pivotTableConfig.setDimensional = { dimensionRow: [], dimensionCol: [], metrics: [] }
			}
			this.optionModel.pivotTableConfig.setDimensional.dimensionRow = this.dimensionRow
			this.optionModel.pivotTableConfig.setDimensional.dimensionCol = this.dimensionCol
			this.optionModel.pivotTableConfig.setDimensional.metrics = this.metrics
			this.initDraggableModel()
		},
		initDraggableModel() {
			this.draggableDimensionRow = cloneDeep(this.dimensionRow)
			this.draggableDimensionCol = cloneDeep(this.dimensionCol)
			this.draggableMetrics = cloneDeep(this.metrics)
		},
		updateDimensionList(value, target) {
			if (target === 'dimensionRow') {
				this.dimensionRow = value || []
			} else if (target === 'dimensionCol') {
				this.dimensionCol = value || []
			} else if (target === 'metrics') {
				this.metrics = value || []
			}
			this.commitDimensional()
		},
		hasDuplicateMetric(field) {
			const targetNames = [
				field?.fieldName,
				field?.name,
				field?.options?.bindingPath,
				field?.options?.keyName,
				field?.options?.name,
			].filter(Boolean)
			return this.metrics.some((item) => {
				const currentNames = [
					item?.fieldName,
					item?.name,
					item?.options?.bindingPath,
					item?.options?.keyName,
					item?.options?.name,
				].filter(Boolean)
				return currentNames.some((name) => targetNames.includes(name))
			})
		},
		onSort(event) {
			this.dimensionRow.forEach((item) => { item.sort = '' })
			this.dimensionCol.forEach((item) => { item.sort = '' })
			this.metrics.forEach((item) => { item.sort = '' })
			event.tag.sort = event.target
			this.commitDimensional()
		},
		openDimensionDialog() {
			if (!this.optionModel.pivotTableConfig?.bindModelCode) {
				this.$message?.warning?.('请先绑定数据模型')
				return
			}
			this.dimensionDialogVisible = true
			this.$nextTick(() => {
				this.setItemBoxHeight()
			})
		},
		setItemBoxHeight() {
			const formHeight = this.$refs.formBoxRefs?.offsetHeight
			this.itemBoxHeight = formHeight ? `calc(100% - ${formHeight + 60}px)` : 'calc(100% - 240px)'
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

.style-unit {
	margin-left: 6px;
	color: #909399;
}

</style>
