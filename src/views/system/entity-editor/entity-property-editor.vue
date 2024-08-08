<template>
    <el-container class="entity-props-container" v-loading="loading">
        <el-header v-if="showTitle" class="entity-props-header">&lt;实体&gt;属性设置</el-header>
        <el-main class="entity-props-pane">
            <el-form
                :model="myEntityProps"
                :rules="rules"
                ref="entityPropsForm"
                label-position="left"
                label-width="230px"
            >
                <el-form-item label="显示名称" prop="label">
                    <el-input
                        v-model="myEntityProps.label"
                        minlength="2"
                        placeholder="以中文、英文字母、数字开头，中间可输入下划线或横杠"
                        @change="handleEntityLabelChange"
                    ></el-input>
                </el-form-item>
                <el-form-item label="实体名称" prop="name">
                    <!-- prop必须跟v-model名称一致！！ -->
                    <el-input
                        v-model="myEntityProps.name"
                        minlength="2"
                        placeholder="英文大写字母开头，不可包含中文、空格，中间可输入字母、下划线"
                    >
                        <template #append>
                            <el-button @click="generateEntityName">刷新生成</el-button>
                        </template>
                    </el-input>
                </el-form-item>
                <el-form-item label="实体编码" v-if="!myEntityProps.activeType == 2">
                    <el-input
                        v-model="myEntityProps.entityCode"
                        readonly
                        disabled
                        placeholder="系统自动生成"
                    ></el-input>
                </el-form-item>
                <el-form-item label="是否允许设计表单">
                    <el-switch
                        style="display: block; float: right"
                        v-model="myEntityProps.layoutable"
                        active-text="是"
                        inactive-text="否"
                        @change="changeAuthorization"
                        :disabled="myEntityProps.activeType == 2"
                    ></el-switch>
                </el-form-item>
                <el-form-item label="是否允许设计列表">
                    <el-switch
                        style="display: block; float: right"
                        v-model="myEntityProps.listable"
                        active-text="是"
                        inactive-text="否"
                        @change="changeAuthorization"
                        :disabled="myEntityProps.activeType == 2"
                    ></el-switch>
                </el-form-item>
                <el-form-item label="是否开启记录级权限">
                    <el-switch
                        style="display: block; float: right"
                        v-model="myEntityProps.authorizable"
                        active-text="是"
                        inactive-text="否"
                        @change="changeAuthorization"
                        :disabled="myEntityProps.activeType == 2"
                    ></el-switch>
                </el-form-item>
                <!--
				<el-form-item label="是否允许分配记录">
				  <el-switch style="display: block; float: right" v-model="myEntityProps.assignable"
							 active-text="开启" inactive-text="禁用" :disabled="!myEntityProps.authorizable">
				  </el-switch>
				</el-form-item>
				<el-form-item label="是否允许共享记录">
				  <el-switch style="display: block; float: right" v-model="myEntityProps.shareable"
							 active-text="开启" inactive-text="禁用" :disabled="!myEntityProps.authorizable">
				  </el-switch>
				</el-form-item>
                -->
                <el-form-item>
                    <template #label>
                        是否明细实体
                        <el-tooltip content="明细实体不能单独设置权限，受主实体控制" effect="light">
                            <el-icon>
                                <InfoFilled />
                            </el-icon>
                        </el-tooltip>
                    </template>
                    <el-switch
                        style="display: block; float: right"
                        v-model="myEntityProps.detailEntityFlag"
                        active-text="是"
                        inactive-text="否"
                        @change="onToggleDetailEntityFlag"
                        :disabled="myEntityProps.activeType == 2"
                    ></el-switch>
                </el-form-item>
                <el-form-item label="所属主实体">
                    <el-input
                        readonly
                        :disabled="!myEntityProps.detailEntityFlag"
                        v-model="mainEntityName"
                    >
                        <template
                            #append
                            v-if="!!myEntityProps.detailEntityFlag && !!mainEntityName"
                        >
                            <el-button icon="el-icon-close" title="清除" @click="clearMainEntity"></el-button>
                        </template>
                        <template #append v-else-if="!!myEntityProps.detailEntityFlag">
                            <el-button
                                icon="el-icon-search"
                                title="选择主实体"
                                @click="showEntityListDialog"
                            ></el-button>
                        </template>
                    </el-input>
                </el-form-item>
                <el-form-item label="标签">
                    <div class="w-100 clearfix">
                        <el-check-tag
                            class="mr-5 entity-check-tag"
                            v-for="(item,inx) of myEntityProps.useTag"
                            :key="inx"
                            :checked="item.checked"
                            @change="onTagsChange(item)"
                        >
                            <span>{{ item.name }}</span>
                            <span class="del-tag del-tag-span" @click.stop="delTags(inx)">
                                <el-icon>
                                    <ElIconCircleClose />
                                </el-icon>
                            </span>
                            <span class="del-tag del-tag-span-hover" @click.stop="delTags(inx)">
                                <el-icon>
                                    <ElIconCircleCloseFilled />
                                </el-icon>
                            </span>
                        </el-check-tag>
                        <el-input
                            v-if="inputVisible"
                            class="mb-5"
                            ref="InputRef"
                            v-model="tagValue"
                            style="width: 100px;"
                            @keyup.enter="handleInputConfirm"
                            @blur="handleInputConfirm"
                        />
                        <el-button
                            v-else
                            class="mb-5 button-new-tag ml-1"
                            @click="showInput"
                            :disabled="myEntityProps.useTag?.length > 49"
                        >+ 新增标签</el-button>
                    </div>
                    <div class="w-100 info-text">注：点击标签后颜色加深为选中状态，再次点击取消选中，可点击叉号删除标签。</div>
                </el-form-item>
                <el-form-item label="复制模块" v-if="myEntityProps.activeType == 2">
                    <el-checkbox-group
                        v-model="copyEntiytSelectedType"
                        v-if="!myEntityProps.hasDetailEntity"
                    >
                        <el-checkbox :label="0" disabled>实体字段</el-checkbox>
                        <el-checkbox
                            v-for="(type,typeInx) of copyTypes"
                            :key="typeInx"
                            :label="type.value"
                        >{{ type.label }}</el-checkbox>
                    </el-checkbox-group>
                    <el-checkbox-group v-model="copyEntiytSelectedType" v-else>
                        <el-checkbox :label="0" disabled>实体字段</el-checkbox>
                        <el-checkbox
                            v-for="(type,typeInx) of copyTypes"
                            :key="typeInx"
                            :label="type.value"
                            disabled
                        >
                            <el-tooltip
                                class="box-item"
                                effect="dark"
                                :content="'当前实体包含子实体，无法复制' + type.label"
                                placement="bottom"
                            >{{ type.label }}</el-tooltip>
                        </el-checkbox>
                    </el-checkbox-group>
                </el-form-item>
            </el-form>
        </el-main>

        <el-dialog
            ref="selectMainEntityDlg"
            title="选择主实体"
            v-model="showMainEntityDialogFlag"
            :append-to-body="true"
            class="no-padding"
            width="560px"
        >
            <SimpleTable
                :show-pagination="false"
                :show-check-box="false"
                :table-size="'small'"
                :columns="columns"
                :show-operation-column="true"
                :data="tableData"
                :max-height="420"
            >
                <template #table_operation="{scope}">
                    <el-button class icon="el-icon-check" @click="selectMainEntity(scope.row)">选择</el-button>
                </template>
            </SimpleTable>
        </el-dialog>
    </el-container>
