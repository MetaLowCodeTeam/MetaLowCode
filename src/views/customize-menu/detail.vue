<template>
    <el-drawer
        size="73%"
        class="ml-drawer"
        v-model="detailDialog.isShow"
        direction="rtl"
        :show-close="false"
    >
        <template #header>
            <div class="detail-header">
                {{ detailDialog.detailTitle }}详情
                <div class="fr fr-box">
                    <span class="fr-icon mr-10" @click="refresh">
                        <el-icon>
                            <ElIconRefresh />
                        </el-icon>
                    </span>
                    <span class="fr-icon" @click="detailDialog.isShow = false">
                        <el-icon>
                            <ElIconCloseBold />
                        </el-icon>
                    </span>
                </div>
            </div>
        </template>

        <div class="detail-main" v-loading="loading">
            <el-row :gutter="20" v-if="!noeData">
                <el-col :span="18">
                    <DetailTabs
                        v-model="detailDialog"
                        @tabChange="tabChange"
                        :cutTab="cutTab"
                        @confirm="getLayoutList"
                    />
                    <!-- 详情 -->
                    <div v-if="cutTab == 'detail'">
                        <v-form-render v-if="haveLayoutJson" ref="vFormRef" />
                        <el-empty v-else :image-size="100" description="未查询到相关配置数据" />
                    </div>
                    <!-- 非详情 -->
                    <div v-else>
                        <DetailTabCom
                            :cutTab="cutTab"
                            :tabs="detailDialog.tab"
                            :entityId="detailDialog.detailId"
                        />
                    </div>
                </el-col>
                <el-col :span="6">
                    <div class="detail-right" style="padding-top: 40px;">
                        <el-row class="group-el-button">
                            <el-col :span="24">
                                <NewRelated
                                    :entityName="detailDialog.entityName"
                                    :entityCode="detailDialog.entityCode"
                                    :addConf="detailDialog.add"
                                    @confirm="getLayoutList"
                                    @add="onAdd"
                                />
                            </el-col>
                            <el-col :span="24">
                                <el-button @click="onEditRow">
                                    <span class="mr-5">
                                        <el-icon>
                                            <ElIconEditPen />
                                        </el-icon>
                                    </span>
                                    编辑
                                </el-button>
                            </el-col>
                            <el-col :span="24">
                                <More
                                    type="detail"
                                    :multipleSelection="multipleSelection"
                                    :entityCode="detailDialog.entityCode"
                                    :detailId="detailDialog.detailId"
                                    :idFiledName="detailDialog.idFiledName"
                                />
                            </el-col>
                            <el-col :span="24">
                                <ApprovalRelated
                                    v-if="approvalStatus"
                                    :approvalStatus="approvalStatus"
                                    @onSubmit="onSubmitApproval"
                                />
                            </el-col>
                        </el-row>
                    </div>
                </el-col>
            </el-row>
            <el-empty v-else description="暂无数据" />
        </div>
        <Edit ref="editRefs" @onConfirm="onConfirm" />
    </el-drawer>
</template>

<script setup>
import { ref, reactive, inject, nextTick } from "vue";
import DetailTabs from "./components/DetailTabs.vue";
import { getFormLayout } from "@/api/system-manager";
import { queryById } from "@/api/crud";
import More from "./components/More.vue";
import DetailTabCom from "./components/DetailTabCom.vue";
import Edit from "./edit.vue";
import NewRelated from "./components/NewRelated.vue";
import ApprovalRelated from "./components/ApprovalRelated.vue";
import useCommonStore from "@/store/modules/common";
import { ElMessage } from "element-plus";
const { queryEntityNameById, queryEntityCodeById } = useCommonStore();
const emits = defineEmits(["onConfirm", "onAdd"]);
const $API = inject("$API");
const $ElMessage = inject("$ElMessage");
const vFormRef = ref();
let detailDialog = reactive({
    isShow: false,
});
let loading = ref(false);
let multipleSelection = ref([]);
let approvalStatus = ref(null);
// 新建
const onAdd = (e) => {
    emits("onAdd", e);
};

