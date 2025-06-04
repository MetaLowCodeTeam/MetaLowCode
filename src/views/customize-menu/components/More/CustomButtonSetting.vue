<template>
	<ml-dialog v-model="isShow" title="自定义按钮设置" width="800">
		<el-row
			:gutter="20"
			v-loading="dialogLoading"
			element-loading-text="加载中..."
		>
			<el-col :span="7">
				<div class="button-list-box">
					<ml-scrollbar>
						<VueDraggableNext
							ghost-class="ml-draggable-ghost"
							chosen-class="chosenClass"
							animation="300"
							:force-fallback="false"
							handle=".ml-draggable-mover"
							:list="buttonList"
						>
							<div
								class="button-list-item ml-draggable-item"
								v-for="item in buttonList"
								:key="item.id"
								@click="selectButton(item)"
							>
								<div class="ml-draggable-mover">
									<el-icon :size="16">
										<ElIconRank />
									</el-icon>
								</div>
								<div
									class="button-list-item-name ml-draggable-item"
									:title="item.name"
									:class="{
										active:
											currentButton &&
											currentButton.guid === item.guid,
									}"
								>
									<el-icon
										:size="16"
										:color="item.iconColor"
										class="icon-top-2"
										v-if="item.icon"
									>
										<component :is="item.icon" />
									</el-icon>
									{{ item.name }}
									<span v-if="item.isNative">(内置)</span>
								</div>
								<div
									class="button-list-item-icon"
									v-if="!item.isNative"
								>
									<el-icon
										:size="16"
										@click.stop="deleteButton(item)"
									>
										<ElIconClose />
									</el-icon>
								</div>
							</div>
						</VueDraggableNext>
					</ml-scrollbar>
				</div>
				<el-button
					@click="addButton"
					class="mt-3"
					style="width: 100%"
					type="primary"
					plain
				>
					添加按钮
				</el-button>
			</el-col>
			<el-col :span="17">
				<el-tabs v-model="currentTab" @tab-change="tabChange">
					<el-tab-pane
						v-for="(tab, tabInx) of tabList"
						:key="tabInx"
						:label="tab.label"
						:name="tab.name"
					>
						<div class="info-text" v-if="!currentButton">
							点击左侧按钮进行编辑或点击添加按钮
						</div>
						<el-form
							v-else
							class="main-form"
							v-loading="mainLoading"
						>
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
													:color="
														currentButton.iconColor
													"
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
												style="
													position: relative;
													top: -1px;
												"
											>
												<component
													:is="currentButton.icon"
												/>
											</el-icon>
											<span
												v-if="
													currentButton.showType != 2
												"
												:class="{
													'ml-5':
														currentButton.showType ==
															1 &&
														currentButton.icon,
												}"
											>
												{{ currentButton.name }}
											</span>
										</el-button>
									</el-form-item>
								</el-col>
								<el-col
									:span="24"
									v-if="currentButton.isNative"
								>
									<el-form-item label="是否显示">
										<el-switch
											v-model="currentButton.hide"
											:active-value="false"
											:inactive-value="true"
                                            v-if="currentButton.key != 'batchEdit'"
										/>
                                        <div class="ml-info-text" v-else>批量编辑按钮不支持隐藏，由列表更多菜单批量编辑控制</div>
									</el-form-item>
								</el-col>
								<template v-if="!currentButton.isNative">
									<el-divider />
									<!-- 叠加自定义权限 -->
									<el-col :span="24">
										<el-form-item label="叠加自定义权限">
											<div class="custom-right-box">
												<el-select
													v-model="
														currentButton.customCode
													"
													placeholder="请选择权限"
													clearable
													filterable
													allow-create
													class="custom-right-select"
												>
													<el-option
														v-for="item in customRightList"
														:key="item.value"
														:label="item.label"
														:value="item.value"
													/>
												</el-select>
												<el-tooltip
													content="取反后，用户不包含选定条件菜单才会显示。"
													placement="top"
												>
													<el-checkbox
														style="width: 60px"
														v-model="
															currentButton.reversalCustomCode
														"
														label="取反"
													/>
												</el-tooltip>
											</div>
										</el-form-item>
									</el-col>
									<el-divider />
									<el-col :span="12">
										<el-form-item label="执行动作">
											<el-select
												v-model="currentButton.action"
												placeholder="请选择执行动作"
												@change="changeAction"
											>
												<el-option
													v-for="item in actionList"
													:key="item.value"
													:label="item.label"
													:value="item.value"
													:disabled="item.disabled"
												/>
											</el-select>
										</el-form-item>
									</el-col>
									<el-col
										:span="24"
										v-if="currentButton.action != 1"
									>
										<el-form-item label="可用类型">
											<el-radio-group
												v-model="
													currentButton.availableType
												"
											>
												<el-radio
													v-for="item in availableTypeList"
													:key="item.value"
													:label="item.label"
													:value="item.value"
													:disabled="
														currentButton.action ==
															3 && item.value == 2
													"
												/>
											</el-radio-group>
											<el-tooltip
												content="勾选多条数据移动端无效"
												placement="top"
											>
												<el-icon class="ml-5">
													<ElIconQuestionFilled />
												</el-icon>
											</el-tooltip>
										</el-form-item>
									</el-col>
									<!-- 过滤条件 -->
									<el-col
										:span="24"
										v-if="
											currentButton.action != 1 &&
											currentButton.availableType == 1
										"
									>
										<el-form-item label="使用条件">
											<SetConditionsDialog
												title="附加过滤条件"
												:conditionConf="
													currentButton.filterJson
												"
												:entityName="
													queryEntityNameByCode(
														entityCode
													)
												"
												@confirm="conditionConfirm"
											/>
										</el-form-item>
										<el-form-item
											label="提示文案"
											v-if="
												currentButton.filterJson?.items
													?.length > 0
											"
										>
											<el-input
												v-model="
													currentButton.errorTipText
												"
												placeholder="请输入不满足条件时的提示文案"
												clearable
											/>
										</el-form-item>
									</el-col>
									<!-- 选择实体 -->
									<el-col
										:span="24"
										v-if="
											currentButton.action == 1 ||
											currentButton.action == 3
										"
									>
										<el-form-item
											label="选择实体"
											class="has-required"
										>
											<el-select
												v-model="
													currentButton.selectEntity
												"
												placeholder="请选择实体"
												:class="{
													'is-error':
														errorStatus.selectEntity,
												}"
												@focus="
													errorStatus.selectEntity = false
												"
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
									<!-- 选择表单 -->
									<el-col
										:span="24"
										v-if="currentButton.action != 4"
									>
										<el-form-item
											label="选择表单"
											v-loading="entityFormListLoading"
											class="has-required"
										>
											<el-select
												v-model="
													currentButton.selectForm
												"
												placeholder="请选择表单"
												:class="{
													'is-error':
														errorStatus.selectForm,
												}"
												@focus="
													errorStatus.selectForm = false
												"
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
									<!-- 选择数据转换 -->
									<el-col
										:span="24"
										v-if="currentButton.action == 3"
									>
										<el-form-item
											label="选择转换"
											class="has-required"
										>
											<el-select
												v-model="
													currentButton.selectDataTransform
												"
												placeholder="请选择数据转换"
												:class="{
													'is-error':
														errorStatus.selectDataTransform,
												}"
												@focus="
													errorStatus.selectDataTransform = false
												"
											>
												<el-option
													v-for="item in dataTransformList.filter(
														(el) =>
															el.targetEntity ===
															currentButton.selectEntity
													)"
													:key="item.transformId"
													:label="item.transformName"
													:value="item.transformId"
												/>
											</el-select>
										</el-form-item>
									</el-col>
									<!-- 执行脚本 -->
									<el-col
										:span="24"
										v-if="currentButton.action == 4"
									>
										<el-form-item label="执行脚本">
											<el-input
												v-model="
													currentButton.customScript
												"
												type="textarea"
												placeholder="请输入自定义脚本"
												@click="
													openScriptDialog(
														'customScript'
													)
												"
												readonly
												:rows="1"
											/>
										</el-form-item>
									</el-col>
									<!-- 前置事件 -->
									<el-col
										:span="24"
										v-if="currentButton.action !== 4"
									>
										<el-form-item label="前置事件">
											<el-input
												v-model="
													currentButton.beforeEvent
												"
												type="textarea"
												placeholder="请输入前置事件"
												@click="
													openScriptDialog(
														'beforeEvent'
													)
												"
												readonly
												:rows="1"
											/>
										</el-form-item>
									</el-col>
									<!-- 完成回调 -->
									<el-col :span="24">
										<el-form-item label="完成回调">
											<el-input
												v-model="
													currentButton.afterEvent
												"
												type="textarea"
												placeholder="请输入新建、编辑完的回调"
												@click="
													openScriptDialog(
														'afterEvent'
													)
												"
												readonly
												:rows="1"
											/>
										</el-form-item>
									</el-col>
								</template>
							</el-row>
						</el-form>
					</el-tab-pane>
				</el-tabs>
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
	<ml-dialog
		v-model="isShowScriptDialog"
		title="执行脚本"
		width="700"
		append-to-body
	>
		<div class="script-box">
			<mlCodeEditor v-model="customScript" funcParam="rows,exposed" />
		</div>
		<template #footer>
			<el-button @click="closeScriptDialog">取消</el-button>
			<el-button type="primary" @click="saveScript">确认</el-button>
		</template>
	</ml-dialog>
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
import SetConditionsDialog from "@/components/mlSetConditions/Dialog.vue";
// 代码编辑器
import mlCodeEditor from "@/components/mlCodeEditor/index.vue";
// API
// 获取所有实体表单
import { getFormLayoutList, getSystemConstants } from "@/api/system-manager";
import layoutConfigApi from "@/api/layoutConfig";
// 获取数据转换
import { queryByEntity } from "@/api/transform";
// hook
import useCustomButtonConfig from "@/hooks/useCustomButtonConfig";
// 拖拽组件
import { VueDraggableNext } from "vue-draggable-next";
const {
	// tab配置
	tabList,
	// 按钮类型
	buttonTypeList,
	// 显示类型
	showTypeList,
	// 选择动作
	actionList,
	// 可用类型
	availableTypeList,
	// 默认自定义按钮配置
	defaultButtonConfig,
	// 默认顶部按钮PC
	defaultPcTopButtonList,
} = useCustomButtonConfig();

