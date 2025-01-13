import config from "@/config"
const appPath = import.meta.env.VITE_APP_PATH;
import { t } from "@/locales";
//系统路由
const routes = [
    {
        name: "layout",
        path: "/",
        component: () => import(/* webpackChunkName: "layout" */ '@/layout/index.vue'),
        redirect: config.DASHBOARD_URL || appPath + "dashboard",
        children: []
    },
    {
        path: appPath + "login",
        component: () => import(/* webpackChunkName: "login" */ '@/views/login/index.vue'),
        meta: {
            title: "登录"
        }
    },
    {
        path: appPath + "user_register",
        component: () => import(/* webpackChunkName: "userRegister" */ '@/views/login/userRegister.vue'),
        meta: {
            title: "注册"
        }
    },
    {
        path: appPath + "reset_password",
        component: () => import(/* webpackChunkName: "resetPassword" */ '@/views/login/resetPassword.vue'),
        meta: {
            title: "重置密码"
        }
    },
    {
        path: appPath + "luckysheet",
        component: () => import(/* webpackChunkName: "luckysheet" */ '@/views/system/report-templates/luckysheet.vue'),
        meta: {
            title: "表单模板设计"
        }
    },
    {
        path: appPath + "dashboard-design",
        component: () => import(/* webpackChunkName: "luckysheet" */ '@/views/system/dashboard-design/index.vue'),
        meta: {
            title: "图表设计"
        }
    },
    {
        path: appPath + "Printer",
        component: () => import(/* webpackChunkName: "luckysheet" */ '@/views/customize-menu/components/Printer.vue'),
        meta: {
            title: "打印"
        }
    },
    // 填写表单
    {
        path: appPath + "inReport",
        component: () => import(/* webpackChunkName: "luckysheet" */ '@/views/system/report-templates/in-report.vue'),
        name: "InReport",
        meta: {
            title: "填写表单"
        }
    },
    // 设计应用
    {
        path: appPath + "designApp",
        component: () => import(/* webpackChunkName: "luckysheet" */ '@/views/system/app-manager/DesignApp.vue'),
        name: "DesignApp",
        redirect: { name: "DesignEntity" },
        meta: {
            title: t("route.30500"),
            icon: 'el-icon-Platform',
        },
        children: [
            {
                path: "designEntity",
                component: () => import(/* webpackChunkName: "luckysheet" */ '@/views/system/app-manager/components/DesignRouterView.vue'),
                name: "DesignEntity",
                meta: {
                    title: t("appManager.1400"),
                    affix: true
                }
            },
            {
                path: "designSingleOption",
                component: () => import(/* webpackChunkName: "luckysheet" */ '@/views/system/app-manager/components/DesignRouterView.vue'),
                name: "DesignSingleOption",
                meta: {
                    title: t("appManager.1401")
                }
            },
            {
                path: "designMultipleOption",
                component: () => import(/* webpackChunkName: "luckysheet" */ '@/views/system/app-manager/components/DesignRouterView.vue'),
                name: "DesignMultipleOption",
                meta: {
                    title: t("appManager.1402")
                }
            },
            // 审批流程
            {
                path: "designApprovalProcess",
                component: () => import(/* webpackChunkName: "luckysheet" */ '@/views/system/app-manager/components/DesignRouterView.vue'),
                name: "DesignApprovalProcess",
                meta: {
                    title: t("appManager.1403")
                }
            },
            // 审批流程详情
            {
                path: appPath + "design-process-detail",
                name: 'DesignProcessDetail',
                component: () => import(/* webpackChunkName: "luckysheet" */ '@/views/system/app-manager/components/DesignRouterView.vue'),
                hidden: true,
                meta: { title: t('route.20403'), hidden: true }
            },
            // 触发器
            {
                path: "designTrigger",
                component: () => import(/* webpackChunkName: "luckysheet" */ '@/views/system/app-manager/components/DesignRouterView.vue'),
                name: "DesignTrigger",
                meta: {
                    title: t("appManager.1404")
                }
            },
            // 触发器详情
            {
                path: appPath + "design-trigger-detail",
                component: () => import(/* webpackChunkName: "luckysheet" */ '@/views/system/app-manager/components/DesignRouterView.vue'),
                name: "DesignTriggerDetail",
                hidden: true,
                meta: {
                    title: t("route.20503"),
                    hidden: true
                }
            },
            {
                path: "designDashboard",
                component: () => import(/* webpackChunkName: "luckysheet" */ '@/views/system/app-manager/components/DesignRouterView.vue'),
                name: "DesignDashboard",
                meta: {
                    title: t("appManager.1405")
                }
            },
            {
                path: "designReportDesign",
                component: () => import(/* webpackChunkName: "luckysheet" */ '@/views/system/app-manager/components/DesignRouterView.vue'),
                name: "DesignReportDesign",
                meta: {
                    title: t("appManager.1406")
                }
            },
            {
                path: "designExternalForm",
                component: () => import(/* webpackChunkName: "luckysheet" */ '@/views/system/app-manager/components/DesignRouterView.vue'),
                name: "DesignExternalForm",
                meta: {
                    title: t("appManager.1407")
                }
            },
            {
                path: "designMenuNavigation",
                component: () => import(/* webpackChunkName: "luckysheet" */ '@/views/system/app-manager/components/DesignRouterView.vue'),
                name: "DesignMenuNavigation",
                meta: {
                    title: t("appManager.1408")
                }
            },
            // 设计实体
            {
                path:"appDesignEntity",
                component: () => import(/* webpackChunkName: "luckysheet" */ '@/views/system/app-manager/components/DesignRouterView.vue'),
                name: "AppDesignEntity",
                meta: {
                    title: t("appManager.1011")
                }
            },
        ]
    },
    
    // 消息中心
    // {
    //     path: appPath + "notification",
    //     name: 'Notification',
    //     meta: { title: '消息中心', icon: 'el-icon-chat-dot-round' },
    //     // component: 'system/notification/index',
    //     component: () => import(/* webpackChunkName: "luckysheet" */ '@/views/system/notification/index.vue'),
    // },
    // 账号信息
    // {
    //     "name": "userCenter",
    //     "path": appPath + "usercenter",
    //     "meta": {
    //         "title": "帐号信息",
    //         "icon": "el-icon-user",
    //     },
    //     // component: "userCenter/index"
    //     component: () => import(/* webpackChunkName: "luckysheet" */ '@/views/userCenter/index.vue'),
    // },
]

export default routes;
