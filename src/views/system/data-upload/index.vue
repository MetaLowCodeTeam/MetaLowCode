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
                            v-for="(item,inx) of steps"
                            :key="inx"
                        >
                            {{ item.text }}
                            <i class="chevron"></i>
                        </div>
                    </div>
                </div>
                <div class="main-content">
                    <div v-if="cutStep == 1" class="step">
                        <el-form label-width="120px">
                            <el-form-item label="选择导入实体">
                                <el-select
                                    v-model="fromData.mainEntity"
                                    placeholder="选择导入实体"
                                    style="width: 400px;"
                                    filterable
                                    @change="changeEntity"
                                >
                                    <el-option
                                        :label="op.label"
                                        :value="op.name"
                                        v-for="(op,inx) of approveDialogEntityList"
                                        :key="inx"
                                    />
                                </el-select>
                            </el-form-item>
                            <el-form-item label="上传数据">
                                <div class="w-100">
                                    <ml-upload
                                        accept=".xls, .xlsx"
                                        @on-success="onSuccess"
                                        class="ml-upload"
                                    >
                                        <template #trigger>
                                            <el-button>
                                                <el-icon>
                                                    <ElIconUpload />
                                                </el-icon>上传文件
                                            </el-button>
                                        </template>
                                    </ml-upload>
                                    <span
                                        class="file-name-span"
                                        v-if="fromData.originalFilename"
                                    >{{ fromData.originalFilename }}</span>
                                </div>
                                <div class="w-100 mt-5">
                                    <ul class="upload-ui">
                                        <li>有合并单元格的数据请处理过后再上传，否则可能出现表头识别有误</li>
                                        <li>系统默认仅识别第一个 SHEET，且会将首行识别为表头</li>
                                        <li>
                                            主实体与明细实体请分别导入，更多帮助请
                                            <a
                                                class="ml-a-span"
                                                href="https://www.baidu.com/"
                                                target="_blank"
                                            >参考文档</a>
                                        </li>
                                    </ul>
                                </div>
                            </el-form-item>
                            <el-form-item label="遇到重复记录时">
                                <el-radio-group v-model="fromData.repeatOpt">
                                    <el-radio :label="1">覆盖 (更新)</el-radio>
                                    <el-radio :label="2">跳过</el-radio>
                                    <el-radio :label="3">仍旧导入</el-radio>
                                </el-radio-group>
                                <div class="sm-title w-100 mt-5" v-if="fromData.repeatOpt != 3">
                                    重复判断字段
                                    <el-tooltip
                                        class="sm-tip"
                                        effect="dark"
                                        content="选择的字段必须存在字段映射，否则会导致重复判断有误"
                                        placement="top"
                                    >
                                        <el-icon class="sm-icon">
                                            <ElIconQuestionFilled />
                                        </el-icon>
                                    </el-tooltip>
                                </div>
                                <el-select
                                    v-model="fromData.repeatFields"
                                    placeholder="选择字段"
                                    style="width: 400px;"
                                    multiple
                                    :multiple-limit="3"
                                    v-if="fromData.repeatOpt != 3"
                                >
                                    <el-option
                                        :label="op.fieldLabel"
                                        :value="op.fieldName"
                                        v-for="(op,inx) of fromData.fields"
                                        :key="inx"
                                        filterable
                                    />
                                </el-select>
                            </el-form-item>
                            <el-form-item label="记录所属用户">
                                <div style="width: 400px;">
                                    <mlSelectUser
                                        type="User"
                                        v-model="fromData.owningUser"
                                        clearable
                                    />
                                </div>
                                <div class="w-100 mt-5 info-text">不选择则默认为当前用户，如字段映射中指定了用户则以映射为准</div>
                                <div class="w-100 mt-20">
                                    <el-button
                                        type="primary"
                                        style="width: 80px;"
                                        @click="goStepTwo"
                                    >下一步</el-button>
                                </div>
                            </el-form-item>
                        </el-form>
                    </div>
                    <!-- <step1 v-model="fromData" v-if="cutStep == 1" @fileSuccess="fileSuccess" />
                    <step2
                        v-model="fromData"
                        @goBack="cutStep -= 1"
                        v-if="cutStep == 2"
                        @importSuccess="importSuccess"
                    />
                    <step3 v-model="fromData" v-if="cutStep == 3" @reset="reset" />-->
                </div>
            </div>
        </el-main>
    </el-container>
