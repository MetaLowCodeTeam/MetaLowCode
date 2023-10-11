<template>
    <!--  -->
    <img :alt="$TOOL.data.get('APP_NAME')" :src="formatImg()" />
</template>

<script setup>
import { inject } from "vue";

const $TOOL = inject("$TOOL");
const props = defineProps({
    logoUrl: { type: String, default: "" },
});

// 格式化图片
const formatImg = () => {
    let url = props.logoUrl ? props.logoUrl : $TOOL.data.get("APP_LOGO");
    if (!url || url.indexOf("/src/assets/imgs") != -1) {
        return "/src/assets/imgs/logo.png";
    } else {
        return import.meta.env.VITE_API_SERVER + "/picture/get/" + url;
    }
};
</script>
<style lang='scss' scoped>
</style>