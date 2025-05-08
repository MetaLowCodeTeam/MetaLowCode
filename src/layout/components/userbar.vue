<template>
    <div class="user-bar">
        <el-tooltip 
            class="box-item" 
            effect="light" 
            placement="bottom"
        >
            <!-- :visible="collectMenuTooltipVisible" -->
            <template #content>
                <div class="collect-box">
                    <div class="collect-title">
                        收藏菜单
                        <el-tooltip placement="right">
                            <template #content>
                                跨导航跳转会刷新
                            </template>
                            <el-icon class="icon-top-1">
                                <WarningFilled />
                            </el-icon>
                        </el-tooltip>
                    </div>
                    <template v-if="collectMenuList.length > 0">
                        <div v-for="(item,inx) in collectMenuList" :key="inx" @click="goCollectMenu(item)">
                            <div class="collect-item" :class="{'is-active': currenFullPath == item.fullPath}">
                                {{ item.alias || item.title }}
                                <div class="collect-item-icon fr">
                                    <span class="edit-span" @click.stop="editCollectMenu(item)">
                                        <el-icon><EditPen /></el-icon>
                                    </span>
                                    <span class="close-span" @click.stop="deleteCollectMenu(item)">
                                        <el-icon><Close /></el-icon>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </template>
                    <div v-else class="collect-item">
                        暂无收藏
                    </div>
                </div>
            </template>
            <!-- @click="collectMenuTooltipVisible = !collectMenuTooltipVisible" -->
            <div 
                class="screen panel-item hidden-sm-and-down"
            >
                <el-icon>
                    <Collection />
                </el-icon>
            </div>
        </el-tooltip>
        <!--  -->
        <el-tooltip class="box-item" effect="light" content="顶部导航设置" placement="bottom">
            <div 
                class="screen panel-item hidden-sm-and-down" 
                @click="setTopMenuDialogIsShow = true"
                v-if="$TOOL.checkRole('r6007') && !isDockLayout"
            >
                <el-icon>
                    <ElIconGrid />
                </el-icon>
            </div>
        </el-tooltip>
        <el-tooltip class="box-item" effect="light" content="审批中心" placement="bottom">
            <div class="approval-center panel-item">
                <el-dropdown trigger="click" @command="handleApproval">
                    <span class="approval-icon-span">
                        <el-icon>
                            <el-icon-connection />
                        </el-icon>
                    </span>
                    <template #dropdown>
                        <el-dropdown-menu>
                            <el-dropdown-item command="CenterHandle">待我处理</el-dropdown-item>
                            <el-dropdown-item command="CenterSubmit">我提交的</el-dropdown-item>
                            <el-dropdown-item command="CenterCc">抄送我的</el-dropdown-item>
                            <el-dropdown-item command="CenterApproved">审批过的</el-dropdown-item>
                        </el-dropdown-menu>
                    </template>
                </el-dropdown>
            </div>
        </el-tooltip>
        <el-tooltip class="box-item" effect="light" content="刷新" placement="bottom">
            <div class="screen panel-item hidden-sm-and-down" @click="refresh">
                <el-icon>
                    <ElIconRefresh />
                </el-icon>
            </div>
        </el-tooltip>
        <el-tooltip class="box-item" effect="light" content="全屏" placement="bottom">
            <div class="screen panel-item hidden-sm-and-down" @click="screen">
                <el-icon>
                    <el-icon-full-screen />
                </el-icon>
            </div>
        </el-tooltip>
        <el-tooltip class="box-item" effect="light" content="消息" placement="bottom">
            <div class="msg panel-item" @click="showMsg">
                <el-badge :hidden="newMsgNum == 0" :value="newMsgNum" class="badge" type="danger">
                    <el-icon>
                        <el-icon-chat-dot-round />
                    </el-icon>
                </el-badge>
                <el-drawer  class='new-message' title="新消息" v-model="msg" :size="400" append-to-body destroy-on-close>
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
                                                        <mlAvatar :userId="item.fromUser.id" />
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
        </el-tooltip>

        <el-dropdown class="user panel-item" trigger="click" @command="handleUser">
            <div class="user-avatar">
                <el-avatar :size="30">
                    <mlAvatar :userId="userId" needTimestamp/>
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
    <!-- 顶部导航设置 -->
    <setTopMenu v-model="setTopMenuDialogIsShow"/>
</template>

