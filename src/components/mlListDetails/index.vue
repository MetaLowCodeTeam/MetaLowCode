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
                {{ detailDialog.title }}详情
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
                    <el-tabs v-model="activeTabName" @tab-click="handleClick">
                        <el-tab-pane
                            v-for="(tab,inx) of tabList"
                            :label="tab.label"
                            :name="tab.name"
                            :key="inx"
                        ></el-tab-pane>
                    </el-tabs>
                    <div v-if="activeTabName == 'detail'">
                        <v-form-render v-if="haveLayoutJson" ref="vFormRef" />
                    </div>
                    <div v-else>
                        <slot name="tab" :activeTabName="activeTabName"></slot>
                    </div>
                </el-col>
                <el-col :span="6">
                    <div class="detail-right" style="padding-top: 40px;">
                        <slot name="operate" :row="detailDialog.formData"></slot>
                    </div>
                </el-col>
            </el-row>
        </div>
    </el-drawer>
</template>

<script setup>
import { ref, reactive, inject, nextTick } from "vue";
import { queryById } from "@/api/crud";
import { getFormLayout } from "@/api/system-manager";
import { useRouter } from "vue-router";
import useCommonStore from "@/store/modules/common";
const { queryEntityNameById } = useCommonStore();
const router = useRouter();
const props = defineProps({
    titleFromApi: { type: String, default: "" },
});
const emits = defineEmits(["tabChange"]);

// 默认tab
const DefaultTab = [
    {
        label: "详情",
        name: "detail",
    },
];

// 加载状态
let loading = ref(false);

// 当前tab
let tabList = ref([]);
// 当前激活tab
let activeTabName = ref("detail");
// TAB切换
const handleClick = (tab) => {
    if (activeTabName.value == tab.props.name) {
        return;
    }
    activeTabName.value = tab.props.name;
    if (activeTabName.value == "detail") {
        refresh();
    } else {
        detailDialog.activeTabName = tab.props.name;
        emits("tabChange", detailDialog);
    }
};

// 详情数据
let detailDialog = reactive({
    isShow: false,
    id: "",
    title: "",
    entityName: "",
    // 当前数据
    formData: {},
});
// 打开详情弹框
const openDialog = (row) => {
    detailDialog.id = row.id;
    detailDialog.isShow = true;
    detailDialog.title = row.title;
    detailDialog.entityName = queryEntityNameById(row.id);
    tabList.value = [...DefaultTab];
    // 自定义tab
    if (row.tabs && row.tabs.length > 0) {
        tabList.value.push(...row.tabs);
    }
    // 加载数据
    refresh();
};
// 关闭弹框
const closeDialog = () => {
    detailDialog.isShow = false;
};

// 表单数据是否显示
let haveLayoutJson = ref(false);
let vFormRef = ref();
// 刷新数据
const refresh = async () => {
    loading.value = true;
    haveLayoutJson.value = false;
    let res = await getFormLayout(detailDialog.entityName);
    if (res) {
        if (res.data?.layoutJson && activeTabName.value == "detail") {
            haveLayoutJson.value = true;
            
            // 根据数据渲染出页面填入的值，填过
            nextTick(async () => {
                let formData = await queryById(detailDialog.id);
                vFormRef.value.setFormJson(res.data.layoutJson);
                if (formData) {
                    detailDialog.formData = formData.data;
                    if (props.titleFromApi) {
                        detailDialog.title = formData.data[props.titleFromApi];
                    }
                    vFormRef.value.setFormData(detailDialog.formData);
                    nextTick(() => {
                        //vFormRef.value.disableForm();
                        vFormRef.value.setReadMode();
                    });
                }
                loading.value = false;
            });
            loading.value = false;
        } else {
            detailDialog.activeTabName = activeTabName.value;
            emits("tabChange", detailDialog);
            loading.value = false;
        }
    } else {
        loading.value = false;
    }
};

// 暴露方法给父组件调用
defineExpose({
    openDialog,
    closeDialog,
    refresh,
    loading,
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
