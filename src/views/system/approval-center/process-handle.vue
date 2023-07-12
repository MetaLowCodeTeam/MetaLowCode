<template>
    <el-container v-loading="loading" element-loading-text="加载中...">
        <el-main>
            <el-table
                class="ml-el-table"
                :data="handleList"
                style="width: 100%;"
                :border="true"
                ref="meTable"
            >
                <!-- <el-table-column label="名称" prop="flowName" sortable>
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
                        <el-button size="small" type="danger" @click="deleteProcess(scope.row)">删除</el-button>
                    </template>
                </el-table-column>-->
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

// 分页切换
const pageChange = (page) => {
    page.on = page;
}
</script>

<style>
</style>