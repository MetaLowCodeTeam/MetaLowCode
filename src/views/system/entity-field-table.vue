<template>
  <el-container class="hidden-x-scrollbar">
    <el-aside class="left-props-panel">
      <el-scrollbar class="props-scrollbar">
      <div class="entity-property">
        <div class="entity-property-header">&lt;{{entityProps.label}}&gt;实体属性</div>
        <div class="entity-property-form">
          <el-form label-position="left" :label-width="'120px'" size="small">
            <el-form-item label="实体名称：">
              <el-input link type="primary" v-model="entityProps.name" disabled></el-input>
            </el-form-item>
            <el-form-item label="显示名称：">
              <el-input link type="primary" v-model="entityProps.label" :readonly="true">
                <template #suffix>
                  <i class="el-icon-edit primary-color" title="修改显示名称" @click="modifyEntityLabel"></i>
                </template>
              </el-input>
            </el-form-item>
            <el-form-item label="实体编码：">
              <el-input link type="primary" v-model="entityProps.entityCode" disabled></el-input>
            </el-form-item>
            <el-form-item label="数据库表名：">
              <el-input link type="primary" v-model="entityProps.physicalName" disabled></el-input>
            </el-form-item>
            <el-form-item label="名称字段：">
              <el-input link type="primary" v-model="entityProps.nameField" :readonly="true">
                <template #suffix>
                  <i class="el-icon-edit primary-color" title="修改名称字段" @click="modifyEntityNameField"></i>
                </template>
              </el-input>
            </el-form-item>
            <el-form-item label="允许设计表单：">
              <el-switch v-model="entityProps.layoutable" style="float: right" disabled></el-switch>
            </el-form-item>
            <el-form-item label="允许设计列表：">
              <el-switch v-model="entityProps.listable" style="float: right" disabled></el-switch>
            </el-form-item>
            <el-form-item label="开启记录级权限：">
              <el-switch v-model="entityProps.authorizable" style="float: right" disabled></el-switch>
            </el-form-item>
            <el-form-item label="是否从属实体：">
              <el-switch v-model="entityProps.detailEntityFlag" style="float: right" disabled></el-switch>
            </el-form-item>
            <el-form-item label="所属主实体：" v-if="!!entityProps.detailEntityFlag">
              <el-input link type="primary" v-model="entityProps.mainEntity.label" disabled></el-input>
            </el-form-item>
          </el-form>
        </div>

        <!--
        <div style="text-align: center">
          <el-button type="" size="small" @click="modifyEntity">修改实体设置</el-button>
        </div>
        -->
      </div>
      </el-scrollbar>
    </el-aside>

    <el-container>
      <el-header class="list-search-panel">
        <div class="search-panel-left">
          <el-dropdown @command="handleNewFieldCommand" size="small">
          <el-button type="primary" size="small" icon="el-icon-ArrowDown">
            新建字段
          </el-button>
            <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="BooleanWE">布尔 / Boolean</el-dropdown-item>
              <el-dropdown-item command="IntegerWE">整数 / Integer</el-dropdown-item>
              <el-dropdown-item command="DecimalWE">精度小数 / Decimal</el-dropdown-item>
              <el-dropdown-item command="PercentWE">百分比 / Percent</el-dropdown-item>
              <el-dropdown-item command="MoneyWE">金额 / Money</el-dropdown-item>
              <el-dropdown-item command="TextWE" divided>文本 / Text</el-dropdown-item>
              <!--
              <el-dropdown-item command="EmailWE">邮箱 / Email</el-dropdown-item>
              <el-dropdown-item command="UrlWE">网址 / Url</el-dropdown-item>
              -->
              <el-dropdown-item command="TextAreaWE">长文本 / TextArea</el-dropdown-item>
              <!--
              <el-dropdown-item command="PasswordWE">密码 / Password</el-dropdown-item>
              -->
              <el-dropdown-item command="OptionWE" divided>单选项 / Option</el-dropdown-item>
              <el-dropdown-item command="TagWE">多选项 / Tag</el-dropdown-item>
              <el-dropdown-item command="DateWE" divided>日期 / Date</el-dropdown-item>
              <el-dropdown-item command="DateTimeWE">日期时间 / DateTime</el-dropdown-item>
              <el-dropdown-item command="PictureWE" divided>图片 / Picture</el-dropdown-item>
              <el-dropdown-item command="FileWE">文件 / File</el-dropdown-item>
              <el-dropdown-item command="ReferenceWE" divided>一对一引用 / Reference</el-dropdown-item>
              <!--
              <el-dropdown-item command="AnyReferenceWE">一对多引用 / AnyReference</el-dropdown-item>
              <el-dropdown-item command="ReferenceListWE">多对多引用 / ReferenceList</el-dropdown-item>
              -->
            </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
        <div class="search-panel-right">
          <el-input link type="primary" v-model="searchText" :clearable="true" @clear="clearTableSearch" class="v-middle"
                    @keyup.enter="searchTableData" size="small" placeholder="请输入关键词搜索">
            <template #append>
              <el-button icon="el-icon-search" @click="searchTableData"></el-button>
            </template>
          </el-input>
        </div>
      </el-header>

      <el-main ref="tableContainer">
        <div>
          <SimpleTable :columns="columns" :data="filteredData" :show-pagination="false" :show-check-box="false"
                       :show-operation-column="true"
                       :height="'100%'" table-size="small" table-width="100% !important">
            <template #table_operation="{scope}">
              <template v-if="!scope.row['reserved']">
                <el-button type="primary" link size="small" icon="el-icon-edit" @click="editTableData(scope.row)">修改</el-button>
                <el-button type="primary" link size="small" icon="el-icon-delete-solid" @click="deleteTableData(scope.row)">删除</el-button>
              </template>
            </template>
          </SimpleTable>
        </div>

      </el-main>

      <el-footer>
        <div style="height: 32px; line-height: 32px; font-size: 13px; background-color: white">
          字段列表：当前实体共 {{tableData.length}} 个字段</div>
      </el-footer>

      <el-dialog title="修改名称字段" v-model="showNameFieldDialogFlag" v-if="showNameFieldDialogFlag"
                 :append-to-body="true" :destroy-on-close="true" class="name-field-dialog" width="460px">
        <div class="name-field-hint"><i class="el-icon-bell"></i>提示：只有文本(Text)类型字段可设置为名称字段。</div>
        <SimpleTable :show-pagination="false" :show-check-box="false" :table-size="'small'"
                     :show-operation-column="true"
                     :columns="nameFieldColumns" :data="nameFieldData" :max-height="420">
          <template #table_operation="{scope}">
            <el-button v-if="!scope.row.nameFieldFlag" class="" icon="el-icon-check"
                       @click="selectNameField(scope.row)">选择</el-button>
            <el-button v-else :disabled="true">当前名称字段</el-button>
          </template>
        </SimpleTable>
      </el-dialog>

      <el-dialog :title="'新建字段 / ' + curEditorType" v-model="showNewFieldDialogFlag" v-if="showNewFieldDialogFlag"
                 :show-close="true" :destroy-on-close="true" :close-on-click-modal="false"
                 :close-on-press-escape="false" class="no-padding" width="620px">
        <component :is="curFWEditor" :entity="entity" @fieldSaved="onFieldSaved" @cancelSave="onCancelSaveField"
                   :showingInDialog="true"></component>
      </el-dialog>

      <el-dialog :title="'编辑字段 / ' + curEditorType" v-model="showEditFieldDialogFlag" v-if="showEditFieldDialogFlag"
                 :show-close="true" :destroy-on-close="true" :close-on-click-modal="false"
                 :close-on-press-escape="false" class="no-padding" width="620px">
        <component :is="curFWEditor" :entity="entity" @fieldSaved="onFieldSaved" @cancelSave="onCancelSaveField"
                   :showingInDialog="true" :field-name="editingFieldName" :field-state="2"></component>
      </el-dialog>

      <el-dialog title="编辑实体属性" v-model="showEntityPropsDialogFlag" v-if="showEntityPropsDialogFlag"
                 :show-close="false" :close-on-click-modal="false" :close-on-press-escape="false"
                 :destroy-on-close="true">
        <EntityPropEditor ref="EPEditor" :entityProps="entityProps" :show-title="false"
                          :filter-entity-method="filterMainEntity"></EntityPropEditor>
        <template #footer>
          <div class="dialog-footer">
            <el-button type="primary" @click="saveEntity" size="small">保 存</el-button>
            <el-button @click="cancelSaveEntity" size="small">取 消</el-button>
          </div>
        </template>
      </el-dialog>
    </el-container>
  </el-container>