<script setup>
import { inject, onMounted, ref, watch } from "vue";
import search from "./search.vue";
import tasks from "./tasks.vue";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox, ElLoading } from "element-plus";
import useCheckStatusStore from "@/store/modules/checkStatus";
import useCommonStore from "@/store/modules/common";
import useLayoutConfigStore from "@/store/modules/layoutConfig";
import { storeToRefs } from "pinia";
import http from "@/utils/request";
import { $fromNow } from "@/utils/util";
import Detail from "@/views/customize-menu/detail.vue";
import mlApprove from "@/components/mlApprove/index.vue";
import setTopMenu from './setTopMenu.vue';
const { newMsgNum } = storeToRefs(useCheckStatusStore());
const { setNewMsgNum } = useCheckStatusStore();
const { unSystemEntityList } = storeToRefs(useCommonStore());
const { setCollectMenuList } = useLayoutConfigStore();
const { collectMenuList, chosenNavigationId } = storeToRefs(useLayoutConfigStore());
const $TOOL = inject("$TOOL");
const $API = inject("$API");


const props = defineProps({
    isDockLayout: {
        type: Boolean,
        default: false,
    },
});

const router = useRouter();

// 当前路由
const currenFullPath = ref("");
watch(router.currentRoute, (newVal, oldVal) => {
    currenFullPath.value = newVal.fullPath;
})

let userName = ref("");
let userId = ref("");
let userNameF = ref("");
let searchVisible = ref(false);
let tasksVisible = ref(false);
let msg = ref(false);
let msgList = ref([]);
let msgLoading = ref(false);

// 顶部导航设置弹框
let setTopMenuDialogIsShow = ref(false);
const appPath = import.meta.env.VITE_APP_PATH;


onMounted(() => {
    var userInfo = $TOOL.data.get("USER_INFO");
    if (!userInfo) {
        router.push({ path: appPath + "login" });
        return;
    }
    userName.value = userInfo.userName;
    userId.value = userInfo.userId;
    userNameF.value = userName.value.substring(0, 1);
    currenFullPath.value = router.currentRoute.value.fullPath;
});



