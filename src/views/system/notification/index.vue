<template>
    <mlSingleList
        title="消息中心"
        mainEntity="Notification"
        fieldsList="fromUser,unread,type,relatedRecord,message,createdOn"
        :sortFields="sortFields"
        fieldName="message"
        :tableColumn="tableColumn"
        :fixedFilter="fixedFilter"
        queryUrl="/note/listQuery"
        equation="AND"
        ref="mlSingleListRefs"
    >
        <template #addButton>
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
    <div v-if="approveDialogIsShow">
        <mlApprove
            v-model="approveDialogIsShow"
            :taskId="approvalTaskId"
            :entityId="entityId"
            :approvalName="approvalName"
            title="审批"
        />
    </div>
</template>
   
<script setup>
import { ref, inject, onMounted } from "vue";
import { $fromNow } from "@/utils/util";
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";
import Detail from "@/views/customize-menu/detail.vue";
import useCommonStore from "@/store/modules/common";
import useCheckStatusStore from "@/store/modules/checkStatus";
import mlApprove from "@/components/mlApprove/index.vue";
import http from "@/utils/request";
import { ElMessage } from "element-plus";
const { unSystemEntityList } = storeToRefs(useCommonStore());
const { newMsgNum } = storeToRefs(useCheckStatusStore());
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
let fixedFilter = ref([
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
        prop: "relatedRecord",
        label: "相关记录",
        formatter: (row) => {
            return row.relatedRecord?.name;
        },
    },
    {
        prop: "fromUser",
        label: "发送人",
        width: "120",
        align: "center",
        formatter: (row) => {
            return row.fromUser?.name;
        },
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
        width: "160",
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
const appPath = import.meta.env.VITE_APP_PATH;

onMounted(() => {
    let routerRecordId = router.currentRoute.value.query.recordId;
    if(routerRecordId){
        detailRefs.value.openDialog(routerRecordId);
    }
})

// 消息点击
const activeRow = (item) => {
    // 审批
    if (item.type == 10) {
        // router.push(appPath + "center-handle");
        // approveDialogIsShow.value = true;
        // approvalTaskId.value = item.relatedRecord.id;
        // entityId.value = item.relatedRecord.id;
        // approvalName.value = item.relatedRecord.name;
        detailRefs.value.openDialog(item.relatedRecord.id);
    }
    // 审批抄送
    else if (item.type == 11) {
        router.push(appPath + "center-cc");
    }
    // 实体列表详情
    else {
        // 如果是仪表盘
        if(item.entityName == 'Chart'){
            if($TOOL.checkRole('r52-1') && $TOOL.checkRole('r6017')) {
                router.push(appPath + 'dashboard-list');
            }else {
                $ElMessage.error("没有权限");
            }
            return
        }
        let filterEntity = unSystemEntityList.value.filter(
            (el) => el.name == item.entityName && !el.appAbbr
        );
        if (filterEntity.length < 1) {
            $ElMessage.error("该实体已删除");
        } else {
            detailRefs.value.openDialog(item.relatedRecord.id);
        }
    }
    if (item.unread) {
        markRead(item);
    }
};

// 标记单条已读
const markRead = (item) => {
    item.unread = false;
    http.post("/note/read?id=" + item.notificationId);
};


let mlSingleListRefs = ref();

//标记全部已读
const markAllRead = async () => {
    let res = await http.post("/note/readAll");
    if(res){
        mlSingleListRefs.value.getTableList();
        ElMessage.success("设置成功")
    }
    
};
</script>
<style>
</style>