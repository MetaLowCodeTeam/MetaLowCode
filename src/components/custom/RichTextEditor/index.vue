<template>
  <el-form-item :prop="propField">
    <div class="custom-component-label">{{label}}</div>
    123
    <!-- <quill-editor v-model="content"></quill-editor> -->
  </el-form-item>
</template>

<script>
//   import { quillEditor } from 'vue3-quill';

  export default {
    name: "RichTextEditor",
    // components: {
    //   quillEditor
    // },
    props: {
      formModel: Object,
      dataFields: {
        type: Array,
        default: () => [],
      },
      fieldPropsMap: {
        type: Object,
        default: null,
      },
      componentLabel: {
        type: String,
        default: null
      },
    },
    data() {
      return {
        //
      }
    },

    computed: {
      label() {
        if (!!this.componentLabel) {
          return this.componentLabel
        }

        if (!!!this.fieldPropsMap || !this.dataFields || (this.dataFields.length <= 0)) {
          return '富文本编辑'
        }

        return !!this.fieldPropsMap[this.dataFields[0]] ? this.fieldPropsMap[this.dataFields[0]].label : ''
      },

      propField() { /* 该属性用于字段校验规则！！ */
        if (!this.dataFields || (this.dataFields.length <= 0)) {
          return null
        }

        return this.dataFields[0]
      },

      content: {
        get() {
          if (!this.formModel) { /* 表单布局预览状态!! */
            return ''
          }

          if (!this.dataFields || (this.dataFields.length <= 0)) {
            return ''
          }

          return this.formModel[this.dataFields[0]]
        },

        set(newValue) {
          if (!!this.dataFields && (this.dataFields.length > 0)) {
            this.formModel[this.dataFields[0]] = newValue
          }
        }
      },

    },

  }
</script>

<style lang="scss" scoped>
  .custom-component-label {
    font-size: 12px;
    color: #606266;
    white-space: nowrap;
  }
</style>
