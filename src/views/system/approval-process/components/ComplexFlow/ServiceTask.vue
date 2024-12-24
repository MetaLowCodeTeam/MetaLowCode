<template>
	<div class="border-container">
		<el-form @submit.prevent label-width="auto" label-position="top">
			<el-form-item label="后端服务类名">
				<el-input
					v-model="myFormData.classPath"
					placeholder="输入后端服务类名"
				></el-input>
			</el-form-item>
			<el-form-item label="选择服务配置">
				<el-select
					v-model="myFormData.selectComp"
					placeholder="选择你的自定义组件模板"
					style="width: 100%"
				>
					<el-option
						v-for="item in customServiceTaskCmpMapping"
						:key="item.value"
						:label="item.label"
						:value="item.value"
					/>
				</el-select>
			</el-form-item>
		</el-form>
		<component
			v-if="myFormData.selectComp"
			:is="myFormData.selectComp"
			:customData="myFormData.customData"
			:formData="myFormData"
			:lf="lf"
			@updateData="updateCustomData"
		></component>
	</div>
</template>

<script setup>
import { ref, watch, watchEffect } from "vue";
// 引入映射自定义组件map
import { customServiceTaskCmpMapping } from "./customServiceTaskCmp";

const props = defineProps({
	formData: { Type: Object, default: () => {} },
	lf: { Type: Object, default: () => {} },
});
const emits = defineEmits(["setNodeData"]);

// 初始数据
let myFormData = ref({});

// 监听数据
watchEffect(() => {
	myFormData.value = props.formData;
});

// 数据发生变化同步数据
watch(
	() => myFormData.value,
	() => {
		emits("setNodeData", myFormData.value);
	},
	{
		deep: true,
	}
);

// 同步自定义数据
const updateCustomData = (v) => {
	myFormData.value.customData = v;
};
</script>
<style lang="scss" scoped></style>
