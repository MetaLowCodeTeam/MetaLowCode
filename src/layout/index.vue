<template>
    <!-- 通栏布局 -->
    <template v-if="layoutFn=='header'">
        <header class="adminui-header">
            <div class="adminui-header-left">
                <div class="logo-bar">
                    <mlLogo class="logo" />
                    <span>{{ appName }}</span>
                </div>
                <!-- <ul v-if="!ismobileFn" class="nav">
                    <li
                        v-for="item in menu"
                        :key="item"
                        :class="pmenu.path==item.path?'active':''"
                        @click="showMenu(item)"
                    >
                        <el-icon :style="{'color':item.meta.iconColor}">
                            <component :is="item.meta.icon || 'el-icon-menu'" />
                        </el-icon>
                        <span>{{ item.meta.title }}</span>
                    </li>
                </ul> -->
            </div>
            <el-tooltip effect="light" placement="bottom-start">
                <template #content>
                    <div class="top-more-nav-content">
                        <el-row :gutter="10">
                            <el-col :span="6" v-for="(item,inx) in menu" :key="inx">
                                <div 
                                    class="top-more-nav-content-item yichu" 
                                    :title="item.meta.title"
                                    @click="showMenu(item)"
                                    :class="pmenu.path == item.path ? 'active' : '' "
                                >
                                    <el-icon :style="{'color':item.meta.iconColor}" class="menu-icon mr-2">
                                        <component :is="item.meta.icon || 'el-icon-menu'" />
                                    </el-icon>
                                    {{ item.meta.title }}
                                </div>
                            </el-col>
                        </el-row>
                        <!-- <div 
                            class="top-more-nav-content-item" 
                            v-for="(item,inx) in menu" :key="inx"
                        >
                            <el-icon :style="{'color':item.meta.iconColor}" class="mr-2">
                                <component :is="item.meta.icon || 'el-icon-menu'" />
                            </el-icon>
                            {{ item.meta.title }}
                        </div> -->
                        <!-- <p
                            v-for="item in menu"
                            :key="item"
                            :class="pmenu.path==item.path ? 'active' : '' "
                            @click="showMenu(item)"
                        >
                            <el-icon :style="{'color':item.meta.iconColor}" class="mr-2">
                                <component :is="item.meta.icon || 'el-icon-menu'" />
                            </el-icon>
                            {{ item.meta.title }}
                        </p> -->
                    </div>

                </template>
                <span class="top-more-nav" v-if="menu.length > 4">
                    <el-icon size="20"><Menu /></el-icon>
                </span>
            </el-tooltip>
            
            <div
                class="adminui-header-center"
                v-if="!ismobileFn"
                :style="{'width': getHeaderCenterWidth}"
            >
                <el-scrollbar :always="topMenuAlways">
                    <div class="scrollbar-flex-content">
                        <p
                            v-for="item in menu"
                            :key="item"
                            class="scrollbar-demo-item"
                            :class="pmenu.path==item.path ? 'active' : '' "
                            @click="showMenu(item)"
                        >
                            <el-icon :style="{'color':item.meta.iconColor}" class="mr-2">
                                <component :is="item.meta.icon || 'el-icon-menu'" />
                            </el-icon>
                            {{ item.meta.title }}
                        </p>
                    </div>
                </el-scrollbar>
            </div>
            <div class="adminui-header-right">
                <userbar></userbar>
            </div>
        </header>
        <section class="aminui-wrapper">
            <mlWaterMark>
                <div
                    v-if="!ismobileFn && nextMenu.length>0 || !pmenu.component"
                    :class="menuIsCollapseFn?'aminui-side isCollapse':'aminui-side'"
                >
                    <div v-if="!menuIsCollapseFn" class="adminui-side-top">
                        <h2>{{ pmenu.meta.title }}</h2>
                    </div>
                    <div class="adminui-side-scroll">
                        <ml-scrollbar class="nav-menu-scrollbar">
                            <el-menu
                                :default-openeds="defaultOpeneds"
                                :default-active="active"
								class="main-nav-menu"
                                router
                                :collapse="menuIsCollapseFn"
                                :unique-opened="$CONFIG.MENU_UNIQUE_OPENED"
                            >
                                <NavMenu :navMenus="nextMenu"></NavMenu>
                            </el-menu>
                        </ml-scrollbar>
                    </div>
                    <navigation />
                </div>
                <Side-m v-if="ismobileFn"></Side-m>
                <div class="aminui-body el-container">
                    <Topbar v-if="!ismobileFn"></Topbar>
                    <Tags v-if="!ismobileFn && layoutTagsFn"></Tags>
                    <div class="adminui-main" id="adminui-main">
                        <div
                            v-if="checkPlugin($route)"
                            class="not-plugin"
                        >{{ pluginInfo[$route.name].errMsg }}</div>
                        <template v-else>
                            <router-view v-slot="{ Component }">
                                <keep-alive :include="[...keepLiveRouteFn]">
                                    <component :is="wrap($route.fullPath, Component)" :key="$route.fullPath + ($route.query.refresh || '')" v-if="routeShowFn"/>
                                </keep-alive>
                            </router-view>
                            <iframe-view></iframe-view>
                        </template>
                    </div>
                </div>
            </mlWaterMark>
        </section>
    </template>

    <!-- 经典布局 -->
    <template v-else-if="layoutFn=='menu'">
        <header class="adminui-header">
            <div class="adminui-header-left">
                <div class="logo-bar">
                    <mlLogo class="logo" />
                    <span>{{ appName }}</span>
                </div>
            </div>
            <div class="adminui-header-right">
                <userbar></userbar>
            </div>
        </header>

        <section class="aminui-wrapper">
            <mlWaterMark>
                <div
                    v-if="!ismobileFn"
                    :class="menuIsCollapseFn?'aminui-side isCollapse':'aminui-side'"
                >
                    <div class="adminui-side-scroll">
                        <el-scrollbar>
                            <el-menu
                                :default-openeds="defaultOpeneds"
                                :default-active="active"
                                router
                                :collapse="menuIsCollapseFn"
                                :unique-opened="$CONFIG.MENU_UNIQUE_OPENED"
                            >
                                <NavMenu :navMenus="menu"></NavMenu>
                            </el-menu>
                        </el-scrollbar>
                    </div>
                    <navigation />
                </div>
                <Side-m v-if="ismobileFn"></Side-m>
                <div class="aminui-body el-container">
                    <Topbar v-if="!ismobileFn"></Topbar>
                    <Tags v-if="!ismobileFn && layoutTagsFn"></Tags>
                    <div class="adminui-main" id="adminui-main">
                        <div
                            v-if="checkPlugin($route)"
                            class="not-plugin"
                        >{{ pluginInfo[$route.name].errMsg }}</div>
                        <template v-else>
                            <router-view v-slot="{ Component }">
                                <keep-alive :include="[...keepLiveRouteFn]">
                                    <component :is="wrap($route.fullPath, Component)" :key="$route.fullPath + ($route.query.refresh || '')" />
                                </keep-alive>
                            </router-view>
                            <iframe-view></iframe-view>
                        </template>
                    </div>
                </div>
            </mlWaterMark>
        </section>
    </template>

    <!-- 主导航菜单位置(顶部) -->
    <template v-else-if="layoutFn=='dock'">
        <header class="adminui-header">
            <div class="adminui-header-left">
                <div class="logo-bar">
                    <mlLogo class="logo" />
                    <span>{{ appName }}</span>
                </div>
            </div>
            <div
                class="adminui-header-center"
                v-if="!ismobileFn"
                :style="{'width': getHeaderCenterWidth}"
            >
                <el-scrollbar class="dock-header-scrollbar" :always="topMenuAlways">
                    <div class="scrollbar-flex-content">
                        <el-menu
                            class="dock-header-menu"
                            popper-class="dock-header-menu"
                            :default-openeds="defaultOpeneds"
                            mode="horizontal"
                            :default-active="active"
                            router
                            background-color="var(--el-color-primary)"
                            text-color="#fff"
                            active-text-color="#fff"
                        >
                            <NavMenu :navMenus="dockMenu"></NavMenu>
                        </el-menu>
                    </div>
                </el-scrollbar>
            </div>
            <div class="adminui-header-right" style="min-width: 280px;">         
                <userbar isDockLayout></userbar>
            </div>
        </header>

        <section class="aminui-wrapper">
            <mlWaterMark>
                <div class="aminui-body el-container">
                    <Tags v-if="!ismobileFn && layoutTagsFn"></Tags>
                    <div class="adminui-main" id="adminui-main">
                        <div
                            v-if="checkPlugin($route)"
                            class="not-plugin"
                        >{{ pluginInfo[$route.name].errMsg }}</div>
                        <template v-else>
                            <router-view v-slot="{ Component }">
                                <keep-alive :include="[...keepLiveRouteFn]">
                                    <component :is="wrap($route.fullPath, Component)" :key="$route.fullPath + ($route.query.refresh || '')" />
                                </keep-alive>
                            </router-view>
                            <iframe-view></iframe-view>
                        </template>
                    </div>
                </div>
            </mlWaterMark>
        </section>
    </template>

	<!-- 无导航布局 -->
	<template v-else-if="layoutFn == 'noNav'">
        <section class="aminui-wrapper">
            <mlWaterMark>
                <div class="aminui-body el-container">
                    <div class="adminui-main" id="adminui-main">
                        <div
                            v-if="checkPlugin($route)"
                            class="not-plugin"
                        >{{ pluginInfo[$route.name].errMsg }}</div>
                        <template v-else>
                            <router-view v-slot="{ Component }">
                                <keep-alive :include="[...keepLiveRouteFn]">
                                    <component :is="wrap($route.fullPath, Component)" :key="$route.fullPath + ($route.query.refresh || '')" />
                                </keep-alive>
                            </router-view>
                            <iframe-view></iframe-view>
                        </template>
                    </div>
                </div>
            </mlWaterMark>
        </section>
    </template>

    <!-- 默认布局 -->
    <template v-else>
        <section class="aminui-wrapper">
            <mlWaterMark>
                <div v-if="!ismobileFn" class="aminui-side-split">
                    <div class="aminui-side-split-top">
                        <router-link :to="$CONFIG.DASHBOARD_URL">
                            <img class="logo" :title=" appName" src="~@/assets/imgs/logo-r.png" />
                        </router-link>
                    </div>
                    <div class="adminui-side-split-scroll">
                        <el-scrollbar>
                            <ul>
                                <li
                                    v-for="item in menu"
                                    :key="item"
                                    :class="pmenu.path==item.path?'active':''"
                                    @click="showMenu(item)"
                                >
                                    <el-icon>
                                        <component :is="item.meta.icon || el-icon-menu" />
                                    </el-icon>
                                    <p>{{ item.meta.title }}</p>
                                </li>
                            </ul>
                        </el-scrollbar>
                    </div>
                </div>
                <div
                    v-if="!ismobileFn && nextMenu.length>0 || !pmenu.component"
                    :class="menuIsCollapseFn?'aminui-side isCollapse':'aminui-side'"
                >
                    <div v-if="!menuIsCollapseFn" class="adminui-side-top">
                        <h2>{{ pmenu.meta.title }}</h2>
                    </div>
                    <div class="adminui-side-scroll">
                        <el-scrollbar>
                            <el-menu
                                :default-openeds="defaultOpeneds"
                                :default-active="active"
                                router
                                :collapse="menuIsCollapseFn"
                                :unique-opened="$CONFIG.MENU_UNIQUE_OPENED"
                            >
                                <NavMenu :navMenus="nextMenu"></NavMenu>
                            </el-menu>
                        </el-scrollbar>
                    </div>
                    <navigation />
                </div>
                <Side-m v-if="ismobileFn"></Side-m>
                <div class="aminui-body el-container">
                    <Topbar>
                        <userbar></userbar>
                    </Topbar>
                    <Tags v-if="!ismobileFn && layoutTagsFn"></Tags>
                    <div class="adminui-main" id="adminui-main">
                        <div
                            v-if="checkPlugin($route)"
                            class="not-plugin"
                        >{{ pluginInfo[$route.name].errMsg }}</div>
                        <template v-else>
                            <router-view v-slot="{ Component }">
                                <keep-alive :include="[...keepLiveRouteFn]">
                                    <component :is="wrap($route.fullPath, Component)" :key="$route.fullPath + ($route.query.refresh || '')" />
                                </keep-alive>
                            </router-view>
                            <iframe-view></iframe-view>
                        </template>
                    </div>
                </div>
            </mlWaterMark>
        </section>
    </template>

    <div class="main-maximize-exit" @click="exitMaximize">
        <el-icon>
            <el-icon-close />
        </el-icon>
    </div>
