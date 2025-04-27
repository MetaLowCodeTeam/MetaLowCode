<!--
 * @Descripttion: 自定义实体列表组件示例。
 * @version: 1.0
 * @Api：https://www.yuque.com/xieqi-nzpdn/as7g0w/khgyptll0tom0iog
 * @Author: 邪七
 * @Date: 2025年04月27日11:30:56
 * @LastEditors: 邪七
 * @LastEditTime: 2025年04月27日11:30:56 
-->
<template>
	<EntityList
		ref="EntityListRefs"
		:listConf="listParamConf"
		:paginationConf="paginationConf"
	>
	</EntityList>
</template>

<script setup>
/**
 * 组件
 */
import EntityList from "@/views/customize-menu/list.vue";
import { ref, shallowRef } from "vue";

let EntityListRefs = shallowRef();

let listParamConf = ref({});

</script>
<style lang="scss" scoped></style>
