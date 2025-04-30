<template>
    <el-drawer 
        size="73%" 
        class="ml-drawer" 
        v-model="isShow" 
        direction="rtl" 
        :show-close="false"
        :append-to-body="true"
    >
        <template #header>
            <div class="detail-header">
                {{ approvalName }} 审批
                <div class="fr fr-box">
                    <span class="fr-icon" @click="isShow = false">
                        <el-icon>
                            <ElIconCloseBold />
                        </el-icon>
                    </span>
                </div>
            </div>
        </template>
        <div class="detail-main" v-loading="loading">
            <el-row :gutter="20">
                <el-col :span="approvalTask.type ? 18 : 24">
                    <div class="detail-container">
                        <mlApproveBar :approvalInfo="approvalTask" />
                        <v-form-render
                            v-if="haveLayoutJson"
                            ref="vFormRef"
                            :option-data="optionData"
                            :form-data="formData"
                            :global-dsv="globalDsv"
                        />
                        <el-empty
                            v-else
                            :image-size="100"
                            :description="approvalTask.type ? '未查询到相关配置数据' : '该流程已结束或者流程异常'"
                        />
                    </div>
                </el-col>
                <el-col :span="6" v-if="approvalTask.type">
                    <el-form label-position="top" label-width="100px">
                        <el-form-item label="批注">
                            <el-input
                                v-model="form.remark"
                                :autosize="{ minRows: 4, maxRows: 6 }"
                                type="textarea"
                                placeholder="输入批注(可选)"
                                maxlength="500"
                                show-word-limit
                            />
                        </el-form-item>
                        <el-form-item v-if="approvalTask.userSelectFlag">
                            <template #label>
                                <el-icon class="icon filled-icon">
                                    <el-icon-user-filled />
                                </el-icon>下一审批人(或签)
                            </template>
                            <mlSelectUser v-model="form.nextApprovalUserList" multiple clearable />
                        </el-form-item>
                        <el-form-item>
                            <template #label>
                                <el-icon class="icon promotion-icon">
                                    <el-icon-promotion />
                                </el-icon>本次审批结果将抄送给
                            </template>
                            <mlSelectUser v-model="form.currentCCToUserList" multiple clearable />
                        </el-form-item>
                        <el-form-item style="margin-bottom: 0;">
                            <div class="foot-btn w-100">
                                <el-dropdown
                                    trigger="click"
                                    @command="handleCommand"
                                    v-if="approvalTask.transferApproval || approvalTask.addSignaturesApproval"
                                >
                                    <span class="el-dropdown-link" style="position: relative;top: -1px">
                                        更多
                                        <el-icon class="el-icon--right">
                                            <ElIconMoreFilled />
                                        </el-icon>
                                    </span>
                                    <template #dropdown>
                                        <el-dropdown-menu>
                                            <el-dropdown-item
                                                v-if="approvalTask.transferApproval"
                                                :icon="Avatar"
                                                :command="1"
                                            >
                                                {{ customButtonText.specialReviewButtonText }}
                                            </el-dropdown-item>
                                            <el-dropdown-item
                                                v-if="approvalTask.addSignaturesApproval"
                                                :icon="CirclePlusFilled"
                                                :command="2"
                                            >
                                                {{ customButtonText.addSignatureButtonText }}
                                            </el-dropdown-item>
                                        </el-dropdown-menu>
                                    </template>
                                </el-dropdown>
                                <el-button 
                                    type="primary" 
                                    @click="beforeConfirmApprove" 
                                    style="min-width: 60px !important;"
                                    icon="Finished"
                                >
                                    {{ customButtonText.confirmButtonText }}
                                </el-button>
                                <el-button 
                                    type="danger" 
                                    @click="beforeReject" 
                                    style="min-width: 60px !important;"
                                    v-if="!approvalTask.prohibitRejection"
                                    icon="RefreshLeft"
                                >
                                    {{ customButtonText.rejectButtonText }}
                                </el-button>
                                <el-button 
                                    @click="canner" 
                                    style="min-width: 60px !important;"
                                >
                                    {{ customButtonText.cancelButtonText }}
                                </el-button>
                            </div>
                        </el-form-item>
                    </el-form>
                </el-col>
            </el-row>
        </div>
    </el-drawer>
    <mlDialog v-model="otherDialog" :title="taskOperation.title" width="35%" appendToBody>
        <el-form label-position="top" label-width="100px" v-loading="otherLoading">
            <el-form-item :label="taskOperation.title + '到哪些用户'">
                <mlSelectUser
                    type="User"
                    v-model="taskOperation.nodeRoleList"
                    :multiple="!(approvalTask.flowType == 2 && taskOperation.title == '转审')"
                    clearable
                />
            </el-form-item>
            <el-form-item style="margin-bottom: 0;">
                <div class="foot-btn w-100">
                    <el-button type="primary" @click="confirmApostille">确定</el-button>
                    <el-button @click="otherDialog = false">取消</el-button>
                </div>
            </el-form-item>
        </el-form>
    </mlDialog>
    <mlDialog v-model="esignConf.show" title="手写签名" width="845" appendToBody>
        <vue-esign
            ref="esignRef"
            class="esignature"
            :width="800"
            :height="300"
            :isCrop="esignConf.isCrop"
            :lineWidth="esignConf.lineWidth"
            :lineColor="esignConf.lineColor"
            v-model:bgColor="esignConf.bgColor"
        />
        <div class="foot-btn w-100">
            <el-button @click="handleReset">重签</el-button>
            <el-button type="primary" @click="handleGenerate">确认</el-button>
        </div>
    </mlDialog>
    <!-- 驳回弹框 -->
    <mlDialog v-model="rejectDialogShow" :title="`选择${customButtonText.rejectButtonText}节点`" width="400" appendToBody>
        <div v-loading="rejectDialogLoading">
            <el-form label-width="100px">
                <el-form-item :label="`选择${customButtonText.rejectButtonText}节点`">
                    <el-select v-model="rejectNode" :placeholder="`选择${customButtonText.rejectButtonText}节点`" class="w-100">
                        <el-option
                            v-for="item in rejectNodeList"
                            :key="item.targetKey"
                            :label="item.targetName"
                            :value="item.targetKey"
                        />
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <div class="w-100" style="text-align: right;">
                        <el-button @click="rejectDialogShow= false">取消</el-button>
                        <el-button type="danger" @click="confirmReject">确认{{ customButtonText.rejectButtonText }}</el-button>
                    </div>
                </el-form-item>
            </el-form>
        </div>
    </mlDialog>
    <!-- 选择审批任务弹框 -->
	<mlDialog
		v-model="approveTaskConf.isShow"
		title="选择审批任务"
		width="400"
		appendToBody
	>
		<el-form label-width="100px">
			<el-form-item label="选择审批任务">
				<el-select
					v-model="approveTaskConf.taskId"
					placeholder="请选择审批任务"
					class="w-100"
				>
					<el-option
						v-for="item in approveTaskConf.taskList"
						:key="item.approvalTaskId"
						:label="item.stepName"
						:value="item.approvalTaskId"
					/>
				</el-select>
			</el-form-item>
			<el-form-item>
				<div class="w-100" style="text-align: right">
					<el-button @click="approveTaskConf.isShow = false">
                        取消
                    </el-button>
					<el-button type="primary" @click="confirmApproveTask">
                        确认任务
                    </el-button>
				</div>
			</el-form-item>
		</el-form>
	</mlDialog>
