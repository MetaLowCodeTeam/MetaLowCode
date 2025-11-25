<template>
	<container-wrapper
		:designer="designer"
		:widget="widget"
		:parent-widget="parentWidget"
		:parent-list="parentList"
		:index-of-parent-list="indexOfParentList"
	>
		<div
			class="sub-form-container mb-10"
			:class="{ selected: selected }"
			@click.stop="selectWidget(widget)"
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
					showChangeQueryPanel: widget.options.showChangeQueryPanel,
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
                :detailEntityFlag="widget.options?.detailEntityFlag"
                :refEntityBindingField="widget.options?.refEntityBindingField"
                isVFormDesignMode
                :modelName="getListSubFormConfId()"
			/>
		</div>
	</container-wrapper>
</template>

<script>
import VisualDesign from "@/../lib/visual-design/designer.umd.js";
const { i18n, containerMixin, refMixinDesign, Utils } = VisualDesign.VFormSDK;
import FormDesignEntityList from "@/components/mlFormDesignComp/FormDesignEntityList.vue";
import { getModelName } from "@/utils/util";
export default {
	name: "list-sub-form-widget",
	props: {
		widget: Object,
		parentWidget: Object,
		parentList: Array,
		indexOfParentList: Number,
		designer: Object,
	},
	components: {
		FormDesignEntityList,
	},
	mixins: [i18n, containerMixin, refMixinDesign],
	inject: ["refList"],
	computed: {
		selected() {
			return this.widget.id === this.designer.selectedId;
		},

		customClass() {
			return this.widget.options.customClass || "";
		},

		curSubFormKey() {
			return this.subFormKey;
		},
	},
	created() {
		this.initRefList();
	},
	methods: {
		/* 强制刷新，重新生成整个子表单组件！！！ */
		forceUpdate() {
			this.subFormKey = "sfKey" + Utils.generateId();
		},
        getListSubFormConfId(){
            if(getModelName()){
                return getModelName() + "-" + this.widget.id + '-' + this.widget.options.name
            }else {
                return this.widget.id + '-' + this.widget.options.name;
            }   
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
