<template>
    <!--  -->
    <div v-loading="loading">
        <el-empty v-if="tableColumn.length == 0" :image-size="100" description="未查询到该实体相关配置列数据" />
        <div v-else class="main">
            <div class="main-header">
                <el-input v-model="quickQueryVal" placeholder="快速查询" style="width:300px">
                    <template #append>
                        <span class="main-search-icon" @click="getTableList">
                            <el-icon>
                                <ElIconSearch />
                            </el-icon>
                        </span>
                    </template>
                </el-input>
                <el-button
                    text
                    class="ml-3"
                    title="列表页查看"
                    @click="goPath"
                    v-if="defaultShowType == 'table'"
                >
                    <SvgIcon icon-name="open" />
                </el-button>
                <div class="fr fr-box">
                    <el-dropdown
                        trigger="click"
                        @command="cardSortCommand"
                        :disabled="defaultShowType == 'table'"
                    >
                        <span class="el-dropdown-link">
                            {{ cardSortText }}
                            <el-icon class="el-icon--right">
                                <arrow-down />
                            </el-icon>
                        </span>
                        <template #dropdown>
                            <el-dropdown-menu>
                                <el-dropdown-item command="modifiedOnDesc">最近修改时间</el-dropdown-item>
                                <el-dropdown-item command="createdOnDesc">最近创建时间</el-dropdown-item>
                                <el-dropdown-item command="createdOnAsc">最早创建时间</el-dropdown-item>
                            </el-dropdown-menu>
                        </template>
                    </el-dropdown>
                    <el-button
                        text
                        title="卡片视图"
                        style="margin-left: 0;padding: 8px"
                        :class="{'is-active': defaultShowType == 'card'}"
                        @click="defaultShowType = 'card'"
                    >
                        <SvgIcon icon-name="separator-horizontal" />
                    </el-button>
                    <el-button
                        text
                        title="列表视图"
                        style="margin-left: 0;padding: 8px;"
                        :class="{'is-active': defaultShowType == 'table'}"
                        @click="viewTableChange"
                    >
                        <SvgIcon icon-name="grid_n" />
                    </el-button>
                    <el-button 
                        type="primary" 
                        icon="Plus" 
                        @click="onAdd"
                        v-if="$TOOL.checkRole('r' + entityCode + '-2')" 
                    >
                        新建
                    </el-button>
                </div>
            </div>
            <div class="min-table mt-10" v-if="defaultShowType == 'table'">
                <el-table
                    ref="elTables"
                    :data="tableData"
                    :border="true"
                    stripe
                    style="width: 100%"
                    :max-height="tableMaxHeight"
                    @sort-change="sortChange"
                    @row-dblclick="openDetailDialog"
                >
                    <el-table-column
                        v-for="(column,columnInx) of tableColumn"
                        :key="columnInx"
                        :prop="column.fieldName"
                        :label="column.columnAliasName ?column.columnAliasName : column.fieldLabel"
                        :width="setColumnWidth(column)"
                        sortable
                        show-overflow-tooltip
                    >
                        <template #default="scope">
                            <FormatRow
                                :row="scope.row"
                                :nameFieldName="nameFieldName"
                                :column="column"
                                @openDetailDialog="openDetailDialog"
                            />
                        </template>
                    </el-table-column>
                </el-table>
                <mlPagination
                    :no="page.no"
                    :size="page.size"
                    :total="page.total"
                    @pageChange="pageChange"
                    @handleSizeChange="handleSizeChange"
                    style="background: #fff;"
                    :bottom="false"
                />
            </div>
            <div class="min-table mt-20" v-else>
                <el-collapse 
                    v-model="cardActiveNames" 
                    v-if="tableData.length > 0"
                    @change="collapseChange"
                >
                    <el-collapse-item
                        v-for="(item,inx) of tableData"
                        :key="inx"
                        :name="item[idFieldName]"
                        :disabled="item.loading"
                    >
                        <template #title>
                            <div class="collapse-title">
                                <span class="title-span">{{ item[nameFieldName] }}</span>
                                <i class="header-icon el-icon-info"></i>
                            </div>
                        </template>
                        <CardLayout 
                            :layoutJson="layoutJson" 
                            :optionData="optionData"
                            :recordId="item[idFieldName]" 
                            :isLoadData="expandIdx.includes(item[idFieldName])"
                            @loading="(loadingStatus) => cardLayoutLoading(loadingStatus, item)"
                        />
                    </el-collapse-item>
                </el-collapse>
                <el-empty v-else :image-size="100" description="暂无数据" />
            </div>
        </div>
    </div>
    <Detail ref="detailRefs" @onConfirm="getTableList" />
