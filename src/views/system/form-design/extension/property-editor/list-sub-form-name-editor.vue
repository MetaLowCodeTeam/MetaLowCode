<template>
  <el-form-item prop="name" :rules="nameRequiredRule">
    <template #label>
      <span>{{i18nt('designer.setting.uniqueName')}}
        <el-tooltip effect="light" :content="i18nt('designer.setting.editNameHelp')">
          <!-- <svg-icon icon-class="el-info" /> -->
          <el-icon><InfoFilled /></el-icon>
        </el-tooltip>
      </span>
    </template>
    <template v-if="noSubFormList">
      <el-input type="text" v-model="optionModel.name" :readonly="widgetNameReadonly" @change="updateWidgetNameAndRef"></el-input>
    </template>
    <template v-else>
      <el-select v-model="optionModel.name" allow-create filterable :disabled="widgetNameReadonly" @change="updateWidgetNameAndRef"
                 :title="i18nt('designer.setting.editNameHelp')">
        <el-option v-for="(sf, sfIdx) in serverSubFormList" :key="sfIdx" :label="sf.label" :value="sf.name"></el-option>
      </el-select>
    </template>
  </el-form-item>
</template>

<script>
  import VisualDesign from "@/../lib/visual-design/designer.umd.js";
  const { i18n, Utils } = VisualDesign.VFormSDK;
  const { isEmptyStr } = Utils;

  export default {
    name: "list-sub-form-name-editor",
    mixins: [i18n],
    props: {
      designer: Object,
      selectedWidget: Object,
      optionModel: Object,
    },
    inject: ['getServerSubFormList', 'getDesignerConfig'],
    data() {
      return {
        nameRequiredRule: [{required: true, message: 'name required'}],
      }
    },
    computed: {
      serverSubFormList() {
        return this.getServerSubFormList()
      },

      noSubFormList() {
        return !this.serverSubFormList || (this.serverSubFormList.length <= 0)
      },

      widgetNameReadonly() {
        return !!this.getDesignerConfig().widgetNameReadonly
      },

    },
    methods: {
      updateWidgetNameAndRef(newName) {
        let oldName = this.designer.selectedWidgetName
        if (isEmptyStr(newName)) {
          this.selectedWidget.options.name = oldName
          this.$message.info(this.i18nt('designer.hint.nameRequired'))
          return
        }

        if (!!this.designer.formWidget) {
          const widgetId = this.designer.selectedId
          let foundRef = this.designer.formWidget.getWidgetRefById(widgetId, newName) // 检查newName是否已存在！！
          if (!!foundRef) {
            this.selectedWidget.options.name = oldName
            this.$message.info(this.i18nt('designer.hint.duplicateName') + newName)
            return
          }

          let widgetInDesign = this.designer.formWidget.getWidgetRefById(widgetId, oldName)
          if (!!widgetInDesign && !!widgetInDesign.registerToRefList) {
            widgetInDesign.registerToRefList(oldName)  //注册组件新的ref名称并删除老的ref！！
            let newLabel = this.getLabelByFieldName(newName)
            this.designer.updateSelectedWidgetNameAndLabel(this.selectedWidget, newName, newLabel)

            //强制刷新为重新生成子表单组件
            this.designer.formWidget.getSelectedWidgetRef().forceUpdate()
          }
        }
      },

      getLabelByFieldName(fieldName) {
        for (let i = 0; i < this.serverSubFormList.length; i++) {
          if (this.serverSubFormList[i].name === fieldName) {
            return this.serverSubFormList[i].label
          }
        }

        return null
      },

    }
  }
</script>

<style lang="scss" scoped>

</style>
