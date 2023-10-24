<template>
    <el-container direction="horizontal">
        <mlSingleList
            ref="mlSingleListRef"
            title="权限角色"
            :mainEntity="entity"
            :fieldsList="fieldsList"
            :sortFields="sortFields"
            fieldName="roleName"
            :tableColumn="tableColumn"
            :filterItems="filterItems"
        >
            <template #addbutton>
                <el-button type="primary" @click="addNewRole" :disabled="!checkRole('r23-2')">
                    <el-icon size="14">
                        <ElIconPlus />
                    </el-icon>
                    <span class="ml-5">新建角色</span>
                </el-button>
            </template>
            <template #activeRow>
                <el-table-column label="操作" :align="'center'" width="140" fixed="right">
                    <template #default="scope">
                        <el-button
                            size="small"
                            type="primary"
                            link
                            :disabled="!checkRole('r23-3')"
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
                            :disabled="!checkRole('r23-4')"
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
        <el-dialog
            :title="formTitle"
            v-model="showRoleFormDialogFlag"
            v-if="showRoleFormDialogFlag"
            :destroy-on-close="true"
            :close-on-click-modal="false"
            class="small-padding"
            :show-close="true"
            :close-on-press-escape="false"
            width="1160px"
            :z-index="2001"
        >
            <el-form
                label-position="left"
                :label-width="'150px'"
                size
                ref="roleForm"
                :model="formModel"
                :rules="formRules"
                v-loading="roleFormDialogLoading"
                element-loading-text="数据加载中..."
            >
                <el-row :gutter="12">
                    <el-col :span="12">
                        <el-form-item label="角色名称" prop="roleName">
                            <el-input v-model="formModel.roleName" maxlength="30"></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="是否禁用">
                            <el-radio-group v-model="formModel.disabled">
                                <el-radio :label="true">是</el-radio>
                                <el-radio :label="false">否</el-radio>
                            </el-radio-group>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row :gutter="12">
                    <el-col :span="24">
                        <el-form-item label="角色说明">
                            <el-input
                                type="textarea"
                                :autosize="{ minRows: 2, maxRows: 3}"
                                v-model="formModel.description"
                            ></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>

                <el-tabs type="border-card">
                    <el-tab-pane label="数据权限">
                        <div class="entity-right-setting title">
                            <div class="fl label"></div>
                            <div class="fl text-align-center bold">查看权限</div>
                            <div class="fl text-align-center bold">新建权限</div>
                            <div class="fl text-align-center bold">修改权限</div>
                            <div class="fl text-align-center bold">删除权限</div>
                            <div class="fl text-align-center bold">分配权限</div>
                            <div class="fl text-align-center bold">共享权限</div>
                            <div class="fl">
                                <el-dropdown trigger="click" @command="allHandleCommand">
                                    <span class="text-icon-all">
                                        <el-icon size="16">
                                            <ElIconFinished />
                                        </el-icon>
                                    </span>
                                    <template #dropdown>
                                        <el-dropdown-menu>
                                            <el-dropdown-item
                                                :command="dropItem.value"
                                                v-for="(dropItem,dropInx) of simpleRightLevels"
                                                :key="dropInx"
                                            >{{ dropItem.label }}</el-dropdown-item>
                                        </el-dropdown-menu>
                                    </template>
                                </el-dropdown>
                            </div>
                        </div>
                        <div class="entity-right-setting-body">
                            <el-scrollbar>
                                <div
                                    class="entity-right-setting"
                                    v-for="(rightEntity, entityIdx) in rightEntityList"
                                    :key="entityIdx"
                                >
                                    <div class="fl label">{{ rightEntity.label }}</div>
                                    <div class="fl text-align-center">
                                        <el-select
                                            v-model="formModel.rightValueMap['r' + rightEntity.entityCode + '-1']"
                                            @change="(val) => handleReadRightChange(rightEntity.entityCode, val)"
                                            size="small"
                                        >
                                            <el-option
                                                v-for="item in getRightLevels(rightEntity)"
                                                :key="item.value"
                                                :label="item.label"
                                                :value="item.value"
                                            ></el-option>
                                        </el-select>
                                    </div>
                                    <div class="fl text-align-center">
                                        <el-select
                                            v-model="formModel.rightValueMap['r' + rightEntity.entityCode + '-2']"
                                            @change="(val) => handleEntityRightChange(rightEntity.entityCode, 2, val)"
                                            size="small"
                                        >
                                            <el-option
                                                v-for="item in oneselfRightLevels"
                                                :key="item.value"
                                                :label="item.label"
                                                :value="item.value"
                                            ></el-option>
                                        </el-select>
                                    </div>
                                    <div class="fl text-align-center">
                                        <el-select
                                            v-model="formModel.rightValueMap['r' + rightEntity.entityCode + '-3']"
                                            @change="(val) => handleEntityRightChange(rightEntity.entityCode, 3, val)"
                                            size="small"
                                        >
                                            <el-option
                                                v-for="item in getRightLevels(rightEntity)"
                                                :key="item.value"
                                                :label="item.label"
                                                :value="item.value"
                                            ></el-option>
                                        </el-select>
                                    </div>
                                    <div class="fl text-align-center">
                                        <el-select
                                            v-model="formModel.rightValueMap['r' + rightEntity.entityCode + '-4']"
                                            @change="(val) => handleEntityRightChange(rightEntity.entityCode, 4, val)"
                                            size="small"
                                        >
                                            <el-option
                                                v-for="item in getRightLevels(rightEntity)"
                                                :key="item.value"
                                                :label="item.label"
                                                :value="item.value"
                                            ></el-option>
                                        </el-select>
                                    </div>
                                    <div class="fl text-align-center">
                                        <el-select
                                            v-model="formModel.rightValueMap['r' + rightEntity.entityCode + '-5']"
                                            @change="(val) => handleEntityRightChange(rightEntity.entityCode, 5, val)"
                                            size="small"
                                        >
                                            <el-option
                                                v-for="item in getRightLevels(rightEntity)"
                                                :key="item.value"
                                                :label="item.label"
                                                :value="item.value"
                                            ></el-option>
                                        </el-select>
                                    </div>
                                    <div class="fl text-align-center">
                                        <el-select
                                            v-model="formModel.rightValueMap['r' + rightEntity.entityCode + '-6']"
                                            @change="(val) => handleEntityRightChange(rightEntity.entityCode, 6, val)"
                                            size="small"
                                        >
                                            <el-option
                                                v-for="item in getRightLevels(rightEntity)"
                                                :key="item.value"
                                                :label="item.label"
                                                :value="item.value"
                                            ></el-option>
                                        </el-select>
                                    </div>
                                    <div class="fl text-icon">
                                        <el-dropdown
                                            @command="(e) => rowHandleCommand(e,rightEntity)"
                                            trigger="click"
                                        >
                                            <span class="text-icon-span">
                                                <el-icon size="16">
                                                    <ElIconFinished />
                                                </el-icon>
                                            </span>
                                            <template #dropdown>
                                                <el-dropdown-menu>
                                                    <el-dropdown-item
                                                        :command="dropItem.value"
                                                        v-for="(dropItem,dropInx) of getRightLevels(rightEntity)"
                                                        :key="dropInx"
                                                    >{{ dropItem.label }}</el-dropdown-item>
                                                </el-dropdown-menu>
                                            </template>
                                        </el-dropdown>
                                    </div>
                                </div>
                            </el-scrollbar>
                        </div>
                    </el-tab-pane>

                    <el-tab-pane label="功能权限">
                        <el-row :gutter="12" class="function-right-setting">
                            <el-col :offset="0" :span="4">功能权限设置</el-col>
                        </el-row>
                        <el-row>
                            <hr style="border: 0;border-top: 1px dotted #cccccc" />
                        </el-row>
                        <el-row :gutter="12" class="function-right-row">
                            <el-col
                                :span="12"
                                v-for="(funcItem,funcInx) of funcRight"
                                :key="funcInx"
                            >
                                <el-form-item :label="funcItem.label" :title="funcItem.value">
                                    <el-radio-group
                                        v-model="formModel.rightValueMap[funcItem.value]"
                                    >
                                        <el-radio :label="true">是</el-radio>
                                        <el-radio :label="false">否</el-radio>
                                    </el-radio-group>
                                </el-form-item>
                            </el-col>
                        </el-row>
                    </el-tab-pane>
                </el-tabs>
            </el-form>
            <template #footer>
                <div class="dialog-footer">
                    <el-button
                        type="primary"
                        @click="saveRole"
                        style="width: 90px"
                        :loading="roleFormDialogLoading"
                    >保 存</el-button>
                    <el-button
                        @click="showRoleFormDialogFlag = false"
                        :loading="roleFormDialogLoading"
                    >取 消</el-button>
                </div>
            </template>
        </el-dialog>
    </el-container>
