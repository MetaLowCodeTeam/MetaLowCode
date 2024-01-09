<template>
    <ml-dialog :title="row.dialogTitle" v-if="isShow" v-model="isShow" width="55%">
        <div class="main" v-loading="loading">
            <div class="info-box" v-if="row.detailId && row.approvalStatus.value == 3">记录已完成审批，禁止编辑</div>
            <div class="info-box" v-if="row.detailId && row.approvalStatus.value == 1">记录正在审批中，禁止编辑</div>
            <v-form-render
                v-if="haveLayoutJson"
                ref="vFormRef"
                :global-dsv="globalDsv"
                :option-data="optionData"
            />
            <el-empty v-else :image-size="100" description="未查询到相关配置数据" />
        </div>
        <template #footer>
            <el-button @click="isShow = false">取消</el-button>
            <el-button
                type="primary"
                @click="confirm"
                v-if="!row.detailId || (row.approvalStatus.value != 1 && row.approvalStatus.value != 3)"
            >确认</el-button>
        </template>
    </ml-dialog>
</template>

<script setup>
import { reactive, ref, inject, nextTick } from "vue";
import { getFormLayout,getFieldListOfEntity } from "@/api/system-manager";
import { queryById, saveRecord } from "@/api/crud";
import { saveTeam } from "@/api/team";
import { saveUser, checkRight } from "@/api/user";
import useCommonStore from "@/store/modules/common";
const { queryEntityNameById, queryEntityNameByLabel } = useCommonStore();
const emits = defineEmits(["onConfirm"]);
const props = defineProps({
    isTeam: { type: Boolean, default: false },
    isUser: { type: Boolean, default: false },
    disableWidgets: { type: Array, default: () => [] },
    nameFieldName: { type: String, default: "" },
});
const $ElMessage = inject("$ElMessage");

let row = reactive({
    approvalStatus: {},
    detailId: "",
    entityName: "",
    fieldName: "",
    fieldNameLabel: "",
    fieldNameVale: "",
});
const globalDsv = ref({});
globalDsv.value.uploadServer = import.meta.env.VITE_APP_BASE_API;
let optionData = ref({});
let loading = ref(false);
let isShow = ref(false);
const openDialog = async (v) => {
    row.dialogTitle = "Loading...";
    row.detailId = v.detailId;
    row.entityName = v.detailId
        ? queryEntityNameById(v.detailId)
        : v.entityName;
    row.fieldName = v.fieldName;
    row.fieldNameLabel = v.fieldNameLabel;
    row.fieldNameVale = v.fieldNameVale;
    let param = {
        id: v.detailId,
        // 2新建 3更新
        rightType: v.detailId ? 3 : 2,
        entityName: v.detailId ? "" : v.entityName,
    };
    let res = await checkRight(param.id, param.rightType, param.entityName);
    if (res.data && res.data.code == 200 && res.data.data) {
        isShow.value = true;
        initFormLayout();
    } else {
        $ElMessage.error(
            "当前用户没有" + (v.detailId ? "编辑" : "新建") + "权限"
        );
    }
};

/**
 *
 * *********************************************************** 表单信息相关 beg
 *
 */

