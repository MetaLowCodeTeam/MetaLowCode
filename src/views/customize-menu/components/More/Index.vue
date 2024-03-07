<template>
    <el-popover placement="bottom" trigger="click" :popper-style="{'padding':0}">
        <div class="table-setting-item-box">
            <!-- 操作 -->
            <div class="pl-5 item div-disabled">操作</div>
            <div
                class="pl-20 item"
                @click="allocationFn('del')"
                :class="{'div-disabled':multipleSelection.length < 1 && type == 'list'}"
            >
                <span class="icon-t1">
                    <el-icon>
                        <ElIconDelete />
                    </el-icon>
                </span>
                删除
            </div>
            <div
                class="pl-20 item"
                @click="allocationFn('allocation')"
                :class="{'div-disabled':multipleSelection.length < 1 && type == 'list'}"
            >
                <span class="icon-t1">
                    <el-icon>
                        <ElIconShare />
                    </el-icon>
                </span>
                分配
            </div>
            <div
                class="pl-20 item"
                @click="allocationFn('share')"
                :class="{'div-disabled':multipleSelection.length < 1 && type == 'list'}"
            >
                <span class="icon-t1">
                    <el-icon>
                        <ElIconFolderChecked />
                    </el-icon>
                </span>
                共享
            </div>
            <div
                class="pl-20 item"
                @click="allocationFn('unShare')"
                :class="{'div-disabled':multipleSelection.length < 1 && type == 'list'}"
            >
                <span class="icon-t1">
                    <el-icon>
                        <ElIconFolderDelete />
                    </el-icon>
                </span>
                取消共享
            </div>
            <div class="pl-20 item" @click="openReportForms()" v-if="type != 'list'">
                <span class="icon-t1">
                    <el-icon>
                        <ElIconMemo />
                    </el-icon>
                </span>
                报表
            </div>
            <div class="pl-20 item" @click="openPrinter()" v-if="type != 'list'">
                <span class="icon-t1">
                    <el-icon>
                        <ElIconPrinter />
                    </el-icon>
                </span>
                打印
            </div>
            <!-- 导入导出 -->
            <template v-if="type == 'list'">
                <div class="pl-5 mt-15 item div-disabled">导入导出</div>
                <div class="pl-20 item" @click="dataExportFn">
                    <span class="icon-t1">
                        <el-icon>
                            <ElIconDownload />
                        </el-icon>
                    </span>
                    数据导出
                </div>
                <div class="pl-20 item" @click="dataUploadFn" v-if="$TOOL.checkRole('r6011')">
                    <span class="icon-t1">
                        <el-icon>
                            <ElIconUpload />
                        </el-icon>
                    </span>
                    数据导入
                </div>
                <!-- 列显示 -->
                <div class="pl-5 mt-15 div-disabled">列显示</div>
                <div
                    class="pl-20 item"
                    :class="{'is-active':defaultColumnShow == 'SELF'}"
                    @click="changeColumnShow('SELF')"
                >
                    自定义列显示
                    <div class="action-icon">
                        <span class="icon-span edit-icon" @click.stop="editColumn('SELF')">
                            <el-icon>
                                <ElIconEditPen />
                            </el-icon>
                        </span>
                    </div>
                </div>
                <div
                    class="pl-20 item"
                    :class="{'is-active':defaultColumnShow == 'ALL'}"
                    @click="changeColumnShow('ALL')"
                >
                    默认列显示
                    <div class="action-icon" v-if="$TOOL.checkRole('r6008')">
                        <span class="icon-span edit-icon" @click.stop="editColumn('ALL')">
                            <el-icon>
                                <ElIconEditPen />
                            </el-icon>
                        </span>
                    </div>
                </div>
                <!-- 列表设置 -->
                <div class="pl-5 mt-15 div-disabled" v-if="$TOOL.checkRole('r6008')">列表设置</div>
                <div
                    class="pl-20 item"
                    @click="openDefaultFilterDialog"
                    v-if="$TOOL.checkRole('r6008')"
                >默认查询设置</div>
                <div
                    class="pl-20 item"
                    @click="treeGroupFilterIsShow = true"
                    v-if="$TOOL.checkRole('r6008')"
                >树状分组筛选</div>
                <div
                    class="pl-20 item"
                    @click="editColumn('BATCH_UPDATE')"
                    v-if="$TOOL.checkRole('r6008')"
                >批量编辑设置</div>
                <div
                    class="pl-20 item"
                    @click="setListStyleDialogIsShow = true"
                    v-if="$TOOL.checkRole('r6008')"
                >列表样式设计</div>
            </template>
        </div>
        <template #reference>
            <el-button type="primary" plain>
                更多
                <el-icon style="transform: rotate(90deg);">
                    <ElIconMoreFilled />
                </el-icon>
            </el-button>
        </template>
    </el-popover>
    <!-- 列设置 -->
    <SetColumn
        v-model="editColumnDialog.isShow"
        v-if="editColumnDialog.isShow"
        :editColumnDialog="editColumnDialog"
        @confirm="editColumnConfirm"
    />
    <!-- 数据导入导出 -->
    <DataExport ref="dataExportRefs" />
    <!-- 分配 -->
    <Allocation
        ref="allocationRefs"
        :idFieldName="idFieldName"
        @allocationSuccess="allocationSuccess"
        :entityCode="entityCode"
    />
    <!-- 报表 -->
    <ReportForms ref="reportFormsRefs" />
    <!-- 默认查询设置 -->
    <DefaultFilterDialog ref="defaultFilterRefs" @defaultFilterChange="defaultFilterChange" />
    <!-- 树状分组筛选 -->
    <!-- <TreeGroupFilter
        :entityCode="entityCode"
        :layoutConfig="myLayoutConf"
        v-model="treeGroupFilterIsShow"
        @confirm="treeGroupFilterConfirm"
    />-->
    <NewTreeGroupFilter
        :entityCode="entityCode"
        :layoutConfig="myLayoutConf"
        v-model="treeGroupFilterIsShow"
        @confirm="treeGroupFilterConfirm"
    />
    <!-- 列表样式设计 -->
    <SetListStyleDialog
        v-model="setListStyleDialogIsShow"
        :entityCode="entityCode"
        :layoutConfig="myLayoutConf"
        @confirm="allocationSuccess"
    />