</template>

<script setup>
import http from "@/utils/request";
import { Avatar, CirclePlusFilled } from "@element-plus/icons-vue";
import { watch, ref, onMounted, reactive, nextTick } from "vue";
import { queryById, saveRecord } from "@/api/crud";
import { getRecordApprovalState } from '@/api/approval';
import { getRejectNodeList } from "@/api/approval";
import useCommonStore from "@/store/modules/common";
import { storeToRefs } from "pinia";
import { getFormLayout } from "@/api/system-manager";
import { 
    globalDsvDefaultData, 
    formatFormVirtualField, 
    formatQueryByIdParam,
    checkApprovalPreEvent
 } from "@/utils/util";


/**
 * 组件
 */
import mlApproveBar from "@/components/mlApproveBar/index.vue";
// 签名组件
import vueEsign from "vue-esign";
import { ElMessage } from "element-plus";
const { allEntityName } = storeToRefs(useCommonStore());
const { queryEntityNameById } = useCommonStore();
const props = defineProps({
    modelValue: null,
    taskId: { type: String, default: "" },
    entityId: { type: String, default: "" },
    title: { type: String, default: "" },
    approvalName: { type: String, default: "" },
    // 是否作为dialog调用
    isDialog: { type: Boolean, default: false },
});
const emit = defineEmits(["update:modelValue", "canner", "confirm"]);
let loading = ref(false);
// 弹框是否显示
let isShow = ref(null);
// 审核数据
let form = ref({
    // 批注
    remark: "",
    // 下一审批人
    nextApprovalUserList: [],
    // 本次抄送
    currentCCToUserList: [],
    // 关联实体
    entityId: "",
    // 是否驳回
    isBacked: false,
});
let approvalTask = ref({});
// 其他弹框是否出现
let otherDialog = ref(false);
let otherLoading = ref(false);
// 其他弹框类型
let taskOperation = ref({
    title: "转审",
    // 1:转审 2:加签
    type: 1,
    // 关联实体
    entityId: "",
    //    操作用户
    nodeRoleList: [],
});

