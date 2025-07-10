<template>
    <el-container direction="horizontal">
        <mlSingleList
            ref="mlSingleListRef"
            title="权限角色"
            :mainEntity="tableConf.entity"
            :fieldsList="tableConf.fieldsList"
            :sortFields="tableConf.sortFields"
            fieldName="roleName"
            :tableColumn="tableConf.tableColumn"
        >
            <template #addButton>
                <el-button type="primary" @click="addNewRole" :disabled="!$TOOL.checkRole('r23-2')">
                    <el-icon size="14">
                        <ElIconPlus />
                    </el-icon>
                    <span class="ml-5">新建角色</span>
                </el-button>
            </template>
            <template #activeRow>
                <el-table-column label="操作" :align="'center'" width="220" fixed="right">
                    <template #default="scope">
                        <el-button
                            size="small"
                            type="primary"
                            link
                            @click="lookUserList(scope.row)"
                            icon="view"
                        >
                            <span>查看用户</span>
                        </el-button>
                        <el-button
                            size="small"
                            type="primary"
                            link
                            :disabled="!$TOOL.checkRole('r23-3')"
                            @click="editRole(scope.row)"
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
                            :disabled="!$TOOL.checkRole('r23-4')"
                            @click="deleteRole(scope.row)"
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
        <RoleDialog ref="RoleDialogRef" @refresh="onRefresh" />
        <UsersOfRole ref="UsersOfRoleRef" />
    </el-container>
    
</template>

<script setup>
import { deleteRoleById } from "@/api/user";
import { inject, ref } from "vue";
import { ElMessageBox, ElMessage } from "element-plus";

import { useRouter } from "vue-router";
import UsersOfRole from "./components/UsersOfRole.vue";
import RoleDialog from "./components/RoleDialog.vue";
const router = useRouter();
const $TOOL = inject("$TOOL");
let mlSingleListRef = ref();
// 表格参数
let tableConf = ref({
    entity: "Role",
    fieldsList: "roleName, disabled, description, createdBy",
    // 默认搜索字段
    fieldName: "roleName",
    // 默认排序
    sortFields: [
        {
            fieldName: "createdBy",
            type: "DESC",
        },
    ],
    tableColumn: [
        {
            prop: "roleName",
            label: "角色名称",
            width: "180",
        },
        {
            prop: "disabled",
            label: "是否禁用",
            align: "center",
            width: "120",
            formatter: (row) => {
                return row.disabled ? "是" : "否";
            },
        },
        {
            prop: "description",
            label: "角色描述",
        },
    ],
});

/**
 * ************************************************************** 列表相关增删改
 */

let RoleDialogRef = ref();

// 添加角色
const addNewRole = () => {
    RoleDialogRef.value.openDialog(null);
};
// 编辑角色
const editRole = (row) => {
    if (row.roleId.includes("00000000000000000000000000000001")) {
        ElMessage.info("管理员角色禁止修改！");
        return;
    }
    RoleDialogRef.value.openDialog(row);
};

// 删除角色
const deleteRole = (row) => {
    if (row.roleId.includes("00000000000000000000000000000001")) {
        ElMessage.info("管理员角色禁止删除！");
        return;
    }
    ElMessageBox.confirm("是否删除该权限角色?", "删除确认")
        .then(() => {
            deleteRoleById(row.roleId)
                .then((res) => {
                    if (res.data.code == 200) {
                        ElMessage.success("删除成功");
                        mlSingleListRef.value.getTableList();
                    }
                })
                .catch((res) => {
                    ElMessage.error(res.message);
                });
        })
        .catch(() => {
            ElMessage.info("取消删除");
        });
};

// 刷新列表
const onRefresh = () => {
    mlSingleListRef.value.getTableList();
}


let UsersOfRoleRef = ref();
// 查看用户列表
const lookUserList = (row) => {
    UsersOfRoleRef.value?.openDialog(row.roleId);
}
</script>


<style lang="scss" scoped>
.el-container {
    width: 100% !important;
    overflow-x: hidden; /* 注意：IE浏览器中会出现水平滚动条，暂未找到原因！！ */
}

</style>
