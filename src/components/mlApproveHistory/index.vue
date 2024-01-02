<template>
    <mlDialog v-model="isShow" :title="title" width="35%">
        <div class="timeline-div" v-loading="loading">
            <el-timeline v-if="approveHistory.length > 0">
                <el-timeline-item
                    v-for="(activity, index) in approveHistory"
                    :key="index"
                    :type="getTimelineType(index,activity)"
                    size="large"
                    class="ml-timeline-item"
                >
                    <div class="item-row">
                        <div
                            class="step-name-title"
                            v-if="!!getStepName(index,activity)"
                        >{{ getStepName(index,activity) }}</div>
                        <div class="item-timestamp">{{ activity.createdOn }}</div>
                        <div class="item-content before" v-if="index == 0">
                            <div class="item-title mb-5">由 {{ activity.stepUserName }} 提交审批</div>
                            <div class="item-step-name">
                                <span class="item-step-name-span" @click="goApprovalList(activity)">
                                    <el-icon class="item-step-icon">
                                        <ElIconCircleCheck />
                                    </el-icon>
                                    {{ activity.stepName }}
                                </span>
                            </div>
                        </div>
                        <div class="item-content" v-if="index != 0 && activity.state != 13">
                            <div
                                class="contain-div"
                                v-if="activity.singLabel && activity.needRow > 1"
                                :style="getContainHeight(activity)"
                            >
                                <span class="contain-span">{{ activity.singLabel }}</span>
                            </div>
                            <div class="item-title">
                                <span
                                    class="mr-5"
                                    v-if="activity.state === 0"
                                >等待 {{ activity.stepUserName }} 审批</span>
                                <span class="mr-5" v-if="activity.state === 1">
                                    由 {{ activity.stepUserName }} 审批同意
                                    <el-tooltip
                                        effect="dark"
                                        :content="activity.remark || 'error'"
                                        placement="top"
                                    >
                                        <span
                                            style="position: relative;top: 2px;cursor: pointer;"
                                            v-if="activity.remark"
                                        >
                                            <el-icon>
                                                <ElIconQuestionFilled />
                                            </el-icon>
                                        </span>
                                    </el-tooltip>
                                </span>
                                <span class="mr-5" v-if="activity.state === 11">
                                    由 {{ activity.stepUserName }} 驳回
                                    <el-tooltip
                                        effect="dark"
                                        :content="activity.remark || 'error'"
                                        placement="top"
                                    >
                                        <span
                                            style="position: relative;top: 2px;cursor: pointer;"
                                            v-if="activity.remark"
                                        >
                                            <el-icon>
                                                <ElIconQuestionFilled />
                                            </el-icon>
                                        </span>
                                    </el-tooltip>
                                </span>
                                <span class="mr-5" v-if="activity.state === 12">
                                    由 {{ activity.stepUserName }} 撤销
                                    <el-tooltip
                                        effect="dark"
                                        :content="activity.remark || 'error'"
                                        placement="top"
                                    >
                                        <span
                                            style="position: relative;top: 2px;cursor: pointer;"
                                            v-if="activity.remark"
                                        >
                                            <el-icon>
                                                <ElIconQuestionFilled />
                                            </el-icon>
                                        </span>
                                    </el-tooltip>
                                </span>
                                <el-tag v-if="activity.operationState === 1" type="warning">转审</el-tag>
                                <el-tag v-if="activity.operationState === 2" type="warning">加签</el-tag>
                            </div>
                        </div>
                    </div>
                </el-timeline-item>
            </el-timeline>
            <el-empty v-else :image-size="100" description="未查询到流程记录" />
        </div>
    </mlDialog>
</template>

