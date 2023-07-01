<template>
  <el-container>
    <el-aside width="250px">
      <div class="fields-list">
        <div class="fields-list-header">&lt;{{labelOfEntity}}&gt;实体字段列表</div>

        <div>
          <el-dropdown @command="handleNewFieldCommand" class="add-field-dropdown" size="mini">
          <span class="el-dropdown-link">
            <i class="el-icon-plus"></i>&nbsp;添加字段<i class="el-icon-arrow-down el-icon--right"></i>
          </span>
            <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="BooleanWE">布尔</el-dropdown-item>
              <el-dropdown-item command="IntegerWE">整数</el-dropdown-item>
              <el-dropdown-item command="DecimalWE">精度小数</el-dropdown-item>
              <el-dropdown-item command="PercentWE">百分比</el-dropdown-item>
              <el-dropdown-item command="MoneyWE">金额</el-dropdown-item>
              <el-dropdown-item command="TextWE" divided>文本</el-dropdown-item>
              <!--
              <el-dropdown-item command="EmailWE">邮箱</el-dropdown-item>
              <el-dropdown-item command="UrlWE">网址</el-dropdown-item>
              -->
              <el-dropdown-item command="TextAreaWE">长文本</el-dropdown-item>
              <!--
              <el-dropdown-item command="PasswordWE">密码</el-dropdown-item>
              -->
              <el-dropdown-item command="OptionWE" divided>单选项</el-dropdown-item>
              <el-dropdown-item command="TagWE">多选项</el-dropdown-item>
              <el-dropdown-item command="DateWE" divided>日期</el-dropdown-item>
              <el-dropdown-item command="DateTimeWE">日期/时间</el-dropdown-item>
              <el-dropdown-item command="PictureWE" divided>图片</el-dropdown-item>
              <el-dropdown-item command="FileWE">文件</el-dropdown-item>
              <el-dropdown-item command="ReferenceWE" divided>一对一引用</el-dropdown-item>
              <!--
              <el-dropdown-item command="AnyReferenceWE">一对多引用</el-dropdown-item>
              <el-dropdown-item command="ReferenceListWE">多对多引用</el-dropdown-item>
              -->
            </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>

        <draggable :list="slotItems" :group="{name: 'fieldsGroup', pull:'clone'}" :sort="false"
                   :move="checkFieldMove" @start="startDragSlot" @end="endDragSlot" class="slots-drag-area">
          <div class="field-drag-item">拖动添加插槽<i class="el-icon-top-right primary-color"></i></div>
        </draggable>

        <draggable :list="customItems" :group="{name: 'fieldsGroup', pull:'clone'}" :sort="false"
                   :move="checkFieldMove" @start="startDragCustom" @end="endDragCustom" class="slots-drag-area">
          <div class="field-drag-item">拖动添加自定义组件<i class="el-icon-top-right primary-color"></i></div>
        </draggable>

        <draggable :list="fieldItems" :group="{name: 'fieldsGroup', pull:'clone'}" :filter="'.unDraggable'" :sort="false"
                   :move="checkFieldMove" @start="startDrag" @end="endDrag" class="fields-drag-area">
          <div v-for="(fieldItem, fieldIdx) in fieldItems" :key="fieldItem.name"
               :class="{'unDraggable': !!fieldItem.unDraggable || (fieldItem.type === 'PrimaryKey')
                || isUnDraggable(fieldItem.name)}"
               @mouseenter="hoverFieldIdx = fieldIdx" @mouseleave="hoverFieldIdx = -1"
               class="field-drag-item">{{fieldItem.label}}({{fieldItem.name}})
            <i v-show="hoverFieldIdx === fieldIdx" @click="editFieldProps(fieldItem)"
               class="el-icon-edit edit-field-action">编辑</i>
          </div>
        </draggable>

      </div>

    </el-aside>

    <el-container class="layout-container">
      <el-header class="toolbar-panel">
        <div class="header-toolbar">
          <div class="header-toolbar-left">
            <el-button-group>
              <el-button icon="el-icon-folder" size="small" @click="addTab('')">增加页签</el-button>
              <el-button icon="el-icon-circle-plus-outline" size="small" @click="addSection">插入区块</el-button>
              <!--
              <el-button icon="el-icon-s-grid" size="small">插入明细表单</el-button>
              -->
            </el-button-group>
          </div>

          <div class="header-toolbar-right">
            <el-button icon="el-icon-view" size="small" @click="previewLayoutForm">预览</el-button>
            <el-popover placement="bottom" title="提示" width="200" trigger="manual" visible-arrow="true"
                        content="表单已修改，请尽快保存。" v-model="savePopoverVisible">
              <template #reference>
                <el-button type="primary" icon="el-icon-finished" size="small"
                           @click="saveLayout" style="margin-left: 10px">保存</el-button>
              </template>
            </el-popover>
          </div>
        </div>
      </el-header>
      <el-main class="layout-main">
        <LayoutWidget :layout="layout" @fieldWrapperDelete="deleteFieldWrapper"></LayoutWidget>
      </el-main>
    </el-container>

    <el-dialog title="预览表单" v-model="showPreviewDialogFlag" v-if="showPreviewDialogFlag" :show-close="true"
               :close-on-click-modal="true" :close-on-press-escape="true" :destroy-on-close="true">
      <FormWidget :entity="entity" :layout="layout" :field-props-map="fieldPropsMap" :form-state="0"></FormWidget>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="showPreviewDialogFlag = false">关 闭</el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog :title="'新建字段 / ' + curEditorType" v-model="showNewFieldDialogFlag" v-if="showNewFieldDialogFlag" :show-close="true"
               :close-on-click-modal="false" :close-on-press-escape="false" class="no-padding" width="620px">
      <component :is="curFWEditor" :entity="entity" @fieldSaved="onFieldSaved" @cancelSave="onCancelSave"
                 :showingInDialog="true"></component>
    </el-dialog>

    <el-dialog :title="'编辑字段 / ' + curEditorType" v-model="showEditFieldDialogFlag" v-if="showEditFieldDialogFlag"
               :show-close="true" :append-to-body="true" :destroy-on-close="true" :close-on-click-modal="false"
               :close-on-press-escape="false" class="no-padding" width="620px">
      <component :is="curFWEditor" :entity="entity" @fieldSaved="onFieldSaved(true)" @cancelSave="onCancelSave"
                 :showingInDialog="true" :field-name="editingFieldName" :field-state="2"></component>
    </el-dialog>

    <el-dialog title="插槽属性设置" v-model="showSlotFieldDialogFlag" v-if="showSlotFieldDialogFlag" :show-close="true"
               :close-on-click-modal="false" :close-on-press-escape="false" class="small-padding" width="620px">
      <el-form :model="slotModel" :rules="slotRules" ref="slotPropsForm" label-position="left"
               label-width="180px" size="mini">
        <el-form-item label="插槽名称" prop="name"> <!-- prop必须跟v-model名称一致！！ -->
          <el-input v-focus v-model="slotModel.name" minlength="2"></el-input>
        </el-form-item>
        <el-form-item label="绑定数据字段(可多选)" prop="fields">
          <el-select multiple filterable default-first-option :popper-append-to-body="false"
                     v-model="slotModel.fields" style="width: 100%">
            <el-option
                    v-for="(fldItem, fiIdx) in fieldItems"
                    :key="fiIdx"
                    :label="fldItem.label"
                    :value="fldItem.name">
            </el-option>
          </el-select>
        </el-form-item>
        <div class="data-bind-hint"><i class="el-icon-bell"></i>提示：如需绑定表单数据，请至少选择一个数据字段！</div>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="saveSlotProps" style="width: 120px">确 定</el-button>
          <el-button @click="cancelSaveSlotProps">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog title="自定义组件属性设置" v-model="showCustomFieldDialogFlag" v-if="showCustomFieldDialogFlag" :show-close="true"
               :close-on-click-modal="false" :close-on-press-escape="false" class="small-padding" width="620px">
      <el-form :model="customModel" :rules="customRules" ref="customPropsForm" label-position="left"
               label-width="180px" size="mini">
        <el-form-item label="组件标签" prop="label"> <!-- prop必须跟v-model名称一致！！ -->
          <el-input v-focus v-model="customModel.label"></el-input>
        </el-form-item>
        <el-form-item label="组件类型" prop="componentName">
          <el-select filterable default-first-option :popper-append-to-body="false"
                     v-model="customModel.componentName" style="width: 100%">
            <el-option
                    v-for="(ccItem, ccIdx) in customComponents"
                    :key="ccIdx"
                    :label="ccItem.label"
                    :value="ccItem.name">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="组件提示" v-if="!!customModel.componentName && !!getDescriptionOfComponent(customModel.componentName)">
          <el-alert type="success" :closable="false"
                    :title="getDescriptionOfComponent(customModel.componentName)"></el-alert>
        </el-form-item>
        <el-form-item label="绑定数据字段(可多选)" prop="fields">
          <el-select multiple filterable default-first-option :popper-append-to-body="false"
                     v-model="customModel.fields" style="width: 100%">
            <el-option
                    v-for="(fldItem, fiIdx) in fieldItems"
                    :key="fiIdx"
                    :label="fldItem.label"
                    :value="fldItem.name">
            </el-option>
          </el-select>
        </el-form-item>
        <div class="data-bind-hint"><i class="el-icon-bell"></i>提示：如需绑定表单数据，请至少选择一个数据字段！</div>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="saveCustomProps" style="width: 120px">确 定</el-button>
          <el-button @click="cancelSaveCustomProps">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <el-aside>
      <LayoutSetting :layout="layout"></LayoutSetting>
    </el-aside>
  </el-container>

