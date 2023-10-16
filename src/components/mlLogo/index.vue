<template>
    <!--  -->
    <img alt="logo" :src="formatImg() ? formatImg() : logo" />
</template>

<script setup>
import { inject } from "vue";
import logo from '@/assets/imgs/logo.png'
const $TOOL = inject("$TOOL");
const props = defineProps({
    logoUrl: { type: String, default: "" },
});

// 格式化图片
const formatImg = () => {
    let url = props.logoUrl ? props.logoUrl : $TOOL.data.get("APP_LOGO");
    if (!url || url.indexOf("/src/assets/imgs") != -1) {
        return false;
    } else {
        return import.meta.env.VITE_APP_BASE_API + url;
    }
};
</script>
<style lang='scss' scoped>
</style>