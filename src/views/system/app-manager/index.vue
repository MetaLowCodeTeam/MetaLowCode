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
			.app-manager-item-desc {
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
                            <span class="app-manager-item-export" v-if="activeTab === 'developing'">
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
								class="app-manager-item-desc"
								:title="item.desc"
							>
								{{ item.desc }}
							</div>
							<div class="app-manager-item-btns">
								<el-button
									plain
									size="small"
									v-if="activeTab === 'developing'"
								>
									{{ $t("appManager.1003") }}
								</el-button>
								<el-button
									plain
									size="small"
									v-if="activeTab === 'developing'"
								>
									{{ $t("operation.3001") }}
								</el-button>
								<el-button plain size="small">
									{{ $t("operation.4000") }}
                                </el-button>
							</div>
						</div>
					</el-col>
				</el-row>
			</div>
		</el-main>
	</el-container>
</template>
<script setup>
import { ref, onMounted } from "vue";
import { t } from "@/locales";

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

// 获取列表
const getTabList = () => {
	loading.value = true;
	setTimeout(() => {
		tabList.value = [
			{
				name: "应用管理名称应用管理名称应用管理名称应用管理名称",
				desc: "应用管理描述应用管理描述应用管理描述应用管理描述应用管理描述应用管理描述应用管理描述应用管理描述应用管理描述应用管理描述应用管理描述",
				version: "1.0.0",
				createdTime: "2024-01-01 10:00:00",
				createdUser: "admin",
			},
			{
				name: "应用管理名称2",
				desc: "应用管理描述2",
				version: "1.0.0",
				createdTime: "2024-01-01 10:00:00",
				createdUser: "admin",
			},
			{
				name: "应用管理名称3",
				desc: "应用管理描述3",
				version: "1.0.0",
				createdTime: "2024-01-01 10:00:00",
				createdUser: "admin",
			},
			{
				name: "应用管理名称4",
				desc: "应用管理描述4",
				version: "1.0.0",
				createdTime: "2024-01-01 10:00:00",
				createdUser: "admin",
			},
			{
				name: "应用管理名称5",
				desc: "应用管理描述5",
				version: "1.0.0",
				createdTime: "2024-01-01 10:00:00",
				createdUser: "admin",
			},
			{
				name: "应用管理名称6",
				desc: "应用管理描述6",
				version: "1.0.0",
				createdTime: "2024-01-01 10:00:00",
				createdUser: "admin",
			},
			{
				name: "应用管理名称7",
				desc: "应用管理描述7",
				version: "1.0.0",
				createdTime: "2024-01-01 10:00:00",
				createdUser: "admin",
			},
			{
				name: "应用管理名称8",
				desc: "应用管理描述8",
				version: "1.0.0",
				createdTime: "2024-01-01 10:00:00",
				createdUser: "admin",
			},
			{
				name: "应用管理名称9",
				desc: "应用管理描述9",
				version: "1.0.0",
				createdTime: "2024-01-01 10:00:00",
				createdUser: "admin",
			},
			{
				name: "应用管理名称10",
				desc: "应用管理描述10",
				version: "1.0.0",
				createdTime: "2024-01-01 10:00:00",
				createdUser: "admin",
			},
		];
		loading.value = false;
	}, 500);
};
</script>
