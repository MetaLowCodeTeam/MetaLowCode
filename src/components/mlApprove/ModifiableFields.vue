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
                    <div
                        class="edit-field-list"
                        v-for="(field, fieldInx) of tab.fields"
                        :key="fieldInx"
                    >
                        {{ field.label }}
                        <span class="fr del-icon" @click="subDelSelectedField(field)">
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
import { onMounted, ref, watch } from "vue";

// 选择字段组件
import mlSelectField from "@/components/mlSelectField/index.vue";

const props = defineProps({
	formData: { type: Object, default: () => {} },
	entityName: { type: String, default: "" },
});

let myFormData = ref(props.formData);

let SelectFieldDialog = ref(false);

//  打开选择字段弹框
const openSelectFieldDialog = () => {
	SelectFieldDialog.value.openDialog();
};

// 删除选择字段
const delSelectedField = (inx) => {
	myFormData.value.modifiableFields.splice(inx, 1);
};

// 多页签删除字段
const subDelSelectedField = (field) => {
    let inx = myFormData.value.modifiableFields.findIndex(item => item.name === field.name)
    delSelectedField(inx);
}

// 字段是否必填切换
const fieldRequiredChange = (field) => {
	if (!field.isEdit && field.isRequired) {
		field.isEdit = true;
	}
};

watch(
	() => myFormData.value.modifiableFields.length,
	() => {
		// 格式化字段页签
		formatFieldsTab();
	},
	{ deep: true }
);

onMounted(() => {
	formatFieldsTab();
});

// 实体页签
let entityTabs = ref([]);
// 当前页签
let curtTab = ref("");
// 格式化字段页签
const formatFieldsTab = () => {
    curtTab.value = props.entityName;
	let { modifiableFields } = myFormData.value;
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
