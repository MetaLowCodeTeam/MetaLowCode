<template>
    <mlSingleList
        :title="pageType[type].title"
        mainEntity="ApprovalTask"
        fieldsList="approvalTaskId,approvalConfigId,entityId,approvalOn,remark,approvalStatus,approvalConfigId.flowName,approvalUser,stepName"
        :sortFields="sortFields"
        fieldName="approvalConfigId.flowName"
        :tableColumn="tableColumn"
        :filterItems="pageType[type].filterItems"
        ref="mlSingleListRef"
    >
        <template #activeRow>
            <el-table-column
                label="操作"
                :align="'center'"
                width="160"
                key="1"
                v-if="type === 'handle'"
                fixed="right"
            >
                <template #default="scope">
                    <el-button size="small" link @click="approveHistory(scope.row)" type="primary">审批历史</el-button>
                    <el-button
                        link
                        :disabled="!(scope.row.approvalStatus && scope.row.approvalStatus.value === 1)"
                        size="small"
                        type="success"
                        @click="approveRow(scope.row)"
                    >审批</el-button>
                </template>
            </el-table-column>
            <el-table-column
                label="操作"
                :align="'center'"
                width="100"
                key="2"
                v-if="type === 'submit'"
            >
                <template #default="scope">
                    <el-button
                        :disabled="!(scope.row.approvalStatus && scope.row.approvalStatus.value == 1)"
                        size="small"
                        type="primary"
                        link
                        @click="revokeRow(scope.row)"
                    >撤销</el-button>
                </template>
            </el-table-column>
        </template>
    </mlSingleList>
    <div v-if="approveDialogIsShow">
        <mlApprove
            v-model="approveDialogIsShow"
            :taskId="approvalTaskId"
            :entityId="entityId"
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
</template>
  
<script setup>
import { reactive, ref, inject, onBeforeMount } from "vue";
import { $fromNow } from "@/utils/util";
import mlApprove from "@/components/mlApprove/index.vue";
import mlApproveHistory from "@/components/mlApproveHistory/index.vue";
import { ElMessageBox } from "element-plus";
import http from "@/utils/request";
const $ElMessage = inject("$ElMessage");
const $TOOL = inject("$TOOL");


const props = defineProps({
    type: { type: String, default: "" },
});
let pageType = reactive({});
let mlSingleListRef = ref();
onBeforeMount(() => {
    const USER_INFO = $TOOL.data.get("USER_INFO");
    pageType = {
        handle: {
            title: "待我处理",
            filterItems: [
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
            filterItems: [
                {
                    fieldName: "createdBy",
                    op: "EQ",
                    value: USER_INFO.userId,
                },
            ],
        },
        cc: {
            title: "抄送我的",
            filterItems: [
                {
                    fieldName: "ccTo",
                    op: "REF",
                    value: "approvalTaskId",
                    value2: USER_INFO.userId,
                },
            ],
        },
    };
});

// 审核弹框是否显示
let approveDialogIsShow = ref(false);
// 审批任务Id
let approvalTaskId = ref("");
// 实体ID
let entityId = ref("");
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
            return row['approvalConfigId.flowName'] || row.stepName
        },
    },
    {
        prop: "entityId.name",
        label: "关联记录",
    },
    {
        prop: "remark",
        label: "最近审批备注",
    },
    {
        prop: "approvalStatus.label",
        label: "审批状态",
        width: "120",
        align: "center",
        formatter: (row) => {
            return row.approvalStatus.label;
        },
    },
    {
        prop: "approver",
        label: "最近审核人",
        width: "150",
        align: "center",
        formatter: (row) => {
            return row.approvalUser.name;
        },
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

// 撤销
const revokeRow = (row) => {
    ElMessageBox.confirm("是否确认撤销?", "提示：", {
        confirmButtonText: "确认",
        cancelButtonText: "取消",
        type: "warning",
    })
        .then(async () => {
            mlSingleListRef.value.loading = true;
            let res = await http.post("/approval/approvalRevocation?entityId=" + row.entityId.id);
            if (res) {
                $ElMessage.success("撤销成功");
                mlSingleListRef.value.getTableList();
            } 
            mlSingleListRef.value.loading = false;
        })
        .catch(() => {});
};

// 审批
function approveRow(row) {
    approveDialogIsShow.value = true;
    approvalTaskId.value = row.approvalTaskId;
    entityId.value = row.entityId.id;
}



function confirm() {
    mlSingleListRef.value.getTableList();
}

// 审批历史弹框
let approvalHistoryDialog = ref(false);
// 审批历史
function approveHistory(row) {
    approvalHistoryDialog.value = true;
    entityId.value = row.entityId.id;
    // console.log(row.entityId.id,'row')
}
</script>
<style lang="scss">
</style>