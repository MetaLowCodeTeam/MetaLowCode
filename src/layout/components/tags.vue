<template>
    <div class="adminui-tags">
        <ul ref="tags">
            <li
                v-for="tag in tagList"
                v-bind:key="tag"
                :class="[isActive(tag)?'active':'',tag.meta.affix?'affix':'' ]"
                @contextmenu.prevent="openContextMenu($event, tag)"
            >
                <router-link :to="tag">
                    <span>{{ tag.meta.title }}</span>
                    <el-icon v-if="!tag.meta.affix" @click.prevent.stop="closeSelectedTag(tag)">
                        <el-icon-close />
                    </el-icon>
                </router-link>
            </li>
        </ul>
    </div>

    <transition name="el-zoom-in-top" v-loading="collectLoading">
        <ul
            v-if="contextMenuVisible"
            :style="{left:left+'px',top:top+'px'}"
            class="contextmenu"
            id="contextmenu"
        >
            <li @click="refreshTab()">
                <el-icon>
                    <el-icon-refresh />
                </el-icon>刷新
            </li>
            <li @click="collectTag()" v-if="isCollect">
                <el-icon>
                    <StarFilled />
                </el-icon>
                取消收藏
            </li>
            <li @click="collectTag()" v-else>
                <el-icon>
                    <Star />
                </el-icon>
                收藏
            </li>
            <hr />
            <li @click="closeTabs()" :class="contextMenuItem.meta.affix?'disabled':''">
                <el-icon>
                    <el-icon-close />
                </el-icon>关闭标签
            </li>
            <li @click="closeOtherTabs()">
                <el-icon>
                    <el-icon-folder-delete />
                </el-icon>关闭其他标签
            </li>
			<li @click="closeAllTabs()">
				<el-icon>
					<el-icon-folder-delete />
				</el-icon>关闭所有标签
			</li>
            <hr />
            <li @click="maximize()">
                <el-icon>
                    <el-icon-full-screen />
                </el-icon>最大化
            </li>
            <li @click="openWindow()">
                <el-icon>
                    <el-icon-copy-document />
                </el-icon>在新的窗口中打开
            </li>
        </ul>
    </transition>
</template>

<script>
import Sortable from "sortablejs";
import useViewTagsStore from "@/store/modules/viewTags";
import useKeepAliveStore from "@/store/modules/keepAlive";
import useIframeStore from "@/store/modules/iframe";
import useLayoutConfigStore from "@/store/modules/layoutConfig";
import { storeToRefs } from "pinia";
import config from "@/config"
const viewTagsStore = useViewTagsStore();
const keepAliveStore = useKeepAliveStore();
const iframeStore = useIframeStore();