<!--
    <div class="layout-setting" @click="openSetting"><el-icon><el-icon-brush-filled /></el-icon></div>

    <el-drawer title="布局实时演示" v-model="settingDialog" :size="400" append-to-body destroy-on-close>
		<setting></setting>
    </el-drawer> -->

    <auto-exit></auto-exit>
</template>

<script>
import SideM from "./components/sideM.vue";
import Topbar from "./components/topbar.vue";
import Tags from "./components/tags.vue";
import NavMenu from "./components/NavMenu.vue";
import userbar from "./components/userbar.vue";
import setting from "./components/setting.vue";
import iframeView from "./components/iframeView.vue";
import autoExit from "./other/autoExit.js";
import useKeepAliveStore from "@/store/modules/keepAlive";
import useGlobalStore from "@/store/modules/global";
import useCommonStore from "@/store/modules/common";
import { storeToRefs } from "pinia";
import useLayoutConfigStore from "@/store/modules/layoutConfig";
// 滚动条
import mlScrollbar from "@/components/mlScrollbar/index.vue";
const { publicSetting } = storeToRefs(useCommonStore());
const { topDefaultUnfold, isHideWorkbench } = storeToRefs(useLayoutConfigStore());
//
import navigation from "./components/navigationList.vue";

const { keepLiveRoute, routeShow } = storeToRefs(useKeepAliveStore());
const { ismobile, layout, layoutTags, menuIsCollapse } = storeToRefs(
    useGlobalStore()
);

