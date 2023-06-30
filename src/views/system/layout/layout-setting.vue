<template>
  <div class="layout-setting">
    <div class="layout-setting-header">属性设置</div>

    <div class="layout-setting-form bg-light-gray" v-if="(!!layout.activeTab)">
      <el-form label-position="top" size="mini">
        <el-form-item label="字段标签位置：">
          <el-radio-group v-model="layout.labelPosition">
            <el-radio-button label="left">左边</el-radio-button>
            <el-radio-button label="top">顶部</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="字段标签对齐：">
          <el-radio-group v-model="layout.labelAlign">
            <el-radio-button label="label-left-align">左对齐</el-radio-button>
            <el-radio-button label="label-center-align">居中对齐</el-radio-button>
            <el-radio-button label="label-right-align">右对齐</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="字段标签统一宽度(单位：像素)：">
          <el-input-number type="number" v-model="layout.labelWidth" @change="formLabelWidthChanged"
                           :min="0" :step="1"></el-input-number>
        </el-form-item>
        <el-form-item label="统一行间距(单位：像素)：">
          <el-input-number type="number" v-model="layout.lineSpacing" :min="0" :step="1">
          </el-input-number>
        </el-form-item>
        <el-form-item v-if="(layout.formTabs.length === 1)" label="仅有一个页签时是否隐藏页签标题：">
          <el-radio-group v-model="layout.hideOnlyTabTitle">
            <el-radio :label="true">是</el-radio>
            <el-radio :label="false">否</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="当前页签标题：">
          <el-input type="text" v-model="layout.activeTab.title"></el-input>
        </el-form-item>
      </el-form>
    </div>

    <div class="layout-setting-form" v-if="(!!layout.activeSection)">
      <hr class="splitter">
      <el-form label-position="top" size="mini">
        <el-form-item label="当前区块标题：">
          <el-input type="text" v-model="layout.activeSection.title"></el-input>
        </el-form-item>
        <el-form-item label="是否显示区块标题区：">
          <el-radio-group v-model="layout.activeSection.showSectionTitle">
            <el-radio :label="true" @change="handleTitleShowStatus">是</el-radio>
            <el-radio :label="false" @change="handleTitleShowStatus">否</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="是否显示箭头图标：">
          <el-radio-group v-model="layout.activeSection.showArrowIcon">
            <el-radio :label="true">是</el-radio>
            <el-radio :label="false">否</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="是否显示分割线：">
          <el-radio-group v-model="layout.activeSection.showSplitter">
            <el-radio :label="true">是</el-radio>
            <el-radio :label="false">否</el-radio>
          </el-radio-group>
        </el-form-item>
        <!--
        <el-form-item label="区块是否默认收起：">
          <el-radio-group v-model="layout.activeSection.openSplitter">
            <el-radio :label="true">是</el-radio>
            <el-radio :label="false">否</el-radio>
          </el-radio-group>
        </el-form-item>
        -->
      </el-form>
    </div>

    <div class="layout-setting-form" v-if="(!!layout.activeRow)">
      <hr class="splitter">
      <el-form label-position="top" size="mini">
        <el-form-item label="列间隔(单位：像素)：">
          <el-input-number type="number" v-model.number="layout.activeRow.gutter" class="cell-gutter-input"></el-input-number>
        </el-form-item>
        <el-form-item label="列栅格设置：">
          <li v-for="(cellItem, cellIdx) in layout.activeRow.cells" :key="cellIdx" class="cell-span">
            <i style="font-size: 16px"><i class="iconfont icon-icon_bars"></i></i>
            <el-input-number placeholder="栅格宽度值" v-model.number="cellItem.span" :min="1" :max="24"
                      @change="(newValue, oldValue) => spanChanged(layout.activeRow, cellItem, cellIdx, newValue, oldValue)"
                             :ref="'inputNumberComps'" class="cell-span-input"></el-input-number>
            <el-button circle plain size="mini" type="danger" @click="deleteCell(layout.activeRow, cellIdx)"
                       icon="el-icon-minus" class="cell-delete-button"></el-button>
          </li>
          <div>
            <el-button type="text" @click="addNewCell(layout.activeRow)">添加列</el-button>
          </div>
        </el-form-item>
      </el-form>
    </div>

    <div class="layout-setting-form" v-if="(!!layout.activeFieldWrapper)">
      <hr class="splitter">
      <el-form label-position="top" size="mini">
        <el-form-item label="当前标签宽度(单位：像素)：">
          <el-input-number type="number" v-model.number="layout.activeFieldLabelWidth" @change="labelWidthChanged"
                           :min="0" :step="1"></el-input-number>
        </el-form-item>
        <!--
        <el-form-item label="标签对齐方式：">
          <el-button-group>
            <el-button>左对齐</el-button>
            <el-button>居中对齐</el-button>
            <el-button>右对齐</el-button>
          </el-button-group>
        </el-form-item>
        -->
        <!--
        <el-form-item label="字段占位内容：">
          <el-input type="text" class="field-placeholder-input"></el-input>
        </el-form-item>
        -->
      </el-form>
    </div>

  </div>