</template>

<script setup>
import { ref, inject, reactive, watch, onMounted } from "vue";
/**
 * 组件
 */
// 设置列
import SetColumn from "../SetColumn.vue";
// 数据导出
import DataExport from "../DataExport.vue";
// 分配、共享、取消共享
import Allocation from "../Allocation.vue";
// 选择报表
import ReportForms from "../ReportForms.vue";
// 默认查询设置
import DefaultFilterDialog from "./DefaultFilterDialog.vue";
// 树状分组筛选设置
import TreeGroupFilter from "./TreeGroupFilter.vue";
import NewTreeGroupFilter from "./NewTreeGroupFilter.vue";
// 列表样式设计
import SetListStyleDialog from "./SetListStyleDialog.vue";

import { checkRight } from "@/api/user";
import { useRouter } from "vue-router";
import useCommonStore from "@/store/modules/common";
const { queryEntityNameByCode } = useCommonStore();
const router = useRouter();
const emits = defineEmits([
    "changeColumnShow",
    "editColumnConfirm",
    "defaultFilterChange",
    "treeGroupFilterConfirm",
]);
const props = defineProps({
    defaultColumnShow: { type: String, default: "" },
    idFieldName: { type: String, default: "" },
    nameFieldName: { type: String, default: "" },
    layoutConfig: { type: Object, default: () => {} },
    tableColumn: { type: Array, default: () => [] },
    multipleSelection: { type: Array, default: () => [] },
    dataExportData: { type: Object, default: () => {} },
    type: { type: String, default: "list" },
    entityCode: { type: Number, default: 0 },
    // 当前详情ID
    detailId: { type: String, default: "" },
    // 默认查询设置
    defaultFilterSetting: { type: Object, default: () => {} },
});

// layout配置
let myLayoutConf = ref({});

watch(
    () => props.layoutConfig,
    () => {
        myLayoutConf.value = props.layoutConfig;
    },
    {
        deep: true,
    }
);

onMounted(() => {
    myLayoutConf.value = props.layoutConfig;
});

const $API = inject("$API");
const $TOOL = inject("$TOOL");
const $ElMessage = inject("$ElMessage");
/*
 * ********************************************************  操作 beg
 */
let allocationRefs = ref("");
const RightType = {
    del: {
        type: 4,
        label: "删除",
    },
    allocation: {
        type: 5,
        label: "分配",
    },
    share: {
        type: 6,
        label: "共享",
    },
    unShare: {
        type: 6,
        label: "取消共享",
    },
};
const allocationFn = async (type) => {
    if (props.multipleSelection.length > 0) {
        if (props.multipleSelection.length == 1) {
            let param = {
                id:
                    props.detailId ||
                    props.multipleSelection[0][props.idFieldName],
                rightType: RightType[type].type,
            };
            let res = await checkRight(param.id, param.rightType);
            if (res.data.code == 200 && res.data.data) {
                allowOpenDialog(type);
            } else {
                $ElMessage.error(
                    "当前用户没有" + RightType[type].label + "权限"
                );
            }
        }
        // 如果数据大于1条不做权限效验
        else {
            allowOpenDialog(type);
        }
    }
};

