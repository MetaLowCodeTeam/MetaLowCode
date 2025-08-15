<template>
	<ml-dialog v-model="dialogConfig.isShow" title="设置动作" width="920px">
		<div class="action-editor">
			<!-- 左侧：树 -->
			<div class="action-editor-left">
				<div class="left-header">执行动作</div>
				<el-tree
					class="action-tree"
					:data="treeData"
					:props="treeProps"
					node-key="id"
					default-expand-all
					highlight-current
					@node-click="handleNodeClick"
				/>
			</div>
			<!-- 右侧：基础配置占位 -->
			<div class="action-editor-right">
				<div class="right-title">基础配置</div>
				<!-- TODO: 这里留空，后续你填入表单/配置内容 -->
				<div class="right-empty"></div>
			</div>
		</div>

		<template #footer>
			<el-button @click="closeDialog">取消</el-button>
			<el-button type="primary" @click="confirmAction">确认</el-button>
		</template>
	</ml-dialog>
</template>

<script setup>
import { ref } from "vue";

const dialogConfig = ref({
	isShow: false,
	data: {},
});

// 示例树数据（后续你可替换为真实数据）
const treeData = ref([
	{
		id: "page",
		label: "页面",
		children: [
			{ id: "page_jump", label: "跳转页面" },
			{ id: "page_refresh", label: "刷新页面" },
		],
	},
	{
		id: "dialog",
		label: "弹窗",
		children: [
			{ id: "dialog_open", label: "打开弹窗" },
			{ id: "dialog_close", label: "关闭弹窗" },
			{ id: "dialog_message", label: "消息提醒" },
		],
	},
	{
		id: "form",
		label: "表单",
		children: [
			{ id: "form_submit", label: "提交表单" },
		],
	},
	{
		id: "other",
		label: "其他",
		children: [
			{ id: "other_custom", label: "自定义" },
		],
	},
]);

const treeProps = {
	children: "children",
	label: "label",
};

const handleNodeClick = (node) => {
	// 这里根据点击节点切换右侧配置内容（保留给你后续实现）
	// console.log('clicked:', node)
};

const openDialog = (data) => {
	dialogConfig.value.data = JSON.parse(JSON.stringify(data));
	dialogConfig.value.isShow = true;
};
const closeDialog = () => {
	dialogConfig.value.isShow = false;
};

const confirmAction = () => {
	console.log(dialogConfig.value.data);
	dialogConfig.value.isShow = false;
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
