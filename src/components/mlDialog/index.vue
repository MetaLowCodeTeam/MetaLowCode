<template>
    <el-dialog
        class="mldialog"
        :append-to-body="appendToBody"
        :width="width"
        v-model="isShow"
        :show-close="false"
        @close="close"
        :close-on-click-modal="closeOnClickModal"
    >
        <template #header>
            <span class="my-title">{{ title }}</span>
            <span class="fr close-icon" @click="close">
                <el-icon size="20">
                    <ElIconClose />
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
onMounted(() => {
    isShow.value = props.modelValue;
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
</script>

<style>
</style>