<template>
    <el-popover placement="bottom" trigger="click" :popper-style="{'padding':0}" v-if="listParamConf.showMoreBtn">
        <div class="table-setting-item-box">
            <template v-if="!isListCalendar">
                <!-- 操作 -->
                <div class="pl-5 item div-disabled">操作</div>
                <div
                    class="pl-20 item"
                    @click="allocationFn('del')"
                    :class="{'div-disabled':multipleSelection.length < 1 && type == 'list'}"
                    v-if="listParamConf.showDelBtn && checkRoleNum('-4')"
                >
                    <span class="icon-t1">
                        <el-icon>
                            <ElIconDelete />
                        </el-icon>
                    </span>
                    删除
                </div>
                <RowCopy 
                    :multipleSelection="multipleSelection" 
                    :layoutConfig="myLayoutConf"
                    @copySuccess="copySuccess"
                />
                <div
                    class="pl-20 item"
                    @click="allocationFn('allocation')"
                    :class="{'div-disabled':multipleSelection.length < 1 && type == 'list'}"
                    v-if="!isReferenceComp && !isMainDetailField && checkRoleNum('-5')"
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
                    v-if="!isReferenceComp && !isMainDetailField && checkRoleNum('-6')"
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
                    v-if="!isReferenceComp && !isMainDetailField && checkRoleNum('-6')"
                >
                    <span class="icon-t1">
                        <el-icon>
                            <ElIconFolderDelete />
                        </el-icon>
                    </span>
                    取消共享
                </div>
                <div 
                    class="pl-20 item" 
                    @click="openReportForms('PDF')" 
                    v-if="type == 'list'"
                    :class="{'div-disabled':multipleSelection.length < 1}"
                >
                    <span class="icon-t1">
                        <el-icon>
                            <ElIconDownload />
                        </el-icon>
                    </span>
                    导出PDF
                </div>
                <div 
                    class="pl-20 item mb-15" 
                    @click="onBatchPrinting()" 
                    v-if="isListCard"
                >
                    <span class="icon-t1">
                        <el-icon>
                            <ElIconPrinter />
                        </el-icon>
                    </span>
                    批量打印
                </div>
            </template>
            <div class="pl-20 item" @click="openReportForms()" v-if="type != 'list' && !isMainDetailField">
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
                <template v-if="!isReferenceComp">
                    <div class="pl-5 item div-disabled">导入导出</div>
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
                </template>
                <!-- 列显示 -->
                <template v-if="!isListCard && !isListCalendar && !customListType">   
                    <div class="pl-5 mt-15 div-disabled">列显示</div>
                    <!-- <div
                        class="pl-20 item"
                        :class="{'is-active':defaultColumnShow == 'SELF'}"
                        @click="changeColumnShow('SELF')"
                        v-if="!isListCard"
                    >
                        自定义列显示
                        <div class="action-icon">
                            <span class="icon-span edit-icon" @click.stop="editColumn('SELF')">
                                <el-icon>
                                    <ElIconEditPen />
                                </el-icon>
                            </span>
                        </div>
                    </div> -->
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
                    
                    
                   
                <!-- 列表设置 -->
                <template v-if="$TOOL.checkRole('r6008')"> 
                    <div class="pl-5 mt-15 div-disabled" v-if="!isReferenceComp && !isMainDetailField">列表设置</div>
                    <div class="pl-5 mt-15 div-disabled" v-if="(isReferenceComp || isMainDetailField) && listParamConf.showBatchUpdateSet">列表设置</div>
                    <div
                        class="pl-20 item"
                        @click="openDefaultFilterDialog"
                    >
                        默认查询设置
                    </div>
                    <div
                        class="pl-20 item"
                        @click="treeGroupFilterIsShow = true"
                        v-if="!isReferenceComp && !isListCard && !isListCalendar && !customListType"
                    >
                        树状分组筛选
                    </div>
                    <div
                        class="pl-20 item"
                        v-if="customListType == 'treeGroupList'"
                        @click="openTreeGroutListSettingDialog"
                    >
                        树形分组设置
                    </div>
                    <div
                        class="pl-20 item"
                        @click="editColumn('BATCH_UPDATE')"
                        v-if="listParamConf.showBatchUpdateSet && !isListCalendar"
                    >
                        批量编辑设置
                    </div>
                    <div
                        class="pl-20 item"
                        @click="setListStyleDialogIsShow = true"
                    >
                        其他列表设置
                    </div>
                    <div
                        class="pl-20 item"
                        @click="cardListSettingShow = true"
                        v-if="isListCard"
                    >
                        卡片列表设置
                    </div>
                    <div
                        class="pl-20 item"
                        @click="calendarListSettingShow = true"
                        v-if="isListCalendar"
                    >
                        日历视图设置
                    </div>
                    <div
                        class="pl-20 item"
                        @click="openListTabDialog"
                        v-if="!isListCalendar && !isListCard"
                    >
                        列表页签设置
                    </div>
                    <div
                        class="pl-20 item"
                        @click="openCustomButtonDialog"
                    >
                        自定义按钮设置
                    </div>
                </template>
                
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
        :modelName="modelName"
    />
    <!-- 数据导入导出 -->
    <DataExport ref="dataExportRefs" />
    <!-- 分配 -->
    <Allocation
        ref="allocationRefs"
        @allocationSuccess="allocationSuccess"
        :entityCode="entityCode"
        :layoutConfig="myLayoutConf"
    />
    <!-- 报表 -->
    <ReportForms ref="reportFormsRefs" />
    <!-- 默认查询设置 -->
    <DefaultFilterDialog 
        ref="defaultFilterRefs" 
        @defaultFilterChange="defaultFilterChange"
        :modelName="modelName"
    />
    <!-- 树状分组筛选 -->
    <TreeGroupFilter
        :entityCode="entityCode"
        :layoutConfig="myLayoutConf"
        v-model="treeGroupFilterIsShow"
        @confirm="treeGroupFilterConfirm"
        :modelName="modelName"
    />
    <!-- <NewTreeGroupFilter
        :entityCode="entityCode"
        :layoutConfig="myLayoutConf"
        v-model="treeGroupFilterIsShow"
        @confirm="treeGroupFilterConfirm"
    /> -->
    <!-- 其他列表设置 -->
    <SetListStyleDialog
        v-model="setListStyleDialogIsShow"
        :entityCode="entityCode"
        :layoutConfig="myLayoutConf"
        @confirm="allocationSuccess"
        :isListCard="isListCard"
        :isListCalendar="isListCalendar"
        :modelName="modelName"
    />
    <!-- 卡片列表设置 -->
    <CardListSetting 
        v-model="cardListSettingShow"
        :modelName="modelName"
        :layout="myLayoutConf"
        :entityCode="entityCode"
        @confirm="allocationSuccess"
    />
    <!-- 日历列表设置 -->
    <CalendarListSetting 
        v-model="calendarListSettingShow"
        :modelName="modelName"
        :layout="myLayoutConf"
        :entityCode="entityCode"
        @confirm="allocationSuccess"
    />
    <CustomButtonSetting 
        ref="customButtonRef" 
        :modelName="modelName"
        :entityCode="entityCode"
        @confirm="allocationSuccess"
    />
    <!-- 列表页签设置 -->
    <ListTabSetting 
        ref="listTabSettingRef" 
        :entityName="queryEntityNameByCode(entityCode)"
        :entityCode="entityCode"
        @confirm="allocationSuccess"
        :tabKey="tabKey"
        :modelName="modelName"
    />
    <!-- 树形分组设置 -->
    <TreeGroutListSetting
        ref="treeGroutListSettingRef"
        :modelName="modelName"
        :entityName="queryEntityNameByCode(entityCode)"
        :entityCode="entityCode"
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
// 其他列表设置
import SetListStyleDialog from "./SetListStyleDialog.vue";
// 卡片列表设置
import CardListSetting from "./CardListSetting.vue";
// 日历列表设置
import CalendarListSetting from "./CalendarListSetting.vue";
// 行复制
import RowCopy from './RowCopy.vue';
// 自定义按钮设置
import CustomButtonSetting from './CustomButtonSetting.vue';
// 列表页签设置
import ListTabSetting from './ListTabSetting.vue';
// 树形分组设置
import TreeGroutListSetting from "./TreeGroutListSetting.vue";

