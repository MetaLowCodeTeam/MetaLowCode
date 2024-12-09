<template>
    <mlEntityMenuAndList
        ref="mlEntityMenuAndListRef"
        entityName="ExternalForm"
        activeId="externalFormId"
        fieldsList="externalFormName,entityCode,bindUsers,isDisabled,createdOn,externalFormId"
        @goDetail="goDetail"
        :tableColumn="tableColumn"
        defaultSortField="createdOn"
        :filterItems="filterItems"
        @actionBtn="actionBtn"
        @changeSwitch="changeSwitch"
        @openAddDialog="openAddDialog"
        checkRole="r57"
        :actionColumnWidth="320"
    >
        <template #addButton>
            <el-button
                type="primary"
                @click="actionBtn({target:'add'})"
                :disabled="!$TOOL.checkRole('r57-2')"
            >
                <el-icon size="14">
                    <ElIconPlus />
                </el-icon>
                <span class="ml-5">添加</span>
            </el-button>
        </template>
        <template #appendActionBtn="scope">
            <el-button link type="primary" @click="copyRow(scope.scope)">复制填报链接</el-button>
            <el-button link type="primary" @click="downErCode(scope.scope)">下载二维码</el-button>
        </template>
    </mlEntityMenuAndList>
    <mlActiveDialog ref="mlActiveDialogRefs" @saveProcess="saveProcess"></mlActiveDialog>
</template>

<script setup>
import { inject, ref } from "vue";
import { useRouter } from "vue-router";
import useCommonStore from "@/store/modules/common";
import { storeToRefs } from "pinia";
import { ElMessage } from "element-plus";
import http from "@/utils/request";
const { publicSetting } = storeToRefs(useCommonStore());
const $TOOL = inject("$TOOL");
const router = useRouter();
let mlEntityMenuAndListRef = ref("");
let filterItems = ref([
    {
        fieldName: "externalFormName",
        op: "LK",
        value: "",
    },
]);
let tableColumn = ref([
    {
        prop: "externalFormName",
        label: "表单名称",
        sortable: true,
    },
    {
        prop: "entityCode",
        label: "源实体",
        entityCode: true,
        sortable: true,
    },
    {
        prop: "bindUsers",
        label: "绑定用户",
        align: "center",
        needField: "name",
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
        prop: "createdOn",
        label: "创建时间",
        align: "center",
        width: 160,
        fromNow: true,
    },
]);

// 编辑弹框
let mlActiveDialogRefs = ref();
let dialogForm = ref({
    saveEntity: "ExternalForm",
    saveIdCode: "externalFormId",
    checkCodes: ["externalFormName"],
    codeErrMsg: ["请输入表单名称"],
    fromEntityLabel: "源实体",
    showFormItem: [{ label: "表单名称", code: "externalFormName", type: "1" }],
});

const openAddDialog = () => {
    actionBtn({ target: "add" });
};
// 新建编辑触发
const actionBtn = (data) => {
    let { target, row } = data;
    let { defaultCode } = mlEntityMenuAndListRef.value;
    if (target === "add") {
        dialogForm.value.title = "添加外部表单";
        dialogForm.value.form = {
            entityCode: defaultCode == "all" ? "" : parseInt(defaultCode),
            bindUsers: [],
        };
        dialogForm.value.type = "add";
    } else {
        dialogForm.value.title = "编辑外部表单";
        dialogForm.value.type = "edit";
        console.log(row, "row");
        let tempForm = { ...row };
        tempForm.bindUsers = [row.bindUsers];
        dialogForm.value.form = { ...tempForm };
    }
    mlActiveDialogRefs.value.openDialog(dialogForm.value);
};

const changeSwitch = (row) => {
    let tempForm = { ...row };
    tempForm.bindUsers = row.bindUsers.id;
    dialogForm.value.form = { ...tempForm };
    mlActiveDialogRefs.value.dialogForm = { ...dialogForm.value };
    mlActiveDialogRefs.value.saveProcess();
};

// 保存流程
const saveProcess = async () => {
    mlEntityMenuAndListRef.value.getEntityList();
};

const copyRow = (row) => {
    let homeURL = publicSetting.value.homeURL;
    if (homeURL.substr(homeURL.length - 1, 1) != "/") {
        homeURL += "/";
    }
    homeURL += "web/inReport?externalId=";
    homeURL += row.externalFormId;
    const textarea = document.createElement("textarea");
    textarea.readOnly = "readonly";
    textarea.style.position = "absolute";
    textarea.style.left = "-9999px";
    textarea.value = homeURL;
    document.body.appendChild(textarea);
    textarea.select();
    textarea.setSelectionRange(0, textarea.value.length);
    const result = document.execCommand("Copy");
    if (result) {
        ElMessage.success("复制成功");
    }
    document.body.removeChild(textarea);
};

const downErCode = async (row) => {
    let homeURL = publicSetting.value.homeURL;
    if (homeURL.substr(homeURL.length - 1, 1) != "/") {
        homeURL += "/";
    }
    homeURL += "web/inReport?externalId=";
    homeURL += row.externalFormId;
    let res = await http.post("/picture/getQR", {url:homeURL});
    if (res && res.data) {
        let blob = base64ToBlob(res.data.qrData);
        let downloadElement = document.createElement("a");
        let href = window.URL.createObjectURL(blob);
        downloadElement.href = href;
        downloadElement.download = "填报二维码.jpeg";
        document.body.appendChild(downloadElement);
        downloadElement.click();
        document.body.removeChild(downloadElement); //移除元素；防止连续点击创建多个a标签
    }
};

const base64ToBlob = (base64) => {
    let baseContent = base64;
    let mime = baseContent.match(/:(.*?);/); //获取分割后的base64前缀中的类型
    let bstr = window.atob(baseContent);
    let n = bstr.length;
    let u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
};
const appPath = import.meta.env.VITE_APP_PATH;
// 跳转详情
const goDetail = (row) => {
    router.push({
        path: appPath + "trigger-detail",
        query: {
            triggerConfigId: row.triggerConfigId,
        },
    });
};
</script>

<style lang="scss" scoped>
</style>