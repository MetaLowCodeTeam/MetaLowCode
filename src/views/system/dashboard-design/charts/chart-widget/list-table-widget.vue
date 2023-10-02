
<template>
    <div class="pivot-table-widget">
        <div class="table-box">
            <el-table :data="tableData" :border="true" style="width: 100%" :max-height="320">
                <el-table-column prop="date" label="Date" width="180" />
                <el-table-column prop="name" label="Name" width="180" />
                <el-table-column prop="address" label="Address" />
            </el-table>
        </div>
        <div class="page-box">分页</div>
    </div>
</template>

<script setup>
defineOptions({
    name: "listTable-widget",
});
const tableData = [
    {
        date: "2016-05-03",
        name: "Tom",
        state: "California",
        city: "Los Angeles",
        address: "No. 189, Grove St, Los Angeles",
        zip: "CA 90036",
    },
];
</script>

<style lang="scss" scoped>
.pivot-table-widget {
    height: 100%;
    width: 100%;
    .table-box {
        width: 100%;
        height: calc(100% - 30px);
    }
    .page-box {
        height: 30px;
        // background: green;
    }
}
</style>