<template>
  <el-form size="mini" :label-position="layout.labelPosition">
  <el-tabs type="card" ref="formTabs" closable @tab-click="onTabClick" :value="layout.activeTabName"
           @tab-remove="removeTab">

    <el-tab-pane v-for="(tabItem, tabIdx) in layout.formTabs" :key="tabItem.id" :name="tabItem.name" :label="tabItem.title">

      <layout-section accordion v-for="(sectionItem, sectionIdx) in tabItem.sections" :key="sectionItem.id" :value="['001']"
                      @headerClick="clickOnSectionHeader(sectionItem, tabItem)"
                      :class="{'selected': (!!layout.activeSection) && (sectionItem.id === layout.activeSection.id)}">

        <layout-section-item :title="sectionItem.title" :disabled="false" name="001">

          <el-row v-for="(rowItem, rowIdx) in sectionItem.rows " :key="rowItem.id" :gutter="rowItem.gutter"
                  @click.stop="clickOnRow(rowItem, sectionItem)"
                  :class="{'selected': (!!layout.activeRow) && (rowItem.id === layout.activeRow.id), 'not-label-top': layout.labelPosition === 'left'}"
                  :style="{'margin-bottom': !!layout.lineSpacing ? layout.lineSpacing + 'px' : '16px'}"
                  class="form-row" style="">

            <el-col class="grid-cell" v-for="(cellItem, cellIdx) in rowItem.cells" :key="cellItem.id" :span="cellItem.span">
              <draggable :list="cellItem.fields" :group="{name: dragGroupName}" :filter="'.unDraggable'"
                         :data-tab-index="tabIdx" :data-section-index="sectionIdx" :data-row-index="rowIdx" :data-cell-index="cellIdx"
                         @start="disableDrag" @end="enableDrag" @add="(event) => onFieldAdd(cellItem, event)" class="drop-down-area">
                <div class="field-wrapper bg-purple unDraggable" @click.stop="clickOnFieldWrapper(cellItem.fields[0])"
                     v-if="(!!cellItem.fields) && (cellItem.fields.length > 0)"
                     :class="{'selected': (!!layout.activeFieldWrapper) && (!!cellItem.fields[0]) && (layout.activeFieldWrapper.name === cellItem.fields[0].name)}">

                  <!-- 为解决cellItem对象层级过深Vue不能自动更新的问题，改用activeFieldLabelWidth变量！！ -->
                  <el-form-item :label="cellItem.fields[0].label"
                                v-if="(!!layout.activeFieldWrapper) && (!!cellItem.fields[0]) && (layout.activeFieldWrapper.name === cellItem.fields[0].name)"
                                :class="layout.labelAlign"
                                :label-width="layout.activeFieldLabelWidth + 'px'">
                    <el-input v-if="cellItem.fields[0].deleted === true" style="width: 100%"
                              :placeholder="cellItem.fields[0].name + '字段已删除!!'"></el-input>
                    <el-input v-else style="width: 100%" :placeholder="getPlaceHolder(cellItem.fields[0])"></el-input>
                  </el-form-item>
                  <el-form-item :label="cellItem.fields[0].label" v-else
                                :class="layout.labelAlign"
                                :label-width="((!!cellItem.fields[0].labelWidth) ? cellItem.fields[0].labelWidth : (!!layout.labelWidth ? layout.labelWidth : 75)) + 'px'">
                    <el-input v-if="cellItem.fields[0].deleted === true" style="width: 100%"
                              :placeholder="cellItem.fields[0].name + '字段已删除!!'"></el-input>
                    <el-input v-else style="width: 100%" :placeholder="getPlaceHolder(cellItem.fields[0])"></el-input>
                  </el-form-item>

                  <div class="field-select-action field-action"
                       v-if="(!!layout.activeFieldWrapper) && (!!cellItem.fields[0]) && (layout.activeFieldWrapper.name === cellItem.fields[0].name)">
                    <i class="el-icon-delete icon-drag" title="删除" @click.stop="deleteFieldWrapper(cellItem, cellItem.fields[0])"></i>
                  </div>
                </div>
              </draggable>
            </el-col>

            <div class="row-select-action row-action"
                 v-if="(!!layout.activeRow) && (rowItem.id === layout.activeRow.id)">
              <i class="el-icon-top" title="上移" @click.stop="upRow(rowItem, sectionItem)"></i>
              <i class="el-icon-bottom icon-drag" title="下移" @click.stop="downRow(rowItem, sectionItem)"></i>
              <i class="el-icon-plus icon-drag" title="插入新行" @click.stop="addNewRow(rowItem, sectionItem)"></i>
              <i class="el-icon-delete icon-drag" title="删除" @click.stop="deleteRow(rowItem, sectionItem)"></i>
            </div>
          </el-row>

        </layout-section-item>

        <div class="section-select-action section-action"
             v-if="(!!layout.activeSection) && (sectionItem.id === layout.activeSection.id)">
          <i class="el-icon-top" title="上移" @click.stop="upSection(sectionItem, tabItem)"></i>
          <i class="el-icon-bottom icon-drag" @click.stop="downSection(sectionItem, tabItem)" title="下移"></i>
          <i class="el-icon-delete icon-drag" @click.stop="deleteSection(sectionItem, tabItem)" title="删除"></i>
        </div>

      </layout-section>

    </el-tab-pane>

  </el-tabs>
  </el-form>
