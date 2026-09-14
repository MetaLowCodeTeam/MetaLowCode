<template>
	<el-container
		v-loading="loading"
		element-loading-text="加载中..."
		class="outer-data-model-list"
	>
		<el-main class="list-main">
			<div class="table-search-box">
				<el-form
					ref="queryParamsRef"
					label-width="100px"
					:model="queryFrom"
					:rules="queryParamsRules"
					:show-message="false"
					@submit.prevent
				>
				<!-- 查询条件 + 按钮块：flex 自动换行，按钮块放得下就跟在条件右侧，放不下就独占一行 -->
				<div class="query-fields" v-if="queryParams.length > 0">
					<div
						class="query-field"
						v-for="item in queryParams"
						:key="item.name"
					>
						<el-form-item
							:label="item.label"
							style="margin-bottom: 10px"
							:prop="item.name"
						>
							<!-- 文本类型1 和 文本(模糊)5 -->
							<el-input
								v-model="queryFrom[item.name]"
								:placeholder="`请输入${item.label}`"
								clearable
								:validate-event="false"
								@focus="clearQueryValidate(item.name)"
								v-if="item.type == 1 || item.type == 5"
							/>
							<!-- 日期时间2 -->
							<el-date-picker
								v-model="queryFrom[item.name]"
								type="datetime"
								placeholder="选择日期时间"
								clearable
								:validate-event="false"
								@focus="clearQueryValidate(item.name)"
								v-if="item.type == 2"
								class="w-100"
								format="YYYY-MM-DD HH:mm:ss"
								value-format="YYYY-MM-DD HH:mm:ss"
							/>
							<!-- 日期3 -->
							<el-date-picker
								v-model="queryFrom[item.name]"
								type="date"
								placeholder="选择日期"
								clearable
								:validate-event="false"
								@focus="clearQueryValidate(item.name)"
								v-if="item.type == 3"
								class="w-100"
								format="YYYY-MM-DD"
								value-format="YYYY-MM-DD"
							/>
							<!-- 数字4 -->
							<el-input-number
								v-model="queryFrom[item.name]"
								placeholder="请输入数字"
								v-if="item.type == 4"
								:controls="false"
								:validate-event="false"
								@focus="clearQueryValidate(item.name)"
								style="text-align: left"
								class="w-100 ml-number-input"
							/>
						</el-form-item>
					</div>
					<div class="query-actions">
						<el-button
							v-for="button in visibleTopButtons"
							:key="button.guid"
							:type="button.type || 'default'"
							:plain="button.plain === true"
							:text="isTextOnlyButton(button)"
							@click="handleTopButton(button)"
						>
							<el-icon v-if="button.icon && !isTextOnlyButton(button)" :color="button.iconColor">
								<component :is="button.icon" />
							</el-icon>
							<span v-if="!isIconOnlyButton(button)">{{ getButtonName(button) }}</span>
						</el-button>
					</div>
				</div>
					<el-row v-else>
						<el-col :span="24" class="query-actions query-actions--empty">
							<el-button
								v-for="button in visibleTopButtons"
								:key="button.guid"
								:type="button.type || 'default'"
								:plain="button.plain === true"
								:text="isTextOnlyButton(button)"
								@click="handleTopButton(button)"
							>
								<el-icon v-if="button.icon && !isTextOnlyButton(button)" :color="button.iconColor">
									<component :is="button.icon" />
								</el-icon>
								<span v-if="!isIconOnlyButton(button)">{{ getButtonName(button) }}</span>
							</el-button>
						</el-col>
					</el-row>
				</el-form>
			</div>
			<div class="table-div">
				<el-table
					:data="tableData"
					style="width: 100%"
					:border="true"
					height="100%"
					@selection-change="multipleSelection = $event"
				>
					<el-table-column type="selection" width="50" align="center" />
					<el-table-column
						v-for="column in tableHeader"
						:key="column.prop"
						:prop="column.prop"
						:label="column.label"
					/>
					<el-table-column
						v-if="columnCustomButtons.length"
						label="操作"
						fixed="right"
						:min-width="operationColumnWidth"
						:width="operationColumnWidth"
						align="center"
						class-name="operation-column"
					>
						<template #default="scope">
							<el-button
								v-for="button in columnCustomButtons"
								:key="button.guid"
								v-show="isCustomButtonVisible(button)"
								link
								:type="button.type || 'default'"
								:text="isTextOnlyButton(button)"
								@click.stop="executeCustomButton(button, scope.row)"
							>
								<el-icon v-if="button.icon && !isTextOnlyButton(button)" :color="button.iconColor">
									<component :is="button.icon" />
								</el-icon>
								<span v-if="!isIconOnlyButton(button)">{{ button.name }}</span>
							</el-button>
						</template>
					</el-table-column>
				</el-table>
			</div>
		</el-main>
		<el-footer class="main-footer">
			<!-- 分页 -->
			<el-pagination
				v-model:currentPage="pageConfig.currentPage"
				v-model:pageSize="pageConfig.pageSize"
				:page-sizes="pageConfig.pageSizes"
				:total="pageConfig.total"
				layout="total, prev, pager, next, jumper, sizes"
				@size-change="handleSizeChange"
				@current-change="handleCurrentChange"
			/>
		</el-footer>
		<DataModelQueryCustomButtonSetting
			ref="customButtonSettingRef"
			:model-name="outerDataModelId"
			@confirm="handleCustomButtonConfirm"
		/>
	</el-container>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { queryModelById, getOuterDataByDataModel } from "@/api/plugins";
