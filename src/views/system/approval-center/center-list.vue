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
                <el-button type="primary">
                    <el-icon size="14" class="mr-3">
                        <ElIconPlus />
                    </el-icon>添加
                </el-button>
            </div>
        </el-header>

        <el-main>
            <el-table
                class="ml-el-table"
                :data="handleList"
                style="width: 100%;"
                :border="true"
                ref="meTable"
            >
                <el-table-column prop="v1" label="流程名称"></el-table-column>
                <el-table-column prop="v2" label="关联记录"></el-table-column>
                <el-table-column prop="v3" label="最近审核人"></el-table-column>
                <el-table-column prop="v4" label="最近审批时间"></el-table-column>
                <el-table-column prop="v5" label="最近审批备注"></el-table-column>
                <el-table-column prop="v6" label="审批状态"></el-table-column>
                <el-table-column label="操作" :align="'center'" width="150">
                    <template #default="scope">
                        <el-button size="small" @click="editRow('edit',scope.row)">编辑</el-button>
                        <el-button size="small" type="danger" @click="deleteRow(scope.row)">删除</el-button>
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
</template>
  
<script setup>
import { reactive, ref } from "vue";
import { Search } from "@element-plus/icons-vue";
const props = defineProps({
    type: { type: String, default: "" },
});
let pageType = reactive({
    handle:{
        title:"待我处理",
    },
    submit:{
        title:"我提交的",
    },
    cc:{
        title:"抄送我的",
    },
})
// 加载状态
let loading = ref(false);
// 待我处理列表
let handleList = ref([]);
// 分页
let page = reactive({
    no: 1,
    sizes: 10,
    total: 0,
});

const editRow = (target, row) => {
    console.log("编辑");
};

const deleteRow = (row) => {};

// 分页切换
const pageChange = (page) => {
    page.on = page;
};

// 获取数据列表
const getCenterList = () => {};
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