</template>

<script>
import DataList from "@/components/business/DataList/index.vue";
import { copyNew, isEmptyStr } from "@/utils/util";
import { getDataList } from "@/api/crud";
import {
    deleteRoleById,
    getBlankRoleData,
    getRoleData,
    saveRoleData,
} from "@/api/user";

export default {
    name: "RoleListView",
    components: { DataList },
    props: {
        entity: {
            type: String,
            default: "Role",
        },
    },
    data() {
        return {
            fieldsList: "roleName, disabled, description",
            // 默认排序
            sortFields: [
                {
                    fieldName: "createdBy",
                    type: "DESC",
                },
            ],
            // 过滤条件
            filterItems: [],
            tableColumn: [
                {
                    prop: "roleName",
                    label: "用户名称",
                    width: "180",
                },
                {
                    prop: "disabled",
                    label: "是否禁用",
                    align:'center',
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

            searchFilter: "",

            showRoleFormDialogFlag: false,
            roleFormDialogLoading: false,

            rowRightLevels: [
                { label: "无权限", value: 0 },
                { label: "本人", value: 10 },
                { label: "本部门", value: 20 },
                { label: "本部门及以下", value: 30 },
                { label: "上级部门及以下", value: 40 },
                { label: "全部数据", value: 50 },
            ],

            oneselfRightLevels: [
                { label: "不允许", value: 0 },
                { label: "允许", value: 50 },
            ],

            simpleRightLevels: [
                { label: "无权限", value: 0 },
                { label: "全部数据", value: 50 },
            ],

            formModel: {
                roleId: "",
                roleName: "",
                disabled: false,
                description: "",
                rightValueMap: {},
            },

            rightEntityList: [],
            funcRight: [
                {
                    label: "实体管理",
                    value: "r6001",
                },
                {
                    label: "删除实体",
                    value: "r6002",
                },
                {
                    label: "设计表单布局",
                    value: "r6003",
                },
                {
                    label: "单选项管理",
                    value: "r6005",
                },
                {
                    label: "多选项管理",
                    value: "r6006",
                },
                {
                    label: "配置导航",
                    value: "r6007",
                },
                {
                    label: "实体布局配置",
                    value: "r6008",
                },
                {
                    label: "回收站管理",
                    value: "r6009",
                },
                {
                    label: "修改历史查询",
                    value: "r6010",
                },
                {
                    label: "数据导入",
                    value: "r6011",
                },
                {
                    label: "审批撤销",
                    value: "r6013",
                },
                {
                    label: "登录日志查看",
                    value: "r6014",
                },
                {
                    label: "触发器执行日志查看",
                    value: "r6015",
                },
            ],
            formRules: {
                roleName: [
                    { validator: this.validateRoleName, trigger: "blur" },
                ],
            },
            loading: false,
        };
    },
    computed: {
        formTitle() {
            return !!this.formModel.roleId ? "编辑权限角色" : "新建权限角色";
        },
    },
    mounted() {
        // this.loadRoleData();
    },
    methods: {
        checkRole(str) {
            return this.$TOOL.checkRole(str);
        },
        validateRoleName(rule, value, callback) {
            if (!value) {
                callback(new Error("请输入角色名称"));
                // this.$message.error('请输入角色名称')
                return;
            }
            if (value.length < 2) {
                callback(new Error("请输入至少两个字符"));
                // this.$message.error('角色名称至少两个字符')
                return;
            }
            if (value.length > 30) {
                callback(new Error("名字最多只能30个字符"));
                // this.$message.error('角色名称最多30字符')
                return;
            }
            let regEx = /^[A-Za-z\d\u4e00-\u9fa5]+[_-]*/;
            if (!regEx.test(value)) {
                callback(
                    new Error(
                        "请以中文、英文字母、数字开头，中间可输入下划线或横杠"
                    )
                );
                // this.$message.error('请以中文、英文字母、数字开头，中间可输入下划线或横杠')
                return;
            }
            callback();
        },
        // 单行设置权限
        rowHandleCommand(command, row) {
            let { entityCode, authorizable } = row;
            for (let index = 1; index < 7; index++) {
                // 新建
                if (index == 2 || !authorizable) {
                    this.formModel.rightValueMap[
                        "r" + entityCode + "-" + index
                    ] = command > 0 ? 50 : 0;
                } else {
                    this.formModel.rightValueMap[
                        "r" + entityCode + "-" + index
                    ] = command;
                }
            }
        },
        // 设置所有数据权限
        allHandleCommand(command) {
            this.rightEntityList.forEach((el) => {
                this.formModel.rightValueMap["r" + el.entityCode + "-1"] =
                    command;
                this.formModel.rightValueMap["r" + el.entityCode + "-2"] =
                    command;
                this.formModel.rightValueMap["r" + el.entityCode + "-3"] =
                    command;
                this.formModel.rightValueMap["r" + el.entityCode + "-4"] =
                    command;
                this.formModel.rightValueMap["r" + el.entityCode + "-5"] =
                    command;
                this.formModel.rightValueMap["r" + el.entityCode + "-6"] =
                    command;
            });
        },
        getRightLevels(rightEntity) {
            if (rightEntity.authorizable === true) {
                return this.rowRightLevels;
            } else {
                return this.simpleRightLevels;
            }
        },
        addNewRole() {
            this.rightEntityList = [];
            this.showRoleFormDialogFlag = true;
            this.roleFormDialogLoading = true;
            getBlankRoleData()
                .then((res) => {
                    if (res && res.data.code == 200) {
                        let resData = res.data.data;
                        this.formModel.roleId = "";
                        this.formModel.roleName = resData.roleName;
                        this.formModel.disabled = resData.disabled;
                        this.formModel.description = resData.description;
                        this.formModel.rightValueMap = resData.rightValueMap;
                        this.rightEntityList = copyNew(resData.rightEntityList);
                    }
                    this.roleFormDialogLoading = false;
                })
                .catch((res) => {
                    this.$message({ message: res.message, type: "error" });
                    this.roleFormDialogLoading = false;
                });
        },

        handleReadRightChange(entityCode, readRight) {
            this.adjustEntityRight(entityCode, 2, readRight);
            this.adjustEntityRight(entityCode, 3, readRight);
            this.adjustEntityRight(entityCode, 4, readRight);
        },

        adjustEntityRight(entityCode, rightType, readRight) {
            let entityRight =
                this.formModel.rightValueMap[
                    "r" + entityCode + "-" + rightType
                ];
            if (!entityRight) {
                entityRight = 0;
            }

            if (entityRight > readRight) {
                this.formModel.rightValueMap[
                    "r" + entityCode + "-" + rightType
                ] = readRight;
            }
        },

        handleEntityRightChange(entityCode, rightType, val) {
            let entityReadRight =
                this.formModel.rightValueMap["r" + entityCode + "-1"];
            if (!entityReadRight) {
                entityReadRight = 0;
            }

            if (val > entityReadRight) {
                let infoContent = "新建权限不能高于查看权限";
                if (rightType === 2) {
                    //
                }
                if (rightType === 3) {
                    infoContent = "修改权限不能高于查看权限";
                }
                if (rightType === 4) {
                    infoContent = "删除权限不能高于查看权限";
                }
                this.$message.info(infoContent);
                this.formModel.rightValueMap[
                    "r" + entityCode + "-" + rightType
                ] = entityReadRight;
            }
        },

        saveRole() {
            this.$refs["roleForm"].validate((valid) => {
                if (valid) {
                    //TODO 检查实体权限是否合理，比如删除权限是否大于读取权限
                    this.roleFormDialogLoading = true;
                    saveRoleData(this.formModel)
                        .then((res) => {
                            if (res.data.code == 200) {
                                this.$message.success("保存成功");
                                this.showRoleFormDialogFlag = false;
                                this.$refs.mlSingleListRef.getTableList();
                            }
                            this.roleFormDialogLoading = false;
                        })
                        .catch((res) => {
                            console.log(res,'res')
                            this.$message({
                                message: res.message,
                                type: "error",
                            });
                            this.roleFormDialogLoading = false;
                        });
                } else {
                    this.$nextTick(() => {
                        this.elFormErrorScrollIntoView();
                    });
                    return false;
                }
            });
        },
        elFormErrorScrollIntoView() {
            // 获取第一个校验错误的元素
            const element = document.querySelectorAll(
                ".el-form-item__error"
            )[0];
            // 滚动到错误元素对应位置
            element.scrollIntoView({
                behavior: "smooth",
                block: "center",
            });
        },

        editRole(row) {
            if (row.roleId === "023-000000000000000000000000000000000001") {
                this.$message.info("管理员角色禁止修改！");
                return;
            }
            this.rightEntityList = [];
            this.showRoleFormDialogFlag = true;
            this.roleFormDialogLoading = true;
            getRoleData(row.roleId)
                .then((res) => {
                    if (res && res.data.code == 200) {
                        const resData = res.data.data;
                        this.formModel.roleId = resData.roleId;
                        this.formModel.roleName = resData.roleName;
                        this.formModel.disabled = resData.disabled;
                        this.formModel.description = resData.description;
                        this.formModel.rightValueMap = resData.rightValueMap;
                        this.rightEntityList = copyNew(resData.rightEntityList);
                    }
                    this.roleFormDialogLoading = false;
                })
                .catch((res) => {
                    this.$message({ message: res.message, type: "error" });
                    this.roleFormDialogLoading = false;
                });
        },

        deleteRole(row) {
            if (row.roleId === "023-000000000000000000000000000000000001") {
                this.$message.info("管理员角色禁止删除！");
                return;
            }

            this.$confirm("是否删除该权限角色?", "删除确认")
                .then(() => {
                    deleteRoleById(row.roleId)
                        .then((res) => {
                            if (res.error != null) {
                                this.$message({
                                    message: res.error,
                                    type: "error",
                                });
                                return;
                            }

                            this.$message.success("删除成功");
                            this.$refs.mlSingleListRef.getTableList();
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
.el-container {
    width: 100% !important;
    overflow-x: hidden; /* 注意：IE浏览器中会出现水平滚动条，暂未找到原因！！ */
}

.small-padding :deep(.el-dialog__body) {
    padding: 18px;
}

.el-row.entity-right-row {
    margin-top: 6px;
    margin-bottom: 6px;
}

.el-row.function-right-row {
    margin-top: 0;
    margin-bottom: 0;

    :deep(.el-form-item) {
        margin-bottom: 6px;
    }
}

.entity-right-setting {
    width: 100%;
    height: 30px;
    &.title {
        height: 24px;
        line-height: 24px;
    }
    .label {
        width: 150px;
        height: 24px;
    }
    .text-align-center {
        text-align: center;
        width: 150px;
        box-sizing: border-box;
        padding: 0 5px;
    }
    .text-icon {
        height: 30px;
        line-height: 30px;
        .text-icon-span {
            cursor: pointer;
            position: relative;
            top: 2px;
        }
    }
    .bold {
        font-weight: bold;
    }
}

.text-icon-all {
    cursor: pointer;
    position: relative;
    top: 4px;
}

.entity-right-setting-body {
    height: 400px;
    padding: 10px 0;
    padding-top: 5px;
}

// .el-row.entity-right-setting {
//     margin-top: 0;
//     margin-bottom: 0;
//     font-size: 12px;
//     //font-style: italic;

//     .el-col.text-align-center {
//         text-align: center;
//     }

//     .bold {
//         //font-weight: 600;
//         //text-decoration: underline;
//     }
// }

// .el-row.function-right-setting {
//     margin-top: 15px;
//     margin-bottom: 0;
//     font-size: 12px;
// }
</style>
