<template>
  <el-container class="field-props-container">
    <el-header class="field-props-header" v-if="!showingInDialog">[一对一引用]字段属性设置</el-header>
    <el-main class="field-props-pane">
      <el-form ref="editorForm" :model="fieldProps" :rules="rules" label-position="left"
               label-width="220px" size="small" @submit.prevent>
        <el-form-item label="字段名称" prop="name">
          <el-input v-model="fieldProps.name" :readonly="fieldState !== 1"></el-input>
        </el-form-item>
        <el-form-item label="显示名称" prop="label">
          <el-input v-model="fieldProps.label"></el-input>
        </el-form-item>
        <el-form-item label="引用实体">
          <el-input v-model="refEntityAndFields" readonly>
            <template #append v-if="(fieldState === 1) || (fieldState === 2)">
              <el-button v-if="!!fieldProps.referenceSetting" icon="el-icon-close" title="清除" @click="clearReferTo"></el-button>
              <el-button icon="el-icon-search" title="选择" @click="showRefEntitySettingDialog"></el-button>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="搜索弹窗宽度（单位：像素）：">
          <el-input-number type="number"
                           v-model.number="fieldProps.fieldViewModel.searchDialogWidth"
                           style="width: 100%">
          </el-input-number>
        </el-form-item>
        <el-form-item label="字段校验函数(可多选)" prop="fieldViewModel.validators">
          <el-select multiple allow-create filterable default-first-option :popper-append-to-body="false"
                     v-model="fieldProps.fieldViewModel.validators" style="width: 100%">
            <el-option
                    v-for="(vt, vtIdx) in validators"
                    :key="vtIdx"
                    :label="vt.label"
                    :value="vt.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="是否在列表中默认显示">
          <el-radio-group v-model="fieldProps.defaultMemberOfListFlag" style="float: right">
            <el-radio :label="true">是</el-radio>
            <el-radio :label="false">否</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="是否允许空值">
          <el-radio-group v-model="fieldProps.nullable" style="float: right">
            <el-radio :label="true">是</el-radio>
            <el-radio :label="false">否</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="新建记录时允许修改字段">
          <el-radio-group v-model="fieldProps.creatable" style="float: right">
            <el-radio :label="true">是</el-radio>
            <el-radio :label="false">否</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="更新记录时允许修改字段">
          <el-radio-group v-model="fieldProps.updatable" style="float: right">
            <el-radio :label="true">是</el-radio>
            <el-radio :label="false">否</el-radio>
          </el-radio-group>
        </el-form-item>
        <hr style="border: 0;border-top: 1px dotted #cccccc" />
        <el-form-item>
          <el-button type="primary" size="medium" style="width: 120px" @click="saveField">保存字段</el-button>
          <el-button size="medium" v-if="!!showingInDialog" @click="cancelSave">取消</el-button>
        </el-form-item>
      </el-form>
    </el-main>

    <el-dialog title="引用实体设置" class="refer-entity-dialog" v-model="showRefEntityDialogFlag"
               v-if="showRefEntityDialogFlag" :append-to-body="true" width="560px">
      <el-container>
        <el-header>
          <el-input size="small" placeholder="请选择引用实体" v-model="refEntityFullName" :readonly="true">
            <template #append>
              <el-button v-if="fieldState === 1" icon="el-icon-search" title="选择"
                         @click="showEntityListDialog"></el-button>
            </template>
          </el-input>
        </el-header>
        <el-main>
          <div>
            <div style="margin-bottom: 6px">选择实体搜索列表字段：</div>
<!--            <hr style="border: 0;border-top: 1px solid rgb(220, 223, 230)" />-->
            <el-card shadow="never">
              <div style="font-style: italic" v-if="fieldItems.length <= 0">暂无字段可选</div>
              <el-checkbox v-for="(fieldItem, idx) in fieldItems" :key="idx" :checked="isSelectedField(fieldItem)"
                           @change="(value) => setRefEntityListField(fieldItem, value)">
                {{fieldItem.label}}({{fieldItem.name}})</el-checkbox>
            </el-card>
          </div>
          <div>
            <div style="margin: 20px 0 6px">已选择的显示字段：</div>
            <el-card shadow="never">
              <div style="font-style: italic" v-if="selectedFieldItems.length <= 0">未选择显示字段</div>
              <div v-for="(selectedField, selectedIdx) in selectedFieldItems" :key="selectedIdx">
                {{selectedField.label}}({{selectedField.name}})
              </div>
            </el-card>
          </div>
        </el-main>
      </el-container>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showRefEntityDialogFlag = false">取 消</el-button>
          <el-button type="primary" @click="setRefEntity">确 定</el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog ref="entityListDlg" title="选择引用实体" v-model="showEntityListDialogFlag" v-if="showEntityListDialogFlag"
               :append-to-body="true" :destroy-on-close="true" class="entity-list-dialog" width="560px">
      <SimpleTable :show-pagination="false" :show-check-box="false" :table-size="'mini'" :columns="columns" :data="tableData"
                   :max-height="420">
        <template #table_operation="scope">
          <el-table-column align="center" label="" width="150" :resizable="false">
            <el-button class="" icon="el-icon-check" @click="selectEntity(scope.row)">选择</el-button>
          </el-table-column>
        </template>
      </SimpleTable>
    </el-dialog>

  </el-container>