watch(
    () => props.modelValue,
    () => {
        isShow.value = props.modelValue;
    },
    { deep: true }
);
watch(
    () => isShow.value,
    (v) => {
        emit("update:modelValue", v);
    },
    { deep: true }
);

onMounted(() => {
    if(!props.isDialog) {
        isShow.value = props.modelValue;
        getApprovalTaskById();
    }
});

/**
 *
 * *********************************************************** 表单信息相关 beg
 *
 */

const vFormRef = ref();
let haveLayoutJson = ref(false);
let optionData = ref({});
let formData = reactive({});
let globalDsv = ref(globalDsvDefaultData());

let currentApprovalTaskId = ref(null);

// 初始化自定义表单
const initFormLayout = async (formLayoutId) => {
    haveLayoutJson.value = false;
    loading.value = true;
    globalDsv.value.useFormId = formLayoutId;
    globalDsv.value.formEntity = queryEntityNameById(props.entityId);
    let res = await getFormLayout(
        allEntityName.value[approvalTask.value.entityCode] || queryEntityNameById(props.entityId),
        formLayoutId,
        formLayoutId ? true : false
    );
    if (res) {
        if (res.data?.layoutJson) {
			globalDsv.value.formStatus = "approval";
			globalDsv.value.formEntityId = props.entityId;
            haveLayoutJson.value = true;
            optionData.value = res.data.optionData || {};
            // // 根据数据渲染出页面填入的值，填过
            nextTick(async () => {
                if(!props.isDialog) {
                    await getApprovalTaskInfo();
                }else {
                    await getApprovalTaskById();
                }
                vFormRef.value.setFormJson(res.data.layoutJson);
                let buildFormFieldSchema = formatQueryByIdParam(vFormRef.value?.buildFormFieldSchema());
                let formData = await queryById(props.entityId, buildFormFieldSchema.fieldNames, { queryDetailList: buildFormFieldSchema.queryDetailList });
                
                if (formData) {
                    globalDsv.value.recordData = formData.data;
                    nextTick(()=>{
                        vFormRef.value.setFormData(formatFormVirtualField(formData.data));
                        nextTick(() => {
                            vFormRef.value.reloadOptionData();
                            vFormRef.value.disableForm();
                            nextTick(() => {
                                let modifiableFields = approvalTask.value?.modifiableFields || [];
                                // 显示可编辑的字段
                                let enableWidgets = [];
                                // 显示必填字段
                                let requiredWidgets = [];
                                modifiableFields.forEach(el => {
                                    // 主表字段
                                    if(!el.formEntity) {
                                        enableWidgets.push(el.name);
                                        if(el.isRequired) {
                                            requiredWidgets.push(el.name);
                                        }
                                    }
                                    // 字表字段
                                    else {
                                        let subFormField = el.name + "@sf=" + el.formEntity;
                                        enableWidgets.push(subFormField);
                                        if(el.isRequired) {
                                            requiredWidgets.push(subFormField);
                                        }
                                    }
                                });
                                vFormRef.value.enableWidgets(enableWidgets);
                                vFormRef.value.setWidgetsRequired(requiredWidgets, true);
                                // 显示可编辑的字段。即使设置了隐藏。
                                vFormRef.value.showWidgets(enableWidgets);
                            })
                        
                        });
                    })
                    
                    
                }
                loading.value = false;
            });
        } else {
            loading.value = false;
        }
    } else {
        loading.value = false;
    }
};
/**
 *
 * *********************************************************** 表单信息相关 end
 *
 */


