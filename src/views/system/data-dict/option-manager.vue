<template>
    <!--  -->
    <TreeOperateList
        title="单选项管理"
        :getTreeFn="getOptionFields"
        :getMainFn="getOptionItems"
        :saveFn="saveOptionItems"
    />
</template>

<script setup>
import TreeOperateList from "./components/TreeOperateList.vue";
import {
    getOptionFields,
    getOptionItems,
    saveOptionItems,
} from "@/api/system-manager";
</script>
<style lang='scss' scoped>
</style>