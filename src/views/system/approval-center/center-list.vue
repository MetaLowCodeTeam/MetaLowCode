<template>
    <el-container v-loading="loading" element-loading-text="加载中..." class="one-list">
        <el-header class="props-action-section">
            <span class="section-title">{{ pageType[type].title }}</span>
            <div class="section-fr fr">
                <el-input
                    class="section-search"
                    v-model="keyword"
                    placeholder="查询"
                    :suffix-icon="Search"
                    @keyup.enter="getCenterList"
                ></el-input>
            </div>
        </el-header>

        <el-main style="position: relative;">
            <el-table
                class="ml-el-table"
                :data="approvalList"
                style="width: 100%;"
                :border="true"
                ref="meTable"
            >
                <el-table-column prop="approvalConfigId.flowName" label="流程名称"></el-table-column>
                <el-table-column prop="entityId" label="关联记录"></el-table-column>
                <el-table-column prop="approver" label="最近审核人"></el-table-column>
                <el-table-column prop="remark" label="最近审批备注"></el-table-column>
                <el-table-column label="最近审批时间" :align="'center'" width="150">
                    <template #default="scope">{{ $fromNow(scope.row.approvalOn) }}</template>
                </el-table-column>
                <el-table-column label="审批状态" :align="'center'" width="150">
                    <template #default="scope">{{ scope.row.approvalStatus.label }}</template>
                </el-table-column>
                <el-table-column label="操作" :align="'center'" width="100">
                    <template #default="scope">
                        <el-button size="small" @click="approveRow(scope.row)">审批</el-button>
                    </template>
                </el-table-column>
            </el-table>
            <mlPagination :no="page.no" :total="page.total" @pageChange="pageChange" />
        </el-main>
        <mlApprove v-model="approveDialogIsShow" :taskId="approvalTaskId" title="审批"/>
    </el-container>
</template>
  
<script setup>
import { onMounted, reactive, ref, inject } from "vue";
import { Search } from "@element-plus/icons-vue";
import { getDataList } from "@/api/crud";
import { $fromNow } from "@/utils/util";
import mlApprove from '@/components/mlApprove/index.vue'
const message = inject("$ElMessage");
const props = defineProps({
    type: { type: String, default: "" },
});
let pageType = reactive({
    handle: {
        title: "待我处理",
    },
    submit: {
        title: "我提交的",
    },
    cc: {
        title: "抄送我的",
    },
});
// 加载状态
let loading = ref(false);
// 流程列表
let approvalList = ref([]);
let keyword = ref("");
// 分页
let page = reactive({
    no: 1,
    size: 20,
    total: 0,
});
// 审核弹框是否显示
let approveDialogIsShow = ref(false);
// 审批任务Id
let approvalTaskId = ref("");
// 默认排序
let tableSort = ref([
    {
        fieldName: "modifiedOn",
        type: "DESC",
    },
]);
onMounted(() => {
    getCenterList();
});

const approveRow = (row) => {
    approveDialogIsShow.value = true;
    approvalTaskId.value = row.approveDialogIsShow;
};



// 分页切换
const pageChange = (page) => {
    page.on = page;
};

// 获取数据列表
const getCenterList = async () => {
    loading.value = true;
    let param = {
        mainEntity: "ApprovalTask",
        fieldsList:
            "approvalTaskId,approvalConfigId,entityId,approvalOn,remark,approvalStatus",
        pageSize: page.size,
        pageNo: page.no,
        filter: {
            equation: "AND",
            items: [
                {
                    fieldName: "approvalConfigId.flowName",
                    op: "LK",
                    value: keyword.value,
                },
            ],
        },
        sortFields: tableSort.value,
    };

    // if (defaultCode.value != "all") {
    //     param.filter.items[1] = {
    //         fieldName: "entityCode",
    //         op: "EQ",
    //         value: defaultCode.value,
    //     };
    // }
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
</script>
<style lang="scss" scoped>
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
</style>