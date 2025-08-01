<template>
	<ml-dialog
		:title="formModel.roleId ? '编辑权限角色' : '新建权限角色'"
		v-model="showRoleFormDialogFlag"
		:destroy-on-close="true"
		:close-on-click-modal="false"
		class="small-padding"
		:show-close="true"
		:close-on-press-escape="false"
		width="1160px"
		:z-index="2001"
	>
		<el-form
			label-position="left"
			:label-width="'150px'"
			size
			ref="roleFormRes"
			:model="formModel"
			:rules="formRules"
			v-loading="roleFormDialogLoading"
			element-loading-text="数据加载中..."
		>
			<el-row :gutter="12">
				<el-col :span="12">
					<el-form-item
						label="角色名称"
						prop="roleName"
						class="is-required"
					>
						<el-input
							v-model="formModel.roleName"
							maxlength="30"
						></el-input>
					</el-form-item>
				</el-col>
				<el-col :span="12">
					<el-form-item label="是否禁用">
						<el-radio-group v-model="formModel.disabled">
							<el-radio :value="true">是</el-radio>
							<el-radio :value="false">否</el-radio>
						</el-radio-group>
					</el-form-item>
				</el-col>
			</el-row>
			<el-row :gutter="12">
				<el-col :span="24">
					<el-form-item label="角色说明">
						<el-input
							type="textarea"
							:autosize="{ minRows: 2, maxRows: 3 }"
							v-model="formModel.description"
						></el-input>
					</el-form-item>
				</el-col>
			</el-row>

			<el-tabs type="border-card">
				<el-tab-pane label="数据权限">
					<div class="entity-right-setting title">
						<div class="fl label">
							<el-input
								size="small"
								v-model="filterStr"
								placeholder="过滤实体（回车搜索）"
								@keyup.enter="queryEntity"
							>
								<template #prefix>
									<el-icon class="el-input__icon">
										<ElIconSearch />
									</el-icon>
								</template>
							</el-input>
						</div>
						<div class="fl text-align-center bold">
							<el-dropdown
								trigger="click"
								@command="(e) => columnCommand(e, '1')"
							>
								<span class="text-icon-all">
									查看权限
									<el-icon size="16" class="icon-top-2">
										<ElIconFinished />
									</el-icon>
								</span>
								<template #dropdown>
									<el-dropdown-menu>
										<el-dropdown-item
											v-for="(
												item, inx
											) in getColumnRightLevels('1')"
											:key="inx"
											:command="item.value"
										>
											{{ item.label }}
										</el-dropdown-item>
									</el-dropdown-menu>
								</template>
							</el-dropdown>
						</div>
						<div class="fl text-align-center bold">
							<el-dropdown
								trigger="click"
								@command="(e) => columnCommand(e, '2')"
							>
								<span class="text-icon-all">
									新建权限
									<el-icon size="16" class="icon-top-2">
										<ElIconFinished />
									</el-icon>
								</span>
								<template #dropdown>
									<el-dropdown-menu>
										<el-dropdown-item
											v-for="(
												item, inx
											) in getColumnRightLevels('2')"
											:key="inx"
											:command="item.value"
										>
											{{ item.label }}
										</el-dropdown-item>
									</el-dropdown-menu>
								</template>
							</el-dropdown>
						</div>
						<div class="fl text-align-center bold">
							<el-dropdown
								trigger="click"
								@command="(e) => columnCommand(e, '3')"
							>
								<span class="text-icon-all">
									修改权限
									<el-icon size="16" class="icon-top-2">
										<ElIconFinished />
									</el-icon>
								</span>
								<template #dropdown>
									<el-dropdown-menu>
										<el-dropdown-item
											v-for="(
												item, inx
											) in getColumnRightLevels('3')"
											:key="inx"
											:command="item.value"
										>
											{{ item.label }}
										</el-dropdown-item>
									</el-dropdown-menu>
								</template>
							</el-dropdown>
						</div>
						<div class="fl text-align-center bold">
							<el-dropdown
								trigger="click"
								@command="(e) => columnCommand(e, '4')"
							>
								<span class="text-icon-all">
									删除权限
									<el-icon size="16" class="icon-top-2">
										<ElIconFinished />
									</el-icon>
								</span>
								<template #dropdown>
									<el-dropdown-menu>
										<el-dropdown-item
											v-for="(
												item, inx
											) in getColumnRightLevels('4')"
											:key="inx"
											:command="item.value"
										>
											{{ item.label }}
										</el-dropdown-item>
									</el-dropdown-menu>
								</template>
							</el-dropdown>
						</div>
						<div class="fl text-align-center bold">
							<el-dropdown
								trigger="click"
								@command="(e) => columnCommand(e, '5')"
							>
								<span class="text-icon-all">
									分配权限
									<el-icon size="16" class="icon-top-2">
										<ElIconFinished />
									</el-icon>
								</span>
								<template #dropdown>
									<el-dropdown-menu>
										<el-dropdown-item
											v-for="(
												item, inx
											) in getColumnRightLevels('5')"
											:key="inx"
											:command="item.value"
										>
											{{ item.label }}
										</el-dropdown-item>
									</el-dropdown-menu>
								</template>
							</el-dropdown>
						</div>
						<div class="fl text-align-center bold">
							<el-dropdown
								trigger="click"
								@command="(e) => columnCommand(e, '6')"
							>
								<span class="text-icon-all">
									共享权限
									<el-icon size="16" class="icon-top-2">
										<ElIconFinished />
									</el-icon>
								</span>
								<template #dropdown>
									<el-dropdown-menu>
										<el-dropdown-item
											v-for="(
												item, inx
											) in getColumnRightLevels('6')"
											:key="inx"
											:command="item.value"
										>
											{{ item.label }}
										</el-dropdown-item>
									</el-dropdown-menu>
								</template>
							</el-dropdown>
						</div>
						<div class="fl">
							<el-dropdown
								trigger="click"
								@command="allHandleCommand"
							>
								<span class="text-icon-all">
									<el-icon size="16">
										<ElIconFinished />
									</el-icon>
								</span>
								<template #dropdown>
									<el-dropdown-menu>
										<el-dropdown-item
											:command="dropItem.value"
											v-for="(
												dropItem, dropInx
											) of simpleRightLevels"
											:key="dropInx"
											>{{
												dropItem.label
											}}</el-dropdown-item
										>
									</el-dropdown-menu>
								</template>
							</el-dropdown>
						</div>
					</div>
					<div class="entity-right-setting-body">
						<el-scrollbar>
							<div
								class="entity-right-setting"
								v-for="(
									rightEntity, entityIdx
								) in filterEntityList"
								:key="entityIdx"
							>
								<div class="fl label">
									{{ rightEntity.label }}
								</div>
								<div class="fl text-align-center">
									<mlSelectCom
										v-model="
											formModel.rightValueMap[
												'r' +
													rightEntity.entityCode +
													'-1'
											]
										"
										:options="getRightLevels(rightEntity)"
									/>
								</div>
								<div class="fl text-align-center">
									<mlSelectCom
										v-model="
											formModel.rightValueMap[
												'r' +
													rightEntity.entityCode +
													'-2'
											]
										"
										:options="oneselfRightLevels"
									/>
								</div>
								<div class="fl text-align-center">
									<mlSelectCom
										v-model="
											formModel.rightValueMap[
												'r' +
													rightEntity.entityCode +
													'-3'
											]
										"
										:options="getRightLevels(rightEntity)"
									/>
								</div>
								<div class="fl text-align-center">
									<mlSelectCom
										v-model="
											formModel.rightValueMap[
												'r' +
													rightEntity.entityCode +
													'-4'
											]
										"
										:options="getRightLevels(rightEntity)"
									/>
								</div>
								<div class="fl text-align-center">
									<mlSelectCom
										v-model="
											formModel.rightValueMap[
												'r' +
													rightEntity.entityCode +
													'-5'
											]
										"
										:options="getRightLevels(rightEntity)"
										:disabled="!rightEntity.authorizable"
									/>
								</div>
								<div class="fl text-align-center">
									<mlSelectCom
										v-model="
											formModel.rightValueMap[
												'r' +
													rightEntity.entityCode +
													'-6'
											]
										"
										:options="getRightLevels(rightEntity)"
									/>
								</div>
								<div class="fl text-icon">
									<mlSelectCom
										:options="getRightLevels(rightEntity)"
										@onChange="
											(e) =>
												rowHandleCommand(e, rightEntity)
										"
									>
										<template #default>
											<span class="text-icon-span">
												<el-icon size="16">
													<ElIconFinished />
												</el-icon>
											</span>
										</template>
									</mlSelectCom>
								</div>
							</div>
						</el-scrollbar>
					</div>
				</el-tab-pane>

				<el-tab-pane label="系统权限">
					<el-row>
						<hr style="border: 0; border-top: 1px dotted #cccccc" />
					</el-row>
					<div class="function-right-row-box">
						<el-row :gutter="12" class="function-right-row">
							<el-col
								:span="24"
								v-for="(op, opInx) of funcRight"
								:key="opInx"
							>
								<el-divider
									content-position="left"
									v-if="!op.hideDivider"
								>
									{{ op.label }}
								</el-divider>
								<el-row :gutter="12" class="function-right-row">
									<el-col
										:span="12"
										v-for="(
											funcItem, funcInx
										) of op.children"
										:key="funcInx"
									>
										<el-form-item :title="funcItem.value">
											<template #label>
												{{ funcItem.label }}
												<el-tooltip
													v-if="funcItem.tip"
													placement="top"
												>
													<template #content>
														<div
															style="width: 300px"
														>
															{{ funcItem.tip }}
														</div>
													</template>
													<el-icon
														style="
															margin-left: 3px;
															position: relative;
															top: 9px;
															cursor: pointer;
														"
													>
														<ElIconQuestionFilled />
													</el-icon>
												</el-tooltip>
											</template>
											<el-radio-group
												v-model="
													formModel.rightValueMap[
														funcItem.value
													]
												"
											>
												<el-radio :value="true">
													是
												</el-radio>
												<el-radio :value="false">
													否
												</el-radio>
											</el-radio-group>
										</el-form-item>
									</el-col>
								</el-row>
							</el-col>
						</el-row>
					</div>
				</el-tab-pane>
				<el-tab-pane
					label="自定义权限"
					v-if="
						formModel.customRightList &&
						formModel.customRightList.length > 0
					"
				>
					<el-row>
						<hr style="border: 0; border-top: 1px dotted #cccccc" />
					</el-row>
					<el-row :gutter="12" class="function-right-row">
						<el-col
							:span="12"
							v-for="(
								funcItem, funcInx
							) of formModel.customRightList"
							:key="funcInx"
						>
							<el-form-item :title="funcItem.value">
								<template #label>
									{{ funcItem.label }}
								</template>
								<el-radio-group
									v-model="
										formModel.rightValueMap[funcItem.value]
									"
								>
									<el-radio :value="true">是</el-radio>
									<el-radio :value="false">否</el-radio>
								</el-radio-group>
							</el-form-item>
						</el-col>
					</el-row>
				</el-tab-pane>
			</el-tabs>
		</el-form>
		<template #footer>
			<div class="dialog-footer">
				<el-button
					type="primary"
					@click="saveRole"
					style="width: 90px"
					:loading="roleFormDialogLoading"
				>
					保 存
				</el-button>
				<el-button
					@click="showRoleFormDialogFlag = false"
					:loading="roleFormDialogLoading"
				>
					取 消
				</el-button>
			</div>
		</template>
	</ml-dialog>
