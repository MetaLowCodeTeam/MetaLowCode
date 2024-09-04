<template>
    <div class="customize-menu-list" v-loading="pageLoading">
        <div class="table-box">
            <div 
                class="table-search-box"
                v-if="listParamConf.showHeader"
            >
                <slot name="beforeAdvancedQuery"></slot>
                <mlListAdvancedQuery
                    v-if="entityCode && listParamConf.showAdvancedQuery"
                    v-model="advFilter"
                    :entityName="entityName"
                    :entityCode="entityCode"
                    @queryNow="queryNow"
                    @refresh="refreshAdvancedQuery"
                    @onAddAdv="getLayoutList"
                    @changeAdvFilter="changeAdvFilter"
                    :filter="advancedFilter"
                    :modelName="modelName"
                    class="mr-15"
                />
                <slot name="beforeQuickQuery"></slot>
                <div class="quick-query" v-if="listParamConf.showQuickQuery">
                    <el-input
                        v-model="quickQuery"
                        class="w-50 m-2"
                        :placeholder="quickQueryPlaceholder"
                        @keyup.enter="onQuickQuery()"
                        clearable
                        @clear="onClearQuickQuery()"
                    >
                        <template #append>
                            <el-button @click="onQuickQuery()">
                                <el-icon>
                                    <ElIconSearch />
                                </el-icon>
                            </el-button>
                        </template>
                    </el-input>
                    <span
                        class="queick-edit"
                        @click="openSelectFieldDialog"
                        v-if="$TOOL.checkRole('r6008')"
                    >
                        <el-icon size="18">
                            <ElIconEditPen />
                        </el-icon>
                    </span>
                </div>
                <slot name="afterQuickQuery"></slot>
                <div class="data-filter" v-if="isDataFilter">
                    <el-tag type="success" closable @close="clearDataFilter">当前数据已过滤</el-tag>
                </div>
                <div class="fr table-setting">
                    <slot name="beforeOpenBtn"></slot>
                    <el-button
                        icon="Notification"
                        :disabled="multipleSelection.length != 1"
                        @click="openDetailDialog(multipleSelection[0])"
                        v-if="listParamConf.showOpenBtn && !mainDetailField"
                    >
                        打开
                    </el-button>
                    <slot name="beforeEditBtn"></slot>
                    <el-button
                        icon="Edit"
                        :disabled="multipleSelection.length != 1"
                        @click="onEditRow(multipleSelection[0])"
                        v-if="listParamConf.showEditBtn && !isReferenceComp"
                    >
                        编辑
                    </el-button>
                    <el-button
                        icon="Edit"
                        v-if="batchUpdateConf.length > 0 && listParamConf.showBatchUpdateBtn"
                        :disabled="multipleSelection.length < 1"
                        @click="openBatchUpdateDialog"
                    >
                        批量编辑
                    </el-button>
                    <slot name="beforeAddBtn"></slot>
                    <el-button 
                        type="primary" 
                        icon="Plus" 
                        @click="onAdd"
                        v-if="listParamConf.showAddBtn"
                    >
                        新建
                    </el-button>
                    <slot name="beforeMoreBtn"></slot>
                    <More
                        :listParamConf="listParamConf"
                        ref="MoreRefs"
                        :layoutConfig="layoutConfig"
                        :defaultColumnShow="defaultColumnShow"
                        :tableColumn="tableColumn"
                        :multipleSelection="multipleSelection"
                        :dataExportData="dataExportData"
                        @changeColumnShow="changeColumnShow"
                        @editColumnConfirm="getLayoutList"
                        :idFieldName="idFieldName"
                        :entityCode="entityCode"
                        @defaultFilterChange="getLayoutList"
                        @treeGroupFilterConfirm="getLayoutList"
                        :defaultFilterSetting="defaultFilterSetting"
                        :isReferenceComp="isReferenceComp"
                        :isMainDetailField="!!mainDetailField"
                        :modelName="modelName"
                        @copySuccess="copySuccess"
                    />
                    <slot name="afterMoreBtn"></slot>
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
            <div v-else class="table-div" :class="{'showPagination':listParamConf.showPagination}">
                <!-- 分组 -->
                <div class="tree-froup-box" v-if="treeGroupConf.isOpen">
                    <el-tooltip class="box-item" effect="dark" content="刷新" placement="bottom">
                        <span class="tree-refresh" @click="treeRefresh">
                            <el-icon>
                                <ElIconRefresh />
                            </el-icon>
                        </span>
                    </el-tooltip>
                    <el-tooltip class="box-item" effect="dark" content="保存" placement="bottom">
                        <span class="tree-refresh tree-save" @click="treeSave">
                            <el-icon>
                                <ElIconWallet />
                            </el-icon>
                        </span>
                    </el-tooltip>
                    <el-scrollbar>
                        <ListcommonGroupFilter
                            ref="ListcommonGroupFilterRefs"
                            :entityCode="entityCode"
                            :layoutConfig="layoutConfig"
                            @nodeClick="commonGroupFilterNodeClick"
                            @onRefresh="treeRefresh"
                        />
                        <ListTreeGroupFilter
                            ref="ListTreeGroupFilterRefs"
                            :treeGroupConf="treeGroupConf"
                            :entityName="entityName"
                            @check="treeGroupFilter"
                        />
                    </el-scrollbar>
                </div>
                <!-- 表格 -->
                <el-table
                    ref="TableRef"
                    :data="sliceTable"
                    :border="true"
                    stripe
                    style="width: 100%"
                    :height="setTableHeight()"
                    @sort-change="sortChange"
                    @header-dragend="headerDragend"
                    @row-click="handleHighlightChangeTable"
                    @row-dblclick="rowDblclick"
                    :show-summary="statisticsList.length > 0"
                    :summary-method="getSummaries"
                    :row-style="setRowStyle"
                    class="table-box-el-table"
                >
                    <el-table-column
                        :width="statisticsList.length > 0 ? 60 : 50"
                        :align="'center'"
                        :fixed="checkedColumnFixed"
                    >
                        <template #header>
                            <el-checkbox 
                                checked 
                                v-if="selectedAllStatus == 1"
                                @click="selectAllChange('clear')"
                            />
                            <el-checkbox 
                                indeterminate 
                                v-else-if="selectedAllStatus == 2"
                                @click="selectAllChange('all')"
                            />
                            <el-checkbox v-else @click="selectAllChange('all')"/>
                        </template>
                        <template #default="scope">
                            <el-checkbox v-model="scope.row.isSelected" @change="handleHighlightChangeTable(scope.row)"/>
                        </template>
                    </el-table-column>
                    <el-table-column
                        v-for="(column,columnInx) of tableColumn"
                        :key="columnInx"
                        :prop="column.fieldName"
                        :label="column.columnAliasName ? column.columnAliasName : column.fieldLabel"
                        :width="setColumnWidth(column)"
                        sortable
                        show-overflow-tooltip
                        :fixed="column.fixed"
                    >
                        <template #default="scope">
                            <FormatRow
                                :row="scope.row"
                                :column="column"
                                :nameFieldName="nameFieldName"
                                @openDetailDialog="openDetailDialog"
                            />
                        </template>
                    </el-table-column>
                    <slot name="actionColumn" v-if="showActionColumnSlot && listParamConf.showOperateColumn"></slot>
                    <el-table-column 
                        v-if="!showActionColumnSlot && listParamConf.showOperateColumn"
                        label="操作" 
                        fixed="right" 
                        :align="'center'" 
                        width="120"
                    >
                        <template #default="scope">
                            <el-tooltip
                                class="box-item"
                                effect="dark"
                                :content="getEditBtnTitle(scope.row) || '此状态不可编辑'"
                                placement="top"
                                v-if="scope.row.approvalStatus && (scope.row.approvalStatus.value == 3 || scope.row.approvalStatus.value == 1) || referenceCompStatus == 'read'"
                            >
                                <el-button
                                    size="small"
                                    icon="el-icon-edit"
                                    link
                                    type="primary"
                                    disabled
                                >编辑</el-button>
                            </el-tooltip>
                            <el-button
                                v-else
                                size="small"
                                icon="el-icon-edit"
                                link
                                type="primary"
                                @click.stop="onEditRow(scope.row)"
                            >编辑</el-button>

                            <el-button
                                size="small"
                                link
                                type="primary"
                                @click.stop="openDetailDialog(scope.row)"
                            >查看</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
        </div>
        <mlPagination
            :no="page.no"
            :size="page.size"
            :total="page.total"
            :pageSizes="page.pageSizes"
            @pageChange="pageChange"
            @handleSizeChange="handleSizeChange"
            style="background: #fff;"
            v-if="listParamConf.showPagination"
        />
        <mlCustomDetail ref="detailRefs" :entityName="entityName" @updateData="getTableList"/>
        <mlCustomEdit 
            ref="editRefs"
            :entityName="entityName"
            :nameFieldName="nameFieldName"
            :layoutConfig="layoutConfig"
            @saveFinishCallBack="editConfirm"
        />
        <!-- 快速搜索字段 -->
        <mlSelectField
            ref="SelectFieldDialog"
            v-model="quickQueryConf.value"
            title="选择快速搜索字段"
            isQuickQuery
            :quickQueryConf="quickQueryConf"
            @onConfirm="getLayoutList"
            :entityName="entityName"
            :nameFieldName="nameFieldName"
            :modelName="modelName"
        />
        <!-- 批量编辑 -->
        <ListBatchUpdate ref="ListBatchUpdateRef" @onConfirm="getTableList" />
    </div>
