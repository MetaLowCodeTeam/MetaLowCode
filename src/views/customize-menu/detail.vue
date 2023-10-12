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
            <el-row :gutter="20">
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
                        <DetailTabCom :cutTab="cutTab" :tabs="detailDialog.tab" />
                    </div>
                </el-col>
                <el-col :span="6">
                    <div class="detail-right" style="padding-top: 40px;">
                        <NewRelated
                            :entityName="detailDialog.entityName"
                            :entityCode="detailDialog.entityCode"
                            :addConf="detailDialog.add"
                            @confirm="getLayoutList"
                            @add="onAdd"
                        />
                        <el-button @click="onEditRow" class="ml-10">
                            <span class="mr-5">
                                <el-icon>
                                    <ElIconEditPen />
                                </el-icon>
                            </span>
                            编辑
                        </el-button>
                        <More
                            type="detail"
                            :multipleSelection="multipleSelection"
                            :entityCode="detailDialog.entityCode"
                            :detailId="detailDialog.detailId"
                            :idFiledName="detailDialog.idFiledName"
                        />
                        {{ fromData.approvalStatus }}
                        <ApprovalRelated
                            v-if="fromData.approvalStatus"
                            :approvalStatus="approvalStatus"
                        />
                    </div>
                </el-col>
            </el-row>
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
const emits = defineEmits(["onConfirm", "onAdd"]);
const $API = inject("$API");
const $ElMessage = inject("$ElMessage");
const vFormRef = ref();
let detailDialog = reactive({
    isShow: false,
});
let loading = ref(false);
let multipleSelection = ref([]);
let fromData = reactive({});
// 新建
const onAdd = (e) => {
    emits("onAdd", e);
};

// 当前页签
let cutTab = ref("detail");
const openDialog = (row) => {
    detailDialog = Object.assign(detailDialog, row);
    multipleSelection.value = [row];
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

// 加载页签
const getLayoutList = async () => {
    loading.value = true;
    let res = await $API.layoutConfig.getLayoutList(detailDialog.entityName);
    if (res) {
        detailDialog.tab = res.data.TAB ? { ...res.data.TAB } : {};
        detailDialog.add = res.data.ADD ? { ...res.data.ADD } : {};
        initData();
    }
    loading.value = false;
};

let haveLayoutJson = ref(false);
// 初始化数据
const initData = async () => {
    loading.value = true;
    let res = await getFormLayout(detailDialog.entityName);
    if (res) {
        if (res.data?.layoutJson) {
            haveLayoutJson.value = true;
            // // 根据数据渲染出页面填入的值，填过
            nextTick(async () => {
                let queryByIdRes = await queryById(detailDialog.detailId);
                vFormRef.value.setFormJson(res.data.layoutJson);
                if (queryByIdRes) {
                    let resData = queryByIdRes.data || {};
                    fromData = Object(fromData, resData);
                    console.log(fromData, "fromData");
                    vFormRef.value.setFormData(fromData);
                    vFormRef.value.setReadMode();
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

// 给URL加参数--------暂时未用
const addUrlParam = (key, value) => {
    let obj = new window.URL(window.location.href);
    obj.searchParams.set(key, value);
    return obj.href;
};

// 打开编辑
let editRefs = ref();
const onEditRow = () => {
    editRefs.value.openDialog(detailDialog);
};

// 编辑确认
const onConfirm = () => {
    emits("onConfirm");
};

// 暴露方法给父组件调用
defineExpose({
    openDialog,
});
</script>

<style lang="scss" scoped>
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
        :deep(.el-button) {
            margin-bottom: 5px;
        }
    }
}
</style>