/**
 * 审批任务相关
 */
 let approveTaskConf = ref({
	isShow: false,
	taskList: [],
	taskId: null,
});

// 确认审批任务
const confirmApproveTask = () => {
	let { taskId } = approveTaskConf.value;
	if (!taskId) {
		ElMessage.error("请选择审批任务");
		return;
	}
    isShow.value = true;
    approveTaskConf.value.isShow = false;
    currentApprovalTaskId.value = taskId;
    initFormLayout();
};


// 拓展按钮点击
function handleCommand(type) {
    // 转审、加签前置事件
    let preEvent = customButtonText.value[type == 1 ? 'specialReviewButtonTextPreEvent' : 'addSignatureButtonTextPreEvent'];
    if(!checkApprovalPreEvent(preEvent, vFormRef.value, ElMessage)) {
        return;
    }
    otherDialog.value = true;
    taskOperation.value.title = type == 1 ? "转审" : "加签";
    taskOperation.value.type = type;
    taskOperation.value.entityId = props.entityId;
    taskOperation.value.nodeRoleList = [];
}
// 确认加签
async function confirmApostille() {
    let { type, title } = taskOperation.value;
    if (taskOperation.value.nodeRoleList.length < 1) {
        ElMessage.warning("请选择要" + title + "到哪些人员");
        return;
    }
    // 是复杂工作流
    if (approvalTask.value.flowType == 2) {
        saveComplexFlow(type == 1 ? 4 : 5);
        return;
    }
    otherLoading.value = true;
    let res = await http.post("/approval/taskOperation", taskOperation.value);
    if (res) {
        ElMessage.success(title + "成功");
        otherDialog.value = false;
        // 如果是转审，2个弹框都要关掉
        if (type == 1) {
            canner();
            emit("confirm");
        }
    }
    otherLoading.value = false;
}

// 签名配置
let esignRef = ref("");
let esignConf = ref({
    show: false,
    // 画笔粗细
    lineWidth: 6,
    // 画笔颜色
    lineColor: "#000000",
    bgColor: "",
    resultImg: "",
    isCrop: false,
});
// 重新签名
const handleReset = () => {
    esignRef.value.reset();
};

// 确认签名
const handleGenerate = () => {
    esignRef.value.generate().then(res => {
        esignConf.value.resultImg = res;
        esignConf.value.show = false;
        confirmApprove(false);
    }).catch(err => {
        if(err == 'Warning: Not Signned!') {
            ElMessage.error("请手写签名")
        }
        else {
            console.log(err);
            ElMessage.error(err);
        }
    })
};

// 同意前触发
const beforeConfirmApprove = () => {
    // 同意前置事件
    if(!checkApprovalPreEvent(customButtonText.value.confirmButtonTextPreEvent, vFormRef.value, ElMessage)) {
        return;
    }
    // 需要手写签名
    if (approvalTask.value.autograph) {
        esignConf.value.show = true;
    } else {
        confirmApprove(false);
    }
};

