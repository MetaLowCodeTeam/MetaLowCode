<template>
	<ml-dialog v-model="isShow" title="自定义按钮设置" width="700">
		<el-row
			:gutter="20"
			v-loading="dialogLoading"
			element-loading-text="加载中..."
		>
			<el-col :span="8">
				<div class="button-list-box">
					<ml-scrollbar>
						<div
							class="button-list-item"
							v-for="item in buttonList"
							:key="item.id"
							@click="selectButton(item)"
						>
							<div
								class="button-list-item-name"
								:title="item.name"
								:class="{
									active:
										currentButton &&
										currentButton.guid === item.guid,
								}"
							>
								{{ item.name }}
							</div>
							<div class="button-list-item-icon">
								<el-icon
									:size="16"
									@click.stop="deleteButton(item)"
								>
									<ElIconClose />
								</el-icon>
							</div>
						</div>
					</ml-scrollbar>
				</div>
				<el-button
					type="primary"
					@click="addButton"
					class="mt-10"
					icon="Plus"
				>
					添加按钮
				</el-button>
			</el-col>
			<el-col :span="16">
				<div class="info-text" v-if="!currentButton">
					点击左侧按钮进行编辑或点击添加按钮
				</div>
				<el-form v-else class="main-form" v-loading="mainLoading">
					<el-row :gutter="20">
						<el-col :span="12">
							<el-form-item
								label="按钮名称"
								prop="name"
								class="has-required"
							>
								<el-input
									v-model="currentButton.name"
									placeholder="请输入按钮名称"
									clearable
									ref="nameRef"
									:class="{
										'is-error': errorStatus.name,
									}"
									@focus="errorStatus.name = false"
								/>
							</el-form-item>
						</el-col>
						<el-col :span="12">
							<el-form-item label="按钮图标">
								<div class="icon-box">
									<span
										class="icon-span icon-top-3"
										v-if="!currentButton.icon"
										@click="openIconDialog"
									>
										<el-icon :size="16">
											<ElIconClose />
										</el-icon>
									</span>
									<span
										class="icon-span icon-top-3"
										@click="openIconDialog"
										v-else
									>
										<el-icon
											:size="16"
											:color="currentButton.iconColor"
										>
											<component
												:is="currentButton.icon"
											/>
										</el-icon>
									</span>
								</div>
							</el-form-item>
						</el-col>
						<el-col :span="12">
							<el-form-item label="按钮类型">
								<el-select
									v-model="currentButton.type"
									placeholder="请选择按钮类型"
								>
									<el-option
										v-for="item in buttonTypeList"
										:key="item.value"
										:label="item.label"
										:value="item.value"
									/>
								</el-select>
							</el-form-item>
						</el-col>
						<el-col :span="12">
							<el-form-item
								label="按钮颜色"
								v-if="currentButton.type === 'custom'"
							>
								<el-color-picker
									v-model="currentButton.color"
								/>
							</el-form-item>
						</el-col>
						<el-col :span="12">
							<el-form-item label="显示类型">
								<el-select
									v-model="currentButton.showType"
									placeholder="请选择显示类型"
								>
									<el-option
										v-for="item in showTypeList"
										:key="item.value"
										:label="item.label"
										:value="item.value"
									/>
								</el-select>
							</el-form-item>
						</el-col>
						<el-col :span="12">
							<el-form-item label="显示位置">
								<el-select
									v-model="currentButton.showPosition"
									placeholder="请选择显示位置"
								>
									<el-option
										v-for="item in showPositionList"
										:key="item.value"
										:label="item.label"
										:value="item.value"
									/>
								</el-select>
							</el-form-item>
						</el-col>
						<el-col :span="12">
							<el-form-item label="执行动作">
								<el-select
									v-model="currentButton.action"
									placeholder="请选择执行动作"
								>
									<el-option
										v-for="item in actionList"
										:key="item.value"
										:label="item.label"
										:value="item.value"
									/>
								</el-select>
							</el-form-item>
						</el-col>
						<el-col :span="12">
							<el-form-item label="可用类型">
								<el-select
									v-model="currentButton.availableType"
								>
									<el-option
										v-for="item in availableTypeList"
										:key="item.value"
										:label="item.label"
										:value="item.value"
									/>
								</el-select>
							</el-form-item>
						</el-col>
						<el-col :span="24">
							<el-form-item label="选择实体" class="has-required">
								<el-select
									v-model="currentButton.selectEntity"
									placeholder="请选择实体"
									:class="{
										'is-error': errorStatus.selectEntity,
									}"
									@focus="errorStatus.selectEntity = false"
									@change="changeEntity"
									filterable
								>
									<el-option
										v-for="item in unSystemEntityList.filter(
											(el) =>
												!el.detailEntityFlag &&
												!el.appAbbr
										)"
										:key="item.name"
										:label="item.label"
										:value="item.name"
									/>
								</el-select>
							</el-form-item>
						</el-col>
						<el-col :span="24">
							<el-form-item
								label="选择表单"
								v-loading="entityFormListLoading"
								class="has-required"
							>
								<el-select
									v-model="currentButton.selectForm"
									placeholder="请选择表单"
									:class="{
										'is-error': errorStatus.selectForm,
									}"
									@focus="errorStatus.selectForm = false"
									filterable
								>
									<el-option
										v-for="item in entityFormList"
										:key="item.formLayoutId"
										:label="item.layoutName"
										:value="item.formLayoutId"
									/>
								</el-select>
							</el-form-item>
						</el-col>
						<el-col :span="24">
							<el-form-item label="选择转换">
								<el-select
									v-model="currentButton.selectDataTransform"
									placeholder="请选择数据转换"
								>
									<el-option
										v-for="item in dataTransformList"
										:key="item.id"
										:label="item.name"
										:value="item.id"
									/>
								</el-select>
							</el-form-item>
						</el-col>
						<el-col :span="24">
							<el-form-item label="按钮预览">
								<el-button
									:type="currentButton.type"
									:color="
										currentButton.type == 'custom'
											? currentButton.color
											: ''
									"
								>
									<el-icon
										:size="16"
										:color="currentButton.iconColor"
										v-if="
											currentButton.icon &&
											currentButton.showType != 3
										"
										style="position: relative; top: -1px"
									>
										<component :is="currentButton.icon" />
									</el-icon>
									<span
										v-if="currentButton.showType != 2"
										:class="{
											'ml-5': currentButton.showType == 1,
										}"
									>
										{{ currentButton.name }}
									</span>
								</el-button>
							</el-form-item>
						</el-col>
					</el-row>
				</el-form>
				<el-button
					type="primary"
					icon="Select"
					v-if="currentButton"
					@click="confirmAddButton"
				>
					确认添加
				</el-button>
			</el-col>
		</el-row>
		<template #footer>
			<el-button @click="closeDialog">取消</el-button>
			<el-button type="primary" @click="saveButton">保存</el-button>
		</template>
	</ml-dialog>
	<mlSelectIcon
		v-model="isShowIconDialog"
		:useIcon="cutSettingIcon"
		@confirmIcon="selectIcon"
	/>
