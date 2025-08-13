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
    
    <!-- 使用新的变更详情组件 -->
    <ml-revision-history 
        ref="historyDialog"
    />
    
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
import MlRevisionHistory from "@/components/mlRevisionHistory/index.vue";

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
        formatter: (row) => {
            return allEntityLabel.value[row.entityCode];
        },
    },
    {
        prop: "entityId",
        label: "关联记录",
        align: "center",
        highlight: true,
        formatter: (row) => {
            return row.entityId?.name;
        },
    },
    {
        prop: "revisionType",
        label: "变更类型",
        align: "center",
        formatter: (row) => {
            return row.revisionType?.label;
        },
    },
    {
        prop: "revisionBy",
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

// 变更详情组件引用
let historyDialog = ref(null);

// 查看变更详情
async function activeRow(row) {
    historyDialog.value.openDialog(row.revisionHistoryId);
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
    detailRefs.value.openDialog(item.entityId.id);
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