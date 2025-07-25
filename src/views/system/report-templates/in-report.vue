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
            <div class="in-report-footer" v-if="haveLayoutJson">
                <el-button
                    type="primary"
                    @click="confirm"
                    :disabled="approvalStatus == 3 || approvalStatus == 1 || btnDisabled"
                >提交</el-button>
            </div>
        </el-card>
    </div>
</template>

<script setup>
import { onMounted, ref, nextTick, onBeforeMount } from "vue";

/**
 * API
 */
// import { getFormLayout, getFieldListOfEntity } from "@/api/system-manager";
import { getExternalFormData, saveRecord } from "@/api/external";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { globalDsvDefaultData } from "@/utils/util";
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

// 审批状态
let approvalStatus = ref();

// 默认值
let defaultFormData = ref({});

// 是否移动端
let isMobile = ref(false);

onBeforeMount(() => {
    // 客户端才执行UA判断
    isMobile.value = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
});

onMounted(() => {
    let routeQuery = Router.currentRoute.value.query;
    externalId.value = routeQuery.externalId;
    tenantId.value = routeQuery.tenantId;
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
                });
            });
        }
    }
    loading.value = false;
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

/* 当视口宽度小于等于900时应用该样式 */
@media screen and (max-width: 900px) {
    .in-report-card {
        width: 100%;
        margin: 0 auto;
    }
}


</style>
