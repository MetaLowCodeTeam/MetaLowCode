<template>
    <!--  -->
    <img :src="formatImg()" />
</template>

<script setup>
// import { inject } from "vue";

// const $TOOL = inject("$TOOL");
const props = defineProps({
    userId: { type: String, default: "" },
});

// 格式化图片
const formatImg = () => {
    return import.meta.env.VITE_API_SERVER + "/user/avatar?userId=" + props.userId;
};
</script>
<style lang='scss' scoped>
</style>