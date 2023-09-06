<template>
  <v-form-designer ref="vfDesigner" :designer-config="designerConfig" class="visual-design">
    <!-- 配置工具按钮 -->
    <template #customToolButtons>
      <el-button type="primary" link @click="quickDesign"><el-icon><MagicStick /></el-icon>一键生成</el-button>
      <el-button type="primary" link @click="saveFormJson"><el-icon><Finished /></el-icon>保存设计</el-button>
    </template>
  </v-form-designer>
</template>

<script>
export default {
  name: "form-design",
  data() {
    return {
      designerConfig: {
        formTemplates: false,
        logoHeader: false,
        exportCodeButton: false,
        generateSFCButton: false,
        toolbarMaxWidth: 300,
      }
    }
  },
  methods: {
    quickDesign() {
      this.$message.info('待实现...')
    },

    saveFormJson() {
      this.$message.info('待实现...')
    },

  }
}
</script>

<style scoped>
  :deep(.toolbar-header .toolbar-container) {
    width: 100%;
  }

  /* TODO: 左右侧边栏收起按钮位置显示错误，待修复 */

</style>
<style>
  .main-container.visual-design li {
    box-sizing: content-box !important;
  }

</style>
