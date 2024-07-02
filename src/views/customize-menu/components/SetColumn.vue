<template>
    <mlDialog
        :title="editColumnDialog.chosenListType != 'BATCH_UPDATE' ? '设置列显示' : '批量编辑设置'"
        v-model="isShow"
        width="650px"
        appendToBody
    >
        <div v-loading="loading">
            <div class="clearfix">
                <div class="sortable-box fl">
                    <VueDraggableNext
                        ghost-class="ghost"
                        chosen-class="chosenClass"
                        animation="300"
                        :force-fallback="false"
                        handle=".mover"
                        :list="showColumn"
                    >
                        <div class="parent-li" v-for="(parent,inx) of showColumn" :key="inx">
                            <div class="paren-idv">
                                <div class="mover fl">
                                    <el-icon size="20" class="icon">
                                        <ElIconRank />
                                    </el-icon>
                                </div>
                                <div
                                    class="fl item text-ellipsis"
                                    :class="{'tag':isShowItemTag(parent)}"
                                >{{ parent.fieldLabel }}</div>
                                <div class="action-icon">
                                    <span
                                        class="icon-span add-icon mr-5"
                                        @click.stop="editColumn(parent,inx)"
                                        v-if="editColumnDialog.chosenListType != 'BATCH_UPDATE'"
                                    >
                                        <el-icon size="15">
                                            <ElIconEditPen />
                                        </el-icon>
                                    </span>
                                    <span class="icon-span" @click.stop="delColumn(parent,inx)">
                                        <el-icon size="16">
                                            <ElIconCloseBold />
                                        </el-icon>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </VueDraggableNext>
                </div>
                <div class="fl right-div">
                    <el-input
                        class="right-div-input"
                        v-model="searchField"
                        placeholder="筛选字段"
                        clearable
                    >
                        <template #prefix>
                            <el-icon class="el-input__icon">
                                <ElIconSearch />
                            </el-icon>
                        </template>
                    </el-input>
                    <div
                        class="source-column-box"
                        :class="{'need-auto':notShowColumn().length > 8}"
                    >
                        <div
                            class="column-li"
                            v-for="(column,inx) of notShowColumn()"
                            :key="inx"
                            @click="addShowColumn(column)"
                        >
                            <div class="fl column-item text-ellipsis">{{ column.fieldLabel }}</div>
                            <span class="fr icon-span">
                                <el-icon size="16">
                                    <ElIconPlus />
                                </el-icon>
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <template #footer>
            <div class="footer-div">
                <el-button @click="isShow = false" :loading="loading">取消</el-button>
                <el-button type="primary" @click="onSave" :loading="loading">保存</el-button>
            </div>
        </template>
        <mlDialog
            v-model="editColumnDialogIsShow"
            v-if="editColumnDialogIsShow"
            appendToBody
            title="列设置"
            width="450"
            top="25vh"
        >
            <div class="pr-40">
                <el-form label-width="100px">
                    <el-form-item label="别名" class="mb-10">
                        <el-input v-model="editColumnDialogData.columnAliasName" />
                    </el-form-item>
                    <el-form-item label="默认排序" class="mb-5">
                        <span
                            class="sort-span"
                            :class="{'is-active': editColumnDialogData.columnSort != ''}"
                            @click="changeColumnSort"
                        >
                            {{ editColumnDialogData.columnSort == 'ASC' ? '升序' : '降序' }}
                            <el-icon class="sort-icon">
                                <ElIconTop v-if="editColumnDialogData.columnSort == 'ASC'" />
                                <ElIconBottom v-else />
                            </el-icon>
                        </span>
                    </el-form-item>
                    <el-form-item label="默认列宽" class="mb-10">
                        <el-input-number
                            v-model="editColumnDialogData.columnWidth"
                            :min="0"
                            :max="500"
                            controls-position="right"
                            :step="10"
                        />
                        <span
                            class="info-text ml-10"
                        >{{ editColumnDialogData.columnWidth > 0 ? "宽度 " + editColumnDialogData.columnWidth : '默认' }}</span>
                    </el-form-item>
                    <el-form-item label="字体大小" class="mb-10">
                        <el-input-number
                            v-model="editColumnDialogData.fontSize"
                            :min="12"
                            :max="24"
                            controls-position="right"
                            :step="1"
                        />
                        <span class="info-text ml-10">
                            <span class="mr-5">表字体</span>
                            <span :style="{'font-size':editColumnDialogData.fontSize + 'px'}">大小</span>
                        </span>
                    </el-form-item>
                    <el-form-item label="字体粗细" class="mb-10">
                        <el-select v-model="editColumnDialogData.fontWeight" style="width: 150px;">
                            <el-option :label="100" :value="100" />
                            <el-option :label="200" :value="200" />
                            <el-option :label="300" :value="300" />
                            <el-option label="400(默认)" :value="400" />
                            <el-option :label="500" :value="500" />
                            <el-option :label="600" :value="600" />
                            <el-option label="700(加粗)" :value="700" />
                        </el-select>
                        <span class="info-text ml-10">
                            <span class="mr-5">表字体</span>
                            <span :style="{'font-weight':editColumnDialogData.fontWeight}">粗细</span>
                        </span>
                    </el-form-item>
                    <el-form-item label="字体颜色" class="mb-5">
                        <el-color-picker v-model="editColumnDialogData.fontColor" />
                        <span class="info-text ml-10">
                            <span class="mr-5">表字体</span>
                            <span :style="{'color':editColumnDialogData.fontColor}">颜色</span>
                        </span>
                    </el-form-item>
                    <el-form-item label="数据统计" class="mb-3">
                        <el-checkbox v-model="editColumnDialogData.dataStatistics" />
                    </el-form-item>
                    <el-form-item
                        label="统计类型"
                        v-if="editColumnDialogData.dataStatistics"
                        class="is-required mb-10"
                    >
                        <el-select
                            v-model="editColumnDialogData.statisticType"
                            placeholder="选择统计类型"
                        >
                            <el-option
                                v-for="item in getUptadeMode()"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value"
                            />
                        </el-select>
                    </el-form-item>
                    <el-form-item
                        label="显示名称"
                        class="mb-10"
                        v-if="editColumnDialogData.dataStatistics"
                    >
                        <el-input v-model="editColumnDialogData.statisticName" />
                    </el-form-item>
                </el-form>
            </div>
            <template #footer>
                <div class="footer-div">
                    <el-button @click="editColumnDialogIsShow = false">取消</el-button>
                    <el-button type="primary" @click="confirmColumnEdit">保存</el-button>
                </div>
            </template>
        </mlDialog>
    </mlDialog>
