<template>
    <el-dialog
        class="ml-dialog"
        :append-to-body="appendToBody"
        :width="isFullScreen ? '100%' : width"
        v-model="isShow"
        :show-close="false"
        @close="close"
        :close-on-click-modal="closeOnClickModal"
        :class="{
            'not-header':notHeader,
            'isFullScreen':isFullScreen,
            'has-footer': isShowFooter,
            'body-no-padding':bodyNoPadding
        }"
        :top="isFullScreen ? '0' : top"
        v-if="isShow"
        :draggable="isFullScreen ? false : true"
    >
        <template #header>
            <span class="my-title">{{ title }}</span>
            <span class="fr close-icon" @click="close" v-if="showClose">
                <el-icon size="20">
                    <ElIconClose />
                </el-icon>
            </span>

            <span class="fr full-screen-icon" @click="onFullScreen" v-if="showFullScreen">
                <el-icon size="20">
                    <ElIconFullScreen />
                </el-icon>
            </span>
        </template>
        <ml-scrollbar 
            class="ml-dialog-body" 
            :height="scrollbarHeight" 
            :min-height="scrollbarMinHeight" 
            :max-height="scrollbarMaxHeight"
        >
            <slot></slot>
        </ml-scrollbar>
        <template #footer v-if="isShowFooter">
            <slot name="footer"></slot>
        </template>
    </el-dialog>
</template>

<script setup>
import { useSlots, watch, ref, reactive, onMounted } from "vue";
// 滚动条
import mlScrollbar from "@/components/mlScrollbar/index.vue";
const props = defineProps({
    modelValue: null,
    title: { type: String, defalut: "" },
    appendToBody: { type: Boolean, default: false },
    width: { type: String, default: "50%" },
    closeOnClickModal: { type: Boolean, default: false },
    notHeader: { type: Boolean, default: false },
    top: { type: String, default: "15vh" },
    // 拖拽
    draggable: { type: Boolean, default: false },
    // 关闭
    showClose: { type: Boolean, default: true },
    // 全屏
    showFullScreen: { type: Boolean, default: false },
    // 自动全屏
    autoFullScreen: { type: Boolean, default: false },
    // body没有内边距
    bodyNoPadding: { type: Boolean, default: false },
    // 滚动条高度
    scrollbarHeight: { type: String, default: "" },
    // 滚动条最小高度
    scrollbarMinHeight: { type: String, default: "" },
    // 滚动条最大高度
    scrollbarMaxHeight: { type: String, default: "" },
});
const emit = defineEmits(["update:modelValue", 'fullScreenChange']);
watch(
    () => props.modelValue,
    () => {
        isShow.value = props.modelValue;
    },
    { deep: true }
);


// 弹框是否显示
let isShow = ref(null);
// 弹框footer是否显示
let isShowFooter = ref(false);
// 嵌入内容
let contentSlots = reactive({});
// 是否全屏
let isFullScreen = ref(false);
onMounted(() => {
    isShow.value = props.modelValue;
    if(props.autoFullScreen){
        isFullScreen.value = true;
    }
    contentSlots = useSlots();
    if (contentSlots.footer) {
        isShowFooter.value = true;
    }
});
// 关闭弹框
const close = () => {
    isShow.value = false;
    emit("update:modelValue", isShow.value);
};
// 全屏切换
const onFullScreen = () => {
    isFullScreen.value = !isFullScreen.value;
    emit('fullScreenChange', isFullScreen.value)
};
</script>

<style>
</style>