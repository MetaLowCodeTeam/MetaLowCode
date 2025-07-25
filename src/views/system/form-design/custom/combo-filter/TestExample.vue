<template>
  <div class="test-example">
    <el-card>
      <template #header>
        <h3>测试示例</h3>
      </template>
      
      <div class="example-section">
        <h4>预设示例数据</h4>
        <el-button @click="loadExample1" type="primary">
          加载示例1：简单条件
        </el-button>
        <el-button @click="loadExample2" type="success">
          加载示例2：嵌套条件组
        </el-button>
        <el-button @click="loadExample3" type="warning">
          加载示例3：复杂嵌套
        </el-button>
      </div>
      
      <div class="current-data">
        <h4>当前数据结构：</h4>
        <pre class="data-display">{{ JSON.stringify(currentData, null, 2) }}</pre>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// Props
const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({ root: { children: [] } })
  }
})

// Emits
const emit = defineEmits(['update:modelValue'])

// 当前数据
const currentData = ref(props.modelValue)

// 示例1：简单条件
const loadExample1 = () => {
  const example = {
    root: {
      children: [
        {
          id: 1,
          type: 'condition',
          connector: 'AND',
          field: 'name',
          operator: 'eq',
          value: '张三'
        },
        {
          id: 2,
          type: 'condition',
          connector: 'AND',
          field: 'age',
          operator: 'gt',
          value: '25'
        }
      ]
    }
  }
  currentData.value = example
  emit('update:modelValue', example)
}

// 示例2：嵌套条件组
const loadExample2 = () => {
  const example = {
    root: {
      childrenLogic: 'AND', // 根节点子节点之间使用 AND 逻辑
      children: [
        {
          id: 1,
          type: 'group',
          connector: 'AND',
          childrenLogic: 'OR', // 条件组内部使用 OR 逻辑
          children: [
            {
              id: 2,
              type: 'condition',
              field: 'name',
              operator: 'contains',
              value: '张'
            },
            {
              id: 3,
              type: 'condition',
              field: 'name',
              operator: 'contains',
              value: '李'
            }
          ]
        },
        {
          id: 4,
          type: 'condition',
          connector: 'AND',
          field: 'department',
          operator: 'eq',
          value: '技术部'
        }
      ]
    }
  }
  currentData.value = example
  emit('update:modelValue', example)
}

// 示例3：复杂嵌套
const loadExample3 = () => {
  const example = {
    root: {
      children: [
        {
          id: 1,
          type: 'group',
          connector: 'AND',
          children: [
            {
              id: 2,
              type: 'condition',
              connector: 'AND',
              field: 'age',
              operator: 'gte',
              value: '25'
            },
            {
              id: 3,
              type: 'condition',
              connector: 'AND',
              field: 'age',
              operator: 'lte',
              value: '35'
            }
          ]
        },
        {
          id: 4,
          type: 'group',
          connector: 'OR',
          children: [
            {
              id: 5,
              type: 'condition',
              connector: 'AND',
              field: 'department',
              operator: 'eq',
              value: '技术部'
            },
            {
              id: 6,
              type: 'group',
              connector: 'OR',
              children: [
                {
                  id: 7,
                  type: 'condition',
                  connector: 'AND',
                  field: 'position',
                  operator: 'contains',
                  value: '经理'
                },
                {
                  id: 8,
                  type: 'condition',
                  connector: 'OR',
                  field: 'salary',
                  operator: 'gt',
                  value: '10000'
                }
              ]
            }
          ]
        }
      ]
    }
  }
  currentData.value = example
  emit('update:modelValue', example)
}
</script>

<style scoped>
.test-example {
  margin-bottom: 20px;
}

.example-section {
  margin-bottom: 20px;
}

.example-section h4 {
  margin-bottom: 12px;
  color: #303133;
}

.example-section .el-button {
  margin-right: 12px;
  margin-bottom: 8px;
}

.current-data h4 {
  margin-bottom: 12px;
  color: #303133;
}

.data-display {
  background-color: #f5f7fa;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #dcdfe6;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 12px;
  line-height: 1.5;
  overflow-x: auto;
  max-height: 300px;
  overflow-y: auto;
}
</style>