const props = defineProps({
	modelName: {
		type: String,
		default: "",
	},
	entityCode: {
		type: [String, Number],
		default: "",
	},
});
const { queryEntityNameByCode } = useCommonStore();
const { unSystemEntityList } = storeToRefs(useCommonStore());

const emit = defineEmits(["confirm"]);

const isShow = ref(false);

const currentTab = ref("pcTop");

// 显示位置
const showPositionList = ref([]);

// 错误状态
let errorStatus = ref({
	name: false,
	selectEntity: false,
	selectForm: false,
	selectDataTransform: false,
});

const clearErrorStatus = () => {
	errorStatus.value = {
		name: false,
		selectEntity: false,
		selectForm: false,
		selectDataTransform: false,
	};
};

// 整体
let dialogLoading = ref(false);
// 主体loading
let mainLoading = ref(false);
// 配置ID
let layoutConfigId = ref(null);

// 按钮列表
const buttonList = ref([]);

let currentButton = ref(null);

// 选择按钮
const selectButton = (item) => {
	currentButton.value = item;
	clearErrorStatus();
	loadEntityFormList();
};

let nameRef = ref(null);
// 添加按钮
const addButton = () => {
	if (checkData()) {
		let newButton = deepClone(defaultButtonConfig);
		newButton.name = "按钮" + (buttonList.value.length + 1);
		newButton.guid = getGuid();
		currentButton.value = newButton;
		buttonList.value.push(newButton);
	}
};

