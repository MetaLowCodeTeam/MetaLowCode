<template>
    <!--  -->
    <div v-loading="loading">{{ cutTab }}</div>
</template>

<script setup>
import { onMounted, watch, inject, reactive, ref } from "vue";
const props = defineProps({
    cutTab: { type: String },
});
const $API = inject("$API");

watch(
    () => props.cutTab,
    () => {
        initData();
    },
    { deep: true }
);

onMounted(() => {
    initData();
});

let loading = ref(false);
let layoutConfig = reactive({});
// 初始化数据
const initData = async () => {
    loading.value = true;
    let res = await $API.layoutConfig.getLayoutList(props.cutTab);
    if (res) {
        layoutConfig = res.data ? { ...res.data } : {};
    }
    loading.value = false;
};
</script>
<style lang='scss' scoped>
</style>