<template>
    <div class="customize-menu-list" v-loading="pageLoading">
        <div class="table-box">
            <div
                class="table-search-box"
                v-if="listParamConf.showHeader && toolbarConf.showHeader"
            >
                <ListCustomizeQuery
                    :entityName="entityName"
                    :entityCode="entityCode"
                    :modelName="modelName"
                    :topSearchConfig="topSearchConfig"
                    @queryNow="queryNow"
                    @uploadItems="topPanelUploadItems"
                    ref="ListCustomizeQueryRef"
                    v-if="!topSearchConfig.isDefaultQueryPanel"
                />
                <div class="clearfix">
                    <template v-if="topSearchConfig.isDefaultQueryPanel">
                        <slot name="beforeAdvancedQuery"></slot>
                        <el-tooltip
                            effect="dark"
                            content="切换查询面板"
                            placement="top"
                        >
                            <el-button
                                class="mr-10"
                                type="primary"
                                link
                                :loading="queryPanelLoading"
                                @click="changeQueryPanel(false)"
                                v-if="listParamConf.showChangeQueryPanel && toolbarConf.showChangeQueryPanel"
                            >
                                <el-icon size="16" class="toggle-query-icon">
                                    <Switch />
                                </el-icon>
                            </el-button>
                        </el-tooltip>
                        <mlListAdvancedQuery
                            v-if="entityCode && listParamConf.showAdvancedQuery && toolbarConf.showAdvancedQuery"
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
                        <div class="quick-query" v-if="listParamConf.showQuickQuery && toolbarConf.showQuickQuery">
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
                                class="quick-edit"
                                @click="openSelectFieldDialog"
                                v-if="$TOOL.checkRole('r6008')"
                            >
                                <el-icon size="18">
                                    <ElIconEditPen />
                                </el-icon>
                            </span>
                        </div>
                        <div class="data-filter" v-if="isDataFilter">
                            <el-tag type="success" closable @close="clearDataFilter">
                                当前数据已过滤
                            </el-tag>
                        </div>
                        <slot name="afterQuickQuery"></slot>
                    </template>
                    <template v-if="!topSearchConfig.isDefaultQueryPanel">
                        <el-button
                            icon="Switch"
                            type="primary"
                            text
                            bg
                            :loading="queryPanelLoading"
                            @click="changeQueryPanel(true)"
                            v-if="listParamConf.showChangeQueryPanel && toolbarConf.showChangeQueryPanel"
                        >
                            切换查询面板
                        </el-button>
                        <el-button
                            icon="Setting"
                            @click="setCustomizeQueryPanel"
                            text
                            bg
                            :loading="queryPanelLoading"
                            v-if="$TOOL.checkRole('r6008')"
                        >
                            设计查询面板
                        </el-button>
                        <el-tooltip
                            effect="dark"
                            content="展开收起"
                            placement="top"
                            v-if="topSearchConfig.filter?.items?.length > 3"
                        >
                            <el-button
                                class="mr-10"
                                type="primary"
                                text
                                bg
                                :loading="queryPanelLoading"
                                @click="changeTopQueryPanelExpand"
                            >
                                <el-icon size="16" class="toggle-query-icon" v-if="!topQueryPanelExpand">
                                    <ArrowDown />
                                </el-icon>
                                <el-icon size="16" class="toggle-query-icon" v-else>
                                    <ArrowUp />
                                </el-icon>
                            </el-button>
                        </el-tooltip>
                    </template>
                    <div class="fr table-setting" v-if="!(customButtonConfig?.pcTop?.length > 0)">
                        <template v-for="(item, index) in mergedButtonList" :key="index">
                            <!-- 插槽 -->
                            <slot v-if="item.type === 'slot'" :name="item.name"></slot>
                            <!-- 原有按钮 -->
                            <el-button
                                v-else-if="item.type === 'native'"
                                v-bind="item.props"
                                @click="item.handler"
                                v-show="item.show !== false"
                            >
                                <i v-if="item.props.icon" :class="`el-icon-${item.props.icon}`"></i>
                                {{ item.label }}
                            </el-button>

                            <!-- 更多按钮 -->
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
                                :entityCode="entityCode"
                                @defaultFilterChange="getLayoutList"
                                @treeGroupFilterConfirm="getLayoutList"
                                :isReferenceComp="isReferenceComp"
                                :isMainDetailField="!!mainDetailField"
                                :referenceEntity="referenceEntity"
                                :modelName="modelName"
                                @copySuccess="copySuccess"
                                v-else-if="item.type === 'more' && toolbarConf.showMoreBtn"
                            />
                        </template>
                    </div>
                    <div class="fr table-setting" v-else>
                        <template 
                            v-for="(item,index) of customButtonConfig.pcTop" 
                            :key="index"
                        >
                            <el-button
                                :disabled="getCustomButtonDisabled(item)"
                                @click="customButtonClick(item)"
                                :type="item.type"
                                v-if="(!item.isNative) || 
                                    (item.isNative && 
                                    !item.hide && 
                                    item.key !== 'more' &&
                                    (item.key !== 'batchEdit' || batchUpdateConf?.length > 0))"
                            >
                                <el-icon
                                    :size="16"
                                    :color="item.iconColor"
                                    v-if="
                                        item.icon &&
                                        item.showType != 3
                                    "
                                    style="position: relative; top: -1px"
                                >
                                    <component :is="item.icon" />
                                </el-icon>
                                <span
                                    v-if="item.showType != 2"
                                    :class="{
                                        'ml-5':
                                            item.showType == 1 &&
                                            item.icon,
                                    }"
                                >
                                    {{ item.name }}
                                </span>
                            </el-button>
                            <!-- 更多按钮 -->
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
                                :entityCode="entityCode"
                                @defaultFilterChange="getLayoutList"
                                @treeGroupFilterConfirm="getLayoutList"
                                :isReferenceComp="isReferenceComp"
                                :isMainDetailField="!!mainDetailField"
                                :referenceEntity="referenceEntity"
                                :modelName="modelName"
                                @copySuccess="copySuccess"
                                v-else-if="item.key === 'more' && !item.hide"
                            />
                        </template>
                    </div>
                </div>
            </div>
            <div v-if="showColumnSet">
                <ListColumnSet
                    :layoutConfig="layoutConfig"
                    :defaultColumnShow="defaultColumnShow"
                    :tableColumn="tableColumn"
                    @changeColumnShow="changeColumnShow"
                    @editColumn="editColumn"
                />
            </div>
            <div
                v-else
                class="table-div"
                :class="{'showPagination':listParamConf.showPagination}"
                :style="{'height':calculateHeight}"
            >
                <!-- 分组 -->
                <div class="tree-group-box" v-if="treeGroupConf.isOpen && treeGroupConf.groupType == 1">
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
                            ref="ListCommonGroupFilterRefs"
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
                <div class="tree-group-box" v-else-if="treeGroupConf.isOpen && treeGroupConf.groupType == 2">
                    <ListRefFieldGroupFilter :treeGroupConf="treeGroupConf" @changeOtherFilters="changeOtherFilters"/>
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
                    @cell-click="TableCellClick"
                    :show-summary="statisticsList.length > 0"
                    :summary-method="getSummaries"
                    :row-style="setRowStyle"
                    class="table-box-el-table"
                    @scroll="scrollBehavior"
                >
                    <el-table-column
                        :width="statisticsList.length > 0 ? 60 : 50"
                        :align="'center'"
                        :fixed="checkedColumnFixed"
                        v-if="listParamConf.showTableCheckbox"
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
                            <el-checkbox
                                :disabled="scope.row.isCustomDisabled"
                                v-model="scope.row.isSelected"
                                @change="handleHighlightChangeTable(scope.row)"
                            />
                        </template>
                    </el-table-column>
                    <template v-if="listConf.showRowNumber">
                        <el-table-column
                            label="序号"
                            width="60"
                            align="center"
                        >
                            <template #default="scope">
                                {{ (page.no - 1) * page.size + scope.$index + 1 }}
                            </template>
                        </el-table-column>
                    </template>
                    <template v-for="(column,columnInx) of tableColumn" :key="columnInx">
                        <el-table-column
                            v-if="!column.pcHide"
                            :prop="column.fieldName"
                            :width="setColumnWidth(column)"
                            :sortable="column.sortable == undefined ? 'custom' : column.sortable ? 'custom' : false"
                            show-overflow-tooltip
                            :fixed="column.fixed"
                            :align="column.align"
                            :header-align="column.headerAlign"
                        >
                            <template #header>
                                <span v-html="column.columnAliasName ? column.columnAliasName.replace(/\\n/g, '<br>') : column.fieldLabel"></span>
                            </template>
                            <template #default="scope">
                                <FormatRow
                                    :listExposed="currentExposed"
                                    :row="scope.row"
                                    :column="column"
                                    :nameFieldName="nameFieldName"
                                    :nameFieldClick="nameFieldClick"
                                    @openDetailDialog="openDetailDialog"
                                />
                            </template>
                        </el-table-column>
                    </template>

                    <slot name="actionColumn" v-if="showActionColumnSlot && listParamConf.showOperateColumn"></slot>
                    <el-table-column
                        v-if="!showActionColumnSlot && listParamConf.showOperateColumn"
                        label="操作"
                        fixed="right"
                        :align="'center'"
                        :width="listConf.actionColumnWidth || 120"
                    >
                        <template 
                            #default="scope" 
                            v-if="!(customButtonConfig?.pcColumn?.length > 0)"
                        >
                            <el-tooltip
                                class="box-item"
                                effect="dark"
                                :content="getEditBtnTitle(scope.row) || '此状态不可编辑'"
                                placement="top"
                                v-if="hasEditRight && !checkModifiableEntity(scope.row[idFieldName],scope.row.approvalStatus?.value) || referenceCompStatus == 'read'"
                            >
                                <el-button
                                    size="small"
                                    icon="el-icon-edit"
                                    link
                                    type="primary"
                                    disabled
                                >
                                    编辑
                                </el-button>
                            </el-tooltip>
                            <el-button
                                v-else-if="hasEditRight && !mainDetailField"
                                size="small"
                                icon="el-icon-edit"
                                link
                                type="primary"
                                @click.stop="onEditRow(scope.row)"
                                :disabled="scope.row.btnDisabled.edit"
                            >
                                编辑
                            </el-button>

                            <el-button
                                size="small"
                                link
                                type="primary"
                                @click.stop="openDetailDialog(scope.row)"
                                :disabled="scope.row.btnDisabled.view"
                            >
                                查看
                            </el-button>
                        </template>
                        <template #default="scope" v-else>
                            <template 
                                v-for="(item,index) of customButtonConfig.pcColumn" :key="index"
                            >
                                <el-button
                                    @click="customButtonClick(item, scope.row)"
                                    link
                                    :type="item.type"
                                    v-if="!item.isNative || (item.isNative && !item.hide)"
                                >
                                    <el-icon
                                        :size="16"
                                        :color="item.iconColor"
                                        v-if="
                                            item.icon &&
                                            item.showType != 3
                                        "
                                        style="position: relative; top: -1px"
                                    >
                                        <component :is="item.icon" />
                                    </el-icon>
                                    <span
                                        v-if="item.showType != 2"
                                        :class="{
                                            'ml-5':
                                                item.showType == 1 &&
                                                item.icon,
                                        }"
                                    >
                                        {{ item.name }}
                                    </span>
                                </el-button>
                            </template>
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
            v-if="listParamConf.showPagination"
        />
        <mlCustomDetail
            ref="detailRefs"
            :customDetailDialogTitle="customDetailDialogTitle"
            :entityName="entityName"
            @updateData="getTableList"
            :recordDetailFormId="listParamConf.recordDetailFormId || rowStyleConf?.formConf?.pcDetailFormId"
            :recordEditFormId="listParamConf.recordEditFormId || rowStyleConf?.formConf?.pcEditFormId"
            :recordIds="recordIds"
        />
        <mlCustomEdit
            ref="editRefs"
            :entityName="entityName"
            :nameFieldName="isOtherEntity ? null : nameFieldName"
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
        <!-- 提交审批弹框 -->
        <SubmitApprovalDialog ref="SubmitApprovalDialogRefs" @onSubmit="submitApprovalSuccess" append-to-body/>
        <!-- 执行审批 -->
        <mlApprove 
            ref="MlApproveRefs" 
            isDialog
            :entityId="approverRecordId"
            @confirm="ApprovalSuccess"
        />
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
    nextTick,
    getCurrentInstance,
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
import { ElMessage, ElMessageBox, ElLoading } from "element-plus";
/**
 * 组件
 */
