<template>
    <div class="detail-tabs">
        <el-tabs v-model="activeName" class="demo-tabs" @tab-click="handleClick" :tab-position="publicSetting.detailTabsPosition || 'top'">
            <el-tab-pane
                v-for="(tab,tabInx) of tabs"
                :key="tabInx"
                :label="tab.columnAliasName || tab.entityLabel"
                :name="tab.entityName + '-' + tabInx"
            >
            </el-tab-pane>
        </el-tabs>
        <span class="setting-tabs" @click="openDialog" v-if="$TOOL.checkRole('r6008')">
            <el-icon>
                <ElIconSetting />
            </el-icon>
        </span>
    </div>
    <DetailTabsSet
        ref="detailTabsSetRefs"
        :entityCode="detailDialog.entityCode"
        :entityName="detailDialog.entityName"
        :modelName="modelName"
        @confirm="confirm"
    />
</template>

<script setup>
import { inject, onMounted, ref, watch, watchEffect } from "vue";
import useCommonStore from "@/store/modules/common";
import { storeToRefs } from "pinia";
import http from "@/utils/request";
const { publicSetting } = storeToRefs(useCommonStore());
import DetailTabsSet from "./DetailTabsSet.vue";
const props = defineProps({
    cutTabIndex: { type: [String,Number], default: 0 },
    checkTabsFilter: { type: Object, default: () => {} },
    tabsConf: { type: Object, default: () => {} },
    // 默认第一个tab label
    defaultFirstTabLabel: { type: String, default: "" },
    modelName: { type: String, default: "" },
});
const emits = defineEmits(["update:modelValue", "tabChange","confirm"]);
const $TOOL = inject("$TOOL");
let detailDialog = ref({});
let tabs = ref();


// 详情数据
let detailData = ref({});

let activeName = ref("");
let myCheckTabsFilter = ref({});


// 初始化tab
const initTabs = async () => {
    let config = detailDialog.value.tab?.config;
   
    if (config) {
        config = JSON.parse(config);
        // console.log(config,'config')
        // 2025-06-03 新加的动态显示事件
        let sourceConfigColumn;
        // console.log(sourceConfigColumn,'sourceConfigColumn')
        if(config.showEventCode) {
            let { showEventCode, column } = config;
            let newColumn = JSON.parse(JSON.stringify(column));
            try {
                let tabShowEventCode = new Function('column', 'exposed', showEventCode)(
                    newColumn,
                    {
                        http,
                        isMobile: false,
                        detailData: detailData.value,
                    }
                );
                 // 判断是否是 Promise
                if (tabShowEventCode instanceof Promise) {
                    tabShowEventCode = await tabShowEventCode; // 等待异步结果
                }
                if(tabShowEventCode && typeof tabShowEventCode === 'object') {
                    sourceConfigColumn = tabShowEventCode;
                }else {
                    sourceConfigColumn = newColumn;  
                }
            } catch (error) {
                console.log(error,'error')
                sourceConfigColumn = newColumn;
            }
        }else {
            sourceConfigColumn = config;
        }
        tabs.value = [
            {
                entityLabel: props.defaultFirstTabLabel || "详情",
                entityName: "detail",
            },
        ];
        sourceConfigColumn.forEach((el,inx) => {
            if(myCheckTabsFilter.value[inx] && !el.isCustomComponent){
                tabs.value.push(el);
            }
            if(el.isCustomComponent && el.pcShow){
                let entityName = "detail_custom_component";
                if (el.pcShow && el.mobileShow) {
                    entityName += "_all";
                } else {
                    entityName += "_pc";
                } 
                entityName += "_" + el.componentName
                el.entityName = entityName;
                tabs.value.push(el);
            }
        });
    }
    // 添加安全检查，确保tabs有数据
    if (!tabs.value || tabs.value.length === 0) {
        // 如果没有数据，设置默认值
        tabs.value = [
            {
                entityLabel: props.defaultFirstTabLabel || "详情",
                entityName: "detail",
            },
        ];
    }
    let takInx = tabs.value[props.cutTabIndex] ? props.cutTabIndex : 0;
    // 确保takInx在有效范围内
    if (takInx >= tabs.value.length) {
        takInx = 0;
    }
    activeName.value = tabs.value[takInx].entityName + '-' + takInx;
};

// 防抖执行initTabs
const debouncedInitTabs = () => {
    if (initTabsTimer.value) {
        clearTimeout(initTabsTimer.value);
    }
    initTabsTimer.value = setTimeout(() => {
        initTabs();
    }, 100); // 100ms防抖
};

// 使用更精确的watch，只在真正需要时执行
let lastTabsConf = ref(null);
let lastCheckTabsFilter = ref(null);
// 防抖执行initTabs
let initTabsTimer = ref(null);

watch(
    [() => props.tabsConf, () => props.checkTabsFilter],
    ([newTabsConf, newCheckTabsFilter]) => {
        // 检查是否真的发生了变化
        const tabsConfChanged = JSON.stringify(newTabsConf) !== JSON.stringify(lastTabsConf.value);
        const checkTabsFilterChanged = JSON.stringify(newCheckTabsFilter) !== JSON.stringify(lastCheckTabsFilter.value);
        
        if (tabsConfChanged || checkTabsFilterChanged) {
            lastTabsConf.value = JSON.parse(JSON.stringify(newTabsConf));
            lastCheckTabsFilter.value = JSON.parse(JSON.stringify(newCheckTabsFilter));
            
            detailDialog.value = newTabsConf;
            myCheckTabsFilter.value = newCheckTabsFilter || {};
            debouncedInitTabs(); // 使用防抖执行
        }
    },
    { immediate: true, deep: true }
);

// watchEffect(() => {
//     detailDialog.value = props.tabsConf;
//     myCheckTabsFilter.value = props.checkTabsFilter || {};
//     initTabs();
// })

// 打开显示项设置
let detailTabsSetRefs = ref("");
const openDialog = () => {
    detailTabsSetRefs.value.openDialog(detailDialog.value.tab);
};

const handleClick = (e) => {
    emits("tabChange", e);
};

const confirm = (e) => {
    detailDialog.value.tab = e;
    emits("update:modelValue", detailDialog.value);
    emits('confirm')
};



// 设置相关数据
const setTabsData = (data) => {
    detailData.value = data;
}

defineExpose({
    setTabsData,
})

</script>
<style lang='scss' scoped>
.detail-tabs {
    position: relative;
    :deep(.el-tabs__nav-wrap) {
        // padding-right: 40px; 
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
        display: block;
        &:hover {
            color: var(--el-color-primary);
        }
    }
}
</style>