const { SET_ismobile, TOGGLE_menuIsCollapse } = useGlobalStore();
import { h } from "vue";
const wrapperMap = new Map()
export default {
    name: "index",
    components: {
        SideM,
        Topbar,
        Tags,
        NavMenu,
        userbar,
        setting,
        iframeView,
        autoExit,
        navigation,
        mlScrollbar,
    },
    data() {
        return {
            settingDialog: false,
            menu: [],
            nextMenu: [],
            // 功能坞菜单
            dockMenu: [],
            // 顶部导航过多虚拟滚动条是否始终显示
            topMenuAlways: false,
            pmenu: {},
            active: "",
            defaultOpeneds: [],
            pluginInfo: {
                TriggerList: {
                    pluginName: "metaTrigger",
                    errMsg: "触发器 插件未安装！",
                },
                TriggerLog: {
                    pluginName: "metaTrigger",
                    errMsg: "触发器 插件未安装！",
                },
                DashboardDesign: {
                    pluginName: "metaDataCube",
                    errMsg: "数据分析 插件未安装！",
                },
                TemplatesList: {
                    pluginName: "mannerReport",
                    errMsg: "在线报表 插件未安装！",
                },
                ProcessMonitoring: {
                    pluginName: "metaWorkFlow",
                    errMsg: "复杂流程监控 插件未安装！",
                },
            },
            needPlugin: [
                "TriggerList",
                "DashboardDesign",
                "TemplatesList",
                "TriggerLog",
                "ProcessMonitoring",
            ],
        };
    },
    computed: {
        routeShowFn() {
            return routeShow.value;
        },
        keepLiveRouteFn() {
            return keepLiveRoute.value;
        },
        ismobileFn() {
            return ismobile.value;
        },
        layoutFn() {
			return this.getUrlParams('layout') || publicSetting.value.layoutConfig || 'header';
        },
        layoutTagsFn() {
            return layoutTags.value;
        },
        menuIsCollapseFn() {
            return menuIsCollapse.value;
        },
        appName: () => {
            return publicSetting.value.APP_NAME;
        },
        getHeaderCenterWidth(){
            let computedWidth;
            let nameLangth = this.appName?.length;
            if(nameLangth < 7){
                computedWidth = 620;
            }else {
                computedWidth = 620 + ((nameLangth - 6 ) * 20);
            }
            return "calc(100% - "+ computedWidth +"px)";
        },
    },
    created() {
        this.onLayoutResize();
        window.addEventListener("resize", this.onLayoutResize);
        var menu = this.$router.sc_getMenu();
        this.menu = this.filterUrl(menu);
        this.dockMenu = [...this.menu[0].children];
        this.menu.forEach((item,inx) => {
            if(inx != 0){
                this.dockMenu.push(item);
            }
        });
        this.menu = this.menu.filter(el => !(el.children?.length < 1));
        this.menu = this.menu.filter(el => !(isHideWorkbench.value && el.path == '/web/home'));
        // this.menu.shift();
        this.getDefaultOpeneds();
        this.showThis();
    },
    watch: {
        $route() {
            this.showThis();
        },
        layout: {
            handler(val) {
                document.body.setAttribute("data-layout", val);
            },
            immediate: true,
        },
    },
    methods: {
		getUrlParams(key) {
			const params = this.$route.query;
			return params[key];
		},
        // 为keep-alive里的component接收的组件包上一层自定义name的壳
        wrap(fullPath, component) {
            let wrapper
            if (component) {
                const wrapperName = this.$route.name;
                if (wrapperMap.has(wrapperName)) {
                    wrapper = wrapperMap.get(wrapperName);
                } else {
                    wrapper = {
                        name: wrapperName,
                        render() {
                            return h(component);
                        },
                    };
                    wrapperMap.set(wrapperName, wrapper);
                }
                return h(wrapper);
            }
        },
        checkPlugin(route) {
            let pluginIdList = publicSetting.value.APP_PLUGINID || [];
            let name = route.name;
            // 如果不需要插件
            if (!this.needPlugin.includes(name)) {
                return false;
            }
            let pluginInfo = this.pluginInfo[name];
            // 如果插件列表不存在该插件
            if (!pluginIdList.includes(pluginInfo.pluginName)) {
                return true;
            }
            return false;
        },
        getDefaultOpeneds() {
            let needMenu = this.menu[0]?.children || [];
            needMenu.forEach((el) => {
                if (el.meta.isOpeneds) {
                    this.defaultOpeneds.push(el.path);
                }
            });
            this.defaultOpeneds = Object.assign([], this.defaultOpeneds, topDefaultUnfold.value);
        },
        openSetting() {
            this.settingDialog = true;
        },
        onLayoutResize() {
            SET_ismobile(document.body.clientWidth < 992);
        },
        //路由监听高亮
        showThis() {
            this.pmenu = this.$route.meta.breadcrumb
                ? this.$route.meta.breadcrumb[0]
                : {};
            this.nextMenu = this.filterUrl(this.pmenu.children);
            this.$nextTick(() => {
                this.active = this.$route.meta.active || this.$route.fullPath;
            });
        },
        //点击显示
        showMenu(route) {
            if(route.type == 2){
                window.open(route.outLink)
                return
            }
            this.pmenu = route;
            this.nextMenu = this.filterUrl(route.children);
            if (
                (!route.children || route.children.length == 0) &&
                route.component
            ) {
                this.$router.push({ path: route.path });
            }
        },
        //转换外部链接的路由
        filterUrl(map) {
            var newMap = [];
            map &&
                map.forEach((item) => {
                    item.meta = item.meta ? item.meta : {};
                    //处理隐藏
                    if (item.meta.hidden || item.meta.type == "button") {
                        return false;
                    }
                    //处理http
                    if (item.meta.type == "iframe") {
                        item.path = `/i/${item.name}`;
                    }
                    //递归循环
                    if (item.children && item.children.length > 0) {
                        item.children = this.filterUrl(item.children);
                    }
                    newMap.push(item);
                });
            return newMap;
        },
        //退出最大化
        exitMaximize() {
            document.getElementById("app").classList.remove("main-maximize");
        },
    },
};
</script>
<style lang="scss" scoped>
// .adminui-header-center {
//     width: calc(100% - 560px);
// }
.scrollbar-flex-content {
    display: flex;
}
.scrollbar-demo-item {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    cursor: pointer;
    height: 58px;
    padding: 0 15px;
    font-size: 14px;
    color: rgba(255, 255, 255, 0.6);
    &.active {
        background: rgba(255, 255, 255, 0.1);
        color: #fff;
    }
    &:hover {
        color: #fff;
    }
}


:deep(.dock-header-scrollbar) {
    .el-scrollbar__bar.is-vertical {
        display: none;
    }
}
.top-more-nav {
    display: flex;
    width: 30px;
    height: 57px;
    align-items: center;
    justify-content: center;
    color: rgba(255, 255, 255, 0.6);
    cursor: pointer;
    &:hover {
        color: #fff;
    }
}
.top-more-nav-content {
    width: 600px;
    font-size: 14px;
    font-weight: normal;
    .top-more-nav-content-item {
        line-height: 30px;
        box-sizing: border-box;
        padding: 0 10px;
        cursor: pointer;
        border-radius: 4px;
        &.active {
            background-color: #f0f2f5;
        }
        &:hover {
            background-color: #f0f2f5;
            
        }
        .menu-icon {
            position: relative;
            top: 2px;
        }
        
    }
    // display: flex;
    // .top-more-nav-content-item {
    //     // width: 100px;
    //     // text-align: center;
    // }
}
</style>


