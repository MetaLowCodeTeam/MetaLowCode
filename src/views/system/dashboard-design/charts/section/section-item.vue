<template>
	<div>
		<template v-if="!!widget.widgetList && (widget.widgetList.length > 0)">
			<template v-for="(subWidget, swIdx) in widget.widgetList">
				<template v-if="'container' === subWidget.category">
					<component :is="getComponentByContainer(subWidget)" :widget="subWidget" :key="swIdx" :parent-list="widget.widgetList"
							   :index-of-parent-list="swIdx" :parent-widget="widget"
							   :sub-form-row-id="subFormRowId" :sub-form-row-index="subFormRowIndex" :sub-form-col-index="subFormColIndex">
						<!-- 递归传递插槽！！！ -->
						<template v-for="slot in Object.keys($slots)" v-slot:[slot]="scope">
							<slot :name="slot" v-bind="scope"/>
						</template>
					</component>
				</template>
				<template v-else>
					<component :is="subWidget.type + '-widget'" :field="subWidget" :designer="null" :key="swIdx" :parent-list="widget.widgetList"
							   :index-of-parent-list="swIdx" :parent-widget="widget"
							   :sub-form-row-id="subFormRowId" :sub-form-row-index="subFormRowIndex" :sub-form-col-index="subFormColIndex">
						<!-- 递归传递插槽！！！ -->
						<template v-for="slot in Object.keys($slots)" v-slot:[slot]="scope">
							<slot :name="slot" v-bind="scope"/>
						</template>
					</component>
				</template>
			</template>
		</template>
	</div>
</template>

<script>
export default {
	name: "section-item",
	props: {
		widget: Object,
		parentWidget: Object,
		parentList: Array,
		indexOfParentList: Number,

		subFormRowIndex: { /* 子表单组件行索引，从0开始计数 */
			type: Number,
			default: -1
		},
		subFormColIndex: { /* 子表单组件列索引，从0开始计数 */
			type: Number,
			default: -1
		},
		subFormRowId: { /* 子表单组件行Id，唯一id且不可变 */
			type: String,
			default: ''
		},
	},
	methods: {
		getComponentByContainer(con) {
			if (con.type === 'grid') {  //grid-item跟VueGridLayout全局注册组件重名，故特殊处理！！
				return 'vf-grid-item'
			}

			return con.type + '-item'
		},

	}
}
</script>

<style scoped>

</style>
