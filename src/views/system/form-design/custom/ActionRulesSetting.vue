<!-- 自定义表单设计器中的动作规则设置 -->
<template>
	<el-tab-pane label="交互逻辑" name="4">
		<el-scrollbar class="setting-scrollbar">
			<div class="action-rules-setting">
				<div
					v-for="(item, inx) in actionRules"
					:key="item.name"
					class="action-rule-item"
				>
					<div class="action-rule-item-name">
						{{ item.name }}
					</div>
					<div class="action-rule-item-action">
						<el-button
							v-for="button in actionButtons"
							:key="button.icon"
							:type="button.type"
							:icon="button.icon"
							circle
							size="small"
							:plain="button.plain"
							:disabled="isButtonDisabled(button, inx)"
							@click="handleActionButtonClick(item, button, inx)"
						></el-button>
					</div>
				</div>
				<div class="action-rule-add">
					<el-button
						type="primary"
						icon="plus"
						@click="openDialog(null)"
						plain
					>
						添加交互规则
					</el-button>
				</div>
			</div>
		</el-scrollbar>
	</el-tab-pane>
	<ActionRulesDialog
		ref="actionRulesDialogRef"
		@confirm="confirmActionRule"
	/>
</template>

<script setup>
import { ref } from "vue";
import ActionRulesDialog from "./components/ActionRulesDialog.vue";
import { getGuid } from "@/utils/util";
const props = defineProps({
	designer: {
		type: Object,
		default: () => {},
	},
	formConfig: {
		type: Object,
		default: () => {},
	},
    entity: {
        type: String,
        default: '',
    },
    entityLabel: {
        type: String,
        default: '',
    },
});

const emit = defineEmits(["getFieldWidgets"]);

// 动作规则
const actionRules = ref([]);

// 字段组件
const fieldWidgets = ref([]);

// 操作按钮
const actionButtons = ref([
	{
		icon: "top",
		type: "info",
		size: "small",
		key: "up",
		plain: true,
	},
	{
		icon: "bottom",
		type: "info",
		size: "small",
		key: "down",
		plain: true,
	},
	{
		icon: "edit",
		type: "primary",
		size: "small",
		key: "edit",
		plain: true,
	},
	{
		icon: "delete",
		type: "danger",
		size: "small",
		key: "delete",
	},
]);

// 判断按钮是否禁用
const isButtonDisabled = (button, index) => {
	if (button.key === "up" && index === 0) {
		return true; // 第一个不让上移
	}
	if (button.key === "down" && index === actionRules.value.length - 1) {
		return true; // 最后一个不让下移
	}
	return false;
};

// 操作按钮
const handleActionButtonClick = (item, button, inx) => {
	switch (button.key) {
		case "edit":
			openDialog(item);
			break;
		case "delete":
			deleteActionRule(inx);
			break;
		case "up":
			upActionRule(inx);
			break;
		case "down":
			downActionRule(inx);
			break;
	}
};
// 删除
const deleteActionRule = (inx) => {
	actionRules.value.splice(inx, 1);
	// setFormConfigActionRules();
};
// 上移
const upActionRule = (inx) => {
	if (inx > 0) {
		// 简单交换位置
		[actionRules.value[inx], actionRules.value[inx - 1]] = [
			actionRules.value[inx - 1],
			actionRules.value[inx],
		];
	}
};
// 下移
const downActionRule = (inx) => {
	if (inx < actionRules.value.length - 1) {
		// 简单交换位置
		[actionRules.value[inx], actionRules.value[inx + 1]] = [
			actionRules.value[inx + 1],
			actionRules.value[inx],
		];
	}
};

// 设置字段组件
const setFieldWidgets = (widgets) => {
    // 先处理原始数据
    let newWidgets = widgets.map((item) => {
        let value = item.field?.id + "_" + item.field?.options?.name;
        return {
            label: item.field?.options?.label,
            value,
            type: item.field?.type,
            entity: item.field?.subFormName || props.entity,
        };
    });
    
    fieldWidgets.value = newWidgets;
    console.log(fieldWidgets.value, 'fieldWidgets.value');
};

// 生成分组选项格式
const getGroupedFieldOptions = () => {
    // 按 entity 分组
    const groupedFields = fieldWidgets.value.reduce((groups, field) => {
        const entityKey = field.entity;
        if (!groups[entityKey]) {
            groups[entityKey] = [];
        }
        groups[entityKey].push({
            value: field.value,
            label: field.label,
            type: field.type,
            entity: entityKey,
        });
        return groups;
    }, {});

    // 转换为 Element Plus Select 分组格式
    const options = Object.keys(groupedFields).map(entityKey => {
        const fields = groupedFields[entityKey];
        return {
            label: entityKey == props.entity ? `主表${entityKey}` : `从表${entityKey}`,   // 直接使用 entityKey 作为分组标签
            options: fields,    // 分组下的选项
        };
    });

    return options;
};
const actionRulesDialogRef = ref(null);
const openDialog = (data) => {
	emit("getFieldWidgets");
	// 传递分组后的选项格式
	const groupedOptions = getGroupedFieldOptions();
	actionRulesDialogRef.value.openDialog(data, groupedOptions);
};

const confirmActionRule = (data) => {
	// 是编辑
	if (data.guid) {
		actionRules.value.forEach((item) => {
			if (item.guid === data.guid) {
				Object.assign(item, data);
			}
		});
	} else {
		data.guid = getGuid();
		actionRules.value.push(data);
	}
};

const getActionRules = () => {
	return [...actionRules.value];
};

// 通过 value 查找字段信息（从所有分组中查找）
const getFieldByValue = (value) => {
	for (let field of fieldWidgets.value) {
		if (field.value === value) {
			return field;
		}
	}
	return null;
};

// 通过 value 获取字段标签
const getFieldLabelByValue = (value) => {
	const field = getFieldByValue(value);
	return field ? field.label : '';
};

defineExpose({
	setFieldWidgets,
    getActionRules,
    getGroupedFieldOptions,
    getFieldByValue,
    getFieldLabelByValue,
});
</script>

<style scoped lang="scss">
/* Styles here */
.action-rule-add {
	text-align: center;
}
.action-rules-setting {
    font-size: 13px;
    .action-rule-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        line-height: 34px;
        border-bottom: 1px dashed #e5e5e5;
    }
    .action-rule-add {
        margin-top: 15px;
        text-align: center;
    }
}

.label-title {
    font-size: 14px;
    color: #333;
    border-left: 4px solid var(--el-color-primary);
    box-sizing: border-box;
    padding-left: 10px;
    font-weight: bold;
}
</style>
