<template>
    <div class="ml-input-box">
        <el-input
            class="ml-input-search"
            v-model="keyword"
            :placeholder="placeholder"
            @keyup.enter="confirm"
            clearable
            @clear="confirm"
        >
            <template #append>
                <el-button @click="confirm">
                    <el-icon>
                        <ElIconSearch />
                    </el-icon>
                </el-button>
            </template>
        </el-input>
    </div>
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
.ml-input-box {
    display: inline-block;
    min-width: 240px;
}
</style>