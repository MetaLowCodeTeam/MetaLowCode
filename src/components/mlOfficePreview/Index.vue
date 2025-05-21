<template>
	<div v-loading="loading" element-loading-text="渲染中...">
		<OfficeDocx
			v-if="type === 'docx'"
			:src="formatSrc(src)"
			@rendered="renderedHandler"
			@error="errorHandler"
		/>
		<OfficeExcel
			v-else-if="type === 'xlsx'"
			:src="formatSrc(src)"
			:options="options"
			@rendered="renderedHandler"
			@error="errorHandler"
		/>
		<OfficePdf
			v-else-if="type === 'pdf'"
			:src="formatSrc(src)"
			@rendered="renderedHandler"
			@error="errorHandler"
		/>
		<OfficePptx
			v-else-if="type === 'pptx'"
			:src="formatSrc(src)"
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
import useCommonStore from "@/store/modules/common";
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";
const router = useRouter();
const { publicSetting } = storeToRefs(useCommonStore());

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
		type.value = router.currentRoute.value.query?.type || newVal.split(".").pop();
	}
);

onMounted(() => {
	loading.value = true;
    if(props.src){
        type.value = router.currentRoute.value.query?.type || props.src.split(".").pop();
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

const formatSrc = (url) => {
    // 如果url不是http开头，则加上 VITE_APP_BASE_API
    if(url.indexOf("http") !== 0) {
        return import.meta.env.VITE_APP_BASE_API + url;
    }
    return url;
}
</script>


