<template>
    <el-container class="hidden-x-scrollbar">
        <el-aside class="left-tree-panel" v-if="checkRole('r22-1')">
            <el-tree
                :data="treeData"
                default-expand-all
                node-key="id"
                ref="tree"
                highlight-current
                :expand-on-click-node="false"
                :props="defaultProps"
                @node-click="nodeClick"
            >
                <template #default="{ node, data }">
                    <span
                        class="custom-tree-node"
                        @mouseenter="hoverNodeId = node.id"
                        @mouseleave="hoverNodeId = -1"
                    >
                        <span>
                            <img
                                v-if="node.data.dingDepartmentId"
                                src="@/assets/imgs/dd.png"
                                style="width: 15px;height: 15px;position: relative;top: 2px;"
                                alt
                            />
                            <img
                                v-else-if="node.data.wxWorkDepartmentId"
                                src="@/assets/imgs/WXWork.png"
                                style="width: 15px;height: 15px;position: relative;top: 2px;"
                                alt
                            />
							<el-icon v-else><OfficeBuilding /></el-icon>
                            {{ node.label }}
                        </span>
                        <span class="action-button" :class="{'hidden-action-button': hoverNodeId !== node.id}">
                            <el-button
                                link
                                type="primary"
                                @click="addDepartment(node, data)"
                                :disabled="!checkRole('r22-2')"
                            >添加</el-button>
                            <el-button
                                link
                                type="primary"
                                :disabled="!checkRole('r22-3')"
                                @click="editDepartment(node, data)"
                            >编辑</el-button>
                            <el-button
                                link
                                type="primary"
                                @click="deleteDepartment(node, data)"
                                :disabled="!checkRole('r22-4')"
                            >删除</el-button>
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
                fieldName="userName,loginName,mobilePhone"
                :tableColumn="tableColumn"
                :advFilter="advFilter"
                @highlightClick="highlightClick"
                @changeSwitch="changeSwitch"
            >
                <template #addButton>
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
        <mlCustomEdit
            ref="editRefs"
            @saveFinishCallBack="onRefresh"
            nameFieldName="userName"
            isUser
            :disableWidgets="disableWidgets"
        />

        <!-- 列表详情 -->
        <ListDetail
            ref="mlListDetailsRefs"
            idFieldName="userId"
            nameFieldName="userName"
            @onRefresh="onRefresh"
            :disableWidgets="disableWidgets"
        />
    </el-container>
</template>

