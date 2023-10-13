<template>
    <ml-dialog :title="row.dialogTitle" v-model="isShow" width="900px">
        <div class="main" v-loading="loading">
            <div class="info-box" v-if="row.approvalStatus.value == 3">记录已完成审批，禁止编辑</div>
            <div class="info-box" v-if="row.approvalStatus.value == 1">记录正在审批中，禁止编辑</div>
            <v-form-render v-if="haveLayoutJson" ref="vFormRef" />
            <el-empty v-else :image-size="100" description="未查询到相关配置数据" />
        </div>
        <template #footer>
            <el-button @click="isShow = false">取消</el-button>
            <el-button
                type="primary"
                @click="confirm"
                v-if="row.approvalStatus.value != 1 && row.approvalStatus.value != 3"
            >确认</el-button>
        </template>
    </ml-dialog>
</template>

<script setup>
import { reactive, ref, inject, nextTick } from "vue";
import { getFormLayout } from "@/api/system-manager";
import { queryById, saveRecord } from "@/api/crud";
import { saveTeam } from "@/api/team";
import { saveUser } from "@/api/user";
const emits = defineEmits(["onConfirm"]);
const props = defineProps({
    isTeam: { type: Boolean, default: false },
    isUser: { type: Boolean, default: false },
});
const $ElMessage = inject("$ElMessage");

let row = reactive({
    approvalStatus: {},
    detailId: "",
    entityName: "",
    dialogTitle: "",
});
let loading = ref(false);
let isShow = ref(false);
const openDialog = (v) => {
    row.detailId = v.detailId;
    row.entityName = v.entityName;
    row.dialogTitle = v.dialogTitle;
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
// 初始化自定义表单
const initFormLayout = async () => {
    loading.value = true;
    let res = await getFormLayout(row.entityName);
    if (res) {
        if (res.data?.layoutJson) {
            haveLayoutJson.value = true;
            // 是编辑
            if (row.detailId) {
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
            }
            // 是新建
            else {
                nextTick(async () => {
                    vFormRef.value.setFormJson(res.data.layoutJson);
                    vFormRef.value.setFormData({});
                });
            }
            loading.value = false;
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
    if (!vFormRef.value) {
        isShow.value = false;
        return;
    }
    let formData = await vFormRef.value.getFormData();

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
:deep(.el-form-item--default) {
	margin-bottom: 5px !important;
}

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
