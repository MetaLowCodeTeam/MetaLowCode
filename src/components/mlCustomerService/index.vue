<template>
    <!--  -->
    <div ref="el" :style="style" style="position: fixed; user-select: none;">
        <div class="customer-service" @click="open" title="咨询客服">
            <SvgIcon icon-name="customer-service" size="36" title="咨询客服" />
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
    background: var(--el-color-primary);
    width: 50px;
    height: 50px;
    line-height: 50px;
    border-radius: 50%;
    text-align: center;
    cursor: pointer;
}
</style>
