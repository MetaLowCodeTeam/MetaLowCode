

<template>
    <!-- 实体菜单+列表 -->
    <el-container v-loading="loading" element-loading-text="加载中...">
        <el-aside width="280px">
            <div class="fields-list">
                <div class="fields-list-header">实体列表</div>
                <div class="fields-list-box">
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
                    >{{ entityLable[field.entityCode] }}</div>
                </div>
            </div>
        </el-aside>

        <el-container class="main-container" style="position: relative;padding-bottom: 50px;">
            <el-header class="props-action-section">
                <span class="section-title">{{ ListTile[entityName] }}</span>
                <div class="section-fr fr">
                    <mlSearchInput
                        class="section-search"
                        v-model="keyword"
                        placeholder="查询"
                        @confirm="getApprovalList"
                    />
                    <slot name="addbutton" text="我是子组件小猪课堂"></slot>
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
                            >{{ entityLable[scope.row[column.prop]] }}</span>
                            <!-- 需要用是否禁用的 -->
                            <span
                                v-else-if="column.isDisabled"
                                class="enable"
                                :class="['enable',scope.row.isDisabled? 'false' : 'true']"
                            >{{ scope.row[column.prop] ? '否' : '是' }}</span>
                            <!-- 需要转换时间的 -->
                            <span v-else-if="column.fromNow">{{ $fromNow(scope.row[column.prop]) }}</span>
                            <!-- 需要深入拿字段 -->
                            <span v-else-if="column.needField">{{ scope.row[column.prop][column.needField] }}</span>
                            <!-- 自定义 -->
                            <span v-else-if="column.customSolt === 'actionContent'">
                                <span v-if="scope.row.actionContent">{{ scope.row.actionContent }}</span>
                                <span v-else style="color: #fbbc05;">(无触发动作)</span>
                            </span>
                            <!-- 默认 -->
                            <span v-else>{{ scope.row[column.prop]}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="操作" :align="'center'" width="170">
                        <template #default="scope">
                            <el-button size="small" @click="editApproval('edit',scope.row)">
                                <span class="mr-3">
                                    <el-icon>
                                        <Edit />
                                    </el-icon>
                                </span>
                                <span>编辑</span>
                            </el-button>
                            <el-button
                                class="ml-delete-btn"
                                size="small"
                                @click="deleteProcess(scope.row)"
                            >
                                <span class="mr-3">
                                    <el-icon color="#f56c6c">
                                        <Delete />
                                    </el-icon>
                                </span>
                                <span style="color: #f56c6c;">删除</span>
                            </el-button>
                        </template>
                    </el-table-column>
                </el-table>
                <mlPagination :no="page.no" :total="page.total" @pageChange="pageChange" />
            </el-main>
        </el-container>
        <mlActiveDialog
            v-model="dialogIsShow"
            :entityList="approveDialogEntityList"
            :dialogForm="dialogForm"
            @saveProcess="saveProcess"
            :saveEntity="entityName"
            :saveIdCode="aciveId"
            :checkCodes="checkCodes"
            :codeErrMsg="codeErrMsg"
            :disabledTip="disabledTip"
            :showFormItem="showFormItem"
            :fromEntityLabel="fromEntityLabel"
        >
            <template #formitem="{dialogForm}">
                <slot name="formitem" :dialogForm="dialogForm"></slot>
            </template>
        </mlActiveDialog>
    </el-container>
</template>
  
<script setup>
import useCommonStore from "@/store/modules/common";
import { inject, onMounted, reactive, ref } from "vue";
import { Search, Delete, Edit } from "@element-plus/icons-vue";

import { $fromNow } from "@/utils/util";
import { storeToRefs } from "pinia";
import { getDataList, deleteRecord, getEntityCodeList } from "@/api/crud";
import { ElMessageBox } from "element-plus";
const props = defineProps({
    // 实体名称
    entityName: { type: String, default: "" },
    // 字段列表
    fieldsList: { type: String, default: "" },
    // 操作ID
    aciveId: { type: String, default: "" },
    // 编辑弹框检测code
    checkCodes: { type: Array, default: () => [] },
    // 编辑弹框错误msg
    codeErrMsg: { type: Array, default: () => [] },
    // 编辑框显示的输入框
    showFormItem: { type: Array, default: () => [] },
    // 编辑弹框禁用tip
    disabledTip: { type: String, default: "" },
    // 编辑框框选择实体的label
    fromEntityLabel: { type: String, default: "选择应用实体" },
    // 自定义表格列
    tableColumn: { type: Array, default: () => [] },
    // 默认排序字段
    defalutSortField: { type: String, default: "" },
    // 默认查询字段
    defaultFilter: { type: String, default: "" },
});
const emit = defineEmits(["goDetial"]);
const message = inject("$ElMessage");
const api = inject("$API");
const ListTile = reactive({
    ApprovalConfig: "审批流程",
    ReportConfig: "模板列表",
    TriggerConfig: "触发器",
});
const { entityLable, approveDialogEntityList } = storeToRefs(useCommonStore());
const { getEntityLable } = useCommonStore();
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
// 编辑弹框
let dialogIsShow = ref(false);
let dialogForm = reactive({
    title: "",
    type: "add",
    form: {},
});
onMounted(() => {
    getEntityList();
    if (JSON.stringify(entityLable.value) == "{}") {
        getEntityLable();
    }
});

// 获取左侧实体列表
const getEntityList = async () => {
    loading.value = true;
    let res = await getEntityCodeList(props.entityName);
    if (res.code === 200) {
        entityList.value = res.data;
        getApprovalList();
    } else {
        loading.value = false;
        message.error("获取实体列表数据失败：" + res.error);
    }
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
    let res = await getDataList(
        param.mainEntity,
        param.fieldsList,
        param.filter,
        param.pageSize,
        param.pageNo,
        param.sortFields
    );
    if (res.code === 200) {
        approvalList.value = res.data.dataList;
        page.total = res.data.pagination.total;
        loading.value = false;
    } else {
        loading.value = false;
        message.error("获取实体列表数据失败：" + res.error);
    }
};

// 添加流程
const editApproval = (target, row) => {
    dialogIsShow.value = true;
    if (target === "add") {
        dialogForm.title = "添加" + ListTile[props.entityName];
        dialogForm.form = {};
        dialogForm.type = "add";
    } else {
        dialogForm.title = "编辑" + ListTile[props.entityName];
        dialogForm.type = "edit";
        dialogForm.form = { ...row };
    }
};

// 分页切换
const pageChange = (v) => {
    page.no = v;
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

// 保存流程
const saveProcess = async (val) => {
    if (val) {
        goDetial(val);
    } else {
        getApprovalList();
    }
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
            if (res.code === 200) {
                message.success("删除成功");
                getApprovalList();
            } else {
                loading.value = false;
                message.error("删除失败：" + res.error);
            }
        })
        .catch(() => {});
};

const goDetial = (row) => {
    emit("goDetial", row);
};
defineExpose({
    editApproval,
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
        height: calc(100% - 55px);
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
    .section-fr {
        .section-search {
            display: inline-block;
            width: 224px;
        }
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
  