</template>

<script setup>
import { getSimplePinYin, upperFirstLetter } from "@/utils/util";
import { ElMessage } from "element-plus";
import { watch, ref, onMounted, nextTick } from "vue";
const props = defineProps({
    entityProps: { type: Object, default: () => {} },
    showTitle: { type: Boolean, default: false },
    filterEntityMethod: { type: Function },
});
let myEntityProps = ref({});
let loading = ref(false);
watch(
    () => props.entityProps,
    () => {
        myEntityProps.value = props.entityProps;
    },
    { deep: true }
);
let copyTypes = ref([
    {
        label: "表单设计",
        value: 1,
    },
    {
        label: "列表设计",
        value: 2,
    },
    {
        label: "审批流程",
        value: 4,
    },
]);
let copyEntiytSelectedType = ref([0]);

onMounted(() => {
    myEntityProps.value = props.entityProps;
});

let rules = ref({
    name: [
        { required: true, message: "请输入实体名称", trigger: "blur" },
        {
            pattern: /^[A-Z]+[A-Za-z\d_]*$/,
            message:
                "英文大写字母开头，不可包含中文、空格，中间可输入字母、下划线",
            trigger: "blur",
        },
        { min: 2, max: 30, message: "文字长度应在2-30之间", trigger: "blur" },
    ],
    label: [
        { required: true, message: "请输入显示名称", trigger: "blur" },
        {
            pattern:
                /^[A-Za-z\d\u4e00-\u9fa5\uff0c\u3001\uff1b\uff1a\uff08\uff09\u2014\u201c\u201d]+[_-]*[A-Za-z\d\u4e00-\u9fa5\uff0c\u3001\uff1b\uff1a\uff08\uff09\u2014\u201c\u201d]/,
            message: "以中文、英文字母、数字开头，中间可输入下划线或横杠",
            trigger: "blur",
        },
        { min: 2, max: 30, message: "文字长度应在2-30之间", trigger: "blur" },
    ],
});

