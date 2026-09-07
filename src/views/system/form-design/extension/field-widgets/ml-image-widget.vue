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
		<div class="ml-image-field" :style="wrapperStyle">
			<img
				v-if="resolvedImageUrl"
				class="ml-image-field__image"
				:src="resolvedImageUrl"
				:alt="field.options.alt || field.options.imageName || ''"
				:style="imageStyle"
			>
			<div v-else-if="designer || designState" class="ml-image-field__placeholder">
				请在右侧属性中上传图片
			</div>
		</div>
	</static-content-wrapper>
</template>

<script>
import VisualDesign from '@/../lib/visual-design/designer.umd.js'
import { resolvePictureUrl } from '@/utils/picture'

const { StaticContentWrapper, emitter, i18n, fieldMixin } = VisualDesign.VFormSDK

export default {
	name: 'ml-image-widget',
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
	computed: {
		resolvedImageUrl() {
			return resolvePictureUrl(this.field?.options?.imageUrl)
		},
		wrapperStyle() {
			return {
				textAlign: this.field?.options?.textAlign || 'left',
			}
		},
		imageStyle() {
			return {
				width: this.field?.options?.imageWidth || '120px',
				height: this.field?.options?.imageHeight || 'auto',
				objectFit: this.field?.options?.objectFit || 'contain',
			}
		},
	},
	methods: {
		setFieldValue(value) {
			this.field.options.imageUrl = typeof value === 'string' ? value : ''
		},
		getValue() {
			return this.field?.options?.imageUrl || ''
		},
	},
}
</script>

<style scoped lang="scss">
.ml-image-field {
	min-height: 24px;
	padding: 5px 0;
}

.ml-image-field__image {
	display: inline-block;
	max-width: 100%;
	vertical-align: top;
}

.ml-image-field__placeholder {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 160px;
	height: 80px;
	box-sizing: border-box;
	border: 1px dashed #c0c4cc;
	border-radius: 4px;
	color: #909399;
	font-size: 12px;
	background: #fafafa;
}
</style>
