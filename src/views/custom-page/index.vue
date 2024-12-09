<template>
    <!--  -->
    <div>测试--{{ cutParm }}</div>
    <!-- <div v-if="isShow">
        <AsyncComp />
    </div> -->
</template>

<script setup>
import {
    onMounted,
    ref,
    shallowRef,
    defineAsyncComponent,
    createApp,
} from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

let cutParm = ref("");

let isShow = ref(false);

onMounted(() => {
    cutParm.value = router.currentRoute.value.params.prarm;
});
</script>
<style lang='scss' scoped>
</style>