</template>

<script setup>
import { VueDraggableNext } from "vue-draggable-next";
import { watch, ref, onMounted, inject, reactive } from "vue";
import { queryEntityListableFields } from "@/api/crud";
const $API = inject("$API");
const props = defineProps({
    modelValue: null,
    // 数据
    editColumnDialog: { type: Object, default: () => {} },
});
const emit = defineEmits(["update:modelValue", "confirm"]);
const $ElMessage = inject("$ElMessage");
let isShow = ref(false);
let loading = ref(false);
watch(
    () => isShow.value,
    (v) => {
        emit("update:modelValue", v);
    },
    { deep: true }
);
onMounted(() => {
    document.body.ondrop = function (event) {
        event.preventDefault();
        event.stopPropagation();
    };
    isShow.value = props.modelValue;
    getAllColumn();
});

// 已显示列
let showColumn = ref([]);

// 源所有列
let sourceColumn = ref([]);

// 筛选字段
let searchField = ref("");
const notShowColumn = () => {
    if (!searchField) {
        return sourceColumn.value;
    } else {
        return sourceColumn.value.filter(
            (el) => el.fieldLabel.indexOf(searchField.value) != -1
        );
    }
};

// 添加显示列
const addShowColumn = (column) => {
    showColumn.value.push(column);
    for (let index = 0; index < sourceColumn.value.length; index++) {
        const el = sourceColumn.value[index];
        if (column.fieldName == el.fieldName) {
            sourceColumn.value.splice(index, 1);
            return;
        }
    }
};

