<template>
    <ml-dialog
        :title="editParamConf.customDialogTitle || row.customDialogTitle || styleConf?.newDialogConfig?.editTitle || row.dialogTitle"
        v-if="isShow"
        v-model="isShow"
        :width="styleConf?.newDialogConfig?.editWidth || '55%'"
        draggable
        :showFullScreen="paramDialogConf?.showFullScreen || styleConf?.actionConf?.showFullScreen"
        :autoFullScreen="paramDialogConf?.autoFullScreen || styleConf?.actionConf?.autoFullScreen"
        append-to-body
        bodyNoPadding
        :showClose="!loading"
        :scrollbarHeight="styleConf?.newDialogConfig?.editHeight || ''"
        :scrollbarMaxHeight="styleConf?.newDialogConfig?.editMaxHeight || '500px'"
        :scrollbarMinHeight="styleConf?.newDialogConfig?.editMinHeight"
    >
        <div
            class="main fullScreen-man"
            v-loading="loading"
            element-loading-custom-class="edit-loading"
            element-loading-text="加载中..."
        >
            <div class="info-box" v-if="row.detailId && row.approvalStatus.value != 1 &&!checkModifiableEntity(row.detailId, row.approvalStatus.value)">记录已完成审批，禁止编辑</div>
            <div class="info-box" v-if="row.detailId && row.approvalStatus.value == 1">记录正在审批中，禁止编辑</div>
            <v-form-render
                v-if="haveLayoutJson && isShow"
                ref="vFormRef"
                :global-dsv="globalDsv"
                :option-data="optionData"
            />
            <el-empty v-else :image-size="100" description="未查询到相关配置数据" />
        </div>
        <template #footer v-if="editParamConf.showFooter && showFooterButtonConfig.showFooter && customButtonList.length == 0">
            <slot name="beforeCancelBtn"></slot>
            <el-button
                @click="cancel"
                :loading="loading"
                v-if="editParamConf.showCancelBtn && showFooterButtonConfig.showCancelBtn"
            >
                取消
            </el-button>
            <slot name="beforeConfirmBtn"></slot>
            <el-button
                type="primary"
                @click="confirm"
                v-if="editParamConf.showConfirmBtn && showFooterButtonConfig.showConfirmBtn && (row.detailId ? checkModifiableEntity(row.detailId,row.approvalStatus?.value) : true)"
                :loading="loading"
                icon="Select"
            >
                保存
            </el-button>
            <slot name="beforeConfirmRefreshBtn"></slot>
            <el-button
                type="primary"
                @click="confirmRefresh"
                v-if="editParamConf.showConfirmRefreshBtn && showFooterButtonConfig.showConfirmRefreshBtn && (row.detailId ? checkModifiableEntity(row.detailId,row.approvalStatus?.value) : true)"
                :loading="loading"
                plain
                icon="Refresh"
            >
                保存并刷新
            </el-button>
            <slot name="afterConfirmRefreshBtn"></slot>
            <el-button
                type="primary"
                @click="confirmSaveAndSubmit"
                v-if="editParamConf.showConfirmAndSubmitBtn && showFooterButtonConfig.showConfirmAndSubmitBtn && isShowSaveAndSubmit && row.approvalStatus.value != 1 && row.approvalStatus.value != 3"
                :loading="loading"
                plain
                icon="Stamp"
            >
                保存并提交
            </el-button>
            <slot name="afterConfirmAndSubmitBtn"></slot>
        </template>
        <template #footer v-else-if="editParamConf.showFooter && showFooterButtonConfig.showFooter && customButtonList.length > 0">
            <template
                v-for="(item,index) of customButtonList" :key="index"
            >
                <slot v-if="item.type === 'slot'" :name="item.name" :row="row"></slot>
                <el-button
                    @click.stop="customButtonClick(item, row)"
                    :type="item.type"
                    :plain="item.key == 'saveRefresh' || item.key == 'saveSubmit'"
                    :disabled="item.disabled"
                    v-else-if="!item.hidden && (item.key != 'saveSubmit' || (item.key == 'saveSubmit' && editParamConf.showConfirmAndSubmitBtn && isShowSaveAndSubmit && row.approvalStatus.value != 1 && row.approvalStatus.value != 3))"
                >
                    <el-icon
                        :color="item.iconColor"
                        v-if="
                            item.icon &&
                            item.showType != 3
                        "
                    >
                        <component :is="item.icon" />
                    </el-icon>
                    <span
                        v-if="item.showType != 2"
                        :class="{
                            'ml-5':
                                item.showType == 1 &&
                                item.icon,
                        }"
                        style="font-size: 12px;"
                    >
                        {{ item.isNative ? item.name || item.defaultName : item.name }}
                    </span>
                </el-button>
            </template>
        </template>
        <SubmitApprovalDialog ref="SubmitApprovalDialogRefs" @onSubmit="submitApprovalSuccess" append-to-body/>
    </ml-dialog>
    <PriceComparisonDialog ref="PriceComparisonDialogRefs"/>
