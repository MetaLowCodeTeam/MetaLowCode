<style scoped lang="scss">
.main-view {
	height: 100%;
}
.detail-content {
    height: calc(100% - 56px);
}
.attachment-content {
    padding: 0 10px;
    height: calc(100% - 56px);
    overflow: auto;
    :deep(.ml-attachment-comp) {
        height: 100%;
        .main-body {
            height: calc(100% - 90px);
        }
    }
}
.other-content {
    padding: 0 10px;
    height: calc(100% - 56px);
    overflow: auto;
}

:deep(.detail-tabs) {
	padding: 0 10px;
	.setting-tabs {
		right: 10px;
	}
}
</style>
<template>
	<div
		class="main-view"
		v-loading="loading"
		:element-loading-text="loadingText"
	>
		<DetailTabs
			:tabsConf="tabsConf"
			@tabChange="tabChange"
			:cutTabIndex="currentTab.inx"
			@confirm="refreshData"
			:checkTabsFilter="checkTabsFilter"
            defaultFirstTabLabel="基本信息"
		/>
		<!-- 详情 -->
		<div v-if="currentTab.comp == 'detail'" class="detail-content">
            <MainDetail 
                :type="currentDetailType" 
                ref="mainDetailRefs"
                @saveFinishCallBack="baseInfoSaveFinishCallBack"
                @initFinish="initFinish"
            />
		</div>
        <div v-else-if="currentTab.comp == 'Attachment'" class="attachment-content">
            <Attachment :entityCode="myEntity.entityCode" :recordId="myEntity.recordId"/>
        </div>
        <div v-else class="other-content">
            <DetailTabCom
                ref="detailTabComRefs"
                :cutTab="currentTab.name"
                :tabs="tabsConf.tab"
                :cutTabIndex="currentTab.inx"
                :entityId="myEntity.recordId"
                :idFieldName="myEntity.idFieldName"
                @addRow="onAdd"
            />
        </div>
	</div>
    <mlCustomEdit 	
        ref="editRefs"
        @saveFinishCallBack="saveFinishCallBack"
		:nameFieldName="myEntity.nameFieldName"
    />
</template>
<script setup>
import { ref, watchEffect, reactive, nextTick } from "vue";


// API
import layoutConfig from "@/api/layoutConfig";
import { checkTables } from "@/api/layoutConfig";


// 组件
import DetailTabs from "@/views/customize-menu/components/DetailTabs.vue";
import MainDetail from "./MainDetail.vue";
import Attachment from "@/views/customize-menu/components/Attachment/Index.vue";
import DetailTabCom from "@/views/customize-menu/components/DetailTabCom.vue";
import mlCustomEdit from '@/components/mlCustomEdit/index.vue';

const emit = defineEmits(['saveFinishCallBack','initFinish']);
// 详情页签状态
let currentDetailType = ref("edit");
// 当前记录id
let currentRecordId = ref("");
// 加载中
let loading = ref(false);
let loadingText = ref("加载页签中...");
// 实体信息
let myEntity = reactive({
	name: "",
	code: "",
	label: "",
	nameFieldName: "",
	idFieldName: "",
    recordId: "",
});
// 页签配置
let tabsConf = ref({});
// 当前页签
let currentTab = reactive({
	inx: 0,
	name: "detail-1",
	comp: "detail",
});
// 页签过滤参数
let checkTabsFilter = ref({});

// 新建基本信息
const mainDetailRefs = ref(null);

const refreshData = () => {
    initData(myEntity, true);
}

// 初始化数据
const initData = async (paramEntity, isRefresh = false) => {
    if(currentTab.comp !== 'detail') {
        currentTab.comp = 'detail';
        currentTab.name = 'detail-1';
        currentTab.inx = 0;
    }
    myEntity = Object.assign(myEntity, paramEntity);
    currentDetailType.value = paramEntity.recordId == 'add' ? 'add' : 'edit';
    if(isRefresh){
        loading.value = true;
    }
	let res = await layoutConfig.getLayoutList(myEntity.name);
	if (res) {
        if(currentDetailType.value == 'add') {
            nextTick(() => {
                tabsConf.value.tab = {};
                mainDetailRefs.value.initFormData(myEntity);
            });
            return
        }
		// 如果有页签配置
		if (res.data.TAB?.config) {
			// 取所有页签数据
			let tabConfig = JSON.parse(res.data.TAB.config);
			// 2025-06-03 新加的动态显示事件
			let sourceConfigColumn = [];
			if(tabConfig.showEventCode) {
				sourceConfigColumn = tabConfig.column;
			}else {
				sourceConfigColumn = tabConfig;
			}
			// 拿所有页签过滤参数
            let filterList = sourceConfigColumn.map(el => el.filter);
            if(filterList && filterList.length > 0){
                // 调用查询接口判断该页签是否显示
                let tabRes = await checkTables(filterList, myEntity.recordId);
                if(tabRes){
                    checkTabsFilter.value = tabRes.data;
                }
            }
		}
		tabsConf.value.tab = res.data.TAB ? { ...res.data.TAB } : {};
		tabsConf.value.entityCode = myEntity.entityCode;
		tabsConf.value.entityName = myEntity.name;

        nextTick(() => {
            mainDetailRefs.value?.initFormData(myEntity);
            loading.value = false;
        });
	}else {
        loading.value = false;
    }
    
};
// 页签切换
const tabChange = (tab) => {
	currentTab.inx = tab.index;
	currentTab.comp = tab.props.name.split("-")[0];
	currentTab.name = tab.props.name;
    if(currentTab.comp == 'detail'){
        nextTick(() => {
            loading.value = true;
            mainDetailRefs.value?.initFormData(myEntity);
        });
    }
};
// 其他列表页签添加
const onAdd = (e) => {
    let tempV = {};
	tempV.entityName = e.entityName;
    tempV.fieldName = e.fieldName;
    editEmits(tempV)
};
// 其他列表保存成功回调
let detailTabComRefs = ref();
const saveFinishCallBack = () => {
    detailTabComRefs.value.initData();
}
// 其他页签新建弹窗
const editRefs = ref(null);
const editEmits = (obj) => {
    editRefs.value.openDialog(obj);
}

// 基本信息保存成功回调
const baseInfoSaveFinishCallBack = (data) => {
    emit('saveFinishCallBack', data);
}
// 基本信息初始化成功回调
const initFinish = () => {
    emit('initFinish');
    loading.value = false;
}

defineExpose({
    initData
})
</script>
