

<template>
    <!-- 实体菜单+列表 -->
    <el-container v-loading="loading" element-loading-text="加载中...">
        <el-aside width="280px">
            <div class="fields-list">
                <div class="fields-list-header">实体列表</div>
                <div class="fields-list-search">
                    <el-input v-model="searchValue" class="no-border" placeholder="输入关键词进行搜索..." clearable/>
                </div>
                <div class="fields-list-box">
                    <el-scrollbar>
                        <div
                            class="fields-list-item text-ellipsis"
                            :class="{'is-active': defaultCode === 'all'}"
                            @click="fieldCheck({
                            label: '全部实体',
                            entityCode: 'all',
                        })"
                            title="全部实体"
                        >全部实体</div>
                        <div
                            class="fields-list-item text-ellipsis"
                            v-for="(field,inx) of entityList.filter(el => allEntityLabel[el.entityCode]?.indexOf(searchValue) > -1)"
                            :key="inx"
                            :class="{'is-active':field.entityCode == defaultCode}"
                            @click="fieldCheck(field)"
                            :title="field.entityCode"
                        >{{ allEntityLabel[field.entityCode] }}</div>
                    </el-scrollbar>
                </div>
            </div>
        </el-aside>

        <el-container class="main-container" style="position: relative;padding-bottom: 50px;">
            <el-header class="props-action-section">
                <span class="section-title">{{ ListTile[entityName] }}</span>
                <div class="section-fr fr">
                    <mlSearchInput
                        v-model="keyword"
                        placeholder="查询"
                        @confirm="getApprovalList"
                        style="margin-right: 10px;"
                    />
                    <slot name="addButton"></slot>
                </div>
            </el-header>
            <el-main>
                <el-table
                    class="ml-el-table"
                    :data="approvalList"
                    style="width: 100%;"
                    stripe
                    ref="meTable"
                    @sort-change="sortChange"
                >
                    <slot name="listcolumn"></slot>
                    <el-table-column
                        v-for="(column,columnInx) of tableColumn"
                        :key="columnInx"
                        :label="column.label"
                        :sortable="column.sortable"
                        :align="column.align"
                        :width="column.width"
                        :formatter="column.formatter"
                    >
                        <template #default="scope">
                            <!-- 需要高亮的 且不要格式化的 -->
                            <span
                                v-if="column.highlight && !column.formatter"
                                class="highlight"
                                @click="goDetail(scope.row)"
                            >{{ scope.row[column.prop] }}</span>
                            <!-- 需要高亮的 且 要格式化的 -->
                            <span
                                v-else-if="column.highlight && column.formatter"
                                class="highlight"
                                @click="goDetail(scope.row)"
                            >{{ column.formatter(scope.row) }}</span>
                            <!-- 不需要高亮 且 需要格式化的 -->
                            <span
                                v-else-if="!column.highlight && !column.elTag && column.formatter"
                            >{{ column.formatter(scope.row)}}</span>
                            <!-- 有状态的 -->
                            <span v-else-if="column.elTag && column.formatter">
                                <el-tag
                                    v-if="column.formatter(scope.row).label"
                                    :type="column.formatter(scope.row).type"
                                    :style="column.styleFn ? column.styleFn(scope.row):{} "
                                    @click="column.clickFn ? column.clickFn(scope.row) : null"
                                >{{ column.formatter(scope.row).label }}</el-tag>
                            </span>
                            <!-- 需要转换实体的 -->
                            <span
                                v-else-if="column.entityCode"
                            >{{ allEntityLabel[scope.row[column.prop]] }}</span>
                            <!-- 需要用是否禁用的 -->
                            <span
                                v-else-if="column.isDisabled"
                                class="enable"
                                :class="['enable',scope.row.isDisabled? 'false' : 'true']"
                            >{{ scope.row[column.prop] ? '否' : '是' }}</span>
                            <!-- 需要转换时间的 -->
                            <span v-else-if="column.fromNow">{{ $fromNow(scope.row[column.prop]) }}</span>
                            <!-- 需要深入拿字段 -->
                            <span
                                v-else-if="column.needField"
                            >{{ scope.row[column.prop] && scope.row[column.prop][column.needField] }}</span>
                            <!-- 自定义 -->
                            <span v-else-if="column.customSlot === 'whenNum'">
                                <span
                                    v-if="scope.row.whenNum > 0"
                                >{{ formatterWhenNum(scope.row.whenNum) }}</span>
                                <span v-else style="color: #fbbc05;">(无触发动作)</span>
                            </span>
                            <span v-else-if="column.customSlot === 'priority'">
                                <span class="num-span">{{ scope.row.priority }}</span>
                            </span>
                            <span v-else-if="column.customSlot === 'switch' && column.isNegation">
                                <el-switch
                                    v-model="scope.row[column.prop]"
                                    :active-value="false"
                                    :inactive-value="true"
                                    @change="changeSwitch(scope.row)"
                                />
                            </span>
                            <span v-else-if="column.customSlot === 'switch' && !column.isNegation">
                                <el-switch
                                    v-model="scope.row[column.prop]"
                                    @change="changeSwitch(scope.row)"
                                />
                            </span>
                            <!-- 默认 -->
                            <span v-else>{{ scope.row[column.prop]}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column
                        label="操作"
                        fixed="right"
                        :align="'center'"
                        :width="actionColumnWidth"
                        key="defalut-btn"
                        v-if="entityName != 'ApprovalTask'"
                    >
                        <template #default="scope">
                            <el-button
                                size="small"
                                type="primary"
                                link
                                :disabled="checkRoleFn(3)"
                                @click="actionBtn('edit',scope.row)"
                            >
                                <span class="mr-3">
                                    <el-icon>
                                        <ElIconEdit />
                                    </el-icon>
                                </span>
                                <span>编辑</span>
                            </el-button>
                            <el-button
                                size="small"
                                link
                                type="primary"
                                :disabled="checkRoleFn(4)"
                                @click="deleteProcess(scope.row)"
                            >
                                <span class="mr-3">
                                    <el-icon>
                                        <ElIconDelete />
                                    </el-icon>
                                </span>
                                <span>删除</span>
                            </el-button>
                            <slot name="appendActionBtn" :scope="scope.row"></slot>
                        </template>
                    </el-table-column>
                    <slot name="activeRow"></slot>
                </el-table>

                <mlPagination
                    :size="page.size"
                    :no="page.no"
                    :total="page.total"
                    @pageChange="pageChange"
                    @handleSizeChange="handleSizeChange"
                    style="background: #f7f7f7;"
                />
            </el-main>
        </el-container>
    </el-container>
</template>

<script setup>
import useCommonStore from "@/store/modules/common";
import { inject, onMounted, reactive, ref } from "vue";
import { $fromNow } from "@/utils/util";
import { storeToRefs } from "pinia";
import { getDataList, deleteRecord, getEntityCodeList } from "@/api/crud";
import { getEntityApprovalTaskList } from "@/api/approval.js";
import { ElMessage, ElMessageBox } from "element-plus";
import http from "@/utils/request";
import { useRouter } from "vue-router";
import trigger from "@/api/trigger.js";
const router = useRouter();
const $TOOL = inject("$TOOL");
const props = defineProps({
    // 实体名称
    entityName: { type: String, default: "" },
    // 字段列表
    fieldsList: { type: String, default: "" },
    // 操作ID
    activeId: { type: String, default: "" },
    // 自定义表格列
    tableColumn: { type: Array, default: () => [] },
    // 默认排序字段
    defaultSortField: { type: String, default: "" },
    // 权限字段
    checkRole: { type: String, default: "" },
    // 查询接口
    queryUrl: { type: String, default: "" },
    // 删除接口
    delUrl: { type: String, default: "" },
    // 默认过滤字段
    fieldName: { type: String, default: "entityCode" },
    approvalTaskType: { type: Number, default: 1 },
    // 操作列宽度
    actionColumnWidth: { type: Number, default: 170 },
    // 固定过滤
    fixedFilter: { type: Object, default: () => [] },
});
const emit = defineEmits([
    "goDetail",
    "actionBtn",
    "changeSwitch",
    "openAddDialog",
]);
const message = inject("$ElMessage");
const ListTile = reactive({
    ApprovalConfig: "审批流程",
    ReportConfig: "模板列表",
    TriggerConfig: "触发器",
});
const { allEntityLabel } = storeToRefs(useCommonStore());
// 加载状态
let loading = ref(false);
// 默认值
let defaultCode = ref("all");
// 实体列表
let entityList = ref([]);
// 所有实体CODE
let allEntityCode = ref([]);
// 流程列表
let approvalList = ref([]);
// 搜索值
let keyword = ref("");
let page = reactive({
    size: 20,
    no: 1,
    total: 0,
});
// 排序值
let tableSort = ref([
    {
        fieldName: props.defaultSortField,
        type: "DESC",
    },
]);

let searchValue = ref("");

let appAbbr = ref("");

onMounted(() => {
    appAbbr.value = router.currentRoute.value.query.appAbbr;
    // console.log(defaultCode.value,'defaultCode.value')
    // defaultCode.value = ""
    getEntityList();
});

// 权限校验
const checkRoleFn = (num) => {
    if (!props.checkRole) {
        return false;
    }
    return !$TOOL.checkRole(props.checkRole + "-" + num);
};

// 获取左侧实体列表
const getEntityList = async () => {
    loading.value = true;
    let res;
    if (props.entityName == "ApprovalTask") {
        res = await getEntityApprovalTaskList(
            props.entityName,
            props.approvalTaskType
        );
    } else {
        res = await getEntityCodeList(props.entityName, appAbbr.value);
    }

    if (res) {
        entityList.value = res.data;
        allEntityCode.value = res.data.map((el) => el.entityCode + "");
        if (router.currentRoute.value.query.entityCode) {
            defaultCode.value = router.currentRoute.value.query.entityCode;
            if (!allEntityCode.value.includes(defaultCode.value)) {
                emit("openAddDialog");
            }
        }
        getApprovalList();
    }
    loading.value = false;
};

// 获取右侧流程列表
const getApprovalList = async () => {
    loading.value = true;
    let { fieldName, fixedFilter } = props;
    let param = {
        mainEntity: props.entityName,
        fieldsList: props.fieldsList,
        pageSize: page.size,
        pageNo: page.no,
        filter: {
            equation: "AND",
            items: [],
        },
        sortFields: tableSort.value,
    };
    if(fixedFilter) {
        param.filter.items = param.filter.items.concat(fixedFilter);
    }
    if (keyword.value && fieldName) {
        let newFieldName = fieldName.split(",");
        newFieldName.forEach(el => {
            param.filter.items.unshift({
                fieldName: el,
                op: "LK",
                value: keyword.value,
            });
        });
	}
    if (defaultCode.value != "all") {
        param.filter.items.push({
            fieldName: props.entityName == 'ApprovalTask' ? 'approvalConfigId.entityCode' : 'entityCode',
            op: "EQ",
            value: defaultCode.value,
        });
    }
    let res;
    let params = {};
    if(props.entityName == 'ApprovalTask') {
        params = {
            type: props.approvalTaskType,
        }
    }
    if (props.queryUrl) {
        res = await http.post(props.queryUrl, {
            mainEntity: param.mainEntity,
            fieldsList: param.fieldsList,
            filter: param.filter,
            pageSize: param.pageSize,
            pageNo: param.pageNo,
            sortFields: param.sortFields,
        }, {params});
    } else {
        res = await getDataList(
            param.mainEntity,
            param.fieldsList,
            param.filter,
            param.pageSize,
            param.pageNo,
            param.sortFields
        );
    }

    if (res && res.data) {
        approvalList.value = res.data.dataList;
        page.total = res.data.pagination.total;
    }
    loading.value = false;
};

// 添加流程
const actionBtn = (target, row) => {
    emit("actionBtn", {
        target,
        row,
    });
};

// 分页切换
const pageChange = (v) => {
    page.no = v;
    getApprovalList();
};

const handleSizeChange = (size) => {
    page.size = size;
    getApprovalList();
};

// 表格排序
const sortChange = (column, prop, order) => {
    let sortType;
    if (column.order && column.order === "ascending") {
        sortType = "ASC";
        tableSort.value[0] = {
            fieldName: column.prop,
            type: sortType,
        };
    } else if (column.order && column.order === "descending") {
        sortType = "DESC";
        tableSort.value[0] = {
            fieldName: column.prop,
            type: sortType,
        };
    } else {
        sortType = "";
        tableSort.value[0] = {
            fieldName: props.defaultSortField,
            type: "Desc",
        };
    }

    getApprovalList();
};

// 字段点击触发
const fieldCheck = (item) => {
    defaultCode.value = item.entityCode;
    page.no = 1;
    if (router.currentRoute.value.query.entityCode) {
        let url = new URL(window.location.href);
        let params = url.searchParams;
        params.delete('entityCode'); // 删除 entityCode 参数
        window.history.replaceState({}, "", `${url.pathname}${url.search}`);
    }
    getApprovalList();
};

// 触发动作合集
let actionList = ref([
    {
        label: "新建",
        code: 2,
    },
    {
        label: "删除",
        code: 4,
    },
    {
        label: "更新",
        code: 8,
        span: 18,
    },
    {
        label: "分配",
        code: 16,
    },
    {
        label: "共享",
        code: 32,
    },
    {
        label: "取消共享",
        code: 64,
        span: 18,
    },
    {
        label: "审批通过",
        code: 128,
    },
    {
        label: "审批撤销",
        code: 256,
    },
    {
        label: "审批提交",
        code: 1024,
    },
    {
        label: "审批驳回/撤回",
        code: 2048,
        span: 15,
    },
    {
        label: "定期执行",
        code: 512,
    },
]);

// 格式化触发动作
const formatterWhenNum = (whenNum) => {
    let actions = [];
    actionList.value.forEach((el) => {
        if ((whenNum & el.code) > 0) {
            actions.push(el.label);
        }
    });
    return `当 ${actions.join("/")} 时`;
};

// 删除流程
const deleteProcess = (row) => {
    ElMessageBox.confirm("是否确认删除?", "提示：", {
        confirmButtonText: "确认",
        cancelButtonText: "取消",
        type: "warning",
    })
        .then(async () => {
            loading.value = true;
            let res;
            if(props.delUrl) {
                res = await http.get(props.delUrl, {
                    recordId: row[props.activeId],
                });
            }else if(props.entityName == 'TriggerConfig'){
                res = await trigger.detail.triggerDelete(row[props.activeId]);
            }else {
                res = await deleteRecord(row[props.activeId]);
            }
            if (res) {
                message.success("删除成功");
                getEntityList();
            }
            loading.value = false;
        })
        .catch(() => {});
};

const goDetail = (row) => {
    emit("goDetail", row);
};

const changeSwitch = (row) => {
    emit("changeSwitch", row);
};

defineExpose({
    getEntityList,
    defaultCode,
});
</script>

<style lang="scss" scoped>
.main-container {
    min-width: 720px;
    border-left: 2px solid #eeeeee;
    background: #ffffff;
    font-size: 14px;
}

.el-aside {
    background-color: #ffffff;
}

.fields-list {
    height: 100%;
    .fields-list-header {
        font-size: 14px;
        height: 54px;
        line-height: 54px;
        border-bottom: 1px dashed #eeeeee;
        padding-left: 20px;
    }
    .fields-list-search {
        padding: 5px 10px;
        height: 42px;
        box-sizing: border-box;
        border-bottom: 1px solid #eeeeee;
    }
    .fields-list-box {
        height: calc(100% - 97px);
        overflow-y: auto;
        // padding: 10px 20px;
        font-size: 14px;
        .fields-list-item {
            height: 36px;
            line-height: 36px;
            cursor: pointer;
            border-radius: 2px;
            padding: 0 20px;
            &:hover {
                background: #eee;
            }
            &.is-active {
                background: var(--el-color-primary);
                color: #fff;
            }
        }
    }
}

.props-action-section {
    .section-title {
        font-size: 16px;
    }
}

.enable {
    display: inline-block;
    width: 28px;
    height: 20px;
    line-height: 20px;
    font-size: 12px;
    &.true {
        background: #34a853;
        color: #fff;
    }
    &.false {
        background: #ccc;
        color: #212529;
    }
}
</style>
