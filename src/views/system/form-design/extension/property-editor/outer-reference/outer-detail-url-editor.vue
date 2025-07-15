<template>
	<el-form-item
		v-if="!optionModel.detailLinkDisabled"
	>
		<template #label>
            <span>外部引用详情URL</span>
            <el-tooltip
                content="示例：https://test.com/some/detail/{code}"
                placement="top"
            >
              
                <el-icon class="icon-info">
                    <InfoFilled />
                </el-icon>
            </el-tooltip>
		</template>
		<div class="input-with-icon">
			<el-input
				type="textarea"
				:rows="3"
				v-model="optionModel.outerDetailURL"
				placeholder="请输入外部引用详情URL"
				clearable
			/>
		</div>
	</el-form-item>
</template>

<script>
import VisualDesign from "@/../lib/visual-design/designer.umd.js";

const { i18n } = VisualDesign.VFormSDK;

export default {
	name: "outer-detail-url-editor",
	mixins: [i18n],
	props: {
		designer: Object,
		selectedWidget: Object,
		optionModel: Object,
	},
};
</script>

<style lang="scss" scoped>
.input-with-icon {
	display: flex;
	align-items: center;
	.el-input {
		flex: 1;
	}
	
}

.icon-info {
    cursor: pointer;
    position: relative;
    top: 4px;
}
</style>
