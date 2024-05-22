<!--
 * @Descripttion: 仿钉钉流程设计器
 * @version: 1.3
 * @Author: sakuya
 * @Date: 2021年9月14日08:38:35
 * @LastEditors: sakuya
 * @LastEditTime: 2022年5月14日19:43:46
-->

<template>
    <div
        class="sc-workflow-design"
        :class="{'is-default' : style === 'default','is-wecom': style === 'weCom'}"
    >
        <div class="edit-zoom">
            <el-button size="small" style="width: 24px;" @click="editZoom('inc')">
                <el-icon>
                    <ElIconPlus></ElIconPlus>
                </el-icon>
            </el-button>
            <span class="span-zoom ml-5 mr-5">{{ defaultZoom }}%</span>
            <el-button size="small" style="width: 24px;" @click="editZoom('dec')">
                <el-icon>
                    <ElIconMinus></ElIconMinus>
                </el-icon>
            </el-button>
            <el-popover placement="bottom" :width="200" :visible="isShowSetting">
                <template #reference>
                    <el-button
                        size="small"
                        style="width: 24px;"
                        @click="isShowSetting = !isShowSetting"
                    >
                        <el-icon>
                            <ElIconSetting></ElIconSetting>
                        </el-icon>
                    </el-button>
                </template>
                <div class="pt-10">
                    <el-form label-position="top" label-width="100px">
                        <el-form-item label="切换风格">
                            <el-select v-model="style">
                                <el-option label="默认" value="default"></el-option>
                                <el-option label="仿钉钉" value="dingding"></el-option>
                                <el-option label="仿企业微信" value="weCom"></el-option>
                            </el-select>
                        </el-form-item>
                    </el-form>
                </div>
            </el-popover>
        </div>
        <div class="box-scale">
            <node-wrap v-if="nodeConfig" v-model="nodeConfig"></node-wrap>
            <div class="end-node">
                <div class="end-node-circle"></div>
                <div class="end-node-text">流程结束</div>
            </div>
            <div class="z-model" v-if="!$TOOL.checkRole('r6016') || isLookPage"></div>
        </div>
        <!--  -->
    </div>
</template>

<script setup>
import { onMounted, ref, watch } from "vue";
import nodeWrap from "./nodeWrap.vue";
import usePpprovalProcessStore from "@/store/modules/approvalProcess";
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";
const Router = useRouter();
const { style } = storeToRefs(usePpprovalProcessStore());

const props = defineProps({
    modelValue: { type: Object, default: () => {} },
});
const emit = defineEmits(["update:modelValue"]);
let nodeConfig = ref(null);
// 流程比例
let defaultZoom = ref(100);
// 最大比例
let maxZoom = ref(200);
// 最小比例
let minZoom = ref(10);
// 比例步数
let setupZoom = ref(10);
// 是否显示设置
let isShowSetting = ref(false);
// 是否是查看页面
let isLookPage = ref(false);
watch(
    () => props.modelValue,
    (v) => {
        nodeConfig.value = v;
    },
    {
        deep: true,
    }
);
watch(
    nodeConfig,
    (v) => {
        emit("update:modelValue", v);
    },
    { deep: true }
);

onMounted(() => {
    // 如果是查看页面
    let look = Router.currentRoute.value.query.look;
    if(look == 1){
        isLookPage.value = true;
    }
    // window.addEventListener("click", handleDocumentClick);
});

const editZoom = (target) => {
    if (target === "inc") {
        if (defaultZoom.value === maxZoom.value) {
            return;
        }
        defaultZoom.value += setupZoom.value;
    } else {
        if (defaultZoom.value === minZoom.value) {
            return;
        }
        defaultZoom.value -= setupZoom.value;
    }
    let dom = document.querySelectorAll(".box-scale")[0];
    dom.style.zoom = defaultZoom.value + "%";
};
</script>

<style lang="scss">

