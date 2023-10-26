<template>
    <mlSingleList
        title="变更历史"
        mainEntity="RevisionHistory"
        fieldsList="entityId,entityCode,revisionContent,revisionBy,revisionOn,revisionType,revisionHistoryId"
        :sortFields="sortFields"
        fieldName="entityCode"
        :tableColumn="tableColumn"
        ref="mlSingleListRef"
        queryUrl="/revisionHistory/listQuery"
        @highlightClick="highlightClick"
    >
        <template #activeRow>
            <el-table-column label="操作" fixed="right" :align="'center'" width="100">
                <template #default="scope">
                    <el-button
                        :disabled="scope.row.revisionType && scope.row.revisionType.value != 1 && scope.row.revisionType.value != 5"
                        link
                        type="primary"
                        size="small"
                        @click="activeRow(scope.row)"
                    >查看</el-button>
                </template>
            </el-table-column>
        </template>
    </mlSingleList>
    <mlDialog v-model="historyDialog" title="变更详情" width="35%">
        <div>
            <el-table :data="historyData" style="width: 100%" stripe size="large">
                <el-table-column prop="label" label="字段" />
                <el-table-column prop="before" label="变更前" />
                <el-table-column prop="after" label="变更后" />
            </el-table>
        </div>
    </mlDialog>
    <ListDetail
        v-if="showListDetail"
        ref="listDetailRefs"
        :idFieldName="idFieldName"
        :nameFieldName="nameFieldName"
        @onRefresh="onRefresh"
    />
    <Detail ref="detailRefs" @onConfirm="onRefresh"/>
</template>
   
<script setup>
import { nextTick, ref } from "vue";
import { $fromNow } from "@/utils/util";
import useCommonStore from "@/store/modules/common";
import { storeToRefs } from "pinia";
import http from "@/utils/request";
const { allEntityLabel, allEntityName } = storeToRefs(useCommonStore());
import ListDetail from "@/views/user/components/ListDetail.vue";
import Detail from "@/views/customize-menu/detail.vue";
let mlSingleListRef = ref("");
// 默认排序
let sortFields = ref([
    {
        fieldName: "revisionOn",
        type: "DESC",
    },
]);

// const revisionType = ref({
//     1: "更新",
// });

let tableColumn = ref([
    {
        prop: "entityCode",
        label: "所属实体",
        align: "center",
        highlight: true,
        formatter: (row) => {
            return allEntityLabel.value[row.entityCode];
        },
    },
    {
        prop: "entityId.name",
        label: "关联记录",
        align: "center",
        formatter: (row) => {
            return row.entityId?.name;
        },
    },
    {
        prop: "revisionType.label",
        label: "变更类型",
        align: "center",
        formatter: (row) => {
            return row.revisionType?.label;
        },
    },
    {
        prop: "revisionBy.name",
        label: "变更用户",
        align: "center",
        formatter: (row) => {
            return row.revisionBy?.name;
        },
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
let historyData = ref([]);
async function activeRow(row) {
    mlSingleListRef.value.loading = true;
    let res = await http.get(
        "/revisionHistory/detailsById?revisionHistoryId=" +
            row.revisionHistoryId
    );
    if (res) {
        if (res.data && res.data.length > 0) {
            historyData.value = res.data;
            historyDialog.value = true;
        }
    }
    mlSingleListRef.value.loading = false;
}

const onRefresh = () => {
    mlSingleListRef.value.getTableList();
};

/**
 * ************************************ 用户、团队详情
 */
let showListDetail = ref(false);
let listDetailRefs = ref("");
// 当前实体名称
let cutEntityName = ref("");
// ID字段名称
let idFieldName = ref("");
// name字段名称
let nameFieldName = ref("");
const openListDetailDialog = (row) => {
    showListDetail.value = true;
    nextTick(() => {
        listDetailRefs.value.openDetailDialog(
            row.entityId.id,
            row.entityId.name
        );
    });
};

/**
 * ************************************ 实体列表详情
 */

// 详情组件
let detailRefs = ref("");

const openEntityDetailDialog = (item) => {
    let detailObj = {};
    detailObj.tab = {};
    detailObj.detailId = item.entityId.id;
    detailObj.detailTitle = item.entityId.name;
    detailRefs.value.openDialog(detailObj);
};

// 高亮字段点击
const highlightClick = (item) => {
    cutEntityName.value = allEntityName.value[item.entityCode];
    let listDetailEntity = ["User", "Team"];
    // 用户、团队详情
    if (listDetailEntity.includes(cutEntityName.value)) {
        idFieldName.value = cutEntityName.value == "User" ? "userId" : "teamId";
        nameFieldName.value =
            cutEntityName.value == "User" ? "userName" : "teamName";
        openListDetailDialog(item);
    }
    // 实体详情
    else {
        openEntityDetailDialog(item);
    }
};
</script>
<style>
</style>