<template>
	<ml-dialog
		title="列表配置"
		v-model="settingDialog.isShow"
		width="500px"
		:show-close="!settingDialog.loading"
	>
		<div v-loading="settingDialog.loading">
			<el-form>
				<el-form-item label="目录图标" class="mb-5">
					<span
						class="cursor-pointer icon-top-2"
						@click="openIconDialog('contentsIcon')"
					>
						<el-icon
							class="icon"
							size="15"
							:color="settingDialog.config.contentsIcon.color"
						>
							<component
								:is="settingDialog.config.contentsIcon?.name"
							/>
						</el-icon>
					</span>
				</el-form-item>
				<el-form-item
					label="选择目录字段"
					label-position="top"
					class="is-required mb-10"
				>
					<el-select
						v-model="settingDialog.config.contentsField"
						placeholder="请选择目录字段"
						filterable
						@change="changeReferenceField"
						v-loading="filedLoading"
					>
						<el-option
							v-for="(item, inx) in settingDialog.referenceField"
							:key="inx"
							:label="item.label"
							:value="item.name"
						/>
					</el-select>
				</el-form-item>
				<el-form-item
					label="选择目录父子关联字段"
					label-position="top"
					class="is-required mb-10"
				>
					<el-select
						v-model="settingDialog.config.contentsParentField"
						placeholder="请选择目录父子关联字段"
						filterable
					>
						<el-option
							v-for="item in referenceFieldParentList"
							:key="item.fieldName"
							:label="item.fieldLabel"
							:value="item.fieldName"
						/>
					</el-select>
				</el-form-item>
				<el-form-item label="数据图标" class="mb-0">
					<span
						class="cursor-pointer icon-top-2"
						@click="openIconDialog('dataIcon')"
					>
						<el-icon
							class="icon"
							size="15"
							:color="settingDialog.config.dataIcon.color"
						>
							<component
								:is="settingDialog.config.dataIcon?.name"
							/>
						</el-icon>
					</span>
				</el-form-item>
				<el-form-item class="mb-5">
					<el-checkbox v-model="settingDialog.config.dataShowTree">
						树状展示数据
					</el-checkbox>
				</el-form-item>
				<el-form-item
					label="目录父子管理字段"
					class="mb-10 is-required"
					label-position="top"
					v-if="settingDialog.config.dataShowTree"
				>
					<el-select
						v-model="settingDialog.config.dataParentField"
						placeholder="请选择目录父子管理字段"
						filterable
					>
						<el-option
							v-for="(
								item, inx
							) in settingDialog.referenceFieldParentList"
							:key="inx"
							:label="item.label"
							:value="item.name"
						/>
					</el-select>
				</el-form-item>
			</el-form>
		</div>
		<template #footer>
			<el-button
				:loading="settingDialog.loading"
				type="primary"
				@click="saveSetting"
			>
				保存
			</el-button>
			<el-button
				:loading="settingDialog.loading"
				@click="settingDialog.isShow = false"
			>
				取消
			</el-button>
		</template>
	</ml-dialog>
	<mlSelectIcon
		v-model="isShowIconDialog"
		:useIcon="cutSettingIcon"
		@confirmIcon="selectIcon"
	/>
</template>
<script setup>
import { onMounted, ref } from "vue";
import { ElMessage } from "element-plus";

import { useRouter } from "vue-router";
const Router = useRouter();

import useCommonStore from "@/store/modules/common";
const { queryEntityCodeByEntityName } = useCommonStore();
import { queryReferToEntityFields } from "@/api/crud";

// API
import { getFieldSet } from "@/api/system-manager";
import layoutConfig from "@/api/layoutConfig";

// 组件
import mlSelectIcon from "@/components/mlSelectIcon/index.vue";

const emit = defineEmits(["save-success"]);

let entity = ref("");

onMounted(() => {
	entity.value = Router.currentRoute.value.query.entity;
});

let layoutConfigId = ref("");
const defaultConfig = {
	// 目录图标
	contentsIcon: {
		name: "el-icon-folder-opened",
		color: "",
	},
	// 目录字段
	contentsField: "",
	// 目录父子关联字段
	contentsParentField: "",
	// 数据图标
	dataIcon: {
		name: "el-icon-document",
		color: "",
	},
	// 树状展示数据
	dataShowTree: false,
	// 目录父子管理字段
	dataParentField: "",
};