</template>

<script>

import draggable from 'vuedraggable'
import {strArrayToStr} from "@/utils/util";
import {ElCollapse, ElCollapseItem} from "element-plus";

export default {
  props: ['layout'],
  name: 'LayoutWidget',
  components: {
    'LayoutSection': ElCollapse,
    'LayoutSectionItem': ElCollapseItem,
    draggable
  },
  data () {
    return {
      dragGroupName: 'fieldsGroup'
    }
  },
  methods: {
    onTabClick(tab) {
      this.layout.activateTab(tab)
      // console.log( this.$refs.formTabs.currentName )
    },

    removeTab(targetName) {
      this.layout.removeTab(targetName)
    },

    clickOnSectionHeader(sectionItem, parentTabItem) {
      this.layout.activateSection(sectionItem, parentTabItem)
    },

    upSection(sectionItem, parentTabItem) {
      this.layout.upSection(sectionItem, parentTabItem)
      // this.$set(this.layout, layoutObj) /* 为什么这行代码只有第一次执行有效？？故改用$forceUpdate方法 */
      // this.$forceUpdate() /* v-for嵌套过多时，可能需要调用$forceUpdate方法强制刷新 */
      /* 通过修改section的id属性，可以保持响应式刷新，并且效率最高，故不再需要以上两种强制刷新方法！！ */
    },

    downSection(sectionItem, parentTabItem) {
      this.layout.downSection(sectionItem, parentTabItem)
    },

    deleteSection(sectionItem, parentTabItem) {
      this.layout.deleteSection(sectionItem, parentTabItem)
    },

    clickOnRow(rowItem, parentSectionItem) {
      this.layout.activateRow(rowItem, parentSectionItem)
    },

    upRow(rowItem, parentSectionItem) {
      this.layout.upRow(rowItem, parentSectionItem)
    },

    downRow(rowItem, parentSectionItem) {
      this.layout.downRow(rowItem, parentSectionItem)
    },

    addNewRow(rowItem, parentSectionItem) {
      this.layout.insertNewRow(rowItem, parentSectionItem)
    },

    deleteRow(rowItem, parentSectionItem) {
      this.layout.deleteRow(rowItem, parentSectionItem)
    },

    clickOnFieldWrapper(fieldWrapper) {
      this.layout.activateFieldWrapper(fieldWrapper)
    },

    clickOnCell() {
      console.log('click on cell')
    },

    deleteFieldWrapper(cellItem, fieldWrapper) {
      // let fieldName = fieldWrapper.name
      this.layout.deleteFieldWrapper(cellItem, fieldWrapper, () => {
        this.$emit('fieldWrapperDelete', cellItem, fieldWrapper)
      })
    },

    disableDrag(){
      this.dragGroupName = 'disabledDrag'
    },

    enableDrag(){
      this.dragGroupName = 'fieldsGroup'
    },

    onFieldAdd(cellItem) {
      // console.log(event.clone)
      // console.log(cellItem)
      // console.log(event)
      if ((!!cellItem.fields) && (cellItem.fields.length > 0)) {
        /* 取消单个字段标签75px宽度的设置，集成layout的统一标签宽度属性labelWidth！！ */
        // cellItem.fields[0].labelWidth = 75
      }
    },

    getPlaceHolder(fieldWrapper) {
      let placeholder = ''
      if (fieldWrapper.type === 'Slot') {
        placeholder = '[' + strArrayToStr(fieldWrapper.fields, ',') + ']'
      } else if (fieldWrapper.type === 'Custom') {
        placeholder = fieldWrapper.componentName + '[' + strArrayToStr(fieldWrapper.fields, ',') + ']'
      } else {
        placeholder = '[' + fieldWrapper.name + ']'
      }

      //console.log(placeholder)
      return placeholder
    },

  }
}
</script>

