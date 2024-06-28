<template>
	 <container-item-wrapper :widget="widget">
		<div
			class="sub-form-container"
		>
            {{ widget }}
            123
			<!-- <FormDesignEntityList 
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
            /> -->
		</div>
	</container-item-wrapper>
</template>

<script>
import FormDesignEntityList from "@/components/mlFormDesignComp/FormDesignEntityList.vue";
export default {
	name: "list-sub-form-widget",
	props: {
		widget: Object,
	},
	components: {
		FormDesignEntityList,
	},
    mounted(){
        console.log(this.widget,'widget')
    }
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
