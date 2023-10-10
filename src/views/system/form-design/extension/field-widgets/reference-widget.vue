<template>
  <div>
    <form-item-wrapper :designer="designer" :field="field" :rules="rules" :design-state="designState"
                       :parent-widget="parentWidget" :parent-list="parentList" :index-of-parent-list="indexOfParentList"
                       :sub-form-row-index="subFormRowIndex" :sub-form-col-index="subFormColIndex"
                       :sub-form-row-id="subFormRowId">
      <el-input ref="fieldEditor" v-model="displayValue" v-show="!isReadMode"
                :disabled="field.options.disabled" readonly
                :size="field.options.size" class="hide-spin-button"
                :type="'text'"
                :placeholder="field.options.placeholder"
                :prefix-icon="field.options.prefixIcon" :suffix-icon="field.options.suffixIcon">
        <template #suffix>
          <el-icon title="清除" v-if="!!displayValue && !isReadMode"
                   class="el-input__icon" @click="handleClearEvent"><Close /></el-icon>
        </template>
        <template #append>
          <el-button :disabled="field.options.disabled"
                     @click="onAppendButtonClick">
            <el-icon>
              <component :is="field.options.buttonIcon"/>
            </el-icon>
          </el-button>
        </template>
      </el-input>
      <template v-if="isReadMode">
        <span class="readonly-mode-field">{{contentForReadMode}}</span>
      </template>
    </form-item-wrapper>
    <el-dialog title="请选择" v-model="showReferenceDialogFlag" :show-close="true" class="small-padding-dialog"
               :width="'520px'" draggable
               :close-on-click-modal="false" :close-on-press-escape="false" :append-to-body="true">
      <ReferenceSearchTable ref="referST" :entity="entity" :refField="curRefField"
                            @recordSelected="setReferRecord"></ReferenceSearchTable>
    </el-dialog>
  </div>
</template>

<script>
import VisualDesign from '@/../lib/visual-design/designer.umd.js'
import ReferenceSearchTable from '@/components/mlReferenceSearch/reference-search-table.vue'

const {FormItemWrapper, emitter, i18n, fieldMixin} = VisualDesign.VFormSDK

export default {
  name: "reference-widget",
  componentName: 'FieldWidget',  //必须固定为FieldWidget，用于接收父级组件的broadcast事件
  mixins: [emitter, fieldMixin, i18n],
  props: {
    field: Object,
    parentWidget: Object,
    parentList: Array,
    indexOfParentList: Number,
    designer: Object,

    designState: {
      type: Boolean,
      default: false
    },

    subFormRowIndex: { /* 子表单组件行索引，从0开始计数 */
      type: Number,
      default: -1
    },
    subFormColIndex: { /* 子表单组件列索引，从0开始计数 */
      type: Number,
      default: -1
    },
    subFormRowId: { /* 子表单组件行Id，唯一id且不可变 */
      type: String,
      default: ''
    },

  },
  components: {
    FormItemWrapper,
    ReferenceSearchTable
  },
  data() {
    return {
      oldFieldValue: null, //field组件change之前的值
      fieldModel: null,
      displayValue: '',
      rules: [],

      showReferenceDialogFlag: false,
      entity: null,
      curRefField: null,
    }
  },
  computed: {
    inputType() {
      if (this.field.options.type === 'number') {
        return 'text'  //当input的type设置为number时，如果输入非数字字符，则v-model拿到的值为空字符串，无法实现输入校验！故屏蔽之！！
      }

      return this.field.options.type
    },

    contentForReadMode() {
      return this.fieldModel ? this.fieldModel.name : '--'
    }
  },
  watch: {
    fieldModel: {
      deep: true,
      immediate: true,
      handler(val) {
        //console.error(val)
        this.displayValue = !!val ? val.name : ''
      }
    },

  },
  beforeCreate() {
    /* 这里不能访问方法和属性！！ */
  },

  created() {
    const gDsv = this.getGlobalDsv()
    this.entity = this.$route.query.entity || this.$route.meta.entityName || gDsv['formEntity']

    /* 注意：子组件mounted在父组件created之后、父组件mounted之前触发，故子组件mounted需要用到的prop
       需要在父组件created中初始化！！ */
    this.registerToRefList()
    this.initFieldModel()
    this.initEventHandler()
    this.buildFieldRules()

    this.handleOnCreated()
  },

  mounted() {
    this.handleOnMounted()
  },

  beforeUnmount() {
    this.unregisterFromRefList()
  },

  methods: {
    onAppendButtonClick() {
      this.curRefField = this.field.options.name
      this.showReferenceDialogFlag = true
    },

    handleClearEvent() {
      this.fieldModel = {}
      this.handleChangeEvent(this.fieldModel)
    },

    setReferRecord(recordObj) {
      this.fieldModel = {
        id: recordObj.id,
        name: recordObj.label
      }
      this.handleChangeEvent(this.fieldModel)

      this.showReferenceDialogFlag = false
    },

  }
}
</script>

<style lang="scss" scoped>

</style>

<style lang="scss">
.small-padding-dialog .el-dialog__body {
  padding: 0 10px 10px 10px !important;
}

</style>
