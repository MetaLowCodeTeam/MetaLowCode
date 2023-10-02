<template>
  <el-form-item label="可全屏" v-if="optionModel.showHeader">
    <el-switch v-model="optionModel.showFullscreen"></el-switch>
    
  </el-form-item>
</template>

<script>
  export default {
    name: "showFullscreen-editor",
    props: {
      designer: Object,
      selectedWidget: Object,
      optionModel: Object,
    },

  }
</script>

<style scoped>

</style>
