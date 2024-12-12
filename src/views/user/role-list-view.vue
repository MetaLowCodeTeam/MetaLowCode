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
            :filterItems="tableConf.filterItems"
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
                <el-table-column label="操作" :align="'center'" width="140" fixed="right">
                    <template #default="scope">
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
        <el-dialog
            :title="formModel.roleId ? '编辑权限角色':'新建权限角色'"
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
                ref="roleFormRes"
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
                                <el-radio :value="true">是</el-radio>
                                <el-radio :value="false">否</el-radio>
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
                            <div class="fl label">
                                <el-input
                                    size="small"
                                    v-model="filterStr"
                                    placeholder="过滤实体（回车搜索）"
                                    @keyup.enter="queryEntity"
                                >
                                    <template #prefix>
                                        <el-icon class="el-input__icon">
                                            <ElIconSearch />
                                        </el-icon>
                                    </template>
                                </el-input>
                            </div>
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
                                    v-for="(rightEntity, entityIdx) in filterEntityList"
                                    :key="entityIdx"
                                >
                                    <div class="fl label">{{ rightEntity.label }}</div>
                                    <div class="fl text-align-center">
                                        <mlSelectCom
                                            v-model="formModel.rightValueMap['r' + rightEntity.entityCode + '-1']"
                                            :options="getRightLevels(rightEntity)"
                                        />
                                    </div>
                                    <div class="fl text-align-center">
                                        <mlSelectCom
                                            v-model="formModel.rightValueMap['r' + rightEntity.entityCode + '-2']"
                                            :options="oneselfRightLevels"
                                        />
                                    </div>
                                    <div class="fl text-align-center">
                                        <mlSelectCom
                                            v-model="formModel.rightValueMap['r' + rightEntity.entityCode + '-3']"
                                            :options="getRightLevels(rightEntity)"
                                        />
                                    </div>
                                    <div class="fl text-align-center">
                                        <mlSelectCom
                                            v-model="formModel.rightValueMap['r' + rightEntity.entityCode + '-4']"
                                            :options="getRightLevels(rightEntity)"
                                        />
                                    </div>
                                    <div class="fl text-align-center">
                                        <mlSelectCom
                                            v-model="formModel.rightValueMap['r' + rightEntity.entityCode + '-5']"
                                            :options="getRightLevels(rightEntity)"
                                            :disabled="!rightEntity.authorizable"
                                        />
                                    </div>
                                    <div class="fl text-align-center">
                                        <mlSelectCom
                                            v-model="formModel.rightValueMap['r' + rightEntity.entityCode + '-6']"
                                            :options="getRightLevels(rightEntity)"
                                        />
                                    </div>
                                    <div class="fl text-icon">
                                        <mlSelectCom :options="getRightLevels(rightEntity)" @onChange="(e) => rowHandleCommand(e,rightEntity)">
                                            <template #default>
                                                <span class="text-icon-span">
                                                    <el-icon size="16">
                                                        <ElIconFinished />
                                                    </el-icon>
                                                </span>
                                            </template>
                                        </mlSelectCom>
                                    </div>
                                </div>
                            </el-scrollbar>
                        </div>
                    </el-tab-pane>

                    <el-tab-pane label="系统权限">
                        <el-row>
                            <hr style="border: 0;border-top: 1px dotted #cccccc" />
                        </el-row>
                        <el-row :gutter="12" class="function-right-row">
                            <el-col
                                :span="12"
                                v-for="(funcItem,funcInx) of funcRight"
                                :key="funcInx"
                            >
                                <el-form-item :title="funcItem.value">
                                    <template #label>
                                        {{ funcItem.label }}
                                    </template>
                                    <el-radio-group
                                        v-model="formModel.rightValueMap[funcItem.value]"
                                    >
                                        <el-radio :value="true">是</el-radio>
                                        <el-radio :value="false">否</el-radio>
                                    </el-radio-group>
                                </el-form-item>
                            </el-col>
                        </el-row>
                    </el-tab-pane>
                    <el-tab-pane label="功能权限" v-if="formModel.customRightList && formModel.customRightList.length > 0">
                        <el-row>
                            <hr style="border: 0;border-top: 1px dotted #cccccc" />
                        </el-row>
                        <el-row :gutter="12" class="function-right-row">
                            <el-col
                                :span="12"
                                v-for="(funcItem,funcInx) of formModel.customRightList"
                                :key="funcInx"
                            >
                                <el-form-item :title="funcItem.value">
                                    <template #label>
                                        {{ funcItem.label }}
                                    </template>
                                    <el-radio-group
                                        v-model="formModel.rightValueMap[funcItem.value]"
                                    >
                                        <el-radio :value="true">是</el-radio>
                                        <el-radio :value="false">否</el-radio>
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

