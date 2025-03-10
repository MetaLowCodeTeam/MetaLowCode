<template>
    <mlDialog :title="title" v-model="isShow" width="650px">
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
                            <div class="paren-div">
                                <div class="mover fl">
                                    <el-icon size="20" class="icon">
                                        <ElIconRank />
                                    </el-icon>
                                </div>
                                <div
                                    class="fl item text-ellipsis"
                                    :class="{'tag':isShowItemTag(parent)}"
                                >{{ parent.entityLabel }}</div>
                                <div class="action-icon">
                                    <span
                                        class="icon-span add-icon mr-5"
                                        @click.stop="editColumn(parent,inx)"
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
                        v-if="columnList.length > 0"
                        :class="{'need-auto':columnList.length > 8}"
                    >
                        <div
                            class="column-li"
                            v-for="(column,inx) of columnList"
                            :key="inx"
                            @click="beforeAddShowColumn(column)"
                        >
                            <div class="fl column-item text-ellipsis">{{ column.label || column.entityLabel }}</div>
                            <span class="fr icon-span">
                                <el-icon size="16">
                                    <ElIconPlus />
                                </el-icon>
                            </span>
                        </div>
                    </div>
                    <el-empty v-else :image-size="100" description="没有数据" />
                </div>
            </div>
        </div>
        <template #footer>
            <div class="footer-div">
                <el-button @click="isShow = false" :loading="loading">取消</el-button>
                <el-button type="primary" @click="onSave" :loading="loading">保存</el-button>
            </div>
        </template>
        <div v-if="dialogIsShow">
            <mlDialog title="附加过滤条件" append-to-body width="37%" v-model="dialogIsShow">
                <mlSetConditions
                    v-model="conditionConf"
                    footer
                    @cancel="dialogIsShow = false"
                    @confirm="conditionConfirm"
                    :entityName="entityName"
                />
            </mlDialog>
        </div>
    </mlDialog>
    <mlDialog
        v-model="editColumnDialogIsShow"
        v-if="editColumnDialogIsShow"
        appendToBody
        title="显示项设置"
        width="510"
        top="25vh"
        
    >
        <div style="padding-right: 30px;">
            <el-form label-width="120px" @submit.prevent>
                <el-form-item label="别名">
                    <el-input v-model="editColumnDialogData.columnAliasName" />
                </el-form-item>
                <el-form-item label="数据过滤条件" v-if="editColumnDialogData.isCustomLabel">
                    <el-input
                        v-model="editColumnDialogData.filterEasySql"
                        class="w-100"
                        :autosize="{ minRows: 2, maxRows: 4 }"
                        type="textarea"
                        placeholder="请输入过滤条件"
                    />
                </el-form-item>
                <el-form-item label="显示过滤条件" v-if="!editColumnDialogData.isCustomComponent">
                    <el-row>
                        <el-col :span="24">
                            <div
                                class="ml-a-span"
                                @click="setCondition"
                            >{{ getSetConditionText() }}</div>
                        </el-col>
                    </el-row>
                </el-form-item>
                <el-form-item label="组件名称" v-if="editColumnDialogData.isCustomComponent" class="is-required">
                    <el-input 
                        v-model="editColumnDialogData.componentName" 
                        placeholder="请输入组件名称"
                        clearable
                    />
                </el-form-item>
                <el-form-item v-if="editColumnDialogData.isCustomComponent">
					<el-checkbox
						label="是否在PC端显示"
						v-model="editColumnDialogData.pcShow"
					/>
					<el-checkbox
						label="是否在移动端显示"
						v-model="editColumnDialogData.mobileShow"
					/>
				</el-form-item>
            </el-form>
        </div>
        <template #footer>
            <el-button @click="editColumnDialogIsShow = false">取消</el-button>
            <el-button type="primary" @click="confirmColumnEdit">确认</el-button>
        </template>
    </mlDialog>
    <DetailCustomLabelDialog ref="DetailCustomLabelRef" @confirm="addShowColumn"/>
    <DetailCustomComponentDialog ref="DetailCustomComponentRef" @confirm="addShowColumn"/>
</template>

<script setup>
import { VueDraggableNext } from "vue-draggable-next";
import { ref, inject, reactive, onMounted } from "vue";
/**
 * 组件
 */
// 自定义标签设置组件
import DetailCustomLabelDialog from './DetailCustomLabelDialog.vue';
// 自定义组件设置组件
import DetailCustomComponentDialog from './DetailCustomComponentDialog.vue';
const $API = inject("$API");
const props = defineProps({
    modelValue: null,
    entityCode: { type: Number, default: 0 },
    entityName: { type: String, default: "" },
    applyType: { type: String, default: "TAB" },
    title: { type: String, default: "配置页签" }
});
const emit = defineEmits(["update:modelValue", "confirm"]);
const $ElMessage = inject("$ElMessage");
let isShow = ref(false);
let loading = ref(false);
let layoutConfigId = ref("");
let hasEntityName = ref([]);

// 已显示列
let showColumn = ref([]);

// 源所有列
let sourceColumn = ref([]);

// 筛选字段
let searchField = ref("");

let columnList = ref([]);

onMounted(() => {
    document.body.ondrop = function (event) {
        event.preventDefault();
        event.stopPropagation();
    };
})

