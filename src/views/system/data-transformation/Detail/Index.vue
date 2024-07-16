<template>
<!--  -->
<div>
    详情
</div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";

const Router = useRouter()

let recordId = ref();

onMounted(() => {
    recordId.value = Router.currentRoute.value.params?.recordId;
    console.log(recordId.value,'ss');
})
</script>
<style lang='scss' scoped>
</style>