<template>
	<container-item-wrapper :widget="widget">
		<FormDesignEntityList
			:referenceEntity="widget.options.name"
			:listConf="{
				showHeader: widget.options.showListHeader,
				showAdvancedQuery: widget.options.showAdvancedQuery,
				showQuickQuery: widget.options.showQuickQuery,
				showOpenBtn: widget.options.showOpenBtn,
				showEditBtn: widget.options.showEditBtn,
				showAddBtn: widget.options.showAddBtn,
				showMoreBtn: widget.options.showMoreBtn,
				showPagination: widget.options.showPagination,
			}"
			:paginationSize="widget.options.paginationSize"
			:tableHeight="widget.options.tableHeight"
			:formRef="getForm()"
            :formEntityId="getFormEntityId()"
		/>
	</container-item-wrapper>
</template>

<script>
import FormDesignEntityList from "@/components/mlFormDesignComp/FormDesignEntityList.vue";
import VisualDesign from "@/../lib/visual-design/designer.umd.js";
const { emitter, i18n, containerItemMixin, refMixin } = VisualDesign.VFormSDK;
export default {
	name: "list-sub-form-item",
	props: {
		widget: Object,
	},
	components: {
		FormDesignEntityList,
	},
	mixins: [emitter, i18n, containerItemMixin, refMixin],
	inject: ["refList", "sfRefList", "globalModel"],
	created() {
		this.initRefList();
	},
	beforeUnmount() {
		this.unregisterFromRefList();
	},
	methods: {
		getForm() {
			let formRef = this.getFormRef();
			formRef.referenceCompName = this.widget.options.name;
			return formRef;
		},
        getFormEntityId(){
            return this.getFormRef().getGlobalDsv().formEntityId;
        },
	},
};
</script>

<style lang="scss" scoped>
.sub-form-container.selected {
	outline: 2px solid var(--el-color-primary) !important;
}
:deep(.customize-menu-list) {
	padding: 0 !important;
	min-width: 0 !important;
}
</style>
<style>
.el-dialog--center .mldialog .el-dialog__footer {
	text-align: right;
}
</style>
