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
                            <PerformOperations ref="performOperationsRef" v-model="trigger" />
                            <div class="footer-box">
                                <el-button type="primary" @click="onSave">保存</el-button>
                            </div>
                        </el-timeline-item>
                        <el-timeline-item>
                            <div style="height: 10px;"></div>
                        </el-timeline-item>
                    </el-timeline>
                </div>
            </el-container>
        </el-container>
    </div>
</template>

<script setup>
import { queryById, queryEntityFields } from "@/api/crud";
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
    actionNum: 0,
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
    // 当前实体所有字段
    entityFields: [],
    // 更新规则
    uptadeRuleList: [],
    // 聚合条件
    polymerization:{
        items:[]
    },
});
onBeforeMount(() => {
    trigger.triggerConfigId = router.currentRoute.value.query.triggerConfigId;
    initDetailData();
});

const onSave = () => {
    // 需要定期执行
    // if ((trigger.actionNum & 512) > 0) {
    //     trigger.cron = triggerTakeActionRef.value.getCronVal();
    // }
    console.log(trigger, "保存调用...");
};

// 初始化详情数据
const initDetailData = async () => {
    initLoading.value = true;
    let fieldNames = "priority,entityCode,name,actionType,actionContent";
    let detailRes = await queryById(trigger.triggerConfigId, fieldNames);
    if (detailRes.code == 200) {
        trigger = Object.assign(trigger, detailRes.data);
        trigger.priority = trigger.priority || 0;
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
// 获取目标实体数据
const getDataUpdateEntityList = () => {
    return new Promise(async (resolve, reject) => {
        let res = await $API.trigger.detial.dataUpdateEntityList(
            trigger.entityCode
        );
        if (res.code === 200) {
            trigger.dataUpdateEntityList = res.data;
            // 目标实体默认选中第1个
            trigger.selectTagEntity = 0; 
            performOperationsRef.value.getTargetFieldList(res.data[0].entityCode);
            // console.log(res.data, "获取目标实体数据");
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
}
</style>