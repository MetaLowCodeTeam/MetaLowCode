<template>
    <!--  -->
    <mlSingleList
        title="触发器日志"
        mainEntity="TriggerLog"
        fieldsList="actionType,triggerReason,recordId,executeFlag,triggerConfigId,createdOn,errorLog"
        :sortFields="sortFields"
        fieldName="triggerConfigId.name"
        :tableColumn="tableColumn"
        queryUrl="/plugins/metaTrigger/trigger/log"
        @highlightClick="highlightClick"
        :filterItems="filterItems"
    ></mlSingleList>
    <Detail ref="detailRefs" />
    <!-- 异常执行弹框 -->
    <ml-dialog title="异常执行日志" v-model="errorLogDialog.isShow" width="80%">
        <div class="errorlog-box">{{ errorLogDialog.log }}</div>
    </ml-dialog>
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
        value: "",
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
        styleFn: (row) => {
            return {
                cursor: row.executeFlag ? "initial" : "pointer",
            };
        },
        formatter: (row) => {
            return {
                type: row.executeFlag ? "success" : "danger",
                label: row.executeFlag ? "成功" : "失败",
            };
        },
        clickFn: (row) => {
            if (!row.executeFlag) {
                errorLogDialog.value.log = row.errorLog || "未查询到日志";
                errorLogDialog.value.isShow = true;
            }
        },
    },

    {
        prop: "createdOn",
        label: "创建时间",
        width: "160",
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
    detailRefs.value.openDialog(item.recordId.id);
};

/**
 * 异常执行日志
 */
let errorLogDialog = ref({
    isShow: false,
    log: "",
});
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