.sc-workflow-design {
    width: 100%;
    font-size: 13px;
    position: relative;
    box-sizing: border-box;
   
}
.sc-workflow-design .box-scale {
    display: inline-block;
    position: relative;
    width: 100%;
    padding: 54.5px 0px;
    align-items: flex-start;
    justify-content: center;
    flex-wrap: wrap;
    min-width: min-content;
    .z-model {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background: rgba($color: #000000, $alpha: 0.3);
        z-index: 7;
    }
}

.sc-workflow-design {
    .node-wrap {
        display: inline-flex;
        width: 100%;
        flex-flow: column wrap;
        justify-content: flex-start;
        align-items: center;
        padding: 0px 50px;
        position: relative;
        z-index: 1;
        box-sizing: border-box;
    }
    .node-wrap-box {
        display: inline-flex;
        flex-direction: column;
        position: relative;
        width: 220px;
        min-height: 72px;
        flex-shrink: 0;
        background: rgb(255, 255, 255);
        border-radius: 4px;
        cursor: pointer;
        box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.1);
    }
    .node-wrap-box::before {
        content: "";
        position: absolute;
        top: -12px;
        left: 50%;
        transform: translateX(-50%);
        width: 0px;
        border-style: solid;
        border-width: 8px 6px 4px;
        border-color: rgb(202, 202, 202) transparent transparent;
        background: #f6f8f9;
    }
    .node-wrap-box.start-node:before {
        content: none;
    }
    .node-wrap-box .title {
        height: 24px;
        line-height: 24px;
        color: #fff;
        padding-left: 16px;
        padding-right: 30px;
        border-radius: 4px 4px 0 0;
        position: relative;
        display: flex;
        align-items: center;
        // 发起人
        &.promoter {
            background: #4a94ff;
        }
        // 审批人
        &.reviewed {
            background: #fcad22;
        }
        // 抄送人
        &.ccto {
            background: #3cb4b2;
        }
    }
    .node-wrap-box .title .icon {
        margin-right: 5px;
    }
    .node-wrap-box .title .close {
        font-size: 15px;
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        right: 10px;
        display: none;
    }
    .node-wrap-box .content {
        position: relative;
        padding: 15px;
    }
    .node-wrap-box .content .placeholder {
        color: #999;
    }
    .node-wrap-box:hover .close {
        display: block;
    }
    .add-node-btn-box {
        width: 240px;
        display: inline-flex;
        flex-shrink: 0;
        position: relative;
        z-index: 1;
    }
    .add-node-btn-box:before {
        content: "";
        position: absolute;
        top: 0px;
        left: 0px;
        right: 0px;
        bottom: 0px;
        z-index: -1;
        margin: auto;
        width: 2px;
        height: 100%;
        background-color: rgb(202, 202, 202);
    }
    .add-node-btn {
        user-select: none;
        width: 240px;
        padding: 20px 0px 32px;
        display: flex;
        justify-content: center;
        flex-shrink: 0;
        flex-grow: 1;
    }
    .add-node-btn span {
    }
    .add-branch {
        justify-content: center;
        padding: 0px 10px;
        position: absolute;
        top: -16px;
        left: 50%;
        transform: translateX(-50%);
        transform-origin: center center;
        z-index: 1;
        display: inline-flex;
        align-items: center;
    }
    .branch-wrap {
        display: inline-flex;
        width: 100%;
    }
    .branch-box-wrap {
        display: flex;
        flex-flow: column wrap;
        align-items: center;
        min-height: 270px;
        width: 100%;
        flex-shrink: 0;
    }
    .col-box {
        display: inline-flex;
        flex-direction: column;
        align-items: center;
        position: relative;
        background: #f6f8f9;
    }
    .branch-box {
        display: flex;
        overflow: visible;
        min-height: 180px;
        height: auto;
        border-bottom: 2px solid #ccc;
        border-top: 2px solid #ccc;
        position: relative;
        margin-top: 15px;
    }
    .branch-box .col-box::before {
        content: "";
        position: absolute;
        top: 0px;
        left: 0px;
        right: 0px;
        bottom: 0px;
        z-index: 0;
        margin: auto;
        width: 2px;
        height: 100%;
        background-color: rgb(202, 202, 202);
    }
    .condition-node {
        display: inline-flex;
        flex-direction: column;
        min-height: 220px;
    }
    .condition-node-box {
        padding-top: 30px;
        padding-right: 50px;
        padding-left: 50px;
        justify-content: center;
        align-items: center;
        flex-grow: 1;
        position: relative;
        display: inline-flex;
        flex-direction: column;
    }
    .condition-node-box::before {
        content: "";
        position: absolute;
        top: 0px;
        left: 0px;
        right: 0px;
        bottom: 0px;
        margin: auto;
        width: 2px;
        height: 100%;
        background-color: rgb(202, 202, 202);
    }
    .auto-judge {
        position: relative;
        width: 220px;
        min-height: 72px;
        background: rgb(255, 255, 255);
        border-radius: 4px;
        // padding: 15px 15px;
        cursor: pointer;
        box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.1);
    }
    .auto-judge::before {
        content: "";
        position: absolute;
        top: -12px;
        left: 50%;
        transform: translateX(-50%);
        width: 0px;
        border-style: solid;
        border-width: 8px 6px 4px;
        border-color: rgb(202, 202, 202) transparent transparent;
        background: rgb(245, 245, 247);
    }
    .auto-judge .title {
        line-height: 16px;
    }
    .auto-judge .title .node-title {
        color: #15bc83;
    }
    .auto-judge .title .close {
        font-size: 15px;
        position: absolute;
        top: 15px;
        right: 15px;
        color: #999;
        display: none;
    }
    .auto-judge .title .priority-title {
        position: absolute;
        top: 15px;
        right: 15px;
        color: #999;
    }
    .auto-judge .content {
        position: relative;
        padding-top: 15px;
    }
    .auto-judge .content .placeholder {
        color: #999;
    }
    .auto-judge:hover {
        .close {
            display: block;
        }
        .priority-title {
            display: none;
        }
    }
    .top-left-cover-line,
    .top-right-cover-line {
        position: absolute;
        height: 3px;
        width: 50%;
        background-color: #f6f8f9;
        top: -2px;
    }
    .bottom-left-cover-line,
    .bottom-right-cover-line {
        position: absolute;
        height: 3px;
        width: 50%;
        background-color: #f6f8f9;
        bottom: -2px;
    }
    .top-left-cover-line {
        left: -1px;
    }
    .top-right-cover-line {
        right: -1px;
    }
    .bottom-left-cover-line {
        left: -1px;
    }
    .bottom-right-cover-line {
        right: -1px;
    }
    .end-node {
        border-radius: 50%;
        font-size: 14px;
        color: rgba(25, 31, 37, 0.4);
        text-align: left;
    }
    .end-node-circle {
        width: 10px;
        height: 10px;
        margin: auto;
        border-radius: 50%;
        background: #dbdcdc;
    }
    .end-node-text {
        margin-top: 5px;
        text-align: center;
    }
    .auto-judge:hover {
        .sort-left {
            display: flex;
        }
        .sort-right {
            display: flex;
        }
    }
    .auto-judge .sort-left {
        position: absolute;
        top: 0;
        bottom: 0;
        z-index: 1;
        left: 0;
        display: none;
        justify-content: center;
        align-items: center;
        flex-direction: column;
    }
    .auto-judge .sort-right {
        position: absolute;
        top: 0;
        bottom: 0;
        z-index: 1;
        right: 0;
        display: none;
        justify-content: center;
        align-items: center;
        flex-direction: column;
    }
    .auto-judge .sort-left:hover,
    .auto-judge .sort-right:hover {
        background: #eee;
    }
    .auto-judge:after {
        pointer-events: none;
        content: "";
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        z-index: 2;
        border-radius: 4px;
        transition: all 0.1s;
    }
    .auto-judge:hover:after {
        border: 1px solid #3296fa;
        box-shadow: 0 0 6px 0 rgba(50, 150, 250, 0.3);
    }
    .node-wrap-box:after {
        pointer-events: none;
        content: "";
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        z-index: 2;
        border-radius: 4px;
        transition: all 0.1s;
    }
    .node-wrap-box:hover:after {
        border: 1px solid #3296fa;
        box-shadow: 0 0 6px 0 rgba(50, 150, 250, 0.3);
    }
}

