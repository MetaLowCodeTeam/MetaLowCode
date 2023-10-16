<template>
    <div class="user-bar">
        <div class="screen panel-item hidden-sm-and-down" @click="screen">
            <el-icon>
                <el-icon-full-screen />
            </el-icon>
        </div>
        <div class="msg panel-item" @click="showMsg">
            
            <el-badge :hidden="newMsgNum == 0" :value="newMsgNum" class="badge" type="danger">
                <el-icon>
                    <el-icon-chat-dot-round />
                </el-icon>
            </el-badge>
            <el-drawer title="新消息" v-model="msg" :size="400" append-to-body destroy-on-close>
                <el-container v-loading="msgLoading">
                    <el-main class="nopadding">
                        <el-scrollbar>
                            <ul class="msg-list">
                                <li
                                    v-for="(item,itemInx) in msgList"
                                    v-bind:key="item.id"
                                    @click="msgClick(item,itemInx)"
                                >
                                    <a :href="item.link" target="_blank">
                                        <div class="msg-list__icon">
                                            <el-badge is-dot type="danger">
                                                <el-avatar :size="40">
                                                    <mlAvatar :userId="item.fromUser.id"/>
                                                </el-avatar>
                                            </el-badge>
                                        </div>
                                        <div class="msg-list__main">
                                            <h2>{{item.fromUser.name}}</h2>
                                            <p>{{item.message}}</p>
                                        </div>
                                        <div class="msg-list__time">
                                            <p>{{$fromNow(item.createdOn)}}</p>
                                        </div>
                                    </a>
                                </li>
                                <el-empty
                                    v-if="msgList.length==0"
                                    description="暂无新消息"
                                    :image-size="100"
                                ></el-empty>
                            </ul>
                        </el-scrollbar>
                    </el-main>
                    <el-footer>
                        <el-button type="primary" @click="goNotification">消息中心</el-button>
                        <el-button @click="markAllRead">全部设为已读</el-button>
                    </el-footer>
                </el-container>
            </el-drawer>
        </div>
        <el-dropdown class="user panel-item" trigger="click" @command="handleUser">
            <div class="user-avatar">
                <el-avatar :size="30">
                    <mlAvatar :userId="userId"/>
                </el-avatar>
                <label>{{ userName }}</label>
                <el-icon class="el-icon--right">
                    <el-icon-arrow-down />
                </el-icon>
            </div>
            <template #dropdown>
                <el-dropdown-menu>
                    <el-dropdown-item command="uc">帐号信息</el-dropdown-item>
                    <el-dropdown-item command="clearCache">清除缓存</el-dropdown-item>
                    <el-dropdown-item divided command="outLogin">退出登录</el-dropdown-item>
                </el-dropdown-menu>
            </template>
        </el-dropdown>
    </div>

    <el-dialog v-model="searchVisible" :width="700" title="搜索" center destroy-on-close>
        <search @success="searchVisible=false"></search>
    </el-dialog>

    <el-drawer v-model="tasksVisible" :size="450" title="任务中心" destroy-on-close>
        <tasks></tasks>
    </el-drawer>
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
import { inject, onMounted, ref } from "vue";
import search from "./search.vue";
import tasks from "./tasks.vue";
import { useRouter } from "vue-router";
import { ElMessageBox, ElLoading } from "element-plus";
import useCheckStatusStore from "@/store/modules/checkStatus";
import useCommonStore from "@/store/modules/common";
import { storeToRefs } from "pinia";
import http from "@/utils/request";
import { $fromNow } from "@/utils/util";
import Detail from "@/views/customize-menu/detail.vue";
import mlApprove from "@/components/mlApprove/index.vue";
const { newMsgNum } = storeToRefs(useCheckStatusStore());
const { setNewMsgNum } = useCheckStatusStore();
const { approveDialogEntityList } = storeToRefs(useCommonStore());
const $TOOL = inject("$TOOL");
const $ElMessage = inject("$ElMessage");
const COMMON_CONFIG = inject("COMMON_CONFIG");

const router = useRouter();
let userName = ref("");
let userId = ref("");
let userNameF = ref("");
let searchVisible = ref(false);
let tasksVisible = ref(false);
let msg = ref(false);
let msgList = ref([]);
let msgLoading = ref(false);
onMounted(() => {
    var userInfo = $TOOL.data.get("USER_INFO");
    if(!userInfo){
        router.push({ path: "/web/login" });
        return    
    }
    userName.value = userInfo.userName;
    userId.value = userInfo.userId;
    userNameF.value = userName.value.substring(0, 1);
});