</template>

<script setup>
defineOptions({
    name: "default-list",
});
import { 
    ref, 
    onBeforeMount, 
    inject, 
    reactive, 
    onMounted, 
    onUnmounted,
    onActivated,
    watchEffect,
    useSlots,
    computed,
    watch,
} from "vue";
import { useRouter } from "vue-router";
import { getDataList } from "@/api/crud";
import mlListAdvancedQuery from "@/components/mlListAdvancedQuery/index.vue";
import More from "./components/More/Index.vue";
// import Detail from "./detail.vue";
// import Edit from "./edit.vue";
import mlCustomDetail from '@/components/mlCustomDetail/index.vue';
import mlCustomEdit from '@/components/mlCustomEdit/index.vue';



import FormatRow from "./components/FormatRow.vue";
import mlSelectField from "@/components/mlSelectField/index.vue";
import routerParamsStore from "@/store/modules/routerParams";
import { storeToRefs } from "pinia";
import useCommonStore from "@/store/modules/common";
import { ElMessage } from "element-plus";
/**
 * 组件
 */
// 树状分组筛选
import ListTreeGroupFilter from "./components/ListTreeGroupFilter.vue";
// 批量编辑
import ListBatchUpdate from "./components/ListBatchUpdate.vue";
// 列表常用分组查询
import ListcommonGroupFilter from "./components/ListcommonGroupFilter.vue";

