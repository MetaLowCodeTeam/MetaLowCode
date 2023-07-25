<template>
    <mlSingleList
        :title="pageType[type].title"
        mainEntity="ApprovalTask"
        fieldsList="approvalTaskId,approvalConfigId,entityId,approvalOn,remark,approvalStatus"
        :sortFields="sortFields"
        fieldName="approvalConfigId.flowName"
        :tableColumn="tableColumn"
    >
        <template #activeRow>
            <el-table-column label="操作" :align="'center'" width="100">
                <template #default="scope">
                    <el-button size="small" @click="approveRow(scope.row)">审批</el-button>
                </template>
            </el-table-column>
        </template>
    </mlSingleList>
    <mlApprove v-model="approveDialogIsShow" :taskId="approvalTaskId" title="审批" />
</template>
  
<script setup>
import { reactive, ref, inject } from "vue";
import { $fromNow } from "@/utils/util";
import mlApprove from "@/components/mlApprove/index.vue";

const props = defineProps({
    type: { type: String, default: "" },
});
let pageType = reactive({
    handle: {
        title: "待我处理",
    },
    submit: {
        title: "我提交的",
    },
    cc: {
        title: "抄送我的",
    },
});

// 审核弹框是否显示
let approveDialogIsShow = ref(false);
// 审批任务Id
let approvalTaskId = ref("");
// 默认排序
let sortFields = ref([
    {
        fieldName: "modifiedOn",
        type: "DESC",
    },
]);

let tableColumn = ref([
    {
        prop: "approvalConfigId.flowName",
        label: "流程名称",
    },
    {
        prop: "entityId.name",
        label: "关联记录",
    },
    {
        prop: "approvalStatus.label",
        label: "审批状态",
        width: "150",
        align: "center",
        formatter: (row) => {
            return row.approvalStatus.label;
        },
    },
    {
        prop: "approver",
        label: "最近审核人",
    },
    {
        prop: "remark",
        label: "最近审批备注",
    },
    {
        prop: "approvalOn",
        label: "最近审批时间",
        width: "120",
        align: "center",
        formatter: (row) => {
            return $fromNow(row.approvalOn);
        },
    },
]);

function approveRow(row) {
    approveDialogIsShow.value = true;
    approvalTaskId.value = row.approveDialogIsShow;
}
</script>
<style lang="scss">
</style>