<script setup>
import http from "@/utils/request";
import { watch, ref, onMounted, inject, reactive } from "vue";
import { useRouter } from "vue-router";
const Route = useRouter();
const props = defineProps({
    modelValue: null,
    entityId: { type: String, default: "" },
    title: { type: String, default: "" },
});
import useCommonStore from "@/store/modules/common";
const { queryEntityCodeById } = useCommonStore();
const emit = defineEmits(["update:modelValue", "canner", "confirm"]);
const signType = reactive({
    1: "会签",
    2: "或签",
});
let loading = ref(false);
// 弹框是否显示
let isShow = ref(null);
watch(
    () => props.modelValue,
    () => {
        isShow.value = props.modelValue;
    },
    { deep: true }
);
watch(
    () => isShow.value,
    (v) => {
        emit("update:modelValue", v);
    },
    { deep: true }
);
onMounted(() => {
    isShow.value = props.modelValue;
    getTaskDetailsById();
});

let approveHistory = ref([]);

const getTimelineType = (index, activity) => {
    if (index == 0) {
        return "primary";
    }
    let warningType = [11, 12];
    if (warningType.includes(activity.state)) {
        return "warning";
    }
    let dangerType = [13];
    if (dangerType.includes(activity.state)) {
        return "danger";
    }
    let infoType = [1];
    if (infoType.includes(activity.state)) {
        return "info";
    }
    return "success";
};

// 获取步揍名称
function getStepName(inx, item) {
    if (inx === 0) {
        return null;
    }
    let stepName = null;
    if (item.stepName != approveHistory.value[inx - 1].stepName) {
        stepName = item.stepName;
    }
    return stepName;
}
// 获取包括高度
function getContainHeight(item) {
    let height = 75 * (item.needRow - 1) + 38;
    return {
        height: height + "px",
        lineHeight: height + "px",
        top: -(75 * (item.needRow - 1)) + "px",
    };
}

// 获取审核参数
async function getTaskDetailsById() {
    loading.value = true;
    let res = await http.get("/approval/getTaskDetailsById", {
        entityId: props.entityId,
    });
    if (res) {
        approveHistory.value = formatResData(res.data);
    }
    loading.value = false;
}

// 格式化数据
function formatResData(data) {
    let newData = [];
    data.forEach((el) => {
        el.needRow = 1;
        el.singLabel = signType[el.signType];
        newData.push(el);
    });
    newData.forEach((el, inx) => {
        if (newData[inx - 1]) {
            if (el.currentNode == newData[inx - 1].currentNode) {
                el.needRow = 1 + newData[inx - 1].needRow;
                newData[inx - 1].singLabel = null;
            }
        }
    });
    return newData;
}

// 配置流程
const goApprovalList = (activity) => {
    Route.push({
        path: "/web/custom-page/approval-detail",
        query: {
            approvalConfigId: activity.recordId,
            entityCode: queryEntityCodeById(props.entityId),
            look:1
        },
    });
};

// 关闭弹框
function canner() {
    isShow.value = false;
}
</script>

<style lang="scss" scoped>
.timeline-div {
    min-height: 100px;
    max-height: 400px;
    overflow-x: auto;
    padding: 5px;
    .ml-timeline-item {
        padding-bottom: 10px !important;
    }
}
.item-row {
    .step-name-title {
        font-weight: bold;
        color: #404040;
        font-size: 14px;
        line-height: 20px;
        margin: 5px 0;
    }
    .item-content {
        padding: 10px 15px;
        font-size: 13px;
        color: #404040;
        background: #f5f5f5;
        border-radius: 4px;
        margin-top: 3px;
        width: calc(100% - 40px);
        position: relative;
        // &.before {
        //     width: 100%;
        // }
        .item-step-name {
            height: 26px;
            line-height: 26px;
            border-left: 4px solid #e0e0e0;
            margin-left: 5px;
            padding-left: 10px;
            .item-step-icon {
                position: relative;
                top: 2px;
            }
            .item-step-name-span {
                color: var(--el-color-primary);
                cursor: pointer;
                &:hover {
                    color: #0d5bdd;
                }
            }
        }
        .contain-div {
            position: absolute;
            right: 0px;
            border-radius: 0 4px 4px 0px;
            border-right: 4px solid var(--el-color-primary);
            .contain-span {
                float: right;
                margin-right: -40px;
            }
        }
    }
}
</style>