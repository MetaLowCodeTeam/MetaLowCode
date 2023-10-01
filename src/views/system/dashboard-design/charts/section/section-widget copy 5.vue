<template>
    <smart-widget title="区块">
        <!-- <draggable
            v-bind="{group:'dragGroup', ghostClass: 'ghost',animation: 400}"
            tag="transition-group"
            :list="widget.widgetList"
        >{{ dataList.length }}</draggable>-->
        <draggable
            :list="widget.widgetList"
            v-bind="{group:'dragGroup', ghostClass: 'ghost',animation: 400}"
        >
            <template #item="{ element: subWidget, index: swIdx }">
                <div>{{subWidget.id}}--【{{ swIdx }}】</div>
            </template>
            <div>123</div>
        </draggable>

        <!-- <draggable
            :list="widget.widgetList"
            item-key="id"
            v-bind="{group:'dragGroup', ghostClass: 'ghost',animation: 400}"
            tag="transition-group"
            :component-data="{name: 'fade'}"
            handle=".drag-handler"
            @end="(evt) => onDragEnd(evt, widget.widgetList)"
            @add="(evt) => onDragAdd(evt, widget.widgetList)"
            @update="onDragUpdate"
            :move="checkContainerMove"
        >
            <template #item="{ element: subWidget, index: swIdx }">
                <div class="form-widget-list">
                    {{ dataList.length }}
                    <template v-if="'container' === subWidget.category">
                        <component :is="subWidget.type + '-widget'" :widget="subWidget" :designer="designer" :key="subWidget.id" :parent-list="widget.widgetList"
                        :index-of-parent-list="swIdx" :parent-widget="widget"></component>
                    </template>
                    <template v-else>
                        <component :is="subWidget.type + '-widget'" :field="subWidget" :designer="designer" :key="subWidget.id" :parent-list="widget.widgetList"
                        :index-of-parent-list="swIdx" :parent-widget="widget" :design-state="true"></component>
                    </template>
                </div>
            </template>
        </draggable>-->
    </smart-widget>
</template>
  
  <script>
export default {
    name: "section-widget",
    components: {},
    props: {
        widget: Object,
        parentWidget: Object,
        parentList: Array,

        rowIndex: Number,
        colIndex: Number,
        rowLength: Number,
        colLength: Number,
        colArray: Array,
        rowArray: Array,

        designer: Object,
    },
    data() {
        // { x: 0, y: 0, w: 4, h: 3, i: "0" },
        // { x: 4, y: 0, w: 4, h: 3, i: "1" },
        // { x: 8, y: 0, w: 4, h: 3, i: "2" },
        // { x: 0, y: 3, w: 4, h: 3, i: "3" },
        // { x: 4, y: 3, w: 4, h: 3, i: "4" },
        // { x: 8, y: 3, w: 4, h: 3, i: "5" },
        // { x: 0, y: 6, w: 8, h: 6, i: "6" },
        // { x: 8, y: 6, w: 4, h: 6, i: "7" },
        // { x: 0, y: 12, w: 6, h: 5, i: "8" },
        // { x: 6, y: 12, w: 6, h: 5, i: "9" },

        return {
            layout: [],
            dataList: [],
            dataIds: [],
        };
    },
    methods: {
        checkContainerMove(evt) {
            return this.designer.checkWidgetMove(evt);
        },

        onDragEnd(obj, subList) {
            //
        },

        onDragAdd(evt, subList) {
            //重复代码，可合并
            debugger;
            const newIndex = evt.newIndex;
            if (!!subList[newIndex]) {
                this.designer.setSelected(subList[newIndex]);
            }

            this.designer.emitHistoryChange();
            this.designer.emitEvent("field-selected", this.widget);
        },

        onDragUpdate() {
            this.designer.emitHistoryChange();
        },

        onDragCallback(x, y) {
            this.widget.options.x = x;
            this.widget.options.y = y;
            console.error("x, y", x + ", " + y);
            this.designer.emitHistoryChange();
        },

        onResizeCallback(x, y, width, height) {
            this.widget.options.x = x;
            this.widget.options.y = y;
            this.widget.options.w = width;
            this.widget.options.h = height;
            console.error("w, h", width + ", " + height);
            this.designer.emitHistoryChange();
        },
    },
};
</script>
  
  <style scoped>
.section {
    box-shadow: rgba(17, 17, 26, 0.05) 0 1px 0, rgba(17, 17, 26, 0.1) 0 0 8px;

    &:hover {
        box-shadow: rgba(17, 17, 26, 0.1) 0 0 16px;
    }
}
</style>
  