const vFormRef = ref();
let haveLayoutJson = ref(false);
// 初始化自定义表单
const initFormLayout = async () => {
    loading.value = true;
    globalDsv.value.formEntity = row.entityName;
    let res = await getFormLayout(row.entityName);
    if (res) {
        if (res.data?.layoutJson) {
            haveLayoutJson.value = true;
            optionData.value = res.data.optionData || {};
            if (res.data.formUploadParam) {
                globalDsv.value.cloudUploadToken =
                    res.data.formUploadParam.cloudUploadToken;
                globalDsv.value.cloudStorage =
                    res.data.formUploadParam.cloudStorage;
                globalDsv.value.picUploadURL =
                    res.data.formUploadParam.picUploadURL;
                globalDsv.value.fileUploadURL =
                    res.data.formUploadParam.fileUploadURL;
                globalDsv.value.picDownloadPrefix =
                    res.data.formUploadParam.picDownloadPrefix;
                globalDsv.value.fileDownloadPrefix =
                    res.data.formUploadParam.fileDownloadPrefix;
            }
            // 是编辑
            if (row.detailId) {
                // 根据数据渲染出页面填入的值，填过
                nextTick(async () => {
                    let formData = await queryById(row.detailId);
                    vFormRef.value.setFormJson(res.data.layoutJson);
                    if (formData && formData.data) {
                        row.dialogTitle =
                            "编辑" + formData.data[props.nameFieldName];
                        row.approvalStatus = formData.data.approvalStatus || {};
                        vFormRef.value.setFormData(formData.data);

                        nextTick(() => {
                            vFormRef.value.reloadOptionData();
                            if (
                                row.approvalStatus.value == 1 ||
                                row.approvalStatus.value == 3
                            ) {
                                vFormRef.value.disableForm();
                                return;
                            }

                            getFieldListOfEntityApi("updatable");
                        });
                    }
                    loading.value = false;
                });
            }
            // 是新建
            else {
                nextTick(async () => {
                    row.dialogTitle =
                        "新建" + queryEntityNameByLabel(row.entityName);
                    vFormRef.value.setFormJson(res.data.layoutJson);
                    // if(row.fieldName){}
                    let param = {};
                    if (row.fieldName) {
                        param[row.fieldName] = {
                            id: row.fieldNameVale,
                            name: row.fieldNameLabel,
                        };
                    }
                    vFormRef.value.setFormData(param);
                    nextTick(() => {
                        if (row.fieldName) {
                            vFormRef.value.disableWidgets([row.fieldName]);
                        }
                        vFormRef.value.reloadOptionData();
                        // 获取字段是否禁用
                        getFieldListOfEntityApi("creatable");
                    });
                });
            }
        }
    }
    loading.value = false;
};

/**
 * 获取字段是否禁用
 */

const getFieldListOfEntityApi = async (tag) => {
    // 获取实体所有字段
    let res = await getFieldListOfEntity(row.entityName);
    let disabledFileds = [];
    if (res && res.data) {
        // 取可编辑字段
        res.data.forEach((el) => {
            if (!el[tag]) {
                disabledFileds.push(el.name);
            }
        });
    }
    if (props.disableWidgets.length > 0) {
        disabledFileds.push(...props.disableWidgets);
    }
    vFormRef.value.disableWidgets(disabledFileds);
};

/**
 *
 * *********************************************************** 表单信息相关 end
 *
 */
// 保存
const confirm = async () => {
    if (!vFormRef.value) {
        isShow.value = false;
        return;
    }
    let formData = await vFormRef.value.getFormData();
    if (row.fieldName) {
        formData[row.fieldName] = {
            id: row.fieldNameVale,
            name: row.fieldNameLabel,
        };
    }
    if (formData) {
        loading.value = true;
        let saveRes;
        if (props.isTeam) {
            saveRes = await saveTeam(row.entityName, row.detailId, formData);
        } else if (props.isUser) {
            saveRes = await saveUser(row.entityName, row.detailId, formData);
        } else {
            saveRes = await saveRecord(row.entityName, row.detailId, formData);
        }
        if (saveRes && (saveRes.data?.code == 200 || saveRes.code == 200)) {
            $ElMessage.success("保存成功");
            emits("onConfirm");
            isShow.value = false;
        }
        loading.value = false;
    }
};
defineExpose({
    openDialog,
});
</script>
<style lang='scss' scoped>
:deep(.el-form-item--default) {
    margin-bottom: 5px !important;
}

.main {
    max-height: 500px;
    overflow-x: hidden;
    overflow-y: auto;
    .info-box {
        height: 26px;
        line-height: 26px;
        background: #f7b904;
        text-align: center;
        color: #fff;
        border-radius: 3px;
    }
}
</style>
