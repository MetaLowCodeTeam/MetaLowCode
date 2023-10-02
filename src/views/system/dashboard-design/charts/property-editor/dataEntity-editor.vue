<template>
    <el-form-item label="图表数据实体">
        <el-select v-model="optionModel.dataEntity" filterable placeholder="选择实体">
            <el-option
                v-for="item in options"
                :key="item.value"
                :label="item.label"
                :value="item.value"
            />
        </el-select>
    </el-form-item>
</template>
<script setup>
defineOptions({
    name: "dataEntity-editor",
});
const props = defineProps({
    designer: Object,
    selectedWidget: Object,
    optionModel: Object,
});
import { ref } from "vue";
let options = ref([
    {
        label: "实体1",
        value: "code1",
    },
    {
        label: "实体2",
        value: "code2",
    },
    {
        label: "实体3",
        value: "code3",
    },
    {
        label: "实体4",
        value: "code4",
    },
    {
        label: "实体5",
        value: "code5",
    },
]);
</script>
<style lang="scss" scoped>
</style>
