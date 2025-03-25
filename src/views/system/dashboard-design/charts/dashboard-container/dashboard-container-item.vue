<!-- 首页仪表盘渲染页面 -->
<template>
    <smart-widget-grid
        :layout="gridLayout"
        v-if="widget.widgetList.length > 0"
        :row-height="48"
        :margin="[15, 15]"
        :is-static="true"
        :auto-size="true"
    >
        <template v-for="(item, index) in widget.widgetList" #[item.id] :key="index">
            <smart-widget
                :simple="!item.options.showHeader"
                :title="item.options.label"
                :refresh="item.options.showRefresh"
                :collapse="item.options.showCollapse"
                :fullscreen="item.options.showFullscreen"
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
                            :is="item.type + '-item'"
                            :widget="item"
                            :key="item.id"
                            :parent-list="widget.widgetList"
                            :index-of-parent-list="index"
                            :parent-widget="widget"
                            :detail-ref="detailRef"
                            ref="containerRef"
                        ></component>
                    </template>
                    <template v-else>
                        <component
                            :is="item.type + '-widget'"
                            :field="item"
                            :key="item.id"
                            :parent-list="widget.widgetList"
                            :index-of-parent-list="index"
                            :parent-widget="widget"
                            :design-state="true"
                            :detail-ref="detailRef"
                            ref="containerRef"
                        ></component>
                    </template>
                </div>
            </smart-widget>
        </template>
    </smart-widget-grid>
    <mlCustomDetail ref="detailRef" />
</template>

<script>
import mlCustomDetail from "@/components/mlCustomDetail/index.vue";
export default {
    name: "dashboard-container-item",
    components: {
        mlCustomDetail,
    },
    props: {
        widget: Object,
        parentWidget: Object,
        parentList: Array,
        indexOfParentList: Number,
    },
    data() {
        return {
            detailRef: null,
        };
    },
    mounted() {
        // console.log(this.widget, 'widget')
        this.detailRef = this.$refs.detailRef;
    },
    computed: {
        gridLayout() {
            if (this.widget.widgetList.length <= 0) {
                return [{ x: 0, y: 0, w: 4, h: 4, i: "0" }];
            } else {
                return this.widget.options.layout;
            }
        },
    },
    methods: {
        onRefresh(item) {
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
    },
};
</script>

<style scoped lang="scss">
.container-com {
    width: 100%;
    height: 100%;
}
</style>
