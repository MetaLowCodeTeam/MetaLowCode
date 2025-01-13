<style lang="scss" scoped>
.app-manager {
	height: 100%;
}
.props-action-section {
	.section-title {
		font-size: 16px;
	}
}
.app-manager-main {
	padding: 0;
	background: #fff;
	.app-manager-tabs {
		height: 32px;
		line-height: 32px;
		.app-manager-tab {
			cursor: pointer;
			display: inline-block;
			padding: 0 20px;
			font-size: 14px;
			border: 1px solid #e6e6e6;
			border-top: none;
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
	.app-manager-list {
		max-height: calc(100% - 32px);
		overflow: auto;
		overflow-x: hidden;
		padding: 10px;
		box-sizing: border-box;
		.app-manager-item {
			width: 100%;
			height: 135px;
			border: 1px solid #e6e6e6;
			border-radius: 4px;
			box-sizing: border-box;
			padding: 20px 10px 10px 10px;
			margin-bottom: 10px;
			position: relative;
			&:hover {
				border-color: var(--el-color-primary);
			}
			.app-manager-item-export {
				position: absolute;
				top: 0;
				right: 0;
				color: #303030;
				border: 1px solid #e6e6e6;
				border-top: none;
				border-right: none;
				padding: 2px 10px;
				font-size: 12px;
				border-radius: 0px 0px 0px 4px;
				cursor: pointer;
				&:hover {
					color: #fff;
					background: var(--el-color-primary);
				}
			}
			.app-manager-item-title {
				margin-bottom: 10px;
				.app-manager-item-title-text {
					width: 60%;
					margin: 0 auto;
					text-align: center;
					font-size: 16px;
					font-weight: bold;
				}
			}
			.app-manager-item-introduction {
				font-size: 13px;
				min-height: 36px;
				color: #999;
				// CSS超出两行显示...
				display: -webkit-box;
				-webkit-box-orient: vertical;
				-webkit-line-clamp: 2;
				overflow: hidden;
				margin-bottom: 10px;
			}
			.app-manager-item-btns {
				text-align: right;
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
			<span class="section-title">{{ $t("appManager.1000") }}</span>
			<div class="section-fr fr">
				<ml-search-input
					style="margin-right: 10px"
					v-model="keyword"
					:placeholder="$t('operation.5000')"
				/>
                <el-button type="primary" icon="Plus" @click="handleAddApp">
                    {{ $t("appManager.1005") }}
                </el-button>
                <el-button type="primary" icon="Plus" @click="handleInstallApp">
                    {{ $t("appManager.1006") }}
                </el-button>
			</div>
		</el-header>
		<el-main class="app-manager-main">
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
			<div class="app-manager-list">
				<el-row :gutter="20">
					<el-col
						:span="6"
						v-for="(item, index) in tabList"
						:key="index"
					>
						<div class="app-manager-item">
							<!-- 导出小标签 -->
							<span
								class="app-manager-item-export"
								v-if="activeTab === 'developing'"
								@click="handleExportApp(item)"
							>
								{{ $t("appManager.1004") }}
							</span>
							<div class="app-manager-item-title">
								<div
									class="app-manager-item-title-text yichu"
									:title="item.name"
								>
									{{ item.name }}
								</div>
							</div>
							<div
								class="app-manager-item-introduction"
								:title="item.introduction"
							>
								{{ item.introduction }}
							</div>
							<div class="app-manager-item-btns">
								<el-button
									plain
									size="small"
									v-if="activeTab === 'developing'"
                                    @click="handleDesignApp(item)"
								>
									{{ $t("appManager.1003") }}
								</el-button>
								<el-button
									plain
									size="small"
									v-if="activeTab === 'developing'"
                                    @click="handleEditApp(item)"
								>
									{{ $t("operation.3001") }}
								</el-button>
								<el-button plain size="small" @click="handleDeleteApp(item)">
									{{ $t("operation.4000") }}
								</el-button>
							</div>
						</div>
					</el-col>
				</el-row>
			</div>
		</el-main>
	</el-container>
    <ListDialog ref="listDialogRef"/>
</template>
<script setup>
import { ref, onMounted } from "vue";
import { t } from "@/locales";
import { ElMessageBox } from "element-plus";
import { useRouter } from "vue-router";
import useViewTagsStore from "@/store/modules/viewTags";
import ListDialog from "./components/ListDialog.vue";

const router = useRouter();
const { clearViewTags } = useViewTagsStore();

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

// 获取列表
const getTabList = () => {
	loading.value = true;
	setTimeout(() => {
		tabList.value = [
			{
				name: "应用管理名称应用管理名称应用管理名称应用管理名称",
				introduction: "应用管理描述应用管理描述应用管理描述应用管理描述应用管理描述应用管理描述应用管理描述应用管理描述应用管理描述应用管理描述应用管理描述",
				version: "1.0.0",
				createdTime: "2024-01-01 10:00:00",
				createdUser: "admin",
			},
			{
				name: "应用管理名称2",
				introduction: "应用管理描述2",
				version: "1.0.0",
				createdTime: "2024-01-01 10:00:00",
				createdUser: "admin",
			},
			{
				name: "应用管理名称3",
				introduction: "应用管理描述3",
				version: "1.0.0",
				createdTime: "2024-01-01 10:00:00",
				createdUser: "admin",
			},
			{
				name: "应用管理名称4",
				introduction: "应用管理描述4",
				version: "1.0.0",
				createdTime: "2024-01-01 10:00:00",
				createdUser: "admin",
			},
			{
				name: "应用管理名称5",
				introduction: "应用管理描述5",
				version: "1.0.0",
				createdTime: "2024-01-01 10:00:00",
				createdUser: "admin",
			},
			{
				name: "应用管理名称6",
				introduction: "应用管理描述6",
				version: "1.0.0",
				createdTime: "2024-01-01 10:00:00",
				createdUser: "admin",
			},
			{
				name: "应用管理名称7",
				introduction: "应用管理描述7",
				version: "1.0.0",
				createdTime: "2024-01-01 10:00:00",
				createdUser: "admin",
			},
			{
				name: "应用管理名称8",
				introduction: "应用管理描述8",
				version: "1.0.0",
				createdTime: "2024-01-01 10:00:00",
				createdUser: "admin",
			},
			{
				name: "应用管理名称9",
				introduction: "应用管理描述9",
				version: "1.0.0",
				createdTime: "2024-01-01 10:00:00",
				createdUser: "admin",
			},
			{
				name: "应用管理名称10",
				introduction: "应用管理描述10",
				version: "1.0.0",
				createdTime: "2024-01-01 10:00:00",
				createdUser: "admin",
			},
		];
		loading.value = false;
	}, 500);
};

let listDialogRef = ref(null);

// 新建应用
const handleAddApp = () => {
    listDialogRef.value.openDialog('add', null);
};
// 编辑应用
const handleEditApp = (item) => {
    listDialogRef.value.openDialog('edit', item);
};
// 安装应用
const handleInstallApp = () => {
    listDialogRef.value.openDialog('install', null);
};
// 导出应用
const handleExportApp = (item) => {
    listDialogRef.value.openDialog('export', item);
};
// 删除应用
const handleDeleteApp = (item) => {
    ElMessageBox.confirm(t("appManager.1300"), t("operation.9000"), {
        confirmButtonText: t("operation.6001"),
        cancelButtonText: t("operation.7000"),
        type: "warning",
    }).then(() => {
        console.log("删除");
    }).catch(() => {});
};

// 设计应用
const handleDesignApp = (item) => {
    const appPath = import.meta.env.VITE_APP_PATH;
    // clearViewTags();
    // 跳转到设计应用页面
    // router.push({
    //     name: "DesignApp",
    //     query: {
    //         id: item.id,
    //     },
    // });
    // 新窗口打开设计应用页面
    window.open(`${window.location.origin}${appPath}designApp`, '_blank');

};
</script>
