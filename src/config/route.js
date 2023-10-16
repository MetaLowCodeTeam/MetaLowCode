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






const routes = [
    {
        "name": "home",
        "path": "/web/home",
        "meta": {
            "title": "首页",
            "icon": "el-icon-eleme-filled",
            "type": "menu"
        },
        "children": [
            {
                "name": "dashboard",
                "path": "/web/dashboard",
                "meta": {
                    "title": "控制台",
                    "icon": "el-icon-menu",
                    "affix": true
                },
                "component": "home/index"
            },
            {
                path: "/web/:entityname/list",
                name: "MenuTrendsList",
                "meta": {
                    hidden: true,
                },
            }

            // ...formatRoutrs
        ]
    },

    //*****

    {
        path: '/web/system',
        name: 'SystemManager',
        meta: { title: '系统管理', icon: 'el-icon-setting', svgIcon: 'setting' },
        children: [
            {
                path: '/web/field-manager',
                name: 'FieldManager',
                component: 'system/entity-field-table',
                props: true,
                hidden: true,
                meta: { title: '字段管理', icon: '', activeRoute: '/system/metadata/entity-list', hidden: true },
            },

            {
                path: '/web/form-design',
                name: 'FormDesign',
                component: 'system/form-design/index',
                hidden: true,
                props: true,
                meta: { title: '可视化表单设计', icon: '', /*, keepAlive: false */ activeRoute: '/system/metadata/entity-list', hidden: true }
            },

            // 通用配置
            {
                path: '/web/comConf',
                name: 'ComConf',
                component: 'system/common-config/index',
                meta: { title: '通用配置', icon: 'el-icon-setting', role: 'r6012' }
            },
            {
                path: '/web/metadata',
                name: 'Metadata',
                meta: { group: true, title: '元数据设置', icon: "el-icon-coin", role: 'r6001' },
                children: [
                    {
                        path: '/web/entity-list',
                        name: 'EntityList',
                        component: 'system/entity-list',
                        meta: { title: '实体管理', icon: 'el-icon-coin' }
                    },

                ]
            },

            {
                path: '/web/user-manager',
                name: 'UserManager',
                meta: { group: true, title: '组织架构', icon: 'el-icon-user' },
                children: [
                    {
                        path: '/web/user-list',
                        name: 'UserList',
                        component: 'user/user-tree-table',
                        meta: { title: '用户管理', icon: 'el-icon-user', role: 'r21-1', entityName: "User" }
                    },

                    {
                        path: '/web/role-list',
                        name: 'RoleList',
                        component: 'user/role-list-view',
                        meta: { title: '权限角色', icon: 'el-icon-key', role: 'r23-1', entityName: "Role" }
                    },
                    {
                        path: '/web/team-list',
                        name: 'TeamList',
                        component: 'user/team-list-view',
                        meta: { title: '团队', icon: 'el-icon-suitcase-line', role: 'r24-1', entityName: "Team" }
                    },
                ]
            },
            {
                path: '/web/data-dict',
                name: 'DataDict',
                meta: { group: true, title: '数据字典', icon: 'el-icon-management' },
                children: [
                    {
                        path: '/web/option-manager',
                        name: 'OptionManager',
                        component: 'system/data-dict/option-manager',
                        meta: { title: '单选项管理', icon: 'el-icon-operation', role: 'r6005' }
                    },

                    {
                        path: '/web/tag-manager',
                        name: 'TagManager',
                        component: 'system/data-dict/tag-manager',
                        meta: { title: '多选项管理', icon: 'el-icon-files', role: 'r6006' }
                    },
                ]
            },
            // 审批流程
            {
                path: '/web/process-list',
                name: 'ProcessList',
                component: 'system/approval-process/process-list',
                meta: { title: '审批流程', icon: 'el-icon-operation', role: 'r30-1' }
            },
            {
                path: `/web/process-detail`,
                name: 'ProcessDetail',
                component: 'system/approval-process/process-detail',
                hidden: true,
                meta: { title: '流程设计', hidden: true }
            },
            // 审批中心
            {
                path: '/web/approval-center',
                name: 'ApprovalCenter',
                meta: { group: true, title: '审批中心', icon: 'el-icon-connection' },
                children: [
                    {
                        path: '/web/center-handle',
                        name: 'CenterHandle',
                        component: 'system/approval-center/center-handle',
                        meta: { title: '待我处理', }
                    },
                    {
                        path: `/web/center-submit`,
                        name: 'CenterSubmit',
                        component: 'system/approval-center/center-submit',
                        meta: { title: '我提交的', }
                    },
                    {
                        path: `/web/center-cc`,
                        name: 'CenterCc',
                        component: 'system/approval-center/center-cc',
                        meta: { title: '抄送我的', }
                    },
                ]
            },
            // 触发器
            {
                path: '/web/trigger-list',
                name: 'RriggerList',
                meta: { group: true, title: '触发器', icon: 'el-icon-cpu', role: 'r48-1' },
                component: 'system/trigger/trigger-list',
            },
            // 触发器详情
            {
                path: '/web/trigger-detail',
                name: 'RriggerDetail',
                meta: { title: '触发器详情', hidden: true },
                component: 'system/trigger/trigger-detail',
            },
            // 仪表盘
            {
                path: '/web/dashboard-list',
                name: 'DashboardDesign',
                meta: { title: '仪表盘', icon: 'el-icon-menu', role: 'r52-1' },
                component: 'system/dashboard-design/chart',
            },
            // 报表设计
            {
                path: '/web/templates-list',
                name: 'TemplatesList',
                component: 'system/report-templates/templates-list',
                meta: { title: '报表设计', icon: 'el-icon-memo', role: 'r45-1' }
            },
            // 数据导入
            {
                path: '/web/data-upload',
                name: 'DataUpload',
                meta: { title: '数据导入', icon: 'el-icon-Upload', role: 'r6011' },
                component: 'system/data-upload/index',
            },
            // 账号信息
            {
                "name": "userCenter",
                "path": "/web/usercenter",
                "meta": {
                    "title": "帐号信息",
                    "icon": "el-icon-user",
                },
                "component": "userCenter/index"
            },
            // 消息中心
            {
                path: '/web/notification',
                name: 'Notification',
                meta: { title: '消息中心', icon: 'el-icon-chat-dot-round' },
                component: 'system/notification/index',
            },
            // 变更历史
            {
                path: '/web/revision-history',
                name: 'RevisionHistory',
                meta: { title: '变更历史', icon: 'el-icon-document-remove', role: 'r6010' },
                component: 'system/revision-history/index',
            },
            // 回收站
            {
                path: '/web/recycle-bin',
                name: 'RecycleBin',
                meta: { title: '回收站', icon: 'el-icon-delete', role: 'r6009' },
                component: 'system/recycle-bin/index',
            },

        ]
    },

]


export default routes;
