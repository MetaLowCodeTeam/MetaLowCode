<template>
    <!--  -->
    <img :src="formatImg()" />
</template>

<script setup>
// import { inject } from "vue";

// const $TOOL = inject("$TOOL");
const props = defineProps({
    userId: { type: String, default: "" },
	// 是否需要加时间戳
	needTimestamp: { type: Boolean, default: false },
});

// 格式化图片
const formatImg = () => {
    return import.meta.env.VITE_APP_BASE_API + "/user/avatar?userId=" + props.userId + (props.needTimestamp ? "&t=" + new Date().getTime() : "");
};
</script>
<style lang='scss' scoped>
</style>