</template>

<script setup>
defineOptions({
    name: "default-edit",
});
import {
    reactive,
    ref,
    inject,
    nextTick,
    onMounted,
    watch,
    watchEffect,
    getCurrentInstance,
} from "vue";
import { getFormLayout, getFieldListOfEntity } from "@/api/system-manager";
import { queryById, saveRecord } from "@/api/crud";
import { saveTeam } from "@/api/team";
import { saveUser, checkRight, saveDepartment } from "@/api/user";
import useCommonStore from "@/store/modules/common";
import { ElMessage } from "element-plus";
import { getApprovalConfigByEntity } from "@/api/approval";
// 提交审批弹框
import SubmitApprovalDialog from "@/components/mlApprove/SubmitApprovalDialog.vue";
// 价格对比弹框
import PriceComparisonDialog from "@/views/custom-page/Yt/PriceComparisonDialog.vue";
import {
    globalDsvDefaultData,
    getModelName,
    formatFormVirtualField,
    formatQueryByIdParam,
    keyboardEventToInput,
} from "@/utils/util";
import http from "@/utils/request"
// 自定义按钮过滤
import { checkCustomButtonFilters } from "@/api/layoutConfig";
// 自定义按钮
import useCustomButtonConfig from "@/hooks/useCustomButtonConfig";
import { useRouter } from "vue-router";
const { router } = useRouter();
const { getCustomAppButtons, customButtonHandler } = useCustomButtonConfig();

const {
    queryEntityNameById,
    queryEntityLabelByName,
    checkModifiableEntity,
    queryEntityInfoByName,
    queryEntityCodeByName,
} = useCommonStore();

const props = defineProps({
    isTeam: { type: Boolean, default: false },
    isUser: { type: Boolean, default: false },
    // 禁用字段
    disableWidgets: { type: Array, default: () => [] },
    // 不禁用字段
    unDisableWidgets: { type: Array, default: () => [] },
    // 非必填字段
    notRequiredFields: { type: Array, default: () => [] },
    nameFieldName: { type: String, default: "" },
    layoutConfig: { type: Object, default: () => {} },
    // 新建编辑配置
    editConf: {
        type: Object,
        default: () => {}
    },
    // 自定义保存接口
    queryUrl: {
		type: String,
		default: "",
	},
    queryUrlIdName: {
        type: String,
        default: "id",
    },
});

const emits = defineEmits(['saveFinishCallBack', 'onConfirm']);


// Api：https://www.yuque.com/xieqi-nzpdn/as7g0w/kon80ysuog88r0um?singleDoc# 《自定义实体新建编辑PC》
// 配置项
const editParamConf = ref({
    showFooter: true,
    showConfirmBtn: true,
    showCancelBtn: true,
    showConfirmRefreshBtn: true,
    showConfirmAndSubmitBtn: true,
    // 自定义弹框标题
    customDialogTitle: "",
})


watchEffect(() => {
    editParamConf.value = Object.assign(editParamConf.value, props.editConf)
})


// 整体配置信息
let myLayoutConfig = ref({});
// 列表样式配置
let styleConf = ref({
    // 新建编辑弹框属性
    actionConf: {
        // 显示全屏按钮
        showFullScreen: false,
        // 弹框自动全屏
        autoFullScreen: false,
    },
    // 弹框配置
    dialogConfig: {},
});
watch(
    () => props.layoutConfig,
    () => {
        loadMyLayoutConfig();
    },
    {
        deep: true,
    }
);

let currentExposed = ref({});

onMounted(() => {
    currentExposed.value = getCurrentInstance().exposed;
})

