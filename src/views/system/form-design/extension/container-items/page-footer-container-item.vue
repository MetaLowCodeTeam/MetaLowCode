<template>
	<container-item-wrapper :widget="widget">
		<div
			v-if="!widget.options.hidden"
			class="page-footer-container"
			:class="customClass"
			:data-word-page-start="pageNumberStart"
			:data-word-footer-distance="footerDistance"
			:data-word-top-border="widget.options.showTopBorder ? 'true' : 'false'"
			data-word-footer=""
			style="display: none"
		>
			<template v-for="(child, index) in widget.widgetList" :key="child.id || index">
				<component
					:is="getComponentByContainer(child)"
					v-if="child.category === 'container'"
					:widget="child"
					:parent-list="widget.widgetList"
					:index-of-parent-list="index"
					:parent-widget="widget"
					:sub-form-row-id="subFormRowId"
					:sub-form-row-index="subFormRowIndex"
					:sub-form-col-index="subFormColIndex"
				/>
				<component
					:is="getFieldWidget(child.type)"
					v-else
					:field="child"
					:parent-list="widget.widgetList"
					:index-of-parent-list="index"
					:parent-widget="widget"
					:sub-form-row-id="subFormRowId"
					:sub-form-row-index="subFormRowIndex"
					:sub-form-col-index="subFormColIndex"
				/>
			</template>
		</div>
	</container-item-wrapper>
</template>

<script>
import VisualDesign from '@/../lib/visual-design/designer.umd.js'

const {
	ContainerItemWrapper,
	emitter,
	i18n,
	containerItemMixin,
	refMixin,
} = VisualDesign.VFormSDK

export default {
	name: 'page-footer-container-item',
	componentName: 'ContainerItem',
	components: { ContainerItemWrapper },
	mixins: [emitter, i18n, containerItemMixin, refMixin],
	inject: ['refList', 'sfRefList', 'globalModel'],
	props: {
		widget: Object,
		parentWidget: Object,
		parentList: Array,
		indexOfParentList: Number,
		subFormRowIndex: { type: Number, default: -1 },
		subFormColIndex: { type: Number, default: -1 },
		subFormRowId: { type: String, default: '' },
	},
	computed: {
		customClass() {
			return this.widget.options.customClass || ''
		},
		pageNumberStart() {
			const value = Number(this.widget.options.pageNumberStart)
			return Number.isInteger(value) && value > 0 ? value : 1
		},
		footerDistance() {
			const value = Number(this.widget.options.footerDistance)
			return Number.isFinite(value) && value >= 0 ? value : 3
		},
	},
	created() {
		this.initRefList()
	},
	beforeUnmount() {
		this.unregisterFromRefList()
	},
}
</script>
