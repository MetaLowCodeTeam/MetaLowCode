<template>
    <!-- 列表详情 -->
    <mlListDetails ref="mlListDetailsRefs" @tabChange="tabChange">
        <template #tab>
            <TabMemberList
                v-model="memberList"
                @delMembers="changeMembers"
                :id="detailId"
                :isRole="detailEntity == 'User'"
                :isDisabled="!checkRole(4)"
            />
        </template>
        <template #operate="{row}">
            <el-row class="action-group">
                <el-col :span="24">
                    <AddMembers
                        @addMembers="changeMembers"
                        :paramId="detailId"
                        :paramName="detailEntity == 'Team' ? '成员' : '角色'"
                        :paramType="detailEntity == 'Team' ? 'User' : 'Role'"
                        :isDisabled="!checkRole(3)"
                    />
                </el-col>
                <el-col :span="24">
                    <el-button icon="Edit" @click="editClick(row)" :disabled="!checkRole(3)">编辑</el-button>
                </el-col>
                <el-col :span="24" v-if="detailEntity == 'User'">
                    <el-button
                        icon="Key"
                        @click="openResetPasswordDialog(row)"
                        :disabled="!checkRole(3)"
                    >重置密码</el-button>
                </el-col>
                <el-col :span="24">
                    <el-dropdown trigger="click">
                        <el-button>
                            更多
                            <el-icon style="transform: rotate(90deg);">
                                <ElIconMoreFilled />
                            </el-icon>
                        </el-button>
                        <template #dropdown>
                            <el-dropdown-menu>
                                <el-dropdown-item :disabled="!checkRole(4)">
                                    <span @click="delCick(row[idFieldName])" v-if="checkRole(4)">删除</span>
                                    <span v-else>删除</span>
                                </el-dropdown-item>
                            </el-dropdown-menu>
                        </template>
                    </el-dropdown>
                </el-col>
            </el-row>
        </template>
    </mlListDetails>
    <mlCustomEdit
        ref="editRefs"
        @onConfirm="onRefresh"
        :isTeam="detailEntity == 'Team'"
        :isUser="detailEntity == 'User'"
        :nameFieldName="detailEntity == 'User' ? 'userName' : 'teamName'"
    />
    
    <!-- 重置密码 -->
    <ml-dialog title="重置密码" v-model="resetPasswordDialogIsShow" appendToBody width="450px">
        <el-input v-model="newPassword" placeholder="输入密码" clearable>
            <template #append>
                <span class="generate-pwd" @click="generatePwd">生成随机密码</span>
            </template>
        </el-input>
        <template #footer>
            <el-button @click="resetPasswordDialogIsShow = false">取消</el-button>
            <el-button type="primary" @click="confirmResetPassword">确定</el-button>
        </template>
    </ml-dialog>
</template>

<script setup>
import { inject, ref } from "vue";
import AddMembers from "./AddMembers.vue";
import TabMemberList from "./TabMemberList.vue";
import mlCustomEdit from '@/components/mlCustomEdit/index.vue';
import useCommonStore from "@/store/modules/common";
import { getTeamMembers, delTeam } from "@/api/team";
import { deleteUserById, getUserRole } from "@/api/user";
import { ElMessage, ElMessageBox } from "element-plus";
import http from "@/utils/request";
const $TOOL = inject("$TOOL");
const props = defineProps({
    idFieldName: { type: String, default: "" },
    nameFieldName: { type: String, default: "" },
});
const emits = defineEmits(["onRefresh"]);
// 详情组件
let mlListDetailsRefs = ref();
const { queryEntityNameById } = useCommonStore();

// 详情ID
let detailId = ref("");
// 详情实体
let detailEntity = ref("");
// 打开详情
const openDetailDialog = (id, title) => {
    detailEntity.value = queryEntityNameById(id);
    detailId.value = id;
    mlListDetailsRefs.value.openDialog({
        title: title,
        id: id,
        tabs: [
            {
                label: detailEntity.value == "Team" ? "成员列表" : "角色列表",
                name: "memberList",
            },
        ],
    });
};

// 刷新弹框
const onRefresh = () => {
    mlListDetailsRefs.value.refresh();
    emits("onRefresh");
};

// 成员列表
let memberList = ref([]);

// 添加成员
const changeMembers = () => {
    mlListDetailsRefs.value.refresh();
};

// 删除
const delCick = (id) => {
    ElMessageBox.confirm("是否确认删除?", "提示：", {
        confirmButtonText: "确认",
        cancelButtonText: "取消",
        type: "warning",
    })
        .then(async () => {
            let res;
            if (detailEntity.value == "Team") {
                res = await delTeam(id);
            } else {
                if (id === "021-000000000000000000000000000000000001") {
                    ElMessage.info("管理员用户禁止删除！");
                    return;
                }
                res = await deleteUserById(id);
            }
            if (res) {
                ElMessage.success("删除成功");
                mlListDetailsRefs.value.closeDialog();
                emits("onRefresh");
            }
        })
        .catch(() => {});
};

// 页签切换
const tabChange = async (tab) => {
    mlListDetailsRefs.value.loading = true;
    // 获取团队成员
    memberList.value = [];
    let res;
    if (detailEntity.value == "Team") {
        res = await getTeamMembers(tab.id);
    } else {
        res = await getUserRole(tab.id);
    }
    if (res) {
        if (detailEntity.value == "Team") {
            memberList.value = res.data || [];
        } else {
            memberList.value = res.data.data || [];
        }
    }
    mlListDetailsRefs.value.loading = false;
};

// 检查权限
const checkRole = (type) => {
    let entityName = detailEntity.value == "Team" ? 24 : 21;
    return $TOOL.checkRole("r" + entityName + "-" + type);
};

/**
 * ********************************************** 编辑弹框相关 beg
 */
// 编辑弹框
let editRefs = ref();

// 编辑
const editClick = (row) => {
    let tempV = {};
    tempV.detailId = row[props.idFieldName];
    editRefs.value.openDialog(tempV);
};

/**
 * ********************************************** 重置密码相关 beg
 */

let resetPasswordDialogIsShow = ref(false);
let resetPasswordUserId = ref("");
let newPassword = ref("");
// 打开重置密码弹框
const openResetPasswordDialog = (row) => {
    resetPasswordDialogIsShow.value = true;
    resetPasswordUserId.value = row.userId;
    newPassword.value = "";
};

// 生成密码
const generatePwd = () => {
    newPassword.value = "xxxcxxx".replace(/[xy]/g, function (c) {
        var r = (Math.random() * 16) | 0,
            v = c == "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
};

// 确认修改密码
const confirmResetPassword = async () => {
    if (!newPassword.value) {
        ElMessage.error("请输入密码");
        return;
    }
    let regEx =
        /(?=.*([a-zA-Z].*))(?=.*[0-9].*)[a-zA-Z0-9-*/+.~!@#$%^&*()]{6,20}$/;
    if (!regEx.test(newPassword.value)) {
        ElMessage.error("必须包含数字、英文。可有字符。密码长度为：6-20位");
        return;
    }
    let res = await http.get("/user/resetPassword", {
        password: newPassword.value,
        userId: resetPasswordUserId.value,
    });
    if (res && res.code == 200) {
        ElMessage.success("重置成功");
        newPassword.value = "";
        resetPasswordDialogIsShow.value = false;
        onRefresh();
    }
};
defineExpose({
    openDetailDialog,
});
</script>
<style lang='scss' scoped>
.action-group {
    :deep(.el-button) {
        margin-bottom: 5px;
        min-width: 110px !important;
    }
}
</style>