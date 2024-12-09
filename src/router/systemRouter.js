import config from "@/config"
const appPath = import.meta.env.VITE_APP_PATH;
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
