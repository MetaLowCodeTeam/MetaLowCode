<template>
    <el-pagination
        :total="total"
        :current-page="no"
        :page-size="sizes"
        :layout="layout"
        :style="{'justify-content': algin}"
        @current-change="pageChange"
    />
</template>

<script setup>
const props = defineProps({
    total: { type: Number, default: 0 },
    no: { type: Number, default: 1 },
    sizes: { type: Number, default: 10 },
    layout: { type: String, default: "total, prev, pager, next" },
    algin: { type: String, default: "center" },
});
const emit = defineEmits(["pageChange"]);
const pageChange = (v) => {
    emit("pageChange", v);
};
</script>

<style>
</style>