// 自定义按钮
let customButtonList = ref([]);
// 自定义按钮点击
const customButtonClick = (item, row) => {
    // 如果是内置按钮
    if(item.isNative){
        switch(item.key){
            case 'cancel':
                cancel();
                break;
            case 'save':
                confirm();
                break;
            case 'saveRefresh':
                confirmRefresh();
                break;
            case 'saveSubmit':
                confirmSaveAndSubmit();
                break;
        }
    }
    // 如果是自定义按钮
    else{
        // currentExposed.value[item.key](row);
        customButtonHandler(
            item,
            [row],
            currentExposed.value,
            row.detailId,
            loading,
            onAdd,
            onEditRow,
            onAdd,
            router,
        )
    }
}

// 自定义按钮-新建
const onAdd = (e) => {
	let tempV = {};
    tempV.entityName = e.entityName;
    if(e.formId) {
        tempV.formId = e.formId;
    }
    if(e.localDsv) {
        tempV.localDsv = e.localDsv;
    }
    cancel();
    openDialog(tempV);
}

// 自定义按钮-编辑
const onEditRow = (e, selectForm) => {
    formId.value = selectForm;
    initFormLayout();
}

// 加载配置信息
const loadMyLayoutConfig = async () => {
    myLayoutConfig.value = props.layoutConfig || {};
    let { STYLE, CUSTOM_BUTTON } = myLayoutConfig.value;
    if (STYLE && STYLE.config) {
        styleConf.value = JSON.parse(STYLE.config);
        let { dialogConfig } = styleConf.value;
        if(dialogConfig){
            let recordData = row.data || null;
            let entity = {
                name: row.entityName,
                code: queryEntityCodeByName(row.entityName),
                label: queryEntityLabelByName(row.entityName),
            }
            // 获取弹框配置
            let newDialogConfig = new Function('row', 'entity', dialogConfig)(recordData, entity);
            if(!newDialogConfig.editHeight && !newDialogConfig.editMaxHeight) {
                newDialogConfig.editMaxHeight = '500px';
            }
            styleConf.value.newDialogConfig = newDialogConfig;
        }
    }
    customButtonList.value = getCustomAppButtons(CUSTOM_BUTTON, 'pcEdit');
    customButtonList.value.forEach(btn => {
        // 权限判断
        let checkCustomRole = btn.customCode ? $TOOL.checkRole(btn.customCode) : true;
        let customPermissionPass = btn.customCode
            ? (btn.reversalCustomCode ? !checkCustomRole : checkCustomRole)
            : true;
        // 权限或hide不通过直接隐藏
        if (!customPermissionPass || btn.hide) {
            btn.hidden = true;
            return;
        }
        if(btn.key == 'cancel') {
            btn.hidden = !showFooterButtonConfig.value.showCancelBtn;
            return;
        }
        if(btn.key == 'save') {
            btn.hidden = !showFooterButtonConfig.value.showConfirmBtn;
            return;
        }
        if(btn.key == 'saveRefresh') {
            btn.hidden = !showFooterButtonConfig.value.showConfirmRefreshBtn;
            return;
        }
        if(btn.key == 'saveSubmit') {
            btn.hidden = !showFooterButtonConfig.value.showConfirmAndSubmitBtn;
            return;
        }
        // 如果是编辑需要检测是否有权限
        if(row.detailId) {
            // 需要校验审批权限的按钮
            let needApprovalAuthKey = ['saveSubmit','saveRefresh', 'save'];
            if(needApprovalAuthKey.includes(btn.key) && !checkModifiableEntity(row.detailId, row.approvalStatus?.value)){
                btn.hidden = true;
            }
        }
    })
    // 只对"有权限且未被隐藏且有filterJson"的按钮调接口
    let filterBtns = customButtonList.value.filter(btn => !btn.hidden && btn.filterJson && JSON.stringify(btn.filterJson) !== '{}' && btn.action !== 1);
    if (filterBtns.length > 0) {
        // 如果是编辑 可以检测条件
        if(row.detailId) {
            let filterList = filterBtns.map(item => item.filterJson);
            let filterParam = {
                entityName: row.entityName,
                recordIdList: [row.detailId],
                filterList
            };
            let checkCustomButtonFiltersRes = await checkCustomButtonFilters(filterParam);
            if (checkCustomButtonFiltersRes && checkCustomButtonFiltersRes.code == 200) {
                let filterRes = checkCustomButtonFiltersRes.data[0];
                filterBtns.forEach((btn, idx) => {
                    const pass = filterRes[idx] == 1 || filterRes[idx] === true;
                    if (!pass) {
                        if (btn.errorShowType == 1) {
                            btn.disabled = true;
                            btn.hidden = false;
                        } else if (btn.errorShowType == 2) {
                            btn.hidden = true;
                            btn.disabled = false;
                        } else {
                            btn.hidden = false;
                            btn.disabled = false;
                        }
                    } else {
                        btn.hidden = false;
                        btn.disabled = false;
                    }
                });
            }
        }
        // 新建 无法检测条件 直接隐藏
        else {
            filterBtns.forEach(btn => {
                btn.hidden = true;
            })
        }
    }
    // 辅助函数：查找 key 的索引
    const findIndexByKey = (key) => customButtonList.value.findIndex(item => item.key === key && item.isNative);
    // 在 key='cancel' 前插入
    let cancelIndex = findIndexByKey('cancel');
    if (cancelIndex !== -1) {
        customButtonList.value.splice(cancelIndex, 0, { type: 'slot', name: 'beforeCancelBtn' });
    }
    // 在 key='save' 前插入
    let saveIndex = findIndexByKey('save');
    if (saveIndex !== -1) {
        customButtonList.value.splice(saveIndex, 0, { type: 'slot', name: 'beforeConfirmBtn' });
    }
    // 在 key='saveRefresh' 前插入
    let saveRefreshIndex = findIndexByKey('saveRefresh');
    if (saveRefreshIndex !== -1) {
        customButtonList.value.splice(saveRefreshIndex, 0, { type: 'slot', name: 'beforeConfirmRefreshBtn' });
    }
    // 在 key='saveSubmit' 前插入,并在后面插入
    let saveSubmitIndex = findIndexByKey('saveSubmit');
    if (saveSubmitIndex !== -1) {
        customButtonList.value.splice(saveSubmitIndex, 0, { type: 'slot', name: 'afterConfirmRefreshBtn' });
        customButtonList.value.splice(saveSubmitIndex + 2, 0, { type: 'slot', name: 'afterConfirmAndSubmitBtn' });
    }
};



