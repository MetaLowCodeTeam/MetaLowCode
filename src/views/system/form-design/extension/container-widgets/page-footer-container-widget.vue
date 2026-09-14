<template>
	<container-wrapper
		:designer="designer"
		:widget="widget"
		:parent-widget="parentWidget"
		:parent-list="parentList"
		:index-of-parent-list="indexOfParentList"
	>
		<section
			class="page-footer-container-design"
			:class="[{ selected }, customClass]"
			@click.stop="selectWidget(widget)"
		>
			<header class="page-footer-container-design__header">
				<span class="page-footer-container-design__title">{{ displayName }}</span>
				<span class="page-footer-container-design__scope">
					从后续页面生效，页码从 {{ pageNumberStart }} 开始
				</span>
			</header>
			<draggable
				:list="widget.widgetList"
				item-key="id"
				:group="'dragGroup'"
				ghost-class="ghost"
				:animation="200"
				tag="div"
				:component-data="{ name: 'fade', class: 'page-footer-container-design__drop-zone' }"
				handle=".drag-handler"
				:move="checkFooterChildMove"
				@add="onFooterDragAdd"
				@update="onContainerDragUpdate"
			>
				<template #item="{ element, index }">
					<div class="page-footer-container-design__item">
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
			<div v-if="!widget.widgetList.length" class="page-footer-container-design__empty">
				将页码、文本、报表字段或栅格拖入此处
			</div>
		</section>
	</container-wrapper>
</template>

<script>
import { ElMessage } from 'element-plus'
import VisualDesign from '@/../lib/visual-design/designer.umd.js'

const { ContainerWrapper, i18n, containerMixin, refMixinDesign } = VisualDesign.VFormSDK

const ALLOWED_FOOTER_CHILD_TYPES = new Set([
	'grid',
	'table',
	'page-number',
	'ml-text',
	'report-field',
	'static-text',
	'html-text',
	'divider',
])

export default {
	name: 'page-footer-container-widget',
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
		displayName() {
			return '页脚'
		},
		pageNumberStart() {
			const value = Number(this.widget.options.pageNumberStart)
			return Number.isInteger(value) && value > 0 ? value : 1
		},
	},
	created() {
		this.widget.options.displayName = '页脚'
		this.initRefList()
	},
	methods: {
		checkFooterChildMove(event) {
			const child = event?.draggedContext?.element
			return !!child && ALLOWED_FOOTER_CHILD_TYPES.has(child.type)
		},
		onFooterDragAdd(event) {
			const child = this.widget.widgetList[event.newIndex]
			if (!child || !ALLOWED_FOOTER_CHILD_TYPES.has(child.type)) {
				if (child) this.widget.widgetList.splice(event.newIndex, 1)
				ElMessage.warning('页脚仅支持页码、文本、报表字段、栅格和基础排版组件')
				this.designer.emitHistoryChange()
				return
			}
			this.onContainerDragAdd(event, this.widget.widgetList)
		},
	},
}
</script>

<style scoped lang="scss">
.page-footer-container-design {
	position: relative;
	margin: 12px 0;
	border: 1px dashed #a8abb2;
	border-radius: 6px;
	background: #fafbfc;
	overflow: hidden;
}

.page-footer-container-design.selected {
	border-color: var(--el-color-primary);
	box-shadow: 0 0 0 1px var(--el-color-primary) inset;
}

.page-footer-container-design__header {
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

.page-footer-container-design__title {
	font-weight: 600;
	color: #303133;
}

.page-footer-container-design__scope {
	white-space: nowrap;
}

.page-footer-container-design__drop-zone {
	min-height: 54px;
	padding: 8px 12px;
}

.page-footer-container-design__item + .page-footer-container-design__item {
	margin-top: 4px;
}

.page-footer-container-design__empty {
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
