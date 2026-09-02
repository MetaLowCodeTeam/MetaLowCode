<template>
	<container-item-wrapper :widget="widget">
		<div v-show="!widget.options.hidden" class="loop-container" :class="customClass">
			<loop-merged-table-item
				v-if="singleTableWidget && loopRows.length > 0"
				:widget="singleTableWidget"
				:loop-rows="loopRows"
				:sub-form-col-index="subFormColIndex"
			>
				<template v-for="(_, slotName) in $slots" #[slotName]="slotProps">
					<slot :name="slotName" v-bind="slotProps || {}" />
				</template>
			</loop-merged-table-item>

			<template v-else>
				<div
					v-for="(loopRow, loopIndex) in loopRows"
					:key="loopRow.__rowKey"
					class="loop-container-row"
					style="margin-bottom: 5px"
				>
					<template v-for="(child, childIndex) in widget.widgetList" :key="`${loopRow.__rowKey}-${child.id || childIndex}`">
						<component
							:is="getComponentByContainer(child)"
							v-if="child.category === 'container'"
							:widget="child"
							:parent-list="widget.widgetList"
							:index-of-parent-list="childIndex"
							:parent-widget="widget"
							:sub-form-row-id="loopRow.__rowKey"
							:sub-form-row-index="loopIndex"
							:sub-form-col-index="subFormColIndex"
							:loop-row-data="loopRow"
						>
							<template v-for="(_, slotName) in $slots" #[slotName]="slotProps">
								<slot :name="slotName" v-bind="slotProps || {}" />
							</template>
						</component>
						<component
							:is="getFieldWidget(child.type)"
							v-else
							:field="child"
							:parent-list="widget.widgetList"
							:index-of-parent-list="childIndex"
							:parent-widget="widget"
							:sub-form-row-id="loopRow.__rowKey"
							:sub-form-row-index="loopIndex"
							:sub-form-col-index="subFormColIndex"
							:loop-row-data="loopRow"
						>
							<template v-for="(_, slotName) in $slots" #[slotName]="slotProps">
								<slot :name="slotName" v-bind="slotProps || {}" />
							</template>
						</component>
					</template>
				</div>
			</template>
		</div>
	</container-item-wrapper>
</template>

<script>
import VisualDesign from '@/../lib/visual-design/designer.umd.js'
import LoopMergedTableItem from './loop-merged-table-item.vue'

const {
	ContainerItemWrapper,
	emitter,
	i18n,
	containerItemMixin,
	refMixin,
} = VisualDesign.VFormSDK

