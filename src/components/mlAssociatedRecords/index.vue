<template>
	<!--  -->
	<el-select
		v-model="myModelValue"
		multiple
		filterable
		class="w-100 ml-associated-records"
		value-key="label"
		v-loading="compLoading"
        @change="onChange"
	>
		<el-option
			v-for="item in associatedEntityList"
			:key="item.value"
			:label="item.label"
			:value="item"
		/>
	</el-select>
</template>

<script setup>
import common from "@/api/common";
import { onMounted, ref, watchEffect } from "vue";
const props = defineProps({
	modelValue: null,
	entityCode: {
		type: [Number, String],
		default: "",
	},
    queryLevel: {
        type: Number,
		default: 2,
    }
});
const emits = defineEmits(["update:modelValue","loadDataFinish"])

let myModelValue = ref();

watchEffect(() => {
	myModelValue.value = props.modelValue;
});

onMounted(() => {
	showAssociatedRecords();
});

let compLoading = ref(false);
let associatedEntityList = ref([]);
// 同时分配关联记录
const showAssociatedRecords = async () => {
	compLoading.value = true;
	let res = await common.queryEntityList(props.entityCode, false, true, true, false, false, props.queryLevel);
	if (res) {
		associatedEntityList.value = res.data || [];
        emits('loadDataFinish', associatedEntityList.value)
	}
	compLoading.value = false;
};

const onChange = () => {
    emits("update:modelValue", myModelValue.value)
}
</script>
<style lang="scss" scoped>
.ml-associated-records {
    text-align: left;
}
</style>
