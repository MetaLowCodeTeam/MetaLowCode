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
			<div
				v-if="htmlDisplayEnabled"
				class="ml-text-field__html"
				v-html="sanitizedDisplayText"
			></div>
			<template v-else>{{ displayText }}</template>
		</div>
	</static-content-wrapper>
</template>

<script>
import VisualDesign from '@/../lib/visual-design/designer.umd.js'
import { sanitizeReportHtml } from '@/views/system/form-design/extension/report-html-sanitizer'

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
	data() {
		return {
			displayText: this.field?.options?.label || '',
		}
	},
	computed: {
		htmlDisplayEnabled() {
			return !!this.field?.options?.htmlDisplayEnabled
		},
		sanitizedDisplayText() {
			return sanitizeReportHtml(this.displayText)
		},
	},
	watch: {
		'field.options.label': {
			immediate: false,
			handler(val) {
				if (val && !this._textOverridden) {
					this.displayText = val
				}
			},
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
		setFieldValue(value) {
			this._textOverridden = true
			this.displayText = value != null ? String(value) : ''
		},
		getValue() {
			return this.displayText
		},
		resetToLabel() {
			this._textOverridden = false
			this.displayText = this.field?.options?.label || ''
		},
	},
}
</script>

<style scoped lang="scss">
.ml-text-field {
	padding: 5px 0;
	color: #333;
}

.ml-text-field__html :deep(table) {
	max-width: 100%;
	border-collapse: collapse;
}
</style>
