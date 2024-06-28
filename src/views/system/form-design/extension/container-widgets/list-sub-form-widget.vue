<template>
	<container-wrapper
		:designer="designer"
		:widget="widget"
		:parent-widget="parentWidget"
		:parent-list="parentList"
		:index-of-parent-list="indexOfParentList"
	>
		<div
			class="sub-form-container"
			:class="{ selected: selected }"
			@click.stop="selectWidget(widget)"
		>
			<FormDesignEntityList 
                :referenceEntity="widget.options.name" 
                :listConf="{
                    'showHeader': widget.options.showListHeader,
                    'showAdvancedQuery': widget.options.showAdvancedQuery,
                    'showQuickQuery': widget.options.showQuickQuery,
                    'showOpenBtn': widget.options.showOpenBtn,
                    'showEditBtn': widget.options.showEditBtn,
                    'showAddBtn': widget.options.showAddBtn,
                    'showMoreBtn': widget.options.showMoreBtn,
                    'showPagination': widget.options.showPagination,
                }"
                :paginationSize="widget.options.paginationSize"
            />
		</div>
	</container-wrapper>
</template>

<script>
import VisualDesign from "@/../lib/visual-design/designer.umd.js";
const { i18n, containerMixin, refMixinDesign } = VisualDesign.VFormSDK;
import FormDesignEntityList from "@/components/mlFormDesignComp/FormDesignEntityList.vue";
export default {
	name: "list-sub-form-widget",
	props: {
		widget: Object,
		parentWidget: Object,
		parentList: Array,
		indexOfParentList: Number,
		designer: Object,
	},
	mixins: [i18n, containerMixin, refMixinDesign],
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
	components: {
		FormDesignEntityList,
	},
};
</script>

<style lang="scss" scoped>
.sub-form-container.selected {
	outline: 2px solid var(--el-color-primary) !important;
}
:deep(.customize-menu-list){
    padding: 0 !important;
    min-width: 0!important;
}
</style>
