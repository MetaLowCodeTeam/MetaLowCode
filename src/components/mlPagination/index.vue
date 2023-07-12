<template>
    <div class="table-footer">
        <el-pagination
            :total="total"
            :current-page="no"
            :page-size="sizes"
            :layout="layout"
            :style="{'justify-content': algin}"
            @current-change="pageChange"
        />
    </div>
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

<style lang="scss" scoped>
.table-footer {
    height: 41px;
    line-height: 41px;
    background: #f7f7f7;
    border: 1px solid #ebeef5;
    border-top: 0;
    padding: 0 12px;
    font-size: 13px;
    color: #616161;
    justify-content: center;
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
}
</style>