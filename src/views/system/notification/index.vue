<template>
    <mlSingleList
        title="消息中心"
        mainEntity="Notification"
        fieldsList="fromUser,unread,type,relatedRecord,message,createdOn"
        :sortFields="sortFields"
        fieldName="message"
        :tableColumn="tableColumn"
        :filterItems="filterItems"
        queryUrl="/note/listQuery"
    >
        <template #activeRow>
            <el-table-column label="操作" :align="'center'" width="100">
                <template #default="scope">
                    <el-button type="primary" size="small" @click="activeRow(scope.row)">查看</el-button>
                </template>
            </el-table-column>
        </template>
    </mlSingleList>
</template>
   
<script setup>
import { ref, inject } from "vue";
import { $fromNow } from "@/utils/util";
const COMMON_CONFIG = inject("COMMON_CONFIG");
const $ElMessage = inject("$ElMessage");
const $TOOL = inject("$TOOL");

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
        fieldName: "toUser",
        op: "EQ",
        value: $TOOL.data.get("USER_INFO").userId,
    },
]);
let tableColumn = ref([
    {
        prop: "message",
        label: "消息",
    },
    {
        prop: "relatedRecord.name",
        label: "相关记录",
    },
    {
        prop: "fromUser.name",
        label: "发送人",
        width: "120",
        align: "center",
    },
    {
        prop: "type",
        label: "消息分类",
        width: "120",
        align: "center",
        formatter: (row) => {
            return COMMON_CONFIG.notificationType[row.type];
        },
    },
    {
        prop: "unread",
        label: "是否已读",
        width: "100",
        align: "center",
        formatter: (row) => {
            return row.unread ? "否" : "是";
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

function activeRow(row) {
    $ElMessage.info("点击了查看");
}
</script>
<style>
</style>