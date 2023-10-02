<template>
    <!-- <div class="test">
        <el-row>
            <el-col :span="4">
                <VueDraggableNext
                    :list="dragList"
                    ghost-class="ghost"
                    :force-fallback="true"
                    :group="{ name: 'list', pull: 'clone' }"
                    :sort="false"
                    itemKey="id"
                >
                    <div class="parent-li" v-for="(element,inx) of dragList" :key="inx">
                        <div class="item move">
                            <label class="move">{{ element.name }}111</label>
                        </div>
                    </div>
                </VueDraggableNext>
            </el-col>
            <el-col :span="12">
                <VueDraggableNext
                    :list="widgetList"
                    ghost-class="ghost"
                    itemKey="id"
                    :force-fallback="true"
                    group="list"
                    :fallback-class="true"
                    :fallback-on-body="true"
                >
                    <div class="parent-li" v-for="(element,inx) of widgetList" :key="inx">
                        <div class="item move">
                            <label class="move">{{ element.name }}111</label>
                        </div>
                    </div>
                </VueDraggableNext>
            </el-col>
        </el-row>
    </div>-->
    <div class="ml-dashboard-design">
        <div class="side-bar" :class="{'show':sideBarShow}">
            <el-scrollbar>
                <VueDraggableNext
                    :list="dragList"
                    ghost-class="ghost"
                    :force-fallback="true"
                    :group="{ name: 'list', pull: 'clone',put: false }"
                    :sort="false"
                    itemKey="id"
                >
                    <div class="parent-li" v-for="(element,inx) of dragList" :key="inx">
                        <div class="item move">
                            <label class="move">{{ element.name }}</label>
                        </div>
                    </div>
                </VueDraggableNext>
            </el-scrollbar>
        </div>
        <div
            class="main-box"
            :class="{'has-all':sideBarShow && rightBarShow,'has-side':sideBarShow && !rightBarShow,'has-right':!sideBarShow && rightBarShow}"
        >
            <el-button @click="sideBarShow = !sideBarShow">测试按钮1</el-button>
            <el-button @click="rightBarShow = !rightBarShow">测试按钮2</el-button>
            <div class="cont-box">
                <!-- :list="widgetList"
                        ghost-class="ghost"
                        itemKey="id"
                        :force-fallback="true"
                        group="list"
                        :fallback-class="true"
                        :fallback-on-body="true"
                        
                @end="onEnd"-->
                <div class="draggable-box">
                    <VueDraggableNext
                        class="draggable-div"
                        :list="widgetList"
                        group="list"
                        @add="addCom(widgetList)"
                    >
                        <el-scrollbar>
                            <smart-widget-grid :layout="layout" :row-height="48" :margin="[15, 15]">
                                <template v-for="(item, index) in widgetList" :key="index" #[index]>
                                    <component :is="item.type + '-widget'" ></component>
                                    <!-- <smart-widget :title="item.name">
                                        <div class="layout-center">{{ item.type }}【{{ item.id }}】--{{index}}</div>
                                    </smart-widget> -->
                                </template>
                            </smart-widget-grid>
                        </el-scrollbar>
                    </VueDraggableNext>
                </div>
            </div>
        </div>
        <div class="right-bar" :class="{'show':rightBarShow}">
            <div v-if="rightBarShow">456</div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { VueDraggableNext } from "vue-draggable-next";
// 左边
let sideBarShow = ref(true);
let dragList = ref([
    { name: "统计数值", type: "1", id: "0" },
    { name: "柱状图", type: "2", id: "1" },
    { name: "条形图", type: "3", id: "2" },
    { name: "折线图", type: "4", id: "3" },
    { name: "饼图", type: "5", id: "4" },
    { name: "漏斗图", type: "6", id: "5" },
    { name: "进度条", type: "7", id: "6" },
    { name: "雷达图", type: "8", id: "7" },
    { name: "透视表", type: "9", id: "8" },
    { name: "数据列表", type: "10", id: "9" },
]);
let widgetList = ref([
    // { name: "统计数值" }
]);

// 右边
let rightBarShow = ref(true);


let layout = ref([])
let dataIds = ref([]);
let dataList = ref([]);

const addCom = (widgetList) => {
    // widgetList.forEach((el) => {
    //     // 检测ID不存在的时候添加
    //     if (!dataIds.value.includes(el.type)) {
    let inx = layout.value.length;
    layout.value.push({ x: 0, y: 0, w: 4, h: 3, i: inx });
    dataList.value.push({ id: inx, cont: "el.name" });
    // dataIds.value.push(el.type);
    // }
    // });
}
</script>

<style lang='scss' scoped>
* {
    box-sizing: border-box;
}
.ml-dashboard-design {
    width: 100%;
    height: 100%;
    .side-bar {
        width: 0;
        float: left;
        height: 100%;
        &.show {
            width: 260px;
        }
        transition: all 0.1s;
    }
    .main-box {
        width: 100%;
        float: left;
        height: 100%;
        background: #f1f2f3;
        position: relative;

        &.has-all {
            width: calc(100% - 560px);
        }
        &.has-side {
            width: calc(100% - 260px);
        }
        &.has-right {
            width: calc(100% - 300px);
        }
        transition: all 0.1s;
        .cont-box {
            height: calc(100% - 40px);
            padding: 10px;
            .draggable-box {
                background: #fff;
                height: 100%;
                width: 100%;
                .draggable-div {
                    height: 100%;
                }
            }
        }
    }
    .right-bar {
        width: 0;
        float: left;
        height: 100%;
        &.show {
            width: 300px;
        }
        transition: all 0.1s;
    }
}
// .test {
//     width: 100%;
//     height: 100%;
// }
// .itxst {
//     width: 600px;
//     display: flex;
// }

// .itxst > div:nth-of-type(1) {
//     flex: 1;
// }

// .itxst > div:nth-of-type(2) {
//     width: 270px;
//     padding-left: 20px;
// }

// .item {
//     border: solid 1px #eee;
//     padding: 6px 10px;
//     text-align: left;
//     height: 30px;
// }

// .item:hover {
//     cursor: move;
// }

// .item + .item {
//     margin-top: 10px;
// }

// .ghost {
//     border: solid 1px rgb(19, 41, 239) !important;
// }

// .chosenClass {
//     background-color: #eee;
//     opacity: 1;
//     border: solid 1px red;
// }

// .fallbackClass {
//     background-color: aquamarine;
// }
</style>