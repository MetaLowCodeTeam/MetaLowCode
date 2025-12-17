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
		customListType="treeTableList"
	>
	</EntityList>
</template>

<script setup>
/**
 * 组件
 */
import EntityList from "@/views/customize-menu/list.vue";
// import { Data } from "@icon-park/vue-next";
// import { ref, shallowRef } from "vue";

// let EntityListRefs = shallowRef();

// let listParamConf = ref({});

// let paginationConf = ref({});

// rowKey 必须是唯一标识，否则会出现“展开一条，多个一起展开”的情况
// 这里使用主键字段（如 ceshiId）作为 rowKey
// let treeProps = { rowKey: "ceshiId", hasChildren: "ceshiId" }

</script>
<style lang="scss" scoped></style>
