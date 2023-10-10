<template>
    <mlSingleList
        ref="mlSingleListRef"
        title="团队"
        mainEntity="Team"
        fieldsList="teamName,createdBy,createdOn,teamId,disabled"
        :sortFields="sortFields"
        fieldName="teamName"
        :tableColumn="tableColumn"
        :filterItems="filterItems"
        @highlightClick="highlightClick"
    >
        <template #addbutton>
            <el-button type="primary" @click="addClick">
                <el-icon size="14">
                    <ElIconPlus />
                </el-icon>
                <span class="ml-5">添加</span>
            </el-button>
        </template>
        <template #activeRow>
            <el-table-column label="操作" :align="'center'" width="140" fixed="right">
                <template #default="scope">
                    <el-button size="small" type="primary" link @click="editClick(scope.row)">
                        <span class="mr-3">
                            <el-icon>
                                <ElIconEdit />
                            </el-icon>
                        </span>
                        <span>编辑</span>
                    </el-button>
                    <el-button size="small" link type="primary" @click="delCick(scope.row)">
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
    <Edit ref="editRefs" @onConfirm="onRefresh" />
    <!-- 列表详情 -->
    <mlListDetails ref="mlListDetailsRefs" @tabChange="tabChange" titleFromApi="teamName">
        <template #tab>
            <div>你好</div>
        </template>
        <template #operate="{row}">
            <el-button icon="Plus">添加成员</el-button>
            <el-button icon="Edit" @click="editClick(row,'dialog')">编辑</el-button>
            <el-dropdown trigger="click">
                <el-button>
                    更多
                    <el-icon style="transform: rotate(90deg);">
                        <ElIconMoreFilled />
                    </el-icon>
                </el-button>
                <template #dropdown>
                    <el-dropdown-menu>
                        <el-dropdown-item>
                            <span @click="delCick({teamId:row.id})">删除</span>
                        </el-dropdown-item>
                    </el-dropdown-menu>
                </template>
            </el-dropdown>
        </template>
    </mlListDetails>
</template>
   
<script setup>
import { ref, inject, reactive } from "vue";
import { $fromNow } from "@/utils/util";
import { saveRecord, deleteRecord } from "@/api/crud";
import { ElMessageBox } from "element-plus";
import { useRouter } from "vue-router";
const router = useRouter();
const $ElMessage = inject("$ElMessage");
import Edit from "@/views/customize-menu/edit.vue";
// 默认排序
let sortFields = ref([
    {
        fieldName: "createdBy",
        type: "DESC",
    },
]);
// 过滤条件
let filterItems = ref([]);
let tableColumn = ref([
    {
        prop: "teamName",
        label: "名称",
        highlight: true,
    },

    {
        prop: "createdOn",
        label: "创建时间",
        formatter: (row) => {
            return $fromNow(row.createdOn);
        },
    },
    {
        prop: "createdBy.name",
        label: "创建用户",
        formatter: (row) => {
            return row.createdBy?.name;
        },
    },
]);

// 编辑弹框
let editRefs = ref();

const addClick = () => {
    let tempV = {};
    tempV.dialogTitle = "新建团队";
    tempV.entityName = "Team";
    editRefs.value.openDialog(tempV);
};
// 是否弹框调用
let isDialogCallEdit = ref(false);
// 编辑
const editClick = (row, target) => {
    if (target == "dialog") {
        isDialogCallEdit.value = true;
    }
    let tempV = { ...row };
    tempV.dialogTitle = "编辑" + row.teamName;
    tempV.entityName = "Team";
    tempV.detailId = row.teamId;
    editRefs.value.openDialog(tempV);
};
// 删除
const delCick = (row) => {
    ElMessageBox.confirm("是否确认删除?", "提示：", {
        confirmButtonText: "确认",
        cancelButtonText: "取消",
        type: "warning",
    })
        .then(async () => {
            let res = await deleteRecord(row.teamId);
            mlSingleListRef.value.loading = true;
            if (res) {
                $ElMessage.success("删除成功");
                mlSingleListRef.value.getTableList();
                mlListDetailsRefs.value.closeDialog();
            }
            mlSingleListRef.value.loading = false;
        })
        .catch(() => {});
};

let mlSingleListRef = ref();
const onRefresh = () => {
    mlSingleListRef.value.getTableList();
    if (isDialogCallEdit.value) {
        mlListDetailsRefs.value.refresh();
        isDialogCallEdit.value = false;
    }
};

// 详情组件
let mlListDetailsRefs = ref();

// 高亮字段点击
const highlightClick = (row) => {
    mlListDetailsRefs.value.openDialog({
        title: row.teamName,
        id: row.teamId,
        entityName: "Team",
        tabs: [
            {
                label: "成员列表",
                name: "memberList",
            },
        ],
    });
};

// 页签切换
const tabChange = (tab) => {
    console.log(tab);
};
</script>
