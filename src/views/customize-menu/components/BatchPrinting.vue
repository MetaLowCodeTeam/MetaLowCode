<!-- 批量打印 -->
<template>
	<div>批量打印</div>
</template>

<script setup>
import { onMounted, inject, ref } from "vue";
const $TOOL = inject("$TOOL");

let batchPrintingConfig = ref($TOOL.data.get("BatchPrintingConfig"));

onMounted(() => {
	// batchPrintingConfig.value = $TOOL.data.get("BatchPrintingConfig");
    console.log(batchPrintingConfig.value);
	console.log("批量打印");
});
</script>

<style></style>
