<template>
    <mlDialog 
        v-model="isShow" 
        :title="title" 
        width="75%"
        :showFullScreen="isComplexWorkFlow"
        :bodyNoPadding="isComplexWorkFlow"
        @fullScreenChange="fullScreenChange"
        appendToBody
    >
        <div 
            class="clearfix history-body complex-work-flow" 
            :class="{
                'full-screen':fullScreen
            }"
            v-loading="loading"
        >
            <div 
                class="approve-view-box"
                v-if="isComplexWorkFlow"
            >
                <div class="deviation">
                    <ApproveView :entityId="entityId"/>
                </div>
            </div>
            <div class="approve-view-box" v-else>
                <el-scrollbar max-height="600px">
                    <mlWorkflow v-model="nodeConfig" isHideZoom isHideAddNode/>
                </el-scrollbar>
            </div>
            <div class="timeline-div">
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
                            <div class="item-content hh clearfix" v-if="index != 0 && activity.state != 13">
                                <div
                                    class="contain-div"
                                    v-if="activity.singLabel && activity.needRow > 1"
                                    :style="getContainHeight(activity)"
                                >
                                    <span class="contain-span">{{ activity.singLabel }}</span>
                                </div>
                                <div class="item-title"  v-if="activity.subRecord?.id">
                                    <span 
                                        class="mr-5"
                                    >   
                                        等待子流程 【
                                        <span class="ml-a-span" @click="goSubRecord(activity.subRecord?.id)">{{ activity.subRecord?.name }}</span>
                                        】 审批 
                                    </span>
                                </div>
                                <div class="item-title" v-else>
                                    <span
                                        class="mr-5"
                                        v-if="activity.state === 0 && activity.stepUserName"
                                    >等待 {{ activity.stepUserName }} 审批</span>
                                    <span
                                        class="mr-5"
                                        v-if="activity.state === 0 && !activity.stepUserName"
                                    >等待中</span>
                                    <span class="mr-5" v-if="activity.state === 1">
                                        由 {{ activity.stepUserName }} 审批同意
                                        <el-tooltip
                                            effect="dark"
                                            :content="activity.remark || 'error'"
                                            placement="top"
                                            v-if="activity.remark"
                                        >
                                            <span
                                                style="position: relative;top: 2px;cursor: pointer;"
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
                                            v-if="activity.remark"
                                        >
                                            <span
                                                style="position: relative;top: 2px;cursor: pointer;"
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
                                            v-if="activity.remark"
                                        >
                                            <span
                                                style="position: relative;top: 2px;cursor: pointer;"
                                            >
                                                <el-icon>
                                                    <ElIconQuestionFilled />
                                                </el-icon>
                                            </span>
                                        </el-tooltip>
                                    </span>
                                    <span
                                        class="ml-a-span"
                                        v-if="activity.signatureImage"
                                        @click="openPreview(activity.signatureImage)"
                                    >查看签名</span>
                                    <el-tag v-if="activity.operationState === 1" type="warning">转审</el-tag>
                                    <el-tag v-if="activity.operationState === 2" type="warning">加签</el-tag>
                                </div>
                                <span 
                                    class="ml-a-span fr" 
                                    v-if="!activity.subRecord?.id && activity.state === 0 && $TOOL.checkRole('r6000') && activity.stepUserName"
                                    @click="openChangeApproverDialog(activity)"
                                >
                                    修改审批人
                                </span>
                            </div>
                        </div>
                    </el-timeline-item>
                </el-timeline>
                <el-empty v-else :image-size="100" description="未查询到流程记录" />
            </div>
        </div>
    </mlDialog>
    <!-- 查看签名 -->
    <mlDialog
        v-model="previewShow"
        title="查看签名"
        width="685"
        appendToBody
        :top="previewHeight == '640px' ? '7vh' : '15vh'"
    >
        <div
            class="imag-viewer-box"
            :style="{ 'height': previewHeight, 'padding-top': previewHeight == '640px' ? '197px' : 0}"
        >
            <div class="image-viewer" :style="{ 'transform':'rotate('+ previewRotate +'deg)'}">
                <img :src="previewUrl" alt="签名" />
            </div>
        </div>

        <div class="foot-btn w-100">
            <el-button type="primary" @click="previewRotateChange">旋转</el-button>
            <el-button type="primary" @click="previewShow = false">关闭</el-button>
        </div>
    </mlDialog>
    <!-- 查看审批流程 -->
    <!-- <ApproveView ref="ApproveViewRefs"/> -->
    <defaultEntityDetail ref="detailRefs" />
    <ChangeApproverDialog ref="ChangeApproverRef" @onChange="getTaskDetailsById"/>
</template>

