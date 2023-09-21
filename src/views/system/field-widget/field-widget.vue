<template>
  <el-form-item :label="fieldProps.label" :label-width="labelWidth + 'px'"
                :class="[labelAlign]" :prop="field.name" :title="inputHint">
    <template v-if="field.type === 'Boolean'">
      <el-radio-group v-model="fieldValue" :disabled="isReadOnly">
        <el-radio :label="1">是</el-radio>
        <el-radio :label="2">否</el-radio>
        <el-radio :label="-1">--</el-radio>
      </el-radio-group>
    </template>

    <!-- 注意：数字类型不能使用el-input-number组件，必须使用el-input组件并设置属性type="number"！！！
         1. 该组件会多次触发fieldValue计算属性的getter、setter方法；
         2. 该组件对于null值，会自动转化为0值。
         -->

    <template v-if="field.type === 'Integer'">
      <el-input type="number" :controls="false" v-model="fieldValue" :readonly="isReadOnly" @blur="formatInteger"
                       :precision="0" :min="minValue" :max="maxValue"
                       class="hide-spin-button" style="width: 100%"></el-input>
    </template>

    <template v-if="field.type === 'Decimal'">
      <el-input type="number" :controls="false" v-model="fieldValue" :readonly="isReadOnly" @blur="formatDecimal"
                       :precision="precision" :min="minValue" :max="maxValue"
                       class="hide-spin-button" style="width: 100%"></el-input>
    </template>

    <template v-if="field.type === 'Percent'">
      <el-input type="number" v-model="fieldValue" :readonly="isReadOnly" @blur="formatPercent"
                :min="minValue" :max="maxValue"
                class="hide-spin-button" style="width: 100%">
        <template #append>%</template>
      </el-input>
    </template>

    <template v-if="field.type === 'Money'">
      <el-input type="number" :controls="false" v-model="fieldValue" :readonly="isReadOnly" @blur="formatDecimal"
                       :precision="precision" :min="minValue" :max="maxValue"
                       class="hide-spin-button" style="width: 100%"></el-input>
    </template>

    <template v-if="field.type === 'Text'">
      <el-input link type="primary" v-model="fieldValue" :readonly="isReadOnly" :ref="field.name"
                :minLength="minLength" :maxLength="maxLength"
                style="width: 100%"></el-input>
    </template>

    <template v-if="field.type === 'Email'">
      <el-input link type="primary" v-model="fieldValue" :readonly="isReadOnly"
                :minLength="minLength" :maxLength="maxLength"
                style="width: 100%"></el-input>
    </template>

    <template v-if="field.type === 'Url'">
      <el-input link type="primary" v-model="fieldValue" :readonly="isReadOnly"
                :minLength="minLength" :maxLength="maxLength"
                style="width: 100%"></el-input>
    </template>

    <template v-if="field.type === 'TextArea'">
      <el-input type="textarea" v-model="fieldValue" :readonly="isReadOnly"
                :minLength="minLength" :maxLength="maxLength"
                :rows="rows" style="width: 100%"></el-input>
    </template>

    <template v-if="field.type === 'Password'">
      <el-input link type="primary" v-model="fieldValue" :readonly="isReadOnly"
                :minLength="minLength" :maxLength="maxLength"
                show-password style="width: 100%"></el-input>
    </template>

    <template v-if="field.type === 'Option'">
      <el-select placeholder="单选项" v-model="fieldValue" :disabled="isReadOnly" filterable
                 :popper-append-to-body="false" style="width: 100%">
        <el-option :value="null" label="请选择"></el-option>
        <el-option v-for="optionItem in fieldProps.optionList" :key="optionItem.value"
                   :value="optionItem.value" :label="optionItem.label">
          <span style="float: left">{{ optionItem.label }}</span>
          <span style="float: right; color: #8492a6; font-size: 13px">
            <i v-if="optionItem.value === fieldValue" class="el-icon-check"></i></span>
        </el-option>
      </el-select>
    </template>

    <template v-if="field.type === 'Tag'">
      <el-select placeholder="多选项" v-model="fieldValue" :disabled="isReadOnly" multiple
                 :popper-append-to-body="false" style="width: 100%">
        <!-- el-option value="" label="请选择"></el-option -->
        <el-option v-for="tagItem in fieldProps.tagList" :key="tagItem.value"
                   :value="tagItem.value" :label="tagItem.value">
          <span style="float: left">{{ tagItem.value }}</span>
          <span style="float: right; color: #8492a6; font-size: 13px"></span>
        </el-option>
      </el-select>
    </template>

    <template v-if="field.type === 'Date'">
      <el-date-picker type="date" placeholder="日期" v-model="fieldValue" :readonly="isReadOnly"
                      value-format="yyyy-MM-dd"
                      style="width: 100%"></el-date-picker>
    </template>

    <template v-if="field.type === 'DateTime'">
      <el-date-picker type="datetime" title="日期/时间" v-model="fieldValue" :readonly="isReadOnly"
                      value-format="yyyy-MM-dd HH:mm:ss" default-time="10:00:00"
                      style="width: 100%"></el-date-picker>
    </template>

    <template v-if="field.type === 'Reference'">
      <el-input :placeholder="isReadOnly ? '' : '请选择'" v-model="fieldLabel" readonly style="width: 100%">
        <template #append>
          <el-button icon="el-icon-close" title="清除"
                     v-if="!!fieldLabel && !isReadOnly" @click="clearReference"></el-button>
          <el-button icon="el-icon-search" v-if="!isReadOnly"
                  @click="showReferenceDialog(field.name)"></el-button>
        </template>
      </el-input>

      <el-dialog title="请选择" v-model="showReferenceDialogFlag" :show-close="true"
                 :width="searchDialogWidth + 'px'"
                 :close-on-click-modal="false" :close-on-press-escape="false" :append-to-body="true">
        <ReferenceSearchTable ref="referST" :entity="entity" :refField="curRefField"
                              @recordSelected="addReferRecord"></ReferenceSearchTable>
      </el-dialog>
    </template>

    <template v-if="field.type === 'AnyReference'">
      <el-input placeholder="请选择" v-model="fieldValue" readonly style="width: 100%">
        <template #append>
          <el-button icon="el-icon-search"></el-button>
        </template>
      </el-input>
    </template>

    <template v-if="field.type === 'ReferenceList'">
      <!--
      <el-input placeholder="请选择" v-model="fieldValue" readonly style="width: 100%">
        <el-button slot="append" icon="el-icon-search"></el-button>
      </el-input>
      -->
      <el-select multiple v-model="fieldValue" value-key="id" :popper-append-to-body="false"
                 :disabled="isReadOnly" class="x-hidden-select-caret x-hidden-select-dropdown full-width">
        <!--
        <template v-for="(referObj, referObjIdx) in referRecordList">
          <el-option :label="referObj.label" :value="referObj.id" :key="referObjIdx"></el-option>
        </template>
        -->
        <!--
        <el-option label="管理员" value="023-000000000000000000000000000000000001"></el-option>
        -->
        <template v-for="(roleObj, roleIdx) in roleList" :key="roleIdx">
          <el-option :label="roleObj.roleName" :value="roleObj.roleId"></el-option>
        </template>
      </el-select>
    </template>

    <!-- 多个图片上传后的URL要用“||”连接！！ -->
    <template v-if="field.type === 'Picture'">
      <el-upload :action="pictureUploadAction" :headers="headers" :file-list="fileList"
                 :show-file-list="showFileListFlag" list-type="picture-card" :class="{'hideUploadDiv': uploadBtnHidden}"
                 :limit="maxFileCount" :on-exceed="handlePictureExceed" :before-upload="beforePictureUpload"
                 :on-success="handlePictureUpload" :on-remove="handlePictureRemove">
        <template #tip>
          <div class="el-upload__tip"
               v-if="!!fieldProps.fieldViewModel && !!fieldProps.fieldViewModel.uploadHint">{{fieldProps.fieldViewModel.uploadHint}}</div>
        </template>
        <i class="el-icon-plus avatar-uploader-icon"></i>
      </el-upload>
    </template>

    <!-- 多个文件上传后的URL要用“||”连接！！ -->
    <template v-if="field.type === 'File'">
      <el-upload :action="fileUploadAction" :headers="headers" :file-list="fileList" multiple
                 :show-file-list="showFileListFlag" :class="{'hideUploadDiv': uploadBtnHidden}"
                 :limit="maxFileCount" :on-exceed="handleFileExceed" :before-upload="beforeFileUpload"
                 :on-success="handleFileUpload" :on-remove="handleFileRemove">
        <template #tip>
          <div class="el-upload__tip"
               v-if="!!fieldProps.fieldViewModel && !!fieldProps.fieldViewModel.uploadHint">{{fieldProps.fieldViewModel.uploadHint}}</div>
        </template>
        <template #default>
          <i class="el-icon-plus avatar-uploader-icon"></i>
        </template>
        <template #file="{file}">
          <div class="upload-file-list">
            <span class="upload-file-name" :title="file.name">{{file.name}}</span>
            <a :href="file.url" download=""><i class="el-icon-download file-action" title="下载"></i></a>
            <i class="el-icon-delete file-action" title="删除" @click="removeUploadFile(file.name)"></i>
          </div>
        </template>
      </el-upload>
    </template>

  </el-form-item>
