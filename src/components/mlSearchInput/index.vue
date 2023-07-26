<template>
    <el-input
        class="ml-input-search"
        v-model="keyword"
        :placeholder="placeholder"
        @keyup.enter="confirm"
    >
        <template #suffix>
            <span class="el-input__icon" @click="confirm">
                <el-icon>
                    <ElIconSearch />
                </el-icon>
            </span>
        </template>
    </el-input>
</template>

<script setup>
import { onMounted, ref, watch } from "vue";

const props = defineProps({
    modelValue: null,
    placeholder: { type: String, defalut: "" },
});
const emit = defineEmits(["update:modelValue", "confirm"]);
let keyword = ref("");
watch(
    () => props.modelValue,
    () => {
        keyword.value = props.modelValue;
    },
    { deep: true }
);
onMounted(() => {
    keyword.value = props.modelValue;
});
const confirm = () => {
    emit("update:modelValue", keyword.value);
    emit("confirm");
};
</script>

<style lang="scss" scoped>
.el-input__icon {
    cursor: pointer;
}
</style>