const { viewTags } = storeToRefs(viewTagsStore);
const { pushViewTags,removeViewTags } = viewTagsStore;
const { pushKeepLive,removeKeepLive,setRouteShow } = keepAliveStore;
const { removeIframeList,refreshIframe } = iframeStore;
// 当前菜单导航
const { chosenNavigationId } = storeToRefs(useLayoutConfigStore());
// 收藏菜单 、 删除收藏菜单 、 获取收藏菜单
const { 
    checkCollectMenu,
    setCollectMenuList
} = useLayoutConfigStore();
const appPath = import.meta.env.VITE_APP_PATH;
export default {
    name: "tags",
    data() {
        return {
            contextMenuVisible: false,
            contextMenuItem: null,
            left: 0,
            top: 0,
            tagList: viewTags.value,
            tipDisplayed: false,
            // 当前菜单导航
            currentNavigationId: chosenNavigationId.value,
            // 检测是否收藏
            isCollect: false,
            // 收藏ID
            collectRecordId: null,
            // 收藏loading
            collectLoading: false,
        };
    },
    props: {
        isAppManagement: {
            type: Boolean,
            default: false,
        },
    },
    watch: {
        $route(e) {
            this.addViewTags(e);
            //判断标签容器是否出现滚动条
            this.$nextTick(() => {
                const tags = this.$refs.tags;
                if (tags && tags.scrollWidth > tags.clientWidth) {
                    //确保当前标签在可视范围内
                    let targetTag = tags.querySelector(".active");
                    targetTag.scrollIntoView();
                    //显示提示
                    if (!this.tipDisplayed) {
                        this.$msgbox({
                            type: "warning",
                            center: true,
                            title: "提示",
                            message:
                                "当前标签数量过多，可通过鼠标滚轴滚动标签栏。关闭标签数量可减少系统性能消耗。",
                            confirmButtonText: "知道了",
                        });
                        this.tipDisplayed = true;
                    }
                }
            });
        },
        contextMenuVisible(value) {
            const cm = (e) => {
                const sp = document.getElementById("contextmenu");
                if (sp && !sp.contains(e.target)) {
                    this.closeMenu();
                }
            };
            if (value) {
                document.body.addEventListener("click", (e) => cm(e));
            } else {
                document.body.removeEventListener("click", (e) => cm(e));
            }
        },
    },
    created() {
        let menu = this.$router.sc_getMenu();
        let dashboardRoute = this.treeFind(
            menu,
            (node) => node.path == this.$CONFIG.DASHBOARD_URL
        );
        
        if (dashboardRoute && !this.isAppManagement) {
            let formatDashboardRoute = {...dashboardRoute};
            formatDashboardRoute.fullPath = config.DASHBOARD_URL;
            this.addViewTags(formatDashboardRoute);
            this.addViewTags(this.$route);
        }
        if(this.isAppManagement){
            let { appAbbr, appName } = this.$route.query;
            this.addViewTags({
                "fullPath": appPath + "designApp/designEntity?appName=" + encodeURIComponent(appName) + "&appAbbr=" + appAbbr,
                "path": appPath + "designApp/designEntity?appName=" + encodeURIComponent(appName) + "&appAbbr=" + appAbbr,
                "query": {
                    appName,
                    appAbbr
                },
                "hash": "",
                "name": "DesignEntity",
                "params": {},
                "meta": {
                    "title": "实体管理",
                    "affix": true
                },
                "href": appPath + "designApp/designEntity?appName=" + encodeURIComponent(appName) + "&appAbbr=" + appAbbr
            });
            this.addViewTags(this.$route);
        }
    },
    mounted() {
        this.tagDrop();
        this.scrollInit();
    },
    methods: {
        // 收藏格式化菜单
        formateMenu() {
            let formateMenu = {
                navigationId: this.currentNavigationId,
                title: this.contextMenuItem.meta.title,
                fullPath: this.contextMenuItem.fullPath,
                alias: this.contextMenuItem.meta.title,
            }
            return formateMenu;
        },
        // 收藏
        async collectTag() {
            if(this.isCollect){
                this.collectLoading = true;
                let res = await this.$API.layoutConfig.deleteFavoritesConfig(this.collectRecordId);
                if(res && res.code == 200) {
                    this.$message.success('已取消收藏')
                    setCollectMenuList(res.data)
                    this.contextMenuVisible = false;
                }
                this.collectLoading = false;
            }else {
                this.collectLoading = true;
                let res = await this.$API.layoutConfig.saveFavoritesConfig(
                    null,
                    "FAVORITES",
                    {
                        config: JSON.stringify(this.formateMenu()),
                    },
                );
                if(res && res.code == 200) {
                    this.$message.success('收藏成功')
                    setCollectMenuList(res.data)
                    this.contextMenuVisible = false;
                }
                this.collectLoading = false;
            }
        },
        //查找树
        treeFind(tree, func) {
            for (const data of tree) {
                if (func(data)) return data;
                if (data.children) {
                    const res = this.treeFind(data.children, func);
                    if (res) return res;
                }
            }
            return null;
        },
        //标签拖拽排序
        tagDrop() {
            const target = this.$refs.tags;
            Sortable.create(target, {
                draggable: "li",
                animation: 300,
            });
        },
        //增加tag
        addViewTags(route) {
            if (route.name && !route.meta.fullpage) {
                pushViewTags(route);
                pushKeepLive(route.name);
            }
        },
        //高亮tag
        isActive(route) {
            return route.fullPath === this.$route.fullPath;
        },
        //关闭tag
        closeSelectedTag(tag, autoPushLatestView = true) {
            const nowTagIndex = this.tagList.findIndex(
                (item) => item.fullPath == tag.fullPath
            );
            removeViewTags(tag);
            removeIframeList(tag);
            removeKeepLive(tag.name);
            if (autoPushLatestView && this.isActive(tag)) {
                const leftView = this.tagList[nowTagIndex - 1];
                if (leftView) {
                    this.$router.push(leftView);
                } else {
                    this.$router.push("/");
                }
            } else if (!autoPushLatestView) { //激活显示第一个页签
				const lastView = this.tagList[0];
				if (lastView) {
					this.$router.push(lastView);
				} else {
					this.$router.push("/");
				}
			}
        },
        //tag右键
        openContextMenu(e, tag) {
            this.contextMenuItem = tag;
            this.contextMenuVisible = true;
            // 获取收藏ID
            this.collectRecordId = checkCollectMenu(this.formateMenu());
            // 检测是否收藏
            this.isCollect = this.collectRecordId ? true : false;
            this.left = e.clientX + 1;
            this.top = e.clientY + 1;

            //FIX 右键菜单边缘化位置处理
            this.$nextTick(() => {
                let sp = document.getElementById("contextmenu");
                if (document.body.offsetWidth - e.clientX < sp.offsetWidth) {
                    this.left = document.body.offsetWidth - sp.offsetWidth + 1;
                    this.top = e.clientY + 1;
                }
            });
        },
        //关闭右键菜单
        closeMenu() {
            this.contextMenuItem = null;
            this.contextMenuVisible = false;
        },
        //TAB 刷新
        refreshTab() {
            this.contextMenuVisible = false;
            const nowTag = this.contextMenuItem;
            //判断是否当前路由，否的话跳转
            if (this.$route.fullPath !== nowTag.fullPath) {
                this.$router.push({
                    path: nowTag.fullPath,
                    query: nowTag.query,
                });
            }
            setTimeout(() => {
                removeKeepLive(nowTag.name);
                setRouteShow(false);
                this.$nextTick(() => {
                    pushKeepLive(nowTag.name);
                    setRouteShow(true);
                });
            }, 0);

        },
        //TAB 关闭
        closeTabs(notPushLatestView = false) {
            let nowTag = this.contextMenuItem;
            if (!nowTag.meta.affix) {
                this.closeSelectedTag(nowTag, !notPushLatestView);
                this.contextMenuVisible = false;
            }
            // console.log()
        },
        //TAB 关闭其他
        closeOtherTabs() {
            let nowTag = this.contextMenuItem;
            //判断是否当前路由，否的话跳转
            if (this.$route.fullPath != nowTag.fullPath) {
                this.$router.push({
                    path: nowTag.fullPath,
                    query: nowTag.query,
                });
            }
            let tags = [...this.tagList];
            tags.forEach((tag) => {
                if (
                    (tag.meta && tag.meta.affix) ||
                    nowTag.fullPath == tag.fullPath
                ) {
                    return true;
                } else {
                    this.closeSelectedTag(tag, false);
                }
            });
            this.contextMenuVisible = false;
        },

		closeAllTabs() {
			//先关闭其他标签
			this.closeOtherTabs();

			//然后关闭当前页签
			let curTag = this.contextMenuItem;
			if (curTag && !curTag.meta.affix) {
				this.closeSelectedTag(curTag, false);
				this.contextMenuVisible = false;
			}
		},

        //TAB 最大化
        maximize() {
            let nowTag = this.contextMenuItem;
            this.contextMenuVisible = false;
            //判断是否当前路由，否的话跳转
            if (this.$route.fullPath != nowTag.fullPath) {
                this.$router.push({
                    path: nowTag.fullPath,
                    query: nowTag.query,
                });
            }
            document.getElementById("app").classList.add("main-maximize");
        },
        //新窗口打开
        openWindow() {
            let nowTag = this.contextMenuItem;
            let url = nowTag.href || "/";
            if (!nowTag.meta.affix) {
                this.closeSelectedTag(nowTag);
            }
            window.open(url);
            this.contextMenuVisible = false;
        },
        //横向滚动
        scrollInit() {
            const scrollDiv = this.$refs.tags;
            scrollDiv.addEventListener("mousewheel", handler, false) ||
                scrollDiv.addEventListener("DOMMouseScroll", handler, false);
            function handler(event) {
                const detail = event.wheelDelta || event.detail;
                //火狐上滚键值-3 下滚键值3，其他内核上滚键值120 下滚键值-120
                const moveForwardStep = 1;
                const moveBackStep = -1;
                let step = 0;
                if (detail == 3 || (detail < 0 && detail != -3)) {
                    step = moveForwardStep * 50;
                } else {
                    step = moveBackStep * 50;
                }
                scrollDiv.scrollLeft += step;
            }
        },
    },
};
</script>

<style>
.contextmenu {
    position: fixed;
    width: 200px;
    margin: 0;
    border-radius: 0px;
    background: var(--el-bg-color-overlay);
    border: 1px solid var(--el-border-color-light);
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    z-index: 3000;
    list-style-type: none;
    padding: 10px 0;
}
.contextmenu hr {
    margin: 5px 0;
    border: none;
    height: 1px;
    font-size: 0px;
    background-color: var(--el-border-color-light);
}
.contextmenu li {
    display: flex;
    align-items: center;
    margin: 0;
    cursor: pointer;
    line-height: 30px;
    padding: 0 17px;
    color: #606266;
}
.contextmenu li i {
    font-size: 14px;
    margin-right: 10px;
}
.contextmenu li:hover {
    background-color: #ecf5ff;
    color: #66b1ff;
}
.contextmenu li.disabled {
    cursor: not-allowed;
    color: #bbb;
    background: transparent;
}

.tags-tip {
    padding: 5px;
}
.tags-tip p {
    margin-bottom: 10px;
}

.dark .contextmenu li {
    color: var(--el-text-color-primary);
}
</style>
