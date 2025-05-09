<template>
    <mlEntityMenuAndList
        :title="pageType[type].title"
        entityName="ApprovalTask"
        fieldsList="approvalTaskId,approvalConfigId,entityId,approvalOn,remark,approvalStatus,approvalConfigId.flowName,approvalUser,stepName,approvalConfigId.entityCode"
        defaultSortField="modifiedOn"
        :tableColumn="tableColumn"
        :fixedFilter="pageType[type].fixedFilter"
        ref="mlSingleListRef"
        @goDetail="highlightClick"
        fieldName="approvalConfigId.flowName"
        :queryUrl="'/approval/queryApprovalTask'"
        :approvalTaskType="pageType[type].value"
        :filterEquation="pageType[type].filterEquation"
    >
        <template #activeRow>
            <el-table-column
                label="操作"
                :align="'center'"
                width="160"
                key="1"
                v-if="type === 'handle' || type === 'cc' || type === 'approved'"
                fixed="right"
            >
                <template #default="scope">
                    <el-button
                        size="small"
                        link
                        @click="approveHistory(scope.row)"
                        type="primary"
                    >审批历史</el-button>
                    <el-button
                        link
                        :disabled="!(scope.row.approvalStatus && scope.row.approvalStatus.value === 1)"
                        size="small"
                        type="success"
                        @click="approveRow(scope.row)"
                        v-if="type != 'cc' && type != 'approved'"
                    >审批</el-button>
                </template>
            </el-table-column>
        </template>
    </mlEntityMenuAndList>
    <div v-if="approveDialogIsShow">
        <mlApprove
            v-model="approveDialogIsShow"
            :taskId="approvalTaskId"
            :entityId="entityId"
            :approvalName="approvalName"
            @confirm="confirm"
            title="审批"
        />
    </div>
    <div v-if="approvalHistoryDialog">
        <mlApproveHistory
            v-model="approvalHistoryDialog"
            :entityId="entityId"
            @confirm="confirm"
            title="审批历史"
        />
    </div>
    <Detail ref="detailRefs" />
</template>
  
<script setup>
import { reactive, ref, inject, onBeforeMount } from "vue";
import { $fromNow } from "@/utils/util";
import mlApprove from "@/components/mlApprove/index.vue";
import mlApproveHistory from "@/components/mlApproveHistory/index.vue";
import Detail from "@/views/customize-menu/detail.vue";
const $TOOL = inject("$TOOL");

const props = defineProps({
    type: { type: String, default: "" },
});
let pageType = reactive({});
let mlSingleListRef = ref("");

// 审核弹框是否显示
let approveDialogIsShow = ref(false);
// 审批任务Id
let approvalTaskId = ref("");
// 实体ID
let entityId = ref("");
// 实体CODE
let entityCode = ref("");
// 审批名称
let approvalName = ref("");
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
        formatter: (row) => {
            return row["approvalConfigId.flowName"] || row.stepName;
        },
    },
    {
        prop: "entityId.name",
        label: "关联记录",
        highlight: true,
        formatter: (row) => {
            return row.entityId?.name;
        },
    },
    {
        prop: "stepName",
        label: "审批节点",
    },
    // {
    //     prop: "remark",
    //     label: "最近审批备注",
    // },
    {
        prop: "approvalStatus.label",
        label: "审批状态",
        width: "120",
        align: "center",
        formatter: (row) => {
            return row.approvalStatus?.label;
        },
    },
    {
        prop: "approver",
        label: "最近审核人",
        width: "150",
        align: "center",
        formatter: (row) => {
            return row.approvalUser?.name;
        },
    },
    {
        prop: "approvalOn",
        label: "最近审批时间",
        width: "180",
        align: "center",
        formatter: (row) => {
            return $fromNow(row.approvalOn);
        },
    },
]);


onBeforeMount(() => {
    const USER_INFO = $TOOL.data.get("USER_INFO");
    pageType = {
        handle: {
            title: "待我处理",
            value: 1,
            filterEquation: "AND",
            fixedFilter: [
                {
                    fieldName: "approver",
                    op: "REF",
                    value: "approvalTaskId",
                    value2: USER_INFO.userId,
                },
            ],
        },
        submit: {
            title: "我提交的",
            value: 2,
            filterEquation: "AND",
            fixedFilter: [
                {
                    fieldName: "createdBy",
                    op: "EQ",
                    value: USER_INFO.userId,
                },
                {
                    fieldName: "wfProcInsId",
                    op: "DISTINCT",
                    value: "ApprovalTask",
                },
            ],
        },
        cc: {
            title: "抄送我的",
            value: 3,
            filterEquation: "AND",
            fixedFilter: [
                {
                    fieldName: "ccTo",
                    op: "REF",
                    value: "approvalTaskId",
                    value2: USER_INFO.userId,
                },
            ],
        },
        approved: {
            title: "审批过的",
            value: 4,
            filterEquation: "AND",
            fixedFilter: [
                {
                    fieldName: "approvalTaskId",
                    op: "APPROVED",
                    value: null
                },
            ],
        },
    };

    // 如果是我提交的
    if(props.type == 'submit') {
        // 删除审批节点
        tableColumn.value = tableColumn.value.filter(item => item.prop != 'stepName');
    }
});

// 审批
function approveRow(row) {
    approveDialogIsShow.value = true;
    approvalTaskId.value = row.approvalTaskId;
    entityId.value = row.entityId.id;
    approvalName.value = row.entityId.name;
    entityCode.value = row["approvalConfigId.entityCode"];
}

function confirm() {
    mlSingleListRef.value.getEntityList();
}

// 审批历史弹框
let approvalHistoryDialog = ref(false);
// 审批历史
function approveHistory(row) {
    approvalHistoryDialog.value = true;
    entityId.value = row.entityId.id;
}

// 详情组件
let detailRefs = ref("");
// 高亮字段点击
const highlightClick = (item) => {
    // 如果是待我处理
    if(props.type == 'handle'){
        approveRow(item);
    }else {
        detailRefs.value.openDialog(item.entityId.id);
    }
};
</script>
<style lang="scss">
</style>