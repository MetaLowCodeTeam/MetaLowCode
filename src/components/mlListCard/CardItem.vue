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
	box-shadow: var(--el-box-shadow-light);
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
		&.show {
			display: block;
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
		border-color: var(--el-color-primary);
		.select-row {
			display: block;
		}
	}
}
.prt-2 {
	position: relative;
	top: 2px;
}
.disabled {
	color: #a8abb2;
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
			:option-data="myOptionData"
		/>
		<div
			class="select-row"
			:class="{ 'not-show': row.isVfEdit, show: row.isVfSelected }"
            v-if="!isView"
		>
			<span
				class="ml-a-span"
				@click="row.isVfSelected = !row.isVfSelected"
			>
				<el-icon class="prt-2">
					<Select />
				</el-icon>
				{{ row.isVfSelected ? "取消选中" : "选中" }}
			</span>
			<el-tooltip
				class="box-item"
				effect="dark"
				content="记录正在审批中，禁止编辑"
				placement="top"
				v-if="row.approvalStatus?.value == 1"
			>
				<span class="ml-a-span fr disabled">
					<el-icon class="prt-2"><Edit /></el-icon>
					编辑
				</span>
			</el-tooltip>
			<el-tooltip
				class="box-item"
				effect="dark"
				content="记录已完成审批，禁止编辑"
				placement="top"
				v-else-if="
					row.approvalStatus?.value != 1 &&
					!checkModifiableEntity(
						row[idFieldName],
						row.approvalStatus?.value
					)
				"
			>
				<span class="ml-a-span fr disabled">
					<el-icon class="prt-2"><Edit /></el-icon>
					编辑
				</span>
			</el-tooltip>
			<span class="ml-a-span fr" @click="editRow" v-else>
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
import { nextTick, onMounted, ref, watch } from "vue";
import useCommonStore from "@/store/modules/common";
import { globalDsvDefaultData } from "@/utils/util";
const { checkModifiableEntity } = useCommonStore();
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
    // 查看状态  没有鼠标移入显示
    isView: {
        type: Boolean,
        default: false,
    },
});

let curtFormLayout = ref({});

watch(
	() => props.formLayout,
	() => {
		initData();
	},
	{ deep: true }
);

let globalDsv = ref(globalDsvDefaultData());
let myOptionData = ref({});

let vFormRef = ref();

onMounted(() => {
	initData();
});

const initData = () => {
	curtFormLayout.value = props.formLayout || {};
	let { optionData, formUploadParam, layoutJson } = curtFormLayout.value;
	myOptionData.value = optionData || {};
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
    console.log(curtFormLayout.value,'curtFormLayout.value');
	nextTick(() => {
		vFormRef.value?.setFormJson(layoutJson);
		nextTick(() => {
			vFormRef.value?.setFormData(props.row);
			nextTick(() => {
				vFormRef.value?.reloadOptionData();
				vFormRef.value?.setReadMode(true);
			});
		});
	});
};

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
				let res = await saveRecord(
					entity.name,
					row[idFieldName],
					formData
				);
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

defineExpose({
	initData,
});
</script>
