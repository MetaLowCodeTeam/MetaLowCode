<template>
    <mlDialog title="树状分组筛选设置" v-model="isShow" width="650px">
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
                                <div class="fl item text-ellipsis">{{ parent.label }}</div>
                                <div class="action-icon">
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
                            <div class="fl column-item text-ellipsis">{{ column.label }}</div>
                            <span class="fr icon-span">
                                <el-icon size="16">
                                    <ElIconPlus />
                                </el-icon>
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            <div>
                <el-checkbox v-model="groupConf.isOpen" label="开启树状分组" />
                <el-checkbox v-model="groupConf.isAccordion" label="手风琴模式" />
            </div>
        </div>
        <template #footer>
            <div class="footer-div">
                <el-button @click="isShow = false" :loading="loading">取消</el-button>
                <el-button type="primary" @click="onSave" :loading="loading">保存</el-button>
            </div>
        </template>
    </mlDialog>
</template>

<script setup>
import { VueDraggableNext } from "vue-draggable-next";
import { onMounted, watch, ref } from "vue";
import useCommonStore from "@/store/modules/common";
import { ElMessage } from "element-plus";
/**
 * API
 */
import { getFieldSet } from "@/api/system-manager";
import layoutConfig from "@/api/layoutConfig";

const { queryEntityNameByCode } = useCommonStore();
const props = defineProps({
    modelValue: null,
    entityCode: { type: Number },
    layoutConfig: { type: Object, default: () => {} },
});

const emits = defineEmits(["update:modelValue", "confirm"]);
let isShow = ref(false);
let loading = ref(false);
let myLayoutConf = ref({});
watch(
    () => props.modelValue,
    () => {
        isShow.value = props.modelValue;
        loadFields();
    },
    { deep: true }
);

watch(
    () => props.layoutConfig,
    () => {
        initLayoutConf();
    },
    {
        deep: true,
    }
);

watch(
    () => isShow.value,
    (v) => {
        emits("update:modelValue", v);
    },
    { deep: true }
);
onMounted(() => {
    isShow.value = props.modelValue;
    // 加载字段
    loadFields();
});

// 已显示列
let showColumn = ref([]);

// 源所有列
let sourceColumn = ref([]);

/**
 * 加载字段数据
 */
let entityName = ref("");

// 加载字段
const loadFields = async () => {
    // 弹框显示才调接口
    if (!isShow.value) {
        return;
    }
    entityName.value = queryEntityNameByCode(props.entityCode);
    loading.value = true;
    let res = await getFieldSet(entityName.value);
    if (res && res.code == 200) {
        // 只有这些类型可以筛选
        let needType = [
            // 引用
            "Reference",
            // 布尔
            "Boolean",
            // 整数
            "Integer",
            // 精度小数
            "Decimal",
            // 百分比
            "Percent",
            // 金额
            "Money",
            // 文本
            "Text",
            // 单选项
            "Option",
            // 多选项
            "Tag",
            // 地区选择
            "AreaSelect",
            // 时间
            "Date",
            "DateTime",
        ];
        sourceColumn.value = res.data.filter((el) =>
            needType.includes(el.type)
        );
        // 初始化配置信息
        initLayoutConf();
    }
    loading.value = false;
};

/**
 * 分组数据
 */
let layoutConfigId = ref("");
let groupConf = ref({
    // 分组数据
    groupList: [
        {
            fieldGroup: [],
            error: false,
        },
    ],
    // 是否 开启树状分组
    isOpen: true,
    // 手风琴模式
    isAccordion: false,
});

// 初始化数据
const initLayoutConf = () => {
    if (!props.layoutConfig) {
        return;
    }
    myLayoutConf.value = props.layoutConfig;
    let { TREE_GROUP } = myLayoutConf.value;
    if (TREE_GROUP) {
        layoutConfigId.value = TREE_GROUP.layoutConfigId;
        groupConf.value = JSON.parse(TREE_GROUP.config);
        showColumn.value = [];
        if (groupConf.value.groupList.length > 0) {
            groupConf.value.groupList.forEach((el) => {
                showColumn.value.push(el.fieldGroup[0]);
                sourceColumn.value.forEach((subEl, subInx) => {
                    if (subEl.name == el.fieldGroup[0].name) {
                        sourceColumn.value.splice(subInx, 1);
                    }
                });
            });
        }
    }
};

// 筛选字段
let searchField = ref("");
const notShowColumn = () => {
    if (!searchField) {
        return sourceColumn.value;
    } else {
        return sourceColumn.value.filter(
            (el) => el.label.indexOf(searchField.value) != -1
        );
    }
};

// 添加显示列
const addShowColumn = (column) => {
    if (showColumn.value.length > 4) {
        ElMessage.warning("最多可添加5个层级");
        return;
    }
    showColumn.value.push(column);
    for (let index = 0; index < sourceColumn.value.length; index++) {
        const el = sourceColumn.value[index];
        if (column.name == el.name) {
            sourceColumn.value.splice(index, 1);
            return;
        }
    }
};

// 删除显示列
const delColumn = (column, inx) => {
    showColumn.value.splice(inx, 1);
    sourceColumn.value.push(column);
};

const onSave = async () => {
    if (groupConf.value.isOpen && showColumn.value.length < 1) {
        ElMessage.warning("若开启树状分组必须添加一个分组");
        return;
    }
    groupConf.value.groupList = [];
    showColumn.value.forEach((el) => {
        let fieldGroup = [el];
        groupConf.value.groupList.push({ fieldGroup });
    });
    let param = {
        config: JSON.stringify(groupConf.value),
        entityCode: props.entityCode,
    };
    loading.value = true;
    let res = await layoutConfig.saveConfig(
        layoutConfigId.value,
        "TREE_GROUP",
        param
    );
    if (res) {
        ElMessage.success("保存成功");
        emits("confirm");
        isShow.value = false;
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
