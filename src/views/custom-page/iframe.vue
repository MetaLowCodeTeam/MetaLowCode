<template>
    <!--  -->
    <div class="iframe-box">
        <iframe :src="url" frameborder="0"></iframe>
    </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
const Router = useRouter();
let url = ref("https://v3.cn.vuejs.org");

onMounted(()=>{
    // console.log(Router.currentRoute.value);
    url.value = Router.currentRoute.value.meta.outLink;
})

</script>
<style lang='scss' scoped>
.iframe-box {
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
    iframe {
        border: 0;
        width: 100%;
        height: 100%;
        display: block;
    }
}
</style>