import { ElMessage } from "element-plus";
import http from "@/utils/request";
import tool from "@/utils/tool";
import layoutConfig from "@/api/layoutConfig";
import useCustomButtonConfig from "@/hooks/useCustomButtonConfig";
import DataModelQueryCustomButtonSetting from "./DataModelQueryCustomButtonSetting.vue";
const route = useRoute();
const router = useRouter();

let loading = ref(false);
const customButtonSettingRef = ref();
const customButtonLoading = ref(false);
const multipleSelection = ref([]);
const customButtonConfig = ref({ pcTop: [], pcColumn: [] });
const { customButtonHandler } = useCustomButtonConfig();

const topButtons = computed(() => customButtonConfig.value.pcTop || []);
const columnCustomButtons = computed(() => customButtonConfig.value.pcColumn || []);

const openCustomButtonSetting = () => {
	customButtonSettingRef.value?.openDialog();
};

let outerDataModelId = ref("");
onMounted(() => {
	outerDataModelId.value = route.query.outerDataModelId;
	if (!outerDataModelId.value) {
		ElMessage.error("数据模型ID不存在");
		return;
	}
	loadModelData();
	loadCustomButtonConfig();
});

// 表头
let tableHeader = ref([]);
// 表数据
let tableData = ref([]);
// 分页配置
let pageConfig = ref({
	currentPage: 1,
	pageSize: 20,
	pageSizes: [20, 40, 80, 100, 200, 300, 400, 500],
	total: 0,
});
// 查询参数
let queryParams = ref([]);
let queryFrom = ref({});
let queryParamsRules = ref({});

const normalizeCustomButton = (button) => ({
	...button,
	action: button?.action === "custom" ? 4 : button?.action,
});

const isCustomActionButton = (button) => !button?.isNative && Number(button?.action) === 4;

const nativeTopButtonDefaults = [
	{
		defaultName: "查询",
		name: "",
		key: "query",
		isNative: true,
		guid: "data-model-query-native-query",
		icon: "Search",
		showType: 1,
		type: "primary",
	},
	{
		defaultName: "重置",
		name: "",
		key: "reset",
		isNative: true,
		guid: "data-model-query-native-reset",
		icon: "Refresh",
		showType: 1,
		type: "default",
	},
	{
		defaultName: "自定义按钮设置",
		name: "",
		key: "customButtonSetting",
		isNative: true,
		guid: "data-model-query-native-custom-button-setting",
		icon: "Setting",
		showType: 1,
		type: "primary",
		plain: true,
	},
];

const getButtonName = (button) => button?.name || button?.defaultName || "未命名按钮";

const getButtonTextWidth = (text) => Array.from(text || "").reduce(
	(width, character) => width + (character.charCodeAt(0) > 255 ? 13 : 7),
	0,
);

const operationColumnWidth = computed(() => {
	const visibleButtons = columnCustomButtons.value.filter(isCustomButtonVisible);
	const buttonWidth = visibleButtons.reduce((total, button, index) => {
		const textWidth = isIconOnlyButton(button) ? 0 : getButtonTextWidth(getButtonName(button));
		const iconWidth = button.icon && !isTextOnlyButton(button) ? 18 : 0;
		const iconGap = iconWidth && textWidth ? 6 : 0;
		const buttonGap = index ? 12 : 0;
		// Link buttons have internal padding and a small inline rendering buffer.
		const buttonPadding = 14;
		return total + Math.max(24, textWidth + iconWidth + iconGap + buttonPadding) + buttonGap;
	}, 8);
	return Math.max(100, Math.ceil(buttonWidth));
});

