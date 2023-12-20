<template>
    <el-drawer
        size="62.4%"
        class="ml-drawer"
        v-model="detailDialog.isShow"
        direction="rtl"
        :show-close="false"
    >
        <template #header>
            <div class="detail-header">
                <div class="detail-header-title">
                    {{ detailName }}
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
            </div>
        </template>

        <div class="detail-main" v-loading="loading">
            <el-row :gutter="20" v-if="!noeData">
                <el-col :span="21">
                    <DetailTabs
                        v-model="detailDialog"
                        @tabChange="tabChange"
                        :cutTab="cutTab"
                        @confirm="refresh"
                    />
                    <!-- 详情 -->
                    <div v-if="cutTab == 'detail'">
                        <v-form-render
                            v-if="haveLayoutJson"
                            :option-data="optionData"
                            ref="vFormRef"
                        />
                        <el-empty v-else :image-size="100" description="未查询到相关配置数据" />
                    </div>
                    <!-- 非详情 -->
                    <div v-else>
                        <DetailTabCom
                            ref="detailTabComRefs"
                            :cutTab="cutTab"
                            :tabs="detailDialog.tab"
                            :entityId="detailId"
                        />
                    </div>
                </el-col>
                <el-col :span="3">
                    <div class="detail-right" style="padding-top: 40px;">
                        <div class="group-button-label">基本操作</div>
                        <el-row class="group-el-button" style="margin-bottom: 30px">
                            <el-col :span="24">
                                <NewRelated
                                    :entityName="entityName"
                                    :entityCode="entityCode"
                                    :addConf="addConf"
                                    @confirm="newRelatedConfirm"
                                    @add="onAdd"
                                    v-if="$TOOL.checkRole('r6008')"
                                />
                            </el-col>
                            <el-col :span="24">
                                <el-button
                                    type="primary"
                                    plain
                                    @click="onEditRow"
                                    :disabled="approvalStatus && (approvalStatus.approvalStatus == 3 || approvalStatus.approvalStatus == 1)"
                                    :title="getEditBtnTitle()"
                                >
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
                                    :entityCode="entityCode"
                                    :detailId="detailId"
                                    :idFieldName="idFieldName"
                                    :nameFieldName="nameFieldName"
                                    @editColumnConfirm="editColumnConfirm"
                                />
                            </el-col>
                        </el-row>

                        <el-row class="group-el-button">
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
        <Edit ref="editRefs" @onConfirm="onConfirm" :nameFieldName="nameFieldName" />
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
let vFormRef = ref();
let detailDialog = reactive({
    isShow: false,
    tab: {},
});
let loading = ref(false);
let multipleSelection = ref([]);
let approvalStatus = ref(null);

let entityCode = ref("");
let entityName = ref("");
let detailId = ref("");
let idFieldName = ref("");
let detailName = ref("");
let nameFieldName = ref("");

// 当前页签
let cutTab = ref("detail");
const openDialog = (id) => {
    detailId.value = id;
    entityCode.value = queryEntityCodeById(id);
    entityName.value = queryEntityNameById(id);
    if (!entityName.value) {
        ElMessage.warning("当前实体未找到");
        return;
    }
    detailDialog.entityCode = entityCode.value;
    detailDialog.entityName = entityName.value;
    detailDialog.isShow = true;
    // let row = {};
    // row[idFieldName.value] = id;
    // console.log(row,'row')

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
    getLayoutList();
};

// 新建相关
let addConf = ref({});
let detailTabComRefs = ref();
// 新建相关完成触发
const newRelatedConfirm = async () => {
    loading.value = true;
    let res = await $API.layoutConfig.getLayoutList(entityName.value);
    if (res) {
        addConf.value = res.data.ADD ? { ...res.data.ADD } : {};
        if (cutTab.value == "detail") {
            initData();
        } else {
            detailTabComRefs.value.initData();
        }
    }
    loading.value = false;
};

