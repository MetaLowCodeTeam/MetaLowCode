<template>
  <el-container>
    <el-aside width="380px">
      <div class="fields-list">
        <div class="fields-list-header">&lt;单选项&gt;字段列表</div>
        <div>
          <ul v-for="(oflItem, idx) in optionFieldList" :key="idx" class="entity-item">{{oflItem.entityLabel}}
            <li v-for="(flItem, flIdx) in oflItem.fieldList" :key="flIdx" class="field-item">
              <el-button link type="primary" @click="selectOptionField(oflItem.entityName, flItem.fieldName)">
                {{flItem.fieldLabel}}</el-button></li>
          </ul>
        </div>
      </div>
    </el-aside>

    <el-container class="main-container">
      <el-header class="props-action-section">操作区</el-header>

      <el-main style="margin: 0 auto">
        <el-form v-if="!!curOptionField" label-width="45%" style="width: 620px">
          <el-card class="box-card" shadow="never">
            <template #header>
              <div class="clear-fix">
                <span>选项管理</span>
                <el-button style="float: right; padding: 3px 0" link type="primary" @click="addOption">新增选项</el-button>
              </div>
            </template>
            <div class="clear-fix">(空值)</div>
            <div v-for="(optionItem, idx) in optionItems" :key="idx" class="clear-fix" @mouseenter="hoverIdx = idx"
                 @mouseleave="hoverIdx = -1">
              {{optionItem.label}}
              <div class="option-item" v-show="!!optionItem.value && (hoverIdx === idx)">
                <el-button link type="primary" class="option-item-insert" title="插入" icon="el-icon-plus"
                           @click="insertOption(idx)"></el-button>
                <el-button link type="primary" class="option-item-up" title="上移" icon="el-icon-top"
                           @click="upOption(idx)"></el-button>
                <el-button link type="primary" class="option-item-down" title="下移" icon="el-icon-bottom"
                           @click="downOption(idx)"></el-button>
                <el-button link type="primary" class="option-item-edit" title="编辑" icon="el-icon-edit"
                           @click="editOption(idx)"></el-button>
                <el-button link type="primary" class="option-item-delete" title="删除" icon="el-icon-delete"
                           @click="deleteOption(idx)"></el-button>
              </div>
            </div>
          </el-card>
          <hr style="border: 0;border-top: 1px dotted #cccccc" />
          <el-form-item>
            <el-button type="primary" style="width: 120px;" @click="saveOptions">保 存</el-button>
          </el-form-item>
        </el-form>
        <div v-else>请选择左侧选项字段</div>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
  import { getOptionFields, getOptionItems, saveOptionItems } from '@/api/system-manager'

  export default {
    name: "OptionManager",
    data() {
      return {
        optionFieldList: [],
        curEntity: null,
        curOptionField: null,
        optionItems: [],
        hoverIdx: -1,
      }
    },
    mounted() {
      this.initOptionFields()
    },
    methods: {
      initOptionFields() {
        getOptionFields().then(res => {
          if (res.error != null) {
            this.$message({ message: res.error, type: 'error' })
            return
          } else {
            this.optionFieldList = res.data
            //console.log(res.data)
          }
        }).catch(res => {
          this.$message({ message: res.message, type: 'error' })
        })
      },

      selectOptionField(entityName, fieldName) {
        this.curEntity = entityName
        this.curOptionField = fieldName
        getOptionItems(entityName, fieldName).then(res => {
          if (res.error != null) {
            this.$message({ message: res.error, type: 'error' })
            return
          }

          this.optionItems = res.data
        }).catch(res => {
          this.$message({ message: res.message, type: 'error' })
        })
      },

      validateOption(optionTxt, optionIdx) {
        let result = true
        this.optionItems.forEach((item, idx) => {
          if ((item.label === optionTxt) && (idx !== optionIdx))
              // return false  /* forEach中return语句只是终止当前循环进行下一次循环，不能直接跳出函数返回函数结果！！ */
            result = false
        })
        return result
      },

      getOptionMaxValue() {
        let maxValue = 0
        this.optionItems.forEach((item, idx) => {
          if (item.value > maxValue) {
            maxValue = item.value
          }
        })
        return maxValue
      },

      addOption() {
        this.$prompt('请输入选项名称', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          inputPattern: /^[A-Za-z\u4e00-\u9fa5\d]+$/, /* 匹配由字母大小写、汉字或数字组成的字符串 */
          inputErrorMessage: '输入不正确'
        }).then(({ value }) => {
          if (this.validateOption(value, -1)) {
            let newOptionValue = this.getOptionMaxValue() + 1
            let newOption = {'label': value, 'value': newOptionValue, 'saved': false}
            this.optionItems.push(newOption)
            this.$nextTick(() => {
              console.log('Updated!')
            })
          } else {
            this.$message.warning('选项已存在')
          }
        }).catch(() => {
          ElMessage.info('已取消')
        })
      },

      insertOption(optionIdx) {
        this.$prompt('请输入选项名称', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          inputPattern: /^[A-Za-z\u4e00-\u9fa5\d]+$/, /* 匹配由字母大小写、汉字或数字组成的字符串 */
          inputErrorMessage: '输入不正确'
        }).then(({ value }) => {
          if (this.validateOption(value, -1)) {
            let newOptionValue = this.getOptionMaxValue() + 1
            let newOption = {'label': value, 'value': newOptionValue, 'saved': false}
            this.optionItems.splice(optionIdx + 1, 0, newOption)
            this.$nextTick(() => {
              console.log('Updated!')
            })
          } else {
            this.$message.warning('选项已存在')
          }
        }).catch(() => {
          ElMessage.info('已取消')
        })
      },

      upOption(optionIdx) {
        if (optionIdx === 0) {
          this.$message.info('已到最上')
          return
        }

        let tempOption = this.optionItems[optionIdx]
        this.$set(this.optionItems, optionIdx, this.optionItems[optionIdx - 1])
        this.$set(this.optionItems, optionIdx - 1, tempOption)
      },

      downOption(optionIdx) {
        console.log('length: ' + this.optionItems.length + ', current idx: '+ optionIdx)
        if (optionIdx === (this.optionItems.length -1)) {
          this.$message.info('已到最下')
          return
        }

        let tempOption = this.optionItems[optionIdx]
        this.$set(this.optionItems, optionIdx, this.optionItems[optionIdx + 1])
        this.$set(this.optionItems, optionIdx + 1, tempOption)
      },

      editOption(optionIdx) {
        let oldOptionLabel = this.optionItems[optionIdx].label
        this.$prompt('请修改选项名称', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          inputValue: oldOptionLabel,
          inputPattern: /^[A-Za-z\u4e00-\u9fa5\d]+$/, /* 匹配由字母大小写、汉字或数字组成的字符串 */
          inputErrorMessage: '输入不正确'
        }).then(({ value }) => {
          if (this.validateOption(value, optionIdx)) {
            this.optionItems[optionIdx].label = value
            this.$nextTick(() => {
              console.log('Updated!')
            })
          } else {
            this.$message.warning('选项已存在')
          }
        }).catch(() => {
          ElMessage.info('已取消')
        })
      },

      deleteOption(optionIdx) {
        console.log(optionIdx)
        this.$confirm('确定删除该选项?', '提示').then(() => {
          //TODO：后台需要检查改选项是否已被实体记录所引用！！
          this.optionItems.splice(optionIdx, 1)
          this.$message.info('选项已删除')
        }).catch(() => {
          this.$message.info('取消删除')
        })
      },

      saveOptions() {
        saveOptionItems(this.curEntity, this.curOptionField, this.optionItems).then(res => {
          if (res.error != null) {
            this.$message({ message: res.error, type: 'error' })
            return
          } else {
            this.$message.success('保存成功')
          }
        }).catch(res => {
          this.$message({ message: res.message, type: 'error' })
        })
      },
    }
  }
