<template>
	<smart-widget-grid :layout="gridLayout" v-if="widget.widgetList.length <= 0"
					   :row-height="48"
					   :margin="[15, 15]"
					   :is-static="false"
					   :auto-size="true">

		<template #[defaultSlotName]>
			<smart-widget title="操作提示" refresh fullscreen>
				<div class="layout-center">
					<h3>选择左侧图表组件，鼠标双击即可加入画布</h3>
				</div>
			</smart-widget>
		</template>

	</smart-widget-grid>

	<smart-widget-grid :layout="gridLayout" v-if="widget.widgetList.length > 0"
					   :row-height="48"
					   :margin="[15, 15]"
					   :is-static="false"
					   :auto-size="true">

		<template v-for="(item, index) in widget.widgetList" #[item.id] :key="index">
			<smart-widget 
                :simple="!item.options.showHeader"
				:title="item.options.title"
				:refresh="item.options.showRefresh"
				:fullscreen="item.options.showFullscreen"       
                :isActived="designer.selectedWidget?.id == item.id"
                @on-refresh="onRefresh(item)"

            >
                          
				<div class="container-com">
					<template v-if="'container' === item.category">
						<component :is="item.type + '-widget'" :widget="item" :designer="designer"
								   :key="item.id" :parent-list="widget.widgetList"
								   :index-of-parent-list="index" :parent-widget="widget"></component>
					</template>
					<template v-else>
						<component :is="item.type + '-widget'" :field="item" :designer="designer"
								   :key="item.id" :parent-list="widget.widgetList"
								   :index-of-parent-list="index" :parent-widget="widget"
								   :design-state="true"></component>
					</template>
				</div>
			</smart-widget>
		</template>

	</smart-widget-grid>
</template>

<script>
export default {
	name: "dashboard-container-widget",
	props: {
		widget: Object,
		parentWidget: Object,
		parentList: Array,
		indexOfParentList: Number,
		designer: Object,
	},
	data() {
		return {
			defaultSlotName: '0',
		}
	},
	computed: {
		gridLayout() {
			if (this.widget.widgetList.length <= 0) {
				return [{ x: 0, y: 0, w: 4, h: 4, i: '0' }]
			} else {
				return this.widget.options.layout
			}
		},

		// slotName() {
		// 	return (item) => {
		// 		return item.id
		// 	}
		// },

	},
    methods:{
        onRefresh(item){
            item.options.isRefresh = !item.options.isRefresh;
        }
    },

}
</script>

<style scoped lang="scss">
.container-com {
    width: 100%;
    height: 100%;
}
</style>
