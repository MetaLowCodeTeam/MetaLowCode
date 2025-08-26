<template>
  <div class="combo-filter">
    <el-card class="filter-card">
      <template #header>
        <div class="card-header">
          <div class="header-info">
            <el-icon class="header-icon"><Filter /></el-icon>
            <span class="header-title">树形组合条件筛选器</span>
            <el-tag type="info" size="small">支持无限嵌套</el-tag>
          </div>
          <div class="header-actions">
            <el-dropdown @command="handleRootAddCommand">
              <el-button type="primary">
                <el-icon><Plus /></el-icon>
                添加根节点
                <el-icon class="el-icon--right"><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="condition">
                    <el-icon><Document /></el-icon>
                    添加条件
                  </el-dropdown-item>
                  <el-dropdown-item command="group">
                    <el-icon><Folder /></el-icon>
                    添加条件组
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
            <el-button @click="clearAll" :disabled="!rootNode.children?.length">
              <el-icon><Delete /></el-icon>
              清空所有
            </el-button>
          </div>
        </div>
      </template>

      <div class="filter-content">
        <div v-if="!rootNode.children || rootNode.children.length === 0" class="empty-state">
          <el-empty
            description="暂无筛选条件，点击上方按钮添加根节点"
            :image-size="100"
          >
            <el-button type="primary" @click="handleRootAddCommand('group')">
              <el-icon><Folder /></el-icon>
              创建第一个条件组
            </el-button>
          </el-empty>
        </div>

        <div v-else class="tree-container">
          <!-- 根节点子节点容器 -->
          <div class="root-children-container">
            <!-- 根节点逻辑选择器（垂直居中显示） -->
            <div class="root-logic-selector-wrapper">
            <el-select
              v-if="rootNode.children.length > 1"
              v-model="rootNode.childrenLogic"
              size="small"
              class="root-logic-selector"
              @change="onFilterChange"
            >
              <el-option label="AND" value="AND" />
              <el-option label="OR" value="OR" />
            </el-select>
            </div>

            <!-- 根节点子节点列表 -->
            <div class="root-children-list">
              <div
                v-for="(child, index) in rootNode.children"
                :key="child.id"
                class="root-child-item"
              >
                <!-- 子节点内容 -->
                <div class="root-child-content">
                  <FilterNode
                    :node-data="child"
                    :field-options="fieldOptions"
                    :operator-options="operatorOptions"
                    :depth="0"
                    :show-connector="false"
                    :can-remove="rootNode.children.length > 1"
                    @change="onFilterChange"
                    @remove="removeRootChild"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 结果预览 -->
      <div class="result-preview" v-if="preview">
        <el-divider content-position="left">
          <el-icon><View /></el-icon>
          筛选结果预览
        </el-divider>
        <el-card class="preview-card">
          <div class="preview-content">
            <div class="query-display">
              <div class="query-header">
                <el-text type="primary" size="large">生成的查询条件：</el-text>
                <el-button
                  size="small"
                  @click="copyQuery"
                  :disabled="!generateQueryString()"
                >
                  <el-icon><CopyDocument /></el-icon>
                  复制
                </el-button>
              </div>
              <el-text class="query-text">{{ generateQueryString() || '暂无有效条件' }}</el-text>
            </div>
            <div class="json-display">
              <div class="json-header">
                <el-text type="info">JSON 格式：</el-text>
                <el-button
                  size="small"
                  @click="copyJson"
                  :disabled="!hasValidData()"
                >
                  <el-icon><CopyDocument /></el-icon>
                  复制
                </el-button>
              </div>
              <pre class="json-code">{{ JSON.stringify(getFilterData(), null, 2) }}</pre>
            </div>
          </div>
        </el-card>
      </div>
    </el-card>
  </div>
</template>

<script>
import { ElMessage } from 'element-plus'
import FilterNode from './FilterNode.vue'

