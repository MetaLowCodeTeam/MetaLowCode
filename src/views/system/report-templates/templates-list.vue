<template>
    <mlEntityMenuAndList
        ref="mlEntityMenuAndListRef"
        entityName="ReportConfig"
        activeId="reportConfigId"
        fieldsList="reportName,entityCode,isDisabled,modifiedOn,modifiedBy,createdOn,pdfWatermark"
        @goDetail="goDetail"
        :checkCodes="['reportName']"
        :codeErrMsg="['请输入模板名称']"
        :tableColumn="tableColumn"
        :showFormItem="[{'label':'名称','code':'reportName','type':'1'}]"
        defaultSortField="createdOn"
        :filterItems="filterItems"
        @actionBtn="actionBtn"
        @changeSwitch="changeSwitch"
        @openAddDialog="openAddDialog"
    >
        <template #addButton>
            <el-button type="primary" @click="actionBtn({target:'add'})">
                <el-icon size="14">
                    <ElIconPlus />
                </el-icon>
                <span class="ml-5">添加</span>
            </el-button>
        </template>
    </mlEntityMenuAndList>
    <mlActiveDialog ref="mlActiveDialogRefs" @saveProcess="saveProcess"></mlActiveDialog>
</template>

<script setup>
import { inject, ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
let mlEntityMenuAndListRef = ref("");
let filterItems = ref([
    {
        fieldName: "reportName",
        op: "LK",
        value: "",
    },
]);
let tableColumn = ref([
    {
        prop: "reportName",
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
        prop: "isDisabled",
        label: "启用",
        align: "center",
        customSlot: "switch",
        isNegation: true,
        width: 80,
    },
    {
        prop: "modifiedOn",
        label: "修改时间",
        align: "center",
        width: 100,
        fromNow: true,
    },
]);

const changeSwitch = (row) => {
    let tempForm = { ...row };
    tempForm.actionType = tempForm.actionType.value;
    dialogForm.value.form = { ...tempForm };
    mlActiveDialogRefs.value.dialogForm = { ...dialogForm.value };
    mlActiveDialogRefs.value.saveProcess();
};

// 编辑弹框
let mlActiveDialogRefs = ref();
let dialogForm = ref({
    saveEntity: "ReportConfig",
    saveIdCode: "reportConfigId",
    checkCodes: ["reportName"],
    codeErrMsg: ["请输入模板名称"],
    fromEntityLabel: "应用实体",
    showFormItem: [{ label: "名称", code: "reportName", type: "1" }],
});

const openAddDialog = () => {
    actionBtn({ target: "add" });
};

// 新建编辑触发
const actionBtn = (data) => {
    let { target, row } = data;
    let { defaultCode } = mlEntityMenuAndListRef.value;
    if (target === "add") {
        dialogForm.value.title = "添加模板";
        dialogForm.value.form = {
            entityCode: defaultCode == "all" ? "" : parseInt(defaultCode),
        };
        dialogForm.value.type = "add";
    } else {
        dialogForm.value.title = "编辑模板";
        dialogForm.value.type = "edit";
        dialogForm.value.form = { ...row };
    }
    mlActiveDialogRefs.value.openDialog(dialogForm.value);
};

// 保存流程
const saveProcess = async () => {
    mlEntityMenuAndListRef.value.getEntityList();
};

// 跳转详情
const goDetail = (row) => {
    const to = router.resolve({
        path: "/web/luckysheet",
        query: {
            reportConfigId: row.reportConfigId,
        },
    });
    window.open(to.href, "_blank");
};

// 批量转审
const referral = () => {
    console.log("批量转审");
};
</script>

<style lang="scss" scoped>
</style>