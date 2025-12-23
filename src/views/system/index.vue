<template>
	<div class="system-manager">
		<div class="feature-overview">
			<div
				class="category-section"
				v-for="(category, categoryIndex) in categories"
				:key="categoryIndex"
			>
			<div class="category-title">{{ category.title }}</div>
			<div class="features-container">
				<el-card
					class="feature-card"
					shadow="hover"
					v-for="(feature, featureIndex) in category.features"
					:key="featureIndex"
					:style="{ background: feature.background }"
					@click="feature.route && (!feature.role || $TOOL.checkRole(feature.role)) && goToRoute(feature.route)"
					:class="{ 
						'clickable': feature.route && (!feature.role || $TOOL.checkRole(feature.role)),
						'is-disabled': feature.role && !$TOOL.checkRole(feature.role)
					}"
				>
					<div class="feature-content">
						<div class="feature-title">
							<el-icon v-if="feature.icon" class="feature-icon">
								<component :is="getIconComponent(feature.icon)" />
							</el-icon>
							<span>{{ feature.title }}</span>
						</div>
						<div class="feature-desc">{{ feature.desc }}</div>
					</div>
				</el-card>
			</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, computed, inject } from "vue";
import { useRouter } from "vue-router";
import { ElIcon } from "element-plus";
import useCommonStore from "@/store/modules/common";
import { storeToRefs } from "pinia";
const { publicSetting } = storeToRefs(useCommonStore());
let { tenantInfo, pluginIdList, openJobPosition } = publicSetting.value;
let Router = useRouter();
const $TOOL = inject("$TOOL");

// 转换图标名称：el-icon-xxx -> ElIconXxx
const getIconComponent = (iconName) => {
	if (!iconName) return null;
	if (iconName.startsWith('el-icon-')) {
		const name = iconName.replace('el-icon-', '');
		// 将 kebab-case 转换为 PascalCase
		// 例如：el-icon-coin -> ElIconCoin, el-icon-Cpu -> ElIconCpu
		const parts = name.split('-');
		const componentName = 'ElIcon' + parts.map(word => {
			// 如果第一个字符已经是大写，保持原样
			if (word.charAt(0) === word.charAt(0).toUpperCase()) {
				return word;
			}
			// 否则首字母大写
			return word.charAt(0).toUpperCase() + word.slice(1);
		}).join('');
		return componentName;
	}
	return iconName;
};

