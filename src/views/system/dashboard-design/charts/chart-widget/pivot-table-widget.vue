<template>
    <div class="pivot-table-widget">
        <div class="table-box">
            <el-scrollbar>
                <el-table :data="tableData" style="width: 100%;" height="300px">
                    <el-table-column prop="date" label="Date" width="150" />
                    <el-table-column label="Delivery Info">
                        <el-table-column prop="name" label="Name" width="120" />
                        <el-table-column label="Address Info">
                            <el-table-column prop="state" label="State" width="120" />
                            <el-table-column prop="city" label="City" width="120" />
                            <el-table-column prop="address" label="Address" />
                            <el-table-column prop="zip" label="Zip" width="120" />
                        </el-table-column>
                    </el-table-column>
                </el-table>
            </el-scrollbar>
        </div>
        <div class="page-box">分页</div>
    </div>
</template>

<script setup>
defineOptions({
    name: "pivotTable-widget",
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
    {
        date: "2016-05-02",
        name: "Tom",
        state: "California",
        city: "Los Angeles",
        address: "No. 189, Grove St, Los Angeles",
        zip: "CA 90036",
    },
    {
        date: "2016-05-04",
        name: "Tom",
        state: "California",
        city: "Los Angeles",
        address: "No. 189, Grove St, Los Angeles",
        zip: "CA 90036",
    },
    {
        date: "2016-05-01",
        name: "Tom",
        state: "California",
        city: "Los Angeles",
        address: "No. 189, Grove St, Los Angeles",
        zip: "CA 90036",
    },
    {
        date: "2016-05-08",
        name: "Tom",
        state: "California",
        city: "Los Angeles",
        address: "No. 189, Grove St, Los Angeles",
        zip: "CA 90036",
    },
    {
        date: "2016-05-06",
        name: "Tom",
        state: "California",
        city: "Los Angeles",
        address: "No. 189, Grove St, Los Angeles",
        zip: "CA 90036",
    },
    {
        date: "2016-05-07",
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