let settingDialog = ref({
	isShow: false,
	loading: false,
	config: {},
	// 引用字段
	referenceField: [],
	// 引用自己的字段
	referenceFieldParentList: [],
});

// 打开设置弹框
const openSettingDialog = async () => {
	settingDialog.value.isShow = true;
	settingDialog.value.loading = true;
	settingDialog.value.config = { ...defaultConfig };
	let res = await layoutConfig.getLayoutList(entity.value);
	if (res) {
		if (res.data.CUSTOM_TEMPLATE) {
			let { config } = res.data.CUSTOM_TEMPLATE;
			layoutConfigId.value = res.data.CUSTOM_TEMPLATE.layoutConfigId;
			settingDialog.value.config = Object.assign(
				defaultConfig,
				JSON.parse(config)
			);
		}
		let fieldSetRes = await getFieldSet(entity.value);
		if (fieldSetRes) {
			settingDialog.value.referenceField = fieldSetRes.data.filter(
				(el) => el.type == "Reference"
			);
			settingDialog.value.referenceFieldParentList =
				settingDialog.value.referenceField.filter(
					(el) => el.referTo == entity.value
				);
		}
		if (settingDialog.value.config.contentsField) {
			initRefFieldList();
		}
	}
	settingDialog.value.loading = false;
};

// 设置图标颜色
const isShowIconDialog = ref(false);
const cutSettingIcon = ref({});
let cutIconType = ref("");
// 打开图标弹框
const openIconDialog = (type) => {
	isShowIconDialog.value = true;
	cutIconType.value = type;
	cutSettingIcon.value = settingDialog.value.config[type];
};
// 确认选择图标
const selectIcon = (icon) => {
	settingDialog.value.config[cutIconType.value] = icon;
	isShowIconDialog.value = false;
};

// 目录字段修改
const changeReferenceField = () => {
	settingDialog.value.config.contentsParentField = "";
	if (settingDialog.value.config.contentsField) {
		initRefFieldList();
	}
};

// 目录父子关联字段列表
let referenceFieldParentList = ref([]);
let filedLoading = ref(false);

const initRefFieldList = async () => {
	filedLoading.value = true;
	let res = await queryReferToEntityFields(
		entity.value,
		settingDialog.value.config.contentsField,
		true,
		false,
		true
	);
	if (res) {
		let referTo;
		// 拿到引用实体的实体名称
		if (res.data.field.referTo && res.data.field.referTo[0]) {
			referTo = res.data.field.referTo[0]?.name;
			settingDialog.value.config.referTo = referTo;
		}
		let filterField = [
			"createdBy",
			"modifiedBy",
			"ownerUser",
			"ownerDepartment",
		];
		let fieldList = res.data.fieldList || [];
		referenceFieldParentList.value = fieldList.filter(
			(el) =>
				!filterField.includes(el.fieldName) &&
				el.fieldType == "Reference" &&
				el.referenceName == referTo
		);
	}
	filedLoading.value = false;
};

// 保存配置
const saveSetting = async () => {
	// settingDialog.value.isShow = false;
	let { config } = settingDialog.value;
	if (!config.contentsField) {
		ElMessage.error("请选择目录字段");
		return;
	}
	if (!config.contentsParentField) {
		ElMessage.error("请选择目录父子关联字段");
		return;
	}
	if (config.dataShowTree && !config.dataParentField) {
		ElMessage.error("请输入目录父子管理字段");
		return;
	}
	let param = {
		config: JSON.stringify(config),
		entityCode: queryEntityCodeByEntityName(entity.value),
	};
	settingDialog.value.loading = true;
	let res = await layoutConfig.saveConfig(
		layoutConfigId.value,
		"CUSTOM_TEMPLATE",
		param
	);
	if (res) {
		ElMessage.success("保存成功");
		settingDialog.value.isShow = false;
		emit("save-success");
	}
	settingDialog.value.loading = false;
};

defineExpose({
	openSettingDialog,
});
</script>