</template>

<script>
  import {
    getEntityProps, getFieldListOfEntity, getEntitySet, updateEntityLabel, getTextFieldList,
    updateEntityNameField, fieldCanBeDeleted, deleteField, fieldCanBeEdited
  } from '@/api/system-manager'
  import {formatBooleanColumn, isEmptyStr, copyNew} from '@/utils/util'
  import EntityPropEditor from "@/views/system/entity-editor/entity-property-editor";
  import { ElMessage  } from "element-plus";
  import BooleanWE from '@/views/system/field-editor/boolean-widget-editor';
  import IntegerWE from '@/views/system/field-editor/integer-widget-editor';
  import DecimalWE from '@/views/system/field-editor/decimal-widget-editor';
  import PercentWE from '@/views/system/field-editor/percent-widget-editor';
  import MoneyWE from '@/views/system/field-editor/money-widget-editor';
  //
  import TextWE from '@/views/system/field-editor/text-widget-editor';
  import EmailWE from '@/views/system/field-editor/email-widget-editor';
  import UrlWE from '@/views/system/field-editor/url-widget-editor';
  import TextAreaWE from '@/views/system/field-editor/textarea-widget-editor';
  import PasswordWE from '@/views/system/field-editor/password-widget-editor';
  //
  import OptionWE from '@/views/system/field-editor/option-widget-editor';
  import TagWE from '@/views/system/field-editor/tag-widget-editor';
  //
  import DateWE from '@/views/system/field-editor/date-widget-editor';
  import DateTimeWE from '@/views/system/field-editor/datetime-widget-editor';
  //
  import PictureWE from '@/views/system/field-editor/picture-widget-editor';
  import FileWE from '@/views/system/field-editor/file-widget-editor';
  //
  import ReferenceWE from '@/views/system/field-editor/reference-widget-editor';
  import AnyReferenceWE from '@/views/system/field-editor/anyreference-widget-editor';
  import ReferenceListWE from '@/views/system/field-editor/referencelist-widget-editor';

  export default {
    name: "EntityFieldTable",
    props: {
      entity: {
        type: String,
        default: null
      },
    },
    components: {
      EntityPropEditor,
      BooleanWE,
      IntegerWE,
      DecimalWE,
      PercentWE,
      MoneyWE,
      TextWE,
      EmailWE,
      UrlWE,
      TextAreaWE,
      PasswordWE,
      OptionWE,
      TagWE,
      DateWE,
      DateTimeWE,
      PictureWE,
      FileWE,
      ReferenceWE,
      AnyReferenceWE,
      ReferenceListWE,
    },
    data() {
      return {
        columns: [
          {prop: 'name', label: '字段名称', width: '130', align: 'left', fixed: true},
          {prop: 'label', label: '显示名称', align: 'center'},
          {prop: 'physicalName', label: '数据库字段名', align: 'left'},
          {prop: 'type', label: '字段类型', width: '100', align: 'left'},
          {prop: 'referTo', label: '引用实体', width: '120', align: 'center'},
          {prop: 'idFieldFlag', label: '主键字段', width: '70', align: 'center', formatter: formatBooleanColumn},
          {prop: 'nameFieldFlag', label: '名称字段', width: '70', align: 'center', formatter: formatBooleanColumn},
          {prop: 'mainDetailFieldFlag', label: '主从字段', width: '70', align: 'center', formatter: formatBooleanColumn},
          {prop: 'reserved', label: '系统字段', width: '70', align: 'center', formatter: formatBooleanColumn},
        ],
        tableData: [],
        filteredData: [],
        searchText: '',
        tableHeight: 100,

        curFWEditor: '',
        curEditorType: '',
        showNameFieldDialogFlag: false,
        showNewFieldDialogFlag: false,
        showEditFieldDialogFlag: false,
        showEntityPropsDialogFlag: false,
        editingFieldName: null,

        nameFieldColumns: [
          {prop: 'name', label: '字段名称', width: '148', align: 'left', fixed: true},
          {prop: 'label', label: '显示名称', width: '148', align: 'center'},
        ],
        nameFieldData: [],

        entityProps: {
          name: 'Account',
          label: '客户',
          entityCode: 0,
          physicalName: '',
          nameField: '',
          detailEntityFlag: false,
          mainEntity: '',
          layoutable: true,
          listable: true,
          authorizable: false,
          assignable: false,
          shareable: false,
        }
      }
    },
    mounted() {
      // this.$nextTick(() => {
      //   this.resizeTableHeight()
      // })
      // window.onresize = () => {
      //   this.resizeTableHeight()
      // }

      this.initPageData()
    },
    methods: {
      resizeTableHeight() {  /* table自适应高度 */
        this.tableHeight = this.$refs.tableContainer.$el.offsetHeight - 42 + 42/*覆盖表格页脚高度*/
      },

      initEntityProps() {
        getEntityProps(this.entity).then(res => {
          if (res.error != null) {
            this.$message({message: res.error, type: 'error'})
            return
          }

          this.entityProps = res.data
        }).catch(res => {
          this.$message({message: res.message, type: 'error'})
        })
      },

      initPageData() {
        this.initEntityProps()
        this.initTableData()
      },

      initTableData() {
        getFieldListOfEntity(this.entity).then(res => {
          if (res.error != null) {
            this.$message({message: res.error, type: 'error'})
            return
          }

          this.tableData = res.data
          this.filteredData = copyNew(this.tableData)
          this.searchText = ''
        }).catch(res => {
          this.$message({message: res.message, type: 'error'})
        })
      },

      handleNewFieldCommand(command) {
        this.curFWEditor = command
        this.curEditorType = command.replace(/WE$/, '')
        this.showNewFieldDialogFlag = true
      },

      editTableData(row) {
        if (!!row.type) {
          fieldCanBeEdited(row.name, this.entity).then(res => {
            if (res.error != null) {
              this.$message({message: res.error, type: 'error'})
              return
            }

            if (res.data !== true) {
              this.$message.info('提示：系统字段/保留字段不能编辑！')
              return
            }

            this.curEditorType = row.type
            this.curFWEditor = row.type + 'WE'
            this.editingFieldName = row.name
            this.showEditFieldDialogFlag = true
          }).catch(res => {
            this.$message({ message: res.message, type: 'error' })
          })
        }
      },

      deleteTableData(row) {
        if (!!this.entity && !!row.type && !!row.name) {
          fieldCanBeDeleted(row.name, this.entity).then(res => {
            if (res.error != null) {
              this.$message({ message: res.error, type: 'error' })
              return
            }

            if (res.data !== true) {
              this.$message.info('提示：系统字段/保留字段不能被删除！')
              return
            }

            let confirmText = ['字段删除后不能恢复，是否确认删除?', '1. 删除字段会清空该字段的所有数据，且不能恢复；’',
              '2. 删除字段不会同步更新表单和列表，请手工从表单布局和列表中移除；']
            const h = this.$createElement
            let pTags = []
            confirmText.forEach(ct => {
              pTags.push(h('p', null, ct))
            })
            this.$confirm('删除提醒', {
              message: h('div', null, pTags),
              showCancelButton: true,
              type: 'warning'
            }).then(() => {
              this.deleteField(row.name, this.entity)
            }).catch(() => {
              this.$message({type: 'info', message: '已取消删除'});
            });
          }).catch(res => {
            this.$message({ message: res.message, type: 'error' })
          })
        }
      },

      deleteField(field, entity) {
        deleteField(field, entity).then(res => {
          if (res.error != null) {
            this.$message({ message: res.error, type: 'error' })
            return
          }

          this.$message.success('字段已删除')
          this.initTableData()
        }).catch(res => {
          this.$message({ message: res.message, type: 'error' })
        })
      },

      onFieldSaved() {
        this.showNewFieldDialogFlag = false
        this.showEditFieldDialogFlag = false
        this.initTableData()
      },

      onCancelSaveField() {
        this.showNewFieldDialogFlag = false
        this.showEditFieldDialogFlag = false
      },

      filterMainEntity(filterList, callBack) {
        getEntitySet().then(res => {
          if (res.error != null) {
            this.$message({ message: res.error, type: 'error' })
            return
          }

          let entityItems = res.data
          filterList.length = 0  /* 清空数组，不能用filterList=[]，否则SimpleTable显示不出数据！！ */
          filterList = entityItems.filter( entity => {
            if (entity.detailEntityFlag === false) {
              filterList.push({name: entity.name, label: entity.label})
            }
          })

          callBack()
        }).catch(res => {
          this.$message({ message: res.message, type: 'error' })
        })
      },

      /*
      modifyEntity() {
        this.showEntityPropsDialogFlag = true
      },
      */

      saveEntity() {
        //
      },

      cancelSaveEntity() {
        this.initEntityProps()
        this.showEntityPropsDialogFlag = false
      },

      modifyEntityLabel() {
        this.$prompt('修改实体显示名称', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          inputValue: this.entityProps.label,
          inputPattern: /^[A-Za-z\u4e00-\u9fa5\d]+$/, /* 匹配由字母大小写、汉字或数字组成的字符串 */
          inputErrorMessage: '输入不正确'
        }).then(({ value }) => {
          updateEntityLabel(this.entityProps.name, value).then(res => {
            if (res.error != null) {
              this.$message({ message: res.error, type: 'error' })
              return
            }

            this.entityProps.label = value
            this.$message({ message: '修改成功', type: 'success' })
          }).catch(res => {
            this.$message({ message: res.message, type: 'error' })
          })
        }).catch(() => {
          ElMessage.info('已取消')
        })
      },

      modifyEntityNameField() {
        getTextFieldList(this.entityProps.name).then(res => {
          if (res.error != null) {
            this.$message({ message: res.error, type: 'error' })
            return
          }

          this.nameFieldData = res.data
          this.showNameFieldDialogFlag = true
        }).catch(res => {

        })
      },

      selectNameField(row) {
        updateEntityNameField(this.entityProps.name, row.name).then(res => {
          if (res.error != null) {
            this.$message({ message: res.error, type: 'error' })
            return
          }

          this.$message({ message: '修改成功', type: 'success' })
          this.entityProps.nameField = row.label
          this.showNameFieldDialogFlag = false
          this.initTableData()
        }).catch(res => {
          this.$message({ message: res.message, type: 'error' })
        })
      },

      searchTableData() {
        if (isEmptyStr(this.searchText)) {
          this.filteredData = copyNew(this.tableData)
          return
        }

        this.filteredData.length = 0
        this.filteredData = this.tableData.filter(item => {
          return item.name.toLowerCase().includes(this.searchText.toLowerCase()) ||
                 item.label.toLowerCase().includes(this.searchText.toLowerCase()) ||
                 item.physicalName.toLowerCase().includes(this.searchText.toLowerCase())
        })
      },

      clearTableSearch() {
        this.filteredData = copyNew(this.tableData)
      },

    }
  }
