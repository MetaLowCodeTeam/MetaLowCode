<template>
    <mlEntityMenuAndList
        ref="mlEntityMenuAndListRef"
        entityName="ApprovalConfig"
        aciveId="approvalConfigId"
        fieldsList="entityCode,flowName,modifiedOn,isDisabled,runningTotal,completeTotal"
        @goDetial="goDetial"
        :checkCodes="['flowName']"
        :codeErrMsg="['请输入审批流程名称']"
        disabledTip="禁用后正在使用此流程的审批记录不受影响"
        :showFormItem="[{'label':'名称','code':'flowName','type':'1'}]"
        :tableColumn="tableColumn"
        defalutSortField="modifiedOn"
        defaultFilter="flowName"
    >
        <template #addbutton>
            <el-dropdown split-button type="primary" @click="addClick" @command="referral">
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

// 添加触发
const addClick = () => {
    mlEntityMenuAndListRef.value.editApproval("add");
};

// 跳转详情
const goDetial = (row) => {
    console.log(row,'row')
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