// 列弹框
let editColumnDialogIsShow = ref(false);
// 编辑列数据
let editColumnDialogData = reactive({
    columnWidth: 0,
    columnSort: "",
    columnAliasName: "",
    // 字体大小
    fontSize: 13,
    // 字体颜色
    fontColor: "#606266",
    // 字体粗细
    fontWeight: 400,
    // 字段类型
    fieldType: "",
    // 数据统计
    dataStatistics: false,
    // 统计类型
    statisticType: "",
    // 显示名称
    statisticName: "",
});
let numType = ref(["Integer", "Decimal", "Percent", "Money"]);
// 获取聚合方式
const getUptadeMode = () => {
    // 如果是数字类型
    if (numType.value.includes(editColumnDialogData.fieldType)) {
        return [
            {
                label: "求和",
                value: "sum",
            },
            {
                label: "计数",
                value: "count",
            },
            {
                label: "去重计数",
                value: "countSet",
            },
            {
                label: "平均值",
                value: "average",
            },
            {
                label: "最大值",
                value: "max",
            },
            {
                label: "最小值",
                value: "min",
            },
        ];
    }
    // 非数字类型
    else {
        return [
            {
                label: "计数",
                value: "count",
            },
            {
                label: "去重计数",
                value: "countSet",
            },
        ];
    }
};
// 编辑列排序
const changeColumnSort = () => {
    if (editColumnDialogData.columnSort == "") {
        editColumnDialogData.columnSort = "DESC";
    } else if (editColumnDialogData.columnSort == "DESC") {
        editColumnDialogData.columnSort = "ASC";
    } else {
        editColumnDialogData.columnSort = "";
    }
};

// 编辑显示列
const editColumn = (column, inx) => {
    console.log(column, "column");
    editColumnDialogIsShow.value = true;
    let editObj = Object.assign({}, column);
    editObj.columnAliasName = column.columnAliasName || "";
    editObj.columnSort = column.columnSort || "";
    editObj.columnWidth = column.columnWidth || 0;
    editObj.columnEditInx = inx;
    editObj.fieldType = column.fieldType;
    editObj.dataStatistics = column.dataStatistics;
    editObj.statisticType = column.statisticType;
    editObj.statisticName = column.statisticName;
    editColumnDialogData = Object.assign(editColumnDialogData, editObj);
};

// 是否显示列标记 * 号
const isShowItemTag = (column) => {
    let { columnAliasName, columnSort, columnWidth, dataStatistics } = column;
    if (columnAliasName || columnSort || columnWidth > 0 || dataStatistics) {
        return true;
    }
    return false;
};

// 确认列修改
const confirmColumnEdit = () => {
    let oldData = Object.assign(
        {},
        showColumn.value[editColumnDialogData.columnEditInx]
    );
    // 排序有变化，清空所有排序，只保留当前字段排序
    if (oldData.columnSort != editColumnDialogData.columnSort) {
        showColumn.value.forEach((el) => {
            el.columnSort = "";
        });
    }
    showColumn.value[editColumnDialogData.columnEditInx] = Object.assign(
        {},
        editColumnDialogData
    );
    editColumnDialogIsShow.value = false;
};

// 删除显示列
const delColumn = (column, inx) => {
    showColumn.value.splice(inx, 1);
    sourceColumn.value.push(column);
};

// 获取所有列数据
const getAllColumn = async () => {
    let { config, entityCode, chosenListType } = props.editColumnDialog;
    loading.value = true;
    let res = await queryEntityListableFields(
        entityCode,
    );
    if (res) {
        showColumn.value = [];
        let hasFieldName = [];
        if (config) {
            JSON.parse(config).forEach((el) => {
                showColumn.value.push(el);
                hasFieldName.push(el.fieldName);
            });
        }
        // 如果是批量编辑需要过滤掉图片、文件类型字段 且是能修改的字段
        if (chosenListType == "BATCH_UPDATE") {
            sourceColumn.value = res.data.filter(
                (el) =>
                    !hasFieldName.includes(el.fieldName) &&
                    el.fieldType != "Picture" &&
                    el.fieldType != "File" &&
                    el.isUpdatable &&
                    !el.isUnique
            );
        } else {
            sourceColumn.value = res.data.filter(
                (el) => !hasFieldName.includes(el.fieldName)
            );
        }
    }
    loading.value = false;
};

