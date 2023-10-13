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

]

export default routes;
