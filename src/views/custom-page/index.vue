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

    // createApp({
    //     AsyncComp: defineAsyncComponent(() => {
    //         import("@/views/custom-page/test.vue");
    //     }),
    // });
    // isShow.value = true;
    // console.log(cutParm.value,'cutParm.value');
    // console.log(router,'router')
    // if (cutParm.value) {
    //     router.addRoute("CustomPage",{
    //         path: "/web/" + cutParm.value,
    //         component:()=> import("@/views/custom-page/test.vue")
    //     });
    //     router.push("/web/" + cutParm.value)
    // }
});
</script>
<style lang='scss' scoped>
</style>