// 当前页签
let cutTab = ref("detail");
const openDialog = (row) => {
    detailDialog = Object.assign(detailDialog, row);
    multipleSelection.value = [row];
    detailDialog.entityCode = queryEntityCodeById(detailDialog.detailId);
    detailDialog.entityName = queryEntityNameById(detailDialog.detailId);
    if (!detailDialog.entityName) {
        ElMessage.warning("当前实体未找到");
        return;
    }
    detailDialog.isShow = true;
    // 加载数据
    refresh();
};

// 页签更换
const tabChange = (tab) => {
    cutTab.value = tab;
    if (tab == "detail") {
        refresh();
    }
};
// 刷新
const refresh = () => {
    cutTab.value = "detail";
    if (
        !detailDialog.tab ||
        JSON.stringify(detailDialog.tab) == "{}" ||
        (!detailDialog.add == JSON.stringify(detailDialog.add)) == "{}"
    ) {
        getLayoutList();
    } else {
        initData();
    }
};

// 提交审批触发
const onSubmitApproval = ()=>{
    getLayoutList();
    emits('onConfirm')
}

// 加载页签
const getLayoutList = async () => {
    loading.value = true;
    let res = await $API.layoutConfig.getLayoutList(detailDialog.entityName);
    if (res) {
        detailDialog.tab = res.data.TAB ? { ...res.data.TAB } : {};
        detailDialog.add = res.data.ADD ? { ...res.data.ADD } : {};
        initData();
    } else {
        loading.value = false;
    }
};

let haveLayoutJson = ref(false);
let noeData = ref(false);
// 初始化数据
const initData = async () => {
    loading.value = true;
    let res = await getFormLayout(detailDialog.entityName);
    haveLayoutJson.value = false;
    if (res) {
        if (res.data?.layoutJson) {
            haveLayoutJson.value = true;
            // 根据数据渲染出页面填入的值，填过
            nextTick(async () => {
                let queryByIdRes = await queryById(detailDialog.detailId);
                if (queryByIdRes) {
                    vFormRef.value.setFormJson(res.data.layoutJson);
                    let resData = queryByIdRes.data || {};
                    vFormRef.value.setFormData(resData);
                    approvalStatus.value =
                        queryByIdRes?.data.recordApprovalState || null;
                    if (approvalStatus.value) {
                        approvalStatus.value.entityCode =
                            detailDialog.entityCode;
                        approvalStatus.value.entityName =
                            detailDialog.entityName;
                        approvalStatus.value.recordId = detailDialog.detailId;
                        approvalStatus.value.approvalName =
                            detailDialog.detailTitle;
                    }
                    vFormRef.value.setReadMode();
                    noeData.value = false;
                } else {
                    noeData.value = true;
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


// 打开编辑
let editRefs = ref();
const onEditRow = () => {
    editRefs.value.openDialog(detailDialog);
};

// 编辑确认
const onConfirm = () => {
    // 加载数据
    refresh();
    emits("onConfirm");
};

// 暴露方法给父组件调用
defineExpose({
    openDialog,
});
</script>

<style lang="scss" scoped>
:deep(.el-form-item--default),
:deep(.el-form-item) {
    margin-bottom: 5px !important;
}

.detail-header {
    // padding-bottom: 20px;
    // box-sizing: border-box;
    padding: 20px;
    height: 60px;
    background: #f0f0f0;
    .fr-box {
        // height: 60px;
        .fr-icon {
            cursor: pointer;
            &:hover {
                color: var(--el-color-primary);
            }
        }
    }
}
.detail-main {
    padding: 20px;
    font-size: 14px;
    .detail-right {
        .group-el-button {
            :deep(.el-button) {
                margin-bottom: 5px;
                min-width: 110px !important;
            }
        }
    }
}
</style>

<style lang="scss">
.detail-main {
    .el-form-item--default,
    .el-form-item {
        margin-bottom: 5px !important;
    }
}
</style>
