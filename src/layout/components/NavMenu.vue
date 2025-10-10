<template>
    <div v-if="navMenus.length<=0" style="padding:20px;">
        <el-alert title="无子集菜单" center type="info" :closable="false"></el-alert>
    </div>
    <template v-for="navMenu in navMenus" v-bind:key="navMenu">
        <el-menu-item-group v-if="navMenu.meta && navMenu.meta.group">
            <template #title>
                <span class="menu-title-wrap">{{navMenu.meta.title}}</span>
            </template>
            <NavMenu :navMenus="navMenu.children"></NavMenu>
        </el-menu-item-group>
        <el-menu-item v-else-if="!hasChildren(navMenu)" :index="navMenu.path" :class="{'isActive': activePath == navMenu.path}">
            <a
                v-if="navMenu.meta&&navMenu.meta.type=='link'"
                :href="formatOutLink(navMenu.meta)"
                :target="navMenu.meta.outLink.indexOf('/') !== 0 || navMenu.meta._blank ? '_blank' : ''"
                @click.stop="()=>{}"
                class="full-link-area"
            ></a>
            <a
                v-if="navMenu.meta&&navMenu.meta.query"
                @click.stop="customPageClick(navMenu)"
                class="full-link-area"
            ></a>
            <el-icon
                v-if="navMenu.meta&&navMenu.meta.icon"
                :style="{'color':navMenu.meta.iconColor}"
            >
                <component :is="navMenu.meta.icon || 'Notebook'" />
            </el-icon>
            <template #title>
                <span class="menu-title-wrap">{{navMenu.meta.title}}</span>
                <span v-if="navMenu.meta.tag" class="menu-tag">{{navMenu.meta.tag}}</span>
            </template>
        </el-menu-item>
        <el-sub-menu v-else :index="navMenu.path || navMenu.name">
            <template #title>
                <el-icon
                    v-if="navMenu.meta&&navMenu.meta.icon"
                    :style="{'color':navMenu.meta.iconColor}"
                >
                    <component :is="navMenu.meta.icon || 'Notebook'" />
                </el-icon>
                <span class="menu-title-wrap">{{navMenu.meta.title}}</span>
                <span v-if="navMenu.meta.tag" class="menu-tag">{{navMenu.meta.tag}}</span>
            </template>
            <NavMenu :navMenus="navMenu.children"></NavMenu>
        </el-sub-menu>
    </template>
</template>

<script>
import { formatOutLink } from "@/utils/util";
export default {
    name: "NavMenu",
    props: ["navMenus"],
    data() {
        return {
            activePath: "",
        };
    },
    watch: {
        $route: function (newRouter, oldRouter) {
            this.activePath = newRouter.path; //侧边栏选中
        },
    },
    mounted(){
        this.activePath = this.$route.path;
    },
    methods: {
        hasChildren(item) {
            return (
                item.children &&
                !item.children.every((item) => item.meta.hidden)
            );
        },
        // 自定义页面点击
        customPageClick(navMenu) {
            this.$router.push({
                path: navMenu.path,
                query: navMenu.meta.query,
            });
        },
        formatOutLink(meta) {
            return formatOutLink(meta);
        },
    },
};
</script>
<style lang="scss" scoped>
.isActive {
    color: var(--el-menu-active-color);
}

// 统一处理菜单项标题的换行
.menu-title-wrap {
    white-space: normal; /* 允许文本换行 */
    word-break: break-all; /* 强制在任意字符处换行，防止长单词溢出 */
    // 或者使用 word-wrap: break-word; 如果你更倾向于在单词边界处换行
    line-height: 1.2; /* 调整行高，让换行更紧凑 */
    // 如果菜单项默认高度不够，可能需要调整 min-height 或者取消固定 height
    // 例如，可以尝试让菜单项高度自适应
    // 注意：修改 el-menu-item 和 el-sub-menu 的高度可能需要覆盖 Element Plus 的默认样式
}

// 确保菜单项本身能够适应内容高度，并调整间距
// El-Menu 的菜单项通常有固定的 height 或 padding，需要覆盖
// 针对 el-menu-item 的标题区域
.el-menu-item,
.el-sub-menu__title {
    height: auto !important; // 取消固定高度，让内容撑开
    min-height: var(--el-menu-item-height, 56px); // 设置最小高度，防止内容过少时太小
    // 或者根据需要调整 padding-top 和 padding-bottom
    padding-top: 10px; // 示例值，可以根据实际效果调整
    padding-bottom: 10px; // 示例值，可以根据实际效果调整
    box-sizing: border-box; // 确保 padding 不会增加总高度，而是向内收缩
}

// 针对 el-menu-item 内部的 A 标签，确保点击区域覆盖整个换行区域
.el-menu-item {
    position: relative; // 为内部的绝对定位 A 标签提供定位上下文
    .full-link-area {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 10; // 确保 A 标签在其他内容上方，可以点击
    }
    // 确保图标和文字不会被 A 标签覆盖，可以调整 z-index 或者通过 padding 避开
    .el-icon,
    .menu-title-wrap,
    .menu-tag {
        position: relative;
        z-index: 2; // 确保它们在 A 标签之上显示和交互
    }
}


// 如果菜单标题旁边有tag，也可能需要调整间距
.menu-tag {
    margin-left: 5px; // 示例值
}
</style>
