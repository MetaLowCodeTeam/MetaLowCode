<template>
    <!--  -->
    <smart-widget-grid :layout="layout" :row-height="50" :margin="[15, 15]">
        <template v-for="(item, index) in portlets" :key="index" #[item.id]>
            <smart-widget
                :title="item.title"
                :sub-title="item.subTitle"
                :fullscreen="item.fullscreen"
                :collapse="item.collapse"
                :refresh="item.refresh"
                :simple="item.simple"
                @on-refresh="handleRefresh(item)"
                :loading="item.loading"
            ></smart-widget>
        </template>
    </smart-widget-grid>
</template>

<script setup>
import { ref } from "vue";
let layout = ref([
    { x: 0, y: 0, w: 4, h: 4, i: "0" },
    { x: 4, y: 0, w: 4, h: 4, i: "1" },
    { x: 8, y: 0, w: 4, h: 4, i: "2" },
]);
let portlets = ref([
    {
        id: "0",
        module: "content",
        title: "内容",
        simple: true,
        content: "没有标题栏",
        btn: {
            fullscreen: false,
            collapse: false,
            refresh: false,
            loading: false,
        },
    },
    {
        id: "1",
        module: "content",
        title: "全屏展示",
        simple: false,
        content:
            "这是一个有很多内容的部件,这是一个有很多内容的部件,这是一个有很多内容的部件,这是一个有很多内容的部件,这是一个有很多内容的部件,这是一个有很多内容的部件,这是一个有很多内容的部件,这是一个有很多内容的部件,这是一个有很多内容的部件,这是一个有很多内容的部件,这是一个有很多内容的部件,这是一个有很多内容的部件,这是一个有很多内容的部件,这是一个有很多内容的部件,这是一个有很多内容的部件,这是一个有很多内容的部件,这是一个有很多内容的部件,这是一个有很多内容的部件,这是一个有很多内容的部件,这是一个有很多内容的部件,这是一个有很多内容的部件,这是一个有很多内容的部件,这是一个有很多内容的部件,这是一个有很多内容的部件,这是一个有很多内容的部件,这是一个有很多内容的部件",
        btn: {
            fullscreen: true,
            collapse: true,
            refresh: false,
            loading: false,
        },
    },
    {
        id: "2",
        module: "tubiao1",
        title: "图表测试",
        simple: false,
        content: "",
        btn: {
            fullscreen: false,
            collapse: false,
            refresh: true,
            loading: false,
        },
    },
    {
        id: "3",
        module: "html",
        title: "图表测试1",
        simple: false,
        content: "",
        btn: {
            fullscreen: true,
            collapse: true,
            refresh: true,
            loading: false,
        },
    },
    {
        id: "4",
        module: "edit",
        title: "可操作性列",
        simple: false,
        content: "",
        btn: {
            fullscreen: true,
            collapse: false,
            refresh: true,
            loading: false,
        },
    },
    {
        id: "5",
        module: "cms",
        title: "信息",
        simple: false,
        btn: {
            fullscreen: false,
            collapse: false,
            refresh: true,
            loading: false,
        },
    },
    {
        id: "6",
        module: "cms",
        title: "信息",
        simple: false,
        btn: {
            fullscreen: false,
            collapse: false,
            refresh: true,
            loading: false,
        },
    },
]);
</script>
<style lang='scss' scoped>
.layout-center {
    background: red;
}
</style>