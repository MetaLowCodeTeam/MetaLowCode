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
                        @click="defaultShowType = 'table'"
                    >
                        <SvgIcon icon-name="grid_n" />
                    </el-button>
                </div>
            </div>
            <div class="min-table mt-20" v-if="defaultShowType == 'table'">
                <el-table
                    ref="elTables"
                    :data="tableData"
                    :border="true"
                    stripe
                    style="width: 100%"
                    max-height="400px"
                    @sort-change="sortChange"
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
                                :nameFiledName="nameFiledName"
                                :column="column"
                                @openDetilDialog="openDetilDialog"
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
                <el-collapse v-model="cardActiveNames" v-if="tableData.length > 0">
                    <el-collapse-item
                        v-for="(item,inx) of tableData"
                        :key="inx"
                        :name="item[idFiledName]"
                    >
                        <template #title>
                            <div class="collapse-title">
                                <span class="title-span">{{ item[nameFiledName] }}</span>
                                <i class="header-icon el-icon-info"></i>
                            </div>
                        </template>
                        <CardLayout :layoutJson="layoutJson" :data="item" />
                    </el-collapse-item>
                </el-collapse>
                <el-empty v-else :image-size="100" description="暂无数据" />
            </div>
        </div>
    </div>
    <Detail ref="detailRefs" @onConfirm="getTableList" />
</template>

<script setup>
import { onMounted, watch, inject, reactive, ref } from "vue";
import { getFormLayout } from "@/api/system-manager";
import { getDataList } from "@/api/crud";
import { useRouter } from "vue-router";
import FormatRow from "./FormatRow.vue";
import Detail from "../detail.vue";
import CardLayout from "./CardLayout.vue";
const router = useRouter();
const props = defineProps({
    cutTab: { type: String },
    entityId: { type: String, default: "" },
    tabs: { type: Object, default: () => {} },
});
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
let idFiledName = ref("");
// 标蓝字段
let nameFiledName = ref("");
// 当前选中TabfieldName
let fieldName = ref("");

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

// 初始化数据
const initData = async () => {
    tabs.value = props.tabs?.config ? JSON.parse(props.tabs.config) : [];
    defaultShowType.value = "table";
    let filterTabs = tabs.value.filter((el) => el.entityName == props.cutTab);
    if (filterTabs[0]) {
        entityCode.value = filterTabs[0].entityCode;
        entityName.value = filterTabs[0].entityName;
        fieldName.value = filterTabs[0].fieldName;
    }
    // console.log(tabs);
    loading.value = true;
    let res = await $API.layoutConfig.getLayoutList(props.cutTab);
    if (res) {
        idFiledName.value = res.data.idFiledName;
        nameFiledName.value = res.data.nameFiledName;
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
        // 如果自定义配置不存在，用ALL配置
        if (SELF.FILTER.length < 1) {
            tableColumn.value = ALL.FILTER;
            defaultColumnShow.value = "ALL";
        } else {
            tableColumn.value = SELF.FILTER;
            defaultColumnShow.value = "SELF";
        }
        // 如果存在默认配置，用默认配置
        if (chosenListType == "ALL") {
            tableColumn.value = ALL.FILTER;
            defaultColumnShow.value = "ALL";
        }
        if (chosenListType == "SELF") {
            tableColumn.value = SELF.FILTER;
            defaultColumnShow.value = "SELF";
        }
        // 如果存在列
        if (tableColumn.value.length > 0) {
            refreshData();
        }
    }
    loading.value = false;
};

const goPath = () => {
    router.push("/web/" + props.cutTab + "/list");
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
const openDetilDialog = (row) => {
    let detailData = { ...row };
    detailData.entityName = entityName.value;
    detailData.entityCode = entityCode.value;
    detailData.tab = { ...detailTab };
    detailData.detailId = row[idFiledName.value];
    detailData.detailTitle = row[nameFiledName.value];
    detailData.idFiledName = idFiledName.value;
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
const getTableList = async () => {
    loading.value = true;

    let param = {
        mainEntity: entityName.value,
        fieldsList: allFields.value.join(),
        pageSize: page.size,
        pageNo: page.no,
        // entityId
        filter: {
            equation: "AND",
            items: [
                {
                    fieldName: fieldName.value,
                    op:"EQ",
                    value:props.entityId
                },
            ],
        },
        // advFilter: { ...comQueriesList },
        sortFields: sortFields.value,
        quickFilter: quickQueryVal.value,
    };
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
    if (res && res.data) {
        tableData.value = res.data.dataList;
        cardActiveNames.value = tableData.value.map(
            (el) => el[idFiledName.value]
        );
        page.total = res.data.pagination.total;
        loading.value = true;
        let formLayoutRes = await getFormLayout(entityName.value);
        if (formLayoutRes) {
            layoutJson.value = formLayoutRes.data?.layoutJson || null;
        }
        loading.value = false;
    } else {
        loading.value = false;
    }
};
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