// 树状分组筛选
import ListTreeGroupFilter from "./components/ListTreeGroupFilter.vue";
// 引用字段分组筛选
import ListRefFieldGroupFilter from "./components/ListRefFieldGroupFilter.vue";
// 批量编辑
import ListBatchUpdate from "./components/ListBatchUpdate.vue";
// 列表常用分组查询
import ListcommonGroupFilter from "./components/ListcommonGroupFilter.vue";
// 自定义查询面板
import ListCustomizeQuery from './components/ListCustomizeQuery.vue'
// 列表列设置
import ListColumnSet from './components/ListColumnSet.vue';
// 提交审批弹框
import SubmitApprovalDialog from "@/components/mlApprove/SubmitApprovalDialog.vue";
// 执行审批弹框
import mlApprove from "@/components/mlApprove/index.vue";
import http from "@/utils/request";
import { mlShortcutkeys } from "@/utils/util";
import { getTransformMap } from "@/api/transform";
import { checkTables } from "@/api/layoutConfig";
// 自定义按钮
import useCustomButtonConfig from "@/hooks/useCustomButtonConfig";
const {
    // 当前按钮点击处理
    customButtonHandler,
    // 当前按钮后置事件
	customButtonAfterEventCb,
} = useCustomButtonConfig();

const { allEntityCode } = storeToRefs(useCommonStore());
const { queryNameByObj, checkModifiableEntity, queryEntityCodeByEntityName, queryEntityLabelByName } = useCommonStore();
const { setRouterParams } = routerParamsStore();
const { routerParams } = storeToRefs(routerParamsStore());
const router = useRouter();

