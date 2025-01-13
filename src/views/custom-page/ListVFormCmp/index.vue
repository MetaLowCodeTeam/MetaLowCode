<template>
	<!--  -->
	<div
		class="form-main"
		v-loading="loading"
		element-loading-text="表单加载中..."
	>
		<div v-if="!notData" class="form-content">
			<v-form-render
				v-if="haveLayoutJson"
				ref="vFormRef"
				:global-dsv="globalDsv"
				:option-data="optionData"
			/>
		</div>
		<el-empty v-else description="暂无数据" />
	</div>
    <mlCustomEdit 
        ref="editRefs"
        entityName="CustomFlowForm"
    />
</template>

<script setup>
import { ElMessage } from "element-plus";
import { nextTick, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import useCommonStore from "@/store/modules/common";

/**
 * API
 */
import { getFormLayout } from "@/api/system-manager";
import mlCustomEdit from '@/components/mlCustomEdit/index.vue';

const { queryEntityNameByCode } = useCommonStore();
const Route = useRoute();

let formId = ref();
let entityCode = ref();
let entityName = ref();

// 表单数据
let optionData = ref({});
let globalDsv = ref({
    uploadServer: import.meta.env.VITE_APP_BASE_API,
    baseApi: import.meta.env.VITE_APP_BASE_API,
    SERVER_API: import.meta.env.VITE_APP_BASE_API,
});
let haveLayoutJson = ref(false);
let notData = ref(false);
let loading = ref(false);

let vFormRef = ref();

onMounted(() => {
	formId.value = Route.query.formId;
	if (!formId.value) {
		ElMessage.error("没有找到表单ID");
		return;
	}
	entityCode.value = Route.query.formEntityCode;
	entityName.value = queryEntityNameByCode(entityCode.value);
    globalDsv.value.SERVER_API = import.meta.env.VITE_APP_BASE_API;
    globalDsv.value.createAndSubmit = createAndSubmit;
	loadForm();
});

const loadForm = async () => {
	loading.value = true;
	haveLayoutJson.value = false;
	notData.value = false;
    globalDsv.value.useFormId = formId.value;
	let res = await getFormLayout(entityName.value, formId.value);
	if (res) {
		if (res.data?.layoutJson) {
			haveLayoutJson.value = true;
			optionData.value = res.data.optionData || {};
			nextTick(() => {
				vFormRef.value.setFormJson(res.data.layoutJson);
				nextTick(() => {
					vFormRef.value.reloadOptionData();
				});
			});
		} else {
			notData.value = true;
		}
	} else {
		notData.value = true;
	}
	loading.value = false;
};


let editRefs = ref();
const createAndSubmit = (row) => {
    let tempV = {
        entityName: queryEntityNameByCode(row.entityCode),
        approvalConfigId: row.approvalConfigId,
    };
    editRefs.value.openDialog(tempV);
}

</script>
<style lang="scss" scoped>
:deep(.render-form) {
    .el-row {
        padding: 0 8px 0 8px !important;
    }
}

.form-main {
	height: 100%;
	box-sizing: border-box;
	padding: 20px;
	.form-content {
		border-radius: 4px;
		background: #fff;
		padding: 20px;
        height: calc(100% - 40px);
	}
}
</style>