</template>

<script setup>
import { onMounted, watch, inject, reactive, ref, nextTick, computed } from "vue";
import { getFormLayout } from "@/api/system-manager";
import { getDataList } from "@/api/crud";
import { useRouter } from "vue-router";
import FormatRow from "./FormatRow.vue";
import Detail from "../detail.vue";
import CardLayout from "./CardLayout.vue";
import routerParamsStore from "@/store/modules/routerParams";
const { setRouterParams } = routerParamsStore();
const router = useRouter();
const props = defineProps({
    cutTab: { type: String },
    entityId: { type: String, default: "" },
    idFieldName: { type: String, default: "" },
    tabs: { type: Object, default: () => {} },
    cutTabIndex: { type: String, default: "0" }
});
const emits = defineEmits(['closeDialog','addRow'])
const $API = inject("$API");

watch(
    () => props.cutTab,
    () => {
        initData();
    },
    { deep: true }
);
// 当前实体
let entityCode = ref("");
let entityName = ref("");
onMounted(() => {
    initData();
});

let loading = ref(false);
let layoutConfig = reactive({});
// 当前所有页签
let tabs = ref([]);
// 当前导航显示的列
let tableColumn = ref([]);
// 表格数据
let tableData = ref([]);
// card数据
let cardActiveNames = ref([]);
// 默认列宽度
let titleWidthForAll = reactive({});
// 自定义列宽度
let titleWidthForSelf = reactive({});
// 默认显示类型  table 表格  card 卡片
let defaultShowType = ref("table");
// 快速查询
let quickQueryVal = ref("");
// 默认显示列
let defaultColumnShow = ref("");
// 所有字段
let allFields = ref([]);
// 列排序
let sortFields = ref([]);
// 默认排序
let defaultSortFields = ref([
    {
        fieldName: "modifiedOn",
        type: "DESC",
    },
]);

let detailRefs = ref("");
// 详情Tab
let detailTab = reactive({});
// 实体ID
let idFieldName = ref("");
// 标蓝字段
let nameFieldName = ref("");
// 当前选中TabfieldName
let fieldName = ref("");

// 计算表格最大高度
const tableMaxHeight = computed(() => {
    // return document.querySelector('.detail-tab-container').clientHeight - 240;
    // console.log(document.querySelector('.detail-tab-container'))
    return 'calc(100vh - 230px)';
});

// 卡片视图排序
let cardSortText = ref("默认排序");
const cardSortCommand = (e) => {
    if (e == "modifiedOnDesc") {
        sortFields.value = [
            {
                fieldName: "modifiedOn",
                type: "DESC",
            },
        ];
        cardSortText.value = "最近修改时间";
    }
    if (e == "createdOnDesc") {
        sortFields.value = [
            {
                fieldName: "createdOn",
                type: "DESC",
            },
        ];
        cardSortText.value = "最近创建时间";
    }
    if (e == "createdOnAsc") {
        sortFields.value = [
            {
                fieldName: "createdOn",
                type: "ASC",
            },
        ];
        cardSortText.value = "最早创建时间";
    }
    getTableList();
};

let curtTab = ref({});


let dufaultFilter = ref(null);

