<template>
	<!--  -->
	<TreeOperateList
		title="单选项管理"
		:getTreeFn="getOptionFields"
		:getMainFn="getOptionItems"
		:saveFn="saveOptionItems"
		:enabled-entity="enabledEntity"
	/>
</template>

<script setup>
import TreeOperateList from "./components/TreeOperateList.vue";
import {
	getOptionFields,
	getOptionItems,
	saveOptionItems,
} from "@/api/system-manager";
const props = defineProps({
	/**
	 * 需要启用的字段
	 * 示例：[{ 'User': ['age', 'age']}, {'Role': ["*"]}]
	 * 通配符："*"表示启用所有字段
	 */
	enabledEntity: {
		type: Array,
		default: () => [],
	},
});
</script>
<style lang="scss" scoped></style>
