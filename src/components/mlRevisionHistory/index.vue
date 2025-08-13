<template>
    <ml-dialog 
        v-model="isShow" 
        title="变更详情" 
        width="35%"
        scrollbarMaxHeight="500px"
    >
        <div v-loading="historyLoading" loading-text="数据加载中...">
            <!-- 主实体变更详情 -->
            <div v-if="historyData.length > 0" class="main-entity-section mb-15">
                <div class="main-entity-title mb-10">
                    <h4>主数据</h4>
                </div>
                <el-table
                    :data="historyData"
                    style="width: 100%"
                    stripe
                    :border="true"
                >
                    <el-table-column 
                        prop="label" 
                        label="字段" 
                    />
                    <el-table-column prop="before" label="变更前" />
                    <el-table-column prop="after" label="变更后" />
                </el-table>
            </div>
            
            <!-- 明细表数据 -->
            <div v-if="Object.keys(detailTableData).length > 0" class="mb-15">
                <div 
                    v-for="(detailData, entityName) in detailTableData" 
                    :key="entityName"
                    class="detail-entity-section mb-15"
                >
                    <!-- 明细表标题 -->
                    <div class="detail-entity-title mb-10">
                        <h4>
                            {{ detailData.entityLabel || detailData.entityName }}
                            <span 
                                v-if="!isDetailExpanded(entityName)" 
                                class="ml-a-span detail-action-span" 
                                @click="toggleDetailExpansion(entityName, true)"
                            >
                                全部展开
                            </span>
                            <span 
                                v-else
                                class="ml-a-span detail-action-span" 
                                @click="toggleDetailExpansion(entityName, false)"
                            >
                                全部收起
                            </span>
                        </h4>
                    </div>
                    
                    <!-- 按 detailRecordId 分组的折叠面板 -->
                    <el-collapse v-model="detailActiveNames[entityName]">
                        <el-collapse-item 
                            v-for="(recordData, recordId) in detailData.records" 
                            :key="`${entityName}-${recordId}`"
                            :name="`${entityName}-${recordId}`"
                        >
                            <template #title>
                                <div class="pl-10 pr-10">
                                    <span class="action-span add" v-if="recordData.type == 1">新增</span>
                                    <span class="action-span edit" v-if="recordData.type == 2">修改</span>
                                    <span class="action-span delete" v-if="recordData.type == 3">删除</span>
                                    {{ recordData.recordLabel }}
                                </div>
                            </template>
                            <div class="pl-10 pr-10">
                                <el-table :data="recordData.data" border>
                                    <el-table-column prop="label" label="字段" />
                                    <el-table-column prop="before" label="变更前" />
                                    <el-table-column prop="after" label="变更后" />
                                </el-table>
                            </div>
                        </el-collapse-item>
                    </el-collapse>
                </div>
            </div>
        </div>
    </ml-dialog>
</template>

<script setup>
import { ref, watch } from "vue";
import { revisionHistoryDetailsById } from "@/api/crud";

let revisionHistoryId = ref('');

// 组件事件
const emits = defineEmits(['update:modelValue']);

// 响应式变量
let isShow = ref(false);
let historyData = ref([]);
let historyLoading = ref(false);
let detailTableData = ref({}); // 明细表数据
let detailActiveNames = ref({}); // 每个明细表的展开状态



