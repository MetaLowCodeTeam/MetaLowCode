<template>
	<!--  -->
	
	<MlCustomSubFormList
		v-if="entityCode"
        :formEntityId="formEntityId"
		:referenceEntity="referenceEntity"
        :detailEntityFlag="detailEntityFlag"
        :refEntityBindingField="refEntityBindingField"
        :paginationSize="paginationSize"
        :formRef="formRef"
        :isVFormDesignMode="isVFormDesignMode"
        :modelName="modelName"
        :listConf="listConf"
        ref="listSubForm"
	/>
	<el-empty v-else description="请先绑定明细实体" />
</template>

<script>
import MlCustomSubFormList from "@/components/mlCustomSubFormList/index.vue";
import useCommonStore from "@/store/modules/common";
export default {
	components: {
		MlCustomSubFormList,
	},
	props: {
        listConf: {
			type: Object,
			default: () => {},
		},
		isVFormDesignMode: {
			type: Boolean,
			default: false,
		},
		formEntityId: {
			type: String,
			default: "",
		},
		referenceEntity: {
			type: String,
			default: "",
		},
		detailEntityFlag: {
			type: Boolean,
			default: true,
		},
		refEntityBindingField: {
			type: String,
			default: "",
		},
		paginationSize: {
			type: [Number, String],
			default: 20,
		},
		tableHeight: {
			type: [Number, String],
			default: 294,
		},
		modelName: {
			type: String,
			default: "",
		},
		formRef: {},
	},
	watch: {
		referenceEntity(newV) {
			this.entityCode = useCommonStore().allEntityCode[newV];
		},
	},
	data() {
		return {
			entityCode: "",
		};
	},
	mounted() {
		this.entityCode = useCommonStore().allEntityCode[this.referenceEntity];
	},
	methods: {
		getTableDataList() {
			return this.$refs.listSubForm.getTableDataList();
		},
        refresh(){
            this.$refs.listSubForm.refresh();
        }
	},
};
</script>
