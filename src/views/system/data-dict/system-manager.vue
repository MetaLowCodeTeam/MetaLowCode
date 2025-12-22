<template>
    <!--  -->
    <TreeOperateList
        title="系统常量管理"
        :getTreeFn="getSystemConstantTree"
        :getMainFn="getSystemConstants"
        :saveFn="saveSystemConstants"
        :deleteFn="systemConstantCanBeDeleted"
        pageType="system"
        :banned-entity="bannedEntity"
        :banned-field="bannedField"
        :banned-attribute="bannedAttribute"
    />
</template>

<script setup>
import TreeOperateList from "./components/TreeOperateList.vue";
import { getSystemConstantTree, getSystemConstants, saveSystemConstants, systemConstantCanBeDeleted } from "@/api/system-manager";
const props = defineProps({
    // 需要过滤的实体名称---传key
    bannedEntity: {
        type: Array,
        default: () => [],
    },
    // 需要过滤的字段---传字段value
    bannedField: {
        type: Array,
        default: () => [],
    },
    // 需要过滤属性
    bannedAttribute: {
        type: Array,
        default: () => [],
    },
});
</script>
<style lang='scss' scoped>
</style>