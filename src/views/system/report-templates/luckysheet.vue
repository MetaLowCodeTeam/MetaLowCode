<template>
    <div
        data-1684916215247
        v-loading="pageLoading"
        :element-loading-text="loadingText"
        class="w-100"
    >
        <MlReport
            v-if="isLoad"
            @onSave="onSave"
            :reportName="reportName"
            :dbList="menuList"
            :sheets="sheets"
        />
    </div>
</template>

<script setup>
import { MlReport } from "vue3-manner-report";
import "./luckysheet.scss";
import http from "@/utils/request";
import { saveRecord } from "@/api/crud";
import { onBeforeMount, ref, inject } from "vue";
import { useRouter } from "vue-router";
const $ElMessage = inject("$ElMessage");
const router = useRouter();
let pageLoading = ref(false);
let loadingText = ref("数据加载中...");
// 数据是否加载完成
let isLoad = ref(false);
// 当前表唯一值
let reportConfigId = ref("");
// 当前实体
let entityCode = ref("");
// 菜单列表
let menuList = ref([]);

// 传参
let sheets = ref(null);
let reportName = ref("");
onBeforeMount(() => {
    reportConfigId.value = router.currentRoute.value.query.reportConfigId;
    initData();
});

// 初始化数据
function initData() {
    pageLoading.value = true;
    Promise.all([getEntityData(), getWorkBook()]).then(() => {
        pageLoading.value = false;
        isLoad.value = true;
    });
}

// 获取菜单数据
function getEntityData() {
    return new Promise(async (resolve, reject) => {
        let menuRes = await http.get("/plugins/mannerReport/getEntityList", {
            reportConfigId: reportConfigId.value,
        });
        if (menuRes) {
            let resDataList = menuRes.data || [];
            menuList.value = resDataList;
        }
        resolve();
    });
}
// 获取报表数据
function getWorkBook() {
    return new Promise(async (resolve, reject) => {
        let res = await http.get("/crud/queryById", {
            entityId: reportConfigId.value,
            fieldNames: "reportConfigId,reportName,reportJson,entityCode",
        });
        if (res) {
            let resData = res.data;
            let reportJson = JSON.parse(resData.reportJson);
            entityCode.value = resData.entityCode;
            reportName.value = resData.reportName;
            sheets.value = reportJson;
        }
        resolve();
    });
}
// 保存数据
async function onSave(event) {
    pageLoading.value = true;
    loadingText.value = "保存中...";
    let params = {
        entity: "ReportConfig",
        id: reportConfigId.value,
        formModel: {
            reportName: event.reportName,
            reportJson: event.reportJson,
            entityCode: entityCode.value,
        },
    };
    let res = await saveRecord(params.entity, params.id, params.formModel);
    if (res) {
        $ElMessage.success("保存成功");
    }
    pageLoading.value = false;
    loadingText.value = "加载中...";
}
</script>

<style lang="scss" scoped>
</style>