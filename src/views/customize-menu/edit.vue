<template>
    <ml-dialog
        :title="row.dialogTitle"
        v-if="isShow"
        v-model="isShow"
        width="55%"
        draggable
        :showFullSceen="styleConf?.actionConf.showFullScreen"
        :autoFullScreen="styleConf?.actionConf.autoFullScreen"
        append-to-body
        bodyNoPadding
        :showClose="!loading"
    >
        <div class="main fullsceen-man" v-loading="loading">
            <div class="info-box" v-if="row.detailId && row.approvalStatus.value != 1 &&!checkModifiableEntity(row.detailId, row.approvalStatus.value)">记录已完成审批，禁止编辑</div>
            <div class="info-box" v-if="row.detailId && row.approvalStatus.value == 1">记录正在审批中，禁止编辑</div>
            <v-form-render
                v-if="haveLayoutJson"
                ref="vFormRef"
                :global-dsv="globalDsv"
                :option-data="optionData"
            />
            <el-empty v-else :image-size="100" description="未查询到相关配置数据" />
        </div>
        <template #footer v-if="editParamConf.showFooter">
            <slot name="beforeCancelBtn"></slot>
            <el-button 
                @click="cancel" 
                :loading="loading"
                v-if="editParamConf.showCancelBtn"
            >
                取消
            </el-button>
            <slot name="beforeConfirmBtn"></slot>
            <el-button
                type="primary"
                @click="confirm"
                v-if="editParamConf.showConfirmBtn && (!row.detailId || (row.approvalStatus.value != 1 && row.approvalStatus.value != 3))"
                :loading="loading"
                icon="Select"
            >
                保存
            </el-button>
            <slot name="beforeConfirmRefreshBtn"></slot>
            <el-button
                type="primary"
                @click="confirmRefresh"
                v-if="editParamConf.showConfirmRefreshBtn && (!row.detailId || (row.approvalStatus.value != 1 && row.approvalStatus.value != 3))"
                :loading="loading"
                plain
                icon="Refresh"
            >
                保存并刷新
            </el-button>
            <slot name="afterConfirmRefreshBtn"></slot>
        </template>
    </ml-dialog>
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
import { saveUser, checkRight } from "@/api/user";
import useCommonStore from "@/store/modules/common";
import { ElMessage } from "element-plus";
const { queryEntityNameById, queryEntityLabelByName, checkModifiableEntity } = useCommonStore();

const props = defineProps({
    isTeam: { type: Boolean, default: false },
    isUser: { type: Boolean, default: false },
    disableWidgets: { type: Array, default: () => [] },
    nameFieldName: { type: String, default: "" },
    layoutConfig: { type: Object, default: () => {} },
    // 新建编辑配置
    editConf: {
        type: Object,
        default: () => {}
    },
    // 新增记录表单id
    recordNewFormId: {
		type: String,
		default: "",
	},
    // 编辑记录表单id
    recordEditFormId: {
		type: String,
		default: "",
	},
});

const emits = defineEmits(['saveFinishCallBack']);


