<template>
    <!-- 简易工作流 -->
    <SimpleFlow v-if="flowType == 1" />
    <!-- 复杂工作流 -->
    <ComplexFlow v-if="flowType == 2" />
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import SimpleFlow from "./components/SimpleFlow/index.vue";
import ComplexFlow from "./components/ComplexFlow/index.vue";

const Router = useRouter();

let flowType = ref("");
// let entityCode = ref("");

onMounted(() => {
    flowType.value = Router.currentRoute.value.query.flowType;
    // entityCode.value = Router.currentRoute.value.query.entityCode;
    // console.log(entityCode.value,'entityCode.value')
    if (!flowType.value) {
        Router.go(-1);
        return;
    }
    // if (!entityCode.value) {
    //     Router.go(-1);
    //     return;
    // }
});
</script>
<style lang='scss' scoped>
</style>