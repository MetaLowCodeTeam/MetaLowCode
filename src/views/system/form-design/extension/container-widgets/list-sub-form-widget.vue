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
			<EntityList isReferenceComp :referenceEntity="widget.options.name"> </EntityList>
		</div>
	</container-wrapper>
</template>

<script>
import VisualDesign from "@/../lib/visual-design/designer.umd.js";
const { i18n, containerMixin, refMixinDesign } = VisualDesign.VFormSDK;
import EntityList from "@/views/customize-menu/list.vue";
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
		EntityList,
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
