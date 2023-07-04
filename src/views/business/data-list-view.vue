<template>
  <el-container direction="horizontal">
    <data-list :entity="entity" ></data-list>
  </el-container>
</template>

<script>
  import DataList from '@/components/business/DataList'

  export default {
    name: "DataListView",
    components: { DataList },
    props: {
      entity: {
        type: String,
        //default: 'Account'
      },
    },

  }
</script>

<style lang="scss" scoped>
  .el-container {
    width: 100% !important;
    overflow-x: hidden;  /* 注意：IE浏览器中会出现水平滚动条，暂未找到原因！！ */
  }
</style>
