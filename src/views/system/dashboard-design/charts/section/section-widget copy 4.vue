<template>
    <smart-widget title="区块">
        <!-- :list="widget.widgetList"
            item-key="id"
            v-bind="{group:'dragGroup', ghostClass: 'ghost',animation: 400}"
            tag="transition-group"
            :component-data="{name: 'fade'}"
            handle=".drag-handler"
            @end="(evt) => onDragEnd(evt, widget.widgetList)"
            @add="(evt) => onDragAdd(evt, widget.widgetList)"
            @update="onDragUpdate"
        :move="checkContainerMove"-->
        <!-- <VueDraggableNext
            :list="widget.widgetList"
            v-bind="{group:'dragGroup', ghostClass: 'ghost',animation: 400}"
            tag="transition-group"
            @add="(evt) => onDragAdd(evt, widget.widgetList)"
        >
            {{ dataList.length }}
            <smart-widget-grid :layout="layout" :row-height="48" :margin="[15, 15]">
                <template v-for="(item, index) in dataList" :key="item.id" #[index]>
                    <smart-widget :title="item.cont">
                        <div class="layout-center">{{ item.cont }}</div>
                    </smart-widget>
                </template>
            </smart-widget-grid>
        </VueDraggableNext>-->
        <draggable
            :list="widget.widgetList"
            item-key="id"
            v-bind="{group:'dragGroup', ghostClass: 'ghost',animation: 400}"
            tag="transition-group"
            @add="(evt) => onDragAdd(evt, widget.widgetList)"
        >
            <template #item>
                <div class="form-widget-list">
                    {{ dataList.length }}
                    <smart-widget-grid :layout="layout" :row-height="48" :margin="[15, 15]">
                        <template v-for="(item, index) in dataList" :key="item.id" #[index]>
                            <smart-widget :title="item.cont">
                                <div class="layout-center">{{ item.cont }}</div>
                            </smart-widget>
                        </template>
                    </smart-widget-grid>
                </div>
            </template>
        </draggable>
    </smart-widget>
</template>
  
<script>
import { VueDraggableNext } from "vue-draggable-next";
export default {
    name: "section-widget",
    components: {
        VueDraggableNext,
    },
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
            // if()
            subList.forEach((el) => {
                // 检测ID不存在的时候添加
                if (!this.dataIds.includes(el.id)) {
                    let inx = this.layout.length;
                    this.layout.push({ x: 0, y: 0, w: 4, h: 3, i: inx });
                    this.dataList.push({ id: inx, cont: el.id });
                    this.dataIds.push(el.id);
                }
            });
            //重复代码，可合并
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
  