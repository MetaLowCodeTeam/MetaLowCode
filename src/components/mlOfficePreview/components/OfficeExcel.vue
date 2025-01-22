<template>
	<vue-office-excel
		:src="src"
		:options="options"
		style="height: 100vh"
		@rendered="renderedHandler"
		@error="errorHandler"
	/>
</template>

<script setup>
import { ref, onMounted } from "vue";
//引入VueOfficeDocx组件
import VueOfficeExcel from "@vue-office/excel";
//引入相关样式
import "@vue-office/excel/lib/index.css";
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

const myOptions = ref({
	xls: false, //预览xlsx文件设为false；预览xls文件设为true
	minColLength: 0, // excel最少渲染多少列，如果想实现xlsx文件内容有几列，就渲染几列，可以将此值设置为0.
	minRowLength: 0, // excel最少渲染多少行，如果想实现根据xlsx实际函数渲染，可以将此值设置为0.
	widthOffset: 10, //如果渲染出来的结果感觉单元格宽度不够，可以在默认渲染的列表宽度上再加 Npx宽
	heightOffset: 10, //在默认渲染的列表高度上再加 Npx高
	beforeTransformData: (workbookData) => {
		return workbookData;
	}, //底层通过exceljs获取excel文件内容，通过该钩子函数，可以对获取的excel文件内容进行修改，比如某个单元格的数据显示不正确，可以在此自行修改每个单元格的value值。
	transformData: (workbookData) => {
		return workbookData;
	}, //将获取到的excel数据进行处理之后且渲染到页面之前，可通过transformData对即将渲染的数据及样式进行修改，此时每个单元格的text值就是即将渲染到页面上的内容
});

onMounted(() => {
	myOptions.value = Object.assign(myOptions.value, props.options);
});

const emit = defineEmits(["rendered", "error"]);
const renderedHandler = () => {
	emit("rendered");
};
const errorHandler = () => {
	emit("error");
};
</script>
