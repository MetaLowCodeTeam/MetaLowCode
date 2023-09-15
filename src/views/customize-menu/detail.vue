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
                {{ entityLable[detailDialog.entityCode] }}详情
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
                    <DetailTabs
                        v-model="detailDialog"
                    />
                </el-col>
                <el-col :span="6">
                    <div class="detail-right" style="padding-top: 40px;">
                        <!-- <el-button @click="testBtn">测试按钮</el-button> -->
                    </div>
                </el-col>
            </el-row>
        </div>
    </el-drawer>
</template>

<script setup>
import useCommonStore from "@/store/modules/common";
import { storeToRefs } from "pinia";
import { ref, reactive } from "vue";
import DetailTabs from "./components/DetailTabs.vue";
const { entityLable } = storeToRefs(useCommonStore());
let detailDialog = reactive({
    isShow: false,
});
let loading = ref(false);

const openDialog = (row) => {
    detailDialog = Object.assign(detailDialog, row);
    detailDialog.isShow = true;
    initData();
};

/**
 * ************************************************************ tab页签相关数据 beg
 */

let tabs = ref([
    {
        label: "详情",
        name: "detail",
    },
]);
let cutTab = ref("detail");


/**
 * ************************************************************ tab页签相关数据 end
 */

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
                color: $ml-primary;
            }
        }
    }
}
.detail-main {
    padding: 20px;
    font-size: 14px;
}
</style>