</template>

<script setup>
import { ref, shallowRef } from "vue";
import { ElMessage } from "element-plus";
import mlSelectCom from "@/components/mlSelectCom/index.vue";
import { getBlankRoleData, saveRoleData, getRoleData } from "@/api/user";

// 定义emit事件
const emit = defineEmits(["refresh"]);
// 弹框显示
let showRoleFormDialogFlag = ref(false);

// 弹框加载
let roleFormDialogLoading = ref(false);

// 弹框数据
let formModel = ref({
	roleId: "",
	roleName: "",
	disabled: false,
	description: "",
	rightValueMap: {},
});
// 过滤值
let filterStr = ref("");
// 打开弹框
const openDialog = (row) => {
	showRoleFormDialogFlag.value = true;
    filterStr.value = null;
	loadBlankRoleData(row);
};

// 权限数据
let rightEntityList = ref([]);

// 设置表单数据的通用方法
const setFormModelData = (data) => {
	formModel.value.roleId = data.roleId || "";
	formModel.value.roleName = data.roleName || "";
	formModel.value.disabled = data.disabled ?? false;
	formModel.value.description = data.description || "";
	formModel.value.rightValueMap = data.rightValueMap || {};
	formModel.value.customRightList = data.customRightList || [];
	rightEntityList.value = data.rightEntityList
		? [...data.rightEntityList]
		: [];
};

