<template>
	<ml-dialog
		v-model="isShow"
		title="价格对比"
		width="80%"
		append-to-body
		top="5vh"
	>
		<template #subtitle>
			<span class="my-subtitle">
                共找到
                <span class="ml-a-span">{{ total }}</span>
                家供应商
            </span>
		</template>
		<div v-loading="loading" element-loading-text="加载中...">
			<PriceComparison
				hideTitle
				:recordId="currentRecordId"
				@loadDataFinish="loadDataFinish"
			/>
		</div>
	</ml-dialog>
</template>

<script setup>
import { ref } from "vue";
import PriceComparison from "./PriceComparison.vue";

const isShow = ref(false);
let loading = ref(false);
let currentRecordId = ref("");
let total = ref(0);
const openDialog = (recordId = "") => {
	isShow.value = true;
	currentRecordId.value = recordId;
};

const loadDataFinish = (data) => {
	total.value = data?.pagination?.total || 0;
};

defineExpose({
	openDialog,
});
</script>

<style lang="scss" scoped>
.my-subtitle {
	margin-left: 10px;
    font-size: 13px;
}
</style>