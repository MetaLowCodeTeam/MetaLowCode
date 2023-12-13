<template>
    <!--  -->
    <mlSingleList
        title="数据库备份"
        mainEntity="BackupDatabase"
        fieldsList="createdOn,createdBy,database,backupFile,state,errorLog,overdue"
        :sortFields="sortFields"
        fieldName="database"
        :tableColumn="tableColumn"
        :filterItems="filterItems"
        ref="mlSingleListRef"
    >
        <template #addbutton>
            <el-button type="primary" @click="backupDB">
                <span class="ml-5">立即备份</span>
            </el-button>
        </template>
    </mlSingleList>
    <!-- 异常执行弹框 -->
    <ml-dialog title="异常执行日志" v-model="errorLogDialog.isShow" width="80%">
        <div class="errorlog-box">{{ errorLogDialog.log }}</div>
    </ml-dialog>
</template>
   
<script setup>
import { ref } from "vue";
import { postBackupDB } from "@/api/system-manager";
import { ElMessage } from "element-plus";
// 默认排序
let sortFields = ref([
    {
        fieldName: "modifiedOn",
        type: "DESC",
    },
]);
// 过滤条件
let filterItems = ref([
    {
        fieldName: "createdOn",
        op: "LK",
        value: "",
    },
]);
let tableColumn = ref([
    {
        prop: "createdOn",
        label: "备份时间",
        align: "center",
        formatter: (row) => {
            return row.createdOn;
        },
    },
    {
        prop: "database",
        label: "库名",
        align: "center",
    },
    {
        prop: "backupFile",
        label: "备份文件",
        align: "center",
        columnType: "File",
    },

    {
        prop: "state",
        label: "备份状态",
        align: "center",
        width: "100",
        elTag: true,
        styleFn: (row) => {
            return {
                cursor: row.state ? "initial" : "pointer",
            };
        },
        formatter: (row) => {
            return {
                type: row.state ? "success" : "danger",
                label: row.state ? "成功" : "失败",
            };
        },
        clickFn: (row) => {
            if (!row.state) {
                errorLogDialog.value.log = row.errorLog || "未查询到日志";
                errorLogDialog.value.isShow = true;
            }
        },
    },
    {
        prop: "overdue",
        label: "是否过期",
        align: "center",
        width: "100",
        elTag: true,
        formatter: (row) => {
            return {
                type: row.overdue ? "info" : "success",
                label: row.state ? (row.overdue ? "已过期" : "未过期") : "",
            };
        },
    },
    {
        prop: "createdBy",
        label: "创建用户",
        width: "150",
        align: "center",
        formatter: (row) => {
            return row.createdBy?.name;
        },
    },
]);
/**
 * 异常执行日志
 */
let errorLogDialog = ref({
    isShow: false,
    log: "",
});

/**
 * 立即备份
 */
let mlSingleListRef = ref();
const backupDB = async () => {
    mlSingleListRef.value.loading = true;
    let res = await postBackupDB();
    if (res && res.code == 200) {
        ElMessage.success("备份成功");
    }
    mlSingleListRef.value.getTableList();
};
</script>
<style lang="scss" scoped>
.errorlog-box {
    background: #181818;
    height: 500px;
    overflow: auto;
    padding: 10px 20px;
    color: #ccc;
    line-height: 18px;
    font-size: 16px;
    border-radius: 4px;
    &::-webkit-scrollbar {
        /*滚动条整体样式*/
        width: 10px;
        /*高宽分别对应横竖滚动条的尺寸*/
        height: 10px;
    }

    &::-webkit-scrollbar-thumb {
        /*滚动条里面小方块*/
        border-radius: 10px;
        background-color: var(--el-color-primary);
        background-image: -webkit-linear-gradient(
            45deg,
            rgba(255, 255, 255, 0.2) 25%,
            transparent 25%,
            transparent 50%,
            rgba(255, 255, 255, 0.2) 50%,
            rgba(255, 255, 255, 0.2) 75%,
            transparent 75%,
            transparent
        );
    }

    &::-webkit-scrollbar-track {
        /*滚动条里面轨道*/
        box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
        background: #ededed;
        border-radius: 10px;
    }
}
</style>