</template>

<script>
  import {
    addRefField,
    updateRefField,
    getRefFieldExtras,
    getEntitySet,
    getFieldSet,
    getField
  } from '@/api/system-manager'
  import { copyObj } from '@/utils/util'
  import FieldState from "@/views/system/field-state-variables";

  export default {
    name: "ReferenceWidgetEditor",
    props: {
      entity: String,
      fieldName: String,
      showingInDialog: Boolean,
      fieldState: {
        type: Number,
        default: FieldState.NEW /* 1新建字段，2编辑字段 */
      },
    },
    data() {
      return {
        fieldProps: {
          'name': '',
          'label': '',
          'type': 'Reference',
          'defaultMemberOfListFlag': true,
          'nullable': false,
          'creatable': true,
          'updatable': true,
          'fieldViewModel': {
            'searchDialogWidth': 520,
            'validators': [],
          },
          'referenceSetting': null,
        },

        rules: {
          name: [
            {required: true, message: '请输入字段名称', trigger: 'blur'},
            {pattern: /^[a-z]+[A-Za-z\d]*$/, message: '请以小写英文字母开头，中间可输入字母或数字，禁止中文', trigger: 'blur'},
            {min: 2, max: 30, message: '请输入至少两个字符', trigger: 'blur'},
          ],
          label: [
            {required: true, message: '请输入显示名称', trigger: 'blur'},
            {pattern: /^[A-Za-z\d\u4e00-\u9fa5]+[_-]*/, message: '请以中文、英文字母、数字开头，中间可输入下划线或横杠',
              trigger: 'blur'},
            {min: 2, max: 30, message: '请输入至少两个字符', trigger: 'blur'},
          ],
        },
        validators: [],

        currentRefEntity: '',
        refEntityAndFields: '',

        refEntityName: '',
        refEntityLabel: '',
        refEntityFullName: '',

        showRefEntityDialogFlag: false,
        showEntityListDialogFlag: false,

        fieldItems: [],
        selectedFieldItems: [],

        columns: [
          {prop: 'name', label: '实体名称', width: '150', align: 'center'},
          {prop: 'label', label: '显示名称', width: '200', align: 'center', formatter: this.formatter},
        ],
        tableData: [],
      }
    },
    mounted() {
      if (this.fieldState === FieldState.EDIT) {
        this.getFieldProps()
      }
    },
    methods: {
      getFieldProps() {
        getField(this.fieldName, this.entity).then(res => {
          if (res.error != null) {
            this.$message({ message: res.error, type: 'error' })
            return
          }

          this.readFieldProps(res.data)
        }).catch(res => {
          this.$message({ message: res.message, type: 'error' })
        })
      },

      readFieldProps(savedProps) {
        copyObj(this.fieldProps, savedProps)
        //console.log(this.fieldProps)
        if (!this.fieldProps.fieldViewModel) {  //设置搜索弹窗默认宽度
          this.fieldProps['fieldViewModel'] = {
            searchDialogWidth: 520
          }
        }
        if (!!savedProps.entityCode) {
          this.fieldProps.entityCode = savedProps.entityCode
        }
        //console.log(JSON.stringify(this.fieldProps))

        getRefFieldExtras(savedProps.name, this.entity).then(res => {
          if (res.error != null) {
            this.$message({ message: res.error, type: 'error' })
            return
          }

          this.currentRefEntity = res.data.currentRefEntity
          this.refEntityName = res.data.refEntityName
          this.refEntityLabel = res.data.refEntityLabel
          this.refEntityFullName = res.data.refEntityFullName
          this.refEntityAndFields = res.data.refEntityAndFields
          this.fieldItems = res.data.fieldItems
          this.selectedFieldItems = res.data.selectedFieldItems
        }).catch(res => {
          this.$message({ message: res.error, type: 'error' })
        })
      },

      saveField() {
        let validResult = true
        this.$refs['editorForm'].validate((success) => {
          if (!success) {
            validResult = false
            return false
          }
        })
        if (!validResult) return

        if (!this.fieldProps.referenceSetting) {
          this.$message.error('请设置引用实体！')
          return
        }

        this.fieldProps.type = 'Reference'
        //console.log( JSON.stringify(this.fieldProps) )
        let saveMethod = addRefField
        if (this.fieldState === FieldState.EDIT) {
          saveMethod = updateRefField
        }
        saveMethod(this.fieldProps, this.entity, this.currentRefEntity).then(res => {
          if (res.error != null) {
            this.$message({ message: res.error, type: 'error' })
            return
          }

          this.$message.success('保存成功')
          this.$emit('fieldSaved')
        }).catch(res => {
          this.$message({ message: res.message, type: 'error' })
        })
      },

      cancelSave() {
        this.$emit('cancelSave')
      },

      clearReferTo() {
        this.currentRefEntity = ''
        this.refEntityAndFields = ''
        this.fieldProps.referenceSetting = null
      },

      showRefEntitySettingDialog() {
        this.showRefEntityDialogFlag = true
      },

      setRefEntity() {
        if(this.selectedFieldItems.length <= 0) {
          this.$message.info('请至少选择一个显示字段！')
          return
        }

        let tempStr = this.refEntityLabel + '['
        for (let i = 0; i < this.selectedFieldItems.length; i++) {
          tempStr += this.selectedFieldItems[i].label + ','
        }
        tempStr += ']'
        this.refEntityAndFields = tempStr

        this.currentRefEntity = this.refEntityName
        let fieldList = []
        this.selectedFieldItems.forEach( item => {
          fieldList.push(item.name)
        })
        this.fieldProps.referenceSetting = [{'entityName': this.currentRefEntity, 'fieldList': fieldList}]
        // console.log( JSON.stringify(this.fieldProps.referenceSetting) )

        this.showRefEntityDialogFlag = false
      },

      showEntityListDialog() {
        this.tableData.length = 0
        getEntitySet().then(res => {
          if (res.error != null) {
            this.$message({ message: res.error, type: 'error' })
            return
          }
          let entityItems = res.data
          if (!!entityItems) {
            entityItems.filter( entity => {
              if (entity.detailEntityFlag === false) {
                this.tableData.push({name: entity.name, label: entity.label})
              }
            })
          }
          this.showEntityListDialogFlag = true
        }).catch(res => {
          this.$message({ message: res.message, type: 'error' })
        })
      },

      selectEntity(row) {
        this.refEntityName = row.name
        this.refEntityLabel = row.label
        this.refEntityFullName = this.refEntityLabel + '(' + this.refEntityName + ')'
        this.showEntityListDialogFlag = false

        this.fieldItems.length = 0
        getFieldSet(this.refEntityName).then(res => {
          if (res.error != null) {
            this.$message({ message: res.error, type: 'error' })
            return
          }
          let resultList = res.data
          if (resultList) {
            resultList.filter( item => {
              if (item.type !== 'PrimaryKey') {
                this.fieldItems.push(item)
              }
            })
          }
        }).catch(res => {
          this.$message({ message: res.message, type: 'error' })
        })
      },

      setRefEntityListField(fieldItem, value) {
        if (!!value) {
          this.selectedFieldItems.push(fieldItem)
        } else {
          for (let i = this.selectedFieldItems.length - 1; i >= 0; i--) {
            if (this.selectedFieldItems[i].name === fieldItem.name) {
              this.selectedFieldItems.splice(i, 1)
            }
          }
        }
      },

      isSelectedField(fieldItem) {
        //console.log(fieldItem)
        //console.log(this.selectedFieldItems)
        let matchedFlag = false
        this.selectedFieldItems.forEach( item => {
          if (fieldItem.name === item.name) {
            matchedFlag = true
          }
        })
        return matchedFlag
      }

    }
  }
</script>

<style lang="scss" scoped>
  @import "@/style/form-layout/field-editor-common.scss";

  .refer-entity-dialog, .entity-list-dialog {
    :deep(.el-dialog__header) {
      padding: 15px;
      padding-bottom: 3px;
    }

    :deep(.el-dialog__body) {
      padding: 6px;
    }
  }

</style>