let row = reactive({
    // 自定义弹框标题
    customDialogTitle: "",
    // 弹框标题
    dialogTitle:"",
    approvalStatus: {},
    detailId: "",
    entityName: "",
    fieldName: "",
    fieldNameLabel: "",
    fieldNameVale: "",
    idFieldName:"",
    nameFieldName: "",
    formEntityId:"",
    mainDetailField:"",
    isRead: false,
    detailEntityFlag: true,
    refEntityBindingField: "",
});

const paramDialogConf = ref(null);


let globalDsv = ref(globalDsvDefaultData());



let optionData = ref({});
let loading = ref(false);
let isShow = ref(false);
// 是否引用组件调用保存
let isReferenceComp = ref(false);
// 引用组件的表单数据
let referenceCompFormData = ref({});
// 指定表单ID
let formId = ref("");

// 是否显示保存并提交
let isShowSaveAndSubmit = ref(false);

// 底部按钮显示
let defaultShowFooterButtonConfig = ref({
    showFooter: true,
    showCancelBtn: true,
    showConfirmBtn: true,
    showConfirmRefreshBtn: true,
    showConfirmAndSubmitBtn: true,
});

let showFooterButtonConfig = ref({});

const openDialog = async (v) => {
    // 重置row对象，避免编辑和新建之间的数据污染
    Object.assign(row, {
        customDialogTitle: "",
        dialogTitle: "",
        approvalStatus: {},
        detailId: "",
        entityName: "",
        fieldName: "",
        fieldNameLabel: "",
        fieldNameVale: "",
        idFieldName: "",
        nameFieldName: "",
        formEntityId: "",
        mainDetailField: "",
        isRead: false,
        detailEntityFlag: true,
        refEntityBindingField: "",
        disableWidgets: [],
        data: {},
        defaultFormData: {},
        actionType: "",
    });

    showFooterButtonConfig.value = Object.assign(JSON.parse(JSON.stringify(defaultShowFooterButtonConfig.value)), v.showFooterButtonConfig);
    // 重置其他相关状态变量
    optionData.value = {};
    haveLayoutJson.value = false;
    isReferenceComp.value = false;
    referenceCompFormData.value = {};
    formId.value = "";
    isShowSaveAndSubmit.value = false;
    paramDialogConf.value = null;

    // 重置globalDsv为默认状态
    globalDsv.value = globalDsvDefaultData();

    
    row.detailId = v.detailId;
    row.formEntityId = v.formEntityId;
    row.mainDetailField = v.mainDetailField;
    row.entityName = v.detailId
        ? queryEntityNameById(v.detailId)
        : v.entityName;
    row.fieldName = v.fieldName;
    row.isRead = v.isRead;
    row.fieldNameLabel = v.fieldNameLabel;
    row.fieldNameVale = v.fieldNameVale;
    row.idFieldName = getEntityIdFieldName(v);
    row.nameFieldName = getEntityNameFieldName(v);
    row.detailEntityFlag = v.detailEntityFlag;
    row.refEntityBindingField = v.refEntityBindingField;
    row.disableWidgets = v.disableWidgets;
    row.data = v.data;
    row.actionType = v.actionType;
    row.customDialogTitle = v.customDialogTitle;
    if(row.detailId) {
        row.dialogTitle = "编辑：" + row[row.nameFieldName];
    }else {
        row.dialogTitle = "新建：" + queryEntityLabelByName(row.entityName);
    }
    // 表单默认赋值
    row.defaultFormData = v.defaultFormData;
    paramDialogConf.value = v.dialogConf;
    formId.value = v.formId;
    globalDsv.value = Object.assign(globalDsv.value, v.localDsv);
    globalDsv.value.parentExposed = currentExposed.value;
    globalDsv.value.modelName = getModelName();
    if(v.sourceRecord) {
        globalDsv.value.sourceRecord = v.sourceRecord;
    }
    isReferenceComp.value = v.isReferenceComp;
    // 如果是引用组件调用，有引用组件表单数据
    if(isReferenceComp.value){
        referenceCompFormData.value = v.formData;
    }
    let param = {
        id: v.detailId || null,
        // 2新建 3更新
        rightType: v.detailId ? 3 : 2,
        entityName: v.detailId ? "" : v.entityName,
    };
    isShowSaveAndSubmit.value = false;
    let approvalConfigRes = await getApprovalConfigByEntity(row.entityName);
    if(approvalConfigRes && approvalConfigRes.data && approvalConfigRes.data.length > 0) {
        isShowSaveAndSubmit.value = true;
    }
    let res = await checkRight(param.id, param.rightType, param.entityName);
    if (res.data && res.data.code == 200 && res.data.data) {
        loadMyLayoutConfig()
        isShow.value = true;
        await initFormLayout();
    } else {
        ElMessage.error(
            "当前用户没有" + (v.actionType == 'copy' ? "复制" : (v.detailId ? "编辑" : "新建")) + "权限"
        );
    }
};