</template>
<script setup>
import { ref, nextTick } from "vue";
// 滚动条
import mlScrollbar from "@/components/mlScrollbar/index.vue";
import { deepClone, getGuid } from "@/utils/util";
import { ElMessageBox, ElMessage } from "element-plus";
import mlSelectIcon from "@/components/mlSelectIcon/index.vue";
import useCommonStore from "@/store/modules/common";
import { storeToRefs } from "pinia";
// API
// 获取所有实体表单
import { getFormLayoutList } from "@/api/system-manager";
// 获取数据转换
import { queryByEntity } from "@/api/transform";

const { unSystemEntityList } = storeToRefs(useCommonStore());

const isShow = ref(false);

// 按钮类型
const buttonTypeList = ref([
	{ label: "默认", value: "default" },
	{ label: "主要", value: "primary" },
	{ label: "成功", value: "success" },
	{ label: "警告", value: "warning" },
	{ label: "危险", value: "danger" },
	{ label: "信息", value: "info" },
	{ label: "自定义", value: "custom" },
]);
// 显示类型
const showTypeList = ref([
	{ label: "默认", value: 1 },
	{ label: "仅图标", value: 2 },
	{ label: "仅文字", value: 3 },
]);
// 显示位置
const showPositionList = ref([
	{ label: "打开前", value: 1 },
	{ label: "编辑前", value: 2 },
	{ label: "批量编辑前", value: 3 },
	{ label: "新建前", value: 4 },
	{ label: "更多前", value: 5 },
	{ label: "更多后", value: 6 },
]);
// 选择动作
const actionList = ref([
	{ label: "新建", value: 1 },
	{ label: "编辑", value: 2 },
	{ label: "数据转化", value: 3 },
]);
// 可用类型
const availableTypeList = ref([
	{ label: "勾选一条数据", value: 1 },
	{ label: "勾选多条数据", value: 2 },
]);

let defaultButtonConfig = ref({
	// 按钮名称
	name: "",
	// 按钮图标
	icon: "",
	// 按钮图标颜色
	iconColor: "",
	// 按钮类型 按钮类型，在设置color时，后者优先。
	type: "default",
	// 按钮颜色
	color: "",
	// 按钮尺寸
	size: "",
	// 按钮显示类型 1默认 2仅图标 3仅文字
	showType: 1,
	// 显示位置
	showPosition: 1,
	// 可用类型
	availableType: 1,
	// 执行动作
	action: 1,
	// 选择实体
	selectEntity: "",
	// 选择表单
	selectForm: "",
	// 选择数据转换
	selectDataTransform: "",
	// guid
	guid: "",
});

// 错误状态
let errorStatus = ref({
	name: false,
	selectEntity: false,
	selectForm: false,
});

// 整体
let dialogLoading = ref(false);
// 主体loading
let mainLoading = ref(false);

