<template>
    <mlSingleList
        ref="mlSingleListRef"
        title="岗位"
        mainEntity="JobPosition"
        fieldsList="jobTitle,department,displayOrder,createdBy,createdOn"
        :sortFields="sortFields"
        fieldName="jobTitle"
        :tableColumn="tableColumn"
        @highlightClick="highlightClick"
        @changeSwitch="changeSwitch"
    >
        <template #addButton>
            <el-button type="primary" @click="addClick" :disabled="!$TOOL.checkRole('r24-3')">
                <el-icon size="14">
                    <ElIconPlus />
                </el-icon>
                <span class="ml-5">添加</span>
            </el-button>
        </template>
        <template #activeRow>
            <el-table-column label="操作" :align="'center'" width="140" fixed="right">
                <template #default="scope">
                    <el-button size="small" type="primary" link @click="editClick(scope.row)" :disabled="!$TOOL.checkRole('r24-3')">
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
                        @click="delClick(scope.row)"
                        :disabled="!$TOOL.checkRole('r24-4')"
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
        </template>
    </mlSingleList>
    <mlCustomEdit ref="editRefs" @saveFinishCallBack="onRefresh" nameFieldName="jobTitle"/>
    <!-- 列表详情 -->
    <ListDetail
        ref="mlListDetailsRefs"
        idFieldName="jobPositionId"
        nameFieldName="jobTitle"
        @onRefresh="onRefresh"
        isJobPosition
    />
</template>

<script setup>
import { ref, inject } from "vue";
import { $fromNow } from "@/utils/util";
import { ElMessageBox, ElMessage } from "element-plus";
import mlCustomEdit from '@/components/mlCustomEdit/index.vue';
import ListDetail from "./components/ListDetail.vue";
import { deleteRecord } from "@/api/crud";
const $TOOL = inject("$TOOL");
// 默认排序
let sortFields = ref([
    {
        fieldName: "createdBy",
        type: "DESC",
    },
]);
let tableColumn = ref([
    {
        prop: "jobTitle",
        label: "岗位名称",
        highlight: true,
    },
    {
        prop: "department",
        label: "部门",
        formatter: (row) => {
            return row.department?.name;
        },
    },
    {
        prop: "createdOn",
        label: "创建时间",
        formatter: (row) => {
            return $fromNow(row.createdOn);
        },
    },
    {
        prop: "createdBy",
        label: "创建用户",
        formatter: (row) => {
            return row.createdBy.name;
        },
    },  
]);

// 编辑弹框
let editRefs = ref();
const addClick = () => {
    let tempV = {};
    tempV.entityName = "JobPosition";
    editRefs.value.openDialog(tempV);
};
// 编辑
const editClick = (row) => {
    let tempV = {};
    tempV.detailId = row.jobPositionId;
    editRefs.value.openDialog(tempV);
};

let mlSingleListRef = ref();
// 删除
const delClick = (row) => {
    ElMessageBox.confirm("是否确认删除?", "提示：", {
        confirmButtonText: "确认",
        cancelButtonText: "取消",
        type: "warning",
    })
        .then(async () => {
            let res = await deleteRecord(row.jobPositionId);
            mlSingleListRef.value.loading = true;
            if (res) {
                ElMessage.success("删除成功");
                mlSingleListRef.value.getTableList();
            }
            mlSingleListRef.value.loading = false;
        })
        .catch(() => {});
};

const onRefresh = () => {
    mlSingleListRef.value.getTableList();
};

// 详情组件
let mlListDetailsRefs = ref();

// 高亮字段点击
const highlightClick = (row) => {
    mlListDetailsRefs.value.openDetailDialog(row.jobPositionId, row.jobTitle);
};

// 当前页签
// let cutTab = ref("");
</script>

<style lang="scss" scoped>
</style>