</template>

<script setup>
import { onMounted, reactive, ref, inject } from "vue";
import { storeToRefs } from "pinia";
import useCommonStore from "@/store/modules/common";
import { queryEntityFields } from "@/api/crud";
const { approveDialogEntityList } = storeToRefs(useCommonStore());
const $ElMessage = inject("$ElMessage");
const $API = inject("$API");
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
let fromData = ref({
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

let entityCode = ref("");
onMounted(() => {
    // 初始化选中第一个实体
    if (approveDialogEntityList.value.length > 0) {
        fromData.value.mainEntity = approveDialogEntityList.value[0].name;
        entityCode.value = approveDialogEntityList.value[0].entityCode;
        getEntityFields();
    }
});
// 获取当前实体所有字段
const getEntityFields = async () => {
    loading.value = true;
    let res = await queryEntityFields(entityCode.value, false, false);
    if (res) {
        fromData.value.fields = res.data || [];
        let importFields = [];
        fromData.value.importFields = [];
        fromData.value.fields.forEach((el) => {
            if (!el.isNullable) {
                importFields.push(el.fieldName);
                fromData.value.importFields.push(el);
            }
        });
        fromData.value.fields.forEach((el) => {
            if (!importFields.includes(el.fieldName)) {
                fromData.value.importFields.push(el);
            }
        });
    }
    loading.value = false;
};

// 切换实体
const changeEntity = () => {
    fromData.value.repeatFields = [];
    let filterEntity = approveDialogEntityList.value.filter(
        (el) => el.name == fromData.value.mainEntity
    );
    entityCode.value = filterEntity[0].entityCode;
    getEntityFields();
};

// 上传成功附件
const onSuccess = (data) => {
    fromData.value.filePath = data.fileName;
    fromData.value.originalFilename = data.originalFilename;
};

// I前往第二步
const goStepTwo = async () => {
    let { filePath, repeatOpt, repeatFields } = fromData.value;
    if (!filePath) {
        $ElMessage.warning("请上传数据文件");
        return;
    }
    if (repeatOpt != 3 && repeatFields.length < 1) {
        $ElMessage.warning("请选择充重复判断字段");
        return;
    }
    loading.value = true;
    let res = await $API.upload.checkFile(filePath);
    if (res) {
        fromData.value.columns = res.data;
        fileSuccess();
    }
    loading.value = false;
};

// 文件上传成功
const fileSuccess = () => {
    steps.value[0].isComplete = true;
    cutStep.value = 2;
    console.log("第一步结束");
};
// 字段导入成功
const importSuccess = (taskId) => {
    steps.value[1].isComplete = true;
    cutStep.value = 3;
    fromData.value.taskId = taskId;
    console.log("第二步结束");
};
// 继续导入
const reset = () => {
    steps.value[0].isComplete = false;
    steps.value[1].isComplete = false;
    fromData.value = {
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
    cutStep.value = 1;
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

.step {
    .ml-upload {
        display: inline-block;
        margin-right: 10px;
    }
    .file-name-span {
        position: relative;
        top: -1px;
        font-weight: bold;
        text-decoration: underline;
    }
    .upload-ui {
        line-height: 24px;
        color: #878787;
        padding-left: 20px;
    }
    .sm-title {
        color: #666;
    }
    .sm-icon {
        position: relative;
        top: 1px;
    }
}
</style>