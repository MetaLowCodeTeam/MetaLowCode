<!--
 * @Descripttion: 局部水印组件
 * @version: 1.1
 * @Author: sakuya
 * @Date: 2021年12月18日12:16:16
 * @LastEditors: sakuya
 * @LastEditTime: 2022年1月5日09:52:59
-->

<template>
    <div class="ml-water-mark" ref="mlWaterMarkRefs">
        <slot></slot>
    </div>
</template>

<script setup>
import { inject, onMounted, ref, watchEffect } from "vue";
import useCommonStore from "@/store/modules/common";
import { storeToRefs } from "pinia";
const { publicSetting } = storeToRefs(useCommonStore());
const props = defineProps({
    waterMarkConf: {
        type: Object,
        default: () => ({
            open: false,
            wmTitle: "",
            wmSubTitle: "",
            wmColor: "",
            wmOpacity: "",
            wmRotationAngle: "",
        })
    }
})
const $TOOL = inject("$TOOL");
// 水印组件
let mlWaterMarkRefs = ref();
// 水印大标题
let title = ref("");
// 水印小标题
let subTitle = ref("");
// 水印文本颜色
let color = ref("rgba(128,128,128,0.2)");
// 水印文本深度
let opacity = ref("0.6");
onMounted(() => {
    title.value = $TOOL.data.get("USER_INFO")?.userName;
    subTitle.value = publicSetting.value.APP_NAME;
    let APP_WATERMARK = publicSetting.value.APP_WATERMARK;
    if ((APP_WATERMARK && APP_WATERMARK != "false")) {
        create(title.value, subTitle.value);
    } else {
        clear();
    }
});


/**
 * 创建水印
 * @param {*} title 大标题
 * @param {*} subTitle 小标题
 * @param {*} color 颜色
 * @param {*} opacity 透明度
 * @param {*} rotationAngle 旋转角度
 */
const create = (title, subTitle, color, opacity, rotationAngle) => {
    clear();
    //创建画板
    var canvas = document.createElement("canvas");
    canvas.width = 150;
    canvas.height = 150;
    canvas.style.display = "none";
    //绘制文字
    var text = canvas.getContext("2d");
    text.rotate(((rotationAngle || -45) * Math.PI) / 180);
    text.translate(-75, 25);
    text.fillStyle = color || "rgba(128,128,128,0.2)";
    text.font = "bold 20px SimHei";
    text.textAlign = "center";
    text.fillText(title, canvas.width / 2, canvas.height / 2);
    text.font = "14px Microsoft YaHei";
    text.fillText(subTitle, canvas.width / 2, canvas.height / 2 + 20);
    //创建水印容器
    var watermark = document.createElement("div");
    watermark.setAttribute("class", "watermark");
    const styleStr = `opacity: ${
        opacity || "0.4"
    };position:absolute;top:0;left:0;right:0;bottom:0;z-index:99;pointer-events:none;background-repeat:repeat;background-image:url('${canvas.toDataURL(
        "image/png"
    )}');`;
    watermark.setAttribute("style", styleStr);
    mlWaterMarkRefs.value.appendChild(watermark);
};
// 清楚
const clear = () => {
    var wmDom = mlWaterMarkRefs.value.querySelector(".watermark");
    wmDom && wmDom.remove();
};

// watchEffect(() => {
//         let {   
//             wmTitle,
//             wmSubTitle,
//             wmColor,
//             wmOpacity,
//             wmRotationAngle,
//             open
//         } = props.waterMarkConf
//         if(open) {
//             clear();
//             create(wmTitle, wmSubTitle, wmColor, wmOpacity, wmRotationAngle);
//         }
        
// })

</script>

<style scoped>
.ml-water-mark {
    position: relative;
    display: inherit;
    width: 100%;
    height: 100%;
}
</style>