<script>
import { arrayContain } from "@/utils/util";
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
import mlCustomEdit from '@/components/mlCustomEdit/index.vue';
import ListDetail from "./components/ListDetail.vue";
import ddImg from "@/assets/imgs/dd.png";
import wXWorkImg from "@/assets/imgs/WXWork.png";
export default {
    name: "UserTreeTable",
    components: {
        mlCustomEdit,
        ListDetail,
    },
    data() {
        return {
            entity: "User",
            fieldsList:
                "userName, loginName, jobTitle,mobilePhone,departmentId,disabled,createdOn, createdBy, modifiedOn, modifiedBy, departmentId,avatar,dingTalkUserId,wxWorkUserId",
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
            resetPasswordUserId: "",
            newPassword: "",
            // 默认排序
            sortFields: [
                {
                    fieldName: 'displayOrder',
                    type: "DESC",
                },
                {
                    fieldName: "createdOn",
                    type: "DESC",
                },
            ],
            // 过滤条件
            advFilter: {},
            // 表格列
            tableColumn: [
                {
                    prop: "userName",
                    label: "用户名称",
                    highlight: true,
                },
                {
                    prop: "loginName",
                    label: "登录名",
                    needImg: (row) => {
                        if (row.dingTalkUserId) {
                            return ddImg;
                        }
                        if (row.wxWorkUserId) {
                            return wXWorkImg;
                        }
                        return false;
                    },
                },
                {
                    prop: "jobTitle",
                    label: "职务",
                    formatter: (row) => {
                        return row.jobTitle?.label;
                    },
                },
                {
                    prop: "mobilePhone",
                    label: "手机号",
                },
                {
                    prop: "departmentId",
                    label: "部门",
                    formatter: (row) => {
                        return row.departmentId?.name;
                    },
                },
                // {
                //     prop: "createdOn",
                //     label: "创建时间",
                //     width: "160",
                // },
                // {
                //     prop: "createdBy",
                //     label: "创建用户",
                //     formatter: (row) => {
                //         return row.createdBy?.name;
                //     },
                // },
                {
                    prop: "disabled",
                    label: "启用",
                    align: "center",
                    customSlot: "switch",
                    isNegation: true,
                    width: 80,
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
                // {
                //     prop: "departmentId",
                //     label: "归属部门",
                //     formatter: (row) => {
                //         return row.departmentId?.name;
                //     },
                // },
            ],
            // 成员列表
            memberList: [],
            // 要禁用的字段
            disableWidgets: [],
            // 部门树节点
            node:{},
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
            if (this.departmentFormState === FormState.NEW) {
                return "新建部门";
            } else if (this.departmentFormState === FormState.EDIT) {
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
        // 重置
        resetting() {
            this.node = {};
            this.advFilter = null;
            this.$nextTick(() => {
                this.$refs.mlSingleListRef.keyword = "";
                this.onRefresh();
            });
        },
        // 节点点击
        nodeClick(node) {
            // 检查当前节点是否已经被选中
            if (this.node && this.node.id === node.id) {
                // 如果已选中，则取消选中
                this.node = {};
                this.advFilter = null;
                // 清除树形控件的当前高亮状态
                this.$refs.tree.setCurrentKey(null);
            } else {
                // 否则，更新选中节点和过滤条件
                this.node = node;
                this.advFilter = {
                    equation: "OR",
                    items: [
                        {
                            fieldName: "departmentId",
                            op: "EQ",
                            value: node.id,
                        },
                    ],
                };
                // 设置当前节点为高亮状态
                this.$refs.tree.setCurrentKey(node.id);
            }
            this.$nextTick(() => {
                this.onRefresh();
            });
        },
        // 新建用户
        addClick() {
            let tempV = {};
            tempV.entityName = "User";
            this.disableWidgets = ["departmentId"];
            if(this.node?.id){
                tempV.fieldName = "departmentId";
                tempV.fieldNameVale = this.node.id;
                tempV.fieldNameLabel = this.node.label;
            }else {
                if(this.treeData[0]){
                    tempV.fieldName = "departmentId";
                    tempV.fieldNameVale = this.treeData[0]?.id;
                    tempV.fieldNameLabel = this.treeData[0]?.label;
                }
            }
            this.$refs.editRefs.openDialog(tempV);
        },
        // 编辑用户
        editClick(row, target) {
            let tempV = { ...row };
            tempV.entityName = "User";
            tempV.detailId = row.userId;
            this.disableWidgets = ["loginName", "loginPwd"];
            this.$refs.editRefs.openDialog(tempV);
        },
        // 刷新数据
        onRefresh() {
            this.$refs.mlSingleListRef.getTableList();
        },
        // 高亮字段点击
        highlightClick(row) {
            this.disableWidgets = ["loginName", "loginPwd"];
            this.$refs.mlListDetailsRefs.openDetailDialog(
                row.userId,
                row.userName
            );
        },
        // 是否启用
        async changeSwitch(row) {
            let res = await saveUser("User", row.userId, { ...row });
            this.onRefresh();
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
                .then(async () => {
                    let res = await deleteUserById(row.userId);
                    if (res && res.data) {
                        this.$message.success("删除成功");
                        this.onRefresh();
                    }
                })
                .catch(() => {
                    this.$message.info("取消删除");
                });
        },
        async initTreeData() {
            let res = await getDepartmentTree()
            if(res){
                this.treeData = res.data.data;
            }
        },

        buildLayoutObj() {
            return createLayoutObj(eventBus);
        },

        async addDepartment(node, data) {
            let res = await createRecord("Department");
            if (res) {
                if (!!res.data && !!res.data.layoutJson) {
                    this.curDepartmentId = null;
                    this.departmentFormState = FormState.NEW;
                    this.showDepartmentFormDialogFlag = true;
                    this.departmentDsv["formEntity"] = "Department";
                    this.departmentDsv["formStatus"] = "new";
                    this.$nextTick(() => {
                        this.$refs.departmentFormRef.setFormJson(res.data.layoutJson);
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
            }
        },

        async editDepartment(node, data) {
            if (node.data.id === "0000022-00000000000000000000000000000001") {
                this.$message.info("根部门不可编辑！");
                return;
            }

            this.curDepartmentId = node.data.id;
            let res = await updateRecord("Department", this.curDepartmentId);
            if (res) {
                if (!!res.data && !!res.data.layoutJson) {
                    this.departmentFormState = FormState.EDIT;
                    this.showDepartmentFormDialogFlag = true;
                    this.departmentDsv["formEntity"] = "Department";
                    this.departmentDsv["formStatus"] = "edit";
                    this.$nextTick(() => {
                        this.$refs.departmentFormRef.setFormJson(res.data.layoutJson);
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
                            this.$refs.departmentFormRef.setFormData(res.data.formData);
                        });
                    });
                } else {
                    this.$message({
                        message: "加载表单布局出错",
                        type: "error",
                    });
                }
            }
        },

        saveDepartment() {
            this.$refs.departmentFormRef
                .getFormData()
                .then(async (formData) => {
                    this.departmentFormModel = formData;
                    let res = await saveDepartment(
                        "Department",
                        this.departmentFormState === FormState.NEW ? "" : this.curDepartmentId,
                        this.departmentFormModel
                    );
                    if (res) {
                        this.departmentFormModel = res.data.formData;
                        this.departmentLabelsModel = res.data.labelData;
                        this.$message({
                            message: "保存成功",
                            type: "success",
                        });
                        this.showDepartmentFormDialogFlag = false;
                        this.initTreeData();
                    }
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
                .then(async () => {
                    let res = await deleteDepartmentById(dptId);
                    if (res?.data && res.data?.code == 200) {
                        this.$message.success("删除成功");
                        this.initTreeData();
                    }
                })
                .catch(() => {
                    this.$message.info("取消删除");
                });
        },
    },
};
</script>

<style lang="scss" scoped>
:deep(.render-form) {
    .el-row {
        padding: 0 8px 0 8px !important;
    }
}

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
.action-button {
    position: absolute;
    right: 0;
    z-index: 6;
    background: #f5f7fa;
}
</style>
