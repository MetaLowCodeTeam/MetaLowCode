<template>
	<el-collapse v-model="activeNames">
		<EventTimed
			v-if="formData.boundaryType == 'timed' || formData.boundaryType == 'nonTimed'"
			:formData="myFormData"
		/>
	</el-collapse>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from "vue";
import EventTimed from "./Event-Timed.vue";
const props = defineProps({
	formData: { Type: Object, default: () => {} },
});
const emits = defineEmits(["setNodeData"]);
let myFormData = ref({});

let activeNames = ref(["1"]);

const initFormData = () => {
	myFormData.value = props.formData;
};

// onMounted(() => {
// 	initFormData();
// });

watch(
	() => props.formData,
	() => {
		initFormData();
	},
	{
		immediate: true,
	}
);

watch(
	() => myFormData.value,
	() => {
		emits("setNodeData", myFormData.value);
	},
	{
		deep: true,
	}
);


// // 监听数据
// watchEffect(() => {
// 	myFormData.value = props.formData;
// 	console.log(myFormData.value, "myFormData.value");
// })

</script>
