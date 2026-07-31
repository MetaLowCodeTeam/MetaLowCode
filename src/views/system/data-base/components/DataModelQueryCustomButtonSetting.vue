<template>
	<ml-dialog v-model="visible" title="自定义按钮设置" width="720px" append-to-body>
		<el-tabs v-model="activeTab">
			<el-tab-pane label="顶部按钮" name="pcTop" />
			<el-tab-pane label="操作列" name="pcColumn" />
		</el-tabs>

		<el-row v-loading="loading" :gutter="20" class="button-setting-content" element-loading-text="加载中...">
			<el-col :span="8">
				<div class="button-list-box">
					<el-scrollbar>
						<VueDraggableNext
							:list="activeButtonList"
							ghost-class="ml-draggable-ghost"
							chosen-class="ml-draggable-chosen"
							:animation="300"
							handle=".ml-draggable-mover"
						>
							<div
								v-for="button in activeButtonList"
								:key="button.guid"
								class="button-list-item ml-draggable-item"
								@click="selectButton(button)"
							>
								<div class="ml-draggable-mover">
									<el-icon :size="16"><Rank /></el-icon>
								</div>
								<div
									class="button-list-item-name"
									:class="{ active: currentButton?.guid === button.guid }"
									:title="button.name"
								>
									<el-icon v-if="button.icon" :size="16" :color="button.iconColor" class="icon-top-2">
										<component :is="button.icon" />
									</el-icon>
									{{ button.name }}
								</div>
								<div class="button-list-item-icon">
									<el-icon :size="16" @click.stop="deleteButton(button)"><Close /></el-icon>
								</div>
							</div>
						</VueDraggableNext>
						<el-empty v-if="!activeButtonList.length" description="暂无按钮" :image-size="72" />
					</el-scrollbar>
				</div>
				<el-button class="add-button" type="primary" plain :icon="Plus" @click="addButton">添加按钮</el-button>
			</el-col>

			<el-col :span="16">
				<div v-if="!currentButton" class="empty-editor">点击左侧按钮进行编辑，或添加一个按钮</div>
				<el-form v-else label-width="82px" class="button-editor">
					<el-row :gutter="16">
						<el-col :span="12">
							<el-form-item label="按钮名称" required>
								<el-input v-model="currentButton.name" maxlength="30" show-word-limit />
							</el-form-item>
						</el-col>
						<el-col :span="12">
							<el-form-item label="按钮图标">
								<div class="icon-box" @click="openIconPicker">
									<el-icon v-if="!currentButton.icon" :size="16"><Close /></el-icon>
									<el-icon v-else :size="16" :color="currentButton.iconColor"><component :is="currentButton.icon" /></el-icon>
								</div>
							</el-form-item>
						</el-col>
						<el-col :span="12">
							<el-form-item label="显示类型">
								<el-select v-model="currentButton.showType">
									<el-option label="默认" :value="1" />
									<el-option label="仅图标" :value="2" />
									<el-option label="仅文字" :value="3" />
								</el-select>
							</el-form-item>
						</el-col>
						<el-col :span="12">
							<el-form-item label="按钮类型">
								<el-select v-model="currentButton.type">
									<el-option label="默认" value="default" />
									<el-option label="主要" value="primary" />
									<el-option label="成功" value="success" />
									<el-option label="警告" value="warning" />
									<el-option label="危险" value="danger" />
								</el-select>
							</el-form-item>
						</el-col>
						<el-col :span="24">
							<el-form-item label="按钮预览">
								<el-button
									:type="currentButton.type"
									:link="activeTab === 'pcColumn'"
									:text="currentShowType === 3"
									:color="currentButton.type === 'custom' ? currentButton.color : ''"
								>
									<el-icon
										v-if="currentButton.icon && currentShowType !== 3"
										:size="16"
										:color="currentButton.iconColor"
										style="position: relative; top: -1px"
									>
										<component :is="currentButton.icon" />
									</el-icon>
									<span v-if="currentShowType !== 2" :class="{ 'ml-5': currentButton.icon && currentShowType === 1 }">
										{{ currentButton.name || "未命名按钮" }}
									</span>
								</el-button>
							</el-form-item>
						</el-col>
						<el-col :span="24">
							<el-form-item label="执行动作">
								<el-select v-model="currentButton.action">
									<el-option label="自定义" value="custom" />
								</el-select>
							</el-form-item>
						</el-col>
						<el-col :span="24">
							<el-form-item label="执行脚本">
								<el-input
									:model-value="currentButton.customScript"
									type="textarea"
									:rows="1"
									placeholder="请输入自定义脚本"
									readonly
									@click="openScriptDialog"
								/>
							</el-form-item>
						</el-col>
					</el-row>
				</el-form>
			</el-col>
		</el-row>
		<template #footer>
			<el-button @click="visible = false">取消</el-button>
			<el-button type="primary" :loading="loading" @click="saveButton">保存</el-button>
		</template>
	</ml-dialog>
	<ml-select-icon v-model="iconPickerVisible" :use-icon="selectedIcon" @confirmIcon="selectIcon" />
	<ml-dialog
		v-if="scriptDialogVisible"
		v-model="scriptDialogVisible"
		title="执行脚本"
		width="700px"
		append-to-body
		showFullScreen
		@fullScreenChange="scriptFullscreen = $event"
	>
		<div class="script-box" :class="{ 'full-screen': scriptFullscreen }">
			<ml-code-editor
				v-model="scriptDraft"
				funcParam="rows,exposed"
				:height="scriptFullscreen ? '100%' : '300px'"
			/>
		</div>
		<template #footer>
			<el-button @click="scriptDialogVisible = false">取消</el-button>
			<el-button type="primary" @click="saveScript">确认</el-button>
		</template>
	</ml-dialog>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { Close, Plus, Rank } from "@element-plus/icons-vue";