const { allEntityCode } = storeToRefs(useCommonStore());
const { queryNameByObj } = useCommonStore();
const { setRouterParams } = routerParamsStore();
const { routerParams } = storeToRefs(routerParamsStore());
const router = useRouter();

const $API = inject("$API");
const $TOOL = inject("$TOOL");
const $ElMessage = inject("$ElMessage");

const emits = defineEmits(['referenceCompAdd'])

const props = defineProps({
    listConf: {
        type: Object,
        default: () => {}
    },
    paginationConf: {
        type: Object,
        default: () => {}
    },
    // 是否引入组件
    isReferenceComp: {
        type: Boolean,
        default: false,
    },
    // 是否表单设计模式
    isVFormDesignMode: {
        type: Boolean,
        default: false,
    },
    // 引入组件的引入实体
    referenceEntity: {
        type: String,
        default: ""
    },
    // 引入组件的父实体行ID
    formEntityId: {
        type: String,
        default: ""
    },
    // 引入组件的父组件状态
    referenceCompStatus: {
        type: String,
        default: ""
    },
    // 是否从实体
    detailEntityFlag: {
        type: Boolean,
        default: true,
    },
    // 非从实体绑定字段
    refEntityBindingField: {
        type: String,
        default: "",
    },
    // 实体模块名称
    modelName: {
        type: String,
        default: "",
    },

})

// 页面Loading
let pageLoading = ref(false);
// 当前实体
let entityCode = ref("");
let entityName = ref("");

// 表格列
let tableColumn = ref([]);
// 勾选列冻结
let checkedColumnFixed = ref(false);
// 所有字段
let allFields = ref([]);
// 表格数据
let tableData = ref([]);

// 表格多选数据
let multipleSelection = ref([]);

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
// 默认查询设置
let defaultFilterSetting = ref({});
let defaultFilter = ref({});
// 快捷查询
let quickQuery = ref("");
let quickQueryPlaceholder = ref("");
// 快速查询配置
let quickQueryConf = reactive({
    layoutConfigId: "",
    value: [],
    entityCode: "",
});

// 实体ID
let idFieldName = ref("");
// 标蓝字段
let nameFieldName = ref("");
let TableRef = ref("");

let isMounted = ref(false);

// 分页
let page = reactive({
    no: 1,
    size: 20,
    pageSizes: [20, 40, 80, 100, 200, 300, 400, 500],
    total: 0,
});

// 插槽内容
let contentSlots = reactive({});
// 是否显示操作列插槽
let showActionColumnSlot = ref(false);

// Api：https://www.yuque.com/xieqi-nzpdn/as7g0w/khgyptll0tom0iog
// 配置项
const listParamConf = ref({
    showHeader: true,
    showAdvancedQuery: true,
    showQuickQuery: true,
    showOpenBtn: true,
    showEditBtn: true,
    showAddBtn: true,
    showDelBtn: true,
    showMoreBtn: true,
    showOperateColumn: true,
    showPagination: true,
    showBatchUpdateSet: true,
    showBatchUpdateBtn: true,
})