export default {
  name: 'ComboFilter',
  components: {
    FilterNode
  },
  props: {
    modelValue: {
      type: Object,
      default: () => ({ root: { children: [] } })
    },
    fieldOptions: {
      type: Array,
      default: () => [
        { label: '姓名', value: 'name' },
        { label: '年龄', value: 'age' },
        { label: '部门', value: 'department' },
        { label: '职位', value: 'position' },
        { label: '入职日期', value: 'joinDate' },
        { label: '薪资', value: 'salary' }
      ]
    },
    operatorOptions: {
      type: Array,
      default: () => [
        { label: '等于', value: 'eq' },
        { label: '不等于', value: 'ne' },
        { label: '包含', value: 'contains' },
        { label: '不包含', value: 'notContains' },
        { label: '大于', value: 'gt' },
        { label: '大于等于', value: 'gte' },
        { label: '小于', value: 'lt' },
        { label: '小于等于', value: 'lte' },
        { label: '为空', value: 'isEmpty' },
        { label: '不为空', value: 'isNotEmpty' }
      ]
    },
    preview: {
      type: Boolean,
      default: true
    }
  },
  emits: ['update:modelValue', 'change'],
  data() {
    return {
      idCounter: Date.now(),
      rootNode: {
        id: 'root',
        type: 'root',
        childrenLogic: 'AND',
        children: []
      }
    }
  },
  watch: {
    modelValue: {
      handler(newValue) {
        if (newValue && JSON.stringify(newValue) !== JSON.stringify(this.getFilterData())) {
          this.initializeData()
        }
      },
      deep: true
    }
  },
  created() {
    this.initializeData()
  },
  methods: {
    generateId() {
      return ++this.idCounter
    },
    initializeData() {
      if (this.modelValue?.root?.children?.length > 0) {
        this.rootNode = {
          ...this.modelValue.root,
          children: this.modelValue.root.children.map(child => this.assignIds(child))
        }
      } else {
        this.rootNode = {
          id: 'root',
          type: 'root',
          children: []
        }
      }
    },
    assignIds(node) {
      const newNode = {
        ...node,
        id: node.id || this.generateId()
      }
      if (newNode.children) {
        newNode.children = newNode.children.map(child => this.assignIds(child))
      }
      return newNode
    },
    handleRootAddCommand(command) {
      if (!this.rootNode.childrenLogic) {
        this.rootNode.childrenLogic = 'AND'
      }
      if (command === 'condition') {
        this.addRootCondition()
      } else if (command === 'group') {
        this.addRootGroup()
      }
    },
    addRootCondition() {
      const newCondition = {
        id: this.generateId(),
        type: 'condition',
        connector: 'AND',
        field: '',
        operator: '',
        value: ''
      }
      this.rootNode.children.push(newCondition)
      this.onFilterChange()
    },
    addRootGroup() {
      const newGroup = {
        id: this.generateId(),
        type: 'group',
        connector: 'AND',
        childrenLogic: 'AND',
        children: []
      }
      this.rootNode.children.push(newGroup)
      this.onFilterChange()
    },
    removeRootChild(childId) {
      const index = this.rootNode.children.findIndex(child => child.id === childId)
      if (index > -1) {
        this.rootNode.children.splice(index, 1)
        this.onFilterChange()
      }
    },
    clearAll() {
      this.rootNode.children = []
      this.onFilterChange()
    },
    generateQueryString() {
      return this.generateNodeQueryString(this.rootNode)
    },
    generateNodeQueryString(node) {
      if (!node.children || node.children.length === 0) return ''

      const childStrings = node.children
        .map((child) => {
          let childStr = ''
          if (child.type === 'condition') {
            if (child.field && child.operator) {
              let optValue = typeof child.value === 'string' ? `'${child.value}'` : child.value
              let operator = this.getOperatorLabel(child.operator)
              if (child.dbField.type === 'Reference') {
                if (optValue && optValue.id) {
                  optValue = `'${optValue.id}'`
                }

                if (child.operator === 'EQ') {
                  operator = 'REQ'
                } else if (child.operator === 'NEQ') {
                  operator = 'RNEQ'
                }
              }
              if(child.field.indexOf('subForm_') === 0) {
                let newField = child.field.split('_')[2];
                childStr = `RF.${operator}(rowModel, '${newField}', @optValue@)`
              }else {
                let newField = child.field;
                if(child.field.indexOf('container_') === 0) {
                    newField = child.field.split('_')[1];
                }
                childStr = `RF.${operator}(formModel, '${newField}', @optValue@)`
              }
              childStr = childStr.replace('@optValue@', optValue)
            }
          } else if (child.type === 'group') {
            const groupStr = this.generateNodeQueryString(child)
            if (groupStr) {
              childStr = child.children && child.children.length > 1 ? `(${groupStr})` : groupStr
            }
          }

          return childStr
        })
        .filter(str => str)

      if (childStrings.length > 1) {
        const logic = (node.childrenLogic === 'OR' ? '||' : '') || '&&'
        return childStrings.join(` ${logic} `)
      }

      return childStrings.join('')
    },
    getOperatorLabel(value) {
      const operator = this.operatorOptions.find(op => op.value === value)
      return operator ? operator.label : value
    },
    getFilterData() {
      return {
        root: this.cleanNode(this.rootNode)
      }
    },
    cleanNode(node) {
      const cleanedNode = { ...node }

      if (node.children) {
        cleanedNode.children = node.children
          .map(child => {
            if (child.type === 'condition') {
              return child.field && child.operator ? child : null
            } else if (child.type === 'group') {
              const cleanedChild = this.cleanNode(child)
              return cleanedChild.children && cleanedChild.children.length > 0 ? cleanedChild : null
            }
            return child
          })
          .filter(child => child !== null)
      }

      return cleanedNode
    },
    hasValidData() {
      const data = this.getFilterData()
      return data.root.children && data.root.children.length > 0
    },
    async copyQuery() {
      const query = this.generateQueryString()
      if (query) {
        try {
          await navigator.clipboard.writeText(query)
          ElMessage.success('查询条件已复制到剪贴板')
        } catch (err) {
          ElMessage.error('复制失败，请手动复制')
        }
      }
    },
    async copyJson() {
      const data = this.getFilterData()
      if (this.hasValidData()) {
        try {
          await navigator.clipboard.writeText(JSON.stringify(data, null, 2))
          ElMessage.success('JSON数据已复制到剪贴板')
        } catch (err) {
          ElMessage.error('复制失败，请手动复制')
        }
      }
    },
    onFilterChange() {
      const filterData = this.getFilterData();
      this.$emit('update:modelValue', filterData)
      this.$emit('change', filterData)
    }
  }
}
</script>