<script setup>
import { copyNew } from "@/utils/util";
import {
    deleteRoleById,
    getBlankRoleData,
    getRoleData,
    saveRoleData,
} from "@/api/user";
import { inject, nextTick, ref, shallowRef } from "vue";
import { ElMessageBox, ElMessage } from "element-plus";
import mlSelectCom from "@/components/mlSelectCom/index.vue";
const $TOOL = inject("$TOOL");

let mlSingleListRef = ref();
// 表格参数
let tableConf = ref({
    entity: "Role",
    fieldsList: "roleName, disabled, description,createdBy",
    // 默认搜索字段
    fieldName: "roleName",
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

// 添加角色
const addNewRole = () => {
    rightEntityList.value = [];
    showRoleFormDialogFlag.value = true;
    roleFormDialogLoading.value = true;
    getBlankRoleData()
        .then((res) => {
            if (res && res.data.code == 200) {
                let resData = res.data.data;
                formModel.value.roleId = "";
                formModel.value.roleName = resData.roleName;
                formModel.value.disabled = resData.disabled;
                formModel.value.description = resData.description;
                formModel.value.rightValueMap = resData.rightValueMap;
                rightEntityList.value = copyNew(resData.rightEntityList);
                queryEntity();
            }
            roleFormDialogLoading.value = false;
        })
        .catch((res) => {
            ElMessage.error(res.message);
            roleFormDialogLoading.value = false;
        });
};
// 编辑角色
const editRole = (row) => {
    if (row.roleId === "023-000000000000000000000000000000000001") {
        ElMessage.info("管理员角色禁止修改！");
        return;
    }
    rightEntityList.value = [];
    showRoleFormDialogFlag.value = true;
    roleFormDialogLoading.value = true;
    getRoleData(row.roleId)
        .then((res) => {
            if (res && res.data.code == 200) {
                const resData = res.data.data;
                formModel.value.roleId = resData.roleId;
                formModel.value.roleName = resData.roleName;
                formModel.value.disabled = resData.disabled;
                formModel.value.description = resData.description;
                formModel.value.rightValueMap = resData.rightValueMap;
                formModel.value.customRightList = resData.customRightList;
                rightEntityList.value = copyNew(resData.rightEntityList);
                queryEntity();
            }
            roleFormDialogLoading.value = false;
        })
        .catch((res) => {
            ElMessage.error(res.message);
            roleFormDialogLoading.value = false;
        });
};

// 删除角色
const deleteRole = (row) => {
    if (row.roleId === "023-000000000000000000000000000000000001") {
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

/**
 * ************************************************************** 角色弹框
 */

// 是否显示角色弹框
let showRoleFormDialogFlag = ref(false);
// 角色弹框loading
let roleFormDialogLoading = ref(false);
// 权限数据
let rightEntityList = shallowRef([]);
// 过滤值
let filterStr = ref("");
let filterEntityList = shallowRef([]);

const queryEntity = () => {
    roleFormDialogLoading.value = true;
    if (!filterStr.value) {
        filterEntityList.value = [...rightEntityList.value];
    } else {
        filterEntityList.value = rightEntityList.value.filter(
            (el) => el.label.indexOf(filterStr.value) != -1
        );
    }
    setTimeout(() => {
        roleFormDialogLoading.value = false;
    }, 300);
};

// 角色弹框
let roleFormRes = ref();
// 弹框数据
let formModel = ref({
    roleId: "",
    roleName: "",
    disabled: false,
    description: "",
    rightValueMap: {},
});

// 表单验证
const validateRoleName = (rule, value, callback) => {
    if (!value) {
        callback(new Error("请输入角色名称"));
        return;
    }
    if (value.length < 2) {
        callback(new Error("请输入至少两个字符"));
        return;
    }
    if (value.length > 30) {
        callback(new Error("名字最多只能30个字符"));
        return;
    }
    let regEx = /^[A-Za-z\d\u4e00-\u9fa5]+[_-]*/;
    if (!regEx.test(value)) {
        callback(
            new Error("请以中文、英文字母、数字开头，中间可输入下划线或横杠")
        );
        return;
    }
    callback();
};
let formRules = shallowRef({
    roleName: [{ validator: validateRoleName, trigger: "blur" }],
});
// 功能权限
let funcRight = shallowRef([
    {
        label: "开发应用",
        value: "r6017",
    },
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
        label: "列表页面设计",
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
        label: "触发器执行日志",
        value: "r6015",
    },
    {
        label: "流程配置管理",
        value: "r6016",
    },
]);

const handleReadRightChange = (entityCode, readRight) => {
    adjustEntityRight(entityCode, 2, readRight);
    adjustEntityRight(entityCode, 3, readRight);
    adjustEntityRight(entityCode, 4, readRight);
};

const adjustEntityRight = (entityCode, rightType, readRight) => {
    let entityRight =
        formModel.value.rightValueMap["r" + entityCode + "-" + rightType];
    if (!entityRight) {
        entityRight = 0;
    }

    if (entityRight > readRight) {
        formModel.value.rightValueMap["r" + entityCode + "-" + rightType] =
            readRight;
    }
};

const handleEntityRightChange = (entityCode, rightType, val) => {
    let entityReadRight =
        formModel.value.rightValueMap["r" + entityCode + "-1"];
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
        ElMessage.info(infoContent);
        formModel.value.rightValueMap["r" + entityCode + "-" + rightType] =
            entityReadRight;
    }
};

let rowRightLevels = shallowRef([
    { label: "无权限", value: 0 },
    { label: "本人", value: 10 },
    { label: "本部门", value: 20 },
    { label: "本部门及以下", value: 30 },
    { label: "上级部门及以下", value: 40 },
    { label: "全部数据", value: 50 },
]);


let departmentRightLevels = shallowRef([
    { label: "无权限", value: 0 },
    { label: "本部门", value: 20 },
    { label: "本部门及以下", value: 30 },
    { label: "上级部门及以下", value: 40 },
    { label: "全部数据", value: 50 },
]);


let simpleRightLevels = shallowRef([
    { label: "无权限", value: 0 },
    { label: "全部数据", value: 50 },
]);

let oneselfRightLevels = shallowRef([
    { label: "不允许", value: 0 },
    { label: "允许", value: 50 },
]);

const getRightLevels = (rightEntity) => {
    if(rightEntity.name == 'Department'){
        return departmentRightLevels.value;
    }
    if (rightEntity.authorizable === true) {
        return rowRightLevels.value;
    } else {
        return simpleRightLevels.value;
    }
};

// 单行设置权限
const rowHandleCommand = (command, row) => {
    let { entityCode, authorizable } = row;
    for (let index = 1; index < 7; index++) {
        // 新建
        if (index == 2 || !authorizable) {
            formModel.value.rightValueMap["r" + entityCode + "-" + index] = command > 0 ? 50 : 0;
        } 
        // 分配
        if (index == 5 && !authorizable) {
            formModel.value.rightValueMap["r" + entityCode + "-" + index] = 0;
        } 
        else {
            formModel.value.rightValueMap["r" + entityCode + "-" + index] = command;
        }
    }
};
// 设置所有数据权限
const allHandleCommand = (command) => {
    rightEntityList.value.forEach((el) => {
        formModel.value.rightValueMap["r" + el.entityCode + "-1"] = command;
        formModel.value.rightValueMap["r" + el.entityCode + "-2"] = command;
        formModel.value.rightValueMap["r" + el.entityCode + "-3"] = command;
        formModel.value.rightValueMap["r" + el.entityCode + "-4"] = command;
        formModel.value.rightValueMap["r" + el.entityCode + "-5"] = command;
        formModel.value.rightValueMap["r" + el.entityCode + "-6"] = command;
    });
    queryEntity();
};

const saveRole = () => {
    roleFormRes.value.validate((valid) => {
        if (valid) {
            //TODO 检查实体权限是否合理，比如删除权限是否大于读取权限
            roleFormDialogLoading.value = true;
            saveRoleData(formModel.value)
                .then((res) => {
                    if (res && res.data?.code == 200) {
                        ElMessage.success("保存成功");
                        showRoleFormDialogFlag.value = false;
                        mlSingleListRef.value.getTableList();
                    }
                    roleFormDialogLoading.value = false;
                })
                .catch((res) => {
                    console.log(res, "res");
                    ElMessage({
                        message: res.message,
                        type: "error",
                    });
                    roleFormDialogLoading.value = false;
                });
        } else {
            nextTick(() => {
                elFormErrorScrollIntoView();
            });
            return false;
        }
    });
};

const elFormErrorScrollIntoView = () => {
    // 获取第一个校验错误的元素
    const element = document.querySelectorAll(".el-form-item__error")[0];
    // 滚动到错误元素对应位置
    element.scrollIntoView({
        behavior: "smooth",
        block: "center",
    });
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
            top: -1px;
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
</style>
