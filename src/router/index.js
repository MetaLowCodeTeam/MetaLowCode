import { createRouter, createWebHistory } from 'vue-router';
import { ElNotification } from 'element-plus';
import config from "@/config"
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import tool from '@/utils/tool';
import layoutConfigApi from '@/api/layoutConfig';
import useLayoutConfigStore from "@/store/modules/layoutConfig";
import { storeToRefs } from 'pinia';
// console.log(useLayoutConfigStore,'useLayoutConfigStore')
// import pinia from '../store/index';
// import { useLayoutConfigStore } from "@/store/modules/layoutConfig";
// const layoutStore = useLayoutConfigStore(pinia);
// import { layoutConfig } from "../store/modules/layoutConfig"
// const store = layoutConfig(pinia)
import systemRouter from './systemRouter';
import userRoutes from '@/config/route';
import { beforeEach, afterEach } from './scrollBehavior';
import { useStore } from 'vuex';


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

//设置标题
document.title = tool.data.get('APP_NAME')

//判断是否已加载过动态/静态路由
var isGetRouter = false;

router.beforeEach(async (to, from, next) => {
    // const store = useStore();

    // console.log(store,'store')
    NProgress.start()
    //动态标题
    document.title = to.meta.title ? `${to.meta.title} - ${tool.data.get('APP_NAME')}` : `${tool.data.get('APP_NAME')}`

    let token = tool.cookie.get("TOKEN");

    if (to.path === "/login") {
        //删除路由(替换当前layout路由)
        router.addRoute(routes[0])
        //删除路由(404)
        routes_404_r()
        isGetRouter = false;
        next();
        return false;
    }

    if (routes.findIndex(r => r.path === to.path) >= 0) {
        next();
        return false;
    }

    if (!token) {
        next({
            path: '/login'
        });
        return false;
    }

    //整页路由处理
    if (to.meta.fullpage) {
        to.matched = [to.matched[to.matched.length - 1]]
    }
    //加载动态/静态路由
    if (!isGetRouter) {
        const { setNavigationList, setChosenNavigationId, setDefaultMenuList } = useLayoutConfigStore();
        let navRes = await layoutConfigApi.getNavigationList();
        if (navRes && navRes.code == 200) {
            setNavigationList(navRes.data.navigationList);
            setChosenNavigationId(navRes.data.chosenNavigationId);
            setDefaultMenuList();
        }
        const { useMenuList } = storeToRefs(useLayoutConfigStore());
        let apiMenu = [...useMenuList.value];
        let userMenu = treeFilter(routerCheckRole(userRoutes), node => {
            return true
        })
        console.log(userMenu, 'userMenu')
        // let dongtai = localStorage.getItem("formatRoutrs");
        // console.log(apiMenu, '加载动态路由')
        userMenu[0].children.push(...apiMenu)
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
    beforeEach(to, from)
    next();
});

router.afterEach((to, from) => {
    afterEach(to, from)
    NProgress.done()
});

router.onError((error) => {
    NProgress.done();
    ElNotification.error({
        title: '路由错误',
        message: error.message
    });
});

//入侵追加自定义方法、对象
router.sc_getMenu = () => {
    const { useMenuList } = storeToRefs(useLayoutConfigStore());
    let apiMenu = [...useMenuList.value];
    let userMenu = treeFilter(routerCheckRole(userRoutes), node => {
        return true
    })
    userMenu[0].children.push(...apiMenu)
    var menu = [...userMenu]
    return menu
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