// Api：https://www.yuque.com/xieqi-nzpdn/as7g0w/kon80ysuog88r0um?singleDoc# 《自定义实体新建编辑PC》
// 配置项
const editParamConf = ref({
    showFooter: true,
    showConfirmBtn: true,
    showCancelBtn: true,
    showConfirmRefreshBtn: true,
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

// 加载配置信息
const loadMyLayoutConfig = () => {
    myLayoutConfig.value = props.layoutConfig || {};
    let { STYLE } = myLayoutConfig.value;
    if (STYLE && STYLE.config) {
        styleConf.value = JSON.parse(STYLE.config);
    }
};

let row = reactive({
    dialogTitle:"",
    approvalStatus: {},
    detailId: "",
    entityName: "",
    fieldName: "",
    fieldNameLabel: "",
    fieldNameVale: "",
    idFieldName:"",
    formEntityId:"",
    mainDetailField:"",
    isRead: false,
    detailEntityFlag: true,
    refEntityBindingField: "",
});


let globalDsv = ref({
    uploadServer: import.meta.env.VITE_APP_BASE_API,
    baseApi: import.meta.env.VITE_APP_BASE_API,
    SERVER_API: import.meta.env.VITE_APP_BASE_API,
});



let optionData = ref({});
let loading = ref(false);
let isShow = ref(false);
// 是否引用组件调用保存
let isReferenceComp = ref(false);
// 引用组件的表单数据
let referenceCompFormData = ref({});
// 指定表单ID
let formId = ref("");

const openDialog = async (v) => {
    row.dialogTitle = "Loading...";
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
    row.idFieldName = v.idFieldName;
    row.detailEntityFlag = v.detailEntityFlag;
    row.refEntityBindingField = v.refEntityBindingField;
    formId.value = v.formId;
    globalDsv.value = Object.assign(globalDsv.value, v.localDsv);
    globalDsv.value.parentExposed = currentExposed.value;
    if(v.sourceRecord) {
        globalDsv.value.sourceRecord = v.sourceRecord;
    }
    isReferenceComp.value = v.isReferenceComp;
    // 如果是引用组件调用，有引用组件表单数据
    if(isReferenceComp.value){
        referenceCompFormData.value = v.formData;
    }
    let param = {
        id: v.detailId,
        // 2新建 3更新
        rightType: v.detailId ? 3 : 2,
        entityName: v.detailId ? "" : v.entityName,
    };
    let res = await checkRight(param.id, param.rightType, param.entityName);
    if (res.data && res.data.code == 200 && res.data.data) {
        isShow.value = true;
        initFormLayout();
        loadMyLayoutConfig();
    } else {
        ElMessage.error(
            "当前用户没有" + (v.detailId ? "编辑" : "新建") + "权限"
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
    globalDsv.value.formEntity = row.entityName;
    globalDsv.value.formEntityIdFieldName = row.idFieldName;
    globalDsv.value.setRowRecordId = setRowRecordId;
    let { recordNewFormId, recordEditFormId } = props;
    // 表单ID使用： 复写方法ID > 传入ID
    let useFormId = formId.value || (row.detailId ? recordEditFormId : recordNewFormId);
    let res = await getFormLayout(row.entityName, useFormId);
    if (res) {
        if (res.data?.layoutJson) {
            haveLayoutJson.value = true;
            optionData.value = res.data.optionData || {};
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
					let formData = await queryById(row.detailId);
                    
					vFormRef.value?.setFormJson(res.data.layoutJson);
                    if (formData && formData.data) {
                        row.dialogTitle =
                            "编辑" + formData.data[props.nameFieldName];
                        row.approvalStatus = formData.data.approvalStatus || {};
                        globalDsv.value.recordData = formData.data;
                        nextTick(() => {
							vFormRef.value.setFormData(formData.data);
                            nextTick(() => {
                                vFormRef.value.reloadOptionData();
                                if (
                                    !checkModifiableEntity(row.detailId, row.approvalStatus.value) ||
                                    row.isRead
                                ) {
                                    vFormRef.value.disableForm();
                                    return;
                                }
                                if(row.refEntityBindingField && !row.detailEntityFlag){
                                    vFormRef.value.disableWidgets([row.refEntityBindingField]);
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
                        "新建" + queryEntityLabelByName(row.entityName);
					globalDsv.value.formStatus = 'new';
                    globalDsv.value.formEntityId = "";
                    vFormRef.value.setFormJson(res.data.layoutJson);
                    let param = {};
                    if (row.fieldName) {
                        param[row.fieldName] = {
                            id: row.fieldNameVale,
                            name: row.fieldNameLabel,
                        };
                    }
                    if(isReferenceComp.value && !row.detailEntityFlag){
                        param[row.refEntityBindingField] = {
                            id: row.formEntityId,
                            name: row.fieldNameLabel,
                        }
                    }
					nextTick(() => {
						vFormRef.value.setFormData(param);
						nextTick(() => {
							if (row.fieldName) {
								vFormRef.value.disableWidgets([row.fieldName]);
							}
                            if(isReferenceComp.value && !row.detailEntityFlag){
                                vFormRef.value.disableWidgets([row.refEntityBindingField]);
                            }
							vFormRef.value.reloadOptionData();
							// 获取字段是否禁用
							getFieldListOfEntityApi("creatable");
						});
					});
                });
            }
        }
    }
    loading.value = false;
};

/**
 * 获取字段是否禁用
 */

const getFieldListOfEntityApi = async (tag) => {
    // 获取实体所有字段
    let res = await getFieldListOfEntity(row.entityName);
    let disabledFileds = [];
    if (res && res.data) {
        // 取可编辑字段
        res.data.forEach((el) => {
            if (!el[tag]) {
                disabledFileds.push(el.name);
            }
        });
    }
    if (props.disableWidgets.length > 0) {
        disabledFileds.push(...props.disableWidgets);
    }
    vFormRef.value.disableWidgets(disabledFileds);
};

/**
 *
 * *********************************************************** 表单信息相关 end
 *
 */
// 保存
const confirm = async (target) => {
    if (!vFormRef.value) {
        isShow.value = false;
        return;
    }
    let listSubForm = [];
    vFormRef.value.getContainerWidgets().forEach(el => {
        if(el.type == 'list-sub-form'){
            listSubForm.push(el.name);
        }
    })
    vFormRef.value
        .getFormData()
        .then(async (formData) => {
            if (row.fieldName) {
                formData[row.fieldName] = {
                    id: row.fieldNameVale,
                    name: row.fieldNameLabel,
                };
            }
            if (formData) {
                listSubForm.forEach(el => {
                    delete formData[el];
                })
                loading.value = true;
                let saveRes;
                if(isReferenceComp.value){
                    let { referenceCompName, referenceCompEntity } = referenceCompFormData.value;
                    delete referenceCompFormData.value.referenceCompName
                    delete referenceCompFormData.value.referenceCompEntity
                    let saveFormData = row.formEntityId ? cloneDeep(formData) : referenceCompFormData.value;
                    referenceCompFormData.value[referenceCompName] = [cloneDeep(formData)];
                    if(row.formEntityId){
                        saveFormData[row.detailEntityFlag ? row.mainDetailField : row.refEntityBindingField] = row.formEntityId;
                    }
                    saveRes = await saveRecord(
                        row.formEntityId ? row.entityName : referenceCompEntity,
                        row.detailId,
                        saveFormData,
                    );
                }else {
                    if (props.isTeam) {
                        saveRes = await saveTeam(
                            row.entityName,
                            row.detailId,
                            formData
                        );
                    } else if (props.isUser) {
                        saveRes = await saveUser(
                            row.entityName,
                            row.detailId,
                            formData
                        );
                    } else {
                        saveRes = await saveRecord(
                            row.entityName,
                            row.detailId,
                            formData
                        );
                    }
                }
                if (
                    saveRes &&
                    (saveRes.data?.code == 200 || saveRes.code == 200)
                ) {
                    ElMessage.success("保存成功");
                    let resData = saveRes.data.formData || {};
                    resData.needCb = false;
                    if(isReferenceComp.value && !row.formEntityId){
                        resData.needCb = true;
                    }
                    emits("saveFinishCallBack", resData);
                    
                    if(target != 'notCloseDialog'){
                        isShow.value = false;
                    }else {
                        row.detailId = resData[row.idFieldName];
                        initFormLayout()
                    }
                }
                loading.value = false;
            }
        })
        .catch((err) => {
            console.log(err,'err')
            ElMessage.error("表单校验失败，请修改后重新提交");
        });
};

const cloneDeep = (data) => {
    return JSON.parse(JSON.stringify(data));
}

// 保存并刷新
const confirmRefresh = () => {
    confirm('notCloseDialog')
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
}

const cancel = () => {
    isShow.value = false
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



defineExpose({
    openDialog,
    confirm,
    refresh,
    cancel,
    getCurEntityName,
    getFormRef,
    getGlobalDsv,
    getRecordId,
    loading,
});
</script>
<style lang='scss' scoped>
:deep(.el-form-item--default) {
    margin-bottom: 5px !important;
}

.main {
    max-height: 500px;
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