// 初始化数据
const initData = async () => {
    tableData.value = [];
    let sourceTabs = props.tabs?.config ? JSON.parse(props.tabs.config) : [];
    // 2025-06-03 新加的动态显示事件
    if(sourceTabs.showEventCode) {
        tabs.value = sourceTabs.column;
    } else {
        tabs.value = sourceTabs;
    }
    defaultShowType.value = "table";
    let filterTabs = tabs.value[props.cutTabIndex - 1];
    if (filterTabs) {
        entityCode.value = filterTabs.entityCode;
        entityName.value = filterTabs.entityName;
        fieldName.value = filterTabs.fieldName;
        curtTab.value = filterTabs;
    }
    loading.value = true;
    let res = await $API.layoutConfig.getLayoutList(entityName.value, 'noModelName');
    if (res) {
        idFieldName.value = res.data.idFieldName;
        nameFieldName.value = res.data.nameFieldName;
        layoutConfig = res.data ? { ...res.data } : {};
        let { chosenListType, LIST } = layoutConfig;
        let { ALL, SELF } = LIST;
        titleWidthForAll = res.data.titleWidthForAll
            ? { ...JSON.parse(res.data.titleWidthForAll) }
            : {};
        titleWidthForSelf = res.data.titleWidthForSelf
            ? { ...JSON.parse(res.data.titleWidthForSelf) }
            : {};
        detailTab = res.data.TAB ? { ...res.data.TAB } : {};
        // let resList = Object.assign({}, res.data.LIST);
        SELF.FILTER = SELF.config ? JSON.parse(SELF.config) : [];
        ALL.FILTER = ALL.config ? JSON.parse(ALL.config) : [];
        // 如果存在默认配置，用默认配置
        if (res.data.chosenListType) {
            tableColumn.value = LIST[res.data.chosenListType].FILTER;
            defaultColumnShow.value = res.data.chosenListType;
        } else {
            tableColumn.value = ALL.FILTER;
            defaultColumnShow.value = "ALL";
        }
        dufaultFilter.value = null;
        // 如果存在默认过滤
        if (res.data.DEFAULT_FILTER) {
            let { config } = res.data.DEFAULT_FILTER;
            if(config){
                dufaultFilter.value = JSON.parse(config);
            }
        }
        // 如果存在列
        if (tableColumn.value.length > 0) {
            refreshData();
        }
    }else {
        loading.value = false;
    }
};
const appPath = import.meta.env.VITE_APP_PATH;
const goPath = () => {
    setRouterParams({
        path: appPath + entityName.value + "/list",
        filter: {
            equation: "AND",
            items: [
                {
                    fieldName: fieldName.value,
                    op: "EQ",
                    value: props.entityId,
                },
            ],
        },
        quickFilter: quickQueryVal.value,
    });
    nextTick(()=>{
        router.push({
            path: appPath + entityName.value + "/list",
        });
    })
    
    emits("closeDialog")
};

// 分页
let page = reactive({
    no: 1,
    size: 20,
    total: 0,
});

// 分页切换
const pageChange = (cutPage) => {
    page.no = cutPage;
    getTableList();
};
const handleSizeChange = (size) => {
    page.size = size;
    getTableList();
};


// 打开详情
const openDetailDialog = (row) => {
    if(!idFieldName.value){
        return
    }
    detailRefs.value.openDialog(row[idFieldName.value]);
};
// 列排序
const sortChange = (column) => {
    let columnSort = {};
    if (column.order == "ascending") {
        columnSort.type = "ASC";
        columnSort.fieldName = column.prop;
    } else if (column.order == "descending") {
        columnSort.type = "DESC";
        columnSort.fieldName = column.prop;
    } else {
        columnSort = { ...defaultSortFields[0] };
    }
    sortFields.value = [columnSort];
    getTableList();
};
// 设置列宽度
const setColumnWidth = (column) => {
    // console.log(defaultColumnShow.value)
    if (
        defaultColumnShow.value == "SELF" &&
        titleWidthForSelf[column.fieldName]
    ) {
        return titleWidthForSelf[column.fieldName];
    }
    if (
        defaultColumnShow.value == "ALL" &&
        titleWidthForAll[column.fieldName]
    ) {
        return titleWidthForAll[column.fieldName];
    }
    if (column.columnWidth && column.columnWidth > 0) {
        return column.columnWidth;
    }
    return "150";
};

