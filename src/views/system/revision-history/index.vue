<template>
    <mlSingleList
        title="变更历史"
        mainEntity="RevisionHistory"
        fieldsList="entityId,entityCode,revisionContent,revisionBy,revisionOn,revisionType,revisionHistoryId"
        :sortFields="sortFields"
        fieldName="entityCode"
        :tableColumn="tableColumn"
        ref="mlSingleListRef"
    >
        <template #activeRow>
            <el-table-column label="操作" :align="'center'" width="100">
                <template #default="scope">
                    <el-button size="small" type="primary" @click="activeRow(scope.row)">查看</el-button>
                </template>
            </el-table-column>
        </template>
    </mlSingleList>
    <mlDialog v-model="historyDialog" title="变更详情" width="35%">
        <div v-loading="historyLoading">
            <el-table :data="historyData" style="width: 100%" stripe size="large">
                <el-table-column prop="label" label="字段" />
                <el-table-column prop="before" label="变更前" />
                <el-table-column prop="after" label="变更后" />
            </el-table>
        </div>
    </mlDialog>
</template>
   
<script setup>
import { inject, onBeforeMount, ref } from "vue";
import { $fromNow } from "@/utils/util";
import useCommonStore from "@/store/modules/common";
import { storeToRefs } from "pinia";
import http from "@/utils/request";
const { entityLable } = storeToRefs(useCommonStore());
const { getEntityLable } = useCommonStore();
const $ElMessage = inject("$ElMessage");
// 默认排序
let sortFields = ref([
    {
        fieldName: "revisionOn",
        type: "DESC",
    },
]);

onBeforeMount(() => {
    if (JSON.stringify(entityLable.value) == "{}") {
        getEntityLable();
    }
});

// const revisionType = ref({
//     1: "更新",
// });

let tableColumn = ref([
    {
        prop: "entityCode",
        label: "所属实体",
        align: "center",
        formatter: (row) => {
            return entityLable.value[row.entityCode];
        },
    },
    {
        prop: "entityId.name",
        label: "关联记录",
        align: "center",
    },
    {
        prop: "revisionType.label",
        label: "变更类型",
        align: "center",
    },
    {
        prop: "revisionBy.name",
        label: "变更用户",
        align: "center",
    },
    {
        prop: "revisionOn",
        label: "变更时间",
        align: "center",
        formatter: (row) => {
            return $fromNow(row.revisionOn);
        },
    },
]);

// 历史详情弹框是否显示
let historyDialog = ref(false);
let historyLoading = ref(false);
let historyData = ref([]);
async function activeRow(row) {
    historyDialog.value = true;
    historyLoading.value = true;
    let res = await http.get(
        "/revisionHistory/detailsById?revisionHistoryId=" +
            row.revisionHistoryId
    );
    if (res.code === 200) {
        historyData.value = res.data;
    } else {
        $ElMessage.error("获取详情失败：" + res.error);
        historyDialog.value = false;
    }
    historyLoading.value = false;
}
</script>
<style>
</style>