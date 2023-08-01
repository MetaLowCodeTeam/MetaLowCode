<template>
    <mlDialog v-model="isShow" :title="title" width="35%">
        <el-form label-position="top" label-width="100px" v-loading="loading">
            <el-form-item label="批注">
                <el-input
                    v-model="form.remark"
                    :autosize="{ minRows: 4, maxRows: 6 }"
                    type="textarea"
                    placeholder="输入批注(可选)"
                    maxlength="500"
                    show-word-limit
                />
            </el-form-item>
            <el-form-item v-if="approvalTask.userSelectFlag">
                <template #label>
                    <el-icon class="icon filled-icon">
                        <el-icon-user-filled />
                    </el-icon>下一审批人(或签)
                </template>
                <mlSelectUser v-model="form.nextApprovalUserList" multiple clearable />
            </el-form-item>
            <el-form-item>
                <template #label>
                    <el-icon class="icon promotion-icon">
                        <el-icon-promotion />
                    </el-icon>本次审批结果将抄送给
                </template>
                <mlSelectUser v-model="form.currentCCToUserList" multiple clearable />
            </el-form-item>
            <el-form-item style="margin-bottom: 0;">
                <div class="foot-btn w-100">
                    <el-dropdown
                        trigger="click"
                        @command="handleCommand"
                        v-if="approvalTask.transferApproval || approvalTask.addSignaturesApproval"
                    >
                        <span class="el-dropdown-link">
                            <el-icon class="el-icon--right">
                                <ElIconMoreFilled />
                            </el-icon>
                        </span>
                        <template #dropdown>
                            <el-dropdown-menu>
                                <el-dropdown-item
                                    v-if="approvalTask.transferApproval"
                                    :icon="Avatar"
                                    :command="1"
                                >转审</el-dropdown-item>
                                <el-dropdown-item
                                    v-if="approvalTask.addSignaturesApproval"
                                    :icon="CirclePlusFilled"
                                    :command="2"
                                >加签</el-dropdown-item>
                            </el-dropdown-menu>
                        </template>
                    </el-dropdown>
                    <el-button type="primary" @click="confirmApprove(false)">同意</el-button>
                    <el-button type="danger" @click="confirmApprove(true)">驳回</el-button>
                    <el-button @click="canner">取消</el-button>
                </div>
            </el-form-item>
        </el-form>
    </mlDialog>
    <mlDialog v-model="otherDialog" :title="taskOperation.title" width="35%" appendToBody>
        <el-form label-position="top" label-width="100px" v-loading="otherLoading">
            <el-form-item :label="taskOperation.title + '到哪些用户'">
                <mlSelectUser type="User" v-model="taskOperation.nodeRoleList" multiple clearable />
            </el-form-item>
            <el-form-item style="margin-bottom: 0;">
                <div class="foot-btn w-100">
                    <el-button type="primary" @click="confirmApostille">确定</el-button>
                    <el-button @click="otherDialog = false">取消</el-button>
                </div>
            </el-form-item>
        </el-form>
    </mlDialog>
</template>

<script setup>
import http from "@/utils/request";
import { Avatar, CirclePlusFilled } from "@element-plus/icons-vue";
import { watch, ref, onMounted, inject } from "vue";
const props = defineProps({
    modelValue: null,
    taskId: { type: String, default: "" },
    entityId: { type: String, default: "" },
    title: { type: String, default: "" },
});
const emit = defineEmits(["update:modelValue", "canner", "confirm"]);
const $ElMessage = inject("$ElMessage");
let loading = ref(false);
// 弹框是否显示
let isShow = ref(null);
// 审核数据
let form = ref({
    // 批注
    remark: "",
    // 下一审批人
    nextApprovalUserList: [],
    // 本次抄送
    currentCCToUserList: [],
    // 关联实体
    entityId: "",
    // 是否驳回
    isBacked: false,
});
let approvalTask = ref({});
// 其他弹框是否出现
let otherDialog = ref(false);
let otherLoading = ref(false);
// 其他弹框类型
let taskOperation = ref({
    title: "转审",
    // 1:转审 2:加签
    type: 1,
    // 关联实体
    entityId: "",
    //    操作用户
    nodeRoleList: [],
});
watch(
    () => props.modelValue,
    () => {
        isShow.value = props.modelValue;
    },
    { deep: true }
);
onMounted(() => {
    isShow.value = props.modelValue;
    getApprovalTaskById();
});

// 拓展按钮点击
function handleCommand(type) {
    otherDialog.value = true;
    taskOperation.value.title = type == 1 ? "转审" : "加签";
    taskOperation.value.type = type;
    taskOperation.value.entityId = props.entityId;
    taskOperation.value.nodeRoleList = [];
}
// 确认加签
async function confirmApostille() {
    otherLoading.value = true;
    let res = await http.post("/approval/taskOperation", taskOperation.value);
    if (res.code === 200) {
        let { type, title } = taskOperation.value;
        $ElMessage.success(title + "成功");
        otherDialog.value = false;
        // 如果是转审，2个弹框都要关掉
        if (type == 1) {
            canner();
            emit("confirm");
        }
        otherLoading.value = false;
    } else {
        otherLoading.value = false;
        $ElMessage.error("操作失败：" + res.error);
    }
}

// 同意审批
async function confirmApprove(isBacked) {
    loading.value = true;
    form.value.entityId = props.entityId;
    form.value.isBacked = isBacked;
    let res = await http.post("/approval/approvalProcess", form.value);
    if (res.code === 200) {
        let msg = isBacked ? "驳回" : "审批";
        $ElMessage.success(msg + "成功");
        canner();
        emit("confirm");
    } else {
        $ElMessage.error("操作失败：" + res.error);
    }
    loading.value = false;
}

// 获取审核参数
async function getApprovalTaskById() {
    loading.value = true;
    let res = await http.get("/approval/getApprovalTaskById", {
        approvalTaskId: props.taskId,
    });
    if (res.code === 200) {
        approvalTask.value = res.data;
    } else {
        $ElMessage.error("操作失败：" + res.error);
    }
    loading.value = false;
}

// 关闭弹框
function canner() {
    isShow.value = false;
    emit("update:modelValue", false);
}
</script>

<style lang="scss" scoped>
.icon {
    position: relative;
}
.filled-icon {
    top: 1px;
}
.foot-btn {
    text-align: right;
    .el-dropdown-link {
        display: inline-block;
        width: 30px;
        background: #e3e3e3;
        height: 33px;
        line-height: 33px;
        border-radius: 4px;
        margin-right: 10px;
        text-align: center;
        margin-top: 1px;
        cursor: pointer;
        .el-icon--right {
            transform: rotate(90deg);
            position: relative;
            left: -2px;
            top: 2px;
        }
    }
}
</style>