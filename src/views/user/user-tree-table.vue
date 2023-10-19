<template>
    <el-container class="hidden-x-scrollbar">
        <el-aside class="left-tree-panel">
            <el-tree
                :data="treeData"
                show-checkbox
                default-expand-all
                node-key="id"
                ref="tree"
                highlight-current
                :expand-on-click-node="false"
                :props="defaultProps"
                v-if="checkRole('r22-1')"
            >
                <template #default="{ node, data }">
                    <span
                        class="custom-tree-node"
                        @mouseenter="hoverNodeId = node.id"
                        @mouseleave="hoverNodeId = -1"
                    >
                        <span>{{ node.label }}</span>
                        <span :class="{'hidden-action-button': hoverNodeId !== node.id}">
                            <el-button link type="primary" @click="addDepartment(node, data)" :disabled="!checkRole('r22-2')">添加</el-button>
                            <el-button
                                link
                                type="primary"
                                :disabled="!checkRole('r22-3')"
                                @click="editDepartment(node, data)"
                            >编辑</el-button>
                            <el-button link type="primary" @click="deleteDepartment(node, data)" :disabled="!checkRole('r22-4')">删除</el-button>
                        </span>
                    </span>
                </template>
            </el-tree>

            <el-dialog
                :title="departmentFormTitle"
                v-model="showDepartmentFormDialogFlag"
                :show-close="true"
                :destroy-on-close="true"
                :close-on-click-modal="false"
                v-if="showDepartmentFormDialogFlag"
                :close-on-press-escape="false"
                class="need-style"
            >
                <v-form-render :global-dsv="departmentDsv" ref="departmentFormRef"></v-form-render>
                <template #footer>
                    <div class="dialog-footer">
                        <el-button type="primary" @click="saveDepartment" style="width: 90px">保 存</el-button>
                        <el-button @click="showDepartmentFormDialogFlag = false">取 消</el-button>
                    </div>
                </template>
            </el-dialog>
        </el-aside>

        <el-container>
            <mlSingleList
                ref="mlSingleListRef"
                title="用户管理"
                :mainEntity="entity"
                :fieldsList="fieldsList"
                :sortFields="sortFields"
                fieldName="userName"
                :tableColumn="tableColumn"
                :filterItems="filterItems"
                @highlightClick="highlightClick"
            >
                <template #addbutton>
                    <el-button
                        type="primary"
                        @click="addClick"
                        :disabled="!$TOOL.checkRole('r21-2')"
                    >
                        <el-icon size="14">
                            <ElIconPlus />
                        </el-icon>
                        <span class="ml-5">新建用户</span>
                    </el-button>
                </template>
                <template #activeRow>
                    <el-table-column label="操作" :align="'center'" width="140" fixed="right">
                        <template #default="scope">
                            <el-button
                                size="small"
                                type="primary"
                                link
                                @click="editClick(scope.row)"
                                :disabled="!$TOOL.checkRole('r21-3')"
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
                                @click="deleteTableData(scope.row)"
                                :disabled="!$TOOL.checkRole('r21-4')"
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
        </el-container>
        <!-- 新建、编辑用户 -->
        <Edit ref="editRefs" @onConfirm="onRefresh" isUser :disableWidgets="disableWidgets" />
        <!-- 重置密码 -->
        <ml-dialog title="重置密码" v-model="resetPasswordDialogIsShow" appendToBody width="450px">
            <el-input v-model="newPassword" placeholder="输入密码" clearable>
                <template #append>
                    <span class="generate-pwd" @click="generatePwd">生成随机密码</span>
                </template>
            </el-input>
            <template #footer>
                <el-button @click="resetPasswordDialogIsShow = false">取消</el-button>
                <el-button type="primary" @click="confirmResetPassword">确定</el-button>
            </template>
        </ml-dialog>
        <!-- 列表详情 -->
        <mlListDetails ref="mlListDetailsRefs" @tabChange="tabChange" titleFromApi="userName">
            <template #tab>
                <TabMemberList
                    v-model="memberList"
                    @delMembers="changeMembers"
                    :id="curUserId"
                    isRole
                    :isDisabled="!checkRole('r21-4')"
                />
            </template>
            <template #operate="{row}">
                <el-row class="action-group">
                    <el-col :span="24">
                        <AddMembers
                            @addMembers="changeMembers"
                            :paramId="row.userId"
                            paramName="角色"
                            paramType="Role"
                            :isDisabled="!checkRole('r21-3')"
                        />
                    </el-col>
                    <el-col :span="24">
                        <el-button
                            icon="Edit"
                            @click="editClick(row,'dialog')"
                            :disabled="!checkRole('r21-3')"
                        >编辑</el-button>
                    </el-col>
                    <el-col :span="24">
                        <el-button icon="Key" @click="openResetPasswordDialog(row)">重置密码</el-button>
                    </el-col>
                    <el-col :span="24">
                        <el-dropdown trigger="click">
                            <el-button>
                                更多
                                <el-icon style="transform: rotate(90deg);">
                                    <ElIconMoreFilled />
                                </el-icon>
                            </el-button>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item :disabled="!checkRole('r21-4')">
                                        <span @click="deleteTableData(row)" v-if="checkRole('r21-4')">删除</span>
                                        <span v-else>删除</span>
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </el-col>
                </el-row>
            </template>
        </mlListDetails>
    </el-container>
