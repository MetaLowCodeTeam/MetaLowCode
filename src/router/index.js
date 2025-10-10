import { createRouter, createWebHistory } from 'vue-router';
import { ElNotification } from 'element-plus';
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import tool from '@/utils/tool';
import useCommonStore from "@/store/modules/common";
import { storeToRefs } from "pinia";
import systemRouter from './systemRouter';
import userRoutes from '@/config/route';
import { beforeEach, afterEach } from './scrollBehavior';
import config from "@/config"
import useLayoutConfigStore from "@/store/modules/layoutConfig";
import loginManager from "@/utils/loginManager";


// 如果是外部数据源隐藏
const OuterDataSourceHideMenu = ['OuterDataSource', 'OuterDataModel'];

let modules = import.meta.glob('../views/**/*.vue')
const empty = () => () => import('../layout/other/empty.vue');
//系统路由
const routes = systemRouter;
const router = createRouter({
    history: createWebHistory(),
    routes: routes
})


//系统特殊路由
const routes_404 = {
    path: "/:pathMatch(.*)*",
    hidden: true,
    component: () => import(/* webpackChunkName: "404" */ '@/layout/other/404.vue'),
}
let routes_404_r = () => { }

const appPath = import.meta.env.VITE_APP_PATH;
//判断是否已加载过动态/静态路由
var isGetRouter = false;

router.beforeEach(async (to, from, next) => {
    // const store = useStore();
    const { publicSetting } = storeToRefs(useCommonStore());
    const { queryEntityLabelByName } = useCommonStore();
    NProgress.start()
    // 如果路由没有权限，则跳转到404页面
    if(to.meta.notAuth) {
        next({
            path: appPath + "404"
        });
        return false;
    }
    //动态标题
    document.title = to.meta.title ? `${to.meta.title} - ${publicSetting.value.APP_NAME || ''}` : `${publicSetting.value.APP_NAME || ''}`
    if (to.path === appPath + "login") {
        //删除路由(替换当前layout路由)
        router.addRoute(routes[0])
        //删除路由(404)
        routes_404_r()
        isGetRouter = false;
        next();
        return false;
    }
    if (to.path == '/') {
        next({
            path: appPath + config.DASHBOARD_URL
        });
        return false;
    }
    if (routes.findIndex(r => r.path === to.path) >= 0) {
        next();
        return false;
    }
    let routerEntityname = to.params?.entityname;
    if (routerEntityname && !to.meta.title) {
        to.meta.title = queryEntityLabelByName(routerEntityname)
    }
    if (to.name == "inIframe") {
        to.meta.title = to.query.routerName
    }
    if(!to.meta.title && to.query.routerName) {
        to.meta.title = to.query.routerName
    }
    if(to.query.customRouteTitle) {
        to.meta.title = to.query.customRouteTitle
    }
    //整页路由处理
    if (to.meta.fullpage) {
        to.matched = [to.matched[to.matched.length - 1]]
    }
    // let userID = tool.data.get("USER_INFO")?.userId;
    //加载动态/静态路由
    if (!isGetRouter) {
        // 等待登录处理完成
        await loginManager.waitForLogin();
        
        const { getUseMenuList, getNavigationApi, getTopNavMenuList } = useLayoutConfigStore();
        let isReturn = false;
        await getNavigationApi(() => {
            isGetRouter = false;
            isReturn = true;
            // next({
            //     path: appPath + "login"
            // });
        })
        if(isReturn) {
            next(false);
            return;
        }
        let userMenu = filterUserMenu(userRoutes, publicSetting);
        userMenu[0].children.push(...getUseMenuList())
        userMenu.splice(1, 0, ...getTopNavMenuList())
        let menu = [...userMenu]
        var menuRouter = filterAsyncRouter(menu)
        menuRouter = flatAsyncRoutes(menuRouter)
        menuRouter.forEach(item => {
            router.addRoute("layout", item)
        })
        routes_404_r = router.addRoute(routes_404)
        if (to.matched.length == 0) {
            router.push(to.fullPath);
        }
        isGetRouter = true;
    }
    
    // 如果是新窗口创建实体
    if(to.name == "NewWindowCreateEntity") {
        to.meta.title = "新建" + queryEntityLabelByName(to.query.entity)
    }
    if(to.query.meteAppendTitle && to.name != "AppDesignEntity") {
        to.meta.title = to.meta.title + " - " + to.query.meteAppendTitle
    }
    if(to.name == "AppDesignEntity") {
        to.meta.title =  to.meta.title + " - " + to.query.entityLabel
    }
    // 如果是跨导航的 强行跳转 
    let forcefullyJump = localStorage.getItem('forcefullyJump');
    if(forcefullyJump) {
        next({
            path: forcefullyJump
        });
        localStorage.removeItem('forcefullyJump');
        return
    }
    next();
});

