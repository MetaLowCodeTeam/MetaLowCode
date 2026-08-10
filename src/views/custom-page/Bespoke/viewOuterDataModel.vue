<template>
	<OuterDataModelList v-if="outerDataModelId" />
	<el-empty v-else description="未获取到 outerDataModelId 参数" />
</template>

<script setup>
import { ref, computed } from "vue";
import { useRoute } from "vue-router";
import OuterDataModelList from "@/views/system/data-base/components/OuterDataModel-list.vue";

const route = useRoute();
const outerDataModelId = computed(() => route.query.outerDataModelId || route.params.outerDataModelId || "");
</script>
