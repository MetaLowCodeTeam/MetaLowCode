<template>
	<ml-dialog v-model="dialogConfig.isShow" title="设置动作" width="920px" append-to-body>
		<div class="action-editor">
			<!-- 左侧：树 -->
			<div class="action-editor-left">
				<div class="left-header">执行动作</div>
                <el-tree
                    ref="actionTreeRef"
                    class="action-tree"
                    :data="treeData"
                    :props="treeProps"
                    node-key="id"
                    default-expand-all
                    highlight-current
                    :current-node-key="currentKey"
                    @node-click="handleNodeClick"
                />
			</div>
			<!-- 右侧：基础配置占位 -->
			<div class="action-editor-right">
				<div class="right-title">基础配置</div>
				<!-- 将表单与规则数据进行关联：v-model 传递 dialogConfig.data -->
				<FormControl 
					v-if="currentNode?.id === 'widget_common_action'"
					v-model="dialogConfig.data"
					:controlList="controlList"
				/>
			</div>
		</div>

		<template #footer>
			<el-button @click="closeDialog" size="default">取消</el-button>
			<el-button type="primary" @click="confirmAction" size="default">确认</el-button>
		</template>
	</ml-dialog>
</template>

<script setup>
import { ref, nextTick } from "vue";
import FormControl from "./Form-Control.vue";

const emit = defineEmits(['confirmAction']);

const dialogConfig = ref({
	isShow: false,
	data: {},
});

// 示例树数据（后续你可替换为真实数据）
const treeData = ref([
	{
		id: "form",
		label: "表单",
		children: [
			{ id: "widget_common_action", label: "组件控制" },
		],
	},
]);

const treeProps = {
	children: "children",
	label: "label",
};

let currentNode = ref(null);
const currentKey = ref(null);
const actionTreeRef = ref(null);
// 组件列表
const controlList = ref([]);

const handleNodeClick = (node) => {
	// 这里根据点击节点切换右侧配置内容（保留给你后续实现）
    currentNode.value = node;
    currentKey.value = node?.id || null;
    dialogConfig.value.data.actionLabel = node?.label || "";
    dialogConfig.value.data.actionType = node?.id || "";
};

const openDialog = async (data, componentOptions) => {
	dialogConfig.value.data = JSON.parse(JSON.stringify(data));
	dialogConfig.value.isShow = true;
    controlList.value = componentOptions;
    if(!data.actionType){
        // 默认选中第一个叶子节点（示例：组件控制）
        const defaultNode = treeData.value[0]?.children?.[0] || null;
        currentNode.value = defaultNode;
        dialogConfig.value.data.actionLabel = defaultNode?.label || "";
        dialogConfig.value.data.actionType = defaultNode?.id || "";
        currentKey.value = defaultNode?.id || null;
        await nextTick();
        // 高亮树节点
        if (actionTreeRef.value && currentKey.value) {
            actionTreeRef.value.setCurrentKey(currentKey.value);
        }
    }
};
const closeDialog = () => {
	dialogConfig.value.isShow = false;
};

const confirmAction = () => {
	dialogConfig.value.isShow = false;
    emit('confirmAction', dialogConfig.value.data);
};

defineExpose({
	openDialog,
});
</script>

<style scoped>
.action-editor {
	display: flex;
	height: 520px;
}

.action-editor-left {
	width: 260px;
	border-right: 1px solid var(--el-border-color-light);
	padding: 10px 0;
	display: flex;
	flex-direction: column;
}

.left-header {
	padding: 0 12px 10px;
	font-weight: 600;
	color: var(--el-text-color-primary);
}

.action-tree {
	padding: 0 8px;
	overflow: auto;
}
/* 局部还原 Tree 行高为 default（避免被全局 small 影响） */
.action-tree :deep(.el-tree-node__content) {
	height: 32px;
	line-height: 32px;
}
.action-tree :deep(.el-tree-node__label) {
	font-size: 14px;
}

.action-editor-right {
	flex: 1;
	padding: 10px 14px;
	overflow: auto;
}

.right-title {
	font-weight: 600;
	margin-bottom: 10px;
	color: var(--el-text-color-primary);
}

.right-empty {
	height: 100%;
}
</style>
