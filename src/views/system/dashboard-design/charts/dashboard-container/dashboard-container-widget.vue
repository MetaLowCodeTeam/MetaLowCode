<!-- 设计页面 -->
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
				:title="item.options.label"
				:refresh="item.options.showRefresh"
				:fullscreen="item.options.showFullscreen"
                :isActived="designer.selectedWidget?.id == item.id"
                @on-refresh="onRefresh(item)"

            >
                <template #toolbar v-if="item.options.topBarBtnConfig?.show">
                    <div style="border-left: 1px solid rgba(0,0,0,.09);height: 24px;margin-right: 10px;">
                    </div>
                    <el-button 
                        :type="item.options.topBarBtnConfig?.type" 
                        :size="item.options.topBarBtnConfig?.size"
                        :icon="item.options.topBarBtnConfig?.icon"
                        @click.stop="onCustomBtnClick(item)"
                        class="mr-5"
                    >
                        {{ item.options.topBarBtnConfig?.text }}
                    </el-button>
                </template>
				<div class="container-com">
					<template v-if="'container' === item.category">
						<component 
                            :is="item.type + '-widget'" 
                            :widget="item" 
                            :designer="designer"
							:key="item.id" 
                            :parent-list="widget.widgetList"
							:index-of-parent-list="index" 
                            :parent-widget="widget"
                            ref="containerRef"
                        ></component>
					</template>
					<template v-else>
						<component 
                            :is="item.type + '-widget'" 
                            :field="item" 
                            :designer="designer"
                            :key="item.id" 
                            :parent-list="widget.widgetList"
                            :index-of-parent-list="index" 
                            :parent-widget="widget"
                            :design-state="true"
                            ref="containerRef"
                        ></component>
					</template>
                    <span v-if="designer.selectedWidget?.id == item.id" class="del-span" @click="removeSelectedChart(index, item.id)">
                        <el-icon size="20"><ElIconDelete /></el-icon>
                    </span>
				</div>
			</smart-widget>
		</template>

	</smart-widget-grid>
</template>

<script>
import VisualDesign from '@/../lib/visual-design/designer.umd.js'
const { Utils } = VisualDesign.VFormSDK

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

	},
    methods:{
        onRefresh(item){
            item.options.isRefresh = !item.options.isRefresh;
        },
        onCustomBtnClick(item){
            if(item.options.onCustomBtnClick){
                let customFn = new Function(
                    "chart",
                    "data",
                    item.options.onCustomBtnClick
                );
                customFn.call(this, item, this.$refs.containerRef?.getData());
            }
        },

		/**
		 * 删除选中的图表组件或者区块容器
		 */
		removeSelectedChart(chartIndex, chartId) {
            let delInx;
            this.widget.options.layout.forEach((el,inx) => {
                if(el.i == chartId){
                    delInx = inx;
                }
            })
            this.widget.options.layout.splice(delInx,1);
            const chartList = this.widget.widgetList
			if (chartList.length > 0) {
				const widgetRefName = this.designer.selectedWidgetName
				const childrenRefNames = []
				const fwHandler = (fw) => {
					childrenRefNames.push( fw.options.name )
				}
				const cwHandler = (cw) => {
					childrenRefNames.push( cw.options.name )
				}
				Utils.traverseWidgetsOfContainer(this.designer.selectedWidget, fwHandler, cwHandler)

				let nextSelected = null
				if (chartList.length === 1) {
                    //
				} else if (chartList.length === (1 + chartIndex)) {
					nextSelected = chartList[chartIndex - 1]
				} else {
					nextSelected = chartList[chartIndex + 1]
				}

				this.$nextTick(() => {
					chartList.splice(chartIndex, 1)
					this.designer.setSelected(nextSelected)

					this.designer.formWidget?.deleteWidgetRef(widgetRefName)  //删除组件ref！！！
					this.designer.formWidget?.deletedChildrenRef(childrenRefNames)  //删除容器组件的所有内嵌组件ref！！！
					this.designer.emitHistoryChange()
				})
			}
		}

    },

}
</script>

<style scoped lang="scss">
.container-com {
    width: 100%;
    height: 100%;
    position: relative;
    .del-span {
        position: absolute;
        right: -11px;
        bottom: -2px;
        color: #909399;
        cursor: pointer;
        &:hover {
            color: #606266;
        }
    }
}
</style>
