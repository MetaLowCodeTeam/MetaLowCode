import config from "@/config"
//系统路由
const routes = [
    {
        name: "layout",
        path: "/",
        component: () => import(/* webpackChunkName: "layout" */ '@/layout/index.vue'),
        redirect: config.DASHBOARD_URL || '/web/dashboard',
        children: []
    },
    {
        path: "/web/login",
        component: () => import(/* webpackChunkName: "login" */ '@/views/login/index.vue'),
        meta: {
            title: "登录"
        }
    },
    {
        path: "/web/user_register",
        component: () => import(/* webpackChunkName: "userRegister" */ '@/views/login/userRegister.vue'),
        meta: {
            title: "注册"
        }
    },
    {
        path: "/web/reset_password",
        component: () => import(/* webpackChunkName: "resetPassword" */ '@/views/login/resetPassword.vue'),
        meta: {
            title: "重置密码"
        }
    },
    {
        path: "/web/luckysheet",
        component: () => import(/* webpackChunkName: "luckysheet" */ '@/views/system/report-templates/luckysheet.vue'),
        meta: {
            title: "表单模板设计"
        }
    },
    {
        path: "/web/dashboard-design",
        component: () => import(/* webpackChunkName: "luckysheet" */ '@/views/system/dashboard-design/index.vue'),
        meta: {
            title: "图表设计"
        }
    },
    {
        path: "/web/Printer",
        component: () => import(/* webpackChunkName: "luckysheet" */ '@/views/customize-menu/components/Printer.vue'),
        meta: {
            title: "打印"
        }
    },
    // 填写表单
    {
        path: "/web/inReport",
        component: () => import(/* webpackChunkName: "luckysheet" */ '@/views/system/report-templates/in-report.vue'),
        name: "InReport",
        meta: {
            title: "填写表单"
        }
    },
    // 消息中心
    // {
    //     path: '/web/notification',
    //     name: 'Notification',
    //     meta: { title: '消息中心', icon: 'el-icon-chat-dot-round' },
    //     // component: 'system/notification/index',
    //     component: () => import(/* webpackChunkName: "luckysheet" */ '@/views/system/notification/index.vue'),
    // },
    // 账号信息
    // {
    //     "name": "userCenter",
    //     "path": "/web/usercenter",
    //     "meta": {
    //         "title": "帐号信息",
    //         "icon": "el-icon-user",
    //     },
    //     // component: "userCenter/index"
    //     component: () => import(/* webpackChunkName: "luckysheet" */ '@/views/userCenter/index.vue'),
    // },
]

export default routes;