// 驳回前触发
const beforeReject = () => {
    // 驳回前置事件
    if(!checkApprovalPreEvent(customButtonText.value.rejectButtonTextPreEvent, vFormRef.value, ElMessage)) {
        return;
    }
    let { flowType, rejectType } = approvalTask.value;
    // 如果是复杂工作流，且驳回类型是 3（驳回到任意节点）
    if (flowType == 2 && rejectType == 3) {
        // 打开驳回弹框
        openRejectDialog();
    } else {
        confirmApprove(true);
    }
};

// 同意审批
function confirmApprove(isBacked) {
    if(!vFormRef.value){
        ElMessage.error("没有找到表单");
        return
    }
    vFormRef.value.getFormData().then(async (formData) => {
        loading.value = true;
        let saveRes = await saveRecord(
            allEntityName.value[approvalTask.value.entityCode],
            props.entityId,
            formData
        );
        if (saveRes) {
            // 是复杂工作流
            if (approvalTask.value.flowType == 2) {
                saveComplexFlow(isBacked ? 2 : 1);
                return;
            } else {
                form.value.entityId = props.entityId;
                form.value.isBacked = isBacked;
                form.value.signatureImage = esignConf.value.resultImg;
                let res = await http.post(
                    "/approval/approvalProcess",
                    form.value
                );
                if (res) {
                    let msg = isBacked ? "驳回" : "审批";
                    ElMessage.success(msg + "成功");
                    canner();
                    emit("confirm");
                }
            }
        }
        loading.value = false;

    }).catch(err => {
        ElMessage.error("表单校验失败，请修改后重新提交");
    })
}

const customButtonText = ref({
    confirmButtonText: '同意',
    rejectButtonText: '驳回',
    cancelButtonText: '取消',
    specialReviewButtonText: '转审',
    addSignatureButtonText: '加签',
    // 前置事件
    confirmPreEvent: '',
    rejectPreEvent: '',
    specialReviewPreEvent: '',
    addSignaturePreEvent: '',
})


// 获取审核参数
async function getApprovalTaskById() {
    loading.value = true;
    let res = await http.get("/approval/getApprovalTaskById", {
        approvalTaskId: currentApprovalTaskId.value || props.taskId,
    });
    if (res) {
        approvalTask.value = res.data;
        // 如果是复杂工作流
        if (approvalTask.value.flowType == 2) {
            approvalTask.value = Object.assign(
                approvalTask.value,
                res.data.wfUseTask
            );
        } 
        let { customButtonJson } = approvalTask.value;
        if(customButtonJson) {
            let newCustomButtonJson = JSON.parse(customButtonJson);
            for (const key in newCustomButtonJson) {
                if (Object.prototype.hasOwnProperty.call(newCustomButtonJson, key)) {
                    const element = newCustomButtonJson[key];
                    customButtonText.value[key] = element.custom || element.default
                    customButtonText.value[key + 'PreEvent'] = element.script || '';
                }
            }
        }
        if(!props.isDialog) {
            initFormLayout(approvalTask.value.formLayoutId);
        }
    } else {
        loading.value = false;
    }
}
let approvalTaskInfo = ref(null);
const getApprovalTaskInfo = async () => {
    // 获取审批信息
    let recordApprovalRes = await getRecordApprovalState(props.entityId);
    if(recordApprovalRes){
        approvalTaskInfo.value = recordApprovalRes.data;
        if( recordApprovalRes.data?.flowVariables) {
            globalDsv.value.flowVariables = recordApprovalRes.data.flowVariables;
        }
        if(props.isDialog) {
            let { parallelTasks, approvalTaskId } = recordApprovalRes.data;
            currentApprovalTaskId.value = approvalTaskId;
            if(currentApprovalTaskId.value) {
                if (parallelTasks && parallelTasks.length > 1) {
                    approveTaskConf.value = {
                        isShow: true,
                        taskList: [...parallelTasks],
                        taskId: null,
                    };
                }else {
                    isShow.value = true;
                    initFormLayout();
                }
            }
        }
    }
}

// 关闭弹框
function canner() {
    isShow.value = false;
}

/**
 * 驳回到任意节点弹框
 */
