<template>
  <vue-draggable-resizable
          :w="widget.options.w"
          :h="widget.options.h"
          :x="widget.options.x"
          :y="widget.options.y"
          :parent="false"
          :debug="true"
          :min-width="100"
          :min-height="20"
          :isConflictCheck="true"
          :snap="true"
          :snapTolerance="1"
          @dragstop="onDragCallback"
          @resizestop="onResizeCallback"
          @refLineParams="emitRefLineParams"
          class="section">

    <draggable :list="widget.widgetList" item-key="id" v-bind="{group:'dragGroup', ghostClass: 'ghost',animation: 400}"
               tag="transition-group" :component-data="{name: 'fade'}"
               handle=".drag-handler" @end="(evt) => onDragEnd(evt, widget.widgetList)"
               @add="(evt) => onDragAdd(evt, widget.widgetList)"
               @update="onDragUpdate" :move="checkContainerMove">
      <template #item="{ element: subWidget, index: swIdx }">
        <div class="form-widget-list">
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
    </draggable>

  </vue-draggable-resizable>
</template>

<script>
  //import VueDraggableResizable from "vue-draggable-resizable-gorkys/src/components/vue-draggable-resizable.vue"
  //import "vue-draggable-resizable-gorkys/src/components/vue-draggable-resizable.css"
  import VueDraggableResizable from "@/components/vdr/components/vue-draggable-resizable.vue"
  import "@/components/vdr/components/vue-draggable-resizable.css"

  export default {
    name: "section-widget",
    components: {
      VueDraggableResizable
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
    methods: {
      emitRefLineParams(params) {
        //console.error('aaaaa')
        this.$emit('refLineParams', params)
      },

      checkContainerMove(evt) {
        return this.designer.checkWidgetMove(evt)
      },

      onDragEnd(obj, subList) {
        //
      },

      onDragAdd(evt, subList) { //重复代码，可合并
        debugger
        const newIndex = evt.newIndex
        if (!!subList[newIndex]) {
          this.designer.setSelected( subList[newIndex] )
        }

        this.designer.emitHistoryChange()
        this.designer.emitEvent('field-selected', this.widget)
      },

      onDragUpdate() {
        this.designer.emitHistoryChange()
      },

      onDragCallback(x, y) {
        this.widget.options.x = x
        this.widget.options.y = y
        console.error('x, y', x + ', ' + y)
        this.designer.emitHistoryChange()
      },

      onResizeCallback(x, y, width, height) {
        this.widget.options.x = x
        this.widget.options.y = y
        this.widget.options.w = width
        this.widget.options.h = height
        console.error('w, h', width + ', ' + height)
        this.designer.emitHistoryChange()
      }

    }
  }
</script>

<style scoped>
  .section {
    //background-color: #ECF5FF;
    //background-color: #F1F2F3;
    //background-color: rgba(241, 242, 243, 0.2);
    //background-color: rgba(236, 245, 255, 0.2);
    box-shadow: rgba(17, 17, 26, 0.05) 0 1px 0, rgba(17, 17, 26, 0.1) 0 0 8px;

    &:hover {
       box-shadow: rgba(17, 17, 26, 0.1) 0 0 16px;
    }
  }
</style>
