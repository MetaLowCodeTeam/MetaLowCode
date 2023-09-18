<template>
    <mlDialog title="图标选择器" append-to-body width="37%" v-model="dialogIsShow">123</mlDialog>
</template>

<script setup>
import { onMounted, ref, watch } from "vue";
const props = defineProps({
    modelValue: null,
});
let dialogIsShow = ref(false);
watch(
    () => props.modelValue,
    () => {
        dialogIsShow.value = props.modelValue;
    },
    { deep: true }
);
onMounted(() => {
    dialogIsShow.value = props.modelValue;
});
</script>

<style>
</style>