<template>
    <el-dialog
        class="mldialog"
        :append-to-body="appendToBody"
        :width="isFullSceen ? '100%' : width"
        v-model="isShow"
        :show-close="false"
        @close="close"
        :close-on-click-modal="closeOnClickModal"
        :class="{'not-header':notHeader,'isFullSceen':isFullSceen}"
        :top="isFullSceen ? '0' : top"
        v-if="isShow"
        :draggable="draggable"
    >
        <template #header>
            <span class="my-title">{{ title }}</span>
            <span class="fr close-icon" @click="close" v-if="showClose">
                <el-icon size="20">
                    <ElIconClose />
                </el-icon>
            </span>

            <span class="fr full-screen-icon" @click="onFullSceen" v-if="showFullSceen">
                <el-icon size="20">
                    <ElIconFullScreen />
                </el-icon>
            </span>
        </template>
        <slot></slot>
        <template #footer v-if="isShowFooter">
            <slot name="footer"></slot>
        </template>
    </el-dialog>
</template>

<script setup>
import { useSlots, watch, ref, reactive, onMounted } from "vue";
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
    showFullSceen: { type: Boolean, default: false },
    // 自动全屏
    autoFullScreen: { type: Boolean, default: false },
});
const emit = defineEmits(["update:modelValue"]);
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
let isFullSceen = ref(false);
onMounted(() => {
    isShow.value = props.modelValue;
    if(props.autoFullScreen){
        isFullSceen.value = true;
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
const onFullSceen = () => {
    isFullSceen.value = !isFullSceen.value;
};
</script>

<style>
</style>