// 加载变更历史详情
const loadRevisionHistory = async () => {
    if (!revisionHistoryId.value) return;
    
    historyLoading.value = true;
    let res = await revisionHistoryDetailsById(revisionHistoryId.value);
    if (res?.code == 200) {
        let resData = res.data;
        // 根据 detailEntityName 分组，明细表下再按 detailRecordId 分组
        let mainTableData = []; // 主表数据 (detailEntityName 为 null)
        detailTableData.value = {}; // 明细表数据 (按 detailEntityName 分组，再按 detailRecordId 分组)
        
        resData.forEach(item => {
            if (!item.detailEntityName) {
                // 主表数据
                mainTableData.push(item);
            } else {
                // 明细表数据，按 detailEntityName 分组，再按 detailRecordId 分组
                if (!detailTableData.value[item.detailEntityName]) {
                    detailTableData.value[item.detailEntityName] = {
                        entityName: item.detailEntityName,
                        entityLabel: item.detailEntityLabel,
                        records: {} // 按 detailRecordId 分组的记录
                    };
                    // 初始化该明细表的展开状态
                    detailActiveNames.value[item.detailEntityName] = [];
                }
                
                const recordId = item.detailRecordId || 'unknown';
                if (!detailTableData.value[item.detailEntityName].records[recordId]) {
                    detailTableData.value[item.detailEntityName].records[recordId] = {
                        recordId: recordId,
                        recordLabel: item.detailRecordLabel || '未知记录',
                        type: item.type,
                        data: []
                    };
                }
                
                detailTableData.value[item.detailEntityName].records[recordId].data.push(item);
            }
        });
        
        // 主表数据放到 historyData
        historyData.value = mainTableData;
    }
    historyLoading.value = false;
};

// 切换明细表展开/收起状态
const toggleDetailExpansion = (entityName, isExpand) => {
    if (isExpand) {
        // 展开：获取该明细表下所有记录的ID
        const entityData = detailTableData.value[entityName];
        detailActiveNames.value[entityName] = Object.keys(entityData.records).map(recordId => `${entityName}-${recordId}`);
    } else {
        // 收起：清空该明细表的展开状态
        detailActiveNames.value[entityName] = [];
    }
};

// 判断明细表是否已展开
const isDetailExpanded = (entityName) => {
    // 判断指定明细表是否已展开（展开状态数组长度 > 0）
    return detailActiveNames.value[entityName] && detailActiveNames.value[entityName].length > 0;
};

const openDialog = (historyId) => {
    isShow.value = true;
    revisionHistoryId.value = historyId;
    loadRevisionHistory();
};

// 暴露方法给父组件
defineExpose({
    openDialog
});
</script>

<style lang="scss" scoped>
.main-entity-section {
    border: 1px solid #e4e7ed;
    border-radius: 4px;
    padding: 15px;
    background: #fafafa;
    margin-bottom: 15px;
}

.main-entity-title {
    border-bottom: 1px solid #e4e7ed;
    padding-bottom: 8px;
    margin-bottom: 15px;
    
    h4 {
        margin: 0;
        color: #303133;
        font-size: 16px;
        font-weight: 600;
    }
}

.detail-entity-section {
    border: 1px solid #e4e7ed;
    border-radius: 4px;
    padding: 15px;
    background: #fafafa;
    margin-bottom: 15px;
}

.detail-entity-title {
    border-bottom: 1px solid #e4e7ed;
    padding-bottom: 8px;
    margin-bottom: 15px;
    
    h4 {
        margin: 0;
        color: #303133;
        font-size: 16px;
        font-weight: 600;
    }
    
    .detail-action-span {
        float: right;
        font-size: 14px;
        font-weight: normal;
    }
}

.action-span {
    display: inline-block;
    width: 40px;
    height: 20px;
    line-height: 20px;
    text-align: center;
    color: #fff;
    border-radius: 10px;
    font-size: 12px;
    font-weight: normal;
    position: relative;
    top: -1px;
    
    &.add {
        background: var(--el-color-success);
    }
    
    &.edit {
        background: var(--el-color-warning);
    }
    
    &.delete {
        background: var(--el-color-danger);
    }
}

.mb-15 {
    margin-bottom: 15px;
}

.mb-10 {
    margin-bottom: 10px;
}

.ml-a-span {
    cursor: pointer;
    color: var(--el-color-primary);
    
    &:hover {
        text-decoration: underline;
    }
}

.pl-10 {
    padding-left: 10px;
}

.pr-10 {
    padding-right: 10px;
}
</style>
