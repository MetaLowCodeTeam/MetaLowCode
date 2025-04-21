// 静态路由配置
// 书写格式与动态路由格式一致，全部经由框架统一转换
// 比较动态路由在meta中多加入了role角色权限，为数组类型。一个菜单是否有权限显示，取决于它以及后代菜单是否有权限。
// routes 显示在左侧菜单中的路由(显示顺序在动态路由之前)
// 示例如下



// const routes = [
// 	{
// 		name: "demo",
// 		path: "/demo",
// 		meta: {
// 			icon: "el-icon-eleme-filled",
// 			title: "演示",
// 			role: ["SA"]
// 		},
// 		children: [{
// 			name: "demopage",
// 			path: "/demopage",
// 			component: "test/autocode/index",
// 			meta: {
// 				icon: "el-icon-menu",
// 				title: "演示页面",
// 				role: ["SA"]
// 			}
// 		}]
// 	}
// ]


import { t } from "@/locales"

const appPath = import.meta.env.VITE_APP_PATH;

const routes = [
    {
        "name": "home",
        "path": appPath + "home",
        "meta": {
            "title": "工作台",
            "icon": "el-icon-Platform",
            "type": "menu"
        },
        "children": [
            // 仪表盘
            {
                "name": "dashboard",
                "path": appPath + "dashboard",
                "meta": {
                    "title": "仪表盘",
                    "icon": "park-Dashboard",
                    "affix": true
                },
                "component": "home/index"
            },
            // 审批中心
            {
                path: appPath + "approval-center",
                name: 'ApprovalCenter',
                meta: { group: true, title: '审批中心', icon: 'el-icon-connection', hidden: true },
                children: [
                    {
                        path: appPath + "center-handle",
                        name: 'CenterHandle',
                        component: 'system/approval-center/center-handle',
                        meta: { title: '待我处理', hidden: true }
                    },
                    {
                        path: appPath + "center-submit",
                        name: 'CenterSubmit',
                        component: 'system/approval-center/center-submit',
                        meta: { title: '我提交的', hidden: true }
                    },
                    {
                        path: appPath + "center-cc",
                        name: 'CenterCc',
                        component: 'system/approval-center/center-cc',
                        meta: { title: '抄送我的', hidden: true }
                    },
                    {
                        path: appPath + "center-approved",
                        name: 'CenterApproved',
                        component: 'system/approval-center/center-approved',
                        meta: { title: '审批过的', hidden: true }
                    },
                ]
            },
            // 数据导入
            {
                path: appPath + "data-upload2",
                name: 'DataUpload2',
                meta: { title: '数据导入', role: 'r6011', hidden: true },
                component: 'system/data-upload/index',
            },
            // 账号信息
            {
                "name": "userCenter",
                "path": appPath + "usercenter",
                "meta": {
                    "title": "帐号信息",
                    "icon": "el-icon-user",
                    hidden: true
                },
                "component": "userCenter/index"
            },
            // 消息中心
            {
                path: appPath + "notification",
                name: 'Notification',
                meta: { title: '消息中心', icon: 'el-icon-chat-dot-round', hidden: true },
                component: 'system/notification/index',
            },
            // 数据模型-查看数据
            {
                path: appPath + 'data-model-query',
                name: 'DataModelQuery',
                component: 'system/data-base/components/OuterDataModel-list',
                meta: { title: '', hidden: true }
            },

            {
                path: appPath + ":entityname/list",
                name: "MenuTrendsList",
                "meta": {
                    hidden: true,
                },
                component: 'customize-menu/list',
            },
            // 新窗口新建
            {
                path: appPath + ":entityName/create-entity",
                name: "NewWindowCreateEntity",
                "meta": {
                    hidden: true,
                },
                component: 'customize-menu/NewWindowCreateEntity',
            },
            // 可查看的审批流程详情
            {
                path: appPath + "custom-page/approval-detail",
                name: "ApprovalDetail",
                "meta": {
                    hidden: true,
                },
                component: 'custom-page/approval-detail',
            },
            // 内嵌的iframe导航
            // {
            //     path: appPath + "custom-page/iframe",
            //     name: "inIframe",
            //     "meta": {
            //         hidden: true,
            //     },
            //     component: 'custom-page/iframe',
            // },
        ]
    },

    //*****

    {
        path: appPath + "system",
        name: 'SystemManager',
        meta: { title: '开发中心', icon: 'el-icon-setting', svgIcon: 'setting', role: 'r6017' },
        children: [
            // 通用配置
            {
                path: appPath + "comConf",
                name: 'ComConf',
                component: 'system/common-config/index',
                meta: { title: '系统配置', icon: 'el-icon-setting', role: 'r6022' }
            },

            {
                path: appPath + "user-manager",
                name: 'UserManager',
                meta: { title: '组织架构', icon: 'el-icon-user' },
                children: [
                    {
                        path: appPath + "user-list",
                        name: 'UserList',
                        component: 'user/user-tree-table',
                        meta: { title: '用户管理', icon: 'el-icon-user', role: 'r21-1', entityName: "User" }
                    },

                    {
                        path: appPath + "role-list",
                        name: 'RoleList',
                        component: 'user/role-list-view',
                        meta: { title: '权限角色', icon: 'el-icon-key', role: 'r23-1', entityName: "Role" }
                    },
                    {
                        path: appPath + "team-list",
                        name: 'TeamList',
                        component: 'user/team-list-view',
                        meta: { title: '团队管理', icon: 'el-icon-suitcase-line', role: 'r24-1', entityName: "Team" }
                    },
                    {
                        path: appPath + "job-position-list",
                        name: 'JobPositionList',
                        component: 'user/job-position-list-view',
                        meta: { title: '岗位管理', icon: 'el-icon-suitcase-line', role: 'r90-1', entityName: "JobPosition" }
                    },
                ]
            },
            // 多租户
            {
                path: appPath + 'tenant',
                name: 'Tenant',
                meta: { title: '多租户', icon: 'park-NetworkTree', role: 'r52-1' },
                component: 'system/analysis-setting/Tenant',
            },
            // 应用管理
            {
                path: appPath + 'app-manager',
                name: 'AppManager',
                component: 'system/app-manager/index',
                meta: { title: t('route.20904'), icon: 'el-icon-Platform', role: 'r6025' }
            },
            {
                path: '',
                name: 'BasicSetting',
                meta: { title: '数据建模', icon: 'el-icon-SuitcaseLine' },
                children: [
                    {
                        path: appPath + 'metadata',
                        name: 'Metadata',
                        meta: { group: true, title: '元数据管理', icon: "el-icon-coin" },
                        children: [
                            {
                                path: appPath + 'entity-list',
                                name: 'EntityList',
                                component: 'system/entity-list',
                                meta: { title: '实体管理', icon: 'el-icon-coin', role: 'r6001' }
                            },

                        ]
                    },

                    {
                        path: appPath + 'data-dict',
                        name: 'DataDict',
                        meta: { group: true, title: '数据字典', icon: 'el-icon-operation' },
                        children: [
                            {
                                path: appPath + 'option-manager',
                                name: 'OptionManager',
                                component: 'system/data-dict/option-manager',
                                meta: { title: '单选项管理', icon: 'el-icon-open', role: 'r6005' }
                            },

                            {
                                path: appPath + 'tag-manager',
                                name: 'TagManager',
                                component: 'system/data-dict/tag-manager',
                                meta: { title: '多选项管理', icon: 'el-icon-guide', role: 'r6006' }
                            },

                            {
                                path: appPath + 'system-manager',
                                name: 'SystemManager',
                                component: 'system/data-dict/system-manager',
                                meta: { title: '系统常量管理', icon: 'el-icon-guide', role: 'r6019' }
                            },
                        ]
                    },

                ]
            },

			{
				path: '',
				name: 'WorkFlowSetting',
				meta: {title: '流程管理', icon: 'el-icon-Stamp'},
				children: [
					// 审批流程
					{
						path: appPath + 'process-list',
						name: 'ProcessList',
						component: 'system/approval-process/process-list',
						meta: { title: '审批流程', icon: 'el-icon-share', role: 'r6016' }
					},
                    // 复杂流程监控
					{
						path: appPath + 'process-monitoring',
						name: 'ProcessMonitoring',
						component: 'system/approval-process/process-monitoring',
						meta: { title: '复杂流程监控', icon: 'el-icon-data-line', role: 'r6016' }
					}
				]
			},

			{
				path: '',
				name: 'TriggerSetting',
				meta: {title: '触发器管理', icon: 'el-icon-Stopwatch'},
				children: [
					{
						path: appPath + 'trigger-list',
						name: 'TriggerList',
						component: 'system/trigger/trigger-list',
						meta: { title: '触发器列表', icon: 'el-icon-Cpu', role: 'r48-1' },
					},

					{
						path: appPath + 'trigger-log',
						name: 'TriggerLog',
						component: 'system/trigger/trigger-log',
						meta: { title: '触发器日志', icon: 'el-icon-Timer', role: 'r6015' }
					},
				]
			},

			{
				path: '',
				name: 'AnalysisSetting',
				meta: {title: '数据可视化', icon: 'el-icon-Histogram'},
				children: [
					// 仪表盘
					{
						path: appPath + 'dashboard-list',
						name: 'DashboardDesign',
						meta: { group: true, title: '可视化分析', icon: 'el-icon-menu', role: 'r52-1' },
						component: 'system/dashboard-design/chart',
						children: [
							{
								path: appPath + 'dashboard-list',
								name: 'DashboardDesign',
								meta: { title: '仪表盘', icon: 'el-icon-menu', role: 'r52-1' },
								component: 'system/dashboard-design/chart',
							},
						]
					},
					// 报表设计
					{
						path: appPath + 'templates-list',
						name: 'TemplatesList',
						component: 'system/report-templates/templates-list',
						meta: { group: true, title: '数据打印', icon: 'el-icon-memo', role: 'r45-1' },
						children: [
							{
								path: appPath + 'templates-list',
								name: 'TemplatesList',
								component: 'system/report-templates/templates-list',
								meta: { title: '报表设计', icon: 'el-icon-memo', role: 'r45-1' }
							}
						]
					},
				]
			},
            // 外部集成
            {
				path: '',
				name: 'ExternalIntegration',
				meta: {title: '外部集成', icon: 'el-icon-soldOut'},
				children: [
					// 外部表单列表
					{
						path: appPath + 'external-list',
						name: 'ExternalList',
                        meta: { title: '外部表单', icon: 'el-icon-list', role: 'r6020' },
						component: 'system/external-integration/external-list',
					},
                    // API密钥
					{
						path: appPath + 'meta-api',
						name: 'MetaApi',
                        meta: { title: 'API密钥', icon: 'el-icon-key', role: 'r51-1' },
						component: 'system/external-integration/meta-api',
					},
                    // 外部数据源
                    {
                        path: appPath + 'outer-data-source',
                        name: 'OuterDataSource',
                        component: 'system/data-base/OuterDataSource',
                        meta: { title: '外部数据源', icon: 'el-icon-Coin', role: 'r65-1' }
                    },
                    // 数据模型
                    {
                        path: appPath + 'outer-data-model',
                        name: 'OuterDataModel',
                        component: 'system/data-base/OuterDataModel',
                        meta: { title: '数据模型', icon: 'el-icon-Coin', role: 'r66-1' }
                    },
                    
				]
			},

            // 数据导入
            {
                path: appPath + 'data-upload',
                name: 'DataUpload',
                meta: { title: '数据管理', icon: 'el-icon-switch', role: 'r6011' },
                component: 'system/data-upload/index',
                children: [
                    {
                        path: appPath + 'data-upload',
                        name: 'DataUpload',
                        meta: { title: '数据导入', icon: 'el-icon-BottomRight', role: 'r6011' },
                        component: 'system/data-upload/index',
                    },

                    // 数据库备份
                    {
                        path: appPath + 'database-backups',
                        name: 'DatabaseBackups',
                        meta: { title: '数据库备份', icon: 'el-icon-Collection', role: 'r6023' },
                        component: 'system/data-base/backups',
                    },
                    // 版本管理
                    {
                        path: appPath + 'devVersionHistory',
                        name: 'DevVersionHistory',
                        meta: { title: '开发版本管理', icon: 'el-icon-Tickets', role: 'r6018' },
                        component: 'system/devVersionHistory/index',
                    },
                    // 数据转化
                    {
						path: appPath + 'data-transformation',
						name: 'DataTransformation',
						component: 'system/data-transformation/index',
						meta: { title: '数据转化', icon: 'el-icon-Cpu', role: 'r6021' },
					},
                    // 数据转化-详情
                    {
						path: appPath + 'data-transformation/:recordId',
						name: 'DataTransformationDetail',
						component: 'system/data-transformation/Detail/Index',
						meta: { title: '数据转化-详情', hidden: true},
					},
                ]
            },
            // 字段管理
            {
                path: appPath + 'field-manager',
                name: 'FieldManager',
                component: 'system/entity-field-table',
                props: true,
                meta: { title: '字段管理', icon: '', activeRoute: '/system/metadata/entity-list', hidden: true },
            },
            // 可视化表单设计
            {
                path: appPath + 'form-design',
                name: 'FormDesign',
                component: 'system/form-design/index',
                props: true,
                meta: { title: '可视化表单设计', icon: '', /*, keepAlive: false */ activeRoute: '/system/metadata/entity-list', hidden: true }
            },
            // 审批流程详情
            {
                path: appPath + "process-detail",
                name: 'ProcessDetail',
                component: 'system/approval-process/process-detail',
                hidden: true,
                meta: { title: '流程设计', hidden: true }
            },

            // 触发器详情
            {
                path: appPath + 'trigger-detail',
                name: 'TriggerDetail',
                meta: { title: '触发器详情', hidden: true },
                component: 'system/trigger/trigger-detail',
            },

            // 辅助设置
            {
                path: '',
                name: 'ExtraSetting',
                meta: { title: '辅助设置', icon: 'el-icon-Help', },
                component: 'system/revision-history/index',
                children: [
                    // 变更历史
                    {
                        path: appPath + 'revision-history',
                        name: 'RevisionHistory',
                        meta: { title: '变更历史', icon: 'el-icon-EditPen', role: 'r6010' },
                        component: 'system/revision-history/index',
                    },

                    // 登录日志
                    {
                        path: appPath + 'login-log',
                        name: 'LoginLog',
                        meta: { title: '登录日志', icon: 'el-icon-Tickets', role: 'r6014' },
                        component: 'login/login-log',
                    },

                    // 回收站
                    {
                        path: appPath + 'recycle-bin',
                        name: 'RecycleBin',
                        meta: { title: '回收站', icon: 'el-icon-delete', role: 'r6000' },
                        component: 'system/recycle-bin/index',
                    },
                ]
            },

        ]
    },

]


export default routes;
