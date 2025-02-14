<template>
	<!--  -->
	<div
		class="card-layout"
		v-loading="loading"
		element-loading-text="数据加载中..."
	>
		<v-form-render
			v-if="layoutJson"
			ref="vFormRef"
			:option-data="optionData"
			:form-data="formData"
			:global-dsv="globalDsv"
		/>
		<el-empty v-else :image-size="100" description="未查询到相关配置数据" />
	</div>
</template>

<script setup>
import { ref, reactive, nextTick, watch } from "vue";
import { queryById } from "@/api/crud";
import { getRecordApprovalState } from '@/api/approval';
import { globalDsvDefaultData } from "@/utils/util";
const props = defineProps({
	layoutJson: { type: String, default: "" },
	recordId: { type: String, default: "" },
	isLoadData: { type: Boolean, default: false },
	optionData: { type: Object, default: () => {} },
});

const emits = defineEmits(["loading"]);

const vFormRef = ref();
const optionData = ref({});
const formData = reactive();
const globalDsv = ref(globalDsvDefaultData);

let loading = ref(false);

watch(
	() => props.isLoadData,
	async (v) => {
		if (v) {
			// console.log(props.recordId,'recordId')
            loadFormData();
		}
	},
	{
		deep: false,
	}
);



const loadFormData = async () => {
	if (props.layoutJson) {
        optionData.value = props.optionData || {};
		vFormRef.value.setFormJson(props.layoutJson);
		globalDsv.value.formStatus = "read";
		globalDsv.value.formEntityId = props.recordId;
		emits("loading", true);
		loading.value = true;
        // 获取审批信息
        let recordApprovalRes = await getRecordApprovalState(props.recordId);
        if(recordApprovalRes.data?.flowVariables){
            globalDsv.value.flowVariables = recordApprovalRes.data.flowVariables;
        }
		let queryByIdRes = await queryById(props.recordId);
        
		if (queryByIdRes) {
			nextTick(() => {
				vFormRef.value.setFormData(queryByIdRes.data);
				nextTick(() => {
					vFormRef.value.reloadOptionData();
					vFormRef.value.setReadMode();
				});
			});
		}
		loading.value = false;
		emits("loading", false);
	}
};

// watchEffect(() => {
//     console.log(props.isLoadData,'isLoadData')
// })

</script>
<style lang="scss" scoped>
.card-layout {
	min-height: 120px;
}
:deep(.el-form-item) {
	margin-bottom: 0;
}
:deep(.render-form) {
    .el-row {
        padding: 0 8px 0 8px !important;
    }
}

</style>
