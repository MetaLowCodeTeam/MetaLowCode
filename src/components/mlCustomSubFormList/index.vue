<template>
	<component
		v-if="comName"
		:is="comName"
		:formEntityId="formEntityId"
		:referenceEntity="referenceEntity"
		:detailEntityFlag="detailEntityFlag"
		:refEntityBindingField="refEntityBindingField"
		:listConf="listConf"
		:paginationSize="paginationSize"
        :formRef="formRef"
        :isVFormDesignMode="isVFormDesignMode"
        :modelName="modelName"
        ref="listSubForm"
	></component>
</template>

<script>
import { getListSubFormCmpByEntityName } from "@/views/custom-page/ListSubFormCmp/customListSubFormEntry.js";
export default {
	props: {
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
		listConf: {
			type: Object,
			default: () => {},
		},
		paginationSize: {
			type: [Number, String],
			default: 20,
		},
        modelName: {
            type: String,
			default: "",
        },
		formRef: {},
	},
    watch: {
		referenceEntity(newV) {
            this.comName = getListSubFormCmpByEntityName(newV);
            if (!this.comName) {
                this.comName = "default-list-sub-form";
            }
		},
	},
	data() {
		return {
			comName: "",
		};
	},
	mounted() {
		this.comName = getListSubFormCmpByEntityName(this.referenceEntity);
		if (!this.comName) {
			this.comName = "default-list-sub-form";
		}
	},
    methods: {
        getTableDataList(){
            return this.$refs.listSubForm?.getTableDataList();
        }
    }
};
</script>
<style lang="scss" scoped>
.form-design-entity-list {
	margin-bottom: 10px;
}
:deep(.table-footer) {
	z-index: 998 !important;
}
:deep(.table-search-box) {
	height: 63px !important;
	border-left: 1px solid #ebeef5;
	border-right: 1px solid #ebeef5;
}
</style>
