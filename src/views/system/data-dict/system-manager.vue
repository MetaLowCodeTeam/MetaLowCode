<template>
    <!--  -->
    <TreeOperateList
        title="系统常量管理"
        :getTreeFn="getSystemConstantTree"
        :getMainFn="getSystemConstants"
        :saveFn="saveSystemConstants"
        :deleteFn="systemConstantCanBeDeleted"
        pageType="system"
    />
</template>

<script setup>
import TreeOperateList from "./components/TreeOperateList.vue";
import { getSystemConstantTree, getSystemConstants, saveSystemConstants, systemConstantCanBeDeleted } from "@/api/system-manager";
</script>
<style lang='scss' scoped>
</style>