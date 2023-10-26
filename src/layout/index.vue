<template>
    <!-- 通栏布局 -->
    <template v-if="layoutFn=='header'">
        <header class="adminui-header">
            <div class="adminui-header-left">
                <div class="logo-bar">
                    <mlLogo class="logo" />
                    <span>{{ $TOOL.data.get('APP_NAME') }}</span>
                </div>
                <ul v-if="!ismobileFn" class="nav">
                    <li
                        v-for="item in menu"
                        :key="item"
                        :class="pmenu.path==item.path?'active':''"
                        @click="showMenu(item)"
                    >
                        <el-icon>
                            <component :is="item.meta.icon || 'el-icon-menu'" />
                        </el-icon>
                        <span>{{ item.meta.title }}</span>
                    </li>
                </ul>
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
                    <Topbar v-if="!ismobileFn"></Topbar>
                    <Tags v-if="!ismobileFn && layoutTagsFn"></Tags>
                    <div class="adminui-main" id="adminui-main">
                        <div
                            v-if="checkPlugin($route)"
                            class="not-plugin"
                        >{{ pluginInfo[$route.name].errMsg }}</div>
                        <template v-else>
                            <router-view v-slot="{ Component }">
                                <keep-alive :include="keepLiveRouteFn">
                                    <component
                                        :is="Component"
                                        :key="$route.fullPath"
                                        v-if="routeShowFn"
                                    />
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
                    <span>{{ $TOOL.data.get('APP_NAME') }}</span>
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
                                <keep-alive :include="keepLiveRouteFn">
                                    <component
                                        :is="Component"
                                        :key="$route.fullPath"
                                        v-if="routeShowFn"
                                    />
                                </keep-alive>
                            </router-view>
                            <iframe-view></iframe-view>
                        </template>
                    </div>
                </div>
            </mlWaterMark>
        </section>
    </template>

    <!-- 功能坞布局 -->
    <template v-else-if="layoutFn=='dock'">
        <header class="adminui-header">
            <div class="adminui-header-left">
                <div class="logo-bar">
                    <mlLogo class="logo" />
                    <span>{{ $TOOL.data.get('APP_NAME') }}</span>
                </div>
            </div>
            <div class="adminui-header-right">
                <div v-if="!ismobileFn" class="adminui-header-menu">
                    <el-menu
                        :default-openeds="defaultOpeneds"
                        mode="horizontal"
                        :default-active="active"
                        router
                        background-color="#222b45"
                        text-color="#fff"
                        active-text-color="var(--el-color-primary)"
                    >
                        <NavMenu :navMenus="menu"></NavMenu>
                    </el-menu>
                </div>
                <Side-m v-if="ismobileFn"></Side-m>
                <userbar></userbar>
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
                                <keep-alive :include="keepLiveRouteFn">
                                    <component
                                        :is="Component"
                                        :key="$route.fullPath"
                                        v-if="routeShowFn"
                                    />
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
                            <img
                                class="logo"
                                :title=" $TOOL.data.get('APP_NAME')"
                                src="~@/assets/imgs/logo-r.png"
                            />
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
                                <keep-alive :include="keepLiveRouteFn">
                                    <component
                                        :is="Component"
                                        :key="$route.fullPath"
                                        v-if="routeShowFn"
                                    />
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

    <!-- <div class="layout-setting" @click="openSetting"><el-icon><el-icon-brush-filled /></el-icon></div> -->

    <!-- <el-drawer title="布局实时演示" v-model="settingDialog" :size="400" append-to-body destroy-on-close>
		<setting></setting>
    </el-drawer>-->

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
const { publicSetting } = storeToRefs(useCommonStore());

import navigation from "./components/navigationList.vue";

const { keepLiveRoute, routeShow } = storeToRefs(useKeepAliveStore());
const { ismobile, layout, layoutTags, menuIsCollapse } = storeToRefs(
    useGlobalStore()
);

const { SET_ismobile, TOGGLE_menuIsCollapse } = useGlobalStore();

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
    },
    data() {
        return {
            settingDialog: false,
            menu: [],
            nextMenu: [],
            pmenu: {},
            active: "",
            defaultOpeneds: [],
            pluginInfo: {
                RriggerList: {
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
            },
            needPlugin: ["RriggerList", "DashboardDesign", "TemplatesList"],
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
            return layout.value;
        },
        layoutTagsFn() {
            return layoutTags.value;
        },
        menuIsCollapseFn() {
            return menuIsCollapse.value;
        },
    },
    created() {
        this.onLayoutResize();
        window.addEventListener("resize", this.onLayoutResize);
        var menu = this.$router.sc_getMenu();
        this.menu = this.filterUrl(menu);
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
            let needMenu = this.menu[0].children;
            needMenu.forEach((el) => {
                if (el.meta.isOpeneds) {
                    this.defaultOpeneds.push(el.name);
                }
            });
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
