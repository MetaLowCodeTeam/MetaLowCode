<template>
    <div class="test">
        <el-button class="add-btn" @click="add">测试</el-button>
        <smart-widget-grid :layout="layout" :row-height="48" :margin="[15, 15]">
            <!-- <template #0>
            <smart-widget fullscreen refresh :loading="false" @on-refresh="refresh">
                <template #title>Default Widget12323</template>
                <div class="layout-center"></div>
            </smart-widget>
        </template>
        <template #1>
            <smart-widget fullscreen refresh>
                <template #title>组件2</template>
                <div class="layout-center"></div>
            </smart-widget>
            </template>-->
            <template v-for="(item, index) in dataList" :key="item.id" #[index]>
                <smart-widget :title="item.cont">
                    <div class="layout-center">{{ item.cont }}</div>
                </smart-widget>
            </template>
        </smart-widget-grid>
    </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
let layout = ref([])
let dataList = ref([])
const refresh = () => {
    console.log(1);
}
const add = () => {
    let inx = layout.value.length;
    layout.value.push({ x: 0, y: 0, w: 4, h: 3, i: inx })
    dataList.value.push({ id: inx, cont: "内容+" + inx })
}
</script>

<style lang='scss' scoped>
.test {
    position: relative;
    width: 100%;
    .add-btn {
        position: absolute;
        right: 20px;
        top: 20px;
        z-index: 888;
    }
}
</style>