/**
 *
 * *********************************************************** 表单信息相关 beg
 *
 */

const vFormRef = ref();
let haveLayoutJson = ref(false);
// 初始化自定义表单
const initFormLayout = async () => {
    loading.value = true;
    haveLayoutJson.value = false;
    globalDsv.value.formEntity = row.entityName;
    globalDsv.value.formEntityIdFieldName = getEntityIdFieldName(row);
    globalDsv.value.setRowRecordId = setRowRecordId;
    let useFormId = formId.value;

    let res = await getFormLayout(row.entityName, useFormId);
    if (res) {
        if (res.data?.layoutJson) {
            globalDsv.value.useFormId = res.data.formLayoutId;
            haveLayoutJson.value = true;
            optionData.value = res.data.optionData || {};
            if(res.data.codeOptionData) {
                optionData.value = Object.assign(optionData.value, res.data.codeOptionData);
            }
            if(res.data.cascaderOptionData) {
                optionData.value = Object.assign(optionData.value, res.data.cascaderOptionData);
            }
            if (res.data.formUploadParam) {
                globalDsv.value.cloudUploadToken =
                    res.data.formUploadParam.cloudUploadToken;
                globalDsv.value.cloudStorage =
                    res.data.formUploadParam.cloudStorage;
                globalDsv.value.picUploadURL =
                    res.data.formUploadParam.picUploadURL;
                globalDsv.value.fileUploadURL =
                    res.data.formUploadParam.fileUploadURL;
                globalDsv.value.picDownloadPrefix =
                    res.data.formUploadParam.picDownloadPrefix;
                globalDsv.value.fileDownloadPrefix =
                    res.data.formUploadParam.fileDownloadPrefix;
            }
            // 是编辑
            if (row.detailId) {
                // 根据数据渲染出页面填入的值，填过
                nextTick(async () => {
					globalDsv.value.formStatus = 'edit';
					globalDsv.value.formEntityId = row.detailId;
					globalDsv.value.dataRecordId = row.detailId;
                    vFormRef.value?.setFormJson(res.data.layoutJson);
                    let formFieldSchema = formatQueryByIdParam(vFormRef.value?.buildFormFieldSchema());
					let formData = await queryById(
                        row.detailId,
                        formFieldSchema.fieldNames,
                        { queryDetailList: formFieldSchema.queryDetailList }
                    );
                    if (formData && formData.data) {
                        if(props.nameFieldName && formData.data[props.nameFieldName]) {
                            row.dialogTitle =
                                "编辑：" + formData.data[props.nameFieldName];
                        }else if(row.nameFieldName && formData.data[row.nameFieldName]) {
                            row.dialogTitle =
                                "编辑：" + formData.data[row.nameFieldName];
                        }else if(row.idFieldName && formData.data[row.idFieldName]) {
                            row.dialogTitle =
                                "编辑：" + formData.data[row.idFieldName];
                        }else {
                            row.dialogTitle = "编辑"
                        }
                        row.approvalStatus = formData.data.approvalStatus || {};
                        globalDsv.value.recordData = formData.data;
                        nextTick(() => {
                            let setFormData = formatFormVirtualField(formData.data);
                            if(row.defaultFormData) {
                                setFormData = Object.assign(setFormData, row.defaultFormData);
                            }
							vFormRef.value?.setFormData(setFormData);
                            nextTick(() => {
                                vFormRef.value?.reloadOptionData();
                                // 非必填字段
                                if(props.notRequiredFields && props.notRequiredFields.length > 0){
                                    vFormRef.value?.setWidgetsRequired(props.notRequiredFields, false);
                                }
                                if (
                                    !checkModifiableEntity(row.detailId, row.approvalStatus.value) ||
                                    row.isRead
                                ) {
                                    vFormRef.value?.disableForm();
                                    return;
                                }
                                if(row.refEntityBindingField && !row.detailEntityFlag){
                                    vFormRef.value?.disableWidgets([row.refEntityBindingField]);
                                }
                               
                                getFieldListOfEntityApi("updatable");
                            })
                        });
                    }
                    loading.value = false;
                });
            }
            // 是新建
            else {
                nextTick(async () => {
                    row.dialogTitle =
                        "新建：" + queryEntityLabelByName(row.entityName);
					globalDsv.value.formStatus = 'new';
                    globalDsv.value.formEntityId = "";
                    globalDsv.value.dataRecordId = row.detailId;
                    vFormRef.value?.setFormJson(res.data.layoutJson);
                    let param = {};
                    if (row.fieldName) {
                        param[row.fieldName] = {
                            id: row.fieldNameVale,
                            name: row.fieldNameLabel,
                        };
                        if(props.isUser){
                            row.fieldName = null;
                            row.fieldNameLabel = null;
                            row.fieldNameVale = null;
                        }
                    }
                    if(isReferenceComp.value && !row.detailEntityFlag){
                        param[row.refEntityBindingField] = {
                            id: row.formEntityId,
                            name: row.fieldNameLabel,
                        }
                    }
					nextTick(() => {
                        if(globalDsv.value.backfillFormData) {
                            param = Object.assign(param, globalDsv.value.backfillFormData);
                        }
                        if(row.defaultFormData) {
                            param = Object.assign(param, row.defaultFormData);
                        }
                        let setFormData = formatFormVirtualField(param);
						vFormRef.value?.setFormData(setFormData);
						nextTick(() => {
							if (row.fieldName && !props.unDisableWidgets.includes(row.fieldName)) {
								vFormRef.value?.disableWidgets([row.fieldName]);
							}
                            if(isReferenceComp.value && !row.detailEntityFlag){
                                vFormRef.value?.disableWidgets([row.refEntityBindingField]);
                            }
                            // 非必填字段
                            if(props.notRequiredFields && props.notRequiredFields.length > 0){
                                vFormRef.value?.setWidgetsRequired(props.notRequiredFields, false);
                            }
							vFormRef.value?.reloadOptionData();
							// 获取字段是否禁用
							getFieldListOfEntityApi("creatable");
                            loading.value = false;
						});
					});　
                });
            }
        }else {
            loading.value = false;
        }
    }else {
        loading.value = false;
    }
};