router.afterEach((to, from) => {
    afterEach(to, from)
    NProgress.done()
});

router.onError((error, to) => {
    NProgress.done();
    const errors = ['Failed to fetch dynamically imported module', 'Unable to preload css'];
    if (errors.some(e => error.message.includes(e))) {
        window.location = to.fullPath;
    } else {
        ElNotification.error({
            title: '路由错误，请尝试刷新页面',
            message: error.message
        });
    }
});

//入侵追加自定义方法、对象
router.sc_getMenu = () => {
    const { getUseMenuList, getTopNavMenuList } = useLayoutConfigStore();
    const { publicSetting } = storeToRefs(useCommonStore());
    let userMenu = filterUserMenu(userRoutes, publicSetting);
    userMenu[0].children.push(...getUseMenuList())
    userMenu.splice(1, 0, ...getTopNavMenuList())
    // userMenu.push(...apiMenu)
    var menu = [...userMenu]
    return menu
}


// 格式化菜单显示
function filterUserMenu(userRoutes, publicSetting) {
    let { tenantInfo, pluginIdList, openJobPosition } = publicSetting.value;
    return treeFilter(routerCheckRole(userRoutes), node => {
        // 如果是数据备份，且有租户ID，不显示该菜单
        if(node.name == "DatabaseBackups" && (tenantInfo && tenantInfo.tenantId)) {
            return false
        }
        // 如果是多租户，有租户ID 或者 没有租户插件，不显示该菜单
        if(node.name == "Tenant" && (tenantInfo && tenantInfo.tenantId || !pluginIdList || !pluginIdList.includes('metaTenant'))) {
            return false
        }
        // 如果是岗位管理，并且没有开启岗位管理，不显示该菜单
        if(node.name == "JobPositionList" && !openJobPosition) {
            return false
        }
        // 如果是外部数据源，并且没有外部数据源插件，不显示该菜单
        if(OuterDataSourceHideMenu.includes(node.name) && (!pluginIdList || !pluginIdList.includes('metaDataWarehouse'))) {
            return false
        }
        // 如果是数据大屏，并且没有数据大屏插件，不显示该菜单
        if(node.name == "DataScreenManagement" && (!pluginIdList || !pluginIdList.includes('metaView'))) {
            return false
        }
        return true
    })
}




//转换
function filterAsyncRouter(routerMap) {
    const accessedRouters = []
    routerMap.forEach(item => {
        item.meta = item.meta ? item.meta : {};
        //处理外部链接特殊路由
        if (item.meta.type == 'iframe') {
            item.meta.url = item.path;
            item.path = `/i/${item.name}`;
        }
        //MAP转路由对象
        var route = {
            path: item.path,
            name: item.name,
            meta: item.meta,
            redirect: item.redirect,
            props: item.props,
            children: item.children ? filterAsyncRouter(item.children) : null,
            hidden: item.hidden,
            component: loadComponent(item.component)
        }
        accessedRouters.push(route)
    })
    return accessedRouters
}
function loadComponent(component) {
    if (component) {
        return modules[`../views/${component}.vue`]
    } else {
        return empty()
    }

}

//路由扁平化
function flatAsyncRoutes(routes, breadcrumb = []) {
    let res = []
    routes.forEach(route => {
        const tmp = { ...route }
        if (tmp.children) {
            let childrenBreadcrumb = [...breadcrumb]
            childrenBreadcrumb.push(route)
            let tmpRoute = { ...route }
            tmpRoute.meta.breadcrumb = childrenBreadcrumb
            delete tmpRoute.children
            res.push(tmpRoute)
            let childrenRoutes = flatAsyncRoutes(tmp.children, childrenBreadcrumb)
            childrenRoutes.map(item => {
                res.push(item)
            })
        } else {
            let tmpBreadcrumb = [...breadcrumb]
            tmpBreadcrumb.push(tmp)
            tmp.meta.breadcrumb = tmpBreadcrumb
            res.push(tmp)
        }
    })
    return res
}

//过滤树
function treeFilter(tree, func) {
    return tree.map(node => ({ ...node })).filter(node => {
        node.children = node.children && treeFilter(node.children, func)
        return func(node) || (node.children && node.children.length)
    })
}


const routerCheckRole = (routeList) => {
    let res = [];
    routeList.forEach(el => {
        const tmp = { ...el }
        if (tmp.meta.role) {
            if (tool.checkRole(tmp.meta.role)) {
                if (tmp.children) {
                    tmp.children = routerCheckRole(tmp.children)
                }
                res.push(tmp)

            }
        } else {
            if (tmp.children) {
                tmp.children = routerCheckRole(tmp.children)
            }
            if (!tmp.children || tmp.children.length > 0) {
                res.push(tmp)
            }
        }

    })
    return res
}


export default router
