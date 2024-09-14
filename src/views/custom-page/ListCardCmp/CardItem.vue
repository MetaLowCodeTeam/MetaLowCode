<style lang="scss" scoped>
.list-card-item {
	width: 100%;
	background: #fff;
	border-radius: 4px;
	box-sizing: border-box;
	padding: 10px;
	border: 1px solid var(--el-border-color-light);
	position: relative;
	&.selected {
		border-color: var(--el-color-primary);
	}
	.operate-row {
		user-select: none;
		width: 100%;
		height: 26px;
		line-height: 26px;
		box-sizing: border-box;
		position: absolute;
		padding: 0 10px;
		left: 0;
		bottom: 0;
		font-size: 13px;
        display: none;
	}
    &:hover {
		box-shadow: var(--el-box-shadow-light);
        .operate-row {
            display: block;
        }
	}
}
.prt-2 {
    position: relative;
    top: 2px;
}
</style>

<template>
	<!--  -->
	<div class="list-card-item" :class="{ selected: row.isVfSelected }">
		<v-form-render
			v-if="curtFormLayout.layoutJson"
			ref="vFormRef"
			:global-dsv="globalDsv"
			:option-data="optionData"
		/>
		<div class="operate-row">
			<span class="ml-a-span" @click="row.isVfSelected = !row.isVfSelected">
				<el-icon class="prt-2">
					<Select />
				</el-icon>
				{{ row.isVfSelected ? "取消选中" : "选中" }}
			</span>
			<span class="ml-a-span fr">
				<el-icon class="prt-2"><Edit /></el-icon>
				编辑
			</span>
		</div>
	</div>
</template>

<script setup>
import { nextTick, onMounted, ref, watchEffect } from "vue";

const props = defineProps({
	formLayout: {
		type: Object,
		default: () => {},
	},
	row: {
		type: Object,
		default: () => {},
	},
	nameFieldName: {
		type: String,
		default: "",
	},
	idFieldName: {
		type: String,
		default: "",
	},
});
let curtFormLayout = ref({});

let globalDsv = ref({
	uploadServer: import.meta.env.VITE_APP_BASE_API,
});
let optionData = ref({});

let vFormRef = ref();

onMounted(() => {
	curtFormLayout.value = props.formLayout || {};
	let { optionData, formUploadParam, layoutJson } = curtFormLayout.value;
	optionData.value = optionData || {};
	if (formUploadParam) {
		globalDsv.value.cloudUploadToken = formUploadParam.cloudUploadToken;
		globalDsv.value.cloudStorage = formUploadParam.cloudStorage;
		globalDsv.value.picUploadURL = formUploadParam.picUploadURL;
		globalDsv.value.fileUploadURL = formUploadParam.fileUploadURL;
		globalDsv.value.picDownloadPrefix = formUploadParam.picDownloadPrefix;
		globalDsv.value.fileDownloadPrefix = formUploadParam.fileDownloadPrefix;
	}
	globalDsv.value.formStatus = "read";
	globalDsv.value.formEntityId = props.row[props.idFieldName];
	nextTick(() => {
		vFormRef.value.setFormJson(layoutJson);
		nextTick(() => {
			vFormRef.value.setFormData(props.row);
			nextTick(() => {
				vFormRef.value.reloadOptionData();
				vFormRef.value.setReadMode();
			});
		});
	});
});
</script>
