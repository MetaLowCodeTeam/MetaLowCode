<template>
    <mlSingleList
        title="消息中心"
        mainEntity="Notification"
        fieldsList="fromUser,unread,type,relatedRecord,message,createdOn"
        :sortFields="sortFields"
        fieldName="message"
        :tableColumn="tableColumn"
        :filterItems="filterItems"
        queryUrl="/note/listQuery"
    >
        <template #addbutton>
            <el-button type="primary" @click="markAllRead">全部设为已读</el-button>
        </template>
        <template #activeRow>
            <el-table-column label="操作" :align="'center'" width="100" fixed="right">
                <template #default="scope">
                    <el-button type="primary" size="small" link @click="activeRow(scope.row)">查看</el-button>
                </template>
            </el-table-column>
        </template>
    </mlSingleList>
    <Detail ref="detailRefs" />
</template>
   
<script setup>
import { ref, inject } from "vue";
import { $fromNow } from "@/utils/util";
import { storeToRefs } from "pinia";
import Detail from "@/views/customize-menu/detail.vue";
import useCommonStore from "@/store/modules/common";
import useCheckStatusStore from "@/store/modules/checkStatus";
const { approveDialogEntityList } = storeToRefs(useCommonStore());
const { newMsgNum } = storeToRefs(useCheckStatusStore());
const { setNewMsgNum } = useCheckStatusStore();
const COMMON_CONFIG = inject("COMMON_CONFIG");
const $ElMessage = inject("$ElMessage");
const $TOOL = inject("$TOOL");

// 默认排序
let sortFields = ref([
    {
        fieldName: "createdOn",
        type: "DESC",
    },
]);
// 过滤条件
let filterItems = ref([
    {
        fieldName: "toUser",
        op: "EQ",
        value: $TOOL.data.get("USER_INFO").userId,
    },
]);
let tableColumn = ref([
    {
        prop: "message",
        label: "消息",
    },
    {
        prop: "relatedRecord.name",
        label: "相关记录",
    },
    {
        prop: "fromUser.name",
        label: "发送人",
        width: "120",
        align: "center",
    },
    {
        prop: "type",
        label: "消息分类",
        width: "120",
        align: "center",
        formatter: (row) => {
            return COMMON_CONFIG.notificationType[row.type];
        },
    },
    {
        prop: "unread",
        label: "是否已读",
        width: "100",
        align: "center",
        formatter: (row) => {
            return row.unread ? "否" : "是";
        },
    },
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
// 消息点击
const activeRow = (item) => {
    console.log(item, "item");
    if (item.type == 30 || item.type == 20) {
        let filterEntity = approveDialogEntityList.value.filter(
            (el) => el.name == item.entityName
        );
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
        if (item.unread) {
            markRead(item);
        }
    } else {
        $ElMessage.info("点击了type：" + item.type);
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