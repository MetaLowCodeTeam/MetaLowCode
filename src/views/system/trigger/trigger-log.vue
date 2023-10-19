<template>
    <!--  -->
    <mlSingleList
        title="触发器日志"
        mainEntity="TriggerLog"
        fieldsList="actionType,triggerReason,recordId,executeFlag,triggerConfigId,createdOn"
        :sortFields="sortFields"
        fieldName="triggerConfigId.name"
        :tableColumn="tableColumn"
        queryUrl="/plugins/metaTrigger/trigger/log"
        @highlightClick="highlightClick"
        :filterItems="filterItems"
    >
        <!-- <template #addbutton>
            <el-button type="primary" @click="markAllRead">全部设为已读</el-button>
        </template>
        <template #activeRow>
            <el-table-column label="操作" :align="'center'" width="100" fixed="right">
                <template #default="scope">
                    <el-button type="primary" size="small" link @click="activeRow(scope.row)">查看</el-button>
                </template>
            </el-table-column>
        </template>-->
    </mlSingleList>
    <Detail ref="detailRefs" />
</template>
   
<script setup>
import { ref } from "vue";
import { $fromNow } from "@/utils/util";
import Detail from "@/views/customize-menu/detail.vue";
// 默认排序
let sortFields = ref([
    {
        fieldName: "createdOn",
        type: "DESC",
    },
]);
// 过滤条件
let filterItems = ref([
    {
        fieldName: "triggerReason",
        op: "LK",
        value:"",
    },
]);
let tableColumn = ref([
    {
        prop: "triggerConfigId",
        label: "触发器名称",
        align: "center",
        formatter: (row) => {
            return row.triggerConfigId?.name;
        },
    },
    {
        prop: "actionType",
        label: "类型",
        align: "center",
        formatter: (row) => {
            return row.actionType?.label;
        },
    },
    {
        prop: "triggerReason",
        label: "触发原因",
        align: "center",
    },
    {
        prop: "recordId",
        label: "关联实体",
        align: "center",
        highlight: true,
        formatter: (row) => {
            return row.recordId?.name;
        },
    },
    {
        prop: "executeFlag",
        label: "执行结果",
        align: "center",
        width: "100",
        elTag: true,
        formatter: (row) => {
            return {
                type: row.executeFlag ? "success" : "danger",
                label: row.executeFlag ? "成功" : "失败",
            };
        },
    },

    {
        prop: "createdOn",
        label: "创建时间",
        width: "120",
        align: "center",
        formatter: (row) => {
            return $fromNow(row.createdOn);
        },
    },
]);
// 详情组件
let detailRefs = ref("");
// 高亮字段点击
const highlightClick = (item) => {
    let detailObj = {};
    detailObj.tab = {};
    detailObj.detailId = item.recordId.id;
    detailObj.detailTitle = item.recordId.name;
    detailRefs.value.openDialog(detailObj);
};
</script>
<style>
</style>