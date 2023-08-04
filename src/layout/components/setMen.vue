<template>
    <mlDialog title="设置导航菜单" v-model="isShow" width="680px">
        <div>设置菜单</div>
    </mlDialog>
</template>

<script setup>
import { watch, ref, onMounted, inject } from "vue";
const props = defineProps({
    modelValue: null,
});
const emit = defineEmits(["update:modelValue"]);
const $ElMessage = inject("$ElMessage");

let isShow = ref(false);
let loading = ref(false);
watch(
    () => props.modelValue,
    () => {
        isShow.value = props.modelValue;
    },
    { deep: true }
);
watch(
    () => isShow.value,
    (v) => {
        emit("update:modelValue", v);
    },
    { deep: true }
);
onMounted(() => {
    isShow.value = props.modelValue;
    // getApprovalTaskById();
    getMenuFn();
});

function getMenuFn() {
    console.log("获取导航菜单");
}
</script>

<style>
</style>