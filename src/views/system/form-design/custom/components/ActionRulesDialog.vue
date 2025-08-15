<template>
	<!-- 交互规则 -->
	<el-drawer
		:title="dialogConfig.title"
		v-model="dialogConfig.isShow"
		:show-close="true"
		class="action-setting-drawer ds-setting-drawer"
		append-to-body
		direction="rtl"
		:modal="true"
		:size="820"
	>
		<el-form label-width="100px" label-position="top">
			<!-- 规则名称 -->
			<el-form-item>
				<template #label>
					<span class="label-title"> 1. 规则名称 </span>
				</template>
				<el-input v-model="dialogConfig.data.name" />
			</el-form-item>
			<!-- 规则条件 -->
			<el-form-item>
				<template #label>
					<span class="label-title"> 2. 触发条件设置 </span>
				</template>
				<ComboFilter
                    ref="comboFilterRef"
					:field-options="fieldOptions"
					v-model="dialogConfig.data.filterData"
					:preview="false"
				/>
			</el-form-item>
			<!-- 触发动作 -->
			<el-form-item>
				<template #label>
					<span class="label-title"> 3. 触发动作 </span>
				</template>
				<el-row
					v-for="(item, inx) in dialogConfig.data.actions"
					:key="inx"
					style="width: 100%; margin-bottom: 10px"
					:gutter="10"
				>
                    <el-col :span="20">
                        {{ item.actionLabel || '组件控制' }} 
                    </el-col>
					<!-- 操作 -->
					<el-col :span="4">
                        <el-button
							icon="edit"
							type="primary"
							circle
							@click="editAction(item)"
						></el-button>
						<el-button
							icon="delete"
							type="danger"
							circle
							@click="deleteAction(inx)"
						></el-button>
					</el-col>
				</el-row>
				<div class="action-rule-add">
					<el-button icon="plus" type="primary" @click="addAction">
						添加动作
					</el-button>
				</div>
			</el-form-item>
		</el-form>
		<template #footer>
			<el-button @click="closeDialog" style="width: 100px">
				取消
			</el-button>
			<el-button
				type="primary"
				@click="confirmActionRule"
				style="width: 100px"
			>
				确认
			</el-button>
		</template>
	</el-drawer>
    <ActionEditorDialog ref="actionEditorDialogRef" @confirmAction="handleConfirmAction"/>
</template>

<script setup>
import { ref } from "vue";
import { ElMessage } from "element-plus";
import ComboFilter from "../combo-filter/ComboFilter.vue";
import ActionEditorDialog from "./ActionEditorDialog.vue";
import { deepClone, getGuid } from "@/utils/util";
const emit = defineEmits(["confirm"]);

// 弹框配置
const dialogConfig = ref({
	title: "",
	isShow: false,
	data: {},
});

// 默认交互规则
const defaultActionRule = ref({
	name: "",
	filterData: {
		root: {
			children: [],
		},
	},
	actions: [],
	guid: null,
});

// 测试数据
const fieldOptions = ref([]);
// 动作下拉数据
const actionSelects = ref([]);

// 默认动作
const defaultAction = ref({
    // 动作类型
    actionType: "",
    actionLabel: "",
    field: "",
    type: "",
    guid: null,
});

const actionEditorDialogRef = ref(null);

// 添加动作
const addAction = () => {
    actionEditorDialogRef.value.openDialog(defaultAction.value, actionSelects.value);
};
// 编辑动作
const editAction = (item) => {
    actionEditorDialogRef.value.openDialog(item, actionSelects.value);
}
// 确认动作
const handleConfirmAction = (data) => {
    if(data.guid){
        let index = dialogConfig.value.data.actions.findIndex(item => item.guid === data.guid);
        dialogConfig.value.data.actions[index] = deepClone(data);
    }
    else {
        data.guid = getGuid();
        dialogConfig.value.data.actions.push(deepClone(data));
    }
    // console.log(dialogConfig.value.data.actions,'---西欧改后')
}

// 删除动作
const deleteAction = (inx) => {
	dialogConfig.value.data.actions.splice(inx, 1);
};

// 切换动作字段
const handleActionFieldChange = (item) => {
	if (!item.type) {
		item.type = "show";
	}
};

// 打开弹框
const openDialog = (data, groupedFieldOptions, containerWidgets) => {
	let dialogData;
	if (data) {
		// 编辑时，保持原有数据
		dialogData = deepClone(data);
	} else {
		// 新增时，使用默认数据并生成guid
		dialogData = deepClone(defaultActionRule.value);
	}
	dialogConfig.value = {
		isShow: true,
		title: data ? "编辑交互规则" : "添加交互规则",
		data: dialogData,
	};
	// 接收分组格式的字段选项
	fieldOptions.value = [...groupedFieldOptions];
    actionSelects.value = [...groupedFieldOptions];
    if(containerWidgets.length > 0){
        actionSelects.value.unshift({
            label: '容器',
            options: containerWidgets
        })
    }
};

const closeDialog = () => {
	dialogConfig.value.isShow = false;
};

const comboFilterRef = ref(null);

const confirmActionRule = () => {
	let { data } = dialogConfig.value;
	if (!data.name) {
		ElMessage.error("请输入规则名称");
		return;
	}
	if (
		!data.filterData ||
		!data.filterData.root ||
		!data.filterData.root.children ||
		data.filterData.root.children.length === 0
	) {
		ElMessage.error("请设置条件");
		return;
	}
	if (!data.actions || data.actions.length === 0) {
		ElMessage.error("请添加触发动作");
		return;
	}
    data.filterExpression  = comboFilterRef.value.generateQueryString();
	emit("confirm", data);
    closeDialog();
};

defineExpose({
	openDialog,
});
</script>

<style scoped>

</style>
<style>
.action-setting-drawer { 
	.el-drawer__header {
		margin-bottom: 20px !important;
	}

	.el-drawer__body {
		padding: 0 20px !important;
	}
}
</style>    
