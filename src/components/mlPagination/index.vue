<template>
    <div class="table-footer" :class="{'bottom':bottom}">
        <el-pagination
            :total="total"
            :current-page="no"
            :page-size="size"
            :layout="layout"
            :style="{'justify-content': algin}"
            @current-change="pageChange"
            :page-sizes="pageSizes"
            @size-change="handleSizeChange"
        />
    </div>
</template>

<script setup>
const props = defineProps({
    total: { type: Number, default: 0 },
    no: { type: Number, default: 1 },
    size: { type: Number, default: 20 },
    layout: {
        type: String,
        default: "total, prev, pager, next, jumper, sizes",
    },
    algin: { type: String, default: "center" },
    pageSizes: {
        type: Array,
        default: () => [20, 40, 80, 100, 200, 300, 400, 500],
    },
    bottom: { type: Boolean, default: true },
});
const emit = defineEmits(["pageChange", "handleSizeChange"]);
const pageChange = (v) => {
    emit("pageChange", v);
};
const handleSizeChange = (v) => {
    emit("handleSizeChange", v);
};
</script>

<style lang="scss" scoped>
.table-footer {
    height: 41px;
    line-height: 41px;
    border: 1px solid #ebeef5;
    border-top: 0;
    padding: 0 12px;
    font-size: 13px;
    color: #616161;
    justify-content: center;
    width: 100%;
    z-index: 2001;
    box-sizing: border-box;
    &.bottom {
        position: absolute;
        left: 0;
        bottom: 0;
    }
}
</style>