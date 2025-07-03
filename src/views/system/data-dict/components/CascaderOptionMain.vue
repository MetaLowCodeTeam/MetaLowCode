<template>
    <div class="cascader-option-main">
        <!-- 选项树 -->
        <div class="option-tree" v-loading="loading">
            <el-empty v-if="optionList.length === 0" description="暂无数据" />
            <el-tree
                v-else
                ref="treeRef"
                :data="optionList"
                :props="treeProps"
                node-key="value"
                highlight-current
                :expand-on-click-node="false"
                @node-click="handleNodeClick"
                @current-change="handleCurrentChange"
            >
                <template #default="{ node, data }">
                    <div class="tree-node">
                        <span class="node-label">{{ data.label }}</span>
                        <span class="node-value">({{ data.value }})</span>
                        <div class="node-actions">
                            <el-button 
                                type="primary" 
                                size="small" 
                                @click.stop="handleEdit(data, node)"
                            >
                                编辑
                            </el-button>
                            <el-button 
                                type="danger" 
                                size="small" 
                                @click.stop="handleDelete(data, node)"
                            >
                                删除
                            </el-button>
                        </div>
                    </div>
                </template>
            </el-tree>
        </div>

        <!-- 新建/编辑弹框 -->
        <ml-dialog
            v-model="dialogVisible"
            :title="dialogTitle"
            width="500px"
            :close-on-click-modal="false"
        >
            <el-form
                ref="formRef"
                :model="formData"
                :rules="formRules"
                label-width="100px"
            >
                <el-form-item label="父节点" prop="parentValue">
                    <el-input v-model="formData.parentLabel" disabled />
                </el-form-item>
                
                <el-form-item label="选项名称" prop="label">
                    <el-input
                        v-model="formData.label"
                        placeholder="请输入选项名称"
                        maxlength="50"
                        show-word-limit
                    />
                </el-form-item>
                
                <el-form-item label="选项值" prop="value">
                    <el-input
                        v-model="formData.value"
                        placeholder="请输入选项值"
                        maxlength="50"
                        show-word-limit
                    />
                </el-form-item>
                <el-form-item label="排序" prop="displayOrder">
                    <el-input-number v-model="formData.displayOrder" :min="0" :max="1000000" />
                </el-form-item>
            </el-form>
            
            <template #footer>
                <el-button @click="dialogVisible = false">取消</el-button>
                <el-button type="primary" @click="handleSubmit" :loading="submitLoading">
                    确定
                </el-button>
            </template>
        </ml-dialog>
    </div>
</template>

<script setup>
import { ref, reactive, computed, watch, nextTick } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';

const props = defineProps({
    mainList: {
        type: Array,
        default: () => []
    }
});

// 组件引用
const formRef = ref(null);
const treeRef = ref(null);

// 响应式数据
const loading = ref(false);
const submitLoading = ref(false);
const dialogVisible = ref(false);
const optionList = ref([]);
const currentEditNode = ref(null);
const currentKey = ref(null); // 保存当前选中节点的key

// 树配置
const treeProps = {
    children: 'children',
    label: 'label'
};

// 表单数据
const formData = reactive({
    parentValue: '',
    parentLabel: '',
    label: '',
    value: '',
    displayOrder: 0
});

// 父节点选项
const parentOptions = ref([
    { label: '根节点', value: '' }
]);

// 计算属性
const dialogTitle = computed(() => {
    return currentEditNode.value ? '编辑选项' : '新建选项';
});

// 表单验证规则
const formRules = {
    label: [
        { required: true, message: '请输入选项名称', trigger: 'blur' },
        { pattern: /^[^/]+$/, message: '选项名称不能包含 /', trigger: 'blur' }
    ],
    value: [
        { required: true, message: '请输入选项值', trigger: 'blur' },
        { pattern: /^[A-Za-z0-9]+$/, message: '选项值只能包含英文字母和数字，不能包含中文', trigger: 'blur' }
    ]
};

// 暴露方法给父组件
const openDialog = (data) => {
    if (data) {
        // 编辑模式
        currentEditNode.value = data;
        Object.assign(formData, {
            parentValue: data.parentValue || '',
            parentLabel: data.parentLabel || '根节点',
            label: data.label || '',
            value: data.value || ''
        });
    } else {
        // 新建模式
        currentEditNode.value = null;
        Object.assign(formData, {
            label: '',
            value: ''
        });
    }
    dialogVisible.value = true;
};