</template>

<script>
import { arrayContain, formatRefColumn, isEmptyStr } from "@/utils/util";
import {
    deleteDepartmentById,
    deleteUserById,
    getDepartmentTree,
    saveDepartment,
    saveUser,
} from "@/api/user";
import { createRecord, updateRecord } from "@/api/crud";
import FormState from "@/views/system/form-state-variables";
import eventBus from "@/utils/event-bus";
import http from "@/utils/request";
import Edit from "@/views/customize-menu/edit.vue";
import TabMemberList from "./components/TabMemberList.vue";
import AddMembers from "./components/AddMembers.vue";
import { getUserRole } from "@/api/user";
export default {
    name: "UserTreeTable",
    components: {
        Edit,
        TabMemberList,
        AddMembers,
    },
    data() {
        return {
            entity: "User",
            fieldsList:
                "userName, loginName, createdOn, createdBy, modifiedOn, modifiedBy, departmentId,avatar",
            showFormDialogFlag: false,
            layout: {},
            formState: 1,
            formModel: {},
            labelsModel: {},
            curUserId: null,
            fieldPropsMap: {},

            showDepartmentFormDialogFlag: false,
            departmentLayout: {},
            departmentFormState: 1,
            departmentFormModel: {},
            departmentLabelsModel: {},
            curDepartmentId: null,
            departmentFieldPropsMap: {},
            departmentDsv: {
                formEntity: "Department",
                uploadServer: import.meta.env.VITE_APP_BASE_API,
            },
            userDsv: {},

            tableData: [],
            page: {
                pageNo: 1,
                limit: 20,
                sizes: [10, 20, 30, 50, 100],
                total: 0,
            },
            treeData: [],
            hoverNodeId: -1,
            defaultProps: {
                children: "children",
                label: "label",
            },
            tableHeight: 100,

            keyword: "",
            searchFilter: "",

            extraRules: {
                loginName: {
                    max: 20,
                    message: "不能超过20个字符长度",
                    trigger: "blur",
                },

                profile: [
                    { min: 5, message: "请至少输入5个字符", trigger: "blur" },
                ],
            },
            multipleSelection: [],
            // 重置密码
            resetPasswordDialogIsShow: false,
            resetPasswordUserId: "",
            newPassword: "",
            // 默认排序
            sortFields: [
                {
                    fieldName: "createdBy",
                    type: "DESC",
                },
            ],
            // 过滤条件
            filterItems: [],
            // 表格列
            tableColumn: [
                {
                    prop: "userName",
                    label: "用户名称",
                    width: "130",
                    // align: "left",
                    highlight: true,
                },
                {
                    prop: "loginName",
                    label: "登录名",
                    width: "120",
                },
                {
                    prop: "createdOn",
                    label: "创建时间",
                    width: "160",
                },
                {
                    prop: "createdBy",
                    label: "创建用户",
                    formatter: (row) => {
                        return row.createdBy?.name;
                    },
                },
                {
                    prop: "modifiedOn",
                    label: "修改时间",
                    width: "160",
                },
                {
                    prop: "modifiedBy",
                    label: "修改用户",
                    formatter: (row) => {
                        return row.modifiedBy?.name;
                    },
                },
                {
                    prop: "departmentId",
                    label: "归属部门",
                    formatter: (row) => {
                        return row.departmentId?.name;
                    },
                },
            ],
            // 是否弹框调用
            isDialogCallEdit: false,
            // 成员列表
            memberList: [],
            // 要禁用的字段
            disableWidgets: [],
        };
    },
    computed: {
        formTitle() {
            if (this.formState === FormState.NEW) {
                return "新建用户";
            } else if (this.formState === FormState.EDIT) {
                return "编辑用户";
            } else {
                return "用户详情";
            }
        },

        departmentFormTitle() {
            if (this.formState === FormState.NEW) {
                return "新建部门";
            } else if (this.formState === FormState.EDIT) {
                return "编辑部门";
            } else {
                return "查看部门";
            }
        },
    },
    mounted() {
        this.initTreeData();
    },
    methods: {
        checkRole(str) {
            return this.$TOOL.checkRole(str);
        },
        // 新建用户
        addClick() {
            let tempV = {};
            tempV.dialogTitle = "新建用户";
            tempV.entityName = "User";
            this.disableWidgets = [];
            this.$refs.editRefs.openDialog(tempV);
        },
        // 编辑用户
        editClick(row, target) {
            if (target == "dialog") {
                this.isDialogCallEdit = true;
            }
            let tempV = { ...row };
            tempV.dialogTitle = "编辑" + row.userName;
            tempV.entityName = "User";
            tempV.detailId = row.userId;
            this.disableWidgets = ["loginPwd"];
            this.$refs.editRefs.openDialog(tempV);
        },
        // 打开重置密码弹框
        openResetPasswordDialog(row) {
            this.resetPasswordDialogIsShow = true;
            this.resetPasswordUserId = row.userId;
        },
        // 刷新数据
        onRefresh() {
            this.$refs.mlSingleListRef.getTableList();
            if (this.isDialogCallEdit) {
                this.$refs.mlListDetailsRefs.refresh();
                this.isDialogCallEdit = false;
            }
        },
        // 高亮字段点击
        highlightClick(row) {
            this.$refs.mlListDetailsRefs.openDialog({
                title: row.userName,
                id: row.userId,
                entityName: "User",
                tabs: [
                    {
                        label: "角色列表",
                        name: "memberList",
                    },
                ],
            });
            this.curUserId = row.userId;
        },
        // 添加角色成员
        changeMembers() {
            this.$refs.mlListDetailsRefs.refresh();
        },
        // 页签切换
        async tabChange(tab) {
            this.$refs.mlListDetailsRefs.loading = true;
            this.memberList = [];
            // 获取团队成员
            let res = await getUserRole(tab.id);
            if (res) {
                this.memberList = res.data.data || [];
            }
            this.$refs.mlListDetailsRefs.loading = false;
        },
        // 生成密码
        generatePwd() {
            this.newPassword = "xxxcxxx".replace(/[xy]/g, function (c) {
                var r = (Math.random() * 16) | 0,
                    v = c == "x" ? r : (r & 0x3) | 0x8;
                return v.toString(16);
            });
        },
        // 确认修改密码
        async confirmResetPassword() {
            if (!this.newPassword) {
                this.$message.error("请输入密码");
                return;
            }
            let regEx =
                /(?=.*([a-zA-Z].*))(?=.*[0-9].*)[a-zA-Z0-9-*/+.~!@#$%^&*()]{6,20}$/;
            if (!regEx.test(this.newPassword)) {
                this.$message.error(
                    "必须包含数字、英文。可有字符。密码长度为：6-20位"
                );
                return;
            }
            let res = await http.get("/user/resetPassword", {
                password: this.newPassword,
                userId: this.resetPasswordUserId,
            });
            if (res) {
                this.$message.success("重置成功");
                this.newPassword = "";
                this.resetPasswordDialogIsShow = false;
                this.isDialogCallEdit = true;
                this.onRefresh();
            }
        },

        handleDeletedFields(res, layoutObj) {
            let deletedFields = res.data.deletedFields;
            if (!!deletedFields && Array.isArray(deletedFields)) {
                let layoutFieldWrappers = layoutObj.getAllLayoutFieldWrappers();
                if (
                    !!layoutFieldWrappers &&
                    Array.isArray(layoutFieldWrappers)
                ) {
                    layoutFieldWrappers.forEach((fw) => {
                        let deletedFlag = arrayContain(deletedFields, fw.name);
                        if (!!deletedFlag) {
                            fw.deleted = true; /* 设置已删除字段标志 */
                        }
                    });
                }
            }
        },

        deleteTableData(row) {
            if (row.userId === "021-000000000000000000000000000000000001") {
                this.$message.info("管理员用户禁止删除！");
                return;
            }

            this.$confirm("是否删除该用户?", "删除确认")
                .then(() => {
                    deleteUserById(row.userId)
                        .then((res) => {
                            if (res.error != null) {
                                this.$message({
                                    message: res.error,
                                    type: "error",
                                });
                                return;
                            }

                            this.$message.success("删除成功");
                            this.onRefresh();
                        })
                        .catch((res) => {
                            this.$message({
                                message: res.message,
                                type: "error",
                            });
                        });
                })
                .catch(() => {
                    this.$message.info("取消删除");
                });
        },
        initTreeData() {
            getDepartmentTree()
                .then((res) => {
                    if (res.error != null) {
                        this.$message({ message: res.error, type: "error" });
                        return;
                    }

                    this.treeData = res.data.data;
                })
                .catch((res) => {
                    this.$message({ message: res.message, type: "error" });
                });
        },

        buildLayoutObj() {
            return createLayoutObj(eventBus);
        },

        addDepartment(node, data) {
            createRecord("Department")
                .then((res) => {
                    if (res.error != null) {
                        this.$message({ message: res.error, type: "error" });
                        return;
                    }

                    if (!!res.data && !!res.data.layoutJson) {
                        this.curDepartmentId = null;
                        this.departmentFormState = FormState.NEW;
                        this.showDepartmentFormDialogFlag = true;
                        this.departmentDsv["formEntity"] = "Department";
                        this.$nextTick(() => {
                            this.$refs.departmentFormRef.setFormJson(
                                res.data.layoutJson
                            );
                            const departmentFormData = {
                                parentDepartmentId: {
                                    id: node.data.id,
                                    name: node.data.label,
                                },
                            };
                            this.$nextTick(() => {
                                this.$refs.departmentFormRef.setFormData(
                                    departmentFormData
                                );
                            });
                        });
                    } else {
                        this.$message({
                            message: "加载表单布局出错",
                            type: "error",
                        });
                    }
                })
                .catch((res) => {
                    this.$message({ message: res.message, type: "error" });
                });
        },

        editDepartment(node, data) {
            if (node.data.id === "0000022-00000000000000000000000000000001") {
                this.$message.info("根部门不可编辑！");
                return;
            }

            this.curDepartmentId = node.data.id;
            updateRecord("Department", this.curDepartmentId)
                .then((res) => {
                    if (res.error != null) {
                        this.$message({ message: res.error, type: "error" });
                        return;
                    }

                    if (!!res.data && !!res.data.layoutJson) {
                        this.departmentFormState = FormState.EDIT;
                        this.showDepartmentFormDialogFlag = true;
                        this.departmentDsv["formEntity"] = "Department";
                        this.$nextTick(() => {
                            this.$refs.departmentFormRef.setFormJson(
                                res.data.layoutJson
                            );
                            this.$nextTick(() => {
                                const parentDpt =
                                    this.$refs.departmentFormRef.getWidgetRef(
                                        "parentDepartmentId"
                                    );
                                !!parentDpt && parentDpt.setDisabled(true);
                                if (
                                    node.data.id ===
                                    "0000022-00000000000000000000000000000001"
                                ) {
                                    !!parentDpt && parentDpt.setRequired(false);
                                }

                                this.$refs.departmentFormRef.setFormData(
                                    res.data.formData
                                );
                            });
                        });
                    } else {
                        this.$message({
                            message: "加载表单布局出错",
                            type: "error",
                        });
                    }
                })
                .catch((res) => {
                    this.$message({ message: res.message, type: "error" });
                });
        },

        saveDepartment() {
            this.$refs.departmentFormRef
                .getFormData()
                .then((formData) => {
                    this.departmentFormModel = formData;
                    saveDepartment(
                        "Department",
                        this.departmentFormState === FormState.NEW
                            ? ""
                            : this.curDepartmentId,
                        this.departmentFormModel
                    )
                        .then((res) => {
                            if (res.error != null) {
                                this.$message({
                                    message: res.error,
                                    type: "error",
                                });
                                return;
                            }

                            this.departmentFormModel = res.data.formData;
                            this.departmentLabelsModel = res.data.labelData;
                            this.$message({
                                message: "保存成功",
                                type: "success",
                            });
                            this.showDepartmentFormDialogFlag = false;
                            this.initTreeData();
                        })
                        .catch((res) => {
                            this.$message({
                                message: res.message,
                                type: "error",
                            });
                        });
                })
                .catch((err) => {
                    this.$message({ message: "数据校验失败", type: "error" });
                });
        },

        deleteDepartment(node, data) {
            if (node.data.id === "0000022-00000000000000000000000000000001") {
                this.$message.info("根部门不可删除！");
                return;
            }

            let dptId = node.data.id;
            this.$confirm("是否删除该部门?", "删除确认")
                .then(() => {
                    deleteDepartmentById(dptId)
                        .then((res) => {
                            if (res.error != null) {
                                this.$message({
                                    message: res.error,
                                    type: "error",
                                });
                                return;
                            }

                            this.$message.success("删除成功");
                            this.initTreeData();
                        })
                        .catch((res) => {
                            this.$message({
                                message: res.message,
                                type: "error",
                            });
                        });
                })
                .catch(() => {
                    this.$message.info("取消删除");
                });
        },
    },
};
</script>

<style lang="scss" scoped>
.generate-pwd {
    cursor: pointer;
}

.el-container.hidden-x-scrollbar {
    overflow-x: hidden; /* 注意：IE浏览器中会出现水平滚动条，暂未找到原因！！ */
}

:deep(.el-main) {
    padding: 0;
}

.el-aside {
    background-color: #ffffff;
}

.left-tree-panel {
    width: 300px;
    margin-right: 0;
    border-right: 2px dotted #ebeef5;
}

.hidden-action-button {
    display: none;
}

.custom-tree-node {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 14px;
    padding-right: 8px;
}

.list-search-panel {
    height: 62px !important;
    line-height: 62px;
    border-left: 1px solid #ebeef5;
    /* border-bottom: 2px dotted #EBEEF5; */
    /*margin-bottom: 2px;*/
    margin-bottom: 0;
}

.list-search-panel:after {
    content: "";
    display: block;
    clear: both;
}

.search-panel-left {
}

.search-panel-right {
    width: 360px;

    /* 解决IE浮动元素垂直居中问题 begin */
    position: relative;
    height: 62px;

    :deep(.el-input.v-middle) {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
    }

    /* end */
}

// :deep(.el-table th.gutter) {
//     /* 解决表头与内容列不对齐差1个像素的问题！！ */
//     display: table-cell !important;
// }

.need-style {
    :deep(.el-dialog__header) {
        /*border-bottom: 1px #cac6c6 solid;*/
        text-align: center;
        padding-top: 15px;

        .el-dialog__title {
            font-size: 16px;
        }
    }

    :deep(.el-dialog__body) {
        padding: 12px 10px;
    }
}

:deep(#simpleTableFooter.el-footer) {
    border-left: 1px solid #ebeef5;
    //height: 48px !important;
    //padding-top: 8px !important;
}

.action-group {
    :deep(.el-button) {
        margin-bottom: 5px;
        min-width: 110px !important;
    }
}
</style>