const $API = inject("$API");
const $TOOL = inject("$TOOL");
const $ElMessage = inject("$ElMessage");

const emits = defineEmits(['referenceCompAdd', 'onCellClick', 'onRowClick'])

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
    // 自定义双击行事件
    listRowDblClick: {
        type: Function,
        default: null,
    },
    // 自定义行事件
    listRowClick: {
        type: Function,
        default: null
    },
    // 自定义名称字段点击
    nameFieldClick: {
        type: Function,
        default: null
    },
    // 自定义单元格点击
    cellClick: {
        type: Function,
        default: null
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
let queryFilter = ref({
    equation: "AND",
    items: [],
});
// 高级查询过滤
let advancedFilter = ref([]);
let advFilter = ref("all");
let comQueriesList = ref({});
// 默认列宽度
let titleWidthForAll = reactive({});
// 自定义列宽度
let titleWidthForSelf = reactive({});
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

// 是否显示列配置
let showColumnSet = ref(false);

// Api：https://www.yuque.com/xieqi-nzpdn/as7g0w/khgyptll0tom0iog
// 配置项
const listParamConf = ref({
    // 是否显示列表复选框 注意，如果列表复选框开启，则列表的头部按钮点击事件会失效
    showTableCheckbox: true,
    showHeader: true,
    showChangeQueryPanel: true,
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
    // 新增记录表单id
    recordNewFormId: "",
    // 编辑记录表单id
    recordEditFormId: "",
    // 详情查看表单id
    recordDetailFormId: "",
    // 提交审批后回调
    submitApprovalSuccess: () => {},
    // 审批后回调
    approvalSuccess: () => {},
})

// 顶部区域隐藏
const toolbarConf = ref({
    // 顶部影藏
    showHeader: true,
    // 切换查询按钮隐藏
    showChangeQueryPanel: true,
    // 高级查询隐藏
    showAdvancedQuery: true,
    // 快速搜索隐藏
    showQuickQuery: true,
    // 打开隐藏
    showOpenBtn: true,
    // 编辑隐藏
    showEditBtn: true,
    // 新建隐藏
    showAddBtn: true,
    // 更多操作隐藏
    showMoreBtn: true,
});


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
    let routerEntityName = router.currentRoute.value.params?.entityname || router.currentRoute.value.query?.entity;
    if (routerEntityName) {
        entityCode.value = allEntityCode.value[routerEntityName];
        entityName.value = routerEntityName;
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

let currentExposed = ref({});

// 快捷键
let mlShortcutCleanup = ref(null);

onMounted(()=>{
    // 挂载
	// TableRef.value &&
	// 	TableRef.value.$refs.bodyWrapper.addEventListener(
	// 		"wheel",
	// 		scrollBehavior
	// 	);
	// TableRef.value &&
	// 	TableRef.value.$refs.bodyWrapper.addEventListener(
	// 		"DOMMouseScroll",
	// 		scrollBehavior
	// 	);
    isMounted.value = true;
    // 取插槽内容
    contentSlots = useSlots();
    // 判断是否有操作列插槽
    showActionColumnSlot.value = contentSlots.actionColumn ? true : false;
    // 判断路由自动打开新建、编辑详情等页面
    nextTick(() => {
        checkRouterAutoOpen();
    })
    currentExposed.value = getCurrentInstance().exposed;
    mlShortcutCleanup.value = mlShortcutkeys(()=>{
        for(let key in toolbarConf.value){
            toolbarConf.value[key] = true;
        }
        if(customButtonConfig.value?.pcTop?.length > 0){
            customButtonConfig.value.pcTop.forEach(item => {
                if(item.key == 'more'){
                    item.hide = false;
                }
            })
        }
    })
    
})

let scrollTop = ref(0);
// 滚动行为
function scrollBehavior(e) {
    let scrollDirection;
    if(e.scrollTop > scrollTop.value) {
        scrollDirection = "down";
    }else{
        scrollDirection = "up";
    }
    scrollTop.value = e.scrollTop;
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
    
    if(mlShortcutCleanup.value){
        mlShortcutCleanup.value();
    }
});

const hasCreateRight = computed(() => {
	const entityCodeForRight = queryEntityCodeByEntityName(props.isReferenceComp ?
		props.referenceEntity : entityName.value)
	return $TOOL.checkRole('r' + entityCodeForRight + '-2')
})

const hasEditRight = computed(() => {
	const entityCodeForRight = queryEntityCodeByEntityName(props.isReferenceComp ?
		props.referenceEntity : entityName.value)
	return $TOOL.checkRole('r' + entityCodeForRight + '-3')
})



const mergedButtonList = computed(() => {
    const nativeButtons = [
        { type: 'slot', name: 'beforeOpenBtn' },
        {
            type: 'native',
            label: '打开',
            key: 1,
            props: { 
                disabled: multipleSelection.value.length !== 1,
                icon: 'Notification',
            },
            handler: () => openDetailDialog(multipleSelection.value[0]),
            show: listParamConf.value.showOpenBtn && !mainDetailField.value && toolbarConf.value.showOpenBtn
        },
        { type: 'slot', name: 'beforeEditBtn' },
        { 
          type: 'native', 
          key: 2,
          label: '编辑',
          props: { icon: 'Edit', disabled: multipleSelection.value.length !== 1 },
          handler: () => onEditRow(multipleSelection.value[0]),
          show: listParamConf.value.showEditBtn && !props.isReferenceComp && hasEditRight.value 
                && !mainDetailField.value && toolbarConf.value.showEditBtn
        },
        {
            type: 'native',
            label: '批量编辑',
            key: 3,
            props: { 
                icon: 'Edit', 
                disabled: multipleSelection.value.length !== 1,
            },
            handler: () => openBatchUpdateDialog(),
            show: listParamConf.value.showBatchUpdateBtn && batchUpdateConf.value.length > 0
        },
        { type: 'slot', name: 'beforeAddBtn' },
        {
            type: 'native',
            label: '新建',
            key: 4,
            props: { 
                icon: 'Plus', 
                disabled: !hasCreateRight.value,
                type: 'primary',
            },
            handler: () => onAdd(),
            show: listParamConf.value.showAddBtn && hasCreateRight.value && toolbarConf.value.showAddBtn
        },
        { type: 'slot', name: 'beforeMoreBtn' },
        { type: 'more', key: 5 },
        { type: 'slot', name: 'afterMoreBtn' },
    ];
    return nativeButtons.filter(btn => btn.show !== false);
})


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

// 行样式配置
let rowStyleConf = ref({});

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


// 顶部查询面板配置
let topSearchConfig = ref({
    isDefaultQueryPanel: true,
    forbidUserModifyField: false,
    hideQueryMatchType: false,
    filter: {
        equation: "AND",
	    items: [],
    },
});
let queryPanelLoading = ref(false);

let calculateHeight = ref("");

// 列表设置
let listConf = ref({});

// 切换查询面板
const changeQueryPanel = async (target) => {
    if(!$TOOL.checkRole('r6008')){
        topSearchConfig.value.isDefaultQueryPanel = target;
        if(target) {
            calculateHeight.value = "";
        }else {
            calculateHeight.value = "calc(100% - 144px)"
        }
        return
    }
    let param = {
		config: JSON.stringify({
            isDefaultQueryPanel: target,
            filter: topSearchConfig.value.filter,
            forbidUserModifyField: topSearchConfig.value.forbidUserModifyField,
            hideQueryMatchType: topSearchConfig.value.hideQueryMatchType,
        }),
		entityCode: entityCode.value,
	};
    queryPanelLoading.value = true;
	let res = await $API.layoutConfig.saveConfig(
		topSearchConfig.value.layoutConfigId,
		"TOP_SEARCH",
		param,
		myModelName.value
	);
    if(res){
        if(!topSearchConfig.value.layoutConfigId) {
            topSearchConfig.value.layoutConfigId = res.data.formData.layoutConfigId
        }
        topSearchConfig.value.isDefaultQueryPanel = target;
        if(target) {
            calculateHeight.value = "";
        }else {
            calculateHeight.value = "calc(100% - 144px)"
        }
    }
    topQueryPanelExpand.value = false;
	queryPanelLoading.value = false;
}
// 更新查询面板
const topPanelUploadItems = (e) => {
    topSearchConfig.value = { ...topSearchConfig.value, ...e };
}
// 展开收起查询面板
let topQueryPanelExpand = ref(false);
const changeTopQueryPanelExpand = () => {
    topQueryPanelExpand.value = !topQueryPanelExpand.value;
    let length = topSearchConfig.value.filter.items?.length;
    if(topQueryPanelExpand.value) {
        let sourceHeight = 106;
        let formatHeight = Math.ceil(length / 3) * 38;
        calculateHeight.value = "calc(100% - "+( sourceHeight + formatHeight) +"px)";
        ListCustomizeQueryRef.value?.changeCustomizeQueryHeight(formatHeight);
    }else {
        calculateHeight.value = "calc(100% - 144px)";
        ListCustomizeQueryRef.value?.changeCustomizeQueryHeight(38);
    }
}

// 自定义按钮
let customButtonConfig = ref({});
// 内置按钮禁用方法
let nativeButtonDisabled = ref({
    open: multipleSelection.value.length !== 1,
    batchEdit: multipleSelection.value.length !== 1,
    new: hasCreateRight.value,
    edit: multipleSelection.value.length !== 1,
});
// 获取自定义按钮禁用状态
const getCustomButtonDisabled = (item) => {
    if(item.isNative){
        return nativeButtonDisabled[item.key];
    }else {
        let { availableType, action } = item;
        let isDisabled = false;
        
        if (action == 2 || action == 3) {
            isDisabled = multipleSelection.value.length != 1;
        } else if (action == 4) {
            isDisabled = availableType == 1 
                ? multipleSelection.value.length != 1 
                : multipleSelection.value.length < 1;
        }
        return isDisabled;
    }
}

// 自定义按钮点击
const customButtonClick = (item, row) => {
    // 内置按钮点击
    if(item.isNative){
        switch(item.key){
            case "open":
                openDetailDialog(row || multipleSelection.value[0])
                break;
            case "batchEdit":
                openBatchUpdateDialog();
                break;
            case "new":
                onAdd()
                break;
            case "edit":
                onEditRow(row || multipleSelection.value[0])
                break;
        }
    }else {
        customButtonHandler(
            item, 
            [row] || multipleSelection.value,
            currentExposed.value,
            row ? row[idFieldName.value] : multipleSelection.value?.[0]?.[idFieldName.value],
            pageLoading,
            onAdd,
            ()=> onEditRow(row || multipleSelection.value[0]),
            onAdd,
        );
    }
}


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
        if(res.data.DEFAULT_FILTER){
            defaultFilter.value = JSON.parse(res.data.DEFAULT_FILTER.config);
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
            entityName: entityName.value,
            entityCode: entityCode.value,
            ...res.data
        };
        // 自定义按钮
        if(res.data.CUSTOM_BUTTON && res.data.CUSTOM_BUTTON.config){
            customButtonConfig.value = JSON.parse(res.data.CUSTOM_BUTTON.config);
            console.log(customButtonConfig.value,'customButtonConfig.value')
        }
        
        // 自定义行样式
        if(res.data.STYLE && res.data.STYLE.config){
            rowStyleConf.value = JSON.parse(res.data.STYLE.config);
            if(rowStyleConf.value.rowConf && rowStyleConf.value.rowConf.rowStyleRender){
                renderRowStyle.value = rowStyleConf.value.rowConf.rowStyleRender;
            }
            // 如果存在顶部区域隐藏
            if(rowStyleConf.value.toolbarConf){
                toolbarConf.value = Object.assign(toolbarConf.value, rowStyleConf.value.toolbarConf);
            }
            // 如果存在列表设置
            if(rowStyleConf.value.listConf){
                listConf.value = rowStyleConf.value.listConf;
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
        // 顶部搜索
        if(res.data.TOP_SEARCH) {
            topSearchConfig.value = JSON.parse(res.data.TOP_SEARCH.config);
            topSearchConfig.value.layoutConfigId = res.data.TOP_SEARCH.layoutConfigId;
            if(!topSearchConfig.value.isDefaultQueryPanel) {
                calculateHeight.value = "calc(100% - 144px)"
            }
        };
        // 如果存在快速搜索字段
        if (res.data.SEARCH) {
            quickQueryConf.layoutConfigId = res.data.SEARCH.layoutConfigId;
            quickQueryConf.entityCode = res.data.SEARCH.entityCode;
            quickQueryConf.value = JSON.parse(res.data.SEARCH.config);
        }
        // treeGroup.value = ? ;

        // 如果存在默认配置，用默认配置
        // if (res.data.chosenListType) {
        //     tableColumn.value =
        //         layoutConfig.value[res.data.chosenListType].FILTER;
        //     defaultColumnShow.value = res.data.chosenListType;
        // } else {
        //     tableColumn.value = ALL.FILTER;
        //     defaultColumnShow.value = "ALL";
        // }
        // 直接用默认的
        tableColumn.value = ALL.FILTER;
        defaultColumnShow.value = "ALL";
        // 如果存在列
        if (tableColumn.value.length > 0) {
            let hasFixed = tableColumn.value.filter(el => el.fixed == 'left');
            checkedColumnFixed.value = hasFixed.length > 0 ? true : false;
            refreshData();
        }
        showColumnSet.value = false;
        if(tableColumn.value.length < 1){
            showColumnSet.value = true;
        }
    }
};

// 列数据统计
let statistics = ref([]);
// 返回的统计数据
let statisticsList = ref([]);
// 格式化统计数据
let formatterStatistics = ref({});

// 其他过滤
let otherFilters = ref([]);

const changeOtherFilters = (e) => {
    otherFilters.value = e;
    refreshData();
}

// 刷新数据
const refreshData = () => {
    // 获取所有列字段
    allFields.value = [];
    // 获取所有列排序
    let findSortFields = [];
    // 获取所有列数据统计
    statistics.value = [];
    // 禁止导出列
    dataExportData.noExportColumns = [];
    tableColumn.value.forEach((el) => {
        // 字段
        allFields.value.push(el.fieldName);
        // 禁止导出列
        if(el.exportable !== undefined && !el.exportable) {
            dataExportData.noExportColumns.push(el.fieldName);
        }
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
    if (advFilter.value != "all" && typeof advFilter.value == 'string') {
        let filterAdvancedFilter = advancedFilter.value.filter(
            (el) => el.layoutConfigId == advFilter.value
        );
        let config = {};
        if(filterAdvancedFilter[0] && filterAdvancedFilter[0].config) {
            config = JSON.parse(filterAdvancedFilter[0].config);
        }
        comQueriesList.value = { ...config };
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
    let findSelected = tableData.value.filter(el => el.isSelected && !el.isCustomDisabled); // 只计算未禁用的选项
    // 是全选
    if (findSelected.length == tableData.value.filter(el => !el.isCustomDisabled).length) { // 计算未禁用的总数
        status = 1;
    }
    // 有选中
    if (findSelected.length > 0 && findSelected.length < tableData.value.filter(el => !el.isCustomDisabled).length) {
        status = 2;
    }
    multipleSelection.value = [...findSelected];
    // 没有任何选中
    return status;
})



// 全选切换
const selectAllChange = (target) => {
    if (target === 'clear') {
        // 取消所有选择
        tableData.value.forEach(el => {
            el.isSelected = false;
        });
        sliceTable.value.forEach(el => {
            el.isSelected = false;
        });
    } else {
        // 全选
        tableData.value.forEach(el => {
            el.isSelected = target == 'all' && !el.isCustomDisabled;
        });
        sliceTable.value.forEach(el => {
            el.isSelected = target == 'all' && !el.isCustomDisabled;
        });
    }
}


// 表格行点击选中
const handleHighlightChangeTable = (row, column) => {

    if(props.listRowClick){
        props.listRowClick(row, column)
    }else {
        emits('onRowClick', row, column);
        if(row.isCustomDisabled){
            return
        }
        row.isSelected = !row.isSelected;
    }
};

// 编辑弹框
let editRefs = ref();
// 引用组件所关联的主表行ID
let myFormEntityId = ref("");

// 获取弹框标题
const getDialogTitle = (row, key) => {
    let customDialogConfigFunc = rowStyleConf.value?.dialogConfig || null;
    if(customDialogConfigFunc){
        let entity = {
            name: entityName.value,
            code: entityCode.value,
            label: queryEntityLabelByName(entityName.value),
        }
        let editTitle = new Function('row', 'entity', customDialogConfigFunc)(row, entity);
        return editTitle[key];
    }
    return {
        editTitle: "",
        detailTitle: "",
    }[key];
}

// 新建
const onAdd = (localDsv, formId, targetEntity, dialogConf) => {
    isOtherEntity.value = false;
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
            !!dialogConf && (tempV.paramDialogConf = dialogConf)
            editRefs.value.openDialog(tempV);
        });
        return
    }
    if(rowStyleConf.value?.actionConf?.newTabOpenNew){
        // 新窗口创建实体
        router.push({
            name: "NewWindowCreateEntity",
            params: {
                entityName: targetEntity || entityName.value,
            },
            query: {
                entity: targetEntity || entityName.value,
                type: "new",
                formId: formId || listParamConf.value.recordNewFormId || rowStyleConf.value?.formConf?.pcAddFormId,
            }
        });
        return
    }
    let tempV = {};
    tempV.entityName = targetEntity || entityName.value;
    tempV.idFieldName = idFieldName.value;
    tempV.formEntityId = "";
    !!localDsv && (tempV.localDsv = localDsv)
    tempV.formId = formId || listParamConf.value.recordNewFormId || rowStyleConf.value?.formConf?.pcAddFormId;
    !!dialogConf && (tempV.paramDialogConf = dialogConf)
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

let isOtherEntity = ref(false);
// 编辑
const onEditRow = (row, localDsv, formId) => {    
    isOtherEntity.value = false;
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
    tempV.customDialogTitle = getDialogTitle(row, 'editTitle');
    tempV.idFieldName = idFieldName.value;
    tempV.formEntityId = myFormEntityId.value;
    tempV.mainDetailField = mainDetailField.value;
    tempV.data = row;
    !!localDsv && (tempV.localDsv = localDsv)
    // !!formId && (tempV.formId = formId)
    tempV.formId = formId || listParamConf.value.recordEditFormId || rowStyleConf.value?.formConf?.pcEditFormId;
    editRefs.value.openDialog(tempV);
};

// 编辑成功后回调
const editConfirm = (e) => {
    if(props.isReferenceComp && e.needCb){
        emits('saveFinishCallBack', e);
    }else {
        getLayoutList();
    }
    customButtonAfterEventCb();
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
    if(props.listRowDblClick) {
        props.listRowDblClick(row)
    }else {
        openDetailDialog(row);
    }
};

// 表格单元格点击
const TableCellClick = (row, column, cell) => {
    emits('onCellClick', row, column, cell)
}
// 自定义详情弹框标题
let customDetailDialogTitle = ref("");
// 打开详情
const openDetailDialog = (row, localDsv, formId) => {
    if (!row) {
        $ElMessage.warning("请先选择数据");
        return;
    }
    customDetailDialogTitle.value = getDialogTitle(row, 'detailTitle');
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
            JSON.stringify(titleWidthForSelf)
        );
    }
};

