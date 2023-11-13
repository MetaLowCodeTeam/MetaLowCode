<template>
    <!--  -->
    <el-container v-loading="loading" element-loading-text="加载中...">
        <el-header class="props-action-section">
            <span class="section-title">数据导入</span>
        </el-header>
        <el-main>
            <div class="main-box">
                <div class="main-header">
                    <div class="steps-container">
                        <div
                            class="fl step-item"
                            :class="{'active':cutStep == item.step,'complete':item.isComplete}"
                            v-for="item of steps"
                            :key="item.step"
                        >
                            {{ item.text }}
                            <i class="chevron"></i>
                        </div>
                    </div>
                </div>
                <div class="main-content">
                    <step1 v-model="fromData" v-if="cutStep == 1" @fileSuccess="fileSuccess" />
                    <step2
                        v-model="fromData"
                        @goBack="cutStep -= 1"
                        v-if="cutStep == 2"
                        @importSuccess="importSuccess"
                    />
                    <step3 v-model="fromData" v-if="cutStep == 3" @reset="reset" />
                </div>
            </div>
        </el-main>
    </el-container>
</template>

<script setup>
import { reactive, ref } from "vue";
// 步骤1 上传文件
import step1 from "./components/step1.vue";
// 步骤2 字段映射
import step2 from "./components/step2.vue";
// 步揍3 开始导入
import step3 from "./components/step3.vue";
let loading = ref(false);
let steps = ref([
    {
        step: 1,
        text: "上传文件",
        isComplete: false,
    },
    {
        step: 2,
        text: "字段映射",
        isComplete: false,
    },
    {
        step: 3,
        text: "开始导入",
        isComplete: false,
    },
]);
let cutStep = ref(1);
// 编辑提交数据
let fromData = reactive({
    // 选择导入实体
    mainEntity: "",
    // 上传的文件名称
    filePath: "",
    // 遇到重复记录时
    repeatOpt: 1,
    // 重复判断字段集
    repeatFields: [],
    // 记录所属用户
    owningUser: [],
    // 所有列数据
    columns: [],
});

// 文件上传成功
const fileSuccess = () => {
    steps.value[0].isComplete = true;
    cutStep.value = 2;
};
// 字段导入成功
const importSuccess = (taskId) => {
    steps.value[1].isComplete = true;
    cutStep.value = 3;
    fromData.taskId = taskId;
};
// 继续导入
const reset = () => {
    steps.value[0].isComplete = false;
    steps.value[1].isComplete = false;
    fromData = {
        // 选择导入实体
        mainEntity: "",
        // 上传的文件名称
        filePath: "",
        // 遇到重复记录时
        repeatOpt: 1,
        // 重复判断字段集
        repeatFields: [],
        // 记录所属用户
        owningUser: [],
        // 所有列数据
        columns: [],
    };
    cutStep.value = 1
};

// let step1Complete = ref(true);
</script>
<style lang='scss' scoped>
div {
    box-sizing: border-box;
}
.props-action-section {
    .section-title {
        font-size: 16px;
    }
}
.main-box {
    background: #fff;
    font-size: 14px;
    .main-header {
        height: 48px;
        .steps-container {
            .step-item {
                height: 48px;
                line-height: 48px;
                padding: 0 20px 0 30px;
                position: relative;
                background: #f7f7f7;
                color: #999;
                cursor: not-allowed;
                &:first-child {
                    padding-left: 20px;
                }
                .chevron {
                    border: 24px solid transparent;
                    border-left: 14px solid #d4d4d4;
                    border-right: 0;
                    display: block;
                    position: absolute;
                    right: -14px;
                    top: 0;
                    z-index: 1;
                    &::before {
                        border: 24px solid transparent;
                        border-left: 14px solid #f7f7f7;
                        border-right: 0;
                        content: "";
                        display: block;
                        position: absolute;
                        right: 1px;
                        top: -24px;
                    }
                }
                &.complete {
                    background: var(--el-color-primary);
                    color: #fff;
                    cursor: default;
                    .chevron {
                        &::before {
                            border-left-color: var(--el-color-primary);
                        }
                    }
                    &:hover {
                        background: #508ef5;
                        .chevron {
                            &::before {
                                border-left-color: #508ef5;
                            }
                        }
                    }
                }
                &.active {
                    background: #fff !important;
                    color: var(--el-color-primary);
                    cursor: default;
                    .chevron {
                        &::before {
                            border-left-color: #fff !important;
                        }
                    }
                }
            }
        }
    }
    .main-content {
        border-top: 1px solid #e2e2e2;
        padding: 30px;
    }
}
</style>