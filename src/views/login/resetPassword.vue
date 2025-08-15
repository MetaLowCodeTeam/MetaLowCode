<template>
	<Suspense>
		<template #default>
			<Password infoText="首次登录必须重置密码！密码更新成功后，您将被重定向到登录页面，您可以使用新密码重新登录。"/>
		</template>
		<template #fallback>
			<div>加载中...</div>
		</template>
	</Suspense>
</template>

<script setup>
import { defineAsyncComponent } from "vue";

const Password = defineAsyncComponent({
	loader: () => import("@/views/userCenter/user/password.vue"),
	delay: 200, // 可选：延迟显示loading
	timeout: 30000, // 可选：超时
	suspensible: true, // 与 <Suspense> 搭配
});
</script>