// 按钮列表
const buttonList = ref([]);

let currentButton = ref(null);

// 选择按钮
const selectButton = (item) => {
	currentButton.value = deepClone(item);
};

let nameRef = ref(null);
// 添加按钮
const addButton = () => {
	let newButton = deepClone(defaultButtonConfig.value);
	newButton.name = "按钮" + (buttonList.value.length + 1);
	newButton.guid = getGuid();
	currentButton.value = newButton;
	nextTick(() => {
		nameRef.value.focus();
	});
};

// 确认添加
const confirmAddButton = () => {
	let { name, selectEntity, selectForm } = currentButton.value;
	if (!name) {
		errorStatus.value.name = true;
		ElMessage.error("请输入按钮名称");
		return;
	}
	if (!selectEntity) {
		errorStatus.value.selectEntity = true;
		ElMessage.error("请选择实体");
		return;
	}
	if (!selectForm) {
		errorStatus.value.selectForm = true;
		ElMessage.error("请选择表单");
		return;
	}
	console.log(currentButton.value, "currentButton.value");
};

// 删除按钮
const deleteButton = (item) => {
	ElMessageBox.confirm("确定要删除【" + item.name + "】吗？", "提示", {
		confirmButtonText: "确定",
		cancelButtonText: "取消",
		type: "warning",
	})
		.then(() => {
			buttonList.value = buttonList.value.filter(
				(el) => el.guid !== item.guid
			);
		})
		.catch(() => {});
};

// 选择图标
const isShowIconDialog = ref(false);
const cutSettingIcon = ref({});
// 打开图标弹框
const openIconDialog = () => {
	isShowIconDialog.value = true;
	cutSettingIcon.value = {
		name: currentButton.value.icon,
		color: currentButton.value.iconColor,
	};
};
// 确认选择图标
const selectIcon = (icon) => {
	currentButton.value.icon = icon.name;
	currentButton.value.iconColor = icon.color;
	isShowIconDialog.value = false;
};

// 选择实体
const changeEntity = () => {
	currentButton.value.selectForm = "";
	currentButton.value.selectDataTransform = "";
	entityFormList.value = [];
	loadEntityFormList();
	loadDataTransformList();
};

// 实体表单
const entityFormList = ref([]);
let entityFormListLoading = ref(false);
// 加载实体表单
const loadEntityFormList = async () => {
	entityFormListLoading.value = true;
	let res = await getFormLayoutList(currentButton.value.selectEntity);
	if (res && res.code === 200) {
		entityFormList.value = res.data
			? res.data.filter((item) => item.formLayoutId)
			: [];
	}
	entityFormListLoading.value = false;
};
// 数据转换
const dataTransformList = ref([]);



let currentEntity = ref({});
// 打开弹窗
const openDialog = async (entity) => {
    console.log(entity, "entity");
	currentEntity.value = entity;
	isShow.value = true;
    dialogLoading.value = true;
    await loadDataTransformList();
    dialogLoading.value = false;
};

// 加载数据转换
const loadDataTransformList = async () => {
	let res = await queryByEntity(currentEntity.value.entityName);
	if (res && res.code === 200) {
		dataTransformList.value = res.data || [];
	}
};

// 关闭弹窗
const closeDialog = () => {
	isShow.value = false;
};

// 保存按钮
const saveButton = () => {
	console.log(currentButton.value);
};

defineExpose({
	openDialog,
	closeDialog,
});
</script>
<style lang="scss" scoped>
.button-list-box {
	border: 1px solid #e6e6e6;
	border-radius: 4px;
	box-sizing: border-box;
	// padding: 5px 10px;
	padding: 3px;
	height: 400px;
	.button-list-item {
		cursor: pointer;
		box-sizing: border-box;
		padding: 0 10px;
		border: 1px solid #e6e6e6;
		margin-bottom: 3px;
		height: 32px;
		line-height: 32px;
		display: flex;
		align-items: center;
		justify-content: space-between;

		.button-list-item-name {
			flex: 1;
			margin-right: 10px;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
			&.active {
				color: var(--el-color-primary);
			}
		}
		.button-list-item-icon {
			flex: 0 0 12px;
			margin-top: 5px;
			display: none;
		}
		&:hover {
			background-color: #f0f0f0;
			.button-list-item-icon {
				display: block;
			}
		}
	}
}

.icon-box {
	cursor: pointer;
	width: 32px;
	height: 32px;
	border: 1px solid #e6e6e6;
	border-radius: 4px;
	display: flex;
	align-items: center;
	justify-content: center;
	&:hover {
		border-color: var(--el-border-color-hover);
	}
}
.main-form {
	:deep(.el-form-item) {
		margin-bottom: 10px;
		&.has-required {
			.el-form-item__label {
				position: relative;
				&::before {
					content: "*";
					color: var(--el-color-danger);
					position: absolute;
					left: -10px;
				}
			}
		}
	}
}
</style>
