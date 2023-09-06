<template>
    <div class="customize-menu-list" v-loading="pageLoading">
        <div class="table-box">
            <div class="table-search-box">
                <mlListAdvancedQuery v-model="advancedQuery.value" />
                <div class="fr table-setting">
                    <el-popover placement="bottom" trigger="click" :popper-style="{'padding':0}">
                        <div class="table-setting-item-box">
                            <div class="pl-5 item div-disabled">列显示</div>
                            <div
                                class="pl-20 item"
                                :class="{'is-active':defaultColumnShow == 'SELF'}"
                                @click="changeColumnShow('SELF')"
                            >
                                自定义列显示
                                <div class="action-icon">
                                    <span
                                        class="icon-span edit-icon"
                                        @click.stop="editColumn('SELF')"
                                    >
                                        <el-icon>
                                            <ElIconEditPen />
                                        </el-icon>
                                    </span>
                                </div>
                            </div>
                            <div
                                class="pl-20 item"
                                :class="{'is-active':defaultColumnShow == 'ALL'}"
                                @click="changeColumnShow('ALL')"
                            >
                                默认列显示
                                <div class="action-icon">
                                    <span
                                        class="icon-span edit-icon"
                                        @click.stop="editColumn('ALL')"
                                    >
                                        <el-icon>
                                            <ElIconEditPen />
                                        </el-icon>
                                    </span>
                                </div>
                            </div>
                        </div>
                        <template #reference>
                            <span class="el-dropdown-link">
                                <el-icon size="20px">
                                    <ElIconSetting />
                                </el-icon>
                            </span>
                        </template>
                    </el-popover>
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
                    :data="tableData"
                    :border="true"
                    stripe
                    style="width: 100%"
                    @selection-change="handleSelectionChange"
                    :height="setTableHeight()"
                    @sort-change="sortChange"
                    @header-dragend="headerDragend"
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
                            <FormatRow :row="scope.row" :column="column" />
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
        <SetColumn
            v-model="editColumnDialog.isShow"
            v-if="editColumnDialog.isShow"
            :editColumnDialog="editColumnDialog"
            @confirm="getLayoutList"
        />
    </div>
</template>

<script setup>
import { ref, onBeforeMount, inject, reactive } from "vue";
import { useRouter } from "vue-router";
import { getDataList } from "@/api/crud";
import mlListAdvancedQuery from "@/components/mlListAdvancedQuery/index.vue";
import SetColumn from "./components/SetColumn.vue";
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
// 高级查询配置
let advancedQuery = reactive({
    value: "all",
});
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
// 默认列宽度
let titleWidthForAll = reactive({});
// 自定义列宽度
let titleWidthForSelf = reactive({});
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
    if (res && res.code == 200) {
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
            // 获取所有列字段
            allFields.value = tableColumn.value.map((el) => el.fieldName);
            // 获取所有列排序
            let findSortFields = tableColumn.value.filter(
                (el) => el.columnSort
            );
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
        }
    } else {
        $ElMessage.error("获取配置失败：" + res.error);
    }
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
        $API.layoutConfig.useNavChang(
            JSON.stringify(titleWidthForAll),
            "LIST:" + entityName.value + ":ALL"
        );
    } else {
        titleWidthForSelf[column.property] = newWidth;
        $API.layoutConfig.useNavChang(
            JSON.stringify(titleWidthForSelf),
            "LIST:" + entityName.value + ":SELF"
        );
    }
};

const getTableList = async () => {
    pageLoading.value = true;
    let param = {
        mainEntity: entityName.value,
        fieldsList: allFields.value.join(),
        pageSize: page.size,
        pageNo: page.no,
        filter: {
            equation: "AND",
            items: [],
        },
        sortFields: sortFields.value,
    };
    let res = await getDataList(
        param.mainEntity,
        param.fieldsList,
        param.filter,
        param.pageSize,
        param.pageNo,
        param.sortFields
    );
    if (res.code === 200) {
        tableData.value = res.data.dataList;
        page.total = res.data.pagination.total;
        pageLoading.value = false;
    } else {
        pageLoading.value = false;
        $ElMessage.error("获取表格数据失败：" + res.error);
    }
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
    $API.layoutConfig.useNavChang(type, "LIST:" + entityName.value);
};

// 编辑列弹框是否显示
let editColumnDialog = reactive({
    isShow: false,
});
// let ColumnDialog
// 编辑列显示
const editColumn = (type) => {
    editColumnDialog.isShow = true;
    editColumnDialog.chosenListType = type;
    editColumnDialog = Object.assign(
        editColumnDialog,
        layoutConfig.value[type]
    );
};

/**
 *
 */
</script>
<style lang='scss' scoped>
.customize-menu-list {
    padding: 20px;
    position: relative;
    height: 100%;
    box-sizing: border-box;
    // background: #fff;
    .table-box {
        border-top: 3px solid #409eff;
        // padding: 20px 0;
        .table-search-box {
            background: #fff;
            height: 60px;
            line-height: 60px;
            padding: 0 20px;
            
            .table-setting {
                margin-top: 5px;
                .el-dropdown-link {
                    cursor: pointer;
                }
            }
        }
    }
}
.table-setting-item-box {
    padding: 10px 0;
    .item {
        height: 26px;
        line-height: 26px;
        cursor: pointer;
        position: relative;
        &.is-active {
            color: #409eff;
        }
        .action-icon {
            position: absolute;
            right: 10px;
            top: 4px;
            display: none;
            .icon-span {
                cursor: pointer;
                display: inline-block;
                color: #a1a1a1;
                &:hover {
                    color: #666;
                }
                &.edit-icon {
                    position: relative;
                    top: -2px;
                }
            }
        }
        &:hover {
            background: #dedede;
            .action-icon {
                display: block;
            }
        }
        &.div-disabled {
            background: #fff;
            cursor: default;
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
        color: #409eff;
    }
}
</style>