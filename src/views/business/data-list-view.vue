<template>
  <el-container direction="horizontal">
    <data-list :entity="entity" ></data-list>
  </el-container>
</template>

<script>
  import DataList from '@/components/business/DataList/index.vue'

  export default {
    name: "DataListView",
    components: { DataList },
    data(){
        return {
            entity:"",
        }
    },
    created(){
        this.entity = this.$route.query.entity;
    }
  }
</script>

<style lang="scss" scoped>
  .el-container {
    width: 100% !important;
    overflow-x: hidden;  /* 注意：IE浏览器中会出现水平滚动条，暂未找到原因！！ */
  }
</style>
