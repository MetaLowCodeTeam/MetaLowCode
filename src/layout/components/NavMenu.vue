<template>
    <div v-if="navMenus.length<=0" style="padding:20px;">
        <el-alert title="无子集菜单" center type="info" :closable="false"></el-alert>
    </div>
    <template v-for="navMenu in navMenus" v-bind:key="navMenu">
        <el-menu-item-group v-if="navMenu.meta && navMenu.meta.group">
            <template #title>
                <span>{{navMenu.meta.title}}</span>
            </template>
            <NavMenu :navMenus="navMenu.children"></NavMenu>
        </el-menu-item-group>
        <el-menu-item v-else-if="!hasChildren(navMenu)" :index="navMenu.path">
            <a
                v-if="navMenu.meta&&navMenu.meta.type=='link'"
                :href="navMenu.meta.outLink"
                :target=" navMenu.meta.outLink.indexOf('/') == 0 ?'' : '_blank'"
                @click.stop="()=>{}"
            ></a>
            <el-icon
                v-if="navMenu.meta&&navMenu.meta.icon"
                :style="{'color':navMenu.meta.iconColor}"
            >
                <component :is="navMenu.meta.icon || 'el-icon-menu'" />
            </el-icon>
            <template #title>
                <span>{{navMenu.meta.title}}</span>
                <span v-if="navMenu.meta.tag" class="menu-tag">{{navMenu.meta.tag}}</span>
            </template>
        </el-menu-item>
        <el-sub-menu v-else :index="navMenu.path || navMenu.name">
            <template #title>
                <el-icon
                    v-if="navMenu.meta&&navMenu.meta.icon"
                    :style="{'color':navMenu.meta.iconColor}"
                >
                    <component :is="navMenu.meta.icon || 'el-icon-menu'" />
                </el-icon>
                <span>{{navMenu.meta.title}}</span>
                <span v-if="navMenu.meta.tag" class="menu-tag">{{navMenu.meta.tag}}</span>
            </template>
            <NavMenu :navMenus="navMenu.children"></NavMenu>
        </el-sub-menu>
    </template>
</template>

<script>
export default {
    name: "NavMenu",
    props: ["navMenus"],
    data() {
        return {};
    },
    methods: {
        hasChildren(item) {
            return (
                item.children &&
                !item.children.every((item) => item.meta.hidden)
            );
        },
    },
};
</script>