const normalizeButton = (button) => {
	if (button?.isNative) {
		const nativeDefault = nativeTopButtonDefaults.find((item) => item.key === button.key);
		return nativeDefault ? { ...nativeDefault, ...button, isNative: true } : button;
	}
	return normalizeCustomButton(button);
};

const mergeNativeTopButtons = (buttons) => {
	const normalized = Array.isArray(buttons) ? buttons.map(normalizeButton) : [];
	const ordered = normalized.filter((button) =>
		(button?.isNative && nativeTopButtonDefaults.some((item) => item.key === button.key)) || isCustomActionButton(button),
	);
	const missing = nativeTopButtonDefaults
		.filter((defaultButton) => !ordered.some((button) => button.key === defaultButton.key))
		.map((button) => ({ ...button }));
	return [...ordered, ...missing];
};

const applyCustomButtonConfig = (config) => {
	customButtonConfig.value = {
		pcTop: mergeNativeTopButtons(config?.pcTop),
		pcColumn: Array.isArray(config?.pcColumn) ? config.pcColumn.map(normalizeButton).filter(isCustomActionButton) : [],
	};
};

const loadCustomButtonConfig = async () => {
	try {
		const res = await layoutConfig.getLayoutList("DataModelReport", outerDataModelId.value);
		const configText = res?.data?.CUSTOM_BUTTON?.config;
		const config = configText ? (typeof configText === "string" ? JSON.parse(configText) : configText) : {};
		applyCustomButtonConfig(config);
	} catch (error) {
		console.error("load data model query custom buttons error", error);
		applyCustomButtonConfig({});
	}
};

const handleCustomButtonConfirm = async (config) => {
	applyCustomButtonConfig(config);
	await loadListData();
};

const isTextOnlyButton = (button) => Number(button?.showType) === 3;
const isIconOnlyButton = (button) => Number(button?.showType) === 2;
const isCustomButtonVisible = (button) => {
	if (!button || button.hide === true) return false;
	if (button.isNative && button.key === "customButtonSetting" && !tool.checkRole("r6008")) return false;
	if (!button.customCode) return true;
	const hasPermission = tool.checkRole(button.customCode);
	return button.reversalCustomCode ? !hasPermission : hasPermission;
};
const visibleTopButtons = computed(() => topButtons.value.filter((button) => {
	if (!isCustomButtonVisible(button)) return false;
	if (!queryParams.value.length && ["query", "reset"].includes(button.key)) return false;
	return true;
}));

const handleTopButton = (button) => {
	if (button.key === "query") return handleQuery();
	if (button.key === "reset") return resetQuery();
	if (button.key === "customButtonSetting") {
		if (tool.checkRole("r6008")) openCustomButtonSetting();
		return;
	}
	return executeCustomButton(button);
};

const buttonExposed = {
	getSelectedRows: () => multipleSelection.value,
	getTableDataList: () => tableData.value,
	refreshList: () => loadListData(),
};

const executeCustomButton = async (button, row) => {
	if (!button || Number(button.action) !== 4) return;
	const rows = row ? [row] : multipleSelection.value;
	const recordId = row?.id || row?.dataModelReportId || rows[0]?.id || rows[0]?.dataModelReportId;
	await customButtonHandler(
		button,
		rows,
		buttonExposed,
		recordId,
		customButtonLoading,
		() => {},
		() => {},
		() => {},
		router,
	);
};

// 新增方法：检查查询参数是否合法
const checkQueryParams = () => {
	for (const item of queryParams.value) {
		if (item.isRequired && !queryFrom.value[item.name]) {
			return false;
		}
	}
	return true;
};

// 加载配置数据
const loadModelData = async () => {
	loading.value = true;
	let res = await queryModelById({
		outerDataModelId: outerDataModelId.value,
	});
	if (res) {
		queryParams.value = [];
		queryParamsRules.value = {};
		queryFrom.value = {};
		if (res.data.ModelParam) {
			res.data.ModelParam.forEach((el) => {
				queryParams.value.push({
					label: el.paramLabel || el.paramName,
					name: el.paramName,
					type: el.paramType.value,
					isRequired: el.isRequired,
				});
				queryFrom.value[el.paramName] = el.defaultValue || "";
				if ([2, 3, 4].includes(el.paramType.value)) {
					queryFrom.value[el.paramName] = el.defaultValue || null;
				}
				if (el.isRequired) {
					queryParamsRules.value[el.paramName] = [
						{
							required: el.isRequired,
							message: "请输入" + (el.paramLabel || el.paramName),
							trigger: "blur",
						},
					];
				}
			});
		}
		tableHeader.value = res.data.ModelField.map((el) => {
			return {
				label: el.fieldLabel || el.fieldName,
				prop: el.fieldName,
			};
		});
		// 检查查询参数是否合法
		await loadListData();
	}
	loading.value = false;
};

