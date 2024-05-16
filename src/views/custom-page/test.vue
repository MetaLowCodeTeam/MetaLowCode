<template>
    <!--  -->
    <div>自定义页面{{ query }}</div>

    <div>
        <el-input v-model="test"></el-input>
    </div>
</template>

<script setup>
import { onMounted, ref, onActivated } from "vue";
import { useRouter } from "vue-router";
// import MlTable from "@/components/mlTable/index.vue";

const Router = useRouter();

let test = ref("123");

let isMounted = ref(false);

let query = ref({});
onMounted(() => {
    query.value = Router.currentRoute.value.query;
    test.value = 456;
    console.log("触发了");
    isMounted.value = true;
});

onActivated(() => {
    if(isMounted.value){
        console.info("已经调用了isMounted")
        isMounted.value = false;
    }else {
        console.info('缓存组件重新激活')
    }
 
})
</script>
<style lang='scss' scoped>
</style>