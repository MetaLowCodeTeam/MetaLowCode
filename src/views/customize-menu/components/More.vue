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
            </template>
        </div>
        <template #reference>
            <el-button>
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
        :idFiledName="idFiledName"
        @allocationSuccess="allocationSuccess"
    />
    <!-- 报表 -->
    <ReportForms ref="reportFormsRefs" />
</template>

<script setup>
import { ref, inject, reactive } from "vue";
import SetColumn from "./SetColumn.vue";
import DataExport from "./DataExport.vue";
import Allocation from "./Allocation.vue";
import ReportForms from "./ReportForms.vue";
import { useRouter } from "vue-router";
const router = useRouter();
const emits = defineEmits(["changeColumnShow", "editColumnConfirm"]);
const props = defineProps({
    defaultColumnShow: { type: String, default: "" },
    idFiledName: { type: String, default: "" },
    layoutConfig: { type: Object, default: () => {} },
    tableColumn: { type: Array, default: () => [] },
    multipleSelection: { type: Array, default: () => [] },
    dataExportData: { type: Object, default: () => {} },
    type: { type: String, default: "list" },
    entityCode: { type: Number, default: 0 },
    // 当前详情ID
    detailId: { type: String, default: "" },
});
const $API = inject("$API");
const $TOOL = inject("$TOOL");
const $ElMessage = inject("$ElMessage");
/*
 * ********************************************************  操作 beg
 */
let allocationRefs = ref("");
const allocationFn = (type) => {
    if (props.multipleSelection.length > 0) {
        allocationRefs.value.openDialog({
            type,
            pageType: props.type,
            list: props.multipleSelection,
        });
    }
};

const allocationSuccess = (v) => {
    emits("editColumnConfirm",v);
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
let editColumnDialog = reactive({
    isShow: false,
});
const editColumn = (type) => {
    editColumnDialog.isShow = true;
    editColumnDialog.chosenListType = type;
    editColumnDialog = Object.assign(
        editColumnDialog,
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
</style>