import { getGuid } from "@/utils/util";
import mlSelectIcon from "@/components/mlSelectIcon/index.vue";
import mlCodeEditor from "@/components/mlCodeEditor/index.vue";
import { VueDraggableNext } from "vue-draggable-next";
import { ElMessage } from "element-plus";
import layoutConfig from "@/api/layoutConfig";

const props = defineProps({
	modelName: {
		type: String,
		default: "",
	},
});
const route = useRoute();

const visible = ref(false);
const loading = ref(false);
const layoutConfigId = ref("");
const activeTab = ref("pcTop");
const topButtons = ref([]);
const columnButtons = ref([]);
const currentButton = ref(null);
const iconPickerVisible = ref(false);
const selectedIcon = ref({});
const scriptDialogVisible = ref(false);
const scriptFullscreen = ref(false);
const scriptDraft = ref("");

const modelName = computed(() => route.query.outerDataModelId || props.modelName || "");
const activeButtonList = computed(() => activeTab.value === "pcTop" ? topButtons.value : columnButtons.value);
const currentShowType = computed(() => Number(currentButton.value?.showType ?? 1));

watch(activeTab, () => {
	currentButton.value = activeButtonList.value[0] || null;
});

const openDialog = async () => {
	visible.value = true;
	loading.value = true;
	layoutConfigId.value = "";
	topButtons.value = [];
	columnButtons.value = [];
	currentButton.value = null;
	try {
		const res = await layoutConfig.getLayoutList("DataModelReport", modelName.value);
		const customButton = res?.data?.CUSTOM_BUTTON;
		layoutConfigId.value = customButton?.layoutConfigId || "";
		if (customButton?.config) {
			const config = JSON.parse(customButton.config);
			topButtons.value = Array.isArray(config.pcTop) ? config.pcTop : [];
			columnButtons.value = Array.isArray(config.pcColumn) ? config.pcColumn : [];
		}
		currentButton.value = activeButtonList.value[0] || null;
	} catch (error) {
		console.error("load custom button config error", error);
		ElMessage.error("自定义按钮配置获取失败");
	} finally {
		loading.value = false;
	}
};