// 加载空白数据
const loadBlankRoleData = async (row) => {
	try {
		roleFormDialogLoading.value = true;
		rightEntityList.value = [];
		const res = row
			? await getRoleData(row.roleId)
			: await getBlankRoleData();
		if (res?.data?.code === 200) {
			setFormModelData(res.data.data);
			queryEntity();
		} else {
			ElMessage.error(res?.data?.message || "获取数据失败");
		}
	} catch (error) {
		console.error("加载空白角色数据失败:", error);
		ElMessage.error("加载数据失败，请重试");
	} finally {
		roleFormDialogLoading.value = false;
	}
};

// 设置实体权限的通用方法
const setEntityRights = (entityCode, command, authorizable = true) => {
	const rightTypes = [1, 2, 3, 4, 5, 6]; // 查看、新建、修改、删除、分配、共享

	rightTypes.forEach((type) => {
		const key = `r${entityCode}-${type}`;
		if (type === 2 || !authorizable) {
			// 新建权限 或 不可授权的实体
			formModel.value.rightValueMap[key] = command > 0 ? 50 : 0;
		} else if (type === 5 && !authorizable) {
			// 分配权限且不可授权
			formModel.value.rightValueMap[key] = 0;
		} else {
			formModel.value.rightValueMap[key] = command;
		}
	});
};

