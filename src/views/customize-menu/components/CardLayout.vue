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
const props = defineProps({
	layoutJson: { type: String, default: "" },
	recordId: { type: String, default: "" },
	isLoadData: { type: Boolean, default: false },
	// data: { type: Object, default: () => {} },
});

const emits = defineEmits(["loading"]);

const vFormRef = ref();
const optionData = reactive({});
const formData = reactive();
const globalDsv = ref({});

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
		vFormRef.value.setFormJson(props.layoutJson);
		globalDsv.value.formStatus = "read";
		emits("loading", true);
		loading.value = true;
		let queryByIdRes = await queryById(props.recordId);
		if (queryByIdRes) {
			if (queryByIdRes?.flowVariables) {
				globalDsv.value.flowVariables = queryByIdRes.flowVariables;
			}
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
</style>
