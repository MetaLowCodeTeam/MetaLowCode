<template>
	<!--  -->
	<div>
        <el-input v-model="myCustomData.test"></el-input>
    </div>
</template>

<script setup>
import { ref, watch, watchEffect } from "vue";
const props = defineProps({
	customData: { Type: Object, default: () => {} },
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
</script>
<style lang="scss" scoped></style>
