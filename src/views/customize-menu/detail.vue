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
                    <span class="fr-icon mr-10" @click="initData">
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
                    <DetailTabs v-model="detailDialog" />
                </el-col>
                <el-col :span="6">
                    <div class="detail-right" style="padding-top: 40px;">
                        <el-button>
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
                        />
                    </div>
                </el-col>
            </el-row>
        </div>
    </el-drawer>
</template>

<script setup>

import { ref, reactive,inject } from "vue";
import DetailTabs from "./components/DetailTabs.vue";
import More from "./components/More.vue";
const $API = inject("$API");
let detailDialog = reactive({
    isShow: false,
});
let loading = ref(false);
let multipleSelection = ref([]);
const openDialog = (row) => {
    detailDialog = Object.assign(detailDialog, row);
    
    multipleSelection.value = [row];
    detailDialog.isShow = true;
    if(!detailDialog.tab || JSON.stringify(detailDialog.tab) == "{}"){
        getLayoutList();
    }else {
        initData();
    }
    
};

// 加载页签
const getLayoutList =async () => {
    loading.value = true;
    let res = await $API.layoutConfig.getLayoutList(detailDialog.entityName);
    if(res){
        detailDialog.tab = res.data.TAB ? { ...res.data.TAB } : {};
        initData();
    }
    loading.value = false;
}


// 初始化数据
const initData = () => {
    loading.value = true;
    
    setTimeout(() => {
        loading.value = false;
    }, 10);
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
}
</style>