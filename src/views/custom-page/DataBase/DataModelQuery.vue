<template>
    <div class="main-container" v-loading="loading" element-loading-text="加载中...">
        <h1>数据列表111</h1>
    </div>
</template>
<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { queryModelById } from "@/api/plugins";
const route = useRoute();

let loading = ref(false);
onMounted(() => {
    // console.log(route.query.outerDataModelId,'props.outerDataModelId');
    loadModelData();
})

const loadModelData = async () => {
    loading.value = true;
    let res = await queryModelById({
        outerDataModelId: route.query.outerDataModelId
    });
    if(res) {
        console.log(res.data,'res');
    }
    loading.value = false;
}

</script>
<style scoped lang="scss">
.main-container {
    height: 100%;
}
</style>
