<template>
	<div>自定义test页面{{ query }}</div>
	<div>
		自定义页面：
		<a
			href="https://www.yuque.com/docs/share/f0c0c0c8-f0b7-4d0c-a0a5-a0c0b0c0b0c0?# 《自定义页面开发文档》"
			target="_blank"
		>
			<span class="ml-a-span">开发文档</span>
		</a>
	</div>
</template>

<script setup>
import { onMounted, ref, onActivated } from "vue";
import { useRouter } from "vue-router";

const Router = useRouter();

let isMounted = ref(false);

let query = ref({});

onMounted(() => {
	query.value = Router.currentRoute.value.query;
	isMounted.value = true;
});

// 路由缓存后仍然调用
onActivated(() => {
	if (isMounted.value) {
		console.info("已经调用了isMounted");
		isMounted.value = false;
	} else {
		console.info("缓存组件重新激活");
	}
});
</script>
<style lang="scss" scoped></style>
