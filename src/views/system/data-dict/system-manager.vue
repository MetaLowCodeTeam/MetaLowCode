<template>
    <!--  -->
    <TreeOperateList
        title="系统项管理"
        :getTreeFn="getSystemItemTree"
        :getMainFn="getSystemItems"
        :saveFn="saveTagItems"
        pageType="system"
    />
</template>

<script setup>
import TreeOperateList from "./components/TreeOperateList.vue";
import { getSystemItemTree, getSystemItems, saveTagItems } from "@/api/system-manager";
</script>
<style lang='scss' scoped>
</style>