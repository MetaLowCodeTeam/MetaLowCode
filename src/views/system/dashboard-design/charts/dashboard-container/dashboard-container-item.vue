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
                <div class="container-com">
                    <template v-if="'container' === item.category">
                        <component
                            :is="item.type + '-item'"
                            :widget="item"
                            :key="item.id"
                            :parent-list="widget.widgetList"
                            :index-of-parent-list="index"
                            :parent-widget="widget"
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
                        ></component>
                    </template>
                </div>
            </smart-widget>
        </template>
    </smart-widget-grid>
</template>

<script>
export default {
    name: "dashboard-container-item",
    props: {
        widget: Object,
        parentWidget: Object,
        parentList: Array,
        indexOfParentList: Number,
    },
    data() {
        return {};
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
    },
};
</script>

<style scoped lang="scss">
.container-com {
    width: 100%;
    height: 100%;
}
</style>
