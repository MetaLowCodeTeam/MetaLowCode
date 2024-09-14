<style lang="scss" scoped>
.list-card-item {
	width: 100%;
	background: #fff;
	border-radius: 4px;
	box-sizing: border-box;
	padding: 10px;
	border: 1px solid var(--el-border-color-light);
	position: relative;
    margin-bottom: 10px;
	&.selected {
		border-color: var(--el-color-primary);
	}
	.operate-row,
	.select-row {
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
	}
	.select-row {
		display: none;
		&.not-show {
			display: none !important;
		}
	}
	.operate-row {
		display: none;
		text-align: right;
		&.show {
			display: block;
		}
	}
	&:hover {
		box-shadow: var(--el-box-shadow-light);
		.select-row {
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
	<div
		class="list-card-item"
		:class="{ selected: row.isVfSelected }"
		v-loading="loading"
		element-loading-text="保存中..."
	>
		<v-form-render
			v-if="curtFormLayout.layoutJson"
			ref="vFormRef"
			:global-dsv="globalDsv"
			:option-data="optionData"
		/>
		<div class="select-row" :class="{ 'not-show': row.isVfEdit }">
			<span
				class="ml-a-span"
				@click="row.isVfSelected = !row.isVfSelected"
			>
				<el-icon class="prt-2">
					<Select />
				</el-icon>
				{{ row.isVfSelected ? "取消选中" : "选中" }}
			</span>
			<span class="ml-a-span fr" @click="editRow">
				<el-icon class="prt-2"><Edit /></el-icon>
				编辑
			</span>
		</div>
		<div class="operate-row" :class="{ show: row.isVfEdit }">
			<span class="ml-a-span mr-10" @click="cancelOperate">
				<el-icon class="prt-2"><CloseBold /></el-icon>
				取消
			</span>
			<span class="ml-a-span" @click="confirmOperate">
				<el-icon class="prt-2">
					<Select />
				</el-icon>
				保存
			</span>
		</div>
	</div>
</template>

<script setup>
import { nextTick, onMounted, ref } from "vue";
/**
 * Api
 */
import { saveRecord } from "@/api/crud";
import { ElMessage } from "element-plus";
const props = defineProps({
	formLayout: {
		type: Object,
		default: () => {},
	},
	row: {
		type: Object,
		default: () => {},
	},
	entity: {
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
				vFormRef.value.setReadMode(true);
			});
		});
	});
});

let loading = ref(false);

// 源数据
let sourceRow = ref({});
// 编辑行
const editRow = () => {
	sourceRow.value = JSON.parse(JSON.stringify(props.row));
	props.row.isVfEdit = !props.row.isVfEdit;
	vFormRef.value.setReadMode(false);
};
// 取消操作
const cancelOperate = () => {
	props.row.isVfEdit = !props.row.isVfEdit;
	vFormRef.value.setFormData(sourceRow.value);
	nextTick(() => {
		vFormRef.value.setReadMode(true);
	});
};
// 确认操作
const confirmOperate = () => {
	loading.value = true;
	vFormRef.value
		.getFormData()
		.then(async (formData) => {
			if (formData) {
				let { entity, idFieldName, row } = props;
				let res = await saveRecord(entity.name, row[idFieldName], formData);
				if (res) {
					props.row.isVfEdit = false;
                    vFormRef.value.setReadMode(true);
					ElMessage.success("保存成功");
				} else {
					ElMessage.error("保存失败");
				}
			}
			loading.value = false;
		})
		.catch((err) => {
			loading.value = false;
			console.log(err, "err");
			ElMessage.error("表单校验失败，请修改后重新提交");
		});
	// setTimeout(() => {
	//     loading.value = false;
	// }, 2000);
};
</script>