</template>

<script>
  /* 表单状态formState: 0预览，1新建，2编辑，3查看 */

  import ReferenceSearchTable from '@/views/system/field-widget/reference-search-table.vue'
  import FormState from '@/views/system/form-state-variables'
  import { isDefinedNull, isNull, isNotNull, isEmptyStr } from '@/utils/util'
  import * as SYS from "@/api/system-manager";
  import {listRole} from "@/api/user";

  export default {
    props: {
      entity: String,
      labelWidth: {
        type: Number,
        default: 75
      },
      labelAlign: {
        type: String,
        default: 'label-left-align'
      },
      field: Object,
      fieldProps: Object,
      formModel: {
        type: Object,
        default: () => {}
      },
      labelsModel: {
        type: Object,
        default: () => {}
      },
      formState: {
        type: Number,
        default: 0,
      },
    },
    components: { ReferenceSearchTable },
    name: "FieldWidget",
    data() {
      return {
        showReferenceDialogFlag: false,
        curRefField: null,

        roleList: [],  //权限角色列表

        options: [],

        uploadBtnHidden: false,
        fileList: [],  //上传文件列表

      }
    },
    mounted() {
      //console.log(this.formState)

      if (((this.field.type === 'Picture') || (this.field.type === 'File')) &&
          ((this.formState === FormState.EDIT) || (this.formState === FormState.VIEW))) {  //初始化图片、文件组件
        this.initFileList()
      }

      if ((this.field.name === 'roles') && (this.entity === 'User') &&
          ((this.formState === FormState.NEW) || (this.formState === FormState.EDIT) ||
              (this.formState === FormState.VIEW))) {
        this.loadRoleList()
      }

      this.buildFieldRule()
    },
    computed: {
      isReadOnly() {
        return (this.formState === FormState.PREVIEW) || (this.formState === FormState.VIEW)
            || ((this.formState === FormState.NEW) && !this.fieldProps.creatable)
            || ((this.formState === FormState.EDIT) && !this.fieldProps.updatable)
      },

      fieldValue: {
        get() {
          //console.log('getValue: ' + this.field.name)
          if (this.field.type === 'Boolean') {

            if (!this.formModel) {
              return null
            } else {
              if (isDefinedNull(this.formModel[this.field.name])) {
                return -1 //后台返回null值
              } else if (this.formModel[this.field.name] === true) {
                return 1  //后台返回true值
              } else {
                return 2  //后台返回false值
              }
            }
          } else if (!this.formModel || isNull(this.formModel[this.field.name])) {
            return null  //return ''
          }

          if (this.field.type === 'Tag') {
            let tagArray = []
            let tagValuesStr = this.formModel[this.field.name] + ''
            tagValuesStr.split(",").forEach(item => {
              if (!!item.trim())
                tagArray.push(item.trim())
            })
            return tagArray
          } else if ((this.field.type === 'Picture') || (this.field.type === 'File')) {
            //
            return this.formModel[this.field.name]
          } else {
            return this.formModel[this.field.name]
          }
        },
        set(newValue) {
          //console.log('setValue: ' + this.field.name + ', ' + newValue)
          if (this.formState !== 0) { /* 预览状态下formModel为null，下一行会报错！！ */

            if (this.field.type === 'Boolean') {
              if (newValue === 1) {
                this.formModel[this.field.name] = true
              } else if (newValue === 2) {
                this.formModel[this.field.name] = false
              } else {
                this.formModel[this.field.name] = null
              }
              return
            }

            //
            this.formModel[this.field.name] = newValue
          }
        }
      },

      fieldLabel: {
        get() {
          if (!this.labelsModel || isNull(this.labelsModel[this.field.name])) {
            return ''
          }

          return this.labelsModel[this.field.name]
        },
        set(newLabel) {
          this.labelsModel[this.field.name] = newLabel
        }
      },

      minValue() {
        if (!!this.fieldProps.fieldViewModel && isNotNull(this.fieldProps.fieldViewModel.minValue)) {
          return this.fieldProps.fieldViewModel.minValue
        } else if (this.field.type === 'Integer') {
          return -4200000000
        } else if (this.field.type === 'Percent') {
          return -100000000
        } else if (this.field.type === 'Decimal') {
          return -9999999999999.99
        } else if (this.field.type === 'Money') {
          return -9999999999999.99
        } else {
          return -4200000000
        }
      },

      maxValue() {
        if (!!this.fieldProps.fieldViewModel && isNotNull(this.fieldProps.fieldViewModel.maxValue)) {
          return this.fieldProps.fieldViewModel.maxValue
        } else if (this.field.type === 'Integer') {
          return 4200000000
        } else if (this.field.type === 'Percent') {
          return 100000000
        } else if (this.field.type === 'Decimal') {
          return 9999999999999.99
        } else if (this.field.type === 'Money') {
          return 9999999999999.99
        } else {
          return 4200000000
        }
      },

      precision() {
        if (!!this.fieldProps.fieldViewModel && isNotNull(this.fieldProps.fieldViewModel.precision)) {
          return this.fieldProps.fieldViewModel.precision
        } else if (this.field.type === 'Integer') {
          return 0
        } else if (this.field.type === 'Decimal') {
          return 2
        } else if (this.field.type === 'Money') {
          return 2
        } else {
          return 0
        }
      },

      minLength() {
        if (!!this.fieldProps.fieldViewModel && isNotNull(this.fieldProps.fieldViewModel.minLength)) {
          return this.fieldProps.fieldViewModel.minLength
        } else {
          return 0
        }
      },

      maxLength() {
        if (!!this.fieldProps.fieldViewModel && isNotNull(this.fieldProps.fieldViewModel.maxLength)) {
          return this.fieldProps.fieldViewModel.maxLength
        } else {
          if ((this.field.type === 'Text') || (this.field.type === 'Email')
              || (this.field.type === 'Url') || (this.field.type === 'Password')) {
            return 190
          } else if (this.field.type === 'Tag') {
            return 300
          } else {
            return 5000
          }
        }
      },

      rows() {
        return !!this.fieldProps.fieldViewModel && isNotNull(this.fieldProps.fieldViewModel.rows) ?
            this.fieldProps.fieldViewModel.rows : 3
      },

      searchDialogWidth() {
        return !!this.fieldProps.fieldViewModel && isNotNull(this.fieldProps.fieldViewModel.searchDialogWidth) ?
            this.fieldProps.fieldViewModel.searchDialogWidth : 520
      },

      pictureUploadAction() {
        return SYS.getPictureUploadAction()
      },

      maxFileCount() {
        return !!this.fieldProps.fieldViewModel && isNotNull(this.fieldProps.fieldViewModel.maxFileCount) ?
            this.fieldProps.fieldViewModel.maxFileCount : 1
      },

      fileUploadAction() {
        return SYS.getFileUploadAction()
      },

      headers() {
        if (sessionStorage.getItem('userId') != null) {
          return {
            ruId: sessionStorage.getItem('userId')
          }
        } else {
          return {}
        }
      },

      showFileListFlag() {
        return true
      },

      inputHint() {
        if (((this.formState === FormState.NEW) && !!this.fieldProps.creatable)
            || ((this.formState === FormState.EDIT) && !!this.fieldProps.updatable)) {
          let hint = ''
          if (!this.fieldProps.nullable) {
            hint += '不可为空，'
          }
          if (!!this.fieldProps.fieldViewModel && isNotNull(this.fieldProps.fieldViewModel.minValue)) {
            hint += '大于等于' + this.fieldProps.fieldViewModel.minValue + '，'
          }
          if (!!this.fieldProps.fieldViewModel && isNotNull(this.fieldProps.fieldViewModel.maxValue)) {
            hint += '小于等于' + this.fieldProps.fieldViewModel.maxValue + '，'
          }
          if (!!this.fieldProps.fieldViewModel && isNotNull(this.fieldProps.fieldViewModel.minLength)) {
            hint += '字符长度大于等于' + this.fieldProps.fieldViewModel.minLength + '，'
          }
          if (!!this.fieldProps.fieldViewModel && isNotNull(this.fieldProps.fieldViewModel.maxLength)) {
            hint += '字符长度小于等于' + this.fieldProps.fieldViewModel.maxLength + ''
          }
          return hint
        } else {
          return ''
        }
      }

    },
    watch: {
      //
    },
    methods: {
      // checkMinValue(value) {
      //   if (!!this.fieldProps && !!this.fieldProps.fieldViewModel && isNotNull(this.fieldProps.fieldViewModel.minValue)) {
      //     if (value < this.fieldProps.fieldViewModel.minValue) {
      //       this.$message.info('输入值不能小于' + this.fieldProps.fieldViewModel.minValue)
      //       value = this.fieldProps.fieldViewModel.minValue
      //     }
      //   }
      //
      //   return value
      // },
      //
      // checkMaxValue(value) {
      //   if (!!this.fieldProps && !!this.fieldProps.fieldViewModel && isNotNull(this.fieldProps.fieldViewModel.maxValue)) {
      //     if (value > this.fieldProps.fieldViewModel.maxValue) {
      //       this.$message.info('输入值不能大于' + this.fieldProps.fieldViewModel.maxValue)
      //       value = this.fieldProps.fieldViewModel.maxValue
      //     }
      //   }
      //
      //   return value
      // },

      formatPercent(event) { //formatPercent(value) {
        let newValue = parseInt(event.target.value)
        /* 输入无效数字后，event.target.value的值为‘’空字符串！！ */
        //if (isNaN(newValue) && (event.target.value !== '')) {
        if (!Number.isFinite(value) && (value !== '')) {
          event.target.focus()
          this.$message.error('数据格式不正确')
          return
        } else if (isEmptyStr(event.target.value)) {
          event.target.value = null
          this.fieldValue = null
          return
        }

        /* 改用字段校验函数实现
        newValue = this.checkMinValue(newValue)
        newValue = this.checkMaxValue(newValue)
        */
        this.fieldValue = newValue
      },

      formatInteger(event) {
        let newValue = parseInt(event.target.value)
        /* 输入无效数字后，event.target.value的值为‘’空字符串！！ */
        //if (isNaN(newValue) && (event.target.value !== '')) {
        if (!Number.isFinite(newValue) && (newValue !== '')) {
          event.target.focus()
          this.$message.error('数据格式不正确')
          return
        } else if (isEmptyStr(event.target.value)) {
          event.target.value = null
          this.fieldValue = null
          return
        }

        /* 改用字段校验函数实现
        newValue = this.checkMinValue(newValue)
        newValue = this.checkMaxValue(newValue)
        */
        this.fieldValue = newValue
      },

      formatDecimal(event) {
        let newValue = parseFloat(event.target.value)
        /* 输入无效数字后，event.target.value的值为‘’空字符串！！ */
        //if (isNaN(newValue) && (event.target.value !== '')) {
        if (!Number.isFinite(value) && (value !== '')) {
          event.target.focus()
          this.$message.error('数据格式不正确')
          return
        } else if (isEmptyStr(event.target.value)) {
          event.target.value = null
          this.fieldValue = null
          return
        }

        /* 改用字段校验函数实现
        newValue = this.checkMinValue(newValue)
        newValue = this.checkMaxValue(newValue)
        */
        newValue = parseFloat(Math.round(newValue * Math.pow(10, this.precision)) / Math.pow(10, this.precision));

        this.fieldValue = newValue
      },

      buildFieldRule() {
        if ((this.formState === FormState.PREVIEW) || (this.formState === FormState.VIEW)
            || ((this.formState === FormState.NEW) && !this.fieldProps.creatable)
            || ((this.formState === FormState.EDIT) && !this.fieldProps.updatable)) {
          return
        }

        const requiredValidator = (rule, value, callback) => {
          /* 当字段为Boolean类型时，字段值false，isEmptyStr函数返回true，故须增加!==false判断 */
          if ((isEmptyStr(this.formModel[rule.field]) && (this.formModel[rule.field] !== false))
              || (this.formModel[rule.field] === null)) {
            callback(new Error('[' + rule.label + ']不能为空'))
          } else {
            callback()
          }
        }

        if (isNotNull(this.fieldProps.nullable) && (this.fieldProps.nullable === false)) {
          let requiredRule = {
            required: true,
            validator: requiredValidator,
            trigger: ['blur'],
            label: this.fieldProps.label,  /* 传入字段label用于错误提示！ */
          }
          if (this.fieldProps.type === 'Tag') {  /* Tag字段需要设置校验对象type属性为array!! */
            requiredRule.type = 'array'
            //newRule.trigger = ['change']
          }
          this.$emit('fieldValidate', requiredRule)
        }

        const minValidator = (rule, value, callback) => {
          if (!!this.fieldProps && !!this.fieldProps.fieldViewModel && isNotNull(this.fieldProps.fieldViewModel.minValue)) {
            if (value < this.fieldProps.fieldViewModel.minValue) {
              callback(new Error('输入值不能小于' + this.fieldProps.fieldViewModel.minValue))
            } else {
              callback()
            }
          } else {
            callback()
          }
        }
        const maxValidator = (rule, value, callback) => {
          if (!!this.fieldProps && !!this.fieldProps.fieldViewModel && isNotNull(this.fieldProps.fieldViewModel.maxValue)) {
            if (value > this.fieldProps.fieldViewModel.maxValue) {
              callback(new Error('输入值不能大于' + this.fieldProps.fieldViewModel.maxValue))
            } else {
              callback()
            }
          } else {
            callback()
          }
        }

        if (this.field.type === 'Integer' || this.field.type === 'Percent' || this.field.type === 'Decimal' ||
            this.field.type === 'Money') {
          let minRule = {
            required: true,
            validator: minValidator,
            trigger: ['blur'],
            label: this.fieldProps.label,  /* 传入字段label用于错误提示！ */
          }
          let maxRule = {
            required: true,
            validator: maxValidator,
            trigger: ['blur'],
            label: this.fieldProps.label,  /* 传入字段label用于错误提示！ */
          }
          this.$emit('fieldValidate', minRule)
          this.$emit('fieldValidate', maxRule)
        }
      },

      showReferenceDialog(fieldName) {
        if ((this.formState === FormState.PREVIEW) || (this.formState === FormState.VIEW)) {
          return
        }

        this.showReferenceDialogFlag = true
        this.curRefField = fieldName
      },

      addReferRecord(recordObj) {
        this.fieldValue = recordObj.id
        this.fieldLabel = recordObj.label
        this.showReferenceDialogFlag = false
      },

      clearReference() {
        this.fieldValue = null
        this.fieldLabel = null
      },

      loadRoleList() {
        listRole().then(res => {
          if (res.error != null) {
            this.$message({ message: res.error, type: 'error' })
            return
          }

          this.roleList = res.data
        }).catch(res => {
          this.$message({ message: res.message, type: 'error' })
        })
      },

      initFileList() {
        this.fileList.length = 0
        let urlPrefix = (this.field.type === 'Picture') ? SYS.getPictureUrlPrefix() : SYS.getFileUrlPrefix()
        if (!isEmptyStr(this.formModel[this.field.name])) {
          let fileNames = this.formModel[this.field.name]
          //let fileArray = []
          fileNames.split('||').forEach(item => {
            if (!isEmptyStr(item)) {
              //fileArray.push(item)
              this.fileList.push({name: item, url: urlPrefix + '/' + item})
            }
          })

          //this.fileList = [...new Set(fileArray)]  //去重
          //console.log(this.fileList)
          this.uploadBtnHidden = this.fileList.length >= this.maxFileCount
        }
      },

      beforePictureUpload(file) {
        let fileTypeCheckResult = false
        if (!!this.fieldProps && !!this.fieldProps.fieldViewModel && !!this.fieldProps.fieldViewModel.uploadFileTypes) {
          let uploadFileTypes = this.fieldProps.fieldViewModel.uploadFileTypes
          if (uploadFileTypes.length > 0) {
            fileTypeCheckResult = uploadFileTypes.some( (ft, idx) => {
              return file.type === 'image/' + ft
            })
          }
        }
        if (!fileTypeCheckResult) {
          this.$message.error('上传图片不支持此格式: ' + file.type + ', 请重新选择图片')
          return false;
        }

        let fileSizeCheckResult = false
        let uploadFileMaxSize = 5  //5MB
        if (!!this.fieldProps && !!this.fieldProps.fieldViewModel && !!this.fieldProps.fieldViewModel.fileMaxSize) {
          uploadFileMaxSize = this.fieldProps.fieldViewModel.fileMaxSize
        }
        fileSizeCheckResult = file.size / 1024 / 1024 <= uploadFileMaxSize
        if (!fileSizeCheckResult) {
          this.$message.error('上传图片大小不能超过' + uploadFileMaxSize + 'MB, 请重新选择图片')
          return false;
        }

        return true
      },

      handlePictureUpload(res, file, fileList) {
        if (res) {
          let fileName = res.data
          file.name = fileName
          file.url = SYS.getPictureUrlPrefix() + '/' + fileName
          this.fileList.push(file) /* 只能push file对象，如果push新的对象（如下一行）上传组件会出现抖动闪烁的问题！！ */
          //this.fileList.push({name: fileName, url: SYS.getPictureUrlPrefix() + '/' + fileName})

          let fileNamesStr = ''
          this.fileList.forEach(item => {
            if (!isEmptyStr(item.name)) {
              fileNamesStr += item.name + '||'
            }
          })
          this.formModel[this.field.name] = fileNamesStr
          this.uploadBtnHidden = fileList.length >= this.maxFileCount
        }
      },

      handlePictureRemove(file, fileList) {
        //let newFileList = []
        let fileNamesStr = ''
        fileList.forEach(item => {
          if (!isEmptyStr(item.name)) {
            //newFileList.push({name: item.name, url: item.url})
            fileNamesStr += item.name + '||'
          }
        })
        //this.fileList = newFileList
        this.fileList = fileList /* 只能用fileList赋值，如果构建新对象赋值（如上一行）上传组件会出现抖动闪烁的问题！！ */
        this.formModel[this.field.name] = fileNamesStr
        this.uploadBtnHidden = fileList.length >= this.maxFileCount
      },

      handlePictureExceed(files, fileList) {
        let maxUploadCount = this.maxFileCount
        this.$message.info(`最多允许上传${maxUploadCount}张图片, 请删除现有图片后上传`)
      },

      beforeFileUpload(file) {
        let fileTypeCheckResult = false
        let extFileName = file.name.substring(file.name.lastIndexOf('.') + 1)
        if (!!this.fieldProps && !!this.fieldProps.fieldViewModel && !!this.fieldProps.fieldViewModel.uploadFileTypes) {
          let uploadFileTypes = this.fieldProps.fieldViewModel.uploadFileTypes
          if (uploadFileTypes.length > 0) {
            fileTypeCheckResult = uploadFileTypes.some( (ft, idx) => {
              return extFileName.toLowerCase() === ft.toLowerCase()
            })
          }
        }
        if (!fileTypeCheckResult) {
          this.$message.error('上传文件不支持此格式: ' + extFileName + ', 请重新选择文件')
          return false;
        }

        let fileSizeCheckResult = false
        let uploadFileMaxSize = 5  //5MB
        if (!!this.fieldProps && !!this.fieldProps.fieldViewModel && !!this.fieldProps.fieldViewModel.fileMaxSize) {
          uploadFileMaxSize = this.fieldProps.fieldViewModel.fileMaxSize
        }
        fileSizeCheckResult = file.size / 1024 / 1024 <= uploadFileMaxSize
        if (!fileSizeCheckResult) {
          this.$message.error('上传文件大小不能超过' + uploadFileMaxSize + 'MB, 请重新选择图片')
          return false;
        }

        return true
      },

      handleFileUpload(res, file, fileList) {
        if (res) {
          let fileName = res.data
          file.name = fileName
          file.url = SYS.getFileUrlPrefix() + '/' + fileName
          this.fileList.push(file) /* 只能push file对象，如果push新的对象（如下一行）上传组件会出现抖动闪烁的问题！！ */
          //this.fileList.push({name: fileName, url: SYS.getFileUrlPrefix() + '/' + fileName})

          let fileNamesStr = ''
          this.fileList.forEach(item => {
            if (!isEmptyStr(item.name)) {
              fileNamesStr += item.name + '||'
            }
          })
          this.formModel[this.field.name] = fileNamesStr
          this.uploadBtnHidden = fileList.length >= this.maxFileCount
        }
      },

      handleFileRemove(file, fileList) {
        let fileNamesStr = ''
        fileList.forEach(item => {
          if (!isEmptyStr(item.name)) {
            //newFileList.push({name: item.name, url: item.url})
            fileNamesStr += item.name + '||'
          }
        })
        //this.fileList = newFileList
        this.fileList = fileList /* 只能用fileList赋值，如果构建新对象赋值（如上一行）上传组件会出现抖动闪烁的问题！！ */
        this.formModel[this.field.name] = fileNamesStr
        this.uploadBtnHidden = fileList.length >= this.maxFileCount
      },

      handleFileExceed(files, fileList) {
        let maxUploadCount = this.maxFileCount
        this.$message.info(`最多允许上传${maxUploadCount}个文件, 请删除现有文件后上传`)
      },

      removeUploadFile(fileName) {
        let foundIdx = -1
        this.fileList.forEach((file,idx) => {
          if (file.name === fileName) {
            foundIdx = idx
          }
        })

        if (foundIdx >= 0) {
          this.fileList.splice(foundIdx, 1)

          let fileNamesStr = ''
          this.fileList.forEach(item => {
            if (!isEmptyStr(item.name)) {
              fileNamesStr += item.name + '||'
            }
          })
          this.formModel[this.field.name] = fileNamesStr
          this.uploadBtnHidden = this.fileList.length >= this.maxFileCount
        }
      },

    }

  }