const allowOpenDialog = (type) => {
    allocationRefs.value.openDialog({
        type,
        pageType: props.type,
        list: props.multipleSelection,
    });
};

const allocationSuccess = (v) => {
    emits("editColumnConfirm", v);
};

// 打开报表
let reportFormsRefs = ref("");
const openReportForms = () => {
    reportFormsRefs.value.openDialog({
        entityCode: props.entityCode,
        detailId: props.detailId,
    });
};

/*
 * ********************************************************  操作 end
 */
/*
 * ********************************************************  数据导入导出 beg
 */
let dataExportRefs = ref("");

// 数据导出执行
const dataExportFn = () => {
    if (props.tableColumn.length < 1) {
        $ElMessage.warning("没有数据无法导出");
        return;
    }
    dataExportRefs.value.openDialog(props.dataExportData);
};

// 数据导入
const dataUploadFn = () => {
    router.push({
        path: "/web/data-upload",
    });
};

/*
 * ********************************************************  数据导入导出 end
 */
/**
 **************************************************************  列显示 beg
 */
// 编辑列弹框是否显示
let editColumnDialog = ref({
    isShow: false,
});
const editColumn = (type) => {
    editColumnDialog.value = {};
    editColumnDialog.value.isShow = true;
    editColumnDialog.value.chosenListType = type;
    editColumnDialog.value.entityCode = props.entityCode;
    editColumnDialog.value = Object.assign(
        editColumnDialog.value,
        props.layoutConfig[type]
    );
};
const changeColumnShow = (type) => {
    emits("changeColumnShow", type);
};
const editColumnConfirm = (v) => {
    emits("editColumnConfirm", v);
};
/**
 **************************************************************  列显示 end
 */

/**
 **************************************************************  默认查询设置
 */

let defaultFilterRefs = ref("");
const openDefaultFilterDialog = () => {
    defaultFilterRefs.value.openDialog({
        name: queryEntityNameByCode(props.entityCode),
        code: props.entityCode,
        defaultFilterSetting: props.defaultFilterSetting,
    });
};

const defaultFilterChange = () => {
    emits("defaultFilterChange");
};

/**
 * 打印
 */
const openPrinter = () => {
    let newUrl = router.resolve(
        "/web/Printer?entityId=" +
            props.detailId +
            "&nameFieldName=" +
            props.nameFieldName
    );
    window.open(newUrl.href);
    // router.push({
    //     path: "/web/Printer?entityId=" + props.detailId,
    //     target: "_blank",
    // });
};

/**
 * 树状分组筛选
 */
let treeGroupFilterIsShow = ref(false);

// 确认选择分组
const treeGroupFilterConfirm = () => {
    emits("treeGroupFilterConfirm");
};

/**
 * 列表样式设计
 */
let setListStyleDialogIsShow = ref(false);

defineExpose({
    editColumn,
});
</script>
<style lang='scss' scoped>
.icon-t1 {
    position: relative;
    top: 1px;
}
.icon-t2 {
    position: relative;
    top: 2px;
}
.table-setting-item-box {
    padding: 10px 0;
    .hr {
        border-top: 1px solid #e3e3e3;
        margin: 10px 0;
    }
    .item {
        height: 26px;
        line-height: 26px;
        cursor: pointer;
        position: relative;
        &.is-active {
            color: var(--el-color-primary);
        }
        .action-icon {
            position: absolute;
            right: 10px;
            top: 4px;
            display: none;
            .icon-span {
                cursor: pointer;
                display: inline-block;
                color: #a1a1a1;
                &:hover {
                    color: #666;
                }
                &.edit-icon {
                    position: relative;
                    top: -2px;
                }
            }
        }
        &:hover {
            background: #dedede;
            .action-icon {
                display: block;
            }
        }
        &.div-disabled {
            background: #fff;
            cursor: default;
        }
    }
}

.list-settings-item {
    height: 32px;
    line-height: 32px;
    margin-bottom: 5px;
    font-size: 14px;
    cursor: pointer;
    &:hover {
        color: var(--el-color-primary);
    }
}
</style>
