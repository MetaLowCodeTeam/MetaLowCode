

<template>
    <!-- 实体菜单+列表 -->
    <el-container v-loading="loading" element-loading-text="加载中...">
        <el-aside width="280px">
            <div class="fields-list">
                <div class="fields-list-header">实体列表</div>
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
                            v-for="(field,inx) of entityList"
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
                    <slot name="addbutton"></slot>
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
                            <!-- 需要高亮的 -->
                            <span
                                v-if="column.highlight"
                                class="highlight"
                                @click="goDetial(scope.row)"
                            >{{ scope.row[column.prop] }}</span>
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
                            >{{ scope.row[column.prop][column.needField] }}</span>
                            <!-- 自定义 -->
                            <span v-else-if="column.customSolt === 'whenNum'">
                                <span
                                    v-if="scope.row.whenNum > 0"
                                >{{ formatterWhenNum(scope.row.whenNum) }}</span>
                                <span v-else style="color: #fbbc05;">(无触发动作)</span>
                            </span>
                            <span v-else-if="column.customSolt === 'priority'">
                                <span class="num-span">{{ scope.row.priority }}</span>
                            </span>
                            <!-- 默认 -->
                            <span v-else>{{ scope.row[column.prop]}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="操作" fixed="right" :align="'center'" width="170">
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
                        </template>
                    </el-table-column>
                </el-table>

                <mlPagination
                    :size="page.size"
                    :no="page.no"
                    :total="page.total"
                    @pageChange="pageChange"
                    @handleSizeChange="handleSizeChange"
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
import { ElMessageBox } from "element-plus";
import http from "@/utils/request";
const $TOOL = inject("$TOOL");
const props = defineProps({
    // 实体名称
    entityName: { type: String, default: "" },
    // 字段列表
    fieldsList: { type: String, default: "" },
    // 操作ID
    aciveId: { type: String, default: "" },
    // 自定义表格列
    tableColumn: { type: Array, default: () => [] },
    // 默认排序字段
    defalutSortField: { type: String, default: "" },
    // 默认查询字段
    defaultFilter: { type: String, default: "" },
    // 权限字段
    checkRole: { type: String, default: "" },
    // 查询接口
    queryUrl: { type: String, default: "" },
});
const emit = defineEmits(["goDetial", "actionBtn"]);
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
        fieldName: props.defalutSortField,
        type: "DESC",
    },
]);
onMounted(() => {
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
    let res = await getEntityCodeList(props.entityName);
    if (res) {
        entityList.value = res.data;
        getApprovalList();
    }
    loading.value = false;
};

// 获取右侧流程列表
const getApprovalList = async () => {
    loading.value = true;
    let param = {
        mainEntity: props.entityName,
        fieldsList: props.fieldsList,
        pageSize: page.size,
        pageNo: page.no,
        filter: {
            equation: "AND",
            items: [
                {
                    fieldName: props.defaultFilter,
                    op: "LK",
                    value: keyword.value,
                },
            ],
        },
        sortFields: tableSort.value,
    };
    if (defaultCode.value != "all") {
        param.filter.items[1] = {
            fieldName: "entityCode",
            op: "EQ",
            value: defaultCode.value,
        };
    }
    let res;

    if (props.queryUrl) {
        res = await http.post(props.queryUrl, {
            mainEntity: param.mainEntity,
            fieldsList: param.fieldsList,
            filter: param.filter,
            pageSize: param.pageSize,
            pageNo: param.pageNo,
            sortFields: param.sortFields,
        });
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

    if (res) {
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
            fieldName: props.defalutSortField,
            type: "Desc",
        };
    }

    getApprovalList();
};

// 字段点击触发
const fieldCheck = (item) => {
    defaultCode.value = item.entityCode;
    page.no = 1;
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
            let res = await deleteRecord(row[props.aciveId]);
            loading.value = true;
            if (res) {
                message.success("删除成功");
                getApprovalList();
            }
            loading.value = false;
        })
        .catch(() => {});
};

const goDetial = (row) => {
    emit("goDetial", row);
};

defineExpose({
    getApprovalList,
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
    .fields-list-box {
        height: calc(100% - 80px);
        overflow-y: auto;
        padding: 10px 20px;
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
  