<script setup>
import http from "@/utils/request";
import { watch, ref, onMounted, inject, reactive, nextTick } from "vue";
import { useRouter } from "vue-router";
import ApproveView from './components/ApproveView.vue';
// import mlCustomDetail from '@/components/mlCustomDetail/index.vue';
import defaultEntityDetail from "@/views/customize-menu/detail.vue";
import ChangeApproverDialog from './components/ChangeApproverDialog.vue';
import mlWorkflow from "@/components/mlWorkflow/index.vue";
const $TOOL = inject("$TOOL");
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

// 是否复杂工作流
let isComplexWorkFlow = ref(false);
// 是否全屏
let fullScreen = ref(false);


watch(
    () => props.modelValue,
    () => {
        isShow.value = props.modelValue
    },
    {
        deep: true
    }
)

watch(
    () => isShow.value,
    (v) => {
        emit("update:modelValue", v)
    },
    {
        deep: true
    }
)

onMounted(()=>{
    isShow.value = props.modelValue
    if(isShow.value){
        getTaskDetailsById();
    }
})

let approveHistory = ref([]);


const getTaskDetailsById = async () => {
    loading.value = true;
    let res = await http.get("/approval/getTaskDetailsById", {
        entityId: props.entityId
    })
    if(res) {
        approveHistory.value = formatResData(res.data.approvalStepsList);
        isComplexWorkFlow.value = res.data.flowType == 2;
    }
    loading.value = false;
}



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

let nodeConfig = ref({});

const openDialog = (flowType, approvalStepsList, config) => {
    isComplexWorkFlow.value = flowType == 2;
    approveHistory.value = formatResData(approvalStepsList);
    isShow.value = true;
    nextTick(()=>{
        let dom = document.querySelectorAll('.timeline-div')[0];
        dom.scrollTop = dom.scrollHeight - dom.clientHeight;
        nodeConfig.value = config;
    })
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
const appPath = import.meta.env.VITE_APP_PATH;
// 配置流程
const goApprovalList = (activity) => {
    isShow.value = false;
    Route.push({
        path: appPath + "custom-page/approval-detail",
        query: {
            approvalConfigId: activity.recordId,
            entityCode: queryEntityCodeById(props.entityId),
            look: 1,
            flowType: activity.flowType || 1,
        },
    });
    emit('confirm')

};

/**
 * 签名预览
 */

let previewShow = ref(false);
let previewUrl = ref("");
let previewRotate = ref(0);
let previewHeight = ref("240px");
// 打开预览
const openPreview = (url) => {
    previewShow.value = true;
    previewUrl.value = url;
};
// 预览切换旋转角度
const previewRotateChange = () => {
    previewRotate.value += 90;
    if (previewRotate.value % 180 == 0) {
        previewHeight.value = "240px";
    } else {
        previewHeight.value = "640px";
    }
};

let detailRefs = ref();
const goSubRecord = (approvalConfigId) => {
    detailRefs.value.openDialog(approvalConfigId)
}



// 关闭弹框
function canner() {
    isShow.value = false;
}


/**
 * 查看审批流程图片
 */

let ApproveViewRefs = ref();

const openApproveView = () => {
    ApproveViewRefs.value?.openDialog();
}


const fullScreenChange = (v) => {
    fullScreen.value = v;
}

let ChangeApproverRef = ref();
// 打开修改审批人弹框
const openChangeApproverDialog = (activity) => {
    if(activity.approvalTaskId) {
        ChangeApproverRef.value?.openDialog(activity);
    }
}

defineExpose({
    openDialog
})
</script>

<style lang="scss" scoped>
.timeline-div {
    height: 100%;
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
        &.hh {
            line-height: 20px;
            .item-title {
                display: inline-block;
                width: calc(100% - 70px);
            }
        }
    }
}
.image-viewer {
    border: 2px solid #ccc;
    margin: 0 auto;
    box-sizing: border-box;
    width: 640px;
    height: 240px;
    img {
        transition: all 0.3s;
        box-sizing: border-box;
        width: 100%;
        height: 100%;
    }
}
.foot-btn {
    margin-top: 20px;
    text-align: right;
}


.history-body {
    height: 400px;
    
    &.complex-work-flow {
        height: 600px;
        .timeline-div  {
            padding: 20px;
            width: 400px;
            float: right;
        }
    }
    &.full-screen {
        height: calc(100vh - 60px);
    }
    .approve-view-box {
        width: calc(100% - 400px);
        float: left;
        height: 100%;
        overflow: hidden;
        // 左偏移
        $deviationLeft: -100px;
        // 右偏移
        $deviationTop: -140px;
        .deviation {
            width: calc(100% - $deviationLeft);
            height: calc(100% - $deviationTop);
            margin-left: $deviationLeft;
            margin-top: $deviationTop;
        }
    }

}
</style>