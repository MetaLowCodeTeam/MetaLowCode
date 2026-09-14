<template>
	<static-content-wrapper
		:designer="designer"
		:field="field"
		:design-state="designState"
		:parent-widget="parentWidget"
		:parent-list="parentList"
		:index-of-parent-list="indexOfParentList"
	>
		<span
			class="page-number-field"
			:class="field.options.customClass"
			:data-word-page-number-template="template"
			:style="fieldStyle"
		>
			{{ previewText }}
		</span>
	</static-content-wrapper>
</template>

<script>
import VisualDesign from '@/../lib/visual-design/designer.umd.js'

const { StaticContentWrapper, emitter, i18n, fieldMixin } = VisualDesign.VFormSDK

export default {
	name: 'page-number-widget',
	componentName: 'FieldWidget',
	components: { StaticContentWrapper },
	mixins: [emitter, i18n, fieldMixin],
	props: {
		field: Object,
		parentWidget: Object,
		parentList: Array,
		indexOfParentList: Number,
		designer: Object,
		designState: { type: Boolean, default: false },
	},
	computed: {
		template() {
			return String(this.field.options.pageNumberTemplate || '{page}')
		},
		previewText() {
			return this.template
				.split('{sectionPages}').join('8')
				.split('{totalPages}').join('10')
				.split('{page}').join('1')
		},
		fieldStyle() {
			const fontSize = this.field.options.fontSize
			return {
				display: 'block',
				textAlign: this.field.options.textAlign || 'center',
				fontSize: typeof fontSize === 'number' ? `${fontSize}px` : (fontSize || '12px'),
				fontStyle: this.field.options.fontStyle || 'normal',
				fontWeight: this.field.options.fontWeight || 'normal',
			}
		},
	},
	created() {
		this.registerToRefList()
	},
	beforeUnmount() {
		this.unregisterFromRefList()
	},
}
</script>