export default {
	name: 'loop-container-item',
	componentName: 'ContainerItem',
	components: { ContainerItemWrapper, LoopMergedTableItem },
	mixins: [emitter, i18n, refMixin, containerItemMixin],
	provide() {
		return {
			getSubFormFieldFlag: () => !!this.loopModelName,
			getSubFormName: () => this.loopModelName,
			subFormFormulaBroadcastIsDisabled: () => true,
		}
	},
	props: {
		widget: Object,
		parentWidget: Object,
		parentList: Array,
		indexOfParentList: Number,
		loopRowData: { type: Object, default: null },
		subFormRowIndex: { type: Number, default: -1 },
		subFormColIndex: { type: Number, default: -1 },
		subFormRowId: { type: String, default: '' },
	},
	inject: ['refList', 'sfRefList', 'globalModel', 'getGlobalDsv'],
	data() {
		return {
			loopModelName: '',
			loopData: [],
			sourceFormData: null,
		}
	},
	computed: {
		customClass() {
			return this.widget.options.customClass || ''
		},
		loopRows() {
			if (!this.loopModelName) {
				return [{ __rowKey: `${this.widget.id || this.widget.options.name || 'loop'}-0` }]
			}
			if (!Array.isArray(this.loopData) || this.loopData.length === 0) {
				return []
			}
			return this.loopData.map((row, index) => ({
				...(row || {}),
				__rowKey: `${this.loopModelName}-${index}`,
			}))
		},
		singleTableWidget() {
			const children = (this.widget.widgetList || []).filter(Boolean)
			return children.length === 1
				&& children[0].category === 'container'
				&& children[0].type === 'table'
				? children[0]
				: null
		},
	},
	watch: {
		loopRowData: {
			deep: true,
			handler() {
				this.syncLoopData(this.getLoopSourceData())
			},
		},
	},
	created() {
		this.loopModelName = this.getLoopModelName()
		this.syncLoopData(this.getLoopSourceData())
		this.initEventHandler()
		this.initRefList()
		this.handleOnCreated()
	},
	mounted() {
		this.handleOnMounted()
	},
	beforeUnmount() {
		this.off$('setFormData', this.eventFunctionMapping.setFormData)
		this.unregisterFromRefList()
	},
	methods: {
		getLoopModelName() {
			const configuredName = this.widget?.options?.modelAssociationId
				|| this.widget?.options?.name
				|| ''
			if (configuredName) return configuredName
			const field = this.findLoopModelField(this.widget?.widgetList || [])
			return field?.options?.modelAssociationId || ''
		},
		findLoopModelField(widgetList) {
			if (!Array.isArray(widgetList)) return null
			for (const widget of widgetList) {
				if (!widget) continue
				if (
					widget.type === 'report-field'
					&& widget.options?.modelAssociationId
					&& this.isArrayValue(widget.options?.isArray)
				) {
					return widget
				}
				const childLists = [widget.widgetList]
				if (Array.isArray(widget.cols)) {
					widget.cols.forEach((col) => childLists.push(col.widgetList))
				}
				if (Array.isArray(widget.rows)) {
					widget.rows.forEach((row) => (row.cols || []).forEach((cell) => {
						childLists.push(cell.widgetList)
					}))
				}
				if (Array.isArray(widget.tabs)) {
					widget.tabs.forEach((tab) => childLists.push(tab.widgetList))
				}
				for (const childList of childLists) {
					const field = this.findLoopModelField(childList)
					if (field) return field
				}
			}
			return null
		},
		isArrayValue(value) {
			return value === true || value === 1 || value === '1' || value === 'true'
		},
		initEventHandler() {
			this.eventFunctionMapping.setFormData = (args) => {
				const formData = args[0] || {}
				this.sourceFormData = formData
				this.syncLoopData(formData)
			}
			this.on$('setFormData', this.eventFunctionMapping.setFormData)
		},
		getLoopSourceData() {
			const reportData = this.getGlobalDsv?.()?.__reportFormData
			return this.sourceFormData || reportData || this.formModel || {}
		},
		syncLoopData(formData) {
			if (!this.loopModelName) {
				this.loopData = []
				return
			}
			const value = this.resolveLoopData(formData)
			this.loopData = Array.isArray(value) ? value : []
			const formRef = this.getFormRef()
			if (formRef?.formDataModel) {
				formRef.formDataModel[this.loopModelName] = this.loopData
			}
		},
		resolveLoopData(formData) {
			const parentValue = this.findModelData(this.loopRowData, this.loopModelName)
			if (Array.isArray(parentValue)) return parentValue
			const directValue = formData?.[this.loopModelName]
			if (Array.isArray(directValue)) return directValue
			const nestedValue = this.findModelData(formData, this.loopModelName)
			return Array.isArray(nestedValue) ? nestedValue : []
		},
		findModelData(source, modelName, visited = new WeakSet()) {
			if (!source || !modelName) return null
			if (Array.isArray(source)) {
				for (const item of source) {
					const value = this.findModelData(item, modelName, visited)
					if (value != null) return value
				}
				return null
			}
			if (typeof source !== 'object' || visited.has(source)) return null
			visited.add(source)
			if (Array.isArray(source[modelName])) return source[modelName]
			for (const value of Object.values(source)) {
				if (!value || typeof value !== 'object') continue
				const result = this.findModelData(value, modelName, visited)
				if (result != null) return result
			}
			return null
		},
	},
}
</script>

<style scoped lang="scss">
.loop-container {
	width: 100%;
}
</style>
