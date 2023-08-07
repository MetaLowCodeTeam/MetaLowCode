<template>
    <mlSingleList
        title="回收站"
        mainEntity="RecycleBin"
        fieldsList="entityId,entityName,deletedBy,deletedOn,deletedWith,restoreBy,restoreOn"
        :sortFields="sortFields"
        fieldName="entityName"
        :tableColumn="tableColumn"
        ref="mlSingleListRef"
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
            <el-table-column label="操作" :align="'center'" width="100">
                <template #default="scope">
                    <el-button
                        :disabled="scope.row.restoreBy && !!scope.row.restoreBy.name"
                        size="small"
                        type="primary"
                        @click="activeRow(scope.row)"
                    >恢复</el-button>
                </template>
            </el-table-column>
        </template>
    </mlSingleList>
</template>
   
<script setup>
import { ref,inject } from "vue";
import { $fromNow } from "@/utils/util";
import { ElMessageBox } from "element-plus";
import http from "@/utils/request";
const $ElMessage = inject("$ElMessage");
let mlSingleListRef = ref("");




// 默认排序
let sortFields = ref([
    {
        fieldName: "deletedOn",
        type: "DESC",
    },
]);
let tableColumn = ref([
    {
        prop: "entityName",
        label: "实体名称",
    },
    {
        prop: "deletedWith",
        label: "删除渠道",
    },
    {
        prop: "deletedOn",
        label: "删除时间",
        width: "120",
        align: "center",
        formatter: (row) => {
            return $fromNow(row.deletedOn);
        },
    },
    {
        prop: "deletedBy.name",
        label: "删除人",
        width: "120",
        align: "center",
    },
    {
        prop: "restoreOn",
        label: "恢复时间",
        width: "120",
        align: "center",
        formatter: (row) => {
            return $fromNow(row.restoreOn);
        },
    },
    {
        prop: "restoreBy.name",
        label: "恢复人",
        width: "120",
        align: "center",
    },
]);

async function activeRow(row) {
    ElMessageBox.confirm("是否确认恢复?", "提示：", {
        confirmButtonText: "确认",
        cancelButtonText: "取消",
        type: "warning",
    })
        .then(async () => {
            mlSingleListRef.value.loading = true;
            let res = await http.post("/crud/restore?id=" + row.entityId);
            if (res.code === 200) {
                $ElMessage.success("恢复成功");
                mlSingleListRef.value.getTableList();
                mlSingleListRef.value.loading = false;
            } else {
                mlSingleListRef.value.loading = false;
                $ElMessage.error("恢复失败：" + res.error);
            }
        })
        .catch(() => {});
}
</script>
<style>
</style>