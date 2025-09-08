<template>
    <!--  -->
    <div class="in-report-page">
        <el-card class="in-report-card" v-loading="loading">
            <div class="in-report-title mb-15">填报{{ externalData.entityLabel }}</div>
            <div class="in-report-body">
                <div class="info-box" v-if="approvalStatus == 3">记录已完成审批，禁止填报</div>
                <div class="info-box" v-if="approvalStatus == 1">记录正在审批中，禁止填报</div>
                <v-form-render
                    v-if="haveLayoutJson"
                    ref="vFormRef"
                    :global-dsv="globalDsv"
                    :option-data="optionData"
                    :mix-mode="isMobile"
                />
                <el-empty v-else :image-size="100" :description="errorText" />
            </div>
            <div class="in-report-footer" v-if="haveLayoutJson && !entityId">
                <el-button
                    type="primary"
                    @click="confirm"
                    :disabled="approvalStatus == 3 || approvalStatus == 1 || btnDisabled"
                >提交</el-button>
            </div>
        </el-card>
        <div v-if="haveLayoutJson && showSuccessOverlay" class="in-report-mask">
            <div class="in-report-mask-content">
                <el-result icon="success" title="提交成功" class="success-result">
                    <template #extra>
                        <div class="success-actions">
                            <el-link type="primary" :underline="false" class="success-link" @click="closeSuccessOverlay">查看提交内容</el-link>
                            <el-button v-if="!isMobile" @click="closeCurrentPage">关闭</el-button>
                        </div>
                    </template>
                </el-result>
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted, ref, nextTick, onBeforeMount } from "vue";

/**
 * API
 */
// import { getFormLayout, getFieldListOfEntity } from "@/api/system-manager";
import { getExternalFormData, saveRecord, queryExternalFormById } from "@/api/external";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { globalDsvDefaultData, formatFormVirtualField, formatQueryByIdParam } from "@/utils/util";

const Router = useRouter();

const vFormRef = ref();
let haveLayoutJson = ref(false);
const globalDsv = ref(globalDsvDefaultData());
let optionData = ref({});
let loading = ref(false);

let externalId = ref("");
let tenantId = ref(null);

let externalData = ref({});

let errorText = ref("未查询到相关配置数据");

let btnDisabled = ref(false);

// 提交成功遮罩
let showSuccessOverlay = ref(false);

// 审批状态
let approvalStatus = ref();

// 默认值
let defaultFormData = ref({});

// 是否移动端
let isMobile = ref(false);

// 实体ID
let entityId = ref(null);

onBeforeMount(() => {
    // 客户端才执行UA判断
    isMobile.value = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
});

onMounted(() => {
    let routeQuery = Router.currentRoute.value.query;
    externalId.value = routeQuery.externalId;
    tenantId.value = routeQuery.tenantId;
    entityId.value = routeQuery.entityId;
    if (externalId.value) {
        for (const key in routeQuery) {
            if (Object.prototype.hasOwnProperty.call(routeQuery, key)) {
                const element = routeQuery[key];
                defaultFormData.value[key] = element;
            }
        }
        initExternalData();
    }
});

// 初始化自定义表单
const initExternalData = async () => {
    loading.value = true;

    let res = await getExternalFormData(externalId.value, tenantId.value);
    if (res && res.code == 200) {
        if (res.data.isDisabled) {
            loading.value = false;
            errorText.value = "该填报表单已失效";
            return;
        }
        externalData.value = res.data;
        let { layoutData } = res.data;
        globalDsv.value.formEntity = layoutData.entityCode;
        globalDsv.value.isExternalForm = true;
        globalDsv.value.tenantId = tenantId.value;
        if (layoutData) {
            haveLayoutJson.value = true;
            optionData.value = layoutData.optionData || {};
            if(layoutData.codeOptionData) {
                optionData.value = Object.assign(optionData.value, layoutData.codeOptionData);
            }
            if (layoutData.formUploadParam) {
                globalDsv.value.cloudUploadToken =
                    layoutData.formUploadParam.cloudUploadToken;
                globalDsv.value.cloudStorage =
                    layoutData.formUploadParam.cloudStorage;
                globalDsv.value.picUploadURL =
                    layoutData.formUploadParam.picUploadURL;
                globalDsv.value.fileUploadURL =
                    layoutData.formUploadParam.fileUploadURL;
                globalDsv.value.picDownloadPrefix =
                    layoutData.formUploadParam.picDownloadPrefix;
                globalDsv.value.fileDownloadPrefix =
                    layoutData.formUploadParam.fileDownloadPrefix;
            }
            nextTick(async () => {
				globalDsv.value.formStatus = 'read'
				globalDsv.value.formEntityId = externalId.value;
                vFormRef.value.setFormJson(layoutData.layoutJson);
                if(entityId.value) {
                    let buildFormFieldSchema = formatQueryByIdParam(vFormRef.value?.buildFormFieldSchema());
                    let recordDataRes = await queryExternalFormById(entityId.value, buildFormFieldSchema.fieldNames, { queryDetailList: buildFormFieldSchema.queryDetailList }, externalId.value);
                    if(recordDataRes && recordDataRes.code == 200) {
                        globalDsv.value.recordData = recordDataRes.data;
                        nextTick(() => {
                            vFormRef.value?.setFormData(formatFormVirtualField(recordDataRes.data));
                            nextTick(() => {
                                vFormRef.value?.reloadOptionData();
                                vFormRef.value?.setReadMode();
                            });
                        })
                    }
                    loading.value = false;
                    return
                }
                if (res.data.recordData) {
                    approvalStatus.value = res.data.recordData.approvalStatus;
                    vFormRef.value.setFormData(res.data.recordData);
                    nextTick(() => {
                        if (
                            approvalStatus.value == 1 ||
                            approvalStatus.value == 3
                        ) {
                            vFormRef.value.disableForm();
                        }
                        if (pageStatus.value == 2) {
                            vFormRef.value.disableForm();
                        }
                    });
                }else {
                    vFormRef.value.setFormData(defaultFormData.value);
                }
                nextTick(() => {
                    vFormRef.value.reloadOptionData();
                    loading.value = false;
                });
            });
        }
    }else {
        loading.value = false;
    }
    // 
};