// 添加快速查询字段

let SelectFieldDialog = ref();
const openSelectFieldDialog = () => {
    SelectFieldDialog.value.openDialog();
};

// 常用查询切换
const changeAdvFilter = (e) => {
    comQueriesList.value = { ...e };
    getTableList();
};

// 立即查询
const queryNow = (e) => {
    queryFilter.value = { ...e };
    getTableList();
};
// 重置高级筛选
const refreshAdvancedQuery = () => {
    queryFilter.value = { equation: "AND", items: [] };
    getTableList();
};

// 导入到出数据
let dataExportData = reactive({
    queryParm: {},
    size: 0,
    total: 0,
    // 禁止导出列
    noExportColumns: [],
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
let ListCommonGroupFilterRefs = ref("");
// 列表分组树过滤组件
let ListTreeGroupFilterRefs = ref("");
let filterEasySql = ref("");
const treeGroupFilter = (e) => {
    ListCommonGroupFilterRefs.value.resetChecked();
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
    ListCommonGroupFilterRefs.value.openSaveDialog(filterEasySql.value);
};

// 常用分组查询点击
const commonGroupFilterNodeClick = (e) => {
    ListTreeGroupFilterRefs.value.resetChecked();
    filterEasySql.value = e;
    getTableList();
};
let recordIds = ref([]);
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
    // 如果默认筛选条件有后置条件
    if(defaultFilter.value.javaScriptVal){
        let { equation, items, javaScriptVal } = JSON.parse(JSON.stringify(defaultFilter.value));
        try {
            let newFilter = new Function('defaultFilter', 'exposed', javaScriptVal)(
                {
                    equation,
                    items,
                },
                {
                    http,
                    isMobile: false,
                },
            );
            // 判断是否是 Promise
            if (newFilter instanceof Promise) {
                newFilter = await newFilter; // 等待异步结果
            }
            // 后续同步判断
            if (newFilter?.equation && newFilter?.items) {
                defaultFilter.value.equation = newFilter.equation;
                defaultFilter.value.items = newFilter.items;
            }
        } catch (error) {
            console.error('执行默认查询后置条件时出错:', error);
        }
    }
    let param = {
        mainEntity: entityName.value,
        fieldsList: allFields.value.join(),
        pageSize: page.size,
        pageNo: page.no,
        filter: JSON.parse(JSON.stringify(queryFilter.value)),
        advFilter: { ...comQueriesList.value },
        sortFields: sortFields.value,
        quickFilter: quickQuery.value,
        builtInFilter: builtInFilter.value,
        statistics: statistics.value,
        filterEasySql: filterEasySql.value,
        defaultFilter: defaultFilter.value,
        otherFilters: otherFilters.value,
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
        param.defaultFilter,
        myModelName.value,
        param.otherFilters
    );
    if (res && res.data) {
        recordIds.value = res.data.dataList.map(item => item[idFieldName.value]);
        let customDisabledFunc = rowStyleConf.value?.rowConf?.rowDisabledRender || null;
        try {
            tableData.value = res.data.dataList.map((el, inx) => {
                try {
                    el.isCustomDisabled = customDisabledFunc ? new Function('row', 'index', 'target', customDisabledFunc)(el, inx, 'pc') : false;
                } catch (error) {
                    console.error('执行 customDisabledFunc 时出错:', error);
                    el.isCustomDisabled = false;
                }
                try {
                    el.btnDisabled = rowStyleConf.value?.rowConf?.rowBtnDisabled ? new Function('row', 'index', 'target', rowStyleConf.value?.rowConf?.rowBtnDisabled)(el, inx, 'pc') : {
                        view: false,
                        edit: false,
                    };
                } catch (error) {
                    console.error('执行 rowStyleConf.value.rowConf.rowBtnDisabled 时出错:', error);
                    el.btnDisabled = {
                        view: false,
                        edit: false,
                    };
                }
                el.isSelected = false;
                return el;
            });
        } catch (error) {
            console.error('处理表格数据时出错:', error);
            tableData.value = [];
        }
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
        let refreshTableList = localStorage.getItem("NewWindowCreateEntity");
        if(refreshTableList && refreshTableList == entityName.value){
            localStorage.removeItem("NewWindowCreateEntity");
            getTableList();
            return
        }
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
        isOtherEntity.value = false;
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

// 设计自定义查询面板
let ListCustomizeQueryRef = ref();
const setCustomizeQueryPanel = () => {
    ListCustomizeQueryRef.value?.openDialog();
}

// 通过检查是否自动打开相关页面 示例文档：https://www.yuque.com/visualdev/melecode/eyvzd0q1bh72ugnm
const checkRouterAutoOpen = () => {
    if(props.isReferenceComp){
        return
    }
    let routeQuery = router.currentRoute.value.query;
    // 自动打开新建
    if(routeQuery.openAddDialog && routeQuery.openAddDialog == '1'){
        onAdd(null, routeQuery.specifyFormId);
        return
    }
    // 自动打开编辑
    if(routeQuery.openEditDialog){
        let row = {};
        row[idFieldName.value] =routeQuery.openEditDialog;
        onEditRow(row, null, routeQuery.specifyFormId);
        return
    }
    // 自动打开详情
    if(routeQuery.openDetailDialog){
        let row = {};
        row[idFieldName.value] =routeQuery.openDetailDialog;
        openDetailDialog(row, null, routeQuery.specifyFormId);
        return
    }
}





/**
 * 导出方法
 */


// 提交审批弹框
let SubmitApprovalDialogRefs = ref();
const openSubmitApprovalDialog = (recordId) => {
    SubmitApprovalDialogRefs.value?.openDialog(recordId)
}
// 提交审批成功
const submitApprovalSuccess = () => {
    getTableList();
    if(listParamConf.value.submitApprovalSuccess){
        listParamConf.value.submitApprovalSuccess();
    }
}
// 执行审批弹框
let MlApproveRefs = ref();
let approverRecordId = ref(null);
const openApprovalDialog = (recordId) => {
    approverRecordId.value = recordId;
    MlApproveRefs.value?.openDialog(recordId)
}
// 审批成功后回调
const ApprovalSuccess = () => {
    getTableList();
    if(listParamConf.value.approvalSuccess){
        listParamConf.value.approvalSuccess();
    }
}

// 重置表格数据
const resetList = () => {
    quickQuery.value = "";
    queryFilter.value = { equation: "AND", items: [] };
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

// 删除行
const toDel = (row) => {
    if(!row){
        ElMessage.warning("请先选择数据")
        return
    }
    let dialogParam = {
        type: 'del',
        pageType: 'list',
        list: [row],
    }
    MoreRefs.value?.allowOpenDialog(null, dialogParam);
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
const toAdd = (localDsv, formId, targetEntity, dialogConf) => {
    onAdd(localDsv, formId, targetEntity, dialogConf);
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


// 打开其他实体详情
const viewToOtherEntity = (recordId, localDsv, formId, customDialogTitle) => {
    customDetailDialogTitle.value = customDialogTitle;
    detailRefs.value.openDialog(recordId, localDsv, formId);
}

// 新建编辑其他实体
const editToOtherEntity = (editParam) => {
    isOtherEntity.value = true;
    editRefs.value.openDialog(editParam);
};

// 获取列表数据
const getTableDataList = () => {
    return sliceTable.value;
}

// 下载文件
const downFile = (url, fileName) => {
    window.open(import.meta.env.VITE_APP_BASE_API + url + "?fileName=" + fileName);
}

// 预览文件
const previewFile = (src) => {
    const previewType = ["docx", "xlsx", "pdf", "pptx"];
    if(previewType.includes(src.split(".").pop())) {
        let url = router.resolve({
            name: "FilePreview",
            query: {
                url: src,
            },
        });
        window.open(url.href);
    }else {
        ElMessage.warning("仅支持：docx、xlsx、pdf、pptx文件预览");
    }
}


defineExpose({
    resetList,
    refreshList,
    getCurEntity,
    getSelectedRow,
    toEdit,
    toAdd,
    toDetail,
    toDel,
    toMoreAction,
    showColumnSetting,
    listMoreSetting,
    saveSubFormListCb,
    editRow,
    viewRow,
    getTableDataList,
    openBatchUpdateDialog,
    openSubmitApprovalDialog,
    openApprovalDialog,
    viewToOtherEntity,
    editToOtherEntity,
    downFile,
    previewFile,
    pageLoading,
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
            min-height: 60px;
            line-height: 32px;
            padding: 14px 20px;
            padding-left: 10px;
            box-sizing: border-box;
            // transition: all 0.3s;
            .toggle-query-box {
                margin-right: 10px;
                cursor: pointer;
                .toggle-query-icon {
                    position: relative;
                    top: 7px;
                }
            }

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
            width: 100%;
            &.showPagination {
                height: calc(100% - 100px);
            }
            display: flex;
            .tree-group-box {
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
            :deep(.el-popper) {
                max-width: 300px;
            }

            // :deep(.el-table__row){
            //     td {
            //         background: initial;
            //     }
            // }
        }
        // &.is-customize-query-panel {
        //     .table-search-box {
        //         height: 104px;
        //     }
        //     .table-div {
        //         height: calc(100% - 144px);
        //     }
        // }
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
    .quick-edit {
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
        .quick-edit {
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