/**
 * 获取字段是否禁用
 */

const getFieldListOfEntityApi = async (tag) => {
    // 获取实体所有字段
    let res = await getFieldListOfEntity(row.entityName);
    let disabledFields = [];
    if (res && res.data) {
        // 取可编辑字段
        res.data.forEach((el) => {
            if (!el[tag]) {
                disabledFields.push(el.name);
            }
        });
    }
    if (props.disableWidgets.length > 0) {
        props.disableWidgets.forEach(el => {
            if(!props.unDisableWidgets.includes(el)){
                disabledFields.push(el);
            }
        })
    }
    if(row.disableWidgets && row.disableWidgets.length > 0){
        row.disableWidgets.forEach(el => {
            if(!props.unDisableWidgets.includes(el)){
                disabledFields.push(el);
            }
        })
    }
    vFormRef.value?.disableWidgets(disabledFields);
};

/**
 *
 * *********************************************************** 表单信息相关 end
 *
 */

// 提交审批弹框
let SubmitApprovalDialogRefs = ref();

// 保存（并发互斥 + finally 复位 + 可选 blur 同步等待）
const confirm = async (target, resetFormData = {}, callback) => {
    if (!vFormRef.value) {
        cancel();
        return;
    }
    // 并发互斥：正在保存时直接返回
    if (loading.value) return;
    
    loading.value = true;

    try {
        // 收集子表字段名称，后续剔除
        let listSubForm = [];
        vFormRef.value?.getContainerWidgets().forEach(el => {
            if (el.type == 'list-sub-form') {
                listSubForm.push(el.name);
            }
        });

        // 确保触发当前输入控件的 blur，使 v-model / 校验值完成同步
        await flushActiveFieldBlur();
        await new Promise((resolve) => setTimeout(resolve, 500));
        const formData = await vFormRef.value?.getFormData();
        if (!formData) return;

        if (row.fieldName) {
            formData[row.fieldName] = {
                id: row.fieldNameVale,
                name: row.fieldNameLabel,
            };
        }

        // 去除子表数据
        listSubForm.forEach(el => { delete formData[el]; });

        let saveRes;
        if(row.actionType == 'copy'){
            row.detailId = null;
            row.actionType = '';
        }
        if (props.queryUrl) {
            saveRes = await http.post(
                props.queryUrl,
                Object.assign(formData, resetFormData),
                { params: { entity: row.entityName, [props.queryUrlIdName]: row.detailId } }
            );
        } else if (isReferenceComp.value) {
            let { referenceCompName, referenceCompEntity } = referenceCompFormData.value;
            delete referenceCompFormData.value.referenceCompName;
            delete referenceCompFormData.value.referenceCompEntity;
            let saveFormData = row.formEntityId ? cloneDeep(formData) : referenceCompFormData.value;
            referenceCompFormData.value[referenceCompName] = [cloneDeep(formData)];
            if (row.formEntityId) {
                saveFormData[row.detailEntityFlag ? row.mainDetailField : row.refEntityBindingField] = row.formEntityId;
            }
            saveRes = await saveRecord(
                row.formEntityId ? row.entityName : referenceCompEntity,
                row.detailId,
                Object.assign(saveFormData, resetFormData),
            );
        } else {
            if (props.isTeam) {
                saveRes = await saveTeam(row.entityName, row.detailId, Object.assign(formData, resetFormData));
            } else if (props.isUser || row.entityName == 'User') {
                saveRes = await saveUser(row.entityName, row.detailId, Object.assign(formData, resetFormData));
            } else if (row.entityName == 'Department') {
                saveRes = await saveDepartment(row.entityName, row.detailId, Object.assign(formData, resetFormData));
            } else {
                saveRes = await saveRecord(row.entityName, row.detailId, Object.assign(formData, resetFormData));
            }
        }

        if (saveRes && (saveRes.data?.code == 200 || saveRes.code == 200)) {
            ElMessage.success("保存成功");
            let resData = saveRes.data.formData || {};
            resData.needCb = isReferenceComp.value && !row.formEntityId ? true : false;
            emits("saveFinishCallBack", resData);
            emits("onConfirm", resData);
            callback && callback(resData);
            if (target != 'notCloseDialog' && target != 'submit') {
                cancel();
            } else {
                // 如果是新建，重新初始化表单
                if (!row.detailId) {
                    row.detailId = resData[getEntityIdFieldName(row)];
                    row.nameFieldName = getEntityNameFieldName(row);
                    initFormLayout();
                }
                if (target == 'submit') {
                    SubmitApprovalDialogRefs.value?.openDialog(row.detailId);
                }
            }
        }
    } catch (err) {
        console.log(err, 'err');
        if (!globalDsv.value.defaultValidationMessageDisabled) {
            ElMessage.error("表单校验失败，请修改后重新提交");
        }
    } finally {
        // 确保任何分支都复位 loading
        loading.value = false;
    }
};