.tags-list {
    margin-top: 15px;
    width: 100%;
}
.add-node-popover-body {
}
.add-node-popover-body li {
    display: inline-block;
    width: 80px;
    text-align: center;
    padding: 10px 0;
}
.add-node-popover-body li i {
    border: 1px solid var(--el-border-color-light);
    width: 40px;
    height: 40px;
    border-radius: 50%;
    text-align: center;
    line-height: 38px;
    font-size: 18px;
    cursor: pointer;
}
.add-node-popover-body li i:hover {
    border: 1px solid #3296fa;
    background: #3296fa;
    color: #fff !important;
}
.add-node-popover-body li p {
    font-size: 12px;
    margin-top: 5px;
}
.node-wrap-drawer__title {
    padding-right: 40px;
}
.node-wrap-drawer__title label {
    cursor: pointer;
}
.node-wrap-drawer__title label:hover {
    border-bottom: 1px dashed var(--el-color-primary);
}
.node-wrap-drawer__title .node-wrap-drawer__title-edit {
    color: var(--el-color-primary);
    margin-left: 10px;
    vertical-align: middle;
}

.dark .sc-workflow-design {
    
    .node-wrap-box,
    .auto-judge {
        background: #2b2b2b;
    }
    .col-box {
        background: var(--el-bg-color);
    }
    .top-left-cover-line,
    .top-right-cover-line,
    .bottom-left-cover-line,
    .bottom-right-cover-line {
        background-color: var(--el-bg-color);
    }
    .node-wrap-box::before,
    .auto-judge::before {
        background-color: var(--el-bg-color);
    }
    .branch-box .add-branch {
        background: var(--el-bg-color);
    }
    .end-node .end-node-text {
        color: #d0d0d0;
    }
    .auto-judge .sort-left:hover,
    .auto-judge .sort-right:hover {
        background: var(--el-bg-color);
    }
}

