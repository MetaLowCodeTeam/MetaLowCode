<template>
  <v-form-designer ref="vfDesigner" :designer-config="designerConfig" :field-list-data="fieldListData"
                   class="visual-design">
    <!-- 配置工具按钮 -->
    <template #customToolButtons>
      <el-button type="primary" link @click="quickDesign"><el-icon><MagicStick /></el-icon>一键生成</el-button>
      <el-button type="primary" link @click="saveDesign"><el-icon><Finished /></el-icon>保存设计</el-button>
    </template>
  </v-form-designer>
</template>

<script>
import {createFormLayout, updateFormLayout, getFormLayout, getMDFieldList} from '@/api/system-manager'

export default {
  name: "form-design",
  prop: {
    entity: {
      type: String,
    },
    entityLabel: {
      type: String
    }
  },
  data() {
    return {
      designerConfig: {
        formTemplates: false,
        logoHeader: false,
        exportCodeButton: false,
        generateSFCButton: false,
        toolbarMaxWidth: 300,
      },
      fieldListData: {},
      layoutId: null,
    }
  },
  created() {
    this.entity = this.$route.query.entity
    this.entityLabel = this.$route.query.entityLabel
  },
  mounted() {
    this.loadDesign()
    this.loadFieldListData()
  },
  methods: {
    quickDesign() {
      this.$message.info('待实现...')
    },

    loadFieldListData() {
      getMDFieldList(this.entity).then(res => {
        if (res.data.fieldList) {
          this.fieldListData.fieldList = res.data.fieldList
          if (res.data.subFormList) {
            this.fieldListData.subFormList = res.data.subFormList
          }
          this.$refs.vfDesigner.setFieldListData(this.fieldListData)
        }
      }).catch(res => {
        this.$message({ message: res.message, type: 'error' })
      })
    },

    loadDesign() {
      getFormLayout(this.entity).then(res => {
        if (res.error != null) {
          this.$message({ message: res.error, type: 'error' })
          return
        }

        if ((!!res.data) && (!!res.data.layoutJson)) {
          this.$refs.vfDesigner.setFormJson(res.data.layoutJson)
        } else {
          this.$refs.vfDesigner.clearDesigner()
        }
      }).catch(res => {
        this.$message({ message: res.message, type: 'error' })
      })
    },

    saveDesign() {
      if (!this.layoutId) {
        createFormLayout(this.entity, this.$refs.vfDesigner.getFormJson()).then(res => {
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
        updateFormLayout(this.layoutId, this.$refs.vfDesigner.getFormJson()).then(res => {
          if (res.error != null) {
            this.$message({message: res.error, type: 'error'})
          } else {
            this.$message.success('保存成功')
          }
        }).catch(res => {
          this.$message({message: res.message, type: 'error'})
        })
      }
    },

  }
}
</script>

<style scoped>
  :deep(.toolbar-header .toolbar-container) {
    width: 100%;
  }

</style>
<style>
  .main-container.visual-design li {
    box-sizing: content-box !important;
  }

  .ds-setting-drawer .el-drawer__body {
	  padding: 20px !important;
  }

</style>