watch(
    () => props.referenceEntity,
    () => {
        formatReferenceEntity();
    },
    {
        deep: true,
    }
)

const formatReferenceEntity = () => {
    entityCode.value = allEntityCode.value[props.referenceEntity];
    entityName.value = props.referenceEntity;
    if (!entityCode.value) {
        return;
    }
    quickQueryConf.entityCode = entityCode.value;
    // 获取导航配置
    getLayoutList();
    // 如果是引入组件
}




// 是否显示高级查询
// isShowAdvancedQuery: true,
            





onBeforeMount(() => {
    let routerEntityname = router.currentRoute.value.params?.entityname || router.currentRoute.value.query?.entity;
    if (routerEntityname) {
        entityCode.value = allEntityCode.value[routerEntityname];
        entityName.value = routerEntityname;
    } else {
        entityCode.value = router.currentRoute.value.meta.entityCode;
        entityName.value = router.currentRoute.value.meta.entityName;
    }
    // 是引入组件
    if(props.isReferenceComp){
        formatReferenceEntity();
        return
    }
    if (!entityCode.value) {
        ElMessage.warning("该实体不存在或者已删除");
        return;
    }
    quickQueryConf.entityCode = entityCode.value;
    loadRouterParams();
    // 获取导航配置
    getLayoutList();
});

onMounted(()=>{
    // 挂载
	TableRef.value &&
		TableRef.value.$refs.bodyWrapper.addEventListener(
			"mousewheel",
			scrollBehavior
		);
    isMounted.value = true;
    // 取插槽内容
    contentSlots = useSlots();
    // 判断是否有操作列插槽
    showActionColumnSlot.value = contentSlots.actionColumn ? true : false;
})


// 滚动行为
function scrollBehavior(e) {
	// 滚动方向判定
	const scrollDirection = e.deltaY > 0 ? "down" : "up";
	if (scrollDirection === "down") {
		// 获取提供实际滚动的容器
		const dom =
			TableRef.value.$refs.bodyWrapper.getElementsByClassName(
				"el-scrollbar__wrap"
			)[0];
		const { clientHeight, scrollTop, scrollHeight } = dom;
		// 父容器高度 + 子容器距离父容器顶端的高度 = 子容器可滚动的高度
		if (scrollHeight - (clientHeight + scrollTop) <= 300) {
			
            if(sliceTable.value.length == tableData.value.length){
                return
            }
            // console.log("竖向滚动条已经滚动到底部，开始加载数据了~");
			sliceTable.value.push(
				...tableData.value.slice(
					sliceTable.value.length,
					sliceTable.value.length + 20
				)
			);
		}
	}
}

onUnmounted(() => {
	// 卸载
	TableRef.value &&
		TableRef.value.$refs.bodyWrapper.removeEventListener(
			"mousewheel",
			scrollBehavior
		);
});

// 配置自定义列显示
const MoreRefs = ref();
const editColumn = (type) => {
    MoreRefs.value.editColumn(type);
};

/**
 * 树状分组筛选
 */
let treeGroupConf = ref([]);
/**
 * 批量编辑
 */
let batchUpdateConf = ref([]);
let ListBatchUpdateRef = ref("");
// 打开批量编辑弹框
const openBatchUpdateDialog = () => {
    if(batchUpdateConf.value.length < 1) {
        ElMessage.error("该实体没有设置可编辑字段");
        return
    }
    if(multipleSelection.value.length < 1) {
        ElMessage.error("请选择要批量编辑的数据");
        return
    }
    ListBatchUpdateRef.value.openDialog(
        batchUpdateConf.value,
        multipleSelection.value,
        entityName.value,
        idFieldName.value
    );
};

// 设置行样式
let renderRowStyle = ref("");
const setRowStyle = ({row, rowIndex}) => {
    let rowStyle = {};
    if(rowIndex % 2 == 1){
        rowStyle.background = "var(--el-fill-color-lighter)"
    }
    let newRowStyle = new Function('row, rowIndex', renderRowStyle.value)(row, rowIndex);
    rowStyle = Object.assign(rowStyle, newRowStyle);
    return rowStyle;
}

