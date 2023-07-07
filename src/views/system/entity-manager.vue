<template>
  <el-container>
    <el-aside width="380px">
      <div class="fields-list">
        <div class="fields-list-header">&lt;{{entityLabel}}&gt;字段列表</div>
        <div class="fields-category">保留字段</div>
        <ul class="fields-list-container">
          <template v-for="fieldItem in fieldItems">
          <li v-if="!!fieldItem.reserved" :key="fieldItem.name"
               class="field-item">{{fieldItem.label}}</li>
          </template>
        </ul>
      </div>

      <div class="fields-category">普通字段
        <el-dropdown @command="handleNewFieldCommand" class="add-field-dropdown" size="small">
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
      <ul class="fields-list-container">
        <template v-for="(fieldItem, fiIdx) in fieldItems">
        <li v-if="!fieldItem.reserved" :key="fiIdx" @click="editFieldProp(fiIdx, fieldItem)"
            class="field-item" :class="{'selected': (selectedFieldItemIdx === fiIdx)}">{{fieldItem.label}}</li>
        </template>
      </ul>
    </el-aside>

    <el-container class="main-container">
      <el-header class="props-action-section">操作区</el-header>

      <el-main>

        <el-row v-show="false">
          <el-col :span="16" :offset="4">
            <EntityPropEditor :entityProps="entityProps"></EntityPropEditor>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="16" :offset="4">
            <component ref="fieldEditor" :is="curFWEditor" :entity="entity" :fieldState="editState"
                       @fieldSaved="onFieldSaved"></component>
          </el-col>
        </el-row>

      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import { getFieldSet, getField } from '@/api/system-manager'
import EntityPropEditor from './entity-editor/entity-property-editor.vue'

export default {
  name: 'EntityManager',
  components: {
    EntityPropEditor,
    BooleanWE: () => import('@/views/system/field-editor/boolean-widget-editor.vue'),
    IntegerWE: () => import('@/views/system/field-editor/integer-widget-editor.vue'),
    DecimalWE: () => import('@/views/system/field-editor/decimal-widget-editor.vue'),
    PercentWE: () => import('@/views/system/field-editor/percent-widget-editor.vue'),
    MoneyWE: () => import('@/views/system/field-editor/money-widget-editor.vue'),

    TextWE: () => import('@/views/system/field-editor/text-widget-editor.vue'),
    EmailWE: () => import('@/views/system/field-editor/email-widget-editor.vue'),
    UrlWE: () => import('@/views/system/field-editor/url-widget-editor.vue'),
    TextAreaWE: () => import('@/views/system/field-editor/textarea-widget-editor.vue'),
    PasswordWE: () => import('@/views/system/field-editor/password-widget-editor.vue'),

    OptionWE: () => import('@/views/system/field-editor/option-widget-editor.vue'),
    TagWE: () => import('@/views/system/field-editor/tag-widget-editor.vue'),

    DateWE: () => import('@/views/system/field-editor/date-widget-editor.vue'),
    DateTimeWE: () => import('@/views/system/field-editor/datetime-widget-editor.vue'),

    PictureWE: () => import('@/views/system/field-editor/picture-widget-editor.vue'),
    FileWE: () => import('@/views/system/field-editor/file-widget-editor.vue'),

    ReferenceWE: () => import('@/views/system/field-editor/reference-widget-editor.vue'),
    AnyReferenceWE: () => import('@/views/system/field-editor/anyreference-widget-editor.vue'),
    ReferenceListWE: () => import('@/views/system/field-editor/referencelist-widget-editor.vue'),

  },
  data() {
    return {
      fieldItems: [],
      entityProps: {
        privilegeFlag: true,
        assignFlag: false,
        shareFlag: false,
        mainEntityFlag: true,
        detailEntityFlag: false,
      },
      curFWEditor: 'TagWE',
      selectedFieldItemIdx: -1,
      editState: 1,
      entity:"",
      entityLabel:"",
    }
  },
  created () {
  },

  mounted () {
    this.entity = this.$route.query.entity;
    this.entityLabel = this.$route.query.entityLabel;
    this.getEntityFields()
  },

  methods: {
    getEntityFields () {
      if (!!this.entity) {
        getFieldSet(this.entity).then(res => {
          if (res.error != null) {
            this.$message({ message: res.error, type: 'error' })
            return
          }
          this.fieldItems = res.data
        }).catch(res => {
          this.$message({ message: res.message, type: 'error' })
        })
      }
    },

    handleNewFieldCommand(command) {
      //this.$message('click on item ' + command)
      this.curFWEditor = command
    },

    onFieldSaved() {
      this.getEntityFields()
    },

    editFieldProp(fiIdx, fieldItem) {
      this.selectedFieldItemIdx = fiIdx
      this.curFWEditor = fieldItem.type + 'WE'
      getField(fieldItem.name, this.entity).then(res => {
        if (res.error != null) {
          this.$message({ message: res.error, type: 'error' })
        } else {
          //console.log(res.data)
          this.editState = 2
          if (!!this.$refs['fieldEditor'].readFieldProps) {
            this.$refs['fieldEditor'].readFieldProps(res.data)
          }
        }
      }).catch(res => {
        this.$message({ message: res.message, type: 'error' })
      })
    }
  }
}
</script>

<style lang="scss" scoped>

.main-container {
  min-width: 720px;
  border-left: 2px solid #eeeeee;
  background: #ffffff;
}

.fields-list {

  .fields-list-header {
    font-size: 14px;
    text-align: center;
    height: 54px;
    line-height: 54px;
    border-bottom: 1px dashed #eeeeee;
  }
}

.fields-category {
  font-size: 13px;
  margin: 16px 0 0 16px;
  /* clear: both; */
}

ul.fields-list-container {
  display: block;
  list-style-type: disc;
  padding-left: 16px;
  margin: 10px 0 10px 0;
}

ul.fields-list-container:after {
  content: "";
  display: block;
  clear: both;
}

li.field-item {
  font-size: 12px;
  list-style: none;
  float: left;
  line-height: 26px;
  overflow: hidden;
  white-space: nowrap;
  width: 160px;
  margin: 1%;
  background: #F4F6FC;
  padding-left: 10px;
}

li.field-item.selected {
  outline: 1px #409EFF solid;
}

.add-field-dropdown {
  float: right;
  margin-right: 10px;

  .el-dropdown-link {
    font-size: 12px;
    cursor: pointer;
    color: #409EFF;
  }

  .el-icon-arrow-dow {
    font-size: 12px;
  }

  .el-dropdown-menu {
    font-size: 12px;
  }
}

.el-header.props-action-section {
  font-size: 14px;
  text-align: center;
  border-bottom: 1px dashed #eeeeee;
  height: 55px !important;
  line-height: 55px !important;
}

</style>