// 驳回弹框
let rejectDialogShow = ref(false);
let rejectDialogLoading = ref(false);
// 驳回的节点集
let rejectNodeList = ref([]);
// 驳回节点
let rejectNode = ref("");

// 打开驳回节点弹框
const openRejectDialog = async () => {
    rejectDialogShow.value = true;
    rejectDialogLoading.value = true;
    rejectNode.value = "";
    let res = await getRejectNodeList(currentApprovalTaskId.value || props.taskId);
    if (res && res.code == 200) {
        rejectNodeList.value = res.data;
    }
    rejectDialogLoading.value = false;
};

// 确认驳回
const confirmReject = () => {
    if (!rejectNode.value) {
        ElMessage.error("请选择要驳回到哪个节点");
        return;
    }
    saveComplexFlow(3);
    rejectDialogShow.value = false;
};

/**
 * 复杂工作流保存
 */

const DealWithTypeLabel = {
    // 同意
    1: "审批", 
    2: "驳回",
    // 退回
    3: "驳回",
    4: "转审",
    5: "加签",
};

const saveComplexFlow = async (dealWithType) => {
    if (dealWithType == 1 || dealWithType == 2) {
        loading.value = true;
    } else {
        otherLoading.value = true;
    }
    let param = {
        approvalTaskId: currentApprovalTaskId.value || props.taskId,
        dealWithType,
        wfTaskBo: {
            comment: form.value.remark,
            copyUserList: form.value.currentCCToUserList,
            nextUserIds: form.value.nextApprovalUserList,
            targetKey: dealWithType == 3 ? rejectNode.value : "",
            signatureImage: esignConf.value.resultImg,
        },
        // 转审 或者 加签
        nodeRoleList:
            dealWithType == 4 || dealWithType == 5
                ? taskOperation.value.nodeRoleList
                : [],
    };
    let res = await http.post(
        "/plugins/metaWorkFlow/workflow/dealWithTask",
        param
    );
    if (res && res.code == 200) {
        let msg = DealWithTypeLabel[dealWithType];
        ElMessage.success(msg + "成功");
        // 不是加签需要关闭弹框。
        if (dealWithType != 5) {
            canner();
            emit("confirm");
        }
    }
    if (dealWithType == 1 || dealWithType == 2) {
        loading.value = false;
    } else {
        otherLoading.value = false;
    }
};

const openDialog = () => {
    nextTick(async () => {
        getApprovalTaskInfo();
        // console.log(approvalTaskInfo.value,'approvalTaskInfo.value')
        // console.log(props.entityId,'approverRecordId')
        // initFormLayout();
    })
    // console.log(props.entityId,'approverRecordId')
}

defineExpose({
    openDialog,
})

</script>

<style lang="scss" scoped>

.detail-container {
    box-sizing: border-box;
    padding-right: 5px;
    overflow-y: auto;
    max-height: calc(100vh - 80px);
    overflow-x: hidden;
    // padding: 20px;
}

.detail-header {
    // padding-bottom: 20px;
    // box-sizing: border-box;
    padding: 20px;
    height: 48px;
    //background: #f0f0f0;
    .fr-box {
        // height: 60px;
        .fr-icon {
            cursor: pointer;
            &:hover {
                color: var(--el-color-primary);
            }
        }
    }
}
.detail-main {
    // padding: 20px;
    font-size: 14px;
    box-sizing: border-box;
    padding: 0 20px;
}
.icon {
    position: relative;
}
.filled-icon {
    top: 1px;
}
.foot-btn {
    text-align: right;
    .el-dropdown-link {
        display: inline-block;
        width: 62px;
        background: #e3e3e3;
        height: 33px;
        line-height: 33px;
        border-radius: 4px;
        margin-right: 10px;
        padding-left: 10px;
        text-align: center;
        margin-top: 1px;
        cursor: pointer;
        .el-icon--right {
            transform: rotate(90deg);
            position: relative;
            left: -8px;
            top: 2px;
        }
    }
}

.esignature {
    border: 2px solid #ccc;
    margin-bottom: 10px;
}
</style>
