<style lang="scss" scoped>
.app-manager {
	height: 100%;
}
.props-action-section {
	// .section-title {
	// 	font-size: 16px;
	// }
	padding-left: 0px;
	padding-right: 20px;
	.app-manager-tabs {
		margin-top: 25px;
		height: 32px;
		line-height: 32px;
		.app-manager-tab {
			cursor: pointer;
			display: inline-block;
			padding: 0 20px;
			font-size: 14px;
			border: 1px solid #e6e6e6;
			border-bottom: none;
			&:first-child {
				border-left: none;
				border-right: none;
			}
			&.active {
				background: var(--el-color-primary);
				color: #fff;
			}
		}
	}
}
.app-manager-main {
	padding: 0;
	background: #fff;

	.app-manager-list {
		max-height: 100%;
		overflow: auto;
		overflow-x: hidden;
		padding: 10px;
		box-sizing: border-box;
		.app-manager-item {
			width: 100%;
			height: 150px;
			border: 1px solid #e6e6e6;
			border-radius: 4px;
			box-sizing: border-box;
			padding: 10px;
            padding-top: 15px;
            padding-right: 2px;
			margin-bottom: 10px;
            position: relative;
            .app-manager-item-export-tag {
                position: absolute;
                top: 14px;
                right: 10px;
                cursor: pointer;
            }
			.app-manager-item-header {
				display: flex;
				align-items: center;
				.app-manager-item-header-icon {
					width: 40px;
					height: 40px;
					display: flex;
					align-items: center;
					justify-content: center;
					background: var(--el-color-primary);
					border-radius: 6px;
					margin-right: 10px;
					color: #fff;
				}
				.app-manager-item-header-text {
					font-size: 16px;
					font-weight: bold;
					width: calc(100% - 80px);
				}
			}
			.app-manager-item-description {
				display: flex;
				align-items: center;
				height: 36px;
				margin: 10px 0;
                box-sizing: border-box;
                padding-right: 4px;
				.app-manager-item-description-text {
					font-size: 13px;
					color: #999;
					// CSS超出两行显示...
					display: -webkit-box;
					-webkit-box-orient: vertical;
					-webkit-line-clamp: 2;
					overflow: hidden;
				}
			}
			&:hover {
				border-color: var(--el-color-primary);
				.app-manager-item-export-tag {
					display: block;
                    color: var(--el-color-primary);
				}
			}
		}
	}
}
</style>
<template>
	<el-container
		v-loading="loading"
		:element-loading-text="$t('loading.1000')"
	>
		<el-header class="props-action-section">
			<div class="app-manager-tabs">
				<span
					class="app-manager-tab"
					v-for="tab in tabs"
					:key="tab.value"
					@click="handleTabClick(tab)"
					:class="{ active: activeTab === tab.value }"
				>
					{{ tab.label }}
				</span>
			</div>
			<div class="section-fr fr">
				<ml-search-input
					style="margin-right: 10px"
					v-model="keyword"
					:placeholder="$t('operation.5000')"
					@confirm="getTabList"
				/>
				<el-button
					type="primary"
					icon="Plus"
					@click="handleAddApp"
					v-if="activeTab === 'developing'"
				>
					{{ $t("appManager.1005") }}
				</el-button>
				<el-button
					type="primary"
					icon="Plus"
					@click="handleInstallApp"
					v-if="activeTab === 'installed'"
				>
					{{ $t("appManager.1006") }}
				</el-button>
			</div>
		</el-header>
		<el-main class="app-manager-main">
			<div class="app-manager-list">
				<el-row :gutter="20" v-if="!isShowEmpty">
					<el-col
						:span="4"
						v-for="(item, index) in tabList"
						:key="index"
					>
						<div class="app-manager-item">
                            <!-- 导出小标签 -->
                            <span 
                                class="app-manager-item-export-tag" 
                                @click="handleExportApp(item)"
                                :title="$t('appManager.1007')"
                            >
                                <el-icon size="16">
                                    <TopRight />
                                </el-icon>
                            </span>
							<!-- 头部 -->
							<div class="app-manager-item-header">
								<div
									class="app-manager-item-header-icon"
									v-if="item.iconConfig?.useIcon"
									:style="{
										background: item.iconConfig?.iconColor,
									}"
								>
									<el-icon :size="24">
										<component
											:is="item.iconConfig?.useIcon"
										/>
									</el-icon>
								</div>
								<div
									class="app-manager-item-header-icon"
									v-else
								>
									<el-icon :size="24">
										<SetUp />
									</el-icon>
								</div>

								<div class="app-manager-item-header-text">
									<div
										class="app-manager-item-header-text-name yichu"
										:title="item.appName"
									>
										{{ item.appName }}
									</div>
								</div>
							</div>
							<!-- 描述 -->
							<div
								class="app-manager-item-description"
								:title="item.remarks"
							>
								<div class="app-manager-item-description-text">
									{{ item.remarks || $t("appManager.1306") }}
								</div>
							</div>
							<!-- 操作按钮 -->
							<div class="app-manager-item-btns">
								<el-button
									type="primary"
									size="small"
                                    plain
									v-if="activeTab === 'developing'"
									@click="handleDesignApp(item)"
								>
									{{ $t("appManager.1003") }}
								</el-button>
								<el-dropdown 
                                    class="fr" 
                                    trigger="click"
                                    @command="handleMoreFunc(item, $event)"
                                >
									<el-button size="small" text>
										<el-icon size="18">
											<MoreFilled />
										</el-icon>
									</el-button>
									<template #dropdown>
										<el-dropdown-menu>
											<el-dropdown-item
												v-if="
													activeTab === 'developing'
												"
												command="edit"
											>
												{{ $t("appManager.1014") }}
											</el-dropdown-item>
											<el-dropdown-item
												command="delete"
											>
												{{ $t("appManager.1015") }}
											</el-dropdown-item>
										</el-dropdown-menu>
									</template>
								</el-dropdown>
							</div>
						</div>
					</el-col>
				</el-row>
				<div class="app-manager-empty" v-else>
					<el-empty />
				</div>
			</div>
		</el-main>
	</el-container>
	<ListDialog ref="listDialogRef" @refresh="getTabList" />
