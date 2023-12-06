import { defineStore } from 'pinia';
import { inject, ref } from 'vue'
import tool from '@/utils/tool';
// import useLayoutConfigStore from "@/store/modules/layoutConfig";
// const { setNavigationList } = useLayoutConfigStore();
// import { storeToRefs } from 'pinia';
// const { navigationList } = storeToRefs(useLayoutConfigStore());
const useLayoutConfigStore = defineStore('layoutConfig', () => {

    // 导航列表
    let navigationList = ref([]);
    // 默认导航ID
    let chosenNavigationId = ref("");
    // 使用的菜单
    let useMenuList = ref([]);
    // 设置导航列表
    const setNavigationList = (list) => {
        navigationList.value = list;
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
    const formatRouters = (config) => {
        let tempConfig = config;
        if (!tempConfig) {
            tempConfig = JSON.stringify([]);
        }
        if (tempConfig && tempConfig == "{}") {
            tempConfig = JSON.stringify([]);
        }
        let list = JSON.parse(tempConfig);
        let testRoutes = [...list]
        let formatRoutrs = [];
        testRoutes.forEach((el) => {
            let initMenu = {
                meta: {},
            };
            initMenu.name = el.guid;
            initMenu.meta.title = el.name;
            initMenu.meta.entityCode = el.entityCode;
            initMenu.meta.entityName = el.entityName;
            initMenu.meta.isOpeneds = el.isOpeneds;
            initMenu.meta.icon = el.useIcon || 'set-up';
            initMenu.meta.hidden = el.entityCode && !tool.checkRole('r' + el.entityCode + '-1');
            if (el.children && el.children.length > 0) {
                initMenu.children = [];
                initMenu.path = "";

                el.children.forEach((subEl) => {
                    initMenu.children.push({
                        name: subEl.guid,
                        meta: {
                            title: subEl.name,
                            type: subEl.type == 2 ? "link" : "",
                            entityCode: subEl.entityCode,
                            entityName: subEl.entityName,
                            icon: subEl.useIcon || 'set-up',
                            hidden: subEl.entityCode && !tool.checkRole('r' + subEl.entityCode + '-1'),
                        },
                        path:
                            subEl.type == 1
                                ? ("/web/" + subEl.entityName + "/list") : subEl.type == 3 ? ("/web/custom-page/" + el.outLink)
                                    : subEl.outLink,


                        component: subEl.type == 1 ? "customize-menu/list" : subEl.type == 3 ? ("custom-page/" + subEl.outLink) : '',
                    });
                });
            } else {
                initMenu.meta.type = el.type == 2 ? "link" : "";
                if (el.type == 1) {
                    initMenu.path = "/web/" + el.entityName + "/list";
                }
                else if (el.type == 3) {
                    initMenu.path = "/web/custom-page/" + el.outLink;
                } else {
                    initMenu.path = el.outLink;
                }

                if (el.type == 1) {
                    initMenu.component = "customize-menu/list";
                } else if (el.type == 3) {
                    initMenu.component = "custom-page/" + el.outLink;
                }
            }
            formatRoutrs.push(initMenu);
        });
        return formatRoutrs
    }

    return {
        navigationList,
        chosenNavigationId,
        setNavigationList,
        setChosenNavigationId,
        setDefaultMenuList,
        useMenuList
    }
}, {
    persist: true
})

export default useLayoutConfigStore