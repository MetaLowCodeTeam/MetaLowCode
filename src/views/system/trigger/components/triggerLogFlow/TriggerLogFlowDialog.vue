<template>
	<ml-dialog :title="data.flowName" v-model="isShow" width="80%" scrollbarMaxHeight="700px" top="9vh" append-to-body>
		<div class="errorlog-box" v-loading="loading">
			<ExecutePathFlow
				v-model="data.nodeConfig"
                :executePath="currentExecutePath"
                @error-click="errorClick"
			/>
		</div>
	</ml-dialog>
</template>

<script setup>
import { ref } from "vue";
import { getTriggerLogTree } from "@/api/trigger";
import ExecutePathFlow from "./ExecutePathFlow/index.vue";
let isShow = ref(false);
let loading = ref(false);
let data = ref({});
let currentExecutePath = ref("");
const emit = defineEmits(["errorClick"]);
const openDialog = (executePath) => {
	// console.log(executePath, "executePath");
	isShow.value = true;
	loadTriggerLogTree(executePath);
	currentExecutePath.value = executePath;
};

const loadTriggerLogTree = async (executePath) => {
	loading.value = true;
	let res = await getTriggerLogTree(executePath);
	if (res?.code == 200) {
		data.value = Object.assign(data.value, res.data);
	}
	loading.value = false;
};

const errorClick = (item) => {
    emit("errorClick", item);
};

defineExpose({
	openDialog,
});
</script>

<style scoped lang="scss">
.errorlog-box {
    background: #F6F8F9;
}
/* Styles here */
</style>