import { checkRight } from "@/api/user";
import { useRouter } from "vue-router";
import useCommonStore from "@/store/modules/common";
import { ElMessage } from "element-plus";
const { queryEntityNameByCode, queryEntityCodeByEntityName } = useCommonStore();
const router = useRouter();
const emits = defineEmits([
    "changeColumnShow",
    "editColumnConfirm",
    "defaultFilterChange",
    "treeGroupFilterConfirm",
    "copySuccess",
    "onBatchPrinting"
]);
const props = defineProps({
    defaultColumnShow: { type: String, default: "" },
    layoutConfig: { type: Object, default: () => {} },
    tableColumn: { type: Array, default: () => [] },
    multipleSelection: { type: Array, default: () => [] },
    dataExportData: { type: Object, default: () => {} },
    type: { type: String, default: "list" },
    entityCode: { type: [Number, String], default: "" },
    // 当前详情ID
    detailId: { type: String, default: "" },
    // 列配置
    listParamConf: { type: Object, default: () => {} },
    // 是否引用实体
    isReferenceComp: { type: Boolean, default: false },
    // 是否明细实体
    isMainDetailField: { type: Boolean, default: false },
    // 引用实体名称
    referenceEntity: {
        type: String,
        default: "",
    },
    // 实体模块名称
    modelName: {
        type: String,
        default: "",
    },
    // 是否卡片列表
    isListCard: {
        type: Boolean,
        default: false,
    },
    // 是否日历列表
    isListCalendar: {
        type: Boolean,
        default: false,
    },
    // 当前页签
    tabKey: {
        type: String,
        default: "",
    },
    // 页签列表
    tabFilterConfig: {
        type: Object,
        default: () => {},
    },
    // 自定义列表类型
    customListType: {
        type: String,
        default: "",
    }
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
                    props.multipleSelection[0][props.layoutConfig.idFieldName],
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

const allowOpenDialog = (type, dialogParam) => {
    if(dialogParam) {
        allocationRefs.value.openDialog(dialogParam);
        return
    }
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
const openReportForms = (target) => {
    if(target == 'PDF' && props.multipleSelection.length < 1){
        return
    }
    reportFormsRefs.value.openDialog({
        entityCode: props.entityCode,
        detailId: props.detailId,
        defaultShow: target == 'PDF' ? 'PDF' : 'ALL',
        multipleSelection: props.multipleSelection.map(el => el[props.layoutConfig.idFieldName])
    });
};

// 批量打印
const onBatchPrinting = () => {
    emits("onBatchPrinting");
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
const appPath = import.meta.env.VITE_APP_PATH;
// 数据导入
const dataUploadFn = () => {
    router.push({
        path: appPath + "data-upload2",
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
    if(type == 'ALL' && !$TOOL.checkRole('r6008')){
        ElMessage.error("当前无权操作。")
        return
    }
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
        defaultFilterSetting: props.layoutConfig.DEFAULT_FILTER || {},
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
        appPath + "Printer?entityId=" +
            props.detailId +
            "&nameFieldName=" +
            props.layoutConfig.nameFieldName
    );
    window.open(newUrl.href);
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
 * 其他列表设置
 */
let setListStyleDialogIsShow = ref(false);


const listMoreSetting = (type) => {
    if(!$TOOL.checkRole('r6008')){
        ElMessage.error("当前无权操作。")
        return
    }
    switch (type) {
        // 默认查询设置
        case "defaultFilter":
            openDefaultFilterDialog()
            break;
        // 树状分组筛选
        case "treeGroupFilter":
            treeGroupFilterIsShow.value = true;
            break;
        // 批量编辑设置
        case "batchEditing":
            editColumn('BATCH_UPDATE')
            break;
        // 列表样式设置
        case "listStyleSeting":
            setListStyleDialogIsShow.value = true;
            break;
    
        default:
            ElMessage.error("参数错误，当前参数：" + type)
            break;
    }
}

// 检测 - 权限
const checkRoleNum = (target) => {
    let { entityCode, isReferenceComp, referenceEntity } = props;
    let checkCode = isReferenceComp ? queryEntityCodeByEntityName(referenceEntity) : entityCode
    return $TOOL.checkRole('r' + checkCode  + target)
}

/**
 * 卡片列表样式设置
 */
let cardListSettingShow = ref(false);
 /**
  * 日历列表设置
  */
let calendarListSettingShow = ref(false);

// 复制
const copySuccess = (v) => {
    emits("copySuccess", v);
}

/**
 * 自定义按钮设置
 */
let customButtonRef = ref(false);
const openCustomButtonDialog = () => {
    let customButton = null;
    let customButtonId = null;
    if(myLayoutConf.value.CUSTOM_BUTTON && myLayoutConf.value.CUSTOM_BUTTON.config){
        customButton = JSON.parse(myLayoutConf.value.CUSTOM_BUTTON.config)
        customButtonId = myLayoutConf.value.CUSTOM_BUTTON.layoutConfigId
    }
    let param = {
        entityName: queryEntityNameByCode(props.entityCode),
        customButton,
        customButtonId,
    }
    customButtonRef.value.openDialog(param);
}

/**
 * 列表页签设置
 */
let listTabSettingRef = ref(null);
const openListTabDialog = () => {
    listTabSettingRef.value.openDialog(props.tabFilterConfig);
}

// 打开树形分组设置弹框
let treeGroutListSettingRef = ref(null);
const openTreeGroutListSettingDialog = () => {
    treeGroutListSettingRef.value?.openDialog();
}

defineExpose({
    editColumn,
    allocationFn,
    dataExportFn,
    dataUploadFn,
    editColumn,
    listMoreSetting,
    openReportForms,
    openPrinter,
    allowOpenDialog
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
</style>
