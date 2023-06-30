<template>
  <el-container>
    <el-aside width="380px">
      <div class="fields-list">
        <div class="fields-list-header">&lt;多选项&gt;字段列表</div>
        <div>
          <ul v-for="(tflItem, idx) in tagFieldList" :key="idx" class="entity-item">{{tflItem.entityLabel}}
            <li v-for="(flItem, flIdx) in tflItem.fieldList" :key="flIdx" class="field-item">
              <el-button type="text" @click="selectTagField(tflItem.entityName, flItem.fieldName)">
                {{flItem.fieldLabel}}</el-button></li>
          </ul>
        </div>
      </div>
    </el-aside>

    <el-container class="main-container">
      <el-header class="props-action-section">操作区</el-header>

      <el-main style="margin: 0 auto">
        <el-form v-if="!!curTagField" label-width="45%" style="width: 620px">
          <el-card class="box-card" shadow="never">
            <template #header>
              <div class="clear-fix">
                <span>选项管理</span>
                <el-button style="float: right; padding: 3px 0" type="text" @click="addTag">新增选项</el-button>
              </div>
            </template>
            <div class="clear-fix">(空值)</div>
            <div v-for="(tagItem, idx) in tagItems" :key="idx" class="clear-fix" @mouseenter="hoverIdx = idx"
                 @mouseleave="hoverIdx = -1">
              {{tagItem.value}}
              <div class="tag-item" v-show="!!tagItem.value && (hoverIdx === idx)">
                <el-button type="text" class="tag-item-insert" title="插入" icon="el-icon-plus"
                           @click="insertTag(idx)"></el-button>
                <el-button type="text" class="tag-item-up" title="上移" icon="el-icon-top"
                           @click="upTag(idx)"></el-button>
                <el-button type="text" class="tag-item-down" title="下移" icon="el-icon-bottom"
                           @click="downTag(idx)"></el-button>
                <el-button type="text" class="tag-item-edit" title="编辑" icon="el-icon-edit"
                           @click="editTag(idx)"></el-button>
                <el-button type="text" class="tag-item-delete" title="删除" icon="el-icon-delete"
                           @click="deleteTag(idx)"></el-button>
              </div>
            </div>
          </el-card>
          <hr style="border: 0;border-top: 1px dotted #cccccc" />
          <el-form-item>
            <el-button type="primary" size="medium" style="width: 120px;" @click="saveTags">保 存</el-button>
          </el-form-item>
        </el-form>
        <div v-else>请选择左侧选项字段</div>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
  import { getTagFields, getTagItems, saveTagItems } from '@/api/system-manager'

  export default {
    name: "TagManager",
    data() {
      return {
        tagFieldList: [],
        curEntity: null,
        curTagField: null,
        tagItems: [],
        hoverIdx: -1,
      }
    },
    mounted() {
      this.initTagFields()
    },
    methods: {
      initTagFields() {
        getTagFields().then(res => {
          if (res.error != null) {
            this.$message({ message: res.error, type: 'error' })
            return
          } else {
            this.tagFieldList = res.data
            //console.log(res.data)
          }
        }).catch(res => {
          this.$message({ message: res.message, type: 'error' })
        })
      },

      selectTagField(entityName, fieldName) {
        this.curEntity = entityName
        this.curTagField = fieldName
        getTagItems(entityName, fieldName).then(res => {
          if (res.error != null) {
            this.$message({ message: res.error, type: 'error' })
            return
          } else {
            this.tagItems = res.data
          }
        }).catch(res => {
          this.$message({ message: res.message, type: 'error' })
        })
      },

      validateTag(tagTxt, tagIdx) {
        let result = true
        this.tagItems.forEach((item, idx) => {
          if ((item.label === tagTxt) && (idx !== tagIdx))
              // return false  /* forEach中return语句只是终止当前循环进行下一次循环，不能直接跳出函数返回函数结果！！ */
            result = false
        })
        return result
      },

      addTag() {
        this.$prompt('请输入选项名称', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          inputPattern: /^[A-Za-z\u4e00-\u9fa5\d]+$/, /* 匹配由字母大小写、汉字或数字组成的字符串 */
          inputErrorMessage: '输入不正确'
        }).then(({ value }) => {
          if (this.validateTag(value, -1)) {
            let newTag = {'label': value, 'value': value, 'saved': false}
            this.tagItems.push(newTag)
            this.$nextTick(() => {
              console.log('Updated!')
            })
          } else {
            this.$message.warning('选项已存在')
          }
        }).catch(() => {
          this.$message.info('已取消')
        })
      },

      insertTag(tagIdx) {
        this.$prompt('请输入选项名称', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          inputPattern: /^[A-Za-z\u4e00-\u9fa5\d]+$/, /* 匹配由字母大小写、汉字或数字组成的字符串 */
          inputErrorMessage: '输入不正确'
        }).then(({ value }) => {
          if (this.validateTag(value, -1)) {
            let newTag = {'label': value, 'value': value, 'saved': false}
            this.tagItems.splice(tagIdx + 1, 0, newTag)
            this.$nextTick(() => {
              console.log('Updated!')
            })
          } else {
            this.$message.warning('选项已存在')
          }
        }).catch(() => {
          this.$message.info('已取消')
        })
      },

      upTag(tagIdx) {
        if (tagIdx === 0) {
          this.$message.info('已到最上')
          return
        }

        let tempTag = this.tagItems[tagIdx]
        this.$set(this.tagItems, tagIdx, this.tagItems[tagIdx - 1])
        this.$set(this.tagItems, tagIdx - 1, tempTag)
      },

      downTag(tagIdx) {
        console.log('length: ' + this.tagItems.length + ', current idx: '+ tagIdx)
        if (tagIdx === (this.tagItems.length -1)) {
          this.$message.info('已到最下')
          return
        }

        let tempTag = this.tagItems[tagIdx]
        this.$set(this.tagItems, tagIdx, this.tagItems[tagIdx + 1])
        this.$set(this.tagItems, tagIdx + 1, tempTag)
      },

      editTag(tagIdx) {
        let oldTagLabel = this.tagItems[tagIdx].label
        this.$prompt('请修改选项名称', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          inputValue: oldTagLabel,
          inputPattern: /^[A-Za-z\u4e00-\u9fa5\d]+$/, /* 匹配由字母大小写、汉字或数字组成的字符串 */
          inputErrorMessage: '输入不正确'
        }).then(({ value }) => {
          if (this.validateTag(value, oldTagLabel)) {
            this.tagItems[tagIdx].label = value
            this.$nextTick(() => {
              console.log('Updated!')
            })
          } else {
            this.$message.warning('选项已存在')
          }
        }).catch(() => {
          this.$message.info('已取消')
        })
      },

      deleteTag(tagIdx) {
        console.log(tagIdx)
        this.$confirm('确定删除该选项?', '提示').then(() => {
          this.tagItems.splice(tagIdx, 1)
          this.$message.info('选项已删除')
        }).catch(() => {
          this.$message.info('取消删除')
        })
      },

      saveTags() {
        saveTagItems(this.curEntity, this.curTagField, this.tagItems).then(res => {
          if (res.error != null) {
            this.$message({ message: res.error, type: 'error' })
            return
          } else {
            this.$message.success('保存成功')
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

    .tag-item {
      float: right;
      height: 22px;
      line-height: 22px;
      position: relative;

      .tag-item-insert {
        position: absolute;
        top: -8px;
        left: -100px;
      }

      .tag-item-up {
        position: absolute;
        top: -6px;
        left: -86px;
      }

      .tag-item-down {
        position: absolute;
        top: -7px;
        left: -66px;
      }

      .tag-item-edit {
        position: absolute;
        top: -7px;
        left: -42px;
      }

      .tag-item-delete {
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
