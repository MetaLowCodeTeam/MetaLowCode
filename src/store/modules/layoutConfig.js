import { defineStore } from 'pinia';
import { ref } from 'vue'
import tool from '@/utils/tool';
import layoutConfigApi from '@/api/layoutConfig.js';
import http from "@/utils/request";
import router from '@/router';
const appPath = import.meta.env.VITE_APP_PATH;
const formatRouteItem = (el, isTopNav) => {
    let newRoute = {};
    if (el.type == 1) {
        newRoute.path = appPath + el.entityName + "/list" + (isTopNav ? '/' + el.guid : '');
        newRoute.component = "customize-menu/list";
        // http://localhost:8022/web/Xinceshi/create-entity?entity=Xinceshi
        // newRoute.path = appPath + el.entityName + "/create-entity?entity=" + el.entityName + (isTopNav ? '/' + el.guid : '');
        // newRoute.component = "customize-menu/NewWindowCreateEntity";
    } else if (el.type == 2) {
        newRoute.path = el.guid;
        // 需要内嵌
        if (el.openType == 1) {
            newRoute.path = appPath + "custom-page/iframe" + '/' + el.guid + (isTopNav ? '/' + 'topNav' : '');
            newRoute.component = "custom-page/iframe";
        }
    } else if (el.type == 5) {
        newRoute.path = appPath + "custom-page/dashboard/" + el.chartId + (isTopNav ? '/' + el.guid : '');
        newRoute.component = "custom-page/dashboard";
    } else if (el.type == 6) {
        newRoute.path = appPath + "custom-page/vForm/" + (isTopNav ? 'top/' : '') + el.guid;
        newRoute.component = "custom-page/ListVFormCmp/index";
    } else {
        if(el.customPageType == 2){
            newRoute.path = appPath + (el.outLink.indexOf('?') == -1 ? el.outLink : el.outLink.split('?')[0]);
        }else {
           // 自定义页面目录
           newRoute.path = appPath + "custom-page/";
           // 自定义路由拼接
           newRoute.path += getCustomPageComponent(el.outLink);
           // 如果是自定义列表需要拼接参数
           newRoute.path += el.useCustom ? setPathQuery(el.outLink) : "";
           // 如果是顶部导航需要拼接guid作为唯一值
           newRoute.path += isTopNav ? '/' + el.guid : '';
           newRoute.component = "custom-page/" + getCustomPageComponent(el.outLink);
        }

    }
    newRoute.name = el.guid + (isTopNav ? new Date().getTime() : '')
    return newRoute
}

const setPathQuery = (outLink) => {
    if (outLink.indexOf('?') == -1) {
        return ""
    } else {
        let query = "";
        let queryGroup = outLink.split('?')[1].split("&")
        queryGroup.forEach(el => {
            let param = el.split("=");
            query += "/" + param[1];
        })
        return query;
    }
}

// 获取自定义页签组件
const getCustomPageComponent = (outLink) => {
    // 如果没有?表示没有参数
    if (outLink.indexOf('?') == -1) {
        return outLink
    } else {
        return outLink.split('?')[0]
    }
}
// 获取自定页签组件query参数
const getCustomPageQuery = (outLink) => {
    // 如果没有?表示没有参数
    if (outLink.indexOf('?') == -1) {
        return null
    } else {
        let query = {};
        let queryGroup = outLink.split('?')[1].split("&")
        queryGroup.forEach(el => {
            let param = el.split("=");
            query[param[0]] = param[1];
        })
        return query;
    }
}


