
<template>
    <div class="pivot-table-widget" @click.stop="setSelected">
        <div class="table-box">
            <el-table
                size="small"
                :data="tableData"
                :border="true"
                style="width: 100%"
                :max-height="320"
            >
                <el-table-column prop="date" label="Date" width="180" />
                <el-table-column prop="name" label="Name" width="180" />
                <el-table-column prop="address" label="Address" show-overflow-tooltip />
            </el-table>
        </div>
    </div>
</template>

<script setup>
defineOptions({
    name: "listTable-widget",
});
const props = defineProps({
    field: Object,
    designer: Object,
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

const setSelected = () => {
    props.designer?.setSelected(props.field);
};
</script>

<style lang="scss" scoped>
.pivot-table-widget {
    height: 100%;
    width: 100%;
    .table-box {
        width: 100%;
        height: 100%;
    }
}
</style>