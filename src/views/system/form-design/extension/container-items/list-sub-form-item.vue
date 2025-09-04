<template>
	<container-item-wrapper :widget="widget">
        <div 
            class="mb-10"
            :style="{
                height: widget.options.listSubFormHeight + 'px',
            }"
        >
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
                    showOperateColumn: widget.options.showOperateColumn,
                    showDelBtn: widget.options.showDelBtn,
                    showBatchUpdateSet: widget.options.showBatchUpdateSet,
                    showBatchUpdateBtn: widget.options.showBatchUpdateBtn,
                }"
                :paginationSize="widget.options.paginationSize"
                :formRef="getForm()"
                :formEntityId="getFormEntityId()"
                :detailEntityFlag="widget.options?.detailEntityFlag"
                :refEntityBindingField="widget.options?.refEntityBindingField"
                :modelName="getListSubFormConfId()"
                ref="listSubForm"
            />
        </div>
		
	</container-item-wrapper>
</template>

<script>
import FormDesignEntityList from "@/components/mlFormDesignComp/FormDesignEntityList.vue";
import VisualDesign from "@/../lib/visual-design/designer.umd.js";
import { getModelName } from "@/utils/util";
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
    mounted(){
        this.$nextTick(() => {
            this.$refs.listSubForm.setParentFormRef(this.getForm());
        })
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
        getListSubFormConfId(){
            if(getModelName()){
                return getModelName() + "-" + this.widget.id + '-' + this.widget.options.name
            }else {
                return this.widget.id + '-' + this.widget.options.name;
            }   
        },
        getTableDataList(){
            return this.$refs.listSubForm.getTableDataList();
        },
        getSelectedRow(){
            return this.$refs.listSubForm.getSelectedRow();
        },
        getCurrentExposed(){
            return this.$refs.listSubForm.getCurrentExposed();
        },
        refresh(){
            this.$refs.listSubForm.refresh();
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
.el-dialog--center .ml-dialog .el-dialog__footer {
	text-align: right;
}
</style>