const useLayoutConfigStore = defineStore('layoutConfig', () => {
    // 导航列表
    let navigationList = ref([]);
    // 默认导航ID
    let chosenNavigationId = ref("");
    // 使用的菜单
    let useMenuList = ref([]);

    // 收藏菜单
    let collectMenuList = ref([]);

    // 是否隐藏工作台
    let isHideWorkbench = ref(false);

    // 获取LayoutApi
    const getNavigationApi = async (errorCb) => {
        let navRes = await layoutConfigApi.getNavigationList();
        if (navRes && navRes.code == 403) {
            errorCb()
            return;
        }
        if (navRes && navRes.data) {
            await getRightMap();
            setNavigationList(navRes.data.navigationList);
            setChosenNavigationId(navRes.data.chosenNavigationId);
            setTopNavigation(navRes.data.topNavigation || {})
            setDefaultMenuList();
            setCollectMenuList(navRes.data.favorites || [])
        }
    }

    const getRightMap = async () => {
        let getRightMapRes = await http.get("/user/getRightMap");
        if (getRightMapRes) {
            tool.data.set("rightMap", getRightMapRes.data || {});
        }
    };

    // 设置导航列表
    const setNavigationList = (list) => {
        navigationList.value = list;
    }
    // 获取全部导航
    const getAllNav = () => {
        return [...navigationList.value];
    }
    // 设置默认ID
    const setChosenNavigationId = (id) => {
        chosenNavigationId.value = id;
    }
    // 设置默认菜单
    const setDefaultMenuList = () => {
        let findMenuList = [];
        // 如果ID存在
        if (chosenNavigationId.value && navigationList.value.length > 0) {
            findMenuList = navigationList.value.filter(el => el.layoutConfigId == chosenNavigationId.value);
        }
        // 如果找到了，就等于找到的那一个
        if (findMenuList.length > 0) {
            useMenuList.value = formatRouters(findMenuList[0].config);
        } else {
            // 如果没找到，判断导航列表有无数据
            if (navigationList.value.length > 0) {
                useMenuList.value = formatRouters(navigationList.value[0].config);
                chosenNavigationId.value = navigationList.value[0].layoutConfigId
            } else {
                useMenuList.value = [];
            }
        }
    }
    // 格式化导航 - 支持8级菜单的递归处理
    const formatRouters = (config, isTopNav) => {
        let tempConfig = config;
        if (!tempConfig) {
            tempConfig = JSON.stringify([]);
        }
        if (tempConfig && tempConfig == "{}") {
            tempConfig = JSON.stringify([]);
        }
        let list = JSON.parse(tempConfig);
        return processMenuItems(list, isTopNav);
    }

    // 递归处理菜单项
    const processMenuItems = (items, isTopNav) => {
        let routers = [];

        items.forEach((el) => {
            let initMenu = {
                meta: {},
            };

            // 处理自定义列表模板
            if(el.type == 1 && el.useCustom){
                el.type = 3;
                el.outLink = el.useComponent + "?entity=" + el.entityName;
                if(el.modelName){
                    el.outLink += "&modelName=" + el.modelName;
                }
            }

            // 设置基本菜单属性
            initMenu.meta.title = el.name;
            initMenu.meta.entityCode = el.entityCode;
            initMenu.meta.entityName = el.entityName;
            initMenu.meta.isOpeneds = el.isOpeneds;
            initMenu.meta.icon = el.useIcon || 'Notebook';
            initMenu.meta.iconColor = el.iconColor || "";
            initMenu.meta.redirectCarrySessionId = el.redirectCarrySessionId;
            initMenu.meta.outLink = el.outLink;
            initMenu.meta.pcShow = el.pcShow;

            // 如果是审批中心页面直接跳过权限判断
            let approvalCenter = [
                "approvalHandle",
                "approvalSubmit",
                "capprovalCc",
                "approvalApproved"
            ];
            if (approvalCenter.includes(el.entityCode)) {
                initMenu.meta.hidden = false;
            } else {
                let notAuth = checkAuth(el);
                initMenu.meta.hidden = notAuth;
                initMenu.meta.notAuth = notAuth;
            }

            // 如果有子菜单，递归处理
            if (el.children && el.children.length > 0) {
                initMenu.children = processMenuItems(el.children, isTopNav);
                initMenu.path = "/" + el.guid;

                // 父菜单权限处理：如果所有子菜单都被隐藏，则隐藏父菜单
                if(initMenu.children.length > 0) {
                    initMenu.meta.hidden = initMenu.children.every((item) => item.meta.hidden);
                } else {
                    initMenu.meta.hidden = true;
                }
            } else {
                // 叶子节点：生成实际的路由
                initMenu.meta.type = el.type == 2 && el.openType != 1 ? "link" : "";
                let { path, component, name } = formatRouteItem(el, isTopNav);
                initMenu.path = path;
                initMenu.component = component;
                initMenu.name = name;

                // 设置特殊类型的菜单属性
                if (el.type == 3) {
                    initMenu.meta.type = 3;
                    initMenu.meta.query = getCustomPageQuery(el.outLink) || {};
                    if(el.customPageType == 2){
                        initMenu.meta.query.routerName = el.name;
                    }
                }
                if (el.type == 5) {
                    initMenu.meta.type = 3;
                    initMenu.meta.query = {
                        default: el.chartId
                    };
                }
                if (el.type == 6) {
                    initMenu.meta.type = 6;
                    initMenu.meta.query = {
                        formId: el.formId,
                        formEntityCode: el.formEntityCode,
                    };
                }
            }

            // 处理默认展开
            if(el.isOpeneds){
                topDefaultUnfold.value.push(initMenu.path);
            }

            routers.push(initMenu);
        });

        return routers;
    }
    // 获取左侧菜单
    const getUseMenuList = () => {
        return [...useMenuList.value]
    }
    // 检测是否有权限
    const checkAuth = (item) => {
        let isHidden = false;

        // 自定义权限
        let hasCustomCode = item.customCode && !tool.checkRole(item.customCode.trim());
        // 取反权限 并且 不是管理员 才生效
        if(item.reversalCustomCode && !tool.checkRole('r6000')){
            hasCustomCode = !hasCustomCode;
        }


        // 1 如果有实体CODE
        // 2 并且没有权限 或者 没有自定义权限
        // 3 并且不是父菜单
        // 4 并且类型为1 关联项
        let checkCode = item.detailEntityFlag ? item.mainEntityCode : item.entityCode;
        if(item.entityCode && (!tool.checkRole('r' + checkCode + '-1') || hasCustomCode) && item.entityCode != "parentMenu" && item.type == 1){
            isHidden = true;
        }
        // 如果是仪表盘
        if(item.type == 5 && !tool.checkRole('r52-1')){
            isHidden = true;
        }

        // 1 如果有自定义权限
        // 2 并且不是父菜单
        // 3 并且类型是2、3、5、6  外部地址、自定义页面、仪表盘、自定义表单
        if(hasCustomCode && item.entityCode != "parentMenu" && (item.type == 2 || item.type == 3 || item.type == 5 || item.type == 6)){
            isHidden = true;
        }
        // 1 如果是自定义列表
        if(item.useCustom && item.entityCode && !tool.checkRole('r' + checkCode + '-1') && item.entityCode != "parentMenu" && item.type == 3){
            isHidden = true;
        }
        // if(item.pcShow != undefined && !item.pcShow) {
        //     isHidden = true;
        // }
        return isHidden;
    }
    /**
     * 顶部导航相关
     */
    // 顶部导航数据
    let topNavigation = ref({});
    let topNavMenuList = ref([]);
    // 顶部导航默认选中数据
    let topDefaultUnfold = ref([]);
    // 设置顶部导航数据
    const setTopNavigation = (data) => {
        // let
        let formatConfig = data.config ? JSON.parse(data.config) : {};
        isHideWorkbench.value = formatConfig.isHideWorkbench;
        let navList = formatConfig.navList ? JSON.parse(JSON.stringify(formatConfig.navList)) : [];
        topNavigation.value = { ...data };
        // 如果没有顶部导航配置权限
        if(!tool.checkRole('r6007')){
            // 取所有导航ID
            let getAllNavId = navigationList.value.map(el => el.layoutConfigId);
            let newList = [];
            // 遍历顶部导航，把自定义导航和存在于所有导航里的导航给取出来
            navList.forEach(el => {
                if(el.type != 1 || getAllNavId.includes(el.layoutConfigId)){
                    newList.push(el)
                }
            })
            navList = JSON.parse(JSON.stringify(newList));
        }
        topNavigation.value.navList = JSON.parse(JSON.stringify(navList))
        topNavMenuList.value = navList;
        topNavMenuList.value.forEach(el => {
            el.path = el.type == 1 ? "/" + el.guid : el.outLink;
            el.name = el.configName
            el.meta = {
                title: el.configName,
                icon: el.useIcon || 'set-up',
                iconColor: el.iconColor || '',
                type: el.type,
                outLink: el.outLink,
                pcShow: el.pcShow,
            };
            if (el.type == 1) {
                let findNav = navigationList.value.filter(subEl => subEl.layoutConfigId == el.layoutConfigId)
                if (findNav.length > 0) {
                    el.children = formatRouters(findNav[0].config, true)
                }
            }
            if (el.type == 2 && el.openType == 1) {
                el.path = appPath + "custom-page/iframe/" + el.guid;
                el.component = "custom-page/iframe";
                el.type = 1;
            }
        })
    }
    // 获取顶部导航数据
    let getTopNavigation = () => {
        return { ...topNavigation.value }
    }
    const getTopNavMenuList = () => {
        return [...topNavMenuList.value]
    }
    // 设置收藏菜单
    const setCollectMenuList = (list = []) => {
        collectMenuList.value = [];
        list.forEach(el => {
            if(el.config) {
                let item = JSON.parse(el.config);
                item.recordId = el.layoutConfigId;
                collectMenuList.value.push(item)
            }
        })
    }
    // 检测是否收藏菜单
    const checkCollectMenu = (menu) => {
        const foundMenu = collectMenuList.value.find(el => el.navigationId == menu.navigationId && el.title == menu.title && el.fullPath == menu.fullPath);
        return foundMenu ? foundMenu.recordId : null;
    }
    return {
        getNavigationApi,
        navigationList,
        chosenNavigationId,
        setNavigationList,
        getAllNav,
        setChosenNavigationId,
        setDefaultMenuList,
        useMenuList,
        getUseMenuList,
        setTopNavigation,
        getTopNavigation,
        getTopNavMenuList,
        topDefaultUnfold,
        isHideWorkbench,
        // 收藏菜单
        collectMenuList,
        // 设置收藏菜单
        setCollectMenuList,
        // 检测是否收藏
        checkCollectMenu,
    }
})



export default useLayoutConfigStore