// 提交审批触发
const onSubmitApproval = () => {
    onConfirm();
};

// 加载页签
const getLayoutList = async () => {
    loading.value = true;
    let res = await $API.layoutConfig.getLayoutList(entityName.value);
    if (res) {
        detailDialog.tab = res.data.TAB ? { ...res.data.TAB } : {};
        addConf.value = res.data.ADD ? { ...res.data.ADD } : {};
        idFieldName.value = res.data.idFieldName;
        nameFieldName.value = res.data.nameFieldName;
        let row = {};
        row[idFieldName.value] = detailId.value;
        multipleSelection.value = [row];
        initData();
    } else {
        loading.value = false;
    }
};

let haveLayoutJson = ref(false);
let noeData = ref(false);
let optionData = ref({});
// 初始化数据
const initData = async () => {
    loading.value = true;
    let res = await getFormLayout(entityName.value);
    haveLayoutJson.value = false;
    noeData.value = false;
    if (res) {
        if (res.data?.layoutJson) {
            haveLayoutJson.value = true;
            optionData.value = res.data.optionData || {};
            // 根据数据渲染出页面填入的值，填过
            nextTick(async () => {
                let queryByIdRes = await queryById(detailId.value);
                if (queryByIdRes && queryByIdRes.data) {
                    detailName.value = queryByIdRes.data[nameFieldName.value];
                    vFormRef.value.setFormJson(res.data.layoutJson);
                    let resData = queryByIdRes.data || {};
                    // resData.logo = resData.logo || [];
                    vFormRef.value.resetForm();
                    vFormRef.value.setFormData(resData);
                    nextTick(() => {
                        if (JSON.stringify(optionData.value) == "{}") {
                            vFormRef.value.reloadOptionData();
                        }
                        approvalStatus.value =
                            queryByIdRes?.data.recordApprovalState || null;
                        if (approvalStatus.value) {
                            approvalStatus.value.entityCode = entityCode.value;
                            approvalStatus.value.entityName = entityName.value;
                            approvalStatus.value.recordId = detailId.value;
                            approvalStatus.value.approvalName =
                                detailDialog.detailTitle;
                        }
                        vFormRef.value.setReadMode();
                    });

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
    editRefs.value.openDialog({ detailId: detailId.value });
};

// 新建
const onAdd = (e) => {
    let tempV = {};
    tempV.entityName = e.entityName;
    tempV.fieldName = e.fieldName;
    tempV.fieldNameVale = detailId.value;
    tempV.fieldNameLabel = detailName.value;
    editRefs.value.openDialog(tempV);
};

const editColumnConfirm = (v) => {
    if (v && v.isDel) {
        detailDialog.isShow = false;
        emits("onConfirm");
    } else {
        onConfirm();
    }
};

// 编辑确认
const onConfirm = () => {
    if (cutTab.value == "detail") {
        initData();
    } else {
        detailTabComRefs.value.initData();
    }
    emits("onConfirm");
};

const getEditBtnTitle = () => {
    let str = "";
    if (approvalStatus.value && approvalStatus.value.approvalStatus == 3) {
        str = "记录已完成审批，禁止编辑";
        return;
    }
    if (approvalStatus.value && approvalStatus.value.approvalStatus == 1) {
        str = "记录正在审批中，禁止编辑";
    }
    return str;
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
    border-bottom: 2px solid #f1f2f3;
    // padding-bottom: 20px;
    // box-sizing: border-box;
    padding: 16px;
    height: 56px;
    //background: #f0f0f0;
    .fr-box {
        // height: 60px;
        .fr-icon {
            cursor: pointer;
            &:hover {
                color: var(--el-color-primary);
            }
        }
    }

    .detail-header-title {
        font-size: 18px;
        padding-left: 5px;
        border-left: 5px solid;
        border-left-color: var(--el-color-primary);
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

        .group-button-label {
            font-size: 11px;
            color: #999999;
            margin-bottom: 5px;
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