const formatShowColumn = () => {
    if (!searchField) {
        columnList.value = [...sourceColumn.value];
    } else {
        columnList.value = sourceColumn.value.filter(
            (el) => el.entityLabel?.indexOf(searchField.value) != -1
        );
    }
    if(props.applyType == 'TAB') {
        columnList.value.push(
            {
                entityLabel: "自定义标签",
                entityName: "customLabel",
            },
            {
                entityLabel: "自定义组件",
                entityName: "customComponent",
            }
        )
    }
};
// 指定哦标签设置Ref
let DetailCustomLabelRef = ref();
// 自定义组件设置Ref
let DetailCustomComponentRef = ref();
// 添加显示列前
const beforeAddShowColumn = (column) => {
    // 如果是添加自定义标签
    if(column.entityName == 'customLabel') {
        DetailCustomLabelRef.value?.openDialog()
    }
    else if(column.entityName == 'customComponent') {
        DetailCustomComponentRef.value?.openDialog()
    }
    else {
        addShowColumn(column);
    }
}
// 添加显示列
const addShowColumn = (column) => {
    console.log(column);
    showColumn.value.push(column);
    for (let index = 0; index < sourceColumn.value.length; index++) {
        const el = sourceColumn.value[index];
        if (column.entityName == el.entityName) {
            sourceColumn.value.splice(index, 1);
            formatShowColumn();
            return;
        }
    }
};

// 列弹框
let editColumnDialogIsShow = ref(false);
// 编辑列数据
let editColumnDialogData = ref({});

// 编辑显示列
const editColumn = (column, inx) => {
    editColumnDialogIsShow.value = true;
    let editObj = Object.assign({}, column);
    editObj.columnAliasName = column.columnAliasName || "";
    editObj.columnEditInx = inx;
    editColumnDialogData.value = Object.assign(
        {},
        {
            columnAliasName: "",
            filter: {
                equation: "OR",
                items: [],
            },
        }, 
        editObj
    );
};

// 是否显示列标记 * 号
const isShowItemTag = (column) => {
    let { columnAliasName, filter } = column;
    if (columnAliasName || filter?.items.length > 0) {
        return true;
    }
    return false;
};

// 确认列修改
const confirmColumnEdit = () => {
    if(editColumnDialogData.value.isCustomComponent && !editColumnDialogData.value.componentName) {
        $ElMessage.error("请输入组件名称");
        return;
    }
    showColumn.value[editColumnDialogData.value.columnEditInx] = Object.assign(
        {},
        editColumnDialogData.value
    );
    editColumnDialogIsShow.value = false;
};

// 删除显示列
const delColumn = (column, inx) => {
    showColumn.value.splice(inx, 1);
    // 非自定义实体 和 非自定义组件
    if(!column.isCustomLabel && !column.isCustomComponent) {
        sourceColumn.value.push(column);
    }
    formatShowColumn();
};

// 打开弹框
const openDialog = (data) => {
    layoutConfigId.value = data.layoutConfigId;
    if (data.config) {
        let config = JSON.parse(data.config);
        showColumn.value = [];
        hasEntityName.value = [];
        config.forEach((el) => {
            showColumn.value.push(el);
            hasEntityName.value.push(el.entityName);
        });
    }
    isShow.value = true;
    getAllColumn();
};

// 获取所有列数据
const getAllColumn = async () => {
    loading.value = true;
    let res = await $API.common.queryEntityList(
        props.entityCode,
        false,
        false,
        true,
        props.entityCode == '21' ? true : false,
        true
    );
    if (res) {
        if (res.data && res.data.length > 0) {
            sourceColumn.value = res.data.filter(
                (el) => !hasEntityName.value.includes(el.entityName)
            );
            formatShowColumn();
        }
    }
    loading.value = false;
    // console.log(props.entityName);
};

const onSave = async () => {
    let param = {
        config: JSON.stringify([...showColumn.value]),
        entityCode: props.entityCode,
        applyType: props.applyType,
    };
    // return
    loading.value = true;
    let res = await $API.layoutConfig.saveConfig(
        layoutConfigId.value,
        props.applyType,
        param
    );
    if (res) {
        $ElMessage.success("保存成功！");
        isShow.value = false;
        emit("confirm", res.data.formData);
    }
    loading.value = false;
};

/***
 *  ****************************************** 过滤条件相关 beg
 */

// 选择条件弹框
let dialogIsShow = ref(false);
// 条件框传值
let conditionConf = ref({});
// 设置条件
const setCondition = () => {
    let { filter } = editColumnDialogData.value;
    filter = initFilter(filter);

    conditionConf.value = JSON.parse(JSON.stringify(filter));
    dialogIsShow.value = true;
};
// 初始化条件
const initFilter = (filter) => {
    let { equation } = filter;
    if (!equation || equation === "OR") {
        filter.type = 1;
        filter.equation = "OR";
    } else if (equation === "AND") {
        filter.type = 2;
        filter.equation = "AND";
    } else {
        filter.type = 3;
    }
    return filter;
};

// 获取设置条件文案
const getSetConditionText = () => {
    let { filter } = editColumnDialogData.value;
    let length = filter && filter.items ? filter.items.length : 0;
    return length > 0 ? `已设置条件（${length}）` : "点击设置";
};

// 确认设置条件
const conditionConfirm = (e) => {
    editColumnDialogData.value.filter = { ...e };
    dialogIsShow.value = false;
};

/***
 *  ****************************************** 过滤条件相关 end
 */

// 暴露方法给父组件调用
defineExpose({
    openDialog,
});
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

    .paren-div {
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
    background: var(--el-color-primary);
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
.el-form-item {
    align-items: initial;
}
</style>