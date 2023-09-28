<template>
    <ml-dialog :title="row.dialogTitle" v-model="isShow" width="800px">
        <div class="main" v-loading="loading">
            <div class="info-box" v-if="row.approvalStatus.value == 3">记录已完成审批，禁止编辑</div>
            <div class="info-box" v-if="row.approvalStatus.value == 1">记录正在审批中，禁止编辑</div>
            <v-form-render
                v-if="haveLayoutJson"
                ref="vFormRef"
                :option-data="optionData"
                :form-data="formData"
                :global-dsv="globalDsv"
            />
            <el-empty v-else :image-size="100" description="未查询到相关配置数据" />
        </div>
        <template #footer>
            <el-button @click="isShow = false">取消</el-button>
            <el-button type="primary" @click="confirm" v-if="row.approvalStatus.value != 1 && row.approvalStatus.value != 3">确认</el-button>
        </template>
    </ml-dialog>
</template>

<script setup>
import { reactive, ref, inject, nextTick } from "vue";
import { getFormLayout } from "@/api/system-manager";
import { queryById, saveRecord } from "@/api/crud";
const emits = defineEmits("onConfirm");
const $ElMessage = inject("$ElMessage");
let row = reactive({
    approvalStatus: {},
});
let loading = ref(false);
let isShow = ref(false);
const openDialog = (v) => {
    row = Object.assign(row, v);
    console.log(row, "row");
    isShow.value = true;
    initFormLayout();
};

/**
 *
 * *********************************************************** 表单信息相关 beg
 *
 */

const vFormRef = ref();
let haveLayoutJson = ref(false);
let optionData = reactive({});
let formData = reactive({});
let globalDsv = reactive({});
// 初始化自定义表单
const initFormLayout = async () => {
    loading.value = true;
    let res = await getFormLayout(row.entityName);
    if (res) {
        if (res.data?.layoutJson) {
            haveLayoutJson.value = true;
            // 根据数据渲染出页面填入的值，填过
            nextTick(async () => {
                let formData = await queryById(row.detailId);
                vFormRef.value.setFormJson(res.data.layoutJson);
                if (formData) {
                    row.approvalStatus = formData.data.approvalStatus || {};
                    vFormRef.value.setFormData(formData.data);
                    if (
                        row.approvalStatus.value == 1 ||
                        row.approvalStatus.value == 3
                    ) {
                        nextTick(() => {
                            vFormRef.value.disableForm();
                        });
                    }
                }
                loading.value = false;
            });
        } else {
            loading.value = false;
        }
    } else {
        loading.value = false;
    }
};
/**
 *
 * *********************************************************** 表单信息相关 end
 *
 */
// 保存
const confirm = async () => {
    let formData = await vFormRef.value.getFormData();
    if (formData) {
        loading.value = true;
        let saveRes = await saveRecord(row.entityName, row.detailId, formData);
        if (saveRes) {
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
.main {
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