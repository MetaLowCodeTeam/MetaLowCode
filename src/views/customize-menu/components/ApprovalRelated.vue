<template>
    <div class="group-button-label">流程操作</div>
    <!-- 未提交 -->
    <template v-if="myApproval.approvalStatus == 0">
        <el-row>
            <el-button
                type="success"
                plain
                v-if="myApproval.startApproval"
                @click="openDialog('提交审批')"
            >提交审批</el-button>
        </el-row>
    </template>
    <!-- 审核中 -->
    <template v-if="myApproval.approvalStatus == 1">
        <el-row>
            <el-button
                type="success"
                plain
                v-if="myApproval.imApproval"
                @click="openApproveDialog"
            >审批</el-button>
        </el-row>
        <el-row>
            <el-button type="success" plain @click="openHistoryDialog">审批历史</el-button>
        </el-row>
    </template>
    <!-- 已驳回 -->
    <template v-if="myApproval.approvalStatus == 2 || myApproval.approvalStatus == 4">
        <el-row>
            <el-button type="success" plain @click="openDialog('提交审批')">提交审批</el-button>
        </el-row>
        <el-row>
            <el-button type="success" plain @click="openHistoryDialog">审批历史</el-button>
        </el-row>
    </template>
    <!-- 已完成 -->
    <template v-if="myApproval.approvalStatus == 3">
        <el-row>
            <el-button
                type="success"
                plain
                @click="revokeApproval"
                v-if="$TOOL.checkRole('r6013')"
            >撤销审批</el-button>
        </el-row>
        <el-row>
            <el-button type="success" plain @click="openHistoryDialog">审批历史</el-button>
        </el-row>
    </template>
    <!-- 审批弹框 -->
    <mlDialog v-model="approvalDialog.isShow" :title="approvalDialog.title" width="460">
        <el-form label-width="120px" v-loading="approvalDialog.loading">
            <el-form-item label="选择审批流程">
                <el-select
                    v-if="approvalList.length > 0"
                    v-model="approvalDialog.approvalConfig"
                    placeholder="请选择审批流程"
                    style="width: 233px;margin-bottom: 10px;"
                    value-key="approvalConfigId"
                >
                    <el-option
                        v-for="item in approvalList"
                        :key="item.approvalConfigId"
                        :label="item.flowName"
                        :value="item"
                    />
                </el-select>
                <div v-else class="info-text">
                    暂无审批流程
                    <span
                        class="ml-a-span"
                        @click="goApprovalList"
                        v-if="$TOOL.checkRole('r30-1')"
                    >点击配置</span>
                </div>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" style="width: 80px;" @click="onSubmit">提交</el-button>
                <el-button style="width: 80px;" @click="approvalDialog.isShow = false">取消</el-button>
            </el-form-item>
        </el-form>
    </mlDialog>
    <div v-if="approveDialogIsShow">
        <mlApprove
            v-model="approveDialogIsShow"
            :taskId="myApproval.approvalTaskId"
            :entityId="myApproval.recordId"
            :approvalName="myApproval.approvalName"
            @confirm="confirmApproval"
            title="审批"
        />
    </div>
    <div v-if="approvalHistoryDialog">
        <mlApproveHistory
            v-model="approvalHistoryDialog"
            :entityId="myApproval.recordId"
            title="审批历史"
        />
    </div>
</template>

<script setup>
import { ElMessageBox, ElMessage } from "element-plus";
import { onMounted, watch, ref, reactive, inject } from "vue";
import { useRouter } from "vue-router";
import mlApprove from "@/components/mlApprove/index.vue";
import mlApproveHistory from "@/components/mlApproveHistory/index.vue";
import http from "@/utils/request";
const Route = useRouter();
const $API = inject("$API");
const $TOOL = inject("$TOOL");
const props = defineProps({
    approvalStatus: { type: Object, default: () => {} },
});
const emits = defineEmits(["onSubmit"]);
let myApproval = ref({});
watch(
    () => props.approvalStatus,
    () => {
        myApproval.value = props.approvalStatus;
    },
    { deep: true }
);
onMounted(() => {
    myApproval.value = props.approvalStatus;
});

// 审批流程
let approvalList = ref([]);

let approvalDialog = reactive({
    isShow: false,
    loading: false,
    title: "",
    approvalConfig: {},
});

// 打开弹框
const openDialog = async (title) => {
    approvalDialog.isShow = true;
    approvalDialog.title = title;
    approvalDialog.loading = true;
    let res = await $API.approval.detial.getApprovalList(
        myApproval.value.recordId
    );
    if (res) {
        approvalList.value = res.data || [];
    }
    approvalDialog.loading = false;
};

const closeDialog = () => {
    approvalDialog.isShow = false;
};

/**
 * ************************************ 审批详情
 */
// 审批详情弹框
let approvalHistoryDialog = ref(false);
// 审批历史
const openHistoryDialog = (row) => {
    approvalHistoryDialog.value = true;
};

// 审批
let approveDialogIsShow = ref(false);
const openApproveDialog = () => {
    approveDialogIsShow.value = true;
};

// 确认审批
const confirmApproval = () => {
    emits("onSubmit");
    closeDialog();
};

// 撤销
const revokeApproval = () => {
    ElMessageBox.confirm("是否确认撤销?", "提示：", {
        confirmButtonText: "确认",
        cancelButtonText: "取消",
        type: "warning",
    })
        .then(async () => {
            approvalDialog.loading = true;
            let res = await http.post(
                "/approval/approvalRevocation?entityId=" +
                    myApproval.value.recordId
            );
            if (res) {
                ElMessage.success("撤销成功");
                emits("onSubmit");
                closeDialog();
            }
            approvalDialog.loading = false;
        })
        .catch(() => {});
};

// 提交接口
const onSubmit = async () => {
    let { approvalConfig } = approvalDialog;
    let { flowType, approvalConfigId, wfProcDefId } = approvalConfig;
    if (!approvalConfigId) {
        ElMessage.warning("请选择审批流程");
        return;
    }

    approvalDialog.loading = true;

    let res;
    // 简易工作流
    if (flowType == 1) {
        res = await $API.approval.detial.startApproval(
            myApproval.value.recordId,
            approvalConfigId
        );
    }
    // 复杂工作流
    else {
        res = await $API.approval.detial.startComplexFlowApproval({
            processDefId: wfProcDefId,
            recordId: myApproval.value.recordId,
        });
    }

    if (res) {
        ElMessage.success("提交审批成功");
        emits("onSubmit");
        closeDialog();
    }
    approvalDialog.loading = false;
};

// 配置流程
const goApprovalList = () => {
    Route.push("/web/process-list");
};
</script>
<style lang='scss' scoped>
.group-button-label {
    font-size: 11px;
    color: #999999;
    margin-bottom: 5px;
}
</style>
