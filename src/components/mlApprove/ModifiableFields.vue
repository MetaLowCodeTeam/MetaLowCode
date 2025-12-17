<style lang="scss" scoped>
.label-title {
	font-weight: bold;
	color: #666;
	font-size: 14px;
}
.edit-field-list-box {
	.edit-field-list {
		border-bottom: 1px solid rgba(0, 0, 0, 0.1);
		height: 38px;
		line-height: 38px;
		font-size: 13px;
		color: #404040;
		&:first-child {
			border-top: 1px solid rgba(0, 0, 0, 0.1);
		}
		.del-icon {
			margin-right: 3px;
			position: relative;
			top: 2px;
			cursor: pointer;
			color: #999;
			&:hover {
				color: #6f6f6f;
			}
		}
		.required-icon {
			position: relative;
			top: 1px;
			margin-right: 30px;
		}
	}
}
</style>

<template>
	<!--  -->
	<div>
		<div class="label-title mb-10">允许修改字段</div>
		<div class="edit-field-list-box" v-if="entityTabs?.length == 1">
            <div v-if="entityTabs[0].isSubForm">
                <el-checkbox 
                    :model-value="getSubFormConfig(entityTabs[0].name).isAlowAdd"
                    @change="updateSubFormConfig(entityTabs[0].name, 'isAlowAdd', $event)"
                    label="子表是否允许新增">
                </el-checkbox>
                <el-checkbox 
                    :model-value="getSubFormConfig(entityTabs[0].name).isAlowDel"
                    @change="updateSubFormConfig(entityTabs[0].name, 'isAlowDel', $event)"
                    label="子表是否允许删除">
                </el-checkbox>
            </div>
			<div
				class="edit-field-list"
				v-for="(field, fieldInx) of myFormData.modifiableFields"
				:key="fieldInx"
			>
				{{ field.label }}
				<span class="fr del-icon" @click="delSelectedField(fieldInx)">
					<el-icon size="16">
						<ElIconClose />
					</el-icon>
				</span>

				<span
					class="required-icon fr"
					:title="field.reserved ? '系统字段无法修改' : ''"
				>
					<el-checkbox
						@change="fieldRequiredChange(field)"
						:disabled="field.reserved"
						v-model="field.isRequired"
						label="必填"
					/>
				</span>
			</div>
		</div>
		<el-tabs v-model="curtTab" v-if="entityTabs?.length > 1" class="ml-tabs">
			<el-tab-pane
				v-for="(tab, inx) of entityTabs"
				:label="tab.label"
				:name="tab.name"
				:key="inx"
			>
                <div class="edit-field-list-box">
                    <div v-if="tab.isSubForm">
                        <el-checkbox 
                            :model-value="getSubFormConfig(tab.name).isAlowAdd"
                            @change="updateSubFormConfig(tab.name, 'isAlowAdd', $event)"
                            label="子表是否允许新增">
                        </el-checkbox>
                        <el-checkbox 
                            :model-value="getSubFormConfig(tab.name).isAlowDel"
                            @change="updateSubFormConfig(tab.name, 'isAlowDel', $event)"
                            label="子表是否允许删除">
                        </el-checkbox>
                    </div>
                    <div
                        class="edit-field-list"
                        v-for="(field, fieldInx) of tab.fields"
                        :key="fieldInx"
                    >
                        {{ field.label }}
                        <span class="fr del-icon" @click="subDelSelectedField(field, tab.name)">
                            <el-icon size="16">
                                <ElIconClose />
                            </el-icon>
                        </span>

                        <span
                            class="required-icon fr"
                            :title="field.reserved ? '系统字段无法修改' : ''"
                        >
                            <el-checkbox
                                @change="fieldRequiredChange(field)"
                                :disabled="field.reserved"
                                v-model="field.isRequired"
                                label="必填"
                            />
                        </span>
                    </div>
                </div>
			</el-tab-pane>
		</el-tabs>
        <div class="add-field-div mt-10">
            <el-button icon="el-icon-plus" @click="openSelectFieldDialog">
                选择字段
            </el-button>
        </div>
	</div>
	<mlSelectField
		ref="SelectFieldDialog"
		v-model="myFormData.modifiableFields"
		title="选择可修改字段"
		:entityName="entityName"
	/>
</template>

<script setup>
import { onMounted, ref, watch, nextTick } from "vue";

// 选择字段组件
import mlSelectField from "@/components/mlSelectField/index.vue";

const props = defineProps({
	formData: { type: Object, default: () => {} },
	entityName: { type: String, default: "" },
});

let myFormData = ref(props.formData);