// 设置所有数据权限
const allHandleCommand = (command) => {
	rightEntityList.value.forEach((entity) => {
		setEntityRights(entity.entityCode, command, entity.authorizable);
	});
	queryEntity();
	
	// 显示操作结果提示
	ElMessage.success(
		`已将所有实体的全部权限批量设置为：${getCommandLabel(command)}（共${rightEntityList.value.length}个实体）`
	);
};

// 单行设置权限
const rowHandleCommand = (command, row) => {
	const { entityCode, authorizable } = row;
	setEntityRights(entityCode, command, authorizable);
	
	// 显示操作结果提示
	ElMessage.success(
		`已将实体"${row.label}"的所有权限批量设置为：${getCommandLabel(command)}`
	);
};

// 权限级别标签映射
const getCommandLabel = (command, isCreateRight = false) => {
	const commandLabels = {
		0: "无权限",
		10: "本人",
		20: "本部门",
		30: "本部门及以下",
		40: "上级部门及以下",
		50: isCreateRight ? "允许" : "全部数据",
	};
	return commandLabels[command] || "未知权限";
};

// 获取列权限的下拉选项
const getColumnRightLevels = (column) => {
	switch (column) {
		case "1": // 查看权限
		case "3": // 修改权限
		case "4": // 删除权限
		case "5": // 分配权限
		case "6": // 共享权限
			return rowRightLevels.value;
		case "2": // 新建权限
			return oneselfRightLevels.value;
		default:
			return rowRightLevels.value;
	}
};

