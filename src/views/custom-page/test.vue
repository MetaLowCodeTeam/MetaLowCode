<template>
    <!--  -->
    <div>自定义页面{{ query }}</div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";

const Router = useRouter();

let query = ref({});
onMounted(() => {
    query.value = Router.currentRoute.value.query;
});
</script>
<style lang='scss' scoped>
</style>