const categories = ref([
	{
		title: "准备工作",
		features: [
			{
				title: "系统配置",
				desc: "系统基础配置管理",
				background: "#EDFBF4",
				route: "comConf",
				icon: "el-icon-setting",
				role: 'r6022',
			},
			{
				title: "用户管理",
				desc: "部门与用户管理，还可以从钉钉、企微自动同步",
				background: "#EEF3FB",
				route: "user-list",
				icon: "el-icon-user",
				role: 'r21-1',
			},
			{
				title: "权限角色",
				desc: "灵活、强大的权限控制，支持多角色",
				background: "#FDF2F2",
				route: "role-list",
				icon: "el-icon-key",
				role: 'r23-1',
			},
			{
				title: "团队管理",
				desc: "团队组织架构管理",
				background: "#FEFAE2",
				route: "team-list",
				icon: "el-icon-suitcase-line",
				role: 'r24-1',
			},
		],
	},
	{
		title: "入门使用",
		features: [
			{
				title: "数据建模",
				desc: "实体是业务数据的载体，是搭建业务系统的基础",
				background: "#ECFBF4",
				route: "entity-list",
				icon: "el-icon-coin",
				role: 'r6001',
			},
			{
				title: "数据字典",
				desc: "管理系统的数据字典配置",
				background: "#FCEFFD",
				route: "option-manager",
				icon: "el-icon-operation",
				role: 'r6005',
			},
			{
				title: "数据导入",
				desc: "支持Excel和CSV文件导入，充分利用现有数据",
				background: "#FDFBE2",
				route: "data-upload",
				icon: "el-icon-BottomRight",
				role: 'r6011',
			},
		],
	},
	{
		title: "进阶使用",
		features: [
			{
				title: "触发器",
				desc: "通过触发器可以实现丰富的自动化处理，全图形界面配置",
				background: "#FEF2F2",
				route: "trigger-list",
				icon: "el-icon-Cpu",
				role: 'r48-1',
			},
			{
				title: "触发器日志",
				desc: "查看触发器执行日志",
				background: "#EDFBF4",
				route: "trigger-log",
				icon: "el-icon-Timer",
				role: 'r6015',
			},
			{
				title: "审批流程",
				desc: "多条件审批节点，支持或签、会签、转审、加签等高级特性",
				background: "#EEF3FB",
				route: "process-list",
				icon: "el-icon-share",
				role: 'r6016',
			},
			{
				title: "复杂流程监控",
				desc: "监控复杂流程的执行状态",
				background: "#FDF2F2",
				route: "process-monitoring",
				icon: "el-icon-data-line",
				role: 'r6016',
			},
			{
				title: "仪表盘设计",
				desc: "可视化数据分析和展示",
				background: "#FEFAE2",
				route: "dashboard-list",
				icon: "el-icon-menu",
				role: 'r52-1',
			},
			{
				title: "报表设计",
				desc: "基于Excel的报表模板，简单好用，支持多种输出格式",
				background: "#ECFBF4",
				route: "templates-list",
				icon: "el-icon-memo",
				role: 'r45-1',
			},
		],
	},
	{
		title: "高级功能",
		features: [
			{
				title: "自定义方法",
				desc: "自定义业务方法和逻辑",
				background: "#FCEFFD",
				route: "custom-method",
				icon: "park-Api",
				role: 'r6027',
			},
			{
				title: "数据转化",
				desc: "满足业务数据在不同业务(模块)间快速流转",
				background: "#FDFBE2",
				route: "data-transformation",
				icon: "el-icon-Cpu",
				role: 'r6021',
			},
			{
				title: "数据备份",
				desc: "数据库备份与恢复管理",
				background: "#EDFBF4",
				route: "database-backups",
				icon: "el-icon-Collection",
				role: 'r6023',
                isHide: tenantInfo && tenantInfo.tenantId,
			},
			{
				title: "开发版本管理",
				desc: "开发版本的导入导出管理",
				background: "#EEF3FB",
				route: "devVersionHistory",
				icon: "el-icon-Tickets",
				role: 'r6018',
			},
			{
				title: "外部表单",
				desc: "外部表单集成管理",
				background: "#FDF2F2",
				route: "external-list",
				icon: "el-icon-list",
				role: 'r6020',
			},
			{
				title: "API密钥",
				desc: "API密钥管理",
				background: "#FEFAE2",
				route: "meta-api",
				icon: "el-icon-key",
				role: 'r51-1',
			},
			{
				title: "外部数据源",
				desc: "外部数据源配置管理",
				background: "#ECFBF4",
				route: "outer-data-source",
				icon: "el-icon-Coin",
				role: 'r65-1',
                isHide: !pluginIdList || !pluginIdList.includes('metaDataWarehouse'),
			},
			{
				title: "数据模型",
				desc: "数据模型配置管理",
				background: "#FCEFFD",
				route: "outer-data-model",
				icon: "el-icon-Coin",
				role: 'r66-1',
                isHide: !pluginIdList || !pluginIdList.includes('metaDataWarehouse'),
			},
			{
				title: "应用管理",
				desc: "应用配置和管理",
				background: "#FDFBE2",
				route: "app-manager",
				icon: "el-icon-Platform",
				role: 'r6025',
			},
		],
	},
	{
		title: "辅助功能",
		features: [
			{
				title: "数据变更历史",
				desc: "查看数据变更历史记录",
				background: "#FEF2F2",
				route: "revision-history",
				icon: "el-icon-EditPen",
				role: 'r6010',
			},
			{
				title: "登录日志",
				desc: "查看系统登录日志",
				background: "#EDFBF4",
				route: "login-log",
				icon: "el-icon-Tickets",
				role: 'r6014',
			},
			{
				title: "回收站",
				desc: "已删除数据的回收站",
				background: "#EEF3FB",
				route: "recycle-bin",
				icon: "el-icon-delete",
				role: 'r6000',
			},
		],
	},
]);

const goToRoute = (route) => {
    let appPath = import.meta.env.VITE_APP_PATH;
	Router.push({
		path: appPath + route,
	});
};

</script>

<style scoped lang="scss">
.system-manager {
	padding: 20px 20px;
	background: #fff;
	min-height: calc(100vh - 84px);

	.feature-overview {
		.category-section {
			margin-bottom: 40px;
			.category-title {
				font-size: 24px;
				font-weight: bold;
				color: #303133;
				margin-bottom: 20px;
				padding-bottom: 10px;
				border-bottom: 2px solid #409eff;
			}

			.features-container {
				display: grid;
				grid-template-columns: repeat(4, 1fr);
				gap: 20px;

				.feature-card {
					transition: all 0.3s;
					border-radius: 8px;
					border: none;

					&.clickable {
						cursor: pointer;
					}

					&.is-disabled {
						opacity: 0.6;
						cursor: not-allowed;
					}

					:deep(.el-card__body) {
						padding: 20px;
					}
                    

					.feature-content {
						.feature-title {
							font-size: 16px;
							color: #4183c4;
							margin-bottom: 5px;
							display: flex;
							align-items: center;
							gap: 8px;

							.feature-icon {
								font-size: 18px;
							}
						}

						.feature-desc {
							font-size: 14px;
							color: #999999;
							line-height: 1.6;
						}
					}
                    &.feature-card-parent {
                        &:hover {
                            box-shadow: none !important;
                        }
                        :deep(.el-card__body) {
                            padding: 0px;
                        }
                        .feature-content {
                            .feature-title {
                                color: #303133;
                                font-weight: 600;
                                display: flex;
                                align-items: center;
                                gap: 8px;

                                .feature-icon {
                                    font-size: 18px;
                                }
                            }
                        }
                    }
				}
			}
		}
	}
}
</style>