</template>

<script>
import { generateId } from '@/utils/util'

export default {
  props: ['layout'],
  name: 'LayoutSetting',
  data () {
    return {
    }
  },

  watch: {
  },

  methods: {
    toggleLabelAlign(align) {
      this.layout.labelAlign = align
    },

    spanChanged (currentRow, cell, cellIdx, newValue, oldValue) {
      //console.log(cellIdx)
      //console.log(this.$refs.inputNumberComps)
      let spanSum = 0
      currentRow.cells.forEach((cellItem, idx) => {
        spanSum += cellItem.span
      })
      if (spanSum > 24) {
        // this.$set(cell, 'span', oldValue)
        // this.$forceUpdate()
        const curInputComp = this.$refs.inputNumberComps[cellIdx]
        if (curInputComp) {
          console.log(oldValue)
          // curInputComp.setCurrentValue(oldValue)
          // curInputComp.decrease()
        }
        this.$alert('列栅格之和不能超出24！', '错误提示').catch(() => {})
      }
    },

    deleteCell(currentRow, cellIdx) {
      if (!!currentRow && !!(currentRow.cells)) {
        currentRow.cells.splice(cellIdx, 1)
      }
    },

    addNewCell (currentRow) {
      const cells = currentRow.cells
      if ((!!cells) && (cells.length > 0)) {
        let spanSum = 0
        cells.forEach((cell, idx) => {
          spanSum += cell.span
        })

        if (spanSum >= 24) {
          this.$message.info('列栅格之和不能超出24')
        } else {
          const newSpan = (24 - spanSum) > 6 ? 6 : (24 - spanSum)
          currentRow.cells.push({ id: 'cell' + generateId(), span: newSpan, fields: [] })
        }
      } else {
        currentRow.cells = [{ id: 'cell' + generateId(), span: 6, fields: [] }]
      }
    },

    labelWidthChanged (currentValue, oldValue) {
      if (!!this.layout.activeFieldWrapper) {
        // this.layout.activeFieldWrapper.labelWidth = currentValue
        if (currentValue !== this.layout.labelWidth) {
          this.$set(this.layout.activeFieldWrapper, 'labelWidth', currentValue)
        } else {
          this.$set(this.layout.activeFieldWrapper, 'labelWidth', null)
        }
      }
    },

    formLabelWidthChanged(currentValue, oldValue) {
      this.$forceUpdate(); /* 强制刷新，立即更新表单所有字段标签宽度！！ */
    },

    handleTitleShowStatus(value) {
      if (value === false) {
        this.layout.activeSection.showArrowIcon = false
        this.layout.activeSection.showSplitter = false
      }
    },

  }
}
</script>

<style lang="scss" scoped>

  .layout-setting {
    font-size: 12px;

    .layout-setting-header {
      font-size: 14px;
      text-align: center;
      height: 54px;
      line-height: 54px;
      border-bottom: 1px dashed #eeeeee;
    }

    .layout-setting-form {
      padding: 10px;
      font-size: 12px;

      .el-form-item {
        border-bottom: 1px solid #e1e1e1;
        padding-bottom: 5px;
        margin-bottom: 5px;

        :deep(.el-form-item__label) {
          padding-bottom: 3px;
        }
      }

      :deep(.el-form-item), :deep(.el-form-item__label) {
        font-size: 12px;
      }

      .cell-gutter-input {
        width: 150px;
      }

      li.cell-span {
        list-style: none;

        .cell-span-input {
          width: 150px;
        }

        .cell-delete-button {
          margin-left: 6px;
        }
      }

      .field-placeholder-input {
        width: 218px;
      }
    }

    .el-input {
      font-size: 12px;
    }
  }

  hr.splitter {
    border-top-width: 0;
    border-bottom: 3px dotted #cac6c6;
  }

  .bg-light-gray {
    background-color: #F5F5F5;
  }

</style>
