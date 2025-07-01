<template>
    <!--  -->
    <TreeOperateList
        title="级联选项管理"
        :getTreeFn="getOptionFields"
        :getMainFn="getCascaderOptionTree"
        :saveFn="saveCascaderOptionItem"
        isCascaderOption
    />
</template>

<script setup>
import TreeOperateList from "./components/TreeOperateList.vue";
import {
    getOptionFields,
    getCascaderOptionTree,
    saveCascaderOptionItem,
} from "@/api/system-manager";
</script>
<style lang='scss' scoped>
</style>