<style lang="scss" scoped>

  :deep(.el-tabs__nav-scroll) {
    padding-left: 15px;
  }
  :deep(.el-tabs__header) {
    margin-bottom: 6px;
  }

  :deep(.el-tabs__item) {
    font-size: 13px;
  }

  :deep(.el-tabs__content) {
    padding: 2px 5px 0 5px;
  }

  :deep(.el-collapse) {
    border-width: 0;
    margin-bottom: 3px;
    position: relative;
  }

  :deep(.el-collapse.selected) {
    outline: 2px solid $--color-primary;

    .section-select-action {
      position: absolute;
      top: 0;
      right: 0;
      /* bottom: 2px; */
      height: 28px;
      line-height: 28px;
      background: $--color-primary;
      z-index: 9;

      i{
        font-size: 14px;
        color: #fff;
        margin: 0 5px;
        cursor: pointer;
      }
    }
  }

  :deep(.el-collapse-item:last-child) {
    margin-bottom: 2px;
  }

  :deep(.el-collapse-item__header), :deep(.el-collapse-item__header.is-active) {
    cursor: default;
    height: 36px;
    line-height: 36px;
    font-size: 11px;
    font-style: italic;
    border-bottom: 1px solid #eeeeee;
    padding-left: 6px;
  }

  :deep(.hide .el-collapse-item__header, .hide .el-collapse-item__header.is-active) {
    cursor: default;
    display: none;
    height: 0;
    line-height: 0;
    border-bottom: 0;
  }

  :deep(.el-collapse-item__arrow) {
    cursor: pointer;
  }

  :deep(.el-collapse-item__content) {
    padding-top: 6px;
    padding-bottom: 4px;

    .el-row.form-row {
      padding: 2px;
      border: 1px dotted rgba(170, 170, 170, 0.75);
      margin-top: 2px !important;
      margin-right: 2px !important;
      margin-left: 2px !important;
    }

    .el-row.not-label-top {
      height: 36px;  /* 添加此行，解决IE单元格垂直居中问题！！ */
    }

    .el-row.selected {
      outline: 2px solid $--color-primary;

      .row-select-action{
        position: absolute;
        top: 0;
        right: 0;
        /* bottom: 0; */
        height: 28px;
        line-height: 28px;
        background: $--color-primary;
        z-index: 9;

        i{
          font-size: 14px;
          color: #fff;
          margin: 0 5px;
          cursor: pointer;
        }
      }
    }
  }

  .grid-cell:not(:last-of-type) {
    min-height: 30px;
    border-right: 1px dotted #cccccc;
  }

  .drop-down-area {
    min-height: 30px;
  }

  .field-wrapper {
    font-size: 12px;
    border-radius: 4px;
    min-height: 28px;
    line-height: 28px;
    padding-left: 5px;
    position: relative;

    :deep(.el-form-item), :deep(.el-form-item__label) {
      font-size: 12px;
      overflow: hidden;
      /* text-overflow: ellipsis; */
      white-space: nowrap;
    }

    :deep(.label-left-align .el-form-item__label) {
      text-align: left;
    }

    :deep(.label-center-align .el-form-item__label) {
      text-align: center;
    }

    :deep(.label-right-align .el-form-item__label) {
      text-align: right;
    }
  }

  .field-wrapper.selected {
    outline: 2px solid $--color-primary;

    .field-select-action{
      position: absolute;
      top: 0;
      right: 0;
      /* bottom: 0; */
      height: 22px;
      line-height: 22px;
      background: $--color-primary;
      z-index: 9;

      i{
        font-size: 14px;
        color: #fff;
        margin: 0 5px;
        cursor: pointer;
      }
    }
  }

</style>