// 查询
let queryParamsRef = ref();
const clearQueryValidate = (fieldName) => {
	queryParamsRef.value?.clearValidate(fieldName);
};

const handleQuery = () => {
	queryParamsRef.value.validate((valid) => {
		if (valid) {
			loadListData();
		}
	});
};

// 重置查询
const resetQuery = () => {
	// 清空表单
	queryParamsRef.value.resetFields();
	// 重置分页
	pageConfig.value.currentPage = 1;
	pageConfig.value.pageSize = 20;
	pageConfig.value.total = 0;
	loadListData();
};

// 分页切换
const handleSizeChange = (val) => {
	pageConfig.value.pageSize = val;
	loadListData();
};
const handleCurrentChange = (val) => {
	pageConfig.value.currentPage = val;
	// 检查查询参数是否合法
	loadListData();
};

// 加载列表数据
const loadListData = async () => {
	// 检查查询参数是否合法
	if (!checkQueryParams()) {
		return;
	}
    // 清空表格数据
	tableData.value = [];
	let listParam = JSON.parse(JSON.stringify(queryFrom.value));
	// 处理文本模糊查询
	queryParams.value.forEach((item) => {
		if (item.type == 5 && listParam[item.name]) {
			listParam[item.name] = `%${listParam[item.name]}%`;
		}
	});
	loading.value = true;
	let res = await getOuterDataByDataModel(
		{
			outerDataModelId: outerDataModelId.value,
			pageNo: pageConfig.value.currentPage,
			pageSize: pageConfig.value.pageSize,
		},
		listParam
	);
	if (res) {
		tableData.value = res.data.dataList || [];
		pageConfig.value.total = res.data?.pagination?.total || 0;
	}
	loading.value = false;
};
</script>

<style scoped lang="scss">
.outer-data-model-list {
	height: 100%;
	box-sizing: border-box;
	padding: 20px;
	background: #f1f5ff;
	font-size: 13px;
	flex-direction: column;
	position: relative;

	:deep(.el-button),
	:deep(.el-form),
	:deep(.el-form-item__label),
	:deep(.el-input),
	:deep(.el-input__inner),
	:deep(.el-select),
	:deep(.el-date-editor),
	:deep(.el-table),
	:deep(.el-pagination) {
		font-size: 13px;
	}

	.list-main {
		display: flex;
		flex: 1;
		flex-direction: column;
		min-height: 0;
		padding: 0 0 52px;
		overflow: hidden;
	}
}

.table-search-box {
	flex: none;
	border-top: 3px solid var(--el-color-primary);
	min-height: 54px;
	padding: 10px;
	box-sizing: border-box;

	:deep(.el-form-item) {
		margin-bottom: 8px !important;
	}

	:deep(.el-form-item.is-error .el-input__wrapper.is-focus) {
		box-shadow: 0 0 0 1px var(--el-color-primary) inset !important;
	}

	:deep(.ml-number-input .el-input__inner) {
		text-align: left;
	}
}

.query-fields {
	display: flex;
	flex-wrap: wrap;
	align-items: flex-start;
	column-gap: 10px;

	.query-field {
		box-sizing: border-box;
		width: calc((100% - 30px) / 4);
		min-width: 220px;
	}
}

.query-actions {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	justify-content: flex-end;
	gap: 12px;
	margin-left: auto;
	min-height: 32px;

	:deep(.el-button + .el-button) {
		margin-left: 0;
	}
}

.query-actions--empty {
	min-height: 32px;
}

.table-div {
	flex: 1;
	min-height: 0;
	width: 100%;

	:deep(.operation-column .cell) {
		padding-left: 4px;
		padding-right: 4px;
		white-space: nowrap;

		.el-button {
			white-space: nowrap;
		}
	}
}

.main-footer {
	display: flex;
	flex: none;
	justify-content: center;
	align-items: center;
	height: 52px;
	padding: 0;
	position: absolute;
	bottom: 0;
	left: 0;
	right: 0;
	background: #fff;
}
</style>