</script>

<style lang="scss" scoped>
  :deep(.el-dialog__title) {
    font-size: 16px;
  }

  :deep(.el-dialog__body) {
    padding: 5px 3px;
  }

  /* 隐藏Chrome浏览器中el-input数字输入框右侧的上下调整小箭头 */
  :deep(.hide-spin-button) input::-webkit-outer-spin-button,
  :deep(.hide-spin-button) input::-webkit-inner-spin-button {
    -webkit-appearance: none !important;
  }

  /* 隐藏Firefox浏览器中el-input数字输入框右侧的上下调整小箭头 */
  :deep(.hide-spin-button) input[type="number"] {
    -moz-appearance: textfield;
  }

  .hideUploadDiv :deep(div.el-upload--picture-card) { /* 隐藏最后的图片上传按钮 */
    display: none;
  }

  :deep(.el-upload.el-upload--text) {
    color: #409EFF;
    font-size: 12px;  //TODO
    .el-icon-plus:after {
      content: '选择文件';
    }
  }

  .hideUploadDiv :deep(div.el-upload--text) { /* 隐藏最后的文件上传按钮 */
    display: none;
  }

  :deep(div.el-upload__tip) {
    color: #cac6c6;
  }

  .hideUploadDiv :deep(div.el-upload__tip) { /* 隐藏最后的文件上传按钮 */
    display: none;
  }

  /* 必须设置el-select组件的popper-append-to-body属性为false，以下样式才生效！！ */
  /* 解决el-select组件在IE浏览器中默认出现水平、垂直滚动条的问题 */
  .el-select :deep(.el-select-dropdown__wrap) {
    overflow-x: hidden !important;
    overflow-y: auto !important;
  }

  .el-textarea :deep(.el-textarea__inner) {
    overflow-y: auto !important;
  }

  .hidden-select-caret {
    width: calc(100% - 38px);

    :deep(.el-select__caret) {
      display: none;
    }
  }

  .hidden-select-dropdown :deep(.el-select-dropdown) {
    //display: none;
  }

  .el-select.full-width {
    width: 100%;
  }

  .show-dialog-button {
    width: 38px;
    background-color: #F5F7FA;
  }

  .upload-file-list {
    font-size: 12px;

    .upload-file-name {
      display: inline-block;
      height: 12px;
      line-height: 12px;
      width: calc(100% - 52px);
      overflow: hidden;
      white-space: nowrap;
      margin-right: 5px;
    }

    .file-action {
      color: #409EFF;
      margin-left: 5px;
      margin-right: 5px;
    }
  }

  div.blank-cell {
    text-align: center;
    vertical-align: middle;
    height: 28px;
    line-height: 28px;
    color: #cccccc;
    font-style: italic;
    font-size: 12px;
    margin: 0 8px 0 8px;
  }

</style>
