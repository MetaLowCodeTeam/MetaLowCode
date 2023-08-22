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
    // 触发动作
    whenNum: 0,
    // 过滤条件
    filter: {
        items: [],
    },
    // cron表达式
    cron: "",
    // 目标实体数据
    dataUpdateEntityList: [],
    // 选择的目标实体
    selectTagEntity: "",
    // 禁用目标实体
    tagEntityIsDisabled: false,
    // 当前实体所有字段
    entityFields: [],
    // 更新规则
    uptadeRuleList: [],
    // 聚合条件
    polymerization: {
        items: [],
    },
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
        // 编辑回显
        if (trigger.actionContent) {
            let actionContent = JSON.parse(trigger.actionContent);
            trigger.entityName = actionContent.entityName;
            trigger.fieldName = actionContent.fieldName;
            trigger.N = actionContent.N;
            trigger.uptadeRuleList = [...actionContent.items];
            trigger.tagEntityIsDisabled = true;
        }
        if (trigger.actionFilter) {
            trigger.filter = JSON.parse(trigger.actionFilter);
        }
        if (trigger.whenCron) {
            trigger.cron = trigger.whenCron;
        }
        // console.log(trigger, "触发器详情数据...");
        // 获取操作内容数据
        getActionContentData();
    } else {
        $ElMessage.error(detailRes.error);
    }
    initLoading.value = false;
};

/**
 * *************************************** 获取操作内容数据相关 beg
 */
let performOperationsRef = ref();

// 获取操作内容数据
const getActionContentData = async () => {
    performOperationsRef.value.contentLoading = true;
    let { value } = trigger.actionType;
    // 字段更新、字段聚合
    if (value == 1 || value == 2) {
        Promise.all([getDataUpdateEntityList(), getEntityFields()]).then(() => {
            performOperationsRef.value.contentLoading = false;
        });
    }
};
// 获取目标实体所有字段
const getDataUpdateEntityList = () => {
    return new Promise(async (resolve, reject) => {
        let res = await $API.trigger.detial.dataUpdateEntityList(
            trigger.entityCode
        );
        if (res.code === 200) {
            trigger.dataUpdateEntityList = res.data;
            // 目标实体默认选中第1个
            let defalutInx = 0;
            // 如果是编辑过的，找到之前选中的数据
            if (trigger.tagEntityIsDisabled) {
                trigger.dataUpdateEntityList.forEach((el, elInx) => {
                    if (
                        el.fieldName == trigger.fieldName &&
                        el.entityName == trigger.entityName
                    ) {
                        defalutInx = elInx;
                    }
                });
            }
            // 设置选中
            trigger.selectTagEntity = defalutInx;
            // 获取选中实体的所有字段
            performOperationsRef.value.getTargetFieldList(
                res.data[defalutInx].entityCode
            );
            resolve();
        } else {
            $ElMessage.error("获取目标实体数据失败：" + res.error);
            resolve();
        }
    });
};
const getEntityFields = () => {
    return new Promise(async (resolve, reject) => {
        let res = await queryEntityFields(trigger.entityCode);
        if (res.code === 200) {
            trigger.entityFields = res.data;
            // console.log(res.data, "获取当前实体所有字段");
            resolve();
        } else {
            $ElMessage.error("获取当前实体字段数据失败：" + res.error);
            resolve();
        }
    });
};
/**
 * *************************************** 获取操作内容数据相关 end
 */

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
const onSave = async () => {
    let {
        uptadeRuleList,
        triggerConfigId,
        whenNum,
        filter,
        priority,
        entityName,
        fieldName,
        N,
    } = trigger;
    // 如果是更新规则
    if (trigger.actionType.value == 1 && uptadeRuleList.length < 1) {
        $ElMessage.warning("请至少添加 1 个更新规则");
        return;
    }
    let params = {
        entity: "TriggerConfig",
        id: triggerConfigId,
        formModel: {
            triggerConfigId,
            priority,
        },
    };
    // 如果有触发动作
    if (whenNum > 0) {
        // 如果触发动作勾选了定期执行
        if ((whenNum & 512) > 0) {
            params.formModel.whenCron = trigger.cron;
        }
        params.formModel.whenNum = whenNum;
    }

    // 如果有附加过滤条件
    if (filter.items.length > 0) {
        params.formModel.actionFilter = JSON.stringify(filter);
    }
    // 如果是 更新规则 保存
    if (trigger.actionType.value == 1 && uptadeRuleList.length > 0) {
        let actionContent = {
            entityName,
            fieldName,
            N,
            items: uptadeRuleList,
        };
        params.formModel.actionContent = JSON.stringify(actionContent);
    }
    initLoading.value = true;
    let res = await saveRecord(params.entity, params.id, params.formModel);
    if (res.code == 200) {
        notTitleDialog.isShow = true;
        notTitleDialog.type = 1;
        // 禁用目标实体
        trigger.tagEntityIsDisabled = true;
    } else {
        $ElMessage.error("保存失败：" + res.error);
    }
    initLoading.value = false;
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