const onSave = async () => {
    let { entityCode, applyType, shareTo, layoutConfigId, chosenListType } =
        props.editColumnDialog;

    // 非批量编辑才需要判断
    if (chosenListType != "BATCH_UPDATE" && showColumn.value.length < 1) {
        $ElMessage.warning("请至少选择 1 个列显示");
        return;
    }
    let param = {
        config: JSON.stringify([...showColumn.value]),
        entityCode,
        applyType,
        shareTo,
    };
    // console.log(param,'param')
    let apiType = chosenListType != "BATCH_UPDATE" ? "LIST" : "BATCH_UPDATE";
    loading.value = true;
    let res = await $API.layoutConfig.saveConfig(
        layoutConfigId,
        apiType,
        param
    );
    if (res) {
        $ElMessage.success("保存成功！");
        isShow.value = false;
        emit("confirm");
    }
    loading.value = false;
};


</script>
<style lang='scss' scoped>
div {
    box-sizing: border-box;
}
.sortable-box {
    height: 388px;
    border: 1px solid #eee;
    padding: 2px;
    z-index: 1;
    margin-bottom: 12px;
    overflow-x: auto;
    width: 48%;

    &::-webkit-scrollbar {
        display: none;
    }
    &:hover {
        &::-webkit-scrollbar {
            display: block;
        }
    }
}

.right-div {
    width: 48%;
    margin-left: 4%;
    border: 1px solid #eee;
    height: 388px;
    box-sizing: border-box;
    line-height: 0;
    padding: 2px;
}
.parent-li {
    // height: 888px;
    font-size: 13px;
    color: #303030;
    text-decoration: none;
    background: none repeat scroll 0 0 #fff;

    .paren-idv {
        height: 36px;
        margin-bottom: 3px;
        position: relative;
        .text-ellipsis.tag {
            &::before {
                content: "*";
                color: #fdd455;
                font-size: 16px;
                position: relative;
                top: 2px;
                left: -2px;
            }
        }
        &:hover {
            .action-icon {
                display: block;
            }
        }
        &.is-active {
            background: #dedede;
        }
    }
}
.action-icon {
    position: absolute;
    right: 10px;
    top: 10px;
    display: none;
    .icon-span {
        cursor: pointer;
        display: inline-block;
        color: #a1a1a1;
        &.add-icon {
            position: relative;
            top: -1px;
        }
        &:hover {
            color: #666;
        }
    }
}

.mover,
.submover {
    width: 32px;
    height: 36px;
    line-height: 36px;
    background: var(--el-color-primary-light-3);
    text-align: center;
    color: #fff;
    .icon {
        float: left;
        margin-left: 6px;
        margin-top: 8px;
    }
    &:hover {
        cursor: move;
        background: #5a95f5;
    }
}
.item {
    height: 36px;
    line-height: 36px;
    border: 1px solid #dedede;
    border-left: 0;
    width: calc(100% - 32px);
    box-sizing: border-box;
    padding: 0 10px;
}

.ghost {
    background: #fff !important;
    border: 1px dashed #999;
    .mover,
    .item {
        opacity: 0;
    }
}
.chosenClass {
    background: #fff;
    // background-color: #f1f1f1;
}

.source-column-box {
    height: calc(388px - 43px);
    margin-bottom: 12px;
    overflow-x: auto;
    margin-top: 5px;
    padding: 0 3px;
    &::-webkit-scrollbar {
        display: none;
    }

    .column-li {
        height: 36px;
        line-height: 36px;
        border: 1px solid #dedede;
        margin-bottom: 2px;
        color: #303030;
        border-radius: 1px;
        padding: 0 10px;
        width: calc(100% - 5px);
        .column-item {
            width: calc(100% - 32px);
        }
        &:hover {
            background: var(--el-color-primary);
            color: #fff;
            cursor: pointer;
        }
        .icon-span {
            margin-top: 2px;
        }
    }
    &:hover {
        &::-webkit-scrollbar {
            display: block;
        }
        &.need-auto {
            .column-li {
                width: calc(100% - 0px);
            }
        }
    }
}

.sort-span {
    cursor: pointer;
    user-select: none;
    .sort-icon {
        position: relative;
        top: 2px;
        left: -3px;
    }
    &.is-active {
        color: var(--el-color-primary);
    }
}
</style>
