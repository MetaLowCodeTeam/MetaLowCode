<template>
    <mlEntityMenuAndList
        ref="mlEntityMenuAndListRef"
        entityName="ReportConfig"
        aciveId="reportConfigId"
        fieldsList="reportName,entityCode,isDisabled,modifiedOn,modifiedBy"
        @goDetial="goDetial"
        :checkCodes="['reportName']"
        :codeErrMsg="['请输入模板名称']"
        :tableColumn="tableColumn"
        :showFormItem="[{'label':'名称','code':'reportName','type':'1'}]"
        defalutSortField="modifiedOn"
        defaultFilter="reportName"
        v-if="isSupportFunc"
    >
        <template #addbutton>
            <el-button type="primary" @click="addClick">
                <el-icon size="14">
                    <ElIconPlus />
                </el-icon>
                <span class="ml-5">添加</span>
            </el-button>
        </template>
    </mlEntityMenuAndList>
    <div v-else class="not-support">
        在线报表 插件未安装！
    </div>
</template>

<script setup>
import { inject, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
const $TOOL = inject("$TOOL");
// 是否支持该功能
let isSupportFunc = ref(false);
onMounted(() => {
    let pluginIdList = $TOOL.data.get("APP_PLUGINID");
    if (pluginIdList.includes("mannerReport")) {
        isSupportFunc.value = true;
    }
});
const router = useRouter();
let mlEntityMenuAndListRef = ref("");
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
        width: 60,
        isDisabled: true,
    },
    {
        prop: "modifiedOn",
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
    const to = router.resolve({
        path: "/luckysheet",
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
.not-support {
    text-align: center;
    font-weight: bold;
    font-size: 20px;
    margin-top: 30px;
}
</style>