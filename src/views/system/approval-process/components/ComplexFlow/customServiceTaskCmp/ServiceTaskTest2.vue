<template>
	<!--  -->
	<div>
        <el-input v-model="myCustomData.test"></el-input>
    </div>
    <div>
        <el-button @click="handleClick">自定义组件2</el-button>
    </div>
    <div style="height:600px;background: green">我是自定义组件</div>
</template>

<script setup>
import { ref, watch, watchEffect } from "vue";
const props = defineProps({
	customData: { Type: Object, default: () => {} },
    formData: { Type: Object, default: () => {} },
    lf: { Type: Object, default: () => {} },
});
const emits = defineEmits(["updateData"]);

// 初始数据
let myCustomData = ref({});

// 监听数据
watchEffect(() => {
	myCustomData.value = props.customData || {};
});

// 数据发生变化同步数据
watch(
	() => myCustomData.value,
	() => {
		emits("updateData", myCustomData.value);
	},
	{
		deep: true,
	}
);

const handleClick = () => {
    console.log(props.lf, '自定义组件2')
}
</script>
<style lang="scss" scoped></style>
