<template>
    <!--  -->
    <TreeOperateList
        title="级联选项管理"
        :getTreeFn="getOptionFields"
        :getMainFn="getCascaderOptionTree"
        :saveFn="saveCascaderOptionItem"
        isCascaderOption
        :banned-entity="bannedEntity"
        :banned-field="bannedField"
        :banned-attribute="bannedAttribute"
    />
</template>

<script setup>
import TreeOperateList from "./components/TreeOperateList.vue";
import {
    getOptionFields,
    getCascaderOptionTree,
    saveCascaderOptionItem,
} from "@/api/system-manager";
const props = defineProps({
    // 需要过滤的实体名称
    bannedEntity: {
        type: Array,
        default: () => [],
    },
    // 需要过滤的字段
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