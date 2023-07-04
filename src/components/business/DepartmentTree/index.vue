<template>
  <el-tree
          :data="treeData"
          show-checkbox
          default-expand-all
          node-key="id"
          ref="tree"
          highlight-current
          :props="defaultProps">
  </el-tree>
</template>

<script>
  import { getDepartmentTree } from '@/api/user'

  export default {
    name: "DepartmentTree",
    data() {
      return {
        treeData: [],
        defaultProps: {
          children: 'children',
          label: 'label'
        },
      }
    },
    mounted() {
      this.initTree()
    },
    methods: {
      initTree() {
        getDepartmentTree().then(res => {
          if (res.error != null) {
            this.$message({message: res.error, type: 'error'})
          } else {
            this.treeData = res.data
          }
        }).catch(res => {
          this.$message({message: res.message, type: 'error'})
        })
      }
    }
  }
</script>

<style scoped>

</style>
