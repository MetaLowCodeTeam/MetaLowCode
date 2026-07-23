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
		<div
			class="ml-text-field"
			:style="{
				'text-align': field.options.textAlign || 'left',
				'font-size': field.options.fontSize || '14px',
				'font-style': field.options.fontStyle || 'normal',
				'font-weight': field.options.fontWeight || 'normal',
			}"
		>
			{{ field.options.label }}
		</div>
	</static-content-wrapper>
</template>

<script>
import VisualDesign from '@/../lib/visual-design/designer.umd.js'

const { StaticContentWrapper, emitter, i18n, fieldMixin } = VisualDesign.VFormSDK

export default {
	name: 'ml-text-widget',
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
		designState: {
			type: Boolean,
			default: false,
		},
		subFormRowIndex: {
			type: Number,
			default: -1,
		},
		subFormColIndex: {
			type: Number,
			default: -1,
		},
		subFormRowId: {
			type: String,
			default: '',
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
}
</script>

<style scoped lang="scss">
.ml-text-field {
	padding: 5px 0;
	color: #333;
}
</style>
