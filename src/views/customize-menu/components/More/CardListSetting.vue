<style lang="scss" scoped>
.set-list-style {
	line-height: 1;
	max-height: 500px;
	overflow-y: auto;
	overflow-x: hidden;
	padding: 0 10px;
	.from-title {
		font-weight: bold;
		font-size: 18px;
		margin-bottom: 10px;
	}
}
.text-info {
	font-size: 14px;
	font-weight: bold;
	color: #a8abb2;
}
</style>

<template>
	<!--  -->
	<mlDialog title="卡片列表设置" v-model="isShow" width="600px">
		<div v-loading="loading" class="set-list-style">
			<el-row :gutter="20">
				<el-col :span="12">
					<div class="from-title">选择渲染表单（PC）</div>
					<div class="from-item mb-20">
						<el-select
							v-model="value"
							placeholder="清选择渲染表单"
							class="w-100"
						>
							<el-option
								v-for="item in options"
								:key="item.value"
								:label="item.label"
								:value="item.value"
							/>
						</el-select>
					</div>
				</el-col>
				<el-col :span="12">
					<div class="from-title">选择渲染表单（移动端）</div>
					<div class="from-item mb-20">
						<el-select
							v-model="value"
							placeholder="清选择渲染表单"
							class="w-100"
						>
							<el-option
								v-for="item in options"
								:key="item.value"
								:label="item.label"
								:value="item.value"
							/>
						</el-select>
					</div>
				</el-col>
				<el-col :span="24">
					<div class="from-title">
						一排展示几个
						<span class="text-info">
							（仅PC生效，移动端因尺寸问题固定展示1个）
						</span>
					</div>
				</el-col>
			</el-row>
			<!-- <div>
				<div class="from-title">选择渲染表单（PC）</div>
				<div class="from-item mb-20">
					<el-select
						v-model="value"
						placeholder="清选择渲染表单"
						class="w-100"
					>
						<el-option
							v-for="item in options"
							:key="item.value"
							:label="item.label"
							:value="item.value"
						/>
					</el-select>
				</div>
			</div>
            <div>
				<div class="from-title">选择渲染表单（移动端）</div>
				<div class="from-item mb-20">
					<el-select
						v-model="value"
						placeholder="清选择渲染表单"
						class="w-100"
					>
						<el-option
							v-for="item in options"
							:key="item.value"
							:label="item.label"
							:value="item.value"
						/>
					</el-select>
				</div>
			</div>
            <div>
				<div class="from-title">是否显示卡片Title</div>
				<div class="from-item mb-30">
					<el-select
						v-model="value"
						placeholder="清选择渲染表单"
						class="w-100"
					>
						<el-option
							v-for="item in options"
							:key="item.value"
							:label="item.label"
							:value="item.value"
						/>
					</el-select>
				</div>
			</div> -->
		</div>
		<template #footer>
			<div class="footer-div">
				<el-button @click="isShow = false" :loading="loading">
					取消
				</el-button>
				<el-button type="primary" @click="onSave" :loading="loading">
					保存
				</el-button>
			</div>
		</template>
	</mlDialog>
</template>

<script setup>
import { onMounted, watch, ref, watchEffect } from "vue";
import { ElMessage } from "element-plus";
/**
 * API
 */
import layoutConfig from "@/api/layoutConfig";
// 代码编辑器
import mlCodeEditor from "@/components/mlCodeEditor/index.vue";
const props = defineProps({
	modelValue: null,
	layoutConfig: { type: Object, default: () => {} },
	// 实体模块名称
	modelName: {
		type: String,
		default: "",
	},
});

const options = [
	{
		value: "Option1",
		label: "Option1",
	},
	{
		value: "Option2",
		label: "Option2",
	},
	{
		value: "Option3",
		label: "Option3",
	},
	{
		value: "Option4",
		label: "Option4",
	},
	{
		value: "Option5",
		label: "Option5",
	},
];
const emits = defineEmits(["update:modelValue", "confirm"]);

let isShow = ref(false);

watch(
	() => isShow.value,
	(v) => {
		emits("update:modelValue", v);
	},
	{ deep: true }
);

watchEffect(() => {
	isShow.value = props.modelValue;
});
</script>
