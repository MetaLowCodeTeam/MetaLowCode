<template>
	<el-form-item label="图片">
		<div class="ml-image-editor">
			<div v-if="previewUrl" class="ml-image-editor__preview">
				<img :src="previewUrl" :alt="optionModel.alt || optionModel.imageName || ''">
			</div>
			<div v-else class="ml-image-editor__empty">暂无图片</div>
			<div class="ml-image-editor__actions">
				<ml-upload
					accept="image/*"
					:upload-url="'/picture/upload'"
					@on-success="handleUploadSuccess"
				>
					<template #trigger>
						<el-button type="primary" size="small">
							{{ previewUrl ? '更换图片' : '上传图片' }}
						</el-button>
					</template>
				</ml-upload>
				<el-button v-if="previewUrl" size="small" @click="clearImage">删除</el-button>
			</div>
		</div>
	</el-form-item>
	<el-form-item label="图片宽度">
		<el-input v-model="optionModel.imageWidth" placeholder="例如 120px 或 100%" />
	</el-form-item>
	<el-form-item label="图片高度">
		<el-input v-model="optionModel.imageHeight" placeholder="例如 auto 或 80px" />
	</el-form-item>
	<el-form-item label="替代文本">
		<el-input v-model="optionModel.alt" placeholder="图片无法显示时使用" />
	</el-form-item>
</template>

<script>
import MlUpload from '@/components/mlUpload/index.vue'
import { resolvePictureUrl } from '@/utils/picture'

export default {
	name: 'ml-image-imageUrl-editor',
	components: {
		MlUpload,
	},
	props: {
		designer: Object,
		selectedWidget: Object,
		optionModel: Object,
	},
	computed: {
		previewUrl() {
			return resolvePictureUrl(this.optionModel?.imageUrl)
		},
	},
	methods: {
		handleUploadSuccess(uploadResult) {
			this.optionModel.imageUrl = uploadResult?.url || ''
			this.optionModel.imageName = uploadResult?.name || ''
		},
		clearImage() {
			this.optionModel.imageUrl = ''
			this.optionModel.imageName = ''
		},
	},
}
</script>

<style scoped lang="scss">
.ml-image-editor {
	width: 100%;
}

.ml-image-editor__preview,
.ml-image-editor__empty {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 100%;
	height: 120px;
	box-sizing: border-box;
	margin-bottom: 8px;
	border: 1px dashed #dcdfe6;
	border-radius: 4px;
	background: #fafafa;
}

.ml-image-editor__preview img {
	max-width: 100%;
	max-height: 100%;
	object-fit: contain;
}

.ml-image-editor__empty {
	color: #909399;
	font-size: 12px;
}

.ml-image-editor__actions {
	display: flex;
	gap: 8px;
}
</style>
