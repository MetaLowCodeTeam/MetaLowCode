<template>
    <mlEntityMenuAndList
        ref="mlEntityMenuAndListRef"
        entityName="ReportConfig"
        activeId="reportConfigId"
        fieldsList="reportName,entityCode,isDisabled,modifiedOn,modifiedBy,createdOn,pdfWatermark,filterJson,shareTo"
        @goDetail="goDetail"
        :checkCodes="['reportName']"
        :codeErrMsg="['请输入模板名称']"
        :tableColumn="tableColumn"
        :showFormItem="[{'label':'名称','code':'reportName','type':'1'}]"
        defaultSortField="createdOn"
        fieldName="reportName"
        @actionBtn="actionBtn"
        @changeSwitch="changeSwitch"
        @openAddDialog="openAddDialog"
        :fixedFilter="fixedFilter"
        checkRole="r45"
    >
        <template #addButton>
            <el-button type="primary" @click="actionBtn({target:'add'})" :disabled="!$TOOL.checkRole('r45-2')">
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
const $TOOL = inject("$TOOL");

const router = useRouter();
let mlEntityMenuAndListRef = ref("");

let appAbbr = router.currentRoute.value.query.appAbbr;
let fixedFilter = ref([
    {
        fieldName: "appAbbr",
        op: appAbbr ? "EQ" : "NL",
        value: appAbbr,
    }
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
        width: 160,
        fromNow: true,
    },
]);

const changeSwitch = (row) => {
    let tempForm = { ...row };
    dialogForm.value.form = { ...tempForm };
    mlActiveDialogRefs.value.dialogForm = { ...dialogForm.value };
    mlActiveDialogRefs.value.saveProcess('changeSwitch');
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
const appPath = import.meta.env.VITE_APP_PATH;
// 跳转详情
const goDetail = (row) => {
    const to = router.resolve({
        path: appPath + "luckysheet",
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