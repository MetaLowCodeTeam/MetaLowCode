<template>
    <div v-loading="initLoading">
        <el-container>
            <el-header>
                <div class="trigger-header">
                    <span class="trigger-title">触发器</span>
                    /
                    <span class="trigger-name">{{ trigger.name }}</span>
                </div>
            </el-header>
            <el-container class="trigger-main-container">
                <div class="trigger-main">
                    <el-timeline>
                        <el-timeline-item type="primary" hollow>
                            <div class="timeline-item-title">当发生动作</div>
                            <TriggerTakeAction v-model="trigger" />
                        </el-timeline-item>
                        <el-timeline-item type="warning" hollow>
                            <div class="timeline-item-title">就执行操作</div>
                            <PerformOperations
                                ref="performOperationsRef"
                                v-model="trigger"
                                @onSave="onSave"
                            />
                            <!-- <div class="footer-box">
                                <el-button type="primary" @click="onSave">保存</el-button>
                            </div>-->
                        </el-timeline-item>
                        <el-timeline-item>
                            <div style="height: 10px;"></div>
                        </el-timeline-item>
                    </el-timeline>
                    <ml-dialog v-model="notTitleDialog.isShow" width="500" not-header top="30vh">
                        <div class="save-success" v-if="notTitleDialog.type == 1">
                            <div>
                                <el-icon class="save-icon" size="50">
                                    <ElIconWarning />
                                </el-icon>
                            </div>
                            <div class="mt-5 save-info">保存成功</div>
                            <div class="mt-20">
                                <el-button @click="goTriggerList">返回列表</el-button>
                                <el-button
                                    type="primary"
                                    @click="notTitleDialog.isShow = false"
                                >继续编辑</el-button>
                            </div>
                        </div>
                        <div class="save-warning" v-if="notTitleDialog.type == 2">
                            <div>
                                <el-icon class="save-icon" size="50">
                                    <ElIconWarning />
                                </el-icon>
                            </div>
                            <div class="mt-5 save-info">计算公式可能存在错误，这会导致触发器执行失败。是否继续？</div>
                            <div class="mt-20">
                                <el-button @click="notTitleDialogIsShow = false;">取消</el-button>
                                <el-button type="warning" @click="test1">确定</el-button>
                            </div>
                        </div>
                    </ml-dialog>
                </div>
            </el-container>
        </el-container>
    </div>
</template>

<script setup>
import { queryById, queryEntityFields, saveRecord } from "@/api/crud";
import { onBeforeMount, ref, inject, reactive } from "vue";
import { useRouter } from "vue-router";
import { ElMessageBox } from "element-plus";
// 当发生动作
import TriggerTakeAction from "./components/TriggerTakeAction.vue";
// 就执行操作
import PerformOperations from "./components/PerformOperations.vue";
const $ElMessage = inject("$ElMessage");
const $API = inject("$API");
const router = useRouter();
// 初始化loading
let initLoading = ref(false);
// 触发器数据
let trigger = reactive({
    // 实体ID
    triggerConfigId: "",
    // cron表达式
    whenCron: null,
    // 操作内容
    actionContent: "",
    // 是否保存过
    isOnSave: false,
    // 禁用触发动作
    disabledActive: [],
});
onBeforeMount(() => {
    trigger.triggerConfigId = router.currentRoute.value.query.triggerConfigId;
    initDetailData();
});

// const onSave = () => {
//     // 需要定期执行
//     // if ((trigger.whenNum & 512) > 0) {
//     //     trigger.cron = triggerTakeActionRef.value.getCronVal();
//     // }
//     console.log(trigger, "保存调用...");
// };

// 初始化详情数据
const initDetailData = async () => {
    initLoading.value = true;
    let fieldNames =
        "priority,entityCode,name,actionType,actionContent,whenNum,actionFilter,whenCron";
    let detailRes = await queryById(trigger.triggerConfigId, fieldNames);
    if (detailRes.code == 200) {
        trigger = Object.assign(trigger, detailRes.data);
        trigger.priority = trigger.priority || 1;
        trigger.actionContent = trigger.actionContent
            ? JSON.parse(trigger.actionContent)
            : { items: [] };
        trigger.actionFilter = trigger.actionFilter
            ? JSON.parse(trigger.actionFilter)
            : { items: [] };
        // 编辑回显
        if (trigger.actionContent.items.length > 0) {
            trigger.isOnSave = true;
        }
        // 禁用触发动作
        if (trigger.actionType.value == 4) {
            trigger.disabledActive = [512];
        }
    } else {
        $ElMessage.error(detailRes.error);
    }
    initLoading.value = false;
};

// 返回列表
const goTriggerList = () => {
    router.push({
        path: "/trigger-list",
    });
};

// 无标题弹框
let notTitleDialog = reactive({
    isShow: false,
    // 1 保存
    type: 1,
});

