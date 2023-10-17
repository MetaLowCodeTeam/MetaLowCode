<template>
    <mlEntityMenuAndList
        ref="mlEntityMenuAndListRef"
        entityName="ApprovalConfig"
        aciveId="approvalConfigId"
        fieldsList="entityCode,flowName,modifiedOn,isDisabled,runningTotal,completeTotal"
        @goDetial="goDetial"
        :tableColumn="tableColumn"
        defalutSortField="modifiedOn"
        defaultFilter="flowName"
        @actionBtn="actionBtn"
    >
        <template #addbutton>
            <el-dropdown split-button type="primary" @click="actionBtn({target:'add'})" @command="referral">
                <el-icon size="14">
                    <ElIconPlus />
                </el-icon>
                <span class="ml-5">添加</span>
                <template #dropdown>
                    <el-dropdown-menu>
                        <el-dropdown-item command="referral">
                            <el-icon>
                                <ElIconAvatar />
                            </el-icon>
                            <span class="ml-5">批量转审</span>
                        </el-dropdown-item>
                    </el-dropdown-menu>
                </template>
            </el-dropdown>
        </template>
    </mlEntityMenuAndList>
    <mlActiveDialog ref="mlActiveDialogRefs" @saveProcess="saveProcess"></mlActiveDialog>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
const router = useRouter();
let mlEntityMenuAndListRef = ref("");
let tableColumn = ref([
    {
        prop: "flowName",
        label: "名称",
        sortable: true,
        highlight: true,
    },
    {
        prop: "entityCode",
        label: "应用实体",
        entityCode: true,
        sortable: true,
    },
    {
        prop: "runningTotal",
        label: "运行中的流程统计",
        align: "center",
    },
    {
        prop: "runningTotal",
        label: "结束的流程统计",
        align: "center",
    },
    {
        prop: "isDisabled",
        label: "启用",
        align: "center",
        width: 60,
        isDisabled: true,
    },
    {
        prop: "createdOn",
        label: "修改时间",
        align: "center",
        width: 100,
        fromNow: true,
    },
]);

// 编辑弹框
let mlActiveDialogRefs = ref();
let dialogForm = ref({
    saveEntity: "ApprovalConfig",
    saveIdCode: "approvalConfigId",
    checkCodes: ["flowName"],
    codeErrMsg: ["请输入审批流程名称"],
    disabledTip:"禁用后正在使用此流程的审批记录不受影响",
    fromEntityLabel:'应用实体',
    showFormItem: [{ label: "名称", code: "flowName", type: "1" }],
});

// 新建编辑触发
const actionBtn = (data) => {
    let { target, row } = data;
    if (target === "add") {
        dialogForm.value.title = "添加审批流程";
        dialogForm.value.form = {};
        dialogForm.value.type = "add";
    } else {
        dialogForm.value.title = "编辑审批流程";
        dialogForm.value.type = "edit";
        dialogForm.value.form = { ...row };
    }
    mlActiveDialogRefs.value.openDialog(dialogForm.value);
};

// 保存流程
const saveProcess = async (row) => {
    if(row){
        goDetial(row);
    }else {
        mlEntityMenuAndListRef.value.getApprovalList();
    }
};


// 添加触发
const addClick = () => {
    mlEntityMenuAndListRef.value.editApproval("add");
};

// 跳转详情
const goDetial = (row) => {
    router.push({
        path: "/web/process-detail",
        query: {
            approvalConfigId: row.approvalConfigId,
            entityCode:row.entityCode
            // entityCode:
        },
    });
};

// 批量转审
const referral = () => {
    console.log("批量转审");
};
</script>

<style>
</style>