</script>

<style lang="scss" scoped>
  .el-container.hidden-x-scrollbar {
    overflow-x: hidden;  /* 注意：IE浏览器中会出现水平滚动条，暂未找到原因！！ */
  }

  .entity-property {
    font-size: 12px;

    .entity-property-header {
      font-size: 14px;
      text-align: center;
      height: 54px;
      line-height: 54px;
      border-bottom: 1px dashed #eeeeee;
    }

    .entity-property-form {
      padding: 16px;
    }

    :deep(.el-input) > input {
      border-width: 0;
      text-align: right;
      /*border-bottom: 1px #cac6c6 solid;*/
    }
  }

  :deep(.el-main) {
    padding: 0;
  }

  .el-aside {
    background-color: #ffffff;
  }

  .props-scrollbar {
    height: 100%;

    :deep(.el-scrollbar__wrap) {
      overflow-x: hidden;
      overflow-y: auto;  /* TODO: 待解决问题——IE浏览器垂直方向会生成两个滚动条：虚拟滚动条和真实滚动条 */
      /*overflow-y: hidden;*/
    }
  }

  .left-props-panel {
    width: 300px;
    height: 100%;
    margin-right: 0;
    border-right: 2px dotted #EBEEF5;
  }

  .list-search-panel {
    height: 62px !important;
    line-height: 62px;
    border-left: 1px solid #EBEEF5;
    margin-bottom: 0;
    justify-content: space-between;
  }

  .list-search-panel:after {
    content: "";
    display: block;
    clear: both;
  }

  .search-panel-left {
    display: flex;
    float: left;
  }

  .search-panel-right {
    float: right;
    width: 360px;

    /* 解决IE浮动元素垂直居中问题 begin */
    position: relative;
    height: 62px;

    :deep(.el-input.v-middle) {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
    /* end */
  }

  :deep(.el-table th.gutter) { /* 解决表头与内容列不对齐差1个像素的问题！！ */
    display: table-cell !important;
  }

  .name-field-dialog {
    .name-field-hint {
      font-size: 12px;
      color: #999999;
      margin: 0 10px 10px 0;
    }

    :deep(.el-dialog__header) {
      padding: 15px;
      padding-bottom: 3px;
    }

    :deep(.el-dialog__body) {
      padding: 6px;
    }
  }
</style>