//个人信息
const handleUser = (command) => {
    if (command == "uc") {
        router.push({ path: "/web/usercenter" });
    }
    if (command == "cmd") {
        router.push({ path: "/web/cmd" });
    }
    if (command == "clearCache") {
        ElMessageBox.confirm(
            "清除缓存会将系统初始化，包括登录状态、主题、语言设置等，是否继续？",
            "提示",
            {
                type: "info",
            }
        )
            .then(async () => {
                let res = await http.post("/user/logout");
                if (res) {
                    router.replace({ path: "/web/login" });
                    const loading = ElLoading.service({
                        lock: true,
                        text: "Loading",
                        background: "rgba(0, 0, 0, 0.7)",
                    });
                    $TOOL.data.clear();
                    $TOOL.cookie.remove("userInfo");

                    router.replace({ path: "/web/login" });
                    setTimeout(() => {
                        loading.close();
                        location.reload();
                    }, 1000);
                }
            })
            .catch(() => {
                //取消
            });
    }
    if (command == "outLogin") {
        ElMessageBox.confirm("确认是否退出当前用户？", "提示", {
            type: "warning",
            confirmButtonText: "退出",
            confirmButtonClass: "el-button--danger",
        })
            .then(async () => {
                let res = await http.post("/user/logout");
                if (res) {
                    router.replace({ path: "/web/login" });
                }
            })
            .catch(() => {
                //取消退出
            });
    }
};
//全屏
const screen = () => {
    var element = document.documentElement;
    $TOOL.screen(element);
};
//显示短消息
const showMsg = () => {
    msg.value = true;
    getMsgList();
};
const getMsgList = async () => {
    msgLoading.value = true;
    let msgRes = await http.get("/note/query?unread=true");
    if (msgRes) {
        msgList.value = msgRes.data || [];
        setNewMsgNum(msgList.value.length);
    }
    msgLoading.value = false;
};

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
const msgClick = (item, inx) => {
    let filterEntity = approveDialogEntityList.value.filter(
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
            msg.value = false;
            detailRefs.value.openDialog(detailObj);
        }
    } else if (item.type == 10) {
        approveDialogIsShow.value = true;
        approvalTaskId.value = item.relatedRecord.id;
        entityId.value = item.relatedRecord.id;
        approvalName.value = item.relatedRecord.name;
    } else {
        let { currentRoute } = router;
        if (currentRoute.value.name != "CenterCc") {
            router.push("/web/center-cc");
        }
        msg.value = false;
    }
    if (item.unread) {
        markRead(item, inx);
    }
};

// 标记单条已读
const markRead = (item, inx) => {
    msgList.value.splice(inx, 1);
    setNewMsgNum(msgList.value.length);
    http.post("/note/read?id=" + item.notificationId);
};

//标记全部已读
const markAllRead = () => {
    http.post("/note/readAll");
    msgList.value = [];
    setNewMsgNum(0);
};
// 去消息中心
function goNotification() {
    let { currentRoute } = router;
    if (currentRoute.value.name != "Notification") {
        router.push("/web/notification");
    }
    msg.value = false;
}
//搜索
const searchFn = () => {
    searchVisible.value = true;
};
//任务
const tasksFn = () => {
    tasksVisible.value = true;
};
</script>

<style scoped>
.user-bar {
    display: flex;
    align-items: center;
    height: 100%;
}
.user-bar .panel-item {
    padding: 0 10px;
    cursor: pointer;
    height: 100%;
    display: flex;
    align-items: center;
}
.user-bar .panel-item i {
    font-size: 16px;
}
.user-bar .panel-item:hover {
    background: rgba(0, 0, 0, 0.1);
}
.user-bar .user-avatar {
    height: 49px;
    display: flex;
    align-items: center;
}
.user-bar .user-avatar label {
    display: inline-block;
    margin-left: 5px;
    font-size: 12px;
    cursor: pointer;
}

.msg-list li {
    border-top: 1px solid #eee;
}
.msg-list li a {
    display: flex;
    padding: 20px;
}
.msg-list li a:hover {
    background: #ecf5ff;
}
.msg-list__icon {
    width: 40px;
    margin-right: 15px;
}
.msg-list__main {
    flex: 1;
}
.msg-list__main h2 {
    font-size: 15px;
    font-weight: normal;
    color: #333;
}
.msg-list__main p {
    font-size: 12px;
    color: #999;
    line-height: 1.8;
    margin-top: 5px;
}
.msg-list__time {
    width: 100px;
    text-align: right;
    color: #999;
}

.dark .msg-list__main h2 {
    color: #d0d0d0;
}
.dark .msg-list li {
    border-top: 1px solid #363636;
}
.dark .msg-list li a:hover {
    background: #383838;
}
</style>
