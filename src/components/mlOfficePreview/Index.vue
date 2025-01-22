<template>
	<div v-loading="loading" element-loading-text="渲染中...">
		<OfficeDocx
			v-if="type === 'docx'"
			:src="src"
			@rendered="renderedHandler"
			@error="errorHandler"
		/>
		<OfficeExcel
			v-else-if="type === 'xlsx'"
			:src="src"
			:options="options"
			@rendered="renderedHandler"
			@error="errorHandler"
		/>
		<OfficePdf
			v-else-if="type === 'pdf'"
			:src="src"
			@rendered="renderedHandler"
			@error="errorHandler"
		/>
		<OfficePptx
			v-else-if="type === 'pptx'"
			:src="src"
			@rendered="renderedHandler"
			@error="errorHandler"
		/>
		<div v-else>
			<el-empty :description="`暂不支持该文件类型：${type}`" />
		</div>
	</div>
</template>
<script setup>
import { ref, onMounted, watch } from "vue";
import OfficeDocx from "./components/OfficeDocx.vue";
import OfficeExcel from "./components/OfficeExcel.vue";
import OfficePdf from "./components/OfficePdf.vue";
import OfficePptx from "./components/OfficePptx.vue";

let loading = ref(false);

const props = defineProps({
	// 文件地址
	src: {
		type: String,
		default: "",
	},
	// 文件配置
	options: {
		type: Object,
		default: () => ({}),
	},
});

let type = ref("");

watch(
	() => props.src,
	(newVal) => {
		// 获取文件类型
		type.value = newVal.split(".").pop();
	}
);

onMounted(() => {
	loading.value = true;
    if(props.src){
        type.value = props.src.split(".").pop();
    }
});

const emit = defineEmits(["rendered", "error"]);

const renderedHandler = () => {
	loading.value = false;
	emit("rendered");
};
const errorHandler = () => {
	loading.value = false;
	emit("error");
};
</script>