let showMainEntityDialogFlag = ref(false);
let mainEntityName = ref("");
let columns = ref([
    { prop: "name", label: "实体名称", width: "150", align: "center" },
    {
        prop: "label",
        label: "显示名称",
        width: "200",
        align: "center",
    },
]);

let tableData = ref([]);

const onToggleDetailEntityFlag = (val) => {
    if (!!val) {
        myEntityProps.value.authorizable = false;
        myEntityProps.value.listable = false;
        myEntityProps.value.layoutable = false;
    }
};

const showEntityListDialog = () => {
    if (!myEntityProps.value.detailEntityFlag) {
        return;
    }

    if (!!props.filterEntityMethod) {
        props.filterEntityMethod(tableData.value, () => {
            showMainEntityDialogFlag.value = true;
        });
    }
};

const selectMainEntity = (row) => {
    if (!!row) {
        myEntityProps.value.mainEntity = row.name;
        mainEntityName.value = row.label + "(" + row.name + ")";
        showMainEntityDialogFlag.value = false;
    }
};

const clearMainEntity = () => {
    mainEntityName.value = "";
    myEntityProps.value.mainEntity = "";
};

const changeAuthorization = (value) => {
    if (!value) {
        myEntityProps.value.assignable = false;
        myEntityProps.value.shareable = false;
    } else {
        myEntityProps.value.detailEntityFlag = false;
    }
};

let entityPropsForm = ref();

const validateForm = (callback) => {
    entityPropsForm.value.validate((success) => {
        if (!success) {
            ElMessage.error("数据不合规范，请检查");
        } else {
            if (
                !!myEntityProps.value.detailEntityFlag &&
                !mainEntityName.value
            ) {
                ElMessage.info("请选择所属主实体");
                return;
            }
            callback();
        }
    });
};

const handleEntityLabelChange = (val) => {
    if (!val) {
        return;
    }

    if (!myEntityProps.value.name) {
        const pyName = getSimplePinYin(val);
        myEntityProps.value.name = upperFirstLetter(pyName);
    }
};

const generateEntityName = () => {
    if (myEntityProps.value.label) {
        let newName = getSimplePinYin(myEntityProps.value.label);
        newName = newName.replaceAll("-", "_");
        myEntityProps.value.name = upperFirstLetter(newName);
    }
};

/**
 * 标签相关
 */

// tag名称
let tagValue = ref("");
// 新建taginput是否显示
let inputVisible = ref(false);
const InputRef = ref();
// 新建Tag显示
const showInput = () => {
    inputVisible.value = true;
    nextTick(() => {
        InputRef.value.focus();
    });
};
// 新建确认
const handleInputConfirm = () => {
    let hasTag = myEntityProps.value.useTag.filter(
        (el) => el.name == tagValue.value
    );
    if (tagValue.value && hasTag.length < 1) {
        myEntityProps.value.useTag.push({
            name: tagValue.value,
            checked: true,
        });
    }
    inputVisible.value = false;
    tagValue.value = "";
};
// 删除tags
const delTags = (inx) => {
    myEntityProps.value.useTag.splice(inx, 1);
};
// 标签选中切换
const onTagsChange = (item) => {
    item.checked = !item.checked;
};

defineExpose({
    validateForm,
    entityProps: myEntityProps.value,
    loading,
    copyEntiytSelectedType,
});
</script>

<style lang="scss" scoped>
.button-new-tag {
    height: 30px;
    float: left;
    color: var(--el-color-info);
}
.el-container.entity-props-container {
    min-width: 500px;
    // color="#f4f4f5"
    // border: 1px solid #e5e5e5;
}

.el-header.entity-props-header {
    /* background: $--color-primary; */
    background: #cac6c6;
    color: #ffffff;
    text-align: center;
    line-height: 36px !important;
    height: 36px !important;
}

.el-main.entity-props-pane {
    padding: 20px;

    .float-right {
        float: right;
    }
}

:deep(.no-padding .el-dialog__body) {
    padding: 0;
}

:deep(.el-form-item__label) {
    align-items: center;
}

.entity-check-tag {
    margin-bottom: 8px;
    float: left;
    .del-tag {
        position: relative;
        top: 2px;
        left: 5px;
    }
    .del-tag-span-hover {
        display: none;
    }
    &:hover {
        .del-tag-span {
            display: none;
        }
        .del-tag-span-hover {
            display: inline-block;
            color: var(--el-color-primary);
        }
    }
}

/*:deep(.el-switch__label) * {*/
/*  font-size: 12px;*/
/*}*/
</style>
