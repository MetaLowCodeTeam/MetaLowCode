<template>
    <EntityList
		ref="EntityListRefs"
		:listConf="listParamConf"
		:paginationConf="paginationConf"
        customListType="slotTable"
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

let paginationConf = ref({});

</script>

<style>

</style>