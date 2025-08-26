<!-- 自定义表单设计器中的动作规则设置 -->
<template>
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
                    size="default"
                >
                    添加交互规则
                </el-button>
            </div>
        </div>
    </el-scrollbar>
	<ActionRulesDialog
		ref="actionRulesDialogRef"
		@confirm="confirmActionRule"
	/>
</template>

<script setup>
import { ref, watch } from "vue";
import ActionRulesDialog from "./components/ActionRulesDialog.vue";
import { getGuid } from "@/utils/util";
import useCommonStore from "@/store/modules/common";
const { queryEntityLabelByName } = useCommonStore();
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
    // 子表名称
    subFormName: {
        type: String,
        default: '',
    },
    // 绑定事件
    bindingEvents: {
        type: Array,
        default: () => [],
    },
});



const emit = defineEmits(["initFormWidgets"]);

// 动作规则
const actionRules = ref([]);

// 字段组件
const fieldWidgets = ref([]);
// 容器组件
const containerWidgets = ref([]);

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
// 将本地规则同步回传入的 formConfig（selectedWidget.options 或全局配置）
const syncToFormConfig = () => {
	if (!props.formConfig) return;
	const copied = JSON.parse(JSON.stringify(actionRules.value || []));
	props.formConfig.actionRules = copied;
};
// 删除
const deleteActionRule = (inx) => {
	actionRules.value.splice(inx, 1);
	syncToFormConfig();
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
	syncToFormConfig();
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
	syncToFormConfig();
};

// 设置字段组件
const setFieldWidgets = async (widgets) => {
    // 先处理原始数据
    let newWidgets = widgets.map((item) => {
        let value = item.field?.options?.name;
        let subFormName = item.field?.subFormName;
        return {
            label: item.field?.options?.label,
            value: subFormName ? 'subForm_' + subFormName + '_' + value : value,
            type: item.field?.type,
            entity: item.field?.subFormName || props.entity,
			subFormName,
            optionData: item.field?.options?.optionItems || [],
        };
    });
    fieldWidgets.value = newWidgets;
};

// 设置容器组件
const setContainerWidgets = async (widgets) => {
    let newWidgets = widgets.map((item) => {
        let label = null;
        if(item.container.cols?.length > 0){
            label = item.container.cols[0].options?.name;
        }else{
            label = item.container.options?.label;
         }
        return {
            value: 'container_' + item.name,
            label: label || item.name,
        }
    })
    containerWidgets.value = newWidgets;
}



// 生成分组选项格式
const getGroupedFieldOptions = () => {
    // 按 entity 分组
    const groupedFields = fieldWidgets.value.reduce((groups, field) => {
        const entityKey = field.entity;
        if (!groups[entityKey]) {
            groups[entityKey] = [];
        }
        // 主表字段 和 如果存在子表，拿当前子表单所有字段。
        if(!field.subFormName || (props.subFormName && field.subFormName == props.subFormName)){
            groups[entityKey].push({
                value: field.value,
                label: field.label,
                type: field.type,
                entity: entityKey,
                optionData: field.optionData,
            });
        }
		//暂不处理从表字段
        // if (!field.subFormName) {
        //     groups[entityKey].push({
        //         value: field.value,
        //         label: field.label,
        //         type: field.type,
        //         entity: entityKey,
        //         optionData: field.optionData,
        //     });
        // }
        return groups;
    }, {});

    // 转换为 Element Plus Select 分组格式
    const options = Object.keys(groupedFields).map(entityKey => {
        const fields = groupedFields[entityKey];
        return {
            label: entityKey == props.entity ? queryEntityLabelByName(props.entity) : queryEntityLabelByName(entityKey),   // 直接使用 entityKey 作为分组标签
            options: fields,    // 分组下的选项
        };
    });
    return options;
};
const actionRulesDialogRef = ref(null);
const openDialog = (data) => {
	emit("initFormWidgets");
	// 传递分组后的选项格式
	const groupedOptions = getGroupedFieldOptions();
	if (data && !data.actions) {
		data.actions = []
	}
    if(data?.actions?.length > 0){
        data.actions = data.actions.map(item => {
            let newItem = {
                field: null,
                label: item.label,
                type: item.type,
                actionType: item.actionType,
                actionLabel: item.actionLabel,
                guid: item.guid,
                actionParams: item.actionParams || {},
                bindingEvents: props.bindingEvents || null,
            }
            if(item.ofSubForm) {
                newItem.field = 'subForm_' + item.ofSubForm + '_' + item.field;
            }else if(item.container){
                newItem.field = 'container_' + item.container;
            }else{
                newItem.field = item.field;
            }
            if(!item.guid) {
                newItem.guid = getGuid();
            }
            return newItem
        })
    }
	actionRulesDialogRef.value.openDialog(JSON.parse(JSON.stringify(data)), groupedOptions, containerWidgets.value);
};

const confirmActionRule = (data) => {
    let newData = JSON.parse(JSON.stringify(data));
    let oldActions = [...newData.actions];
    newData.actions = oldActions.map(item => {
        let newItem = {
            field: null,
            ofSubForm: null,
            container: null,
            type: item.type,
            actionType: item.actionType,
            actionLabel: item.actionLabel,
            guid: item.guid,
            actionParams: item.actionParams || {},
            bindingEvents: props.bindingEvents || null,
        }
        if(item.field.includes('subForm_')){
            newItem.ofSubForm = item.field.split('_')[1];
            newItem.field = item.field.split('_')[2];
        }else if(item.field.includes('container_')){
            newItem.container = item.field.split('_')[1];
        }else{
            newItem.field = item.field;
            newItem.ofSubForm = null;
            newItem.container = null;
        }
        return newItem
    })
	// 是编辑
	if (newData.guid) {
		actionRules.value.forEach((item) => {
			if (item.guid === newData.guid) {
				Object.assign(item, newData);
			}
			delete item.action  //删除废弃属性action
		});
	} else {
		newData.guid = getGuid();
		delete newData.action  //删除废弃属性action
		actionRules.value.push(newData);
	}
	syncToFormConfig();
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

const setActionRules = (data) => {
    actionRules.value = data ? JSON.parse(JSON.stringify(data)) : [];
}


// 监听传入的配置引用变化（切换选中组件时会更新 selectedWidget.options 的引用）
watch(
    () => props.formConfig,
    (newVal) => {
        setActionRules(newVal?.actionRules)
    },
    {
        immediate: true,
        deep: true,
    }
)

defineExpose({
	setFieldWidgets,
    setContainerWidgets,
    getActionRules,
    getGroupedFieldOptions,
    getFieldByValue,
    getFieldLabelByValue,
    setActionRules,
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
