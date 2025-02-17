<template>
	<el-form-item
		label="显示自定义按钮"
		v-if="optionModel.showHeader && optionModel.topBarBtnConfig"
	>
		<el-switch v-model="optionModel.topBarBtnConfig.show"></el-switch>
	</el-form-item>
	<template v-if="optionModel.topBarBtnConfig.show">
		<!-- 按钮标签 -->
		<el-form-item label="按钮标签">
			<el-input
				v-model="optionModel.topBarBtnConfig.text"
				placeholder="请输入按钮标签"
				clearable
			></el-input>
		</el-form-item>
		<!-- 按钮类型 -->
		<el-form-item label="按钮类型">
			<el-select
				v-model="optionModel.topBarBtnConfig.type"
				placeholder="请选择"
			>
				<el-option
					v-for="item in btnTypeList"
					:label="item.label"
					:value="item.value"
					:key="item.value"
				></el-option>
			</el-select>
		</el-form-item>
		<!-- 按钮大小 -->
		<el-form-item label="按钮大小">
			<el-select
				v-model="optionModel.topBarBtnConfig.size"
				placeholder="请选择"
			>
				<el-option label="小" value="small"></el-option>
				<el-option label="中" value="medium"></el-option>
				<el-option label="大" value="large"></el-option>
			</el-select>
		</el-form-item>
		<!-- 点击事件 -->
		<el-form-item label="点击事件">
			<el-button
				type="info"
				icon="el-icon-edit"
				plain
				round
				:class="[eventHandled ? 'button-text-highlight' : '']"
				@click="editEventHandler('onCustomBtnClick', eventParams)"
			>
				{{ i18nt("designer.setting.addEventHandler") }}
			</el-button>
		</el-form-item>
	</template>
</template>

<script>
import VisualDesign from '@/../lib/visual-design/designer.umd.js'
const { i18n, eventMixin } = VisualDesign.VFormSDK
export default {
	name: "topBarBtnConfig-editor",
    mixins: [i18n, eventMixin],
	props: {
		designer: Object,
		selectedWidget: Object,
		optionModel: Object,
        eventHandled: {
            type: Boolean,
            default: false,
        },
	},
	data() {
		return {
			btnTypeList: [
				{
					label: "默认",
					value: "default",
				},
				{
					label: "首选",
					value: "primary",
				},
				{
					label: "成功",
					value: "success",
				},
				{
					label: "警告",
					value: "warning",
				},
				{
					label: "危险",
					value: "danger",
				},
				{
					label: "信息",
					value: "info",
				},
				{
					label: "文本",
					value: "text",
				},
			],
            eventParams: ['chart', 'data'],
		};
	},
};
</script>

<style scoped></style>
