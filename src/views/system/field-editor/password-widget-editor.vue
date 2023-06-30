<template>
  <el-container class="field-props-container">
    <el-header class="field-props-header" v-if="!showingInDialog">[密码]字段属性设置</el-header>
    <el-main class="field-props-pane">
      <el-form ref="editorForm" :model="fieldProps" :rules="rules" label-position="left"
               label-width="220px" size="small" @submit.prevent>
        <el-form-item label="字段名称" prop="name">
          <el-input v-model="fieldProps.name" :disabled="fieldState !== 1"></el-input>
        </el-form-item>
        <el-form-item label="显示名称" prop="label">
          <el-input v-model="fieldProps.label"></el-input>
        </el-form-item>
        <el-form-item label="最小长度">
          <el-input-number v-model="fieldProps.fieldViewModel.minLength"
                           :min="6" :max="30" style="width: 100%"></el-input-number>
        </el-form-item>
        <el-form-item label="最大长度（不能超过30字符）">
          <el-input-number v-model="fieldProps.fieldViewModel.maxLength"
                           :min="6" :max="30" style="width: 100%"></el-input-number>
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
  </el-container>
</template>

<script>
  import { addField } from '@/api/system-manager'
  import FieldState from "@/views/system/field-state-variables";
  import {fieldEditorMixin} from "@/views/system/field-editor/field-editor-mixin";

  /*
  * 重要提示：
  * 1. 密码输入框只在新建记录时可以输入密码，密码（加盐）保存后并不回显输入框，输入框显示伪造的8个*号；
  * 2. 密码输入框在新建记录状态时，可以切换查看输入明文；
  * 3. 密码输入框在编辑记录状态时，默认不可修改密码，必须点击辅助按钮切换到修改密码状态方可输入新密码；
  * 4. 密码只能单向加密，不能反向解密，如忘记密码只能重设密码；
  * 5. 密码输入框在列表也不是显示加密密文内容，只显示伪造的3个*号。
  * */

  export default {
    name: "PasswordWidgetEditor",
    props: {
      entity: String,
      fieldName: String,
      showingInDialog: Boolean,
      fieldState: {
        type: Number,
        default: FieldState.NEW,
      }
    },
    mixins: [fieldEditorMixin],
    data() {
      return {
        fieldProps: {
          'name': '',
          'label': '',
          'type': 'Password',
          'nullable': false,
          'creatable': true,
          'updatable': true,
          'fieldViewModel': {
            'minLength': 6,
            'maxLength': 20,
            'validators': [],
          },
        },

        validators: [],

      }
    },
    mounted() {
      //mixin
    },
    methods: {
      saveField() {
        let validResult = true
        this.$refs['editorForm'].validate((success) => {
          if (!success) {
            validResult = false
            return false
          }
        })
        if (!validResult) return

        this.fieldProps.type = 'Password'
        if (this.fieldState === FieldState.NEW) {
          this.createNewField()
        } else if (this.fieldState === FieldState.EDIT) {
          this.modifyOldField()
        } else {
          // error
        }
      },

      cancelSave() {
        this.$emit('cancelSave')
      },
    }
  }
</script>

<style lang="scss" scoped>
  @import "@/style/form-layout/field-editor-common.scss";
</style>