</script>

<style lang="scss" scoped>
  .main-container {
    min-width: 720px;
    border-left: 2px solid #eeeeee;
    background: #ffffff;
  }

  .el-aside {
    background-color: #ffffff;
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

  .el-header.props-action-section {
    font-size: 14px;
    text-align: center;
    border-bottom: 1px dashed #eeeeee;
    height: 55px !important;
    line-height: 55px !important;
  }

  ul.entity-item {
    font-size: 13px;
  }

  li.field-item {
    font-size: 12px;
    list-style: none;
  }

  .box-card {
    font-size: 14px;

    :deep(.el-card__body) {
      height: 220px;
      overflow: auto;
    }

    .option-item {
      float: right;
      height: 22px;
      line-height: 22px;
      position: relative;

      .option-item-insert {
        position: absolute;
        top: -8px;
        left: -100px;
      }

      .option-item-up {
        position: absolute;
        top: -6px;
        left: -86px;
      }

      .option-item-down {
        position: absolute;
        top: -7px;
        left: -66px;
      }

      .option-item-edit {
        position: absolute;
        top: -7px;
        left: -42px;
      }

      .option-item-delete {
        position: absolute;
        top: -8px;
        left: -18px;
      }
    }
  }

  .clear-fix:before, .clear-fix:after {
    display: table;
    content: "";
  }

  .clear-fix:after {
    clear: both
  }
</style>