let mainDetailField = ref("");
// 用于区分保存配置
let myModelName = ref("");
// 获取导航配置
const getLayoutList = async () => {
    let res = await $API.layoutConfig.getLayoutList(entityName.value, myModelName.value);
    if (res && res.data) {
        idFieldName.value = res.data.idFieldName;
        nameFieldName.value = res.data.nameFieldName;
        advFilter.value = res.data.advFilter || "all";
        advancedFilter.value = res.data.FILTER;
        mainDetailField.value = res.data.mainDetailField;
        filterEasySql.value = "";
        defaultFilterSetting.value = res.data.DEFAULT_FILTER || {};
        if(defaultFilterSetting.value.config){
            defaultFilter.value = JSON.parse(defaultFilterSetting.value.config);
        }
        quickQueryPlaceholder.value = res.data.quickFilterLabel;
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
            TREE_GROUP: res.data.TREE_GROUP,
            BATCH_UPDATE: res.data.BATCH_UPDATE,
            STYLE: res.data.STYLE,
            COM_TREE_GROUP: res.data.COM_TREE_GROUP,
            idFieldName: idFieldName.value,
            nameFieldName: nameFieldName.value,
            entityName: entityName.value,
            entityCode: entityCode.value,
        };
        // 自定义行样式
        if(res.data.STYLE && res.data.STYLE.config){
            let styleConfig = JSON.parse(res.data.STYLE.config);
            if(styleConfig.rowConf && styleConfig.rowConf.rowStyleRender){
                renderRowStyle.value = styleConfig.rowConf.rowStyleRender;
            }
        }
        // 树状分组筛选
        if (res.data.TREE_GROUP) {
            treeGroupConf.value = JSON.parse(res.data.TREE_GROUP.config);
        }
        // 批量编辑
        if (res.data.BATCH_UPDATE) {
            batchUpdateConf.value = JSON.parse(res.data.BATCH_UPDATE.config);
        }
        // treeGroup.value = ? ;

        // 如果存在默认配置，用默认配置
        if (res.data.chosenListType) {
            tableColumn.value =
                layoutConfig.value[res.data.chosenListType].FILTER;
            defaultColumnShow.value = res.data.chosenListType;
        } else {
            tableColumn.value = ALL.FILTER;
            defaultColumnShow.value = "ALL";
        }
        // 如果存在列
        if (tableColumn.value.length > 0) {
            let hasFixed = tableColumn.value.filter(el => el.fixed == 'left');
            checkedColumnFixed.value = hasFixed.length > 0 ? true : false;
            refreshData();
        }
        // 如果存在快速搜索字段
        if (res.data.SEARCH) {
            quickQueryConf.layoutConfigId = res.data.SEARCH.layoutConfigId;
            quickQueryConf.entityCode = res.data.SEARCH.entityCode;
            quickQueryConf.value = JSON.parse(res.data.SEARCH.config);
        }
    }
};

// 列数据统计
let statistics = ref([]);
// 返回的统计数据
let statisticsList = ref([]);
// 格式化统计数据
let formatterStatistics = ref({});

