<template>
      <!-- :filterItems="filterItems" -->
    <mlSingleList
        title="触发器日志"
        mainEntity="TriggerLog"
        fieldsList="actionType,triggerReason,recordId,executeFlag,triggerConfigId,createdOn"
        :sortFields="sortFields"
        fieldName="triggerConfigId"
        :tableColumn="tableColumn"
        queryUrl="/plugins/metaTrigger/trigger/log"
    >
        <!-- <template #addbutton>
            <el-button type="primary" @click="markAllRead">全部设为已读</el-button>
        </template>
        <template #activeRow>
            <el-table-column label="操作" :align="'center'" width="100" fixed="right">
                <template #default="scope">
                    <el-button type="primary" size="small" link @click="activeRow(scope.row)">查看</el-button>
                </template>
            </el-table-column>
        </template> -->
    </mlSingleList>
    <Detail ref="detailRefs" />

</template>
   
<script setup>
import { ref, inject } from "vue";
import { $fromNow } from "@/utils/util";
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";
import Detail from "@/views/customize-menu/detail.vue";
import useCommonStore from "@/store/modules/common";
import useCheckStatusStore from "@/store/modules/checkStatus";
import mlApprove from "@/components/mlApprove/index.vue";
import http from "@/utils/request";
const { unSystemEntityList } = storeToRefs(useCommonStore());
const { newMsgNum } = storeToRefs(useCheckStatusStore());
const { setNewMsgNum } = useCheckStatusStore();
const COMMON_CONFIG = inject("COMMON_CONFIG");
const $ElMessage = inject("$ElMessage");
const $TOOL = inject("$TOOL");
const router = useRouter();
// 默认排序
let sortFields = ref([
    {
        fieldName: "createdOn",
        type: "DESC",
    },
]);
// 过滤条件
// let filterItems = ref([
//     {
//         fieldName: "toUser",
//         op: "EQ",
//         value: $TOOL.data.get("USER_INFO").userId,
//     },
// ]);
let tableColumn = ref([
   
    {
        prop: "createdOn",
        label: "创建时间",
        width: "120",
        align: "center",
        formatter: (row) => {
            return $fromNow(row.createdOn);
        },
    },
]);

// 消息详情组件
let detailRefs = ref("");

// 审核弹框是否显示
let approveDialogIsShow = ref(false);
// 审批任务Id
let approvalTaskId = ref("");
// 实体ID
let entityId = ref("");

// 审批名称
let approvalName = ref("");

// 消息点击
const activeRow = (item) => {
    let filterEntity = unSystemEntityList.value.filter(
        (el) => el.name == item.entityName
    );
    if (item.type == 30 || item.type == 20) {
        if (filterEntity.length < 1) {
            $ElMessage.error("该实体已删除");
        } else {
            let detailObj = {};
            detailObj.entityName = item.entityName;
            detailObj.entityCode = filterEntity[0].entityCode;
            detailObj.tab = {};
            detailObj.detailId = item.relatedRecord.id;
            detailObj.detailTitle = item.relatedRecord.name;
            detailRefs.value.openDialog(detailObj);
        }
    } else if (item.type == 10) {
        approveDialogIsShow.value = true;
        approvalTaskId.value = item.relatedRecord.id;
        entityId.value = item.relatedRecord.id;
        approvalName.value = item.relatedRecord.name;
    } else {
        router.push("/web/center-cc");
    }
    if (item.unread) {
        markRead(item);
    }
};

// 标记单条已读
const markRead = (item) => {
    item.unread = false;
    let num = newMsgNum.value;
    setNewMsgNum(num - 1);
    http.post("/note/read?id=" + item.notificationId);
};

//标记全部已读
const markAllRead = () => {
    http.post("/note/readAll");
    setNewMsgNum(0);
};
</script>
<style>
</style>