</template>
<script setup>
import { ref, onMounted } from "vue";
import { t } from "@/locales";
import { ElMessageBox, ElMessage } from "element-plus";
import ListDialog from "./components/ListDialog.vue";
// API
import { listQuery, deleteRecord } from "@/api/appManager";

// 当前选中的tab
let activeTab = ref("developing");
// 所有tab
const tabs = [
	{
		label: t("appManager.1001"),
		value: "developing",
	},
	{
		label: t("appManager.1002"),
		value: "installed",
	},
];

onMounted(() => {
	getTabList();
});

// 切换tab
const handleTabClick = (tab) => {
	activeTab.value = tab.value;
	getTabList();
};

// 加载中
let loading = ref(false);
// 列表
let tabList = ref([]);

// 搜索关键字
let keyword = ref("");
// 是否显示空
let isShowEmpty = ref(false);

// 获取列表
const getTabList = async () => {
	loading.value = true;
	isShowEmpty.value = false;
	let res = await listQuery(
		"AppManagement",
		"appName,appAbbr,startingCode,entityNumber,installPassword,remarks,iconConfig",
		{
			equation: "AND",
			items: [
				{
					fieldName: "appName",
					op: "LK",
					value: keyword.value,
				},
				{
					fieldName: "isInstalled",
					op: "EQ",
					value: activeTab.value === "installed" ? 1 : 0,
				},
			],
		},
		10,
		1,
		[]
	);
	if (res) {
		tabList.value = res.data.dataList.map((el) => {
			if (el.iconConfig) {
				el.iconConfig = JSON.parse(el.iconConfig);
			}
			return el;
		});
	}
	if (tabList.value.length === 0) {
		isShowEmpty.value = true;
	}
	loading.value = false;
};

let listDialogRef = ref(null);

// 新建应用
const handleAddApp = () => {
	listDialogRef.value.openDialog("add", tabList.value);
};

// 更多功能
const handleMoreFunc = (item, command) => {
    // 编辑
    if (command === "edit") {
        listDialogRef.value.openDialog("edit", item);
    } 
    // 删除
    else if (command === "delete") {
        handleDeleteApp(item);
    }
};
// 安装应用
const handleInstallApp = () => {
	ElMessageBox.confirm(t("appManager.1303"), t("operation.9000"), {
		confirmButtonText: t("appManager.1304"),
		cancelButtonText: t("operation.7000"),
		type: "warning",
	})
		.then(() => {
			listDialogRef.value.openDialog("install", null);
		})
		.catch(() => {});
};
// 导出应用
const handleExportApp = (item) => {
	listDialogRef.value.openDialog("export", item);
};
// 删除应用
const handleDeleteApp = (item) => {
	ElMessageBox.confirm(t("appManager.1300"), t("operation.9000"), {
		confirmButtonText: t("operation.6001"),
		cancelButtonText: t("operation.7000"),
		type: "warning",
	})
		.then(async () => {
			loading.value = true;
			let res = await deleteRecord(item.appManagementId);
			if (res) {
				ElMessage.success(t("operation.4102"));
				getTabList();
			}
			loading.value = false;
		})
		.catch(() => {});
};

// 设计应用
const handleDesignApp = (item) => {
	const appPath = import.meta.env.VITE_APP_PATH;
	// 新窗口打开设计应用页面
	window.open(
		`${window.location.origin}${appPath}designApp?appName=${item.appName}&appAbbr=${item.appAbbr}`,
		"_blank"
	);
};
</script>