// 保存调用
const onSave = async (target) => {
    let { triggerConfigId, whenNum, priority, actionContent } = trigger;
    // 如果是更新规则
    if (trigger.actionType.value == 1 && actionContent.items.length < 1) {
        $ElMessage.warning("请至少添加 1 个更新规则");
        return;
    }
    // 如果是聚合规则
    if (trigger.actionType.value == 2 && actionContent.items.length < 1) {
        $ElMessage.warning("请至少添加 1 个聚合规则");
        return;
    }
    let params = {
        id: triggerConfigId,
        formModel: {
            triggerConfigId,
            priority,
            whenCron: null,
        },
    };
    // 如果有触发动作
    if (whenNum > 0 && !target) {
        // 如果触发动作勾选了定期执行
        if ((whenNum & 512) > 0 && !trigger.whenCron) {
            $ElMessage.warning("请配置定期执行cron表达式");
            return;
        }
        params.formModel.whenCron = trigger.whenCron;
        params.formModel.whenNum = whenNum;
    }
    // 如果有附加过滤条件
    if (trigger.actionFilter.items.length > 0) {
        params.formModel.actionFilter = JSON.stringify(trigger.actionFilter);
    }
    // 如果是数据效验
    if (trigger.actionType.value == 4) {
        if (actionContent.filter.items.length < 1) {
            $ElMessage.warning("请至少选择一个效验条件");
            return;
        }
        if (!actionContent.tipContent) {
            $ElMessage.warning("请填写提示内容");
            return;
        }
    }
    // 如果是发送通知
    if (trigger.actionType.value == 5) {
        let { type, title, content, outUserList, userType, inUserList } =
            actionContent;
        if (type < 1) {
            $ElMessage.warning("请至少选择一个通知类型");
            return;
        }
        if (userType == 1 && inUserList.length < 1) {
            $ElMessage.warning("请选择要发送到的内部用户");
            return;
        }
        if (userType == 2 && outUserList.length < 1) {
            $ElMessage.warning("请选择要发送到的外部人员");
            return;
        }
        // 如果是内部用户，只要用户ID
        if (userType == 1) {
            actionContent.sendTo = [];
            inUserList.forEach((el) => {
                actionContent.sendTo.push(el.id);
            });
            actionContent.sendTo = JSON.stringify(actionContent.sendTo);
        } else {
            actionContent.sendTo = JSON.stringify(outUserList);
        }
        // 如果勾选了邮件，但是没填标题
        if ((type & 8) > 0 && !title) {
            $ElMessage.warning("请输入邮件标题");
            return;
        }
        if (!content) {
            $ElMessage.warning("请输入通知内容");
            return;
        }
        // console.log(actionContent, "actionContent");
        // return;
    }
    // 如果是回调URL
    if (trigger.actionType.value == 14) {
        if (!actionContent.hookUrl) {
            $ElMessage.warning("请数要推送到的URL");
            return;
        }
    }
    params.formModel.actionContent = JSON.stringify(actionContent);
    if (target == "execute") {
        actionExecute(params);
        return;
    }

    initLoading.value = true;

    let res = await $API.trigger.detial.triggerSave(
        params.id,
        params.formModel
    );
    if (res.code == 200) {
        notTitleDialog.isShow = true;
        notTitleDialog.type = 1;
        // 禁用目标实体
        trigger.isOnSave = true;
    } else {
        $ElMessage.error("保存失败：" + res.error);
    }
    initLoading.value = false;
};

// 立即执行
const actionExecute = (params) => {
    ElMessageBox.confirm(
        "此操作将直接执行此触发器，数据过多耗时会较长，请耐心等待。是否继续？?",
        "",
        {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
        }
    )
        .then(async () => {
            initLoading.value = true;
            let res = await $API.trigger.detial.execute({
                entityCode: trigger.entityCode,
                actionFilter: params.formModel.actionFilter || null,
                actionContent: params.formModel.actionContent || null,
                actionType: trigger.actionType.value,
            });
            if (res.code == 200) {
            } else {
                $ElMessage.error("保存失败：" + res.error);
            }
            initLoading.value = false;
        })
        .catch(() => {});
};
</script>

<style lang="scss" scoped>
.trigger-header {
    .trigger-title {
        font-size: 18px;
        color: #6b6b6b;
        margin-right: 5px;
    }
    .trigger-name {
        font-size: 14px;
        font-weight: 700;
        color: #5e5e5e;
        margin-left: 5px;
    }
}
.trigger-main-container {
    padding: 20px;
}
.trigger-main {
    width: 100%;
    border-radius: 4px;
    padding: 40px 20px;
    background: #fff;
    padding-left: 160px;
    .timeline-item-title {
        float: left;
        margin-left: -110px;
    }

    .save-success,
    .save-warning {
        text-align: center;
        .save-icon {
            color: #409eff;
            position: relative;
            left: 12px;
        }
        .save-info {
            font-size: 13px;
            font-weight: bold;
            color: #404040;
        }
    }
    .save-warning .save-icon {
        color: #e6a23c;
    }
}
</style>