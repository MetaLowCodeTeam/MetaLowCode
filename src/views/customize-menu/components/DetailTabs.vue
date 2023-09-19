<template>
    <div class="detail-tabs">
        <el-tabs v-model="activeName" class="demo-tabs" @tab-click="handleClick">
            <el-tab-pane
                v-for="(tab,tabInx) of tabs"
                :key="tabInx"
                :label="tab.entityLabel"
                :name="tab.entityName"
            ></el-tab-pane>
        </el-tabs>
        <span class="setting-tabs" @click="openDialog" v-if="$TOOL.getAuto('r6008')">
            <el-icon>
                <ElIconSetting />
            </el-icon>
        </span>
    </div>
    <DetailTabsSet
        ref="detailTabsSetRefs"
        :entityCode="detailDialog.entityCode"
        :entityName="detailDialog.entityName"
        @confirm="confirm"
    />
</template>

<script setup>
import { inject, onMounted, ref, watch } from "vue";
import DetailTabsSet from "./DetailTabsSet.vue";
const props = defineProps({
    modelValue: null,
});
const emits = defineEmits(["update:modelValue"]);
const $TOOL = inject("$TOOL")
let detailDialog = ref({});
let tabs = ref();

watch(
    () => props.modelValue,
    () => {
        detailDialog.value = props.modelValue;
        initTabs();
    },
    { deep: true }
);
let activeName = ref("");
onMounted(() => {
    detailDialog.value = props.modelValue;
    initTabs();
});

// 初始化tab
const initTabs = () => {
    tabs.value = [
        {
            entityLabel: "详情",
            entityName: "detail",
        },
    ];
    let config = detailDialog.value.tab.config;
    if (config) {
        config = JSON.parse(config);
        config.forEach((el) => {
            tabs.value.push(el);
        });
    }
    activeName.value = tabs.value[0].entityName;
};

// 打开显示项设置
let detailTabsSetRefs = ref("");
const openDialog = () => {
    detailTabsSetRefs.value.openDialog(detailDialog.value.tab);
};

const handleClick = (e) => {
    console.log(e.props.name, "页签变化");
};

const confirm = (e) => {
    detailDialog.value.tab.config = e;
    emits("update:modelValue", detailDialog.value);
};
</script>
<style lang='scss' scoped>
.detail-tabs {
    position: relative;
    :deep(.el-tabs__nav-wrap) {
        padding-right: 40px;
        .el-tabs__nav-next {
            right: 20px;
        }
    }
    .setting-tabs {
        cursor: pointer;
        font-size: 16px;
        position: absolute;
        top: 12px;
        right: 0;
        display: none;
        &:hover {
            color: var(--el-color-primary);
        }
    }
    &:hover {
        .setting-tabs {
            display: block;
        }
    }
}
</style>