// 主动触发当前激活输入的 blur，并提供一个可配置的“稳定等待时间”，避免因为未触发 blur 导致值不同步
const flushActiveFieldBlur = async () => {
    try {
        const active = document.activeElement;
        if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable)) {
            active.blur();
        }
    } catch (e) {
        // 忽略
    }
    await nextTick();
    // 可通过 editParamConf.blurSettleMs 配置等待时长，默认 120ms；若你需要 500ms，可在调用处传入配置
    const settleMs = editParamConf.value?.blurSettleMs ?? 120;
    if (settleMs > 0) {
        await new Promise(resolve => setTimeout(resolve, settleMs));
    }
};

const cloneDeep = (data) => {
    return JSON.parse(JSON.stringify(data));
}

// 保存并刷新
const confirmRefresh = () => {
    confirm('notCloseDialog')
}

// 保存并提交
const confirmSaveAndSubmit = () => {
    confirm('submit')
}
// 提交审批成功
const submitApprovalSuccess = () => {
    cancel();
    emits("saveFinishCallBack");
    emits("onConfirm");
}

/**
 * 导出方法
 */



// 列表子表单回调所需
const setRowRecordId = (id) => {
    row.detailId = id;
}

const refresh = () => {
    emits("saveFinishCallBack", {});
    emits("onConfirm", {});
}