<style scoped>
.combo-filter {
  width: 100%;
}

.filter-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.header-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.header-icon {
  color: #409eff;
  font-size: 20px;
}

.header-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}



.header-actions {
  display: flex;
  gap: 12px;
}

.filter-content {
  min-height: 300px;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}

.tree-container {
  padding: 20px 0;
  position: relative;
}

/* 根节点子节点容器 */
.root-children-container {
  display: flex;
  align-items: stretch;
  gap: 8px;
  position: relative;

  :deep(.el-card__body) {
    padding: 10px !important;
  }

  :deep(.el-card__header) {
    padding: 10px !important;
  }
}

.root-logic-selector-wrapper {
  display: flex;
  align-items: center;
}

.root-logic-selector {
  width: 100px !important;
}

/* 根节点逻辑选择器（垂直居中） */
.root-children-logic-select {
  display: flex;
  align-items: center;
  position: relative;
  z-index: 10;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: 2px solid #667eea;
  border-radius: 12px;
  padding: 8px 12px;
  gap: 8px;
  box-shadow: 0 4px 12px rgba(102, 123, 234, 0.3);
  transform: rotate(-90deg);
  white-space: nowrap;
  width: auto;
}



.root-children-logic-select .el-input__wrapper {
  background-color: rgba(255, 255, 255, 0.95);
  border: none;
  border-radius: 6px;
  width: 80px;
}

/* 根节点子节点列表 */
.root-children-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.root-child-item {
  display: flex;
  align-items: center;
  position: relative;
}



/* 根节点子节点内容 */
.root-child-content {
  flex: 1;
  min-width: 0;
}

.result-preview {
  margin-top: 32px;
}

.preview-card {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border: none;
}

.preview-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.query-display,
.json-display {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.query-header,
.json-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.query-text {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  background-color: #fff;
  padding: 16px;
  border-radius: 8px;
  border: 2px solid #e4e7ed;
  word-break: break-all;
  line-height: 1.6;
  min-height: 50px;
  transition: border-color 0.3s;
}

.query-text:hover {
  border-color: #409eff;
}

.json-code {
  background-color: #fff;
  padding: 16px;
  border-radius: 8px;
  border: 2px solid #e4e7ed;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
  line-height: 1.5;
  overflow-x: auto;
  max-height: 400px;
  overflow-y: auto;
  transition: border-color 0.3s;
}

.json-code:hover {
  border-color: #67c23a;
}

/* 滚动条样式 */
.json-code::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.json-code::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.json-code::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.json-code::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 悬停效果 */



/* 响应式设计 */
@media (max-width: 768px) {
  .card-header {
    flex-direction: column;
    align-items: stretch;
  }

  .header-info {
    justify-content: center;
  }

  .header-actions {
    justify-content: center;
  }

  .query-header,
  .json-header {
    flex-direction: column;
    gap: 8px;
    align-items: stretch;
  }

  .tree-container {
    padding: 10px 0;
  }

  /* 移动端根节点布局调整 */
  .root-children-container {
    flex-direction: column;
    gap: 10px;
  }

  .root-logic-selector-wrapper {
    align-self: center;
    margin-bottom: 10px;
  }

  .root-logic-selector-wrapper {
    transform: none;
    padding: 6px 10px;
  }

  .root-children-logic-select {
    transform: none;
    width: 70px;
  }

  .root-tree-connector {
    display: none;
  }
}

/* 动画效果 */
.filter-content {
  transition: all 0.3s ease;
}

.tree-container {
  animation: fadeInUp 0.5s ease;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
