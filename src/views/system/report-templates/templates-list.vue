<template>
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
                        :title="field.label"
                    >{{ field.label }}</div>
                </div>
            </div>
        </el-aside>

        <el-container class="main-container">
            <el-header class="props-action-section">
                <span class="section-title">审批流程</span>
                <div class="section-fr fr">
                    <el-input
                        class="section-search"
                        v-model="keyword"
                        placeholder="查询"
                        :suffix-icon="Search"
                        @keyup.enter="getApprovalList"
                    ></el-input>
                    <el-dropdown
                        split-button
                        type="primary"
                        @click="editApproval('add')"
                        @command="referral"
                    >
                        <el-icon size="14">
                            <ElIconPlus />
                        </el-icon>
                        <span class="ml-5">添加</span>
                        <template #dropdown>
                            <el-dropdown-menu>
                                <el-dropdown-item command="referral">
                                    <el-icon>
                                        <ElIconAvatar />
                                    </el-icon>
                                    <span class="ml-5">批量转审</span>
                                </el-dropdown-item>
                            </el-dropdown-menu>
                        </template>
                    </el-dropdown>
                </div>
            </el-header>

            <el-main>
                <el-table
                    class="ml-el-table"
                    :data="approvalList"
                    stripe
                    style="width: 100%;"
                    ref="meTable"
                    @sort-change="sortChange"
                >
                    <el-table-column label="名称" prop="flowName" sortable>
                        <template #default="scope">
                            <span
                                class="highlight"
                                @click="goDetial(scope.row)"
                            >{{ scope.row.flowName }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column sortable prop="entityCode" label="应用实体">
                        <template #default="scope">{{ entityLable[scope.row.entityCode] }}</template>
                    </el-table-column>
                    <el-table-column label="运行中的流程统计" prop="runningTotal" :align="'center'"></el-table-column>
                    <el-table-column label="结束的流程统计" prop="completeTotal" :align="'center'"></el-table-column>
                    <el-table-column label="启用" :align="'center'" width="60">
                        <template #default="scope">
                            <span class="enable false" v-if="scope.row.isDisabled">否</span>
                            <span class="enable true" v-else>是</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="createdOn" label="修改时间" :align="'center'" width="100">
                        <template #default="scope">{{ $fromNow(scope.row.modifiedOn) }}</template>
                    </el-table-column>

                    <el-table-column label="操作" :align="'center'" width="150">
                        <template #default="scope">
                            <el-button size="small" @click="editApproval('edit',scope.row)">编辑</el-button>
                            <el-button
                                size="small"
                                type="danger"
                                @click="deleteProcess(scope.row)"
                            >删除</el-button>
                        </template>
                    </el-table-column>
                </el-table>
                <div class="table-footer">
                    <mlPagination
                        :no="page.no"
                        :total="page.total"
                        :sizes="page.sizes"
                        @pageChange="pageChange"
                    />
                </div>
            </el-main>
        </el-container>
        <EditApprovalDialog
            v-model="dialogIsShow"
            :entityList="entityList"
            :dialogForm="dialogForm"
            @saveProcess="saveProcess"
        />
    </el-container>
</template>
  
<script setup>
import useCommonStore from "@/sotre/modules/common";
import { inject, onMounted, reactive, ref } from "vue";
import { Search } from "@element-plus/icons-vue";
import { useRouter } from "vue-router";
import { $fromNow } from "@/utils/util";
import { storeToRefs } from "pinia";
import EditApprovalDialog from "./templates-edit.vue";
import { getDataList, deleteRecord } from "@/api/crud";
const message = inject("$ElMessage");
const api = inject("$API");
const router = useRouter();
const { entityLable } = storeToRefs(useCommonStore());
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
    size: 10,
    no: 1,
    total: 0,
});
// 排序值
let tableSort = ref([
    {
        fieldName: "modifiedOn",
        type: "DESC",
    },
]);
// 编辑弹框
let dialogIsShow = ref(false);
let dialogForm = reactive({
    title: "添加审批流程",
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
    let res = await api.approval.list.getEntityList();
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
        mainEntity: "ApprovalConfig",
        fieldsList:
            "entityCode,flowName,modifiedOn,isDisabled,runningTotal,completeTotal",
        pageSize: page.size,
        pageNo: page.no,
        filter: {},
        sortFields: tableSort.value,
    };
    if (defaultCode.value != "all") {
        param.filter = {
            equation: "AND",
            items: [
                {
                    fieldName: "entityCode",
                    op: "EQ",
                    value: defaultCode.value,
                },
            ],
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
        dialogForm.title = "添加审批流程";
        dialogForm.form = {};
        dialogForm.type = "add";
    } else {
        dialogForm.title = "编辑审批流程";
        dialogForm.type = "edit";
        dialogForm.form = { ...row };
    }
};

// 批量转审
const referral = () => {
    console.log("批量转审");
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
    } else if (column.order && column.order === "descending") {
        sortType = "DESC";
    } else {
        sortType = "";
    }
    tableSort.value[1] = {
        fieldName: column.prop,
        type: sortType,
    };
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

const deleteProcess = async (row) => {
    let res = await deleteRecord(row.approvalConfigId);
    loading.value = true;
    if (res.code === 200) {
        message.success("删除成功");
        getApprovalList();
    } else {
        loading.value = false;
        message.error("删除失败：" + res.error);
    }
};

const goDetial = (row) => {
    router.push({
        path: "/process-detail",
        query: {
            approvalConfigId: row.approvalConfigId,
        },
    });
};
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
.table-footer {
    height: 41px;
    line-height: 41px;
    background: #f7f7f7;
    border: 1px solid #ebeef5;
    border-top: 0;
    padding: 0 12px;
    font-size: 13px;
    color: #616161;
    justify-content: center;
}
</style>
  