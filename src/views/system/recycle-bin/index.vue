<template>
    <mlSingleList
        title="回收站"
        mainEntity="RecycleBin"
        fieldsList="entityCode,entityId,entityName,deletedBy,deletedOn,deletedWith,restoreBy,restoreOn"
        :sortFields="sortFields"
        fieldName="entityName"
        :tableColumn="tableColumn"
        ref="mlSingleListRef"
        queryUrl="/rb/listQuery"
    >
        <template #activeRow>
            <el-table-column label="恢复状态" :align="'center'" width="100">
                <template #default="scope">
                    <el-tag
                        type="success"
                        v-if="scope.row.restoreBy && !!scope.row.restoreBy.name"
                    >已恢复</el-tag>
                    <el-tag type="info" v-else>未恢复</el-tag>
                </template>
            </el-table-column>
            <el-table-column label="操作" fixed="right" :align="'center'" width="100">
                <template #default="scope">
                    <el-button
                        :disabled="scope.row.restoreBy && !!scope.row.restoreBy.name"
                        size="small"
                        type="primary"
                        link
                        @click="activeRow(scope.row)"
                    >恢复</el-button>
                </template>
            </el-table-column>
        </template>
    </mlSingleList>
</template>
   
<script setup>
import { ref, inject } from "vue";
import { $fromNow } from "@/utils/util";
import { ElMessageBox } from "element-plus";
import http from "@/utils/request";
const $ElMessage = inject("$ElMessage");
import useCommonStore from "@/store/modules/common";
import { storeToRefs } from "pinia";
const { entityLable } = storeToRefs(useCommonStore());
let mlSingleListRef = ref("");

// 默认排序
let sortFields = ref([
    {
        fieldName: "deletedOn",
        type: "DESC",
    },
    {
        fieldName: "recycleBinId",
        type: "ASC",
    },
]);
let tableColumn = ref([
    {
        prop: "entityName",
        label: "数据名称",
    },
    {
        prop: "entityCode",
        label: "实体名称",
        width: "150",
        align: "center",
        formatter: (row) => {
            return entityLable.value[row.entityCode];
        },
    },
    {
        prop: "deletedWith",
        label: "删除渠道",
        width: "150",
        align: "center",
    },
    {
        prop: "deletedOn",
        label: "删除时间",
        width: "150",
        align: "center",
        formatter: (row) => {
            return $fromNow(row.deletedOn);
        },
    },
    {
        prop: "deletedBy.name",
        label: "删除人",
        width: "150",
        align: "center",
    },
    {
        prop: "restoreOn",
        label: "恢复时间",
        width: "150",
        align: "center",
        formatter: (row) => {
            return $fromNow(row.restoreOn);
        },
    },
    {
        prop: "restoreBy.name",
        label: "恢复人",
        width: "150",
        align: "center",
    },
]);

function activeRow(row) {
    ElMessageBox.confirm("是否确认恢复?", "提示：", {
        confirmButtonText: "确认",
        cancelButtonText: "取消",
        type: "warning",
    })
        .then(async () => {
            mlSingleListRef.value.loading = true;
            let res = await http.post("/rb/restore?id=" + row.entityId);
            if (res) {
                $ElMessage.success("恢复成功");
                mlSingleListRef.value.getTableList();
            } 
            mlSingleListRef.value.loading = false;
        })
        .catch(() => {});
}
</script>
<style>
</style>