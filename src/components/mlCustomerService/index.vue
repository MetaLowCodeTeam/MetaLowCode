<template>
    <!--  -->
    <div ref="el" :style="style" style="position: fixed; user-select: none; z-index: 2002;">
        <div class="customer-service" @click="open" title="咨询美乐客服">
            <div class="icon-img" title="咨询美乐客服"></div>
        </div>
    </div>
</template>

<script setup>
import { useDraggable, useWindowSize } from "@vueuse/core";
import { ref } from "vue";
const el = ref(null);
const { width, height } = useWindowSize();
const startTime = ref(0);
const endTime = ref(0);
const { x, y, style } = useDraggable(el, {
    initialValue: { x: width.value - 100, y: height.value - 100 },
    onStart: () => {
        startTime.value = new Date().getTime();
    },
    onMove: (position) => {
        if (position.x > width.value - 100) {
            position.x = width.value - 100;
        }
        if (position.x < 0) {
            position.x = 0;
        }
        if (position.y > height.value - 100) {
            position.y = height.value - 100;
        }
        if (position.y < 0) {
            position.y = 0;
        }
    },
    onEnd: (position) => {
        endTime.value = new Date().getTime();
    },
});
const open = () => {
    if (endTime.value - startTime.value < 200) {
        openCustomer();
    }
};

const openCustomer = () => {
    window.open("https://work.weixin.qq.com/kfid/kfcfca8a575ba007578");
};
</script>
<style lang='scss' scoped>
.customer-service {
    border: 1px solid var(--el-color-primary);
    // background: var(--el-color-primary);
    background: #F4F4F5;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    .icon-img {
        width: 24px;
        height: 24px;
        // display: block;
        background: url("@/assets/imgs/logo.png") no-repeat center center;
        background-size: 100% 100%;
    }
}
</style>