.work-flow-conditions {
    font-size: 14px;
    .lable-title {
        font-weight: bold;
        color: #666;
    }
}

.edit-zoom {
    position: fixed;
    z-index: 6;
    top: 255px;
    right: 50px;
    height: 24px;
    .span-zoom {
        display: inline-block;
        position: relative;
        top: 1px;
        color: #666;
        width: 34px;
        text-align: center;
    }
}

.sc-workflow-design .auto-judge .title {
    height: 24px;
    line-height: 24px;
    padding: 0 20px;
    background: #88939f;
    border-radius: 4px 4px 0 0;
    .node-title {
        color: #fff;
    }
    .priority-title {
        top: 0px;
        color: #fff;
    }
    .close {
        top: 4px;
        color: #fff;
    }
}
.sc-workflow-design .auto-judge .content {
    padding: 15px 20px;
}
/**
*  仿企业微信
**/
.sc-workflow-design.is-wecom {
    .node-wrap-box .title,
    .auto-judge .title {
        height: 34px;
        line-height: 34px;
        padding-top: 4px;
        .we-com-hr {
            position: absolute;
            left: 0;
            top: 0;
            height: 4px;
            width: 100%;
            border-radius: 4px 4px 0 0;
        }
        // 发起人
        &.promoter {
            color: #4a94ff;
            background: #e9f2ff;
            .we-com-hr {
                background: #4a94ff;
            }
        }
        // 审批人
        &.reviewed {
            color: #fcad22;
            background: #fff9ee;
            .we-com-hr {
                background: #fcad22;
            }
        }
        // 抄送人
        &.ccto {
            color: #3cb4b2;
            background: #e6f8f8;
            .we-com-hr {
                background: #3cb4b2;
            }
        }
        &.branch {
            color: #88939f;
            background: #eef4fb;
            .node-title {
                color: #88939f;
            }
            .we-com-hr {
                background: #88939f;
            }
            .priority-title {
                top: 4px;
                color: #88939f;
            }
            .close {
                top: 12px;
                color: #88939f;
            }
        }
    }
}
/**
*  默认
**/
.sc-workflow-design.is-default {
    .node-wrap-box .content,
    .auto-judge .content {
        border-radius: 0 0 4px 4px;
        padding: 0 5px;
        .default-div {
            padding: 15px 10px;
            margin-bottom: 5px;
            border-radius: 4px;
            background: #fff;
        }
        // 发起人
        &.promoter {
            background: #4a94ff;
        }
        // 审批人
        &.reviewed {
            background: #fcad22;
        }
        // 抄送人
        &.ccto {
            background: #3cb4b2;
        }
        &.branch {
            background: #88939f;
            padding-bottom: 1px;
            // margin-bottom: 0;
        }
    }
    .auto-judge .title {
        border-radius: 4px 4px 0 0;
        background: #88939f;
        .node-title {
            color: #fff;
        }
        .priority-title {
            top: 0px;
            color: #fff;
        }
        .close {
            top: 4px;
            color: #fff;
        }
    }
    .auto-judge .content {
        .default-div {
            padding: 15px 15px;
        }
    }
}
</style>
