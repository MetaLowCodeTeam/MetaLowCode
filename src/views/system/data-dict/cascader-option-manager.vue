<template>
    <!--  -->
    <TreeOperateList
        title="级联选项管理"
        :getTreeFn="getOptionFields"
        :getMainFn="getCodeOptionItems"
        :saveFn="saveCodeOptionItems"
        isCascaderOption
    />
</template>

<script setup>
import TreeOperateList from "./components/TreeOperateList.vue";
import {
    getOptionFields,
    getCodeOptionItems,
    saveCodeOptionItems,
} from "@/api/system-manager";
</script>
<style lang='scss' scoped>
</style>