let SelectFieldDialog = ref(false);

// 初始化子表配置
const initSubFormConfig = () => {
    if (!myFormData.value.otherConfig) {
        myFormData.value.otherConfig = {};
    }
    if (!myFormData.value.otherConfig.detailEntityConfig) {
        myFormData.value.otherConfig.detailEntityConfig = [];
    }
};

// 获取子表配置
const getSubFormConfig = (entityName) => {
    // 确保 otherConfig 和 detailEntityConfig 已初始化
    initSubFormConfig();
    
    const config = myFormData.value.otherConfig.detailEntityConfig.find(
        item => item.entityName === entityName
    );
    return config || { entityName, isAlowAdd: false, isAlowDel: false };
};

// 更新子表配置
const updateSubFormConfig = (entityName, field, value) => {
    // 标记正在更新子表配置
    isUpdatingSubFormConfig = true;
    
    // 确保 otherConfig 和 detailEntityConfig 已初始化
    if (!myFormData.value.otherConfig) {
        myFormData.value.otherConfig = {};
    }
    if (!myFormData.value.otherConfig.detailEntityConfig) {
        myFormData.value.otherConfig.detailEntityConfig = [];
    }
    
    const configIndex = myFormData.value.otherConfig.detailEntityConfig.findIndex(
        item => item.entityName === entityName
    );
    
    if (configIndex !== -1) {
        myFormData.value.otherConfig.detailEntityConfig[configIndex][field] = value;
    } else {
        myFormData.value.otherConfig.detailEntityConfig.push({
            entityName,
            isAlowAdd: false,
            isAlowDel: false,
            [field]: value
        });
    }
    
    // 使用 nextTick 确保响应式更新完成后再重置标记
    nextTick(() => {
        isUpdatingSubFormConfig = false;
    });
};

//  打开选择字段弹框
const openSelectFieldDialog = () => {
	SelectFieldDialog.value.openDialog();
};

// 删除选择字段
const delSelectedField = (inx) => {
	myFormData.value.modifiableFields.splice(inx, 1);
};

// 多页签删除字段
const subDelSelectedField = (field, tabName) => {
    // 先从底层数据中删除字段
    let inx = myFormData.value.modifiableFields.findIndex(item => item.name === field.name && item.formEntity === tabName);
    delSelectedField(inx);
}

// 字段是否必填切换
const fieldRequiredChange = (field) => {
	if (!field.isEdit && field.isRequired) {
		field.isEdit = true;
	}
};

// 用于标记是否正在更新子表配置，避免触发不必要的格式化
let isUpdatingSubFormConfig = false;

watch(
	() => myFormData.value?.modifiableFields,
	() => {
		// 如果正在更新子表配置，不触发格式化，避免数据丢失
		if (isUpdatingSubFormConfig) {
			return;
		}
		// 格式化字段页签
		formatFieldsTab();
	},
	{ deep: true, immediate: false }
);

onMounted(() => {
	initSubFormConfig();
	formatFieldsTab();
});





// 实体页签
let entityTabs = ref([]);
// 当前页签
let curtTab = ref("");
// 格式化字段页签
const formatFieldsTab = () => {
    curtTab.value = props.entityName;
	// 确保 myFormData.value 存在
	if (!myFormData.value) {
		return;
	}
	let modifiableFields = myFormData.value.modifiableFields;
	// 如果 modifiableFields 不存在或不是数组，直接返回，保持原有数据
	if (!modifiableFields || !Array.isArray(modifiableFields)) {
		return;
	}
	// 实体tab
	let tabsEntity = [];
	// 实际tab数据
	let tabList = [];
	modifiableFields.forEach((el) => {
		// 如果是从实体
		if (el.formEntity) {
			// 如果没有记录过
			if (!tabsEntity.includes(el.formEntity)) {
				tabsEntity.push(el.formEntity);
				tabList.push({
					label: el.formEntityLabel,
					name: el.formEntity,
					fields: [el],
                    isSubForm: true,
				});
			}
			// 否则就是记录过
			else {
				let index = tabList.findIndex(
					(item) => item.name === el.formEntity
				);
				tabList[index].fields.push(el);
			}
		}
		// 否则就是主实体
		else {
			if (!tabsEntity.includes(props.entityName)) {
				tabsEntity.push(props.entityName);
				tabList.push({
					label: "主表",
					name: props.entityName,
					fields: [el],
				});
			} else {
				let index = tabList.findIndex(
					(item) => item.name === props.entityName
				);
				tabList[index].fields.push(el);
			}
		}
	});
	entityTabs.value = tabList;
};


</script>
