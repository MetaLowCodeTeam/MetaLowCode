<template>
    <mlEntityMenuAndList
        ref="mlEntityMenuAndListRef"
        entityName="TriggerConfig"
        aciveId="triggerConfigId"
        fieldsList="name,entityCode,actionType,actionContent,priority,isDisabled,modifiedOn,whenNum,createdOn"
        @goDetail="goDetail"
        :tableColumn="tableColumn"
        defalutSortField="createdOn"
        :filterItems="filterItems"
        @actionBtn="actionBtn"
        @changeSwitch="changeSwitch"
        @openAddDialog="openAddDialog"
        checkRole="r48"
    >
        <template #addbutton>
            <el-button
                type="primary"
                @click="actionBtn({target:'add'})"
                :disabled="!$TOOL.checkRole('r48-2')"
            >
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
let filterItems = ref([
    {
        fieldName: "name",
        op: "LK",
        value: "",
    },
]);
let tableColumn = ref([
    {
        prop: "name",
        label: "名称",
        sortable: true,
        highlight: true,
    },
    {
        prop: "entityCode",
        label: "源实体",
        entityCode: true,
        sortable: true,
    },
    {
        prop: "actionType",
        label: "触发类型",
        align: "center",
        needField: "label",
    },
    {
        prop: "whenNum",
        label: "触发动作",
        align: "center",
        customSlot: "whenNum",
    },
    {
        prop: "priority",
        label: "优先级",
        align: "center",
        customSlot: "priority",
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

// 编辑弹框
let mlActiveDialogRefs = ref();
let dialogForm = ref({
    saveEntity: "TriggerConfig",
    saveIdCode: "triggerConfigId",
    checkCodes: ["actionType", "name"],
    codeErrMsg: ["请选择触发器", "请输入名称"],
    fromEntityLabel: "源实体",
    showFormItem: [{ label: "名称", code: "name", type: "1" }],
});


const openAddDialog = () => {
    actionBtn({ target: "add" });
};
// 新建编辑触发
const actionBtn = (data) => {
    let { target, row } = data;
    let { defaultCode } = mlEntityMenuAndListRef.value;
    if (target === "add") {
        dialogForm.value.title = "添加触发器";
        dialogForm.value.form = {
            entityCode: defaultCode == "all" ? "" : parseInt(defaultCode),
        };
        dialogForm.value.type = "add";
    } else {
        dialogForm.value.title = "编辑触发器";
        dialogForm.value.type = "edit";
        let tempForm = { ...row };
        tempForm.actionType = tempForm.actionType.value;
        dialogForm.value.form = { ...tempForm };
    }
    mlActiveDialogRefs.value.openDialog(dialogForm.value);
};

const changeSwitch = (row) => {
    let tempForm = { ...row };
    tempForm.actionType = tempForm.actionType.value;
    dialogForm.value.form = { ...tempForm };
    mlActiveDialogRefs.value.dialogForm = { ...dialogForm.value };
    mlActiveDialogRefs.value.saveProcess();
};

// 保存流程
const saveProcess = async () => {
    mlEntityMenuAndListRef.value.getEntityList();
};

// 跳转详情
const goDetail = (row) => {
    router.push({
        path: "/web/trigger-detail",
        query: {
            triggerConfigId: row.triggerConfigId,
        },
    });
};
</script>

<style lang="scss" scoped>
</style>