//个人信息
const handleUser = (command) => {
    if (command == "uc") {
        router.push({ path: appPath + "usercenter" });
    }
    if (command == "cmd") {
        router.push({ path: appPath + "cmd" });
    }
    if (command == "clearCache") {
        ElMessageBox.confirm(
            "清除缓存会将系统初始化，包括登录状态、主题、通用设置等，是否继续？",
            "提示",
            {
                type: "info",
            }
        )
            .then(async () => {
                let res = await http.post("/user/logout");
                if (res) {
                    router.replace({ path: appPath + "login" });
                    const loading = ElLoading.service({
                        lock: true,
                        text: "Loading",
                        background: "rgba(0, 0, 0, 0.7)",
                    });
                    $TOOL.data.clear();
                    $TOOL.cookie.remove("userInfo");

                    router.replace({ path: appPath + "login" });
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
        })
            .then(async () => {
                let res = await http.post("/user/logout");
                if (res) {
                    let query = {};
                    let tenantInfo = $TOOL.data.get('TenantInfo') || {};
                    if(tenantInfo.tenantCode) {
                        query = {...tenantInfo}
                    }
                    router.replace({ path: appPath + "login", query});
                }
            })
            .catch(() => {
                //取消退出
            });
    }
};

// 审批流程
const handleApproval = (command) => {
    router.push({ name: command });
};

// 刷新
const refresh = () => {
    window.location.reload();
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
    let filterEntity = unSystemEntityList.value.filter(
        (el) => el.name == item.entityName && !el.appAbbr
    );
    let { currentRoute } = router;
    if (item.type == 30 || item.type == 20) {
        // 如果是仪表盘
        if(item.entityName == 'Chart'){
            if($TOOL.checkRole('r52-1') && $TOOL.checkRole('r6017')) {
                router.push(appPath + 'dashboard-list');
            }else {
                ElMessage.error("没有权限");
            }
        }else {
            if (filterEntity.length < 1) {
                ElMessage.error("该实体已删除");
            } else {
                msg.value = false;
                detailRefs.value.openDialog(item.relatedRecord.id);
            }
        }
    } else if (item.type == 10) {
        if (currentRoute.value.name != "CenterHandle") {
            // router.push(appPath + "center-handle");
            detailRefs.value.openDialog(item.relatedRecord.id);
        }
        msg.value = false;
        // approveDialogIsShow.value = true;
        // approvalTaskId.value = item.relatedRecord.id;
        // entityId.value = item.relatedRecord.id;
        // approvalName.value = item.relatedRecord.name;
    } else {
        
        if (currentRoute.value.name != "CenterCc") {
            router.push(appPath + "center-cc");
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
        router.push(appPath + "notification");
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

/**
 * 
 */

// let collectMenuTooltipVisible = ref(false);

// 修改收藏菜单别名
const editCollectMenu = (item) => {
    ElMessageBox.prompt('请输入菜单名', '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        beforeClose: async (action, instance, done) => {
            if(action === 'confirm'){
                instance.confirmButtonLoading = true;
                let formData = { ...item };
                formData.alias = instance.inputValue;
                let res = await $API.layoutConfig.saveFavoritesConfig(
                    item.recordId,
                    "FAVORITES",
                    {
                        config: JSON.stringify(formData),
                    },
                );
                if(res && res.code == 200) {
                    setCollectMenuList(res.data);
                    instance.confirmButtonLoading = false;
                    ElMessage.success('修改成功');
                    done();
                }else {
                    instance.confirmButtonLoading = false;
                    ElMessage.error('修改失败');
                }
            }else {
                // 如果存在loading状态不允许关闭
                if(instance.confirmButtonLoading){
                    return
                }
                done();
            }
        }
    })
    .then(() => {})
    .catch(() => {})
};


// 删除收藏菜单
const deleteCollectMenu = (item) => {
    ElMessageBox.confirm('确定要删除吗？', '提示', {
        type: 'warning',
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        beforeClose: async (action, instance, done) => {
            if (action === 'confirm') {
                instance.confirmButtonLoading = true;
                let res = await $API.layoutConfig.deleteFavoritesConfig(item.recordId);
                if(res && res.code == 200) {
                    setCollectMenuList(res.data);
                    instance.confirmButtonLoading = false;
                    ElMessage.success('删除成功');
                    done();
                }else {
                    instance.confirmButtonLoading = false;
                    ElMessage.error('删除失败');
                }
            }else {
                // 如果存在loading状态不允许关闭
                if(instance.confirmButtonLoading){
                    return
                }
                done();
            }
        }
    })
    .then(() => {})
    .catch(() => {})
};

// 菜单跳转
const goCollectMenu = async (item) => {
    // 是同一个导航，直接跳转
    if(item.navigationId == chosenNavigationId.value){
        router.push(item.fullPath);
    }else {
        let res = await $API.layoutConfig.saveUserLayoutCache(
            "NAV",
            item.navigationId
        );
        if (res) {
            window.location.href = "/";
            localStorage.setItem('forcefullyJump', item.fullPath);
        }
    }
};

</script>

<style scoped lang="scss">
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

.approval-center {
    padding: 0 !important;
    .el-dropdown {
        height: 100%;
        display: flex;
        align-items: center;
    }
    .approval-icon-span {
        color: #d0d0d0;
        height: 100%;
        display: flex;
        padding: 0 10px;
        width: 100%;
        align-items: center;
    }
}

.collect-box {
    font-size: 14px;
    .collect-title{
        font-weight: bold;
        margin: 5px 0;
        position: relative;
        .collect-close {
            position: absolute;
            right: 0;
            top: 0;
            width: 24px;
            height: 24px;
            border-radius: 4px;
            &:hover {
                background-color: #999;
                color: #fff;
            }
        }
    }
    div:not(:first-child) {
        padding: 5px 0;
        border-bottom: 1px solid #eee;
        &:hover {
            background-color: #F0F2F5;
            cursor: pointer;
        }
    }
    div:last-child {
        border-bottom: none;
    }
    .collect-item {
        box-sizing: border-box;
        padding: 0 10px;
        min-width: 180px;
        &.is-active {
            color: var(--el-color-primary);
        }
        .collect-item-icon {
            color: #303030;
            display: flex;
            .edit-span,
            .close-span {
                display: flex;
                cursor: pointer;
                box-sizing: border-box;
                width: 24px;
                height: 24px;
                justify-content: center;
                align-items: center;
                border-radius: 4px;
                position: relative;
                top: -1px;
                &:hover {
                    background-color: #999;
                    color: #fff;
                }
            }
        }
    }
}

</style>