// 单列设置权限
const columnCommand = (command, column) => {
	let updatedCount = 0;

	// 遍历所有实体，设置指定列的权限
	rightEntityList.value.forEach((entity) => {
		const key = `r${entity.entityCode}-${column}`;

		// 根据不同的权限类型和实体特性设置权限值
		if (column === "2") {
			// 新建权限：只能设置为允许(50)或不允许(0)
			formModel.value.rightValueMap[key] = command > 0 ? 50 : 0;
			updatedCount++;
		} else if (column === "5" && !entity.authorizable) {
			// 分配权限：如果实体不可授权，则设置为0
			formModel.value.rightValueMap[key] = 0;
		} else {
			// 其他权限类型：直接设置为选择的权限级别
			formModel.value.rightValueMap[key] = command;
			updatedCount++;
		}
	});

	// 刷新过滤后的实体列表显示
	queryEntity();

	// 显示操作结果提示
	const columnNames = {
		1: "查看权限",
		2: "新建权限",
		3: "修改权限",
		4: "删除权限",
		5: "分配权限",
		6: "共享权限",
	};

	const isCreateRight = column === "2";
	ElMessage.success(
		`已将所有实体的${columnNames[column]}批量设置为：${getCommandLabel(command, isCreateRight)}（共${rightEntityList.value.length}个实体）`
	);
};


let filterEntityList = ref([]);
const queryEntity = () => {
	if (!filterStr.value) {
		filterEntityList.value = [...rightEntityList.value];
	} else {
		filterEntityList.value = rightEntityList.value.filter(
			(el) => el.label.indexOf(filterStr.value) != -1
		);
	}
};

// 表单验证
const validateRoleName = (rule, value, callback) => {
	if (!value) {
		callback(new Error("请输入角色名称"));
		return;
	}
	if (value.length < 2) {
		callback(new Error("请输入至少两个字符"));
		return;
	}
	if (value.length > 30) {
		callback(new Error("名字最多只能30个字符"));
		return;
	}
	let regEx = /^[A-Za-z\d\u4e00-\u9fa5]+[_-]*/;
	if (!regEx.test(value)) {
		callback(
			new Error("请以中文、英文字母、数字开头，中间可输入下划线或横杠")
		);
		return;
	}
	callback();
};

// 表单验证
let formRules = shallowRef({
	roleName: [{ validator: validateRoleName, trigger: "blur" }],
});

// 功能权限
let funcRight = shallowRef([
	{
		label: "开发中心",
		hideDivider: true,
		children: [
			{
				label: "开发中心",
				value: "r6017",
			},
			{
				label: "系统配置",
				value: "r6022",
			},
			{
				label: "菜单导航配置",
				value: "r6007",
			},
		],
	},
	{
		label: "组织架构",
		children: [
			{
				label: "角色设置用户",
				value: "r6024",
				tip: "开发中心-组织架构-权限角色页面，查看用户弹框中的添加、删除用户功能。",
			},
		],
	},
	{
		label: "数据建模",
		children: [
			{
				label: "实体管理",
				value: "r6001",
			},
			{
				label: "应用管理",
				value: "r6025",
			},
			{
				label: "设计表单布局",
				value: "r6003",
			},
			{
				label: "列表页面设计",
				value: "r6008",
			},
			{
				label: "删除实体",
				value: "r6002",
			},
			{
				label: "单选项管理",
				value: "r6005",
			},
			{
				label: "多选项管理",
				value: "r6006",
			},
			{
				label: "系统常量管理",
				value: "r6019",
			},
		],
	},
	{
		label: "流程管理",
		children: [
			{
				label: "审批流程",
				value: "r6016",
			},
			{
				label: "审批撤销",
				value: "r6013",
			},
		],
	},
	{
		label: "触发器管理",
		children: [
			{
				label: "触发器日志",
				value: "r6015",
			},
		],
	},
	{
		label: "外部集成",
		children: [
			{
				label: "外部表单",
				value: "r6020",
			},
		],
	},
	{
		label: "数据管理",
		children: [
			{
				label: "数据导入",
				value: "r6011",
			},
			{
				label: "数据库备份",
				value: "r6023",
			},
			{
				label: "开发版本管理",
				value: "r6018",
			},
			{
				label: "数据转化",
				value: "r6021",
			},
		],
	},
	{
		label: "辅助设置",
		children: [
			{
				label: "变更历史",
				value: "r6010",
			},
			{
				label: "登录日志",
				value: "r6014",
			},
			{
				label: "回收站",
				value: "r6009",
			},
		],
	},
]);

