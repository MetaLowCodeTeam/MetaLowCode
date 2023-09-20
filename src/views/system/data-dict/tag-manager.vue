<template>
    <!--  -->
    <TreeOperateList
        title="多选项管理"
        :getTreeFn="getTagFields"
        :getMainFn="getTagItems"
        :saveFn="saveTagItems"
    />
</template>

<script setup>
import TreeOperateList from "./components/TreeOperateList.vue";
import { getTagFields, getTagItems, saveTagItems } from "@/api/system-manager";
</script>
<style lang='scss' scoped>
</style>