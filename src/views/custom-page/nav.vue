<template>
    <!--  -->
    <div class="custom-nav" v-loading="loading">
        <template v-for="(item,inx) of navGroup" :key="inx">
            <div class="nav-group" v-if="item.children && item.children.length > 0">
                <div class="nav-group-name">{{ item.label }}</div>
                <div class="box-card clearfix">
                    <el-card
                        class="item-card"
                        v-for="(subItem,subInx) of item.children"
                        :key="subInx"
                    >
                        <div class="content-card" :title="subItem.name" @click="goNav(subItem)">
                            <div class="item-icon">
                                <el-icon class="icon" v-if="!subItem.useIcon" color="#FFF">
                                    <SetUp />
                                </el-icon>
                                <el-icon class="icon" v-else color="#FFF">
                                    <component :is="subItem.useIcon" />
                                </el-icon>
                            </div>
                            <div class="item-text">{{ subItem.name }}</div>
                        </div>
                    </el-card>
                </div>
            </div>
        </template>
    </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
/**
 * API
 */
import layoutConfig from "@/api/layoutConfig";
import { ElMessage } from "element-plus";
const Router = useRouter();

let layoutConfigId = ref("");
let loading = ref(false);

// 最近使用
let recentlyUsed = ref([]);

let navGroup = ref([
    {
        label: "最近使用",
        children: [],
    },
    {
        label: "工作台",
        children: [],
    },
]);

onMounted(() => {
    layoutConfigId.value = Router.currentRoute.value.query.layoutConfigId;
    let recentlyUsedNav = localStorage.getItem("RecentlyUsedNav");
    recentlyUsed.value = recentlyUsedNav ? JSON.parse(recentlyUsedNav) : [];
    navGroup.value[0].children = [...recentlyUsed.value];
    if (layoutConfigId.value) {
        getNavigationById();
    }else {
        ElMessage.warning("没有找到：layoutConfigId")
    }
});

let navList = ref([]);

// 获取导航数据
const getNavigationById = async () => {
    loading.value = true;
    let res = await layoutConfig.getNavigationById(layoutConfigId.value);
    if (res && res.code == 200) {
        navList.value = res.data.config ? JSON.parse(res.data.config) : [];
        // 取有子集和没有子集的东西
        let hasChildren = [];
        let notChildren = [];
        if (navList.value.length > 0) {
            navList.value.forEach((el) => {
                el.label = el.name;
                if (el.children) {
                    hasChildren.push(el);
                } else {
                    notChildren.push(el);
                }
            });
        }
        navGroup.value[1].children = [...notChildren];
        navGroup.value.push(...hasChildren);
    }
    loading.value = false;
};
const appPath = import.meta.env.VITE_APP_PATH;
// 跳转导航
const goNav = (subItem) => {
    let { type, outLink, openType, entityName, guid } = subItem;
    // 是实体列表页面
    if (type == 1) {
        Router.push(appPath + entityName + "/list");
    }
    // 是外部地址
    else if (type == 2) {
        // 内嵌
        if (openType) {
            Router.push(appPath + "custom-page/iframe/" + guid);
        }
        // 新窗口跳转
        else {
            window.open(outLink);
        }
    }
    // 自定义
    else if (type == 3) {
        Router.push(appPath + "custom-page/" + outLink);
    }
    // 内置页面
    else if (type == 4) {
        Router.push(appPath + "custom-page/" + outLink);
    }
    let findInx = getItemInx(subItem);
    // 如果item在最近使用列表里，把它删除
    if (findInx != -1) {
        recentlyUsed.value.splice(findInx, 1);
    }
    // 插入第一个，再保存
    recentlyUsed.value.unshift(subItem);
    saveRecentlyUsed();
};

// 取ITEM在最近使用列表里的缩影
const getItemInx = (item) => {
    for (let index = 0; index < recentlyUsed.value.length; index++) {
        const el = recentlyUsed.value[index];
        if (el.guid == item.guid) {
            return index;
        }
    }
    return -1;
};

// 将最近使用存储到本地
const saveRecentlyUsed = () => {
    if (recentlyUsed.value.length > 5) {
        recentlyUsed.value.splice(5, 1);
    }
    localStorage.setItem("RecentlyUsedNav", JSON.stringify(recentlyUsed.value));
    navGroup.value[0].children = [...recentlyUsed.value];
};
</script>
<style lang='scss' scoped>
.custom-nav {
    height: 100%;
    padding: 20px;
    font-size: 14px;
    .nav-group {
        margin-bottom: 20px;
        .nav-group-name {
            font-size: 20px;
            margin-bottom: 10px;
        }
        .box-card {
            // display: flex;
            // float: left;
            .item-card {
                margin-bottom: 10px;
                height: 72px;
                width: 200px;
                margin-right: 30px;
                float: left;
                cursor: pointer;
                :deep(.el-card__body) {
                    padding: 0 !important;
                    width: 200px;
                }
                .content-card {
                    width:200px;
                    display: flex;
                    padding: 10px;
                    box-sizing: border-box;
                    .item-icon {
                        width: 50px;
                        height: 50px;
                        background: #fdb203;
                        margin-right: 10px;
                        border-radius: 4px;
                        text-align: center;
                        line-height: 50px;
                        font-size: 28px;
                        .icon {
                            position: relative;
                            top: 4px;
                        }
                    }
                    .item-text {
                        line-height: 50px;
                        font-size: 18px;
                        width: 120px;
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                    }
                }
            }
        }
    }
}
</style>