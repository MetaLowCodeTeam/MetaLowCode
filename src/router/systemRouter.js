import config from "@/config"
//系统路由
const routes = [
	{
		name: "layout",
		path: "/",
		component: () => import(/* webpackChunkName: "layout" */ '@/layout/index.vue'),
		redirect: config.DASHBOARD_URL || '/dashboard',
		children: []
	},
	{
		path: "/login",
		component: () => import(/* webpackChunkName: "login" */ '@/views/login/index.vue'),
		meta: {
			title: "登录"
		}
	},
	{
		path: "/user_register",
		component: () => import(/* webpackChunkName: "userRegister" */ '@/views/login/userRegister.vue'),
		meta: {
			title: "注册"
		}
	},
	{
		path: "/reset_password",
		component: () => import(/* webpackChunkName: "resetPassword" */ '@/views/login/resetPassword.vue'),
		meta: {
			title: "重置密码"
		}
	},
    {
		path: "/luckysheet",
		component: () => import(/* webpackChunkName: "luckysheet" */ '@/views/system/report-templates/luckysheet.vue'),
		meta: {
			title: "表单模板设计"
		}
	},

]

export default routes;