// 数据权限
let rowRightLevels = shallowRef([
	{ label: "无权限", value: 0 },
	{ label: "本人", value: 10 },
	{ label: "本部门", value: 20 },
	{ label: "本部门及以下", value: 30 },
	{ label: "上级部门及以下", value: 40 },
	{ label: "全部数据", value: 50 },
]);

let departmentRightLevels = shallowRef([
	{ label: "无权限", value: 0 },
	{ label: "本部门", value: 20 },
	{ label: "本部门及以下", value: 30 },
	{ label: "上级部门及以下", value: 40 },
	{ label: "全部数据", value: 50 },
]);

let simpleRightLevels = shallowRef([
	{ label: "无权限", value: 0 },
	{ label: "全部数据", value: 50 },
]);

let oneselfRightLevels = shallowRef([
	{ label: "不允许", value: 0 },
	{ label: "允许", value: 50 },
]);

// 获取权限级别
const getRightLevels = (rightEntity) => {
	if (rightEntity.name == "Department") {
		return departmentRightLevels.value;
	}
	if (rightEntity.authorizable === true) {
		return rowRightLevels.value;
	} else {
		return simpleRightLevels.value;
	}
};

let roleFormRes = ref();

// 保存角色
const saveRole = async () => {
	try {
		const valid = await roleFormRes.value.validate();
		if (!valid) {
			return false;
		}

		roleFormDialogLoading.value = true;
		const res = await saveRoleData(formModel.value);

		if (res?.data?.code === 200) {
			ElMessage.success("保存成功");
			showRoleFormDialogFlag.value = false;
			// 触发父组件刷新列表
			emit("refresh");
		} else {
			ElMessage.error(res?.data?.message || "保存失败");
		}
	} catch (error) {
		console.error("保存角色失败:", error);
		ElMessage.error("保存失败，请重试");
	} finally {
		roleFormDialogLoading.value = false;
	}
};

defineExpose({
	openDialog,
});
</script>

<style scoped lang="scss">
.small-padding :deep(.el-dialog__body) {
	padding: 18px;
}

.el-row.entity-right-row {
	margin-top: 6px;
	margin-bottom: 6px;
}

.el-row.function-right-row {
	margin-top: 0;
	margin-bottom: 0;

	:deep(.el-form-item) {
		margin-bottom: 6px;
	}
}

.entity-right-setting {
	width: 100%;
	height: 30px;
	&.title {
		height: 24px;
		line-height: 24px;
	}
	.label {
		width: 150px;
		height: 24px;
	}
	.text-align-center {
		text-align: center;
		width: 150px;
		box-sizing: border-box;
		padding: 0 5px;
	}
	.text-icon {
		height: 30px;
		line-height: 30px;
		.text-icon-span {
			cursor: pointer;
			position: relative;
			top: -1px;
		}
	}
	.bold {
		font-weight: bold;
	}
}

.text-icon-all {
	cursor: pointer;
	position: relative;
	top: 4px;

	.icon-top-2 {
		position: relative;
		top: 2px;
		margin-left: 4px;
	}
}

.entity-right-setting-body {
	height: 380px;
	padding: 10px 0;
	padding-top: 5px;
}

.function-right-row-box {
	max-height: 418px;
	overflow-y: auto;
	overflow-x: hidden;
}
</style>
