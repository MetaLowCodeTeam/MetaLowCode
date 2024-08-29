import { defineStore } from 'pinia';
import { ref } from 'vue'
import tool from '@/utils/tool';
import layoutConfigApi from '@/api/layoutConfig.js';
import http from "@/utils/request";
const floamtRoute = (el, isTopNav) => {
    let newRoute = {};
    if (el.type == 1) {
        newRoute.path = "/web/" + el.entityName + "/list" + (isTopNav ? '/' + el.guid : '');
        newRoute.component = "customize-menu/list";
    } else if (el.type == 2) {
        newRoute.path = el.guid;
        // 需要内嵌
        if (el.openType == 1) {
            newRoute.path = "/web/custom-page/iframe" + '/' + el.guid + (isTopNav ? '/' + 'topNav' : '');
            newRoute.component = "custom-page/iframe";
        }
    } else if (el.type == 5) {
        newRoute.path = "/web/custom-page/dashboard/" + el.chartId + (isTopNav ? '/' + el.guid : '');
        newRoute.component = "custom-page/dashboard";
    } else if (el.type == 6) {
        newRoute.path = "/web/custom-page/vFrom" + (isTopNav ? '/' + el.guid : '');
        newRoute.component = "custom-page/ListVFromCmp/index";
    } else {
        // 自定义页面目录
        newRoute.path = "/web/custom-page/";
        // 自定义路由拼接
        newRoute.path += getCustomPageComponent(el.outLink);
        // 如果是自定义列表需要拼接参数
        newRoute.path += el.useCustom ? setPathQuery(el.outLink) : "";
        // 如果是顶部导航需要拼接guid作为唯一值
        newRoute.path += isTopNav ? '/' + el.guid : '';
        newRoute.component = "custom-page/" + getCustomPageComponent(el.outLink);
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
    // 格式化导航
    const formatRouters = (config, isTopNav) => {
        let tempConfig = config;
        if (!tempConfig) {
            tempConfig = JSON.stringify([]);
        }
        if (tempConfig && tempConfig == "{}") {
            tempConfig = JSON.stringify([]);
        }
        let list = JSON.parse(tempConfig);
        let testRoutes = [...list]
        let routers = [];
        testRoutes.forEach((el) => {
            let initMenu = {
                meta: {},
            };
            // 如果是实体列表 且 使用了自定义列表模板
            if(el.type == 1 && el.useCustom){
                el.type = 3;
                el.outLink = el.useComponent + "?entity=" + el.entityName;
            }
            initMenu.meta.title = el.name;
            initMenu.meta.entityCode = el.entityCode;
            initMenu.meta.entityName = el.entityName;
            initMenu.meta.isOpeneds = el.isOpeneds;
            initMenu.meta.icon = el.useIcon || 'set-up';
            initMenu.meta.iconColor = el.iconColor || "";
            // let checkCode = el.detailEntityFlag ? el.mainEntityCode : el.entityCode;
            // initMenu.meta.hidden = el.entityCode && !tool.checkRole('r' +checkCode + '-1') && el.entityCode != "parentMenu" && el.type == 1;
            initMenu.meta.hidden = checkAuth(el);
            initMenu.meta.outLink = el.outLink;
            if (el.children && el.children.length > 0) {
                initMenu.children = [];
                initMenu.path = "/" + el.guid;

                el.children.forEach((subEl) => {
                    let subRoute = {
                        meta: {
                            title: subEl.name,
                            type: subEl.type == 2 && subEl.openType != 1 ? "link" : "",
                            entityCode: subEl.entityCode,
                            entityName: subEl.entityName,
                            icon: subEl.useIcon || 'set-up',
                            iconColor: subEl.iconColor || '',
                            outLink: subEl.outLink,
                        },
                    }
                    // 如果是实体列表 且 使用了自定义列表模板
                    if(subEl.type == 1 && subEl.useCustom){
                        subEl.type = 3;
                        subEl.outLink = subEl.useComponent + "?entity=" + subEl.entityName
                    }
                    let { path, component, name } = floamtRoute(subEl, isTopNav);
                    subRoute.path = path;
                    subRoute.component = component;
                    subRoute.name = name;
                    if (subEl.type == 5) {
                        subRoute.meta.type = 3;
                        subRoute.meta.query = {
                            default: subEl.chartId
                        }
                    }
                    if (subEl.type == 6) {
                        subRoute.meta.type = 6;
                        subRoute.meta.query = {
                            formId: subEl.formId,
                            formEntityCode: subEl.formEntityCode,
                        }
                    }
                    if (subEl.type == 3) {
                        subRoute.meta.type = 3
                        subRoute.meta.query = getCustomPageQuery(subEl.outLink);
                    }
                    // 如果是审批中心页面直接跳过权限判断
                    let approvalCenter = [
                        "approvalHandle",
                        "approvalSubmit",
                        "capprovalCc"
                    ];
                    if (approvalCenter.includes(subEl.entityCode)) {
                        initMenu.children.push(subRoute);
                        return
                    }
                    // let checkSubCode = subEl.detailEntityFlag ? subEl.mainEntityCode : subEl.entityCode;
                    // 有权限才push
                    if (!checkAuth(subEl)) {
                        initMenu.children.push(subRoute);
                    }
                });
            } else {
                initMenu.meta.type = el.type == 2 && el.openType != 1 ? "link" : "";
                let { path, component, name } = floamtRoute(el, isTopNav);
                initMenu.path = path;
                initMenu.component = component;
                initMenu.name = name;
            }
            // 格式化父菜单  修复父菜单下有子级，但是子级没权限父菜单还可点击
            if (initMenu.children && initMenu.children.length < 1) {
                initMenu.meta.hidden = true;
            }
            if (el.type == 3) {
                initMenu.meta.type = 3
                initMenu.meta.query = getCustomPageQuery(el.outLink);
            }
            if (el.type == 5) {
                initMenu.meta.type = 3;
                initMenu.meta.query = {
                    default: el.chartId
                }
            }
            if (el.type == 6) {
                initMenu.meta.type = 6;
                initMenu.meta.query = {
                    formId: el.formId,
                    formEntityCode: el.formEntityCode,
                }
            }
            if(el.isOpeneds){
                topDefaultUnfold.value.push(initMenu.path);
            }
            routers.push(initMenu);
        });
        return routers
    }
    // 获取左侧菜单
    const getUseMenuList = () => {
        return [...useMenuList.value]
    }
     // 检测是否有权限
     const checkAuth = (item) => {
        let isHidden = false;
        // console.log(tool.checkRole('r1023-3'),'检测是否有权限')
        // 1 如果有实体CODE
        // 2 并且没有权限
        // 3 并且不是父菜单
        // 4 并且类型为1 关联项 4 内置实体
        let checkCode = item.detailEntityFlag ? item.mainEntityCode : item.entityCode;
        if(item.entityCode && !tool.checkRole('r' + checkCode + '-1') && item.entityCode != "parentMenu" && item.type == 1){
            isHidden = true;
        }
        // 1 如果有自定义CODE
        // 2 并且没有权限
        // 3 并且不是父菜单
        // 4 并且类型是2、3、5  外部地址、自定义页面、仪表盘
        if(item.customCode && !tool.checkRole(item.customCode.trim()) && item.entityCode != "parentMenu" && (item.type == 2 || item.type == 3 || item.type == 5)){
            isHidden = true;
        }
        // 1 如果是自定义列表 
        if(item.useCustom && item.entityCode && !tool.checkRole('r' + checkCode + '-1') && item.entityCode != "parentMenu" && item.type == 3){
            isHidden = true;
        }
        if(item.pcShow != undefined && !item.pcShow) {
            isHidden = true;
        }
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
            };
            if (el.type == 1) {
                let findNav = navigationList.value.filter(subEl => subEl.layoutConfigId == el.layoutConfigId)
                if (findNav.length > 0) {
                    el.children = formatRouters(findNav[0].config, true)
                }
            }
            if (el.type == 2 && el.openType == 1) {
                el.path = "/web/custom-page/iframe/" + el.guid;
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
    }
})



export default useLayoutConfigStore