const saveJson = () => {
	const config = {
		pcTop: topButtons.value,
		pcColumn: columnButtons.value,
	};
	console.info("[DataModelQueryCustomButtonSetting] save config", config);
	return config;
};

const saveButton = async () => {
	const config = saveJson();
	const param = {
		config: JSON.stringify(config),
		entityCode: 94,
		shareTo: "ALL",
	};
	loading.value = true;
	try {
		const res = await layoutConfig.saveConfig(
			layoutConfigId.value,
			"CUSTOM_BUTTON",
			param,
			modelName.value,
		);
		if (res) {
			layoutConfigId.value = res.data?.formData?.layoutConfigId || res.data?.layoutConfigId || layoutConfigId.value;
			ElMessage.success("保存成功");
		}
	} catch (error) {
		console.error("save custom button config error", error);
		ElMessage.error("自定义按钮配置保存失败");
	} finally {
		loading.value = false;
	}
};

const addButton = () => {
	const button = {
		guid: getGuid(),
		name: `按钮${activeButtonList.value.length + 1}`,
		icon: "",
		iconColor: "",
		type: "default",
		showType: 1,
		action: "custom",
		customScript: "",
	};
	activeButtonList.value.push(button);
	currentButton.value = button;
};

const selectButton = (button) => {
	currentButton.value = button;
};

const deleteButton = (button) => {
	const index = activeButtonList.value.findIndex((item) => item.guid === button.guid);
	if (index === -1) return;
	activeButtonList.value.splice(index, 1);
	currentButton.value = activeButtonList.value[index] || activeButtonList.value[index - 1] || null;
};

const openIconPicker = () => {
	selectedIcon.value = {
		name: currentButton.value?.icon,
		color: currentButton.value?.iconColor,
	};
	iconPickerVisible.value = true;
};

const openScriptDialog = () => {
	scriptDraft.value = currentButton.value?.customScript || "";
	scriptFullscreen.value = false;
	scriptDialogVisible.value = true;
};

const saveScript = () => {
	if (currentButton.value) currentButton.value.customScript = scriptDraft.value;
	scriptDialogVisible.value = false;
};

const selectIcon = (icon) => {
	if (currentButton.value) {
		currentButton.value.icon = icon.name;
		currentButton.value.iconColor = icon.color;
	}
	iconPickerVisible.value = false;
};

defineExpose({ openDialog });
</script>

<style scoped lang="scss">
.button-setting-content {
	min-height: 390px;
}

.button-list-box {
	box-sizing: border-box;
	height: 386px;
	padding: 3px;
	border: 1px solid #e6e6e6;
	border-radius: 4px;
}

.button-list-item {
	display: flex;
	align-items: center;
	justify-content: space-between;
	height: 36px;
	margin-bottom: 3px;
	border: 1px solid #e6e6e6;
	box-sizing: border-box;
	cursor: pointer;

	&:hover {
		background-color: #f0f0f0;

		.button-list-item-icon {
			display: block;
		}
	}
}

.button-list-item-name {
	flex: 1;
	margin: 0 10px;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;

	&.active {
		color: var(--el-color-primary);
	}
}

.button-list-item-icon {
	flex: 0 0 12px;
	display: none;
	margin-top: 5px;
}

.button-list-item-name.active + .button-list-item-icon {
	display: block;
}

.add-button {
	width: 100%;
	margin-top: 8px;
}

.empty-editor {
	display: flex;
	align-items: center;
	justify-content: center;
	height: 386px;
	color: var(--el-text-color-secondary);
	border: 1px dashed var(--el-border-color);
}

.button-editor {
	padding: 8px 4px;
}

.icon-box {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 32px;
	height: 32px;
	border: 1px solid #e6e6e6;
	border-radius: 4px;
	cursor: pointer;

	&:hover {
		border-color: var(--el-border-color-hover);
	}
}

.script-box.full-screen {
	height: calc(100% - 100px);
}

</style>
