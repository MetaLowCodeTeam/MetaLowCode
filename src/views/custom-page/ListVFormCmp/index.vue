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
    />
    <mlCustomDetail 
        ref="detailRefs"
        :customDetailDialogTitle="customDetailDialogTitle"
    />
</template>

<script setup>
import { ElMessage } from "element-plus";
import { nextTick, onMounted, ref, getCurrentInstance } from "vue";
import { useRoute } from "vue-router";
import useCommonStore from "@/store/modules/common";
import { globalDsvDefaultData } from "@/utils/util";

/**
 * API
 */
import { getFormLayout } from "@/api/system-manager";
import mlCustomEdit from '@/components/mlCustomEdit/index.vue';
import mlCustomDetail from '@/components/mlCustomDetail/index.vue';

const { queryEntityNameByCode } = useCommonStore();
const Route = useRoute();

let formId = ref();
let entityCode = ref();
let entityName = ref();

// 表单数据
let optionData = ref({});
let globalDsv = ref(globalDsvDefaultData());
let haveLayoutJson = ref(false);
let notData = ref(false);
let loading = ref(false);

let vFormRef = ref();
let customDetailDialogTitle = ref('');

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
    globalDsv.value.exposed = getCurrentInstance().exposed;
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
            if(res.data.codeOptionData) {
                optionData.value = Object.assign(optionData.value, res.data.codeOptionData);
            }
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
        entityName: entityName.value,
        approvalConfigId: row.approvalConfigId,
    };
    editRefs.value.openDialog(tempV);
}

let detailRefs = ref();
// 打开其他实体详情
const viewToOtherEntity = (recordId, localDsv, formId, customDialogTitle) => {
    customDetailDialogTitle.value = customDialogTitle;
    detailRefs.value.openDialog(recordId, localDsv, formId);
}

defineExpose({
    viewToOtherEntity,
})

</script>
<style lang="scss" scoped>


.form-main {
	box-sizing: border-box;
	padding: 20px;
	.form-content {
		border-radius: 4px;
		background: #fff;
		padding: 20px;
	}
}
</style>
