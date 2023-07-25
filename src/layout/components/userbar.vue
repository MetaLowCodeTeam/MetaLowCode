<template>
    <div class="user-bar">
        <div class="panel-item hidden-sm-and-down" @click="searchFn">
            <el-icon>
                <el-icon-search />
            </el-icon>
        </div>
        <div class="screen panel-item hidden-sm-and-down" @click="screen">
            <el-icon>
                <el-icon-full-screen />
            </el-icon>
        </div>
        <div class="tasks panel-item" @click="tasksFn">
            <el-icon>
                <el-icon-sort />
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
                                                <el-avatar :size="40" :src="'img/avatar.jpg'"></el-avatar>
                                            </el-badge>
                                        </div>
                                        <div class="msg-list__main">
                                            <h2>{{COMMON_CONFIG.notificationType[item.type]}}</h2>
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
                        <el-button @click="markRead">全部设为已读</el-button>
                    </el-footer>
                </el-container>
            </el-drawer>
        </div>
        <el-dropdown class="user panel-item" trigger="click" @command="handleUser">
            <div class="user-avatar">
                <el-avatar :size="30">{{ userNameF }}</el-avatar>
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
</template>

<script setup>
import { inject, onMounted, ref } from "vue";
import search from "./search.vue";
import tasks from "./tasks.vue";
import { useRouter } from "vue-router";
import { ElMessageBox, ElLoading } from "element-plus";
import useCheckStatusStore from "@/store/modules/checkStatus";
import { storeToRefs } from "pinia";
import http from "@/utils/request";
import { $fromNow } from "@/utils/util";
const { newMsgNum } = storeToRefs(useCheckStatusStore());
const { setNewMsgNum } = useCheckStatusStore();
const $TOOL = inject("$TOOL");
const $ElMessage = inject("$ElMessage");
const COMMON_CONFIG = inject("COMMON_CONFIG");
const router = useRouter();
let userName = ref("");
let userNameF = ref("");
let searchVisible = ref(false);
let tasksVisible = ref(false);
let msg = ref(false);
let msgList = ref([]);
let msgLoading = ref(false);
onMounted(() => {
    var userInfo = $TOOL.data.get("USER_INFO");
    userName.value = userInfo.userName;
    userNameF.value = userName.value.substring(0, 1);
});

//个人信息
const handleUser = (command) => {
    if (command == "uc") {
        router.push({ path: "/usercenter" });
    }
    if (command == "cmd") {
        router.push({ path: "/cmd" });
    }
    if (command == "clearCache") {
        ElMessageBox.confirm(
            "清除缓存会将系统初始化，包括登录状态、主题、语言设置等，是否继续？",
            "提示",
            {
                type: "info",
            }
        )
            .then(() => {
                const loading = ElLoading.service({
                    lock: true,
                    text: "Loading",
                    background: "rgba(0, 0, 0, 0.7)",
                });
                $TOOL.data.clear();
                router.replace({ path: "/login" });
                setTimeout(() => {
                    loading.close();
                    location.reload();
                }, 1000);
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
            .then(() => {
                router.replace({ path: "/login" });
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
    if (msgRes.code == 200) {
        msgList.value = msgRes.data || [];
        setNewMsgNum(msgList.value.length);
    } else {
        $ElMessage.error("获取消息失败", msgRes.error);
    }
    msgLoading.value = false;
};
// 消息点击
const msgClick = (item, inx) => {
    msgList.value.splice(inx, 1);
    setNewMsgNum(msgRes.data.length);
};
//标记已读
const markRead = () => {
    http.post("/note/readAll");
    msgList.value = [];
    setNewMsgNum(0);
};
// 去消息中心
function goNotification(){
    let { currentRoute } = router;
    if(currentRoute.value.name === "Notification"){
        msg.value = false;
    }else {
        router.push('/notification')
    }
    
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