const cancel = () => {
    keyboardEventToInput();
    isShow.value = false;
}

const getCurEntityName = () => {
    return row.entityName
}

const getFormRef = () => {
    return vFormRef?.value
}

const getGlobalDsv = () => {
    return globalDsv.value
}

const getRecordId = () => {
    return row.detailId
}

// 传入ID从新建弹框变成编辑弹框
const editById = (id) => {
    haveLayoutJson.value = false;
    row.detailId = id;
    initFormLayout();
}

// 重新加载数据
const reload = () => {
    haveLayoutJson.value = false;
    initFormLayout();
}

const getEntityIdFieldName = (row) => {
    return queryEntityInfoByName(row.entityName).idFieldName;
}

const getEntityNameFieldName = (row) => {
    return queryEntityInfoByName(row.entityName).nameFieldName;
}
// 打开价格对比弹框
let PriceComparisonDialogRefs = ref();
const openPriceComparisonDialog = (recordId = '') => {
    PriceComparisonDialogRefs.value?.openDialog(recordId);
}




defineExpose({
    openDialog,
    confirm,
    refresh,
    cancel,
    getCurEntityName,
    getFormRef,
    getGlobalDsv,
    getRecordId,
    editById,
    loading,
    reload,
    openPriceComparisonDialog
});
</script>
<style lang='scss' scoped>
:deep(.el-form-item--default) {
    margin-bottom: 5px !important;
}

.main {
    // max-height: 500px;
    overflow-x: hidden;
    overflow-y: auto;
    box-sizing: border-box;
    padding: 20px;
    .info-box {
        height: 26px;
        line-height: 26px;
        background: #f7b904;
        text-align: center;
        color: #fff;
        border-radius: 3px;
    }
}
</style>
<style lang="scss">
.edit-loading {
    .el-loading-spinner {
        top: 30%;
    }
}
</style>