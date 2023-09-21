<template>
    <div class="customize-menu-list" v-loading="pageLoading">
        <div class="table-box">
            <div class="table-search-box">
                <mlListAdvancedQuery
                    v-model="advFilter"
                    :entityName="entityName"
                    :entityCode="entityCode"
                    @queryNow="queryNow"
                    @refresh="refresh"
                    @onAddAdv="getLayoutList"
                    @changeAdvFilter="changeAdvFilter"
                    :filter="advancedFilter"
                />
                <div class="quick-query">
                    <el-input
                        v-model="quickQuery"
                        class="w-50 m-2"
                        :placeholder="quickQueryPlaceholder"
                        @keyup.enter="getTableList"
                        clearable
                        @clear="getTableList"
                    >
                        <template #append>
                            <el-button @click="getTableList">
                                <el-icon>
                                    <ElIconSearch />
                                </el-icon>
                            </el-button>
                        </template>
                    </el-input>
                </div>
                <div class="fr table-setting">
                    <el-button class="mr-15">按钮占用</el-button>
                    <More
                        :layoutConfig="layoutConfig"
                        :defaultColumnShow="defaultColumnShow"
                        :tableColumn="tableColumn"
                        :multipleSelection="multipleSelection"
                        :dataExportData="dataExportData"
                        @changeColumnShow="changeColumnShow"
                        @editColumnConfirm="getLayoutList"
                        :idFiledName="idFiledName"
                    />
                </div>
            </div>
            <!-- 如果是默认列显示，但是默认列没有值 -->
            <div v-if="defaultColumnShow == 'ALL' && tableColumn.length < 1" class="not-column-div">
                <!-- 判断自定义列是否有值 -->
                <div v-if="layoutConfig.SELF.FILTER && layoutConfig.SELF.FILTER?.length > 0 ">
                    默认列显示未配置,
                    <span class="lh-span-a" @click="changeColumnShow('SELF')">使用自定义列显示</span>
                </div>
                <div v-else>
                    默认列显示未配置，
                    <span class="lh-span-a" @click="editColumn('SELF')">配置自定义列显示</span>
                </div>
            </div>
            <!-- 如果是自定义列显示，但是默认列没有值 -->
            <div
                v-else-if="defaultColumnShow == 'SELF' && tableColumn.length < 1"
                class="not-column-div"
            >
                <!-- 判断默认列是否有值 -->
                <div v-if="layoutConfig.ALL.FILTER && layoutConfig.ALL.FILTER?.length > 0 ">
                    自定义列显示未配置,
                    <span class="lh-span-a" @click="editColumn('SELF')">前去配置</span>
                    或
                    <span
                        class="lh-span-a"
                        @click="changeColumnShow('ALL')"
                    >使用默认配置</span>
                </div>
                <div v-else>
                    自定义列显示未配置,
                    <span class="lh-span-a" @click="editColumn('SELF')">前去配置</span>
                </div>
            </div>
            <div v-else>
                <el-table
                    ref="elTables"
                    :data="tableData"
                    :border="true"
                    stripe
                    style="width: 100%"
                    @selection-change="handleSelectionChange"
                    :height="setTableHeight()"
                    @sort-change="sortChange"
                    @header-dragend="headerDragend"
                    @row-click="handleHighlightChangeTable"
                >
                    <el-table-column type="selection" width="50" :align="'center'" />
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
                                :column="column"
                                @openDetilDialog="openDetilDialog"
                            />
                        </template>
                    </el-table-column>
                </el-table>
            </div>
        </div>
        <mlPagination
            :no="page.no"
            :size="page.size"
            :total="page.total"
            @pageChange="pageChange"
            @handleSizeChange="handleSizeChange"
            style="background: #fff;"
        />
        <Detail ref="detailRefs" />
    </div>
</template>

<script setup>
import { ref, onBeforeMount, inject, reactive } from "vue";
import { useRouter } from "vue-router";
import { getDataList } from "@/api/crud";
import mlListAdvancedQuery from "@/components/mlListAdvancedQuery/index.vue";
import More from "./components/More.vue";
import Detail from "./detail.vue";
import FormatRow from "./components/FormatRow.vue";