// 刷新数据
const refreshData = () => {
    // 获取所有列字段
    allFields.value = [];
    // 获取所有列排序
    let findSortFields = [];
    // 获取所有列数据统计
    statistics.value = [];
    tableColumn.value.forEach((el) => {
        // 字段
        allFields.value.push(el.fieldName);
        // 排序
        if (el.columnSort) {
            findSortFields.push(el);
        }
        // 统计
        if (el.dataStatistics) {
            statistics.value.push({
                label: el.statisticName,
                calcMode: el.statisticType,
                fieldName: el.fieldName,
            });
        }
    });
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


/**
 * 全选状态
 * 1 全选
 * 2 半选
 * 3 没有
 */
let selectedAllStatus = computed(() => {
    let status = 3;
    let findSelected = tableData.value.filter(el=> el.isSelected);
    // 是全选
    if(findSelected.length == tableData.value.length){
        status = 1
    }
    // 有选中
    if(findSelected.length > 0 && findSelected.length < tableData.value.length){
        status = 2
    }
    multipleSelection.value = [...findSelected];
    // 没有任何选中
    return status
})

// 全选切换
const selectAllChange = (target) => {
    tableData.value.forEach(el => {
        el.isSelected = target == 'all';
    })
    sliceTable.value.forEach(el => {
        el.isSelected = target == 'all';
    })
}


// 表格行点击选中
const handleHighlightChangeTable = (row, column) => {
    row.isSelected = !row.isSelected;
};

// 编辑弹框
let editRefs = ref();
// 引用组件所关联的主表行ID
let myFormEntityId = ref("");

// 新建
const onAdd = (localDsv, formId) => {
    let { isReferenceComp, detailEntityFlag, refEntityBindingField } = props;
    if(isReferenceComp){
        if(!detailEntityFlag && !myFormEntityId.value){
            ElMessage.info("主表单未保存，不能新建关联引用记录。")
            return
        }
        emits('referenceCompAdd',(formData) => {
            let tempV = {
                isReferenceComp: true,
                detailEntityFlag,
                refEntityBindingField,
            };
            tempV.entityName = entityName.value;
            tempV.formData = formData;
            tempV.idFieldName = idFieldName.value;
            tempV.formEntityId = myFormEntityId.value;
            tempV.mainDetailField = mainDetailField.value;
            tempV.fieldNameLabel = queryNameByObj(myFormEntityId.value, formData);
            tempV.localDsv = {
                sourceRecord: formData,
                ...localDsv,
            };
            !!formId && (tempV.formId = formId)
            editRefs.value.openDialog(tempV);
        });
        return
    }
    let tempV = {};
    tempV.entityName = entityName.value;
    tempV.idFieldName = idFieldName.value;
    tempV.formEntityId = "";
    !!localDsv && (tempV.localDsv = localDsv)
    !!formId && (tempV.formId = formId)
    editRefs.value.openDialog(tempV);
};

const getEditBtnTitle = (row) => {
    let str = "";
    if (row.approvalStatus && row.approvalStatus.value == 3) {
        str = "记录已完成审批，禁止编辑";
    }
    if (row.approvalStatus && row.approvalStatus.value == 1) {
        str = "记录正在审批中，禁止编辑";
    }
    return str;
};
// 编辑
const onEditRow = (row, localDsv, formId) => {
    if (!row) {
        $ElMessage.warning("请先选择数据");
        return;
    }
    let { isReferenceComp, detailEntityFlag, refEntityBindingField } = props;
    let tempV = {
        detailEntityFlag,
        refEntityBindingField,
    };
    tempV.detailId = row[idFieldName.value];
    tempV.idFieldName = idFieldName.value;
    tempV.formEntityId = myFormEntityId.value;
    tempV.mainDetailField = mainDetailField.value;
    !!localDsv && (tempV.localDsv = localDsv)
    !!formId && (tempV.formId = formId)
    editRefs.value.openDialog(tempV);
};

// 编辑成功后回调
const editConfirm = (e) => {
    if(props.isReferenceComp && e.needCb){
        emits('saveFinishCallBack', e);
    }else {
        getLayoutList();
    }
}

// 子表单引用回调
const saveSubFormListCb = (data) => {
    if(data.needCb){
        myFormEntityId.value = data.recordId;
    }
    getLayoutList();
}

let detailRefs = ref("");

const rowDblclick = (row) => {
    openDetailDialog(row);
};

// 打开详情
const openDetailDialog = (row, localDsv, formId) => {
    if (!row) {
        $ElMessage.warning("请先选择数据");
        return;
    }
    // 是明细表编辑
    if(mainDetailField.value){
        let tempV = {};
        tempV.isRead = true;
        tempV.detailId = row[idFieldName.value];
        editRefs.value.openDialog(tempV);
        return
    }
    detailRefs.value.openDialog(row[idFieldName.value], localDsv, formId);
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
        columnSort = { ...defaultSortFields.value[0] };
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

// 添加快速查询字段

let SelectFieldDialog = ref();
const openSelectFieldDialog = () => {
    SelectFieldDialog.value.openDialg();
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
// 重置高级筛选
const refreshAdvancedQuery = () => {
    queryFilter = { equation: "AND", items: [] };
    getTableList();
};

// 导入到出数据
let dataExportData = reactive({
    queryParm: {},
    total: 0,
});

let builtInFilter = ref({});
let isDataFilter = ref(false);

const clearDataFilter = () => {
    isDataFilter.value = false;
    builtInFilter.value = {};
    (quickQuery.value = ""), setRouterParams({});
    getTableList();
};

/**
 * 分组查询
 */
// 常用分组查询保存弹框
let ListcommonGroupFilterRefs = ref("");
// 列表分组树过滤组件
let ListTreeGroupFilterRefs = ref("");
let filterEasySql = ref("");
const treeGroupFilter = (e) => {
    ListcommonGroupFilterRefs.value.resetChecked();
    filterEasySql.value = e;
    getTableList();
};
// 分组刷新
const treeRefresh = () => {
    filterEasySql.value = "";
    getLayoutList();
};

// 分组保存
const treeSave = () => {
    if (!filterEasySql.value) {
        $ElMessage.warning("请勾选有效的筛选");
        return;
    }
    ListcommonGroupFilterRefs.value.openSaveDialog(filterEasySql.value);
};

// 常用分组查询点击
const commonGroupFilterNodeClick = (e) => {
    ListTreeGroupFilterRefs.value.resetChecked();
    filterEasySql.value = e;
    getTableList();
};

let sliceTable = ref([]);

const getTableList = async () => {
    pageLoading.value = true;
    let { isReferenceComp, detailEntityFlag, refEntityBindingField } = props;
    // 如果是列表子表单引用组件
    if(isReferenceComp){
        // 如果是明细实体
        if(detailEntityFlag){
            filterEasySql.value = `${mainDetailField.value} = '${myFormEntityId.value}'`
        }else {
            filterEasySql.value = `${refEntityBindingField} = '${myFormEntityId.value}'`
        }
    }
    let param = {
        mainEntity: entityName.value,
        fieldsList: allFields.value.join(),
        pageSize: page.size,
        pageNo: page.no,
        filter: JSON.parse(JSON.stringify(queryFilter)),
        advFilter: { ...comQueriesList },
        sortFields: sortFields.value,
        quickFilter: quickQuery.value,
        builtInFilter: builtInFilter.value,
        statistics: statistics.value,
        filterEasySql: filterEasySql.value,
        defaultFilter: defaultFilter.value,
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
        param.quickFilter,
        param.builtInFilter,
        param.statistics,
        param.filterEasySql,
        param.defaultFilter
    );
    if (res && res.data) {
        tableData.value = res.data.dataList.map(el => {
            el.isSelected = false;
            return el
        });
        page.total = res.data.pagination.total;
        dataExportData.size = res.data.dataList.length;
        dataExportData.total = res.data.pagination.total;
        statisticsList.value = res.data.statisticsList || [];
        formatterStatistics.value = {};
        if (statisticsList.value.length > 0) {
            statisticsList.value.forEach((el) => {
                formatterStatistics.value[el.fieldName] = {
                    label: el.label,
                    value: el.value,
                };
            });
        }
        sliceTable.value = tableData.value.slice(0, 20);
    }
    pageLoading.value = false;
};

// 设置表格高度
const setTableHeight = () => {
    return "100%";
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
    return null;
};

// 统计显示
const getSummaries = (param) => {
    const { columns, data } = param;
    const sums = [];
    columns.forEach((column, index) => {
        if (index === 0) {
            sums[index] = "统计";
            return;
        }
        // property
        if (formatterStatistics.value[column.property]) {
            let { label, value } = formatterStatistics.value[column.property];
            sums[index] = (label ? label + "：" : "") + (value || 0);
        }
    });

    return sums;
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
 * 缓存页面后依旧调用
 */
 onActivated(() => {
    if(isMounted.value){
        isMounted.value = false;
    }else {
        loadRouterParams(true)
    }
})


watchEffect(() => {
    listParamConf.value = Object.assign(listParamConf.value, props.listConf)
    page.size = props.paginationConf?.size || 20;
    page.pageSizes = props.paginationConf?.pageSizes || [20, 40, 80, 100, 200, 300, 400, 500];
    myFormEntityId.value = props.formEntityId;
    myModelName.value = props.modelName;
    if(props.isReferenceComp){
        if(props.referenceCompStatus == 'read'){
            listParamConf.value.showAddBtn = false;
            listParamConf.value.showEditBtn = false;
            listParamConf.value.showMoreBtn = false;
        }
        if(props.isVFormDesignMode){
            listParamConf.value.showOpenBtn = false;
            listParamConf.value.showAddBtn = false;
            listParamConf.value.showEditBtn = false;
        }
    }
})

const loadRouterParams = (cbApi) => {
    if (
        routerParams.value.path &&
        routerParams.value.path == router.currentRoute.value.path
    ) {
        quickQuery.value = routerParams.value.quickFilter;
        builtInFilter.value = routerParams.value.filter;
        isDataFilter.value = true;
        if(cbApi){
            getTableList();
        }
    }
}

// 复制成功
const copySuccess = ({type, recordId}) => {
    getTableList();
    if(type == 1){
        let { detailEntityFlag, refEntityBindingField } = props;
        let tempV = {
            detailEntityFlag,
            refEntityBindingField,
        };
        tempV.detailId = recordId;
        tempV.idFieldName = idFieldName.value;
        tempV.formEntityId = myFormEntityId.value;
        tempV.mainDetailField = mainDetailField.value;
        editRefs.value.openDialog(tempV);
    }else {
        detailRefs.value.openDialog(recordId);
    }
}

/**
 * 导出方法
 */

// 重置表格数据
const resetList = () => {
    quickQuery.value = "";
    queryFilter = { equation: "AND", items: [] };
    getLayoutList();
}

// 刷新表格数据
const refreshList = () => {
    getTableList();
}

// 快速查询
const onQuickQuery = () => {
    if(!quickQueryPlaceholder.value){
        ElMessage.warning("请配置快速查询字段!");
        return
    }
    quickQuery.value = quickQuery.value.replace(/\s/g, '');
    getTableList();
}

// 清空快速查询
const onClearQuickQuery = () => {
    if(quickQueryPlaceholder.value){
        getTableList();
    }
}

// 获取实体信息
const getCurEntity = () => {
    return {
        name: entityName.value,
        code: entityCode.value,
        idFieldName: idFieldName.value,
        nameFieldName: nameFieldName.value,
    }
}
// 获取选中数据
const getSelectedRow = () => {
    return multipleSelection.value 
}

// 编辑数据
const toEdit = (localDsv, formId) => {
    if(multipleSelection.value.length < 1){
        ElMessage.warning("请先选择数据")
        return
    }
    if(multipleSelection.value.length > 1){
        ElMessage.warning("仅支持编辑单条数据")
        return
    }
    let row = multipleSelection.value[0];
    if(row.approvalStatus && (row.approvalStatus.value == 3 || row.approvalStatus.value == 1)){
        ElMessage.warning("当前数据这个在审批中或者已审批结束，不可编辑。")
        return
    }
    onEditRow(row, localDsv, formId);
}

// 查看详情
const toDetail = (localDsv, formId) => {
    if(multipleSelection.value.length < 1){
        ElMessage.warning("请先选择数据")
        return
    }
    if(multipleSelection.value.length > 1){
        ElMessage.warning("仅支持查看单条数据详情")
        return
    }
    let row = multipleSelection.value[0];
    openDetailDialog(row, localDsv, formId)
}

// 新建数据
const toAdd = (localDsv, formId) => {
    onAdd(localDsv, formId);
}

// 更多操作
const toMoreAction = (type) => {
    let allocationTypes = ['del', 'allocation', 'share', 'unShare'];
    if(allocationTypes.includes(type)){
        if(multipleSelection.value.length < 1){
            ElMessage.warning("请先选择数据")
            return
        }
        MoreRefs.value?.allocationFn(type);
    }else if(type == 'dataExport'){
        MoreRefs.value?.dataExportFn(type);
    }else if(type == 'dataUpload'){
        MoreRefs.value?.dataUploadFn(type);
    }
}

// 显示列设置
const showColumnSetting = (type) => {
    MoreRefs.value?.editColumn(type)
}

// 更多列表设置
const listMoreSetting = (type) => {
    MoreRefs.value?.listMoreSetting(type)
}

// 编辑行
const editRow = (row, localDsv, formId) => {
    onEditRow(row, localDsv, formId);
}

// 查看行
const viewRow = (row, localDsv, formId) => {
    openDetailDialog(row, localDsv, formId)
}

// 获取列表数据
const getTableDataList = () => {
    return sliceTable.value;
}


defineExpose({
    resetList,
    refreshList,
    getCurEntity,
    getSelectedRow,
    toEdit,
    toAdd,
    toDetail,
    toMoreAction,
    showColumnSetting,
    listMoreSetting,
    saveSubFormListCb,
    editRow,
    viewRow,
    getTableDataList,
    openBatchUpdateDialog,
})

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
    min-width: 1200px;
    .table-box {
        height: 100%;
        // padding: 20px 0;
        .table-search-box {
            border-top: 3px solid var(--el-color-primary);
            background: #fff;
            height: 60px;
            line-height: 60px;
            padding: 0 20px;
            box-sizing: border-box;
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
        .table-div {
            height: calc(100% - 60px);
            &.showPagination {
                height: calc(100% - 100px);
            }
            width: 100%;
            display: flex;
            .tree-froup-box {
                width: 300px;
                border: 1px solid #ebeef5;
                border-right: 0;
                background: #fff;
                box-sizing: border-box;
                padding: 10px 0;
                position: relative;
                .tree-refresh {
                    position: absolute;
                    width: 20px;
                    height: 20px;
                    top: 5px;
                    right: 10px;
                    z-index: 66;
                    cursor: pointer;
                    text-align: center;
                    line-height: 20px;
                    border-radius: 4px;
                    box-sizing: border-box;
                    padding-top: 2px;
                    font-size: 16px;
                    &:hover {
                        background: #f2f6fc;
                    }
                }
                .tree-save {
                    right: 35px;
                }
                // overflow:auto;
            }

            // :deep(.el-table__row){
            //     td {
            //         background: initial;
            //     }
            // }
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
    width: 300px;
    padding-right: 30px;
    position: relative;
    .quick-query-icon {
        cursor: pointer;
    }
    .queick-edit {
        position: absolute;
        width: 18px;
        height: 18px;
        right: 10px;
        top: 5px;
        cursor: pointer;
        display: none;
        color: #a1a1a1;
        &:hover {
            color: #666;
        }
    }
    &:hover {
        .queick-edit {
            display: block;
        }
    }
}
.data-filter {
    display: inline-block;
    position: relative;
    top: 2px;
}
</style>