<template>
	<container-wrapper
		:designer="designer"
		:widget="widget"
		:parent-widget="parentWidget"
		:parent-list="parentList"
		:index-of-parent-list="indexOfParentList"
	>
		<section
			class="page-header-container-design"
			:class="[{ selected }, customClass]"
			@click.stop="selectWidget(widget)"
		>
			<header class="page-header-container-design__header">
				<span class="page-header-container-design__title">页眉</span>
				<span class="page-header-container-design__scope">
					从当前位置开始应用到后续页面
				</span>
			</header>
			<draggable
				:list="widget.widgetList"
				item-key="id"
				:group="'dragGroup'"
				ghost-class="ghost"
				:animation="200"
				tag="div"
				:component-data="{ name: 'fade', class: 'page-header-container-design__drop-zone' }"
				handle=".drag-handler"
				:move="checkContainerMove"
				@add="onContainerDragAdd($event, widget.widgetList)"
				@update="onContainerDragUpdate"
			>
				<template #item="{ element, index }">
					<div class="page-header-container-design__item">
						<component
							:is="element.type + '-widget'"
							v-if="element.category === 'container'"
							:key="element.id"
							:widget="element"
							:designer="designer"
							:parent-list="widget.widgetList"
							:index-of-parent-list="index"
							:parent-widget="widget"
						/>
						<component
							:is="element.type + '-widget'"
							v-else
							:key="element.id"
							:field="element"
							:designer="designer"
							:parent-list="widget.widgetList"
							:index-of-parent-list="index"
							:parent-widget="widget"
							:design-state="true"
						/>
					</div>
				</template>
			</draggable>
			<div v-if="!widget.widgetList.length" class="page-header-container-design__empty">
				将文本、报表字段、栅格或基础排版组件拖入此处
			</div>
		</section>
	</container-wrapper>
</template>

<script>
import VisualDesign from '@/../lib/visual-design/designer.umd.js'

const { ContainerWrapper, i18n, containerMixin, refMixinDesign } = VisualDesign.VFormSDK

export default {
	name: 'page-header-container-widget',
	componentName: 'ContainerWidget',
	components: { ContainerWrapper },
	mixins: [i18n, containerMixin, refMixinDesign],
	inject: ['refList'],
	props: {
		widget: Object,
		parentWidget: Object,
		parentList: Array,
		indexOfParentList: Number,
		designer: Object,
	},
	computed: {
		selected() {
			return this.widget.id === this.designer.selectedId
		},
		customClass() {
			return this.widget.options.customClass || ''
		},
	},
	created() {
		this.widget.options.displayName = '页眉'
		this.initRefList()
	},
}
</script>

<style scoped lang="scss">
.page-header-container-design {
	position: relative;
	margin: 12px 0;
	border: 1px dashed #a8abb2;
	border-radius: 6px;
	background: #fafbfc;
	overflow: hidden;
}

.page-header-container-design.selected {
	border-color: var(--el-color-primary);
	box-shadow: 0 0 0 1px var(--el-color-primary) inset;
}

.page-header-container-design__header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 12px;
	min-height: 32px;
	padding: 0 12px;
	border-bottom: 1px solid #e4e7ed;
	background: #f0f2f5;
	color: #606266;
	font-size: 12px;
}

.page-header-container-design__title {
	font-weight: 600;
	color: #303133;
}

.page-header-container-design__scope {
	white-space: nowrap;
}

.page-header-container-design__drop-zone {
	min-height: 54px;
	padding: 8px 12px;
}

.page-header-container-design__item + .page-header-container-design__item {
	margin-top: 4px;
}

.page-header-container-design__empty {
	pointer-events: none;
	position: absolute;
	left: 12px;
	right: 12px;
	bottom: 0;
	height: 54px;
	display: flex;
	align-items: center;
	justify-content: center;
	color: #909399;
	font-size: 12px;
}
</style>