// 保存
const confirm = async () => {
    if (!vFormRef.value) {
        return;
    }
    vFormRef.value
        .getFormData()
        .then(async (formData) => {
            if (formData) {
                loading.value = true;
                let saveRes = await saveRecord(externalId.value, tenantId.value, formData);
                if (
                    saveRes &&
                    (saveRes.data?.code == 200 || saveRes.code == 200)
                ) {
                    vFormRef.value.disableForm();
                    btnDisabled.value = true;
                    ElMessage.success("保存成功");
                    showSuccessOverlay.value = true;
                }
                loading.value = false;
            }
        })
        .catch((err) => {
            if(!globalDsv.value.defaultValidationMessageDisabled){
                ElMessage.error("表单校验失败，请修改后重新提交");
            }
        });
};

// 关闭提交成功遮罩
const closeSuccessOverlay = () => {
    showSuccessOverlay.value = false;
};

// 关闭当前页面
const closeCurrentPage = () => {
    // 若为外部打开页尝试关闭；否则回退
    if (window.history.length > 1) {
        window.close();
        // 如关闭失败（浏览器策略），回退
        setTimeout(() => {
            if (!document.hidden) {
                window.history.back();
            }
        }, 100);
    } else {
        window.close();
    }
};
</script>
<style lang='scss' scoped>
.in-report-page {
    padding-bottom: 60px;
}
.in-report-card {
    width: 55%;
    margin: 0 auto;
    margin-top: 5vh;
    .in-report-title {
        font-size: 17px;
        font-weight: bold;
    }
    .in-report-footer {
        text-align: right;
        margin-top: 15px;
    }
    .info-box {
        height: 26px;
        line-height: 26px;
        background: var(--el-color-warning);
        text-align: center;
        color: #fff;
        border-radius: 3px;
        margin-bottom: 10px;
        &.success {
            background: var(--el-color-success);
        }
    }
}
/* 当视口宽度小于等于750px时应用该样式 */
@media screen and (max-width: 1200px) {
    .in-report-card {
        width: 80%;
    }
}

// 提交成功遮罩
.in-report-mask {
    position: fixed;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    background: #fff; /* 全屏白底以适配移动端 */
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
}
.in-report-mask-content {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 0 24px; /* 移动端左右留白 */
}
.in-report-mask-content .success-text {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 16px;
}
.in-report-mask-content .success-actions {
    text-align: center;
    display: grid;
    grid-template-columns: 1fr; /* 单列布局：一人一块 */
    row-gap: 12px;
    width: 100%;
}

/* 缩小 el-result 内容与按钮区域的间距 */
.success-result :deep(.el-result__extra) {
    margin-top: 20px;
}

/* 整体上移一些，让视觉重心更靠上 */
.success-result {
    transform: translateY(-6vh);
}

@media screen and (max-width: 900px) {
    .success-result {
        transform: translateY(-4vh);
    }
}

/* 块级按钮等宽，自适应移动端 */
.success-actions :deep(.el-button) {
    display: block;
    width: 240px;
    max-width: 80vw;
    margin: 0 auto;
}
.success-actions :deep(.el-button + .el-button) {
    margin-left: 0; /* 覆盖按钮组默认左间距 */
}

/* 文本链接与透明度效果 */
.success-link {
    display: block;
    width: 240px;
    max-width: 80vw;
    margin: 0 auto;
    opacity: 0.9;
    transition: opacity .2s ease;
}
.success-link:hover {
    opacity: 1;
}
.success-link:active {
    opacity: 0.8;
}

@media screen and (max-width: 900px) {
    .in-report-mask-content .success-text {
        font-size: 16px;
    }
}

/* 当视口宽度小于等于900时应用该样式 */
@media screen and (max-width: 900px) {
    .in-report-card {
        width: 100%;
        margin: 0 auto;
    }
}


</style>