// 校验数据是否可通过
const checkData = () => {
	if (buttonList.value.length > 0) {
		for (let i = 0; i < buttonList.value.length; i++) {
			if (buttonList.value[i].isNative) {
				continue;
			}
			currentButton.value = buttonList.value[i];
			let { name, selectEntity, selectForm, selectDataTransform } =
				buttonList.value[i];
			if (!name) {
				errorStatus.value.name = true;
				ElMessage.error("请输入按钮名称");
				return false;
			}
			if (!selectEntity && currentButton.value.action != 4) {
				errorStatus.value.selectEntity = true;
				ElMessage.error("请选择实体");
				return false;
			}
			if (!selectForm && currentButton.value.action != 4) {
				errorStatus.value.selectForm = true;
				ElMessage.error("请选择表单");
				return false;
			}
			if (!selectDataTransform && currentButton.value.action == 3) {
				errorStatus.value.selectDataTransform = true;
				ElMessage.error("请选择数据转换");
				return false;
			}
		}
	}
	return true;
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
			if (currentButton.value.guid === item.guid) {
				currentButton.value = null;
			}
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

// 选择动作
const changeAction = () => {
	clearErrorStatus();
	if (currentButton.value.action == 2) {
		currentButton.value.selectEntity = currentEntity.value.entityName;
		changeEntity();
	}
	if (currentButton.value.action == 3) {
		currentButton.value.availableType = 1;
	}
};

// 选择实体
const changeEntity = () => {
	currentButton.value.selectForm = "";
	currentButton.value.selectDataTransform = "";
	entityFormList.value = [];
	loadEntityFormList();
};

// 实体表单
const entityFormList = ref([]);
let entityFormListLoading = ref(false);
// 加载实体表单
const loadEntityFormList = async () => {
	if (!currentButton.value.selectEntity) {
		return;
	}
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
let layoutConfigData = ref({});
// 打开弹窗
const openDialog = async (entity) => {
	console.log(entity, "entity");
	// 自定义按钮配置ID
	if (entity.customButtonId) {
		layoutConfigId.value = entity.customButtonId;
	}
	// 自定义按钮配置数据
	if (entity.customButton) {
		layoutConfigData.value = { ...entity.customButton };
		// buttonList.value = [...entity.customButton];
	}
	currentTab.value = "pcTop";
	currentEntity.value = entity;
	isShow.value = true;
	dialogLoading.value = true;
	await loadDataTransformList();
	await getCustomRightList();
	// currentButton.value = null;
	// if (buttonList.value.length > 0) {
	// 	currentButton.value = buttonList.value[0];
	// 	loadEntityFormList();
	// }
	// 初始化自定义按钮配置
	initTabButtonConfig(currentTab.value);
	dialogLoading.value = false;
};

// 初始化自定义按钮配置
const initTabButtonConfig = (tab) => {
	let findTab = tabList.value.find((item) => item.name == tab);
	if (
		tab == "pcTop" &&
		(!findTab.buttonList || findTab.buttonList.length == 0)
	) {
		findTab.buttonList = [...defaultPcTopButtonList];
	}
	// currentButton.value = findTab.buttonList[0];
	buttonList.value = [...findTab.buttonList];
};

// 切换tab
const tabChange = (tab) => {
	// console.log(tab, "tab");
	// let findTab = tabList.value.find((item) => item.name == tab);
	// if (findTab) {
	// 	findTab.buttonList.push({});
	// }
};

// 加载数据转换
const loadDataTransformList = async () => {
	let res = await queryByEntity({
		sourceEntityName: currentEntity.value.entityName,
	});
	if (res && res.code === 200) {
		dataTransformList.value = res.data || [];
	}
};

// 获取自定义权限
const customRightList = ref([]);
const getCustomRightList = async () => {
	let res = await getSystemConstants("customRight");
	if (res && res.data) {
		customRightList.value = res.data;
	}
};

// 打开脚本弹窗
const isShowScriptDialog = ref(false);
let customScript = ref("");
let currentKey = ref("");

// 打开脚本弹框
const openScriptDialog = (key) => {
	isShowScriptDialog.value = true;
	currentKey.value = key;
	customScript.value = currentButton.value[key];
};
// 确认脚本
const saveScript = () => {
	isShowScriptDialog.value = false;
	currentButton.value[currentKey.value] = customScript.value;
};
// 关闭脚本弹窗
const closeScriptDialog = () => {
	isShowScriptDialog.value = false;
};

// 确认条件
const conditionConfirm = (v) => {
	currentButton.value.filterJson = v;
};

// 关闭弹窗
const closeDialog = () => {
	isShow.value = false;
};

// 保存按钮
const saveButton = async () => {
	if (checkData()) {
		let param = {
			config: JSON.stringify(buttonList.value),
			entityCode: props.entityCode,
			shareTo: "ALL",
		};
		mainLoading.value = true;
		let res = await layoutConfigApi.saveConfig(
			layoutConfigId.value,
			"CUSTOM_BUTTON",
			param,
			props.modelName
		);
		if (res) {
			ElMessage.success("保存成功");
			emit("confirm");
			isShow.value = false;
		}
		mainLoading.value = false;
	}
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
	height: 486px;
	.button-list-item {
		cursor: pointer;
		box-sizing: border-box;
		// padding: 0 10px;
		border: 1px solid #e6e6e6;
		margin-bottom: 3px;
		height: 32px;
		line-height: 32px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		.ml-draggable-mover {
			width: 32px;
			height: 32px;
			border-radius: 3px;
			display: flex;
			align-items: center;
			justify-content: center;
			background: var(--el-color-primary);
			color: #fff;
			&:hover {
				background: var(--el-color-primary-light-3);
			}
		}

		.button-list-item-name {
			flex: 1;
			margin-right: 10px;
			margin-left: 10px;
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
		.button-list-item-name.active + .button-list-item-icon {
			display: block;
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
	:deep(.el-radio-group) {
		display: flex;
		flex-wrap: nowrap;
	}
	:deep(.el-divider) {
		margin: 10px 0;
		margin-top: 0;
	}
}
.custom-right-box {
	display: flex;
	width: 100%;
	.custom-right-select {
		flex: 1;
		margin-right: 10px;
	}
}

/**
* 拖拽
*/

.chosenClass {
	background: #fff;
	// background-color: #f1f1f1;
}

.subghost {
	border: 1px dashed #999;
	background: #fff !important;
	.submover,
	.button-list-item {
		opacity: 0;
	}
}
</style>
