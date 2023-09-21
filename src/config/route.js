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
        "path": "/home",
        "meta": {
            "title": "首页",
            "icon": "el-icon-eleme-filled",
            "type": "menu"
        },
        "children": [
            {
                "name": "dashboard",
                "path": "/dashboard",
                "meta": {
                    "title": "控制台",
                    "icon": "el-icon-menu",
                    "affix": true
                },
                "component": "home/index"
            },

            // ...formatRoutrs
        ]
    },

    //*****

    {
        path: '/system',
        name: 'SystemManager',
        meta: { title: '系统管理', icon: 'el-icon-setting', svgIcon: 'setting' },
        children: [
            {
                path: '/field-manager',
                name: 'FieldManager',
                component: 'system/entity-field-table',
                props: true,
                hidden: true,
                meta: { title: '字段管理', icon: '', activeRoute: '/system/metadata/entity-list', hidden: true },
            },

            {
                path: '/form-design',
                name: 'FormDesign',
                component: 'system/form-design/index',
                hidden: true,
                props: true,
                meta: { title: '可视化表单设计', icon: '', /*, keepAlive: false */ activeRoute: '/system/metadata/entity-list', hidden: true }
            },

            {
                path: '/list-setting',
                name: 'ListSetting',
                component: 'business/data-list-view',
                hidden: true,
                props: true,
                meta: { title: '列表设计', icon: '', /*, keepAlive: false */ activeRoute: '/system/metadata/entity-list', hidden: true }
            },
            {
                path: '/metadata',
                name: 'Metadata',
                meta: { group: true, title: '元数据设置', icon: "el-icon-coin", role: 'r6001' },
                children: [
                    {
                        path: '/entity-list',
                        name: 'EntityList',
                        component: 'system/entity-list',
                        meta: { title: '实体管理', icon: 'el-icon-coin' }
                    },

                ]
            },

            {
                path: '/user-manager',
                name: 'UserManager',
                meta: { group: true, title: '组织架构', icon: 'el-icon-user' },
                children: [
                    {
                        path: '/user-list',
                        name: 'UserList',
                        component: 'user/user-tree-table',
                        meta: { title: '用户管理', icon: 'el-icon-user', role: 'r21-1' }
                    },

                    {
                        path: '/role-list',
                        name: 'RoleList',
                        component: 'user/role-list-view',
                        meta: { title: '权限角色', icon: 'el-icon-key', role: 'r23-1' }
                    },
                ]
            },
            {
                path: '/data-dict',
                name: 'DataDict',
                meta: { group: true, title: '数据字典', icon: 'el-icon-management' },
                children: [
                    {
                        path: '/option-manager',
                        name: 'OptionManager',
                        component: 'system/data-dict/option-manager',
                        meta: { title: '单选项管理', icon: 'el-icon-operation', role: 'r6005' }
                    },

                    {
                        path: '/tag-manager',
                        name: 'TagManager',
                        component: 'system/data-dict/tag-manager',
                        meta: { title: '多选项管理', icon: 'el-icon-files', role: 'r6006' }
                    },
                ]
            },
            // 审批流程
            {
                path: '/process-list',
                name: 'ProcessList',
                component: 'system/approval-process/process-list',
                meta: { title: '审批流程', icon: 'el-icon-operation', role: 'r30-1' }
            },
            {
                path: `/process-detail`,
                name: 'ProcessDetail',
                component: 'system/approval-process/process-detail',
                hidden: true,
                meta: { title: '流程设计', hidden: true }
            },
            // 审批中心
            {
                path: '/approval-center',
                name: 'ApprovalCenter',
                meta: { group: true, title: '审批中心', icon: 'el-icon-connection' },
                children: [
                    {
                        path: '/center-handle',
                        name: 'CenterHandle',
                        component: 'system/approval-center/center-handle',
                        meta: { title: '待我处理', }
                    },
                    {
                        path: `/center-submit`,
                        name: 'CenterSubmit',
                        component: 'system/approval-center/center-submit',
                        meta: { title: '我提交的', }
                    },
                    {
                        path: `/center-cc`,
                        name: 'CenterCc',
                        component: 'system/approval-center/center-cc',
                        meta: { title: '抄送我的', }
                    },
                ]
            },
            // 触发器
            {
                path: '/trigger-list',
                name: 'RriggerList',
                meta: { group: true, title: '触发器', icon: 'el-icon-cpu', role: 'r48-1' },
                component: 'system/trigger/trigger-list',
            },
            // 触发器详情
            {
                path: '/trigger-detail',
                name: 'RriggerDetail',
                meta: { title: '触发器详情', hidden: true },
                component: 'system/trigger/trigger-detail',
            },
            // 报表设计
            {
                path: '/templates-list',
                name: 'TemplatesList',
                component: 'system/report-templates/templates-list',
                meta: { title: '报表设计', icon: 'el-icon-memo', role: 'r45-1' }
            },
            // 数据导入
            {
                path: '/data-upload',
                name: 'DataUpload',
                meta: { title: '数据导入', icon: 'el-icon-Upload', role: 'r6011' },
                component: 'system/data-upload/index',
            },
            // 账号信息
            {
                "name": "userCenter",
                "path": "/usercenter",
                "meta": {
                    "title": "帐号信息",
                    "icon": "el-icon-user",
                },
                "component": "userCenter/index"
            },
            // 消息中心
            {
                path: '/notification',
                name: 'Notification',
                meta: { title: '消息中心', icon: 'el-icon-chat-dot-round' },
                component: 'system/notification/index',
            },
            // 变更历史
            {
                path: '/revision-history',
                name: 'RevisionHistory',
                meta: { title: '变更历史', icon: 'el-icon-document-remove', role: 'r6010' },
                component: 'system/revision-history/index',
            },
            // 回收站
            {
                path: '/recycle-bin',
                name: 'RecycleBin',
                meta: { title: '回收站', icon: 'el-icon-delete', role: 'r6009' },
                component: 'system/recycle-bin/index',
            },

        ]
    },

]


export default routes;
