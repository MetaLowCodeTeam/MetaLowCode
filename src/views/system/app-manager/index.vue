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
			<!-- <span class="section-title">{{ $t("appManager.1000") }}</span> -->
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
                <el-button type="primary" icon="Plus" @click="handleAddApp">
                    {{ $t("appManager.1005") }}
                </el-button>
                <el-button type="primary" icon="Plus" @click="handleInstallApp">
                    {{ $t("appManager.1006") }}
                </el-button>
			</div>
		</el-header>
		<el-main class="app-manager-main">
			<div class="app-manager-list">
				<el-row :gutter="20" v-if="!isShowEmpty">
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
									:title="item.appName"
								>
									{{ item.appName }}
								</div>
							</div>
							<div
								class="app-manager-item-introduction"
								:title="item.remarks"
							>
								{{ item.remarks }}
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
                <div class="app-manager-empty" v-else>
                    <el-empty/>
                </div>
			</div>
		</el-main>
	</el-container>
    <ListDialog ref="listDialogRef" @refresh="getTabList"/>
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
        'AppManagement',
        "appName,abbrName,startingCode,entityNumber,installPassword,remarks",
        {
            equation: "AND",
            items: [
                {
                    fieldName: "appName",
                    op: "LK",
                    value: keyword.value
                },
                {
                    fieldName: "isInstalled",
                    op: "EQ",
                    value: activeTab.value === "installed" ? 1 : 0
                }
            ]
        },
        10,
        1,
        []
    );
    if(res) {
        tabList.value = res.data.dataList;
    }
    if(tabList.value.length === 0) {
        isShowEmpty.value = true;
    }
    loading.value = false;
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
    }).then(async () => {
        loading.value = true;
        let res = await deleteRecord(item.appManagementId);
        if(res) {
            ElMessage.success(t("operation.4102"));
            getTabList();
        }
        loading.value = false;
    }).catch(() => {});
};

// 设计应用
const handleDesignApp = (item) => {
    const appPath = import.meta.env.VITE_APP_PATH;
    // 新窗口打开设计应用页面
    window.open(`${window.location.origin}${appPath}designApp?appName=${item.appName}&abbrName=${item.abbrName}`, '_blank');
};
</script>
