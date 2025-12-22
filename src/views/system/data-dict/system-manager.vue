<template>
    <!--  -->
    <TreeOperateList
        title="系统常量管理"
        :getTreeFn="getSystemConstantTree"
        :getMainFn="getSystemConstants"
        :saveFn="saveSystemConstants"
        :deleteFn="systemConstantCanBeDeleted"
        pageType="system"
        :enabled-entity="enabledEntity"
    />
</template>

<script setup>
import TreeOperateList from "./components/TreeOperateList.vue";
import { getSystemConstantTree, getSystemConstants, saveSystemConstants, systemConstantCanBeDeleted } from "@/api/system-manager";
const props = defineProps({
    /**
     * 需要启用的字段
     * 示例：[{ '权限角色': ['customRight']}] 或 [{ '权限角色': ["*"]}]
     * 通配符："*"表示启用所有字段
     */
    enabledEntity: {
        type: Array,
        default: () => ([]),
    },
});
</script>
<style lang='scss' scoped>
</style>