// 获取所有选项数据（用于重复性检查）
const getAllOptions = () => {
    const allOptions = [];
    const traverseOptions = (options, parentValue = '', parentLabel = '') => {
        options.forEach(option => {
            allOptions.push({
                ...option,
                parentValue,
                parentLabel
            });
            if (option.children && option.children.length > 0) {
                traverseOptions(option.children, option.value, option.label);
            }
        });
    };
    traverseOptions(optionList.value);
    return allOptions;
};

// 检查重复性
const checkDuplicate = (label, value, excludeIndex = -1) => {
    const allOptions = getAllOptions();
    for (let i = 0; i < allOptions.length; i++) {
        if (i === excludeIndex) continue;
        const option = allOptions[i];
        if (option.label === label) {
            return { isDuplicate: true, field: 'label', message: '选项名称已存在' };
        }
        if (option.value === value) {
            return { isDuplicate: true, field: 'value', message: '选项值已存在' };
        }
    }
    return { isDuplicate: false };
};

// 选中变化事件
const handleCurrentChange = (data, node) => {
    if (data) {
        formData.parentValue = data.value;
        formData.parentLabel = data.label;
        currentKey.value = data.value;
    } else {
        formData.parentValue = '';
        formData.parentLabel = '';
        currentKey.value = null;
    }
};

// 节点点击（只做业务逻辑，不操作选中）
const handleNodeClick = (data, node) => {
    // 可扩展业务逻辑
};

// 编辑选项
const handleEdit = (data, node) => {
    openDialog({
        ...data,
        parentValue: formData.parentValue || '',
        parentLabel: formData.parentLabel || ''
    });
};

// 删除选项
const handleDelete = async (data, node) => {
    try {
        await ElMessageBox.confirm('确定要删除这个选项吗？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        });
        // 从树中删除节点
        const parent = node.parent;
        const children = parent.data.children || parent.data;
        const index = children.findIndex(child => child.value === data.value);
        if (index !== -1) {
            children.splice(index, 1);
            ElMessage.success('删除成功');
            // 触发保存
            emit('save', optionList.value);
        }
    } catch (error) {
        // 用户取消删除
    }
};

// 提交表单
const handleSubmit = async () => {
    if (!formRef.value) return;
    try {
        await formRef.value.validate();
        // 检查重复性
        const duplicateCheck = checkDuplicate(
            formData.label, 
            formData.value, 
            currentEditNode.value
        );
        if (duplicateCheck.isDuplicate) {
            ElMessage.error(duplicateCheck.message);
            return;
        }
        const newOption = {
            label: formData.label,
            value: formData.value,
            parentValue: formData.parentValue,
            parentLabel: formData.parentLabel,
        };
        emit('save', newOption);
    } catch (error) {
        console.error('表单验证失败:', error);
    } finally {
        submitLoading.value = false;
    }
};

// 递归展开到目标节点
const expandToKey = (key) => {
    const findAndExpand = (nodes, target) => {
        for (const node of nodes) {
            if (node.value === target) return true;
            if (node.children && node.children.length > 0) {
                if (findAndExpand(node.children, target)) {
                    treeRef.value.expandNode(node, true);
                    return true;
                }
            }
        }
        return false;
    };
    findAndExpand(optionList.value, key);
};

// 设置选项数据
const setOptionData = (data) => {
    optionList.value = data || [];
    nextTick(() => {
        if (currentKey.value && treeRef.value) {
            treeRef.value.setCurrentKey(currentKey.value);
            expandToKey(currentKey.value);
        }
    });
};

const closeDialog = () => {
    dialogVisible.value = false;
    formRef.value.resetFields();
    currentEditNode.value = null;
    currentKey.value = null;
};

// 定义事件
const emit = defineEmits(['save']);

watch(
  () => props.mainList,
  (newVal) => {
    setOptionData(newVal);
  },
  { deep: true, immediate: true }
)

// 暴露方法
defineExpose({
    openDialog,
    setOptionData,
    closeDialog
});
</script>

<style lang="scss" scoped>
.cascader-option-main {
    height: 100%;
    display: flex;
    flex-direction: column;
    
    .operation-bar {
        padding: 16px;
        border-bottom: 1px solid #e4e7ed;
        
        .operation-tip {
            color: #909399;
            font-size: 14px;
        }
    }
    
    .option-tree {
        flex: 1;
        padding: 16px;
        overflow-y: auto;
        
        .tree-node {
            display: flex;
            align-items: center;
            width: 100%;
            
            .node-label {
                font-size: 14px;
                color: #303133;
                margin-right: 8px;
            }
            
            .node-value {
                font-size: 12px;
                color: #909399;
                margin-right: 16px;
            }
            
            .node-actions {
                margin-left: auto;
                
                .el-button {
                    margin-left: 8px;
                }
            }
        }
    }
}

.w-100 {
    width: 100%;
}
</style>