const router = useRouter();
const $ElMessage = inject("$ElMessage");
const $API = inject("$API");
// 页面Loading
let pageLoading = ref(false);
// 当前实体
let entityCode = ref("");
let entityName = ref("");
// 表格列
let tableColumn = ref([]);
// 所有字段
let allFields = ref([]);
// 表格数据
let tableData = ref([]);

// 表格多选数据
let multipleSelection = ref([]);
// 分页
let page = reactive({
    no: 1,
    size: 20,
    total: 0,
});
// 自定义配置数据
let layoutConfig = ref({});
// 默认列显示
let defaultColumnShow = ref("");
// 列排序
let sortFields = ref([]);
// 默认排序
let defaultSortFields = ref([
    {
        fieldName: "modifiedOn",
        type: "DESC",
    },
]);
// 表格查询过滤
let queryFilter = reactive({
    equation: "AND",
    items: [],
});
// 高级查询过滤
let advancedFilter = ref([]);
let advFilter = ref("all");
let comQueriesList = reactive({});
// 默认列宽度
let titleWidthForAll = reactive({});
// 自定义列宽度
let titleWidthForSelf = reactive({});

// 快捷查询
let quickQuery = ref("");
let quickQueryPlaceholder = ref("");

// 详情Tab
let detailTab = reactive({});
// 实体ID
let idFiledName = ref("");

onBeforeMount(() => {
    entityCode.value = router.currentRoute.value.meta.entityCode;
    entityName.value = router.currentRoute.value.meta.entityName;
    // getTableColumn();
    // 获取导航配置
    getLayoutList();
});

// 获取导航配置
const getLayoutList = async () => {
    let res = await $API.layoutConfig.getLayoutList(entityName.value);
    if (res) {
        idFiledName.value = res.data.idFiledName;
        advFilter.value = res.data.advFilter || "all";
        advancedFilter.value = res.data.FILTER;
        quickQueryPlaceholder.value = res.data.quickFilterLabel;
        detailTab = res.data.TAB ? { ...res.data.TAB } : {};
        let { ALL, SELF } = res.data.LIST;
        titleWidthForAll = res.data.titleWidthForAll
            ? { ...JSON.parse(res.data.titleWidthForAll) }
            : {};
        titleWidthForSelf = res.data.titleWidthForSelf
            ? { ...JSON.parse(res.data.titleWidthForSelf) }
            : {};
        // let resList = Object.assign({}, res.data.LIST);
        SELF.FILTER = SELF.config ? JSON.parse(SELF.config) : [];
        ALL.FILTER = ALL.config ? JSON.parse(ALL.config) : [];
        layoutConfig.value = {
            SELF,
            ALL,
        };
        // 如果自定义配置不存在，用ALL配置
        if (SELF.FILTER.length < 1) {
            tableColumn.value = ALL.FILTER;
            defaultColumnShow.value = "ALL";
        } else {
            tableColumn.value = SELF.FILTER;
            defaultColumnShow.value = "SELF";
        }
        // 如果存在默认配置，用默认配置
        if (res.data.chosenListType) {
            tableColumn.value =
                layoutConfig.value[res.data.chosenListType].FILTER;
            defaultColumnShow.value = res.data.chosenListType;
        }
        // 如果存在列
        if (tableColumn.value.length > 0) {
            refreshData();
        }
    }
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
    // 如果有高级查询
    if (advFilter.value != "all") {
        let filterAdvancedFilter = advancedFilter.value.filter(
            (el) => el.layoutConfigId == advFilter.value
        );
        let config = JSON.parse(filterAdvancedFilter[0].config);
        comQueriesList = { ...config };
    }
    getTableList();
};

// 分页切换
const pageChange = (cutPage) => {
    page.no = cutPage;
    getTableList();
};
const handleSizeChange = (size) => {
    page.size = size;
    getTableList();
};

// 表格多选
const handleSelectionChange = (val) => {
    multipleSelection.value = val;
};
let elTables = ref("");
// 表格行点击选中
const handleHighlightChangeTable = (row, column) => {
    if (!row.disabled) {
        elTables.value.toggleRowSelection(row);
    }
};
let detailRefs = ref("");
// 打开详情
const openDetilDialog = (row) => {
    let detailData = { ...row };
    detailData.entityName = entityName.value;
    detailData.entityCode = entityCode.value;
    detailData.tab = { ...detailTab };
    detailData.detailId = row[idFiledName.value];
    detailRefs.value.openDialog(detailData);
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

// 列宽改变
const headerDragend = (newWidth, oldWidth, column) => {
    if (defaultColumnShow.value == "ALL") {
        titleWidthForAll[column.property] = newWidth;
        $API.layoutConfig.saveUserLayoutCache(
            "LIST:" + entityName.value + ":ALL",
            JSON.stringify(titleWidthForAll)
        );
    } else {
        titleWidthForSelf[column.property] = newWidth;
        $API.layoutConfig.saveUserLayoutCache(
            "LIST:" + entityName.value + ":ALL",
            JSON.stringify(titleWidthForAll)
        );
    }
};

// 常用查询切换
const changeAdvFilter = (e) => {
    comQueriesList = { ...e };
    getTableList();
};

// 立即查询
const queryNow = (e) => {
    queryFilter = { ...e };
    getTableList();
};

// 重置
const refresh = () => {
    queryFilter = { equation: "AND", items: [] };
    getTableList();
};

// 导入到出数据
let dataExportData = reactive({
    queryParm: {},
    total: 0,
});

const getTableList = async () => {
    pageLoading.value = true;
    let param = {
        mainEntity: entityName.value,
        fieldsList: allFields.value.join(),
        pageSize: page.size,
        pageNo: page.no,
        filter: { ...queryFilter },
        advFilter: { ...comQueriesList },
        sortFields: sortFields.value,
        quickFilter: quickQuery.value,
    };
    dataExportData.queryParm = { ...param };
    let res = await getDataList(
        param.mainEntity,
        param.fieldsList,
        param.filter,
        param.pageSize,
        param.pageNo,
        param.sortFields,
        param.advFilter,
        param.quickFilter
    );
    if (res) {
        tableData.value = res.data.dataList;
        page.total = res.data.pagination.total;
        dataExportData.size = res.data.dataList.length;
        dataExportData.total = res.data.pagination.total;
    }
    pageLoading.value = false;
};

// 设置表格高度
const setTableHeight = () => {
    let mainEl = document.querySelector(".customize-menu-list");
    let tableEl = document.querySelector(".el-table__body-wrapper");
    let offsetTop = 0;
    if (mainEl) {
        offsetTop += mainEl.offsetTop;
    }
    if (tableEl) {
        offsetTop += tableEl.offsetTop;
    }
    offsetTop += 85;
    let calcPx = offsetTop + "px";
    return `calc(100vh - ${calcPx})`;
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

/**
 *
 */

//  切换列显示
const changeColumnShow = (type) => {
    defaultColumnShow.value = type;
    tableColumn.value = layoutConfig.value[type].FILTER;
    if (tableColumn.value.length > 0) {
        refreshData();
    }
    $API.layoutConfig.saveUserLayoutCache("LIST:" + entityName.value, type);
};

/**
 *
 */
</script>
<style lang='scss' scoped>
div {
    box-sizing: border-box;
}
.icon-t1 {
    position: relative;
    top: 1px;
}
.customize-menu-list {
    padding: 20px;
    position: relative;
    height: 100%;
    box-sizing: border-box;

    .table-box {
        border-top: 3px solid var(--el-color-primary);
        // padding: 20px 0;
        .table-search-box {
            background: #fff;
            height: 60px;
            line-height: 60px;
            padding: 0 20px;

            .table-setting {
                // margin-top: 5px;
                .el-dropdown-link {
                    display: inline-block;
                    width: 20px;
                    height: 20px;
                    cursor: pointer;
                    position: relative;
                    top: 6px;
                }
            }
        }
    }
}

.not-column-div {
    font-size: 24px;
    text-align: center;
    color: #999;
    margin-top: 100px;
    .lh-span-a {
        cursor: pointer;
        color: var(--el-color-primary);
    }
}
.el-table {
    font-size: 13px !important;
}

.quick-query {
    display: inline-block;
    margin-left: 15px;
    width: 270px;
    .quick-query-icon {
        cursor: pointer;
    }
}
</style>