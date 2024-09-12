<template>
	<!--  -->
	<el-collapse v-model="activeNames">
		<el-collapse-item name="1">
			<template #title>
				<h3>信号设置</h3>
			</template>
			<div class="work-flow-conditions">
				<div class="label-title mb-5">信号名称</div>
				<div class="edit-field-list-box">
                    <el-input v-model="myFormData.signalName" placeholder="请输入信号名称" clearable></el-input>
                </div>
			</div>
		</el-collapse-item>
	</el-collapse>
</template>

<script setup>
import { watchEffect, ref, watch } from "vue";

const props = defineProps({
	formData: { type: Object, default: () => {} },
});

const emit = defineEmits(['setNodeData'])

let myFormData = ref({});
let activeNames = ref(["1"]);




watch(
    () => myFormData.value,
    () => {
        emit('setNodeData', myFormData.value)
    },
    { deep: true }
)

watchEffect(() => {
	myFormData.value = JSON.parse(JSON.stringify(props.formData));
});
</script>
<style lang="scss" scoped>
</style>