</template>

<script>
import draggable from 'vuedraggable'

import FormWidget from '@/views/system/field-widget/form-widget'
import { createLayoutObj } from './layout/form-layout-object.js'
import { getFieldSet, createFormLayout, updateFormLayout, getFormLayout, previewLayout } from '@/api/system-manager'
import LayoutWidget from './layout/layout-widget'
import LayoutSetting from './layout/layout-setting'
import {copyNew, generateId} from "@/utils/util"
import {allComponentNames, getComponentDescription} from "@/components/custom";
import {ElCollapse, ElCollapseItem} from "element-plus";

export default {
  name: 'FormLayout',
  components: { draggable,
    'LayoutSection': ElCollapse,
    'LayoutSectionItem': ElCollapseItem,
    LayoutWidget, LayoutSetting, FormWidget,
    BooleanWE: () => import('@/views/system/field-editor/boolean-widget-editor'),
    IntegerWE: () => import('@/views/system/field-editor/integer-widget-editor'),
    DecimalWE: () => import('@/views/system/field-editor/decimal-widget-editor'),
    PercentWE: () => import('@/views/system/field-editor/percent-widget-editor'),
    MoneyWE: () => import('@/views/system/field-editor/money-widget-editor'),

    TextWE: () => import('@/views/system/field-editor/text-widget-editor'),
    EmailWE: () => import('@/views/system/field-editor/email-widget-editor'),
    UrlWE: () => import('@/views/system/field-editor/url-widget-editor'),
    TextAreaWE: () => import('@/views/system/field-editor/textarea-widget-editor'),
    PasswordWE: () => import('@/views/system/field-editor/password-widget-editor'),

    OptionWE: () => import('@/views/system/field-editor/option-widget-editor'),
    TagWE: () => import('@/views/system/field-editor/tag-widget-editor'),

    DateWE: () => import('@/views/system/field-editor/date-widget-editor'),
    DateTimeWE: () => import('@/views/system/field-editor/datetime-widget-editor'),

    PictureWE: () => import('@/views/system/field-editor/picture-widget-editor'),
    FileWE: () => import('@/views/system/field-editor/file-widget-editor'),

    ReferenceWE: () => import('@/views/system/field-editor/reference-widget-editor'),
    AnyReferenceWE: () => import('@/views/system/field-editor/anyreference-widget-editor'),
    ReferenceListWE: () => import('@/views/system/field-editor/referencelist-widget-editor'),
  },
  props: ['entity', 'entityLabel'],
  data () {
    return {
      fieldItems: [],
      layout: this.buildLayoutObj(),
      fieldMovableFlag: true,
      allLayoutFields: [],
      layoutId: null,
      fieldPropsMap: null,
      showPreviewDialogFlag: false,
      showNewFieldDialogFlag: false,
      curEditorType: '',
      curFWEditor: 'TagWE',
      savePopoverVisible: false,

      hoverFieldIdx: -1,
      editingFieldName: null,
      showEditFieldDialogFlag: false,

      curDragToCell: null,
      slotItems: [
        {
          label: '插槽--',
          name: '',
          fields: [],
          type: 'Slot'
        }
      ],
      showSlotFieldDialogFlag: false,
      slotModel: {
        name: '',
        fields: [],
      },

      showCustomFieldDialogFlag: false,
      customItems: [
        {
          label: '自定义组件--',
          name: '',
          componentName: '',
          fields: [],
          type: 'Custom'
        }
      ],
      customModel: {
        label: '',
        componentName: '',
        fields: [],
      },
      // customComponents: [ /* 此处应该改成动态加载 */
      //   {
      //     label: '富文本编辑器',
      //     name: 'RichTextEditor'
      //   },
      //   {
      //     label: '地区级联选择',
      //     name: 'AreaCascadeSelect'
      //   },
      // ],
      customComponents: allComponentNames(),

      slotRules: {
        name: [
          {required: true, message: '请输入插槽名称', trigger: 'blur'},
          {pattern: /^[A-Z]+[A-Za-z\d_-]*$/, message: '请以英文大写字母开头，不可包含中文，中间可输入字母、下划线或横杠', trigger: 'blur'},
          {min: 2, max: 30, message: '请输入至少两个字符', trigger: 'blur'},
        ],
        /*
        fields: [
          {required: true, message: '请至少选择一个字段', trigger: 'blur', type: 'array'},
        ],
        */
      },

      customRules: {
        label: [
          {required: true, message: '请输入组件标签', trigger: 'blur'},
          {pattern: /^[A-Za-z\d\u4e00-\u9fa5]+[_-]*/, message: '请以中文、英文字母、数字开头，中间可输入下划线或横杠',
            trigger: 'blur'},
          {min: 2, max: 30, message: '请输入至少两个字符', trigger: 'blur'},
        ],
        componentName: [
          {required: true, message: '请选择组件类型', trigger: 'blur'},
        ],
        /*
        fields: [
          {required: true, message: '请至少选择一个字段', trigger: 'blur', type: 'array'},
        ],
        */
      },

    }
  },
  computed: {
    labelOfEntity() {
      if (this.entityLabel) {
        sessionStorage.setItem('entityLabel', this.entityLabel)
        return this.entityLabel
      } else {
        return sessionStorage.getItem('entityLabel')
      }
    },
  },
  created() {
  },
  mounted() {
    //this.initFormLayout(() => {
    //  this.getEntityFields(true, true) /* refreshLayoutFlag传入true，设置布局已删除字段标志 */
    //})

    this.getEntityFields(false, () => {
      this.initFormLayout(true)
    })
  },
  methods: {
    buildLayoutObj() {
      let eventHub = new Vue()
      let layoutObj = createLayoutObj(eventHub)
      eventHub.$on('actEvent', (elementName) => {
        if (!!layoutObj.eventHubHandler) {
          layoutObj.eventHubHandler(elementName)
        }
      })
      eventHub.$on('layoutChangedEvent', (data) => {
        this.onLayoutChanged()
      })
      return layoutObj
    },

    onLayoutChanged() {
      this.savePopoverVisible = true
      setTimeout(() => {this.savePopoverVisible = false}, 2000)
      this.allLayoutFields = this.layout.getAllLayoutFields()
    },

    saveLayout() {
      //console.log( JSON.stringify(this.layout.formTabs) )
      //console.log( JSON.stringify(this.layout) )

      if (!this.layoutId) {
        createFormLayout(this.entity, this.layout.getSavableLayout()).then(res => {
          if (res.error != null) {
            this.$message({message: res.error, type: 'error'})
            return
          }

          this.layoutId = res.data
          this.$message.success('保存成功')
        }).catch(res => {
          this.$message({message: res.message, type: 'error'})
        })
      } else {
        updateFormLayout(this.layoutId, this.layout.getSavableLayout()).then(res => {
          if (res.error != null) {
            this.$message({message: res.error, type: 'error'})
            //return
          } else {
            this.$message.success('保存成功')
          }
        }).catch(res => {
          this.$message({message: res.message, type: 'error'})
        })
      }
    },

    initFormLayout(updateFieldWrapperFlag ) {
      getFormLayout(this.entity).then(res => {
        if (res.error != null) {
          this.$message({ message: res.error, type: 'error' })
          return
        }

        if ((!!res.data) && (!!res.data.layoutJson)) {
          this.layout.setLayoutPropsFromServer(res)
          if (!!updateFieldWrapperFlag) {
            this.updateLayoutDeletedFieldsAndFieldLabels()
          }

          this.layoutId = res.data.formLayoutId
          this.allLayoutFields = this.layout.getAllLayoutFields()
        } else {
          this.addTab('页签1', true)
        }
      }).catch(res => {
        this.$message({ message: res.message, type: 'error' })
      })
    },

    updateLayoutDeletedFieldsAndFieldLabels() {
      let layoutFieldWrappers = this.layout.getAllLayoutFieldWrappers()
      if (!!layoutFieldWrappers && Array.isArray(layoutFieldWrappers)) {
        layoutFieldWrappers.forEach(fw => {
          let foundFieldObj = this.findFieldObject(fw.name)
          if (!foundFieldObj) {
            fw.deleted = true /* 设置已删除字段标志 */
          } else {
            fw.label = foundFieldObj.label /* 更新字段label */
          }
        })
      }
    },

    getEntityFields(refreshLayoutFlag, callback) {
      if (!!this.entity) {
        let entityName = this.entity
        getFieldSet(entityName).then(res => {
          if (res.error != null) {
            this.$message({ message: res.error, type: 'error' })
            return
          }

          this.fieldItems = res.data
          if (refreshLayoutFlag) {
            this.syncLayoutFieldWrappers()
          }

          if (!!callback) {
            callback()
          }
        }).catch(res => {
          this.$message({ message: res.message, type: 'error' })
        })
      }
    },

    syncLayoutFieldWrappers() {
      //TODO: 需要优化性能，避免循环所有布局字段！！
      let layoutModifiedFlag = false
      let allFieldWrappers = this.layout.getAllLayoutFieldWrappers()
      if (!!allFieldWrappers && Array.isArray(allFieldWrappers)) {
        allFieldWrappers.forEach(fw => {
          let foundFieldObj = this.findFieldObject(fw.name)
          if (!foundFieldObj) {
            fw.deleted = true /* 设置已删除字段标志 */
            layoutModifiedFlag = true
          } else if (fw.label !== foundFieldObj.label) {
            fw.label = foundFieldObj.label
            layoutModifiedFlag = true
          }
        })
      }

      if (!!layoutModifiedFlag) {
        this.layout.emitLayoutChangeEvent()
      }
    },

    findFieldObject(fieldName) {
      let fieldObj = null
      this.fieldItems.some(fi => {
        if (fi.name === fieldName) {
          fieldObj = fi
          return true
        }
      })

      return fieldObj
    },

    addTab(newTabTitle, skipSaveTip) {
      this.layout.addTab(newTabTitle, skipSaveTip)
    },

    addSection() {
      this.layout.addSection()
    },

    checkFieldMove(event) {
      if (event.to) {
        this.fieldMovableFlag = !event.to.querySelector('div.unDraggable')
        return this.fieldMovableFlag
      }

      return false
    },

    startDrag(event) {
      this.fieldMovableFlag = true
    },

    endDrag(event) {
      if (event.to.className === 'drop-down-area') {
        this.$set(this.fieldItems[event.oldIndex], 'unDraggable', true)
      }

      if (!this.fieldMovableFlag) {
        this.$message.info('该单元格已有字段，不可再次拖放')
        return
      }

      this.layout.emitLayoutChangeEvent()
    },

    startDragSlot(event) {
      this.fieldMovableFlag = true
    },

    endDragSlot(event) {
      if (!this.fieldMovableFlag) {
        this.$message.info('该单元格已有字段，不可再次拖放')
        return
      }

      if (!!event.to) {
        let toDom = event.to
        let dataTabIndex = toDom.getAttribute('data-tab-index')
        let dataSectionIndex = toDom.getAttribute('data-section-index')
        // let dataRowIndex = toDom.getAttribute('data-row-index')
        let dataRowIndex = toDom.dataset.rowIndex
        let dataCellIndex = toDom.getAttribute('data-cell-index')

        let toCell = this.layout.getDragToCell(dataTabIndex, dataSectionIndex, dataRowIndex, dataCellIndex)
        if (!!toCell) {
          //console.log(toCell)
          this.curDragToCell = toCell
          this.slotModel.name = ''
          this.slotModel.fields.length = 0
          this.showSlotFieldDialogFlag = true
        }
      }
    },

    saveSlotProps() {
      let validResult = true
      this.$refs['slotPropsForm'].validate((success) => {
        if (!success) {
          validResult = false
          return false
        }
      })
      if (!validResult) {
        return
      }

      // 检查插槽名称是否重复
      if (!this.layout.checkSlotNameExist(this.slotModel.name)) {
        this.$message.error('插槽名称已存在，请修改')
        return
      }

      let slotField = this.curDragToCell.fields[0];
      slotField.label = '插槽' + this.slotModel.name
      slotField.name = this.slotModel.name
      slotField.fields = copyNew(this.slotModel.fields)
      this.$message.success('插槽已设置')
      this.showSlotFieldDialogFlag = false
      this.layout.emitLayoutChangeEvent()
    },

    cancelSaveSlotProps() {
      //删除当前插槽
      this.layout.deleteSlotWrapperWithoutConfirm(this.curDragToCell)
      this.showSlotFieldDialogFlag = false
    },

    startDragCustom(event) {
      this.fieldMovableFlag = true
    },

    endDragCustom(event) {
      if (!this.fieldMovableFlag) {
        this.$message.info('该单元格已有字段，不可再次拖放')
        return
      }

      if (!!event.to) {
        let toDom = event.to
        let dataTabIndex = toDom.getAttribute('data-tab-index')
        let dataSectionIndex = toDom.getAttribute('data-section-index')
        // let dataRowIndex = toDom.getAttribute('data-row-index')
        let dataRowIndex = toDom.dataset.rowIndex
        let dataCellIndex = toDom.getAttribute('data-cell-index')

        let toCell = this.layout.getDragToCell(dataTabIndex, dataSectionIndex, dataRowIndex, dataCellIndex)
        if (!!toCell) {
          //console.log(toCell)
          this.curDragToCell = toCell
          this.customModel.label = ''
          this.customModel.componentName = ''
          this.customModel.fields.length = 0
          this.showCustomFieldDialogFlag = true
        }
      }
    },

    saveCustomProps() {
      let validResult = true
      this.$refs['customPropsForm'].validate((success) => {
        if (!success) {
          validResult = false
          return false
        }
      })
      if (!validResult) {
        return
      }


      let customField = this.curDragToCell.fields[0];
      customField.name = 'Custom' + generateId()
      //customField.label = '自定义组件' // + this.customModel.componentName + ']'
      customField.label = !!this.customModel.label ? this.customModel.label : '自定义组件'
      customField.componentName = this.customModel.componentName
      customField.fields = copyNew(this.customModel.fields)
      this.$message.success('自定义组件已设置')
      this.showCustomFieldDialogFlag = false
      this.layout.emitLayoutChangeEvent()
    },

    cancelSaveCustomProps() {
      //删除当前自定义组件
      this.layout.deleteSlotWrapperWithoutConfirm(this.curDragToCell)
      this.showCustomFieldDialogFlag = false
    },

    deleteFieldWrapper (cellItem, fieldWrapper) {
      let fieldName = fieldWrapper.name
      let findIndex = this.fieldItems.findIndex((item) => {
        return item.name === fieldName
      })
      if (findIndex > -1) {
        this.$set(this.fieldItems[findIndex], 'unDraggable', false)
        let lfIndex = this.allLayoutFields.findIndex( (lf) => {
          return lf === fieldName
        })
        if (lfIndex > -1) {
          this.allLayoutFields.splice(lfIndex, 1)
        }
      }
    },

    isUnDraggable(fieldName) {
      return this.allLayoutFields.some(lf => {
        return lf === fieldName
      })
    },

    handleNewFieldCommand(command) {
      this.curFWEditor = command
      this.curEditorType = command.replace(/WE$/, '')
      this.showNewFieldDialogFlag = true
    },

    previewLayoutForm() {
      console.log( this.fieldPropsMap )
      previewLayout(this.entity).then(res => {
        if (res.error != null) {
          this.$message({ message: res.error, type: 'error' })
          return
        }

        if ((!!res.data) && (!!res.data.fieldPropsMap)) {
          this.fieldPropsMap = res.data.fieldPropsMap
          console.log( this.fieldPropsMap )
        }
        this.showPreviewDialogFlag = true
      }).catch(res => {
        this.$message({ message: res.message, type: 'error' })
      })
    },

    onFieldSaved(refreshLayoutFlag) {
      this.getEntityFields(refreshLayoutFlag)
      this.showNewFieldDialogFlag = false
      this.showEditFieldDialogFlag = false
    },

    onCancelSave() {
      this.showNewFieldDialogFlag = false
      this.showEditFieldDialogFlag = false
    },

    editFieldProps(field) {
      if (!!field.reserved) {
        this.$message.info('系统字段不可编辑')
        return
      }

      this.curEditorType = field.type
      this.curFWEditor = field.type + 'WE'
      this.editingFieldName = field.name
      this.showEditFieldDialogFlag = true
    },

    getDescriptionOfComponent(componentName) {
      return getComponentDescription(componentName)
    },

  }
}
</script>

<style lang="scss" scoped>
  @import "../../style/form-layout/form-layout.scss";
</style>