// 刷新数据
const refreshData = () => {
    // 获取所有列字段
    allFields.value = tableColumn.value.map((el) => el.fieldName);
    // 获取所有列排序
    let findSortFields = tableColumn.value.filter((el) => el.columnSort);
    // 如果有排序
    if (findSortFields.length > 0) {
        sortFields.value = [
            {
                fieldName: findSortFields[0].fieldName,
                type: findSortFields[0].columnSort,
            },
        ];
        // 默认排序赋值为设置的排序
        defaultSortFields.value = [...sortFields.value];
    }
    // 如果没有，拿默认排序
    else {
        defaultSortFields.value = [
            {
                fieldName: "modifiedOn",
                type: "DESC",
            },
        ];
        sortFields.value = [...defaultSortFields.value];
    }
    getTableList();
};


let layoutJson = ref(null);
let optionData = ref({});
const getTableList = async () => {
    loading.value = true;
    let filter = null;
    let filterEasySql = null;
    // 是自定义标签
    if(curtTab.value.isCustomLabel) {
        const regex = new RegExp(`{${props.idFieldName}}`, 'g');
        filterEasySql = curtTab.value.filterEasySql.replace(regex,`'${props.entityId}'`);
        filter = {...dufaultFilter.value};
    }else {
        filter = {
            equation: "AND",
            items: [
                {
                    fieldName: fieldName.value,
                    op: "EQ",
                    value: props.entityId,
                },
            ],
        };
    }
    // let 
    // curtTab.value
    let param = {
        mainEntity: entityName.value,
        fieldsList: allFields.value.join(),
        pageSize: page.size,
        pageNo: page.no,
        sortFields: sortFields.value,
        quickFilter: quickQueryVal.value,
    };
    let res = await getDataList(
        param.mainEntity,
        param.fieldsList,
        filter,
        param.pageSize,
        param.pageNo,
        param.sortFields,
        param.advFilter,
        param.quickFilter,
        null,
        null,
        filterEasySql
    );
    if (res && res.data) {
        tableData.value = res.data.dataList;
        tableData.value.forEach( el => {
            el.loading = false;
        })
        // cardActiveNames.value = tableData.value.map(
        //     (el) => el[idFieldName.value]
        // );
        page.total = res.data.pagination.total;
        loading.value = true;
        let formLayoutRes = await getFormLayout(entityName.value);
        if (formLayoutRes) {
            layoutJson.value = formLayoutRes.data?.layoutJson || null;
            optionData.value = formLayoutRes.data?.optionData || {};
            if(formLayoutRes.data.codeOptionData) {
                optionData.value = Object.assign(optionData.value, formLayoutRes.data.codeOptionData);
            }
        }
        loading.value = false;
    } else {
        loading.value = false;
    }
};

/**
 * 折叠面板
 */

let expandIdx = ref([]);
const collapseChange = (arr) => {
    expandIdx.value = arr;
}
const cardLayoutLoading = (loadingStatus, item) => {
    item.loading = loadingStatus;
}

const viewTableChange = () => {
    defaultShowType.value = 'table';
    cardActiveNames.value = [];
}

const onAdd = () => {
    emits("addRow", {
        entityName: entityName.value,
        fieldName: fieldName.value
    });
}


defineExpose({
    initData,
});
</script>
<style lang='scss' scoped>

.main-header {
    height: 32px;
    line-height: 32px;
    .main-search-icon {
        // cursor: pointer;
        position: absolute;
        display: flex;
        align-items: center;
        align-content: center;
        width: 100%;
        height: 100%;
        cursor: pointer;
        top: 0;
        left: 0;
        .el-icon {
            width: 100%;
        }
    }
    .is-active {
        color: var(--el-color-primary);
    }
    .el-dropdown-link {
        display: inline-block;
        height: 32px;
        line-height: 32px;
        margin-right: 5px;
    }
    .el-dropdown {
        cursor: pointer;
    }
}

:deep(.el-collapse-item__header) {
    background: #eeeeee;
    height: 38px;
    line-height: 38px;
    border-bottom: 2px solid #fff;
}
:deep(.el-collapse-item__content) {
    padding-bottom: 0;
}

.collapse-title {
    width: 100%;

    .title-span {
        color: var(--el-color-primary);
        margin-left: 20px;
    }
}
</style>