<template>
    <el-collapse v-model="activeNames">
        <!-- 审批设置 -->
        <el-collapse-item name="1">
            <template #title>
                <h3>审批设置</h3>
            </template>
            <!-- 审批类型 -->
            <div class="work-flow-conditions">
                <div class="label-title mb-3">审批类型</div>
                <div class="mb-10 mt-10">
                    <el-radio-group 
                        v-model="myFormData.approvalType" 
                        @change="approvalTypeChange"
                    >
                        <el-radio :value="1">人工审批</el-radio>
                        <el-radio :value="2">自动驳回</el-radio>
                        <el-radio :value="3">发起子流程</el-radio>
                    </el-radio-group>
                </div>
            </div>
            <!-- 由谁审批 -->
            <div class="work-flow-conditions mt-20" v-if="myFormData.approvalType == 1">
                <div class="label-title mb-3">由谁审批</div>
                <div class="mt-10">
                    <el-select
                        v-model="myFormData.nodeRoleType"
                        placeholder="选择由谁审批"
                        style="width: 180px;"
                        @change="nodeRoleTypeChange"
                    >
                        <el-option
                            v-for="item in nodeRoleTypeList"
                            :key="item.type"
                            :label="item.label"
                            :value="item.type"
                        />
                    </el-select>
                    <div style="width: calc(100% - 200px);display: inline-block;margin-left: 10px;">
                        <!-- 3 指定审批人 -->
                        <mlSelectUser
                            v-if="myFormData.nodeRoleType == 3"
                            v-model="myFormData.nodeRoleList"
                            multiple
                            clearable
                            style="width: 100%;"
                        />
                        <!-- 4 指定部门负责人 -->
                        <el-select
                            v-model="myFormData.nodeRoleList"
                            v-loading="departmentLoading"
                            clearable
                            multiple
                            value-key="name"
                            placeholder="请选择负责人"
                            v-if="myFormData.nodeRoleType == 4"
                        >
                            <el-option
                                v-for="(item,depInx) in departmentList"
                                :key="depInx"
                                :disabled="item.name.indexOf('未设置负责人') != -1"
                                :label="item.name"
                                :value="item"
                            />
                        </el-select>
                        <!-- 5 发起人部门负责人、6 数据所属部门负责人 -->
                        <el-select
                            v-model="myFormData.deptLevel"
                            placeholder="请选择部门"
                            v-if="myFormData.nodeRoleType == 5 || myFormData.nodeRoleType == 6"
                        >
                            <el-option
                                v-for="(item,depInx) in nodeRoleTypeChilerenList"
                                :key="depInx"
                                :label="item.label"
                                :value="item.value"
                            />
                        </el-select>
                        <!-- 7 实体字段 -->
                        <el-select
                            v-model="myFormData.fieldName"
                            v-loading="entityFieldsLoading"
                            clearable
                            value-key="name"
                            placeholder="请选择字段"
                            v-if="myFormData.nodeRoleType == 7"
                        >
                            <el-option
                                v-for="(field,fieldInx) in entityFields"
                                :key="fieldInx"
                                :label="field.label"
                                :value="field.name"
                            />
                        </el-select>
                    </div>
                </div>
                <div class="mt-10">
                    <el-checkbox v-model="myFormData.userSelectFlag" label="允许自选下一步审批人" />
                </div>
                <div>
                    <el-checkbox v-model="myFormData.addSignaturesApproval" label="允许审批人加签" />
                </div>
                <div>
                    <el-checkbox v-model="myFormData.transferApproval" label="允许审批人转审" />
                </div>
                <div>
                    <el-checkbox v-model="myFormData.prohibitRejection" label="禁止审批人驳回" />
                </div>
            </div>
            <!-- 驳回设置 -->
            <div class="work-flow-conditions mt-20" v-if="myFormData.approvalType == 1">
                <div class="label-title mb-3">驳回设置</div>
                <div class="mb-10 mt-10">
                    <el-radio-group class="radio-need-block" v-model="myFormData.rejectType">
                        <el-radio :value="1">驳回至未提交</el-radio>
                        <el-radio :value="2">驳回至上一步审核</el-radio>
                        <el-radio :value="3">驳回至任意步骤</el-radio>
                    </el-radio-group>
                </div>
            </div>
            <!-- 审批人为空时 -->
            <div class="work-flow-conditions mt-20" v-if="myFormData.approvalType == 1">
                <div class="label-title mb-3">审批人为空时</div>
                <div class="mb-10 mt-10">
                    <el-radio-group v-model="myFormData.emptyUserType">
                        <el-radio :value="1">自动通过</el-radio>
                        <el-radio :value="2">指定审批人</el-radio>
                    </el-radio-group>
                </div>
                <!-- 2 指定审批人 -->
                <mlSelectUser
                    v-if="myFormData.emptyUserType == 2"
                    v-model="myFormData.specificRole"
                    clearable
                    type="User"
                    style="width: 214px;"
                />
            </div>
            <!-- 审批方式 -->
            <div class="work-flow-conditions mt-20" v-if="myFormData.approvalType == 1">
                <div class="label-title mb-3">审批方式</div>
                <div class="mb-10 mt-10">
                    <el-radio-group
                        class="radio-need-block"
                        v-model="myFormData.approvalMethodType"
                    >
                        <el-radio :value="1">会签 (需所有审批人同意)</el-radio>
                        <el-radio :value="2">或签 (一名审批人同意或拒绝)</el-radio>
                        <el-radio :value="3">部分会签(部分审批人同意)</el-radio>
                    </el-radio-group>
                </div>
                <div v-if="myFormData.approvalMethodType == 3">
                    <el-input-number
                        v-model="myFormData.signUserNum"
                        :min="1"
                        :max="99999"
                        :controls="false"
                        style="width: 50px;"
                        size="small"
                    />
                    <span class="ml-3">个人通过，节点审核完成</span>
                    <el-tooltip effect="dark" content="人数不足时，全部审核人审核完成，节点通过审批" placement="top">
                        <span class="ml-3" style="cursor: pointer;position: relative;top: 1px;">
                            <el-icon>
                                <ElIconQuestionFilled />
                            </el-icon>
                        </span>
                    </el-tooltip>
                </div>
            </div>
            <!-- 手写签名 -->
            <div class="work-flow-conditions mt-20" v-if="myFormData.approvalType == 1">
                <div class="label-title mb-3">高级扩展功能</div>
                <el-checkbox v-model="myFormData.autograph" label="手写签名"/>
            </div>
            <!-- 发起子流程 -->
            <div class="work-flow-conditions mt-20" v-if="myFormData.approvalType == 3">
                <div class="label-title mb-3">选择子流程</div>
                <el-select 
                    v-model="myFormData.approvalConfigId" 
                    style="width: 100%"
                    v-loading="loadFlowListLoading"
                    @change="selectedSubApproval"
                    filterable
                >
                    <el-option
                        v-for="item in flowList"
                        :key="item.approvalConfigId"
                        :label="item.flowName"
                        :value="item.approvalConfigId"
                    />
                </el-select>
            </div>
            <!-- 选择数据转换 -->
            <div class="work-flow-conditions mt-20" v-if="myFormData.approvalType == 3">
                <div class="label-title mb-3">选择数据转换</div>
                <el-select 
                    v-model="myFormData.transformId" 
                    style="width: 100%"
                    v-loading="loadDTLoading"
                    :disabled="!myFormData.approvalConfigId"
                    filterable
                >
                    <el-option
                        v-for="item in formatDtOpList"
                        :key="item.transformId"
                        :label="item.transformName"
                        :value="item.transformId"
                    />
                </el-select>
            </div>
            <!-- 自动提交规则 -->
            <div class="work-flow-conditions mt-20" v-if="myFormData.approvalType == 3">
                <div class="label-title mb-3">自动提交规则</div>
                <el-radio-group
                    class="radio-need-block"
                    v-model="myFormData.isBlocked"
                >
                    <el-radio :value="false">发起子流程，自动进入下一个节点</el-radio>
                    <el-radio :value="true">发起子流程，等待审批完成后再进入下一个节点</el-radio>
                </el-radio-group>
            </div>
            <div class="work-flow-conditions mt-10">
                <span class="ml-a-span" @click="openCustomTextDialog">审批按钮文案自定义</span>
            </div>
        </el-collapse-item>
        <!-- 事件设置 -->
        <el-collapse-item name="2">
            <template #title>
                <h3>事件设置</h3>
            </template>
			<el-tabs @tab-change="eventTabChange">
				<el-tab-pane label="前置脚本">
					<!-- 说明 -->
					<div class="work-flow-conditions">
						<div class="label-title mb-3">说明</div>
						<div class="mb-10 mt-10">
							该事件在
							<span class="ml-a-span">节点任务启动后</span> 执行，用户可以使用
							<span class="ml-a-span">execution</span> 做操作。
							<br />例如：
							<br />①、设置流程变量：execution.setVariable("total",100);
							<br />②、获取任务流程ID：execution.getId();
						</div>
					</div>
					<!-- 前置脚本 -->
					<div class="work-flow-conditions">
						<div class="mb-10 mt-10">
							<mlCodeEditor v-model="myFormData.createScript"/>
						</div>
					</div>
				</el-tab-pane>
				<el-tab-pane label="后置脚本">
					<!-- 说明 -->
					<div class="work-flow-conditions">
						<div class="label-title mb-3">说明</div>
						<div class="mb-10 mt-10">
							该事件在
							<span class="ml-a-span">节点任务完成后</span> 执行，用户可以使用
							<span class="ml-a-span">execution</span> 做操作。
							<br />例如：
							<br />①、设置流程变量：execution.setVariable("total",100);
							<br />②、获取任务流程ID：execution.getId();
						</div>
					</div>
					<!-- 后置脚本 -->
					<div class="work-flow-conditions">
						<div class="mb-10 mt-10">
							<mlCodeEditor v-model="myFormData.completeScript"/>
						</div>
					</div>
				</el-tab-pane>
                <el-tab-pane label="触发器事件">
					<!-- 说明 -->
					<div class="work-flow-conditions">
						<div class="label-title mb-3">说明</div>
						<div class="mb-10 mt-10">
							该事件在
							<span class="ml-a-span">节点任务完成后</span> 执行，会自动执行对应触发器。
						</div>
					</div>
                    <div class="label-title mb-3">选择触发器</div>
                    <div class="mb-10 mt-10">
                        <el-select 
                            v-model="myFormData.triggerConfigIdList" 
                            style="width: 100%"
                            v-loading="loadTCLoading"
                            clearable
                            filterable
                            multiple
                            no-data-text="未找到相关触发器"
                        >
                            <el-option
                                v-for="item in triggerConfigList"
                                :key="item.triggerConfigId"
                                :label="item.name"
                                :value="item.triggerConfigId"
                            />
                        </el-select>
                    </div>
				</el-tab-pane>
			</el-tabs>

        </el-collapse-item>
        <!-- 抄送设置 -->
        <el-collapse-item name="3">
            <template #title>
                <h3>抄送设置</h3>
            </template>
            <!-- 抄送用户 -->
            <div class="work-flow-conditions mt-20">
                <div class="label-title mb-3">抄送用户</div>
                <div class="mb-10 mt-10">
                    <mlSelectUser v-model="myFormData.ccToUserList" multiple clearable />
                </div>
            </div>
        </el-collapse-item>
        <!-- 表单设置 -->
        <el-collapse-item name="4">
            <template #title>
                <h3>表单设置</h3>
            </template>
            <div class="work-flow-conditions">
                <div class="label-title mb-5">指定表单</div>
                <div class="edit-field-list-box">
                    <el-select 
                        v-model="myFormData.formLayoutId" 
                        placeholder="选择指定表单"
                        class="w-100"
                    >
                        <el-option
                            v-for="item in myFormList"
                            :key="item.formLayoutId"
                            :label="item.layoutName"
                            :value="item.formLayoutId"
                        />
                    </el-select>
                </div>
            </div>
            <!-- 允许修改字段 -->
            <div class="mt-20">
                <ModifiableFields 
                    :formData="myFormData" 
                    :entityName="entityName"
                />
            </div>
        </el-collapse-item>
    </el-collapse>
    <ml-dialog
        v-model="customTextDialogConf.show"
        title="审批按钮文案自定义"
        width="520px"
        :append-to-body="true"
    >
        <el-form label-width="85px">
            <el-form-item style="margin-bottom: 0;text-align: center">
                <el-row :gutter="10" class="w-100">
                    <el-col :span="12">默认文案</el-col>
                    <el-col :span="12">自定义文案</el-col>
                </el-row>
            </el-form-item>
            <el-form-item 
                v-for="(item,inx) of customTextDialogConf.rows" 
                :key="inx"
                class="mb-10"
                :label="item.label + '：'"
            >
                <el-row :gutter="10" class="w-100">
                    <el-col :span="12">
                        <el-input 
                            v-model="customTextDialogConf.customTextSet[item.key].default"
                            disabled
                        />
                    </el-col>
                    <el-col :span="12">
                        <el-input 
                            v-model="customTextDialogConf.customTextSet[item.key].custom"
                            clearable
                            :maxlength="4"
                        />
                    </el-col>
                </el-row>
            </el-form-item>
        </el-form>
        <template #footer>
            <el-button @click="customTextDialogConf.show = false">取消</el-button>
            <el-button type="primary" @click="saveCustomText">确认</el-button>
        </template>
    </ml-dialog>
</template>

<script setup>
import { ref, onMounted, inject, watch, watchEffect, reactive } from "vue";
import { useRouter } from "vue-router";
import useCommonStore from "@/store/modules/common";
import { storeToRefs } from "pinia";
import { getDataList } from "@/api/crud";
import { queryByEntity } from "@/api/transform";
// 允许修改字段组件
import ModifiableFields from "@/components/mlApprove/ModifiableFields.vue";


// 代码编辑器
import mlCodeEditor from "@/components/mlCodeEditor/index.vue";
import http from "@/utils/request";
import { deepClone } from "@/utils/util";

const { allEntityName } = storeToRefs(useCommonStore());
let $API = inject("$API");
const Router = useRouter();
const props = defineProps({
    formData: { Type: Object, default: () => {} },
    formList: { Type: Object, default: () => [] },
});
const activeNames = ref(["1"]);
const emits = defineEmits(["setNodeData"]);
let myFormData = ref({
    createScript: "// Demo code",
    completeScript: "// Demo code",
    specificRole:[],
    modifiableFields:[],
    isBlocked: false,
    triggerConfigIdList:[],
});
let entityCode = ref("");
let entityName = ref("");

watch(
    () => props.formData,
    (newVal,oldVal) => {
        console.log('newVal', newVal)
        console.log('oldVal', oldVal)
        if(JSON.stringify(newVal) !== JSON.stringify(oldVal)){
            initApi();
        }
    },
    { deep: true }
);

watch(
    () => myFormData.value,
    () => {
        emits("setNodeData", myFormData.value);
    },
    { deep: true }
);
let myFormList = ref([]);



// onMounted(() => {
//     entityCode.value = Router.currentRoute.value.query.entityCode;
//     if (entityCode) {
//         entityName.value = allEntityName.value[entityCode.value];
//     }
//     initApi();
// });

// 初始化API
const initApi = () => {
    myFormData.value = Object.assign(myFormData.value, props.formData);
    // 获取部门负责人数据
    getDepartment();
    // 获取所有实体字段
    getEntityFields();
    // 审批类型切换
    approvalTypeChange();
    if(myFormData.value.customButtonJson) {
        customButtonJson.value = JSON.parse(myFormData.value.customButtonJson);
    }
}



/**
 * ***********************************************   由谁审批 beg
 */

let nodeRoleTypeList = ref([
    {
        label: "指定审批人",
        type: 3,
    },
    {
        label: "指定部门负责人",
        type: 4,
    },
    {
        label: "发起人部门负责人",
        type: 5,
    },
    {
        label: "数据所属部门负责人",
        type: 6,
    },
    {
        label: "实体字段",
        type: 7,
    },
]);

let nodeRoleTypeChilerenList = ref([
    {
        label: "当前部门",
        value: 0,
    },
    {
        label: "二级部门",
        value: 1,
    },
    {
        label: "三级部门",
        value: 2,
    },
    {
        label: "四级部门",
        value: 3,
    },
    {
        label: "五级部门",
        value: 4,
    },
    {
        label: "六级部门",
        value: 5,
    },
    {
        label: "七级部门",
        value: 6,
    },
    {
        label: "八级部门",
        value: 7,
    },
    {
        label: "九级部门",
        value: 8,
    },
    {
        label: "十级部门",
        value: 9,
    },
]);
let departmentLoading = ref(false);
let departmentList = ref([]);
// 获取部门负责人数据
const getDepartment = async () => {
    departmentLoading.value = true;
    let res = await $API.common.getDepartment();
    if (res && res.data) {
        let resData = res.data || [];
        departmentList.value = resData.map((el) => {
            let newData = {
                name: `${el.departmentName}(${
                    el.departmentOwnerUser
                        ? el.departmentOwnerUser.name
                        : "未设置负责人"
                })`,
                id: el.departmentId,
            };
            return newData;
        });
    }

    departmentLoading.value = false;
};

// 获取所有实体字段
let entityFields = ref([]);
let entityFieldsLoading = ref(false);
const getEntityFields = async () => {
    let param = { entity: entityName.value };
    entityFieldsLoading.value = true;
    let res = await $API.common.getFieldListOfFilter(param);
    if (res && res.code == 200) {
        entityFields.value = res.data.filter(
            (el) =>
                (el.type == "Reference" || el.type == "ReferenceList") &&
                (el.referTo == "User" || el.referTo == "Department")
        );
    }
    entityFieldsLoading.value = false;
};

// 由谁审批切换
const nodeRoleTypeChange = () => {
    myFormData.value.nodeRoleList = [];
};

/**
 * ***********************************************   由谁审批 end
 */



/**
 * 结束 获取数据
 */
const getFormData = () => {
    return { ...myFormData.value };
};


/**
 * 选择子流程相关 beg
 */

// 加载流程loading
let loadFlowListLoading = ref(false);
// 流程list
let flowList = ref([]);
// 当前选择的子流程
let curSelectedFlow = ref({});
// 加载数据转换 DataTransformationLoading
let loadDTLoading = ref(false);
// 数据转换List DataTransformationList
let dtList = ref([]);
// 选择子流程后渲染的oplist
let formatDtOpList = ref([]);

// 审批类型切换
const approvalTypeChange = async () => {
    // 选择发起子流程才调接口
    if(myFormData.value.approvalType == 3){
        loadDTLoading.value = true;
        // 加载数据转换List
        let dtRes = await queryByEntity({
            sourceEntityName: entityName.value
        });
        if(dtRes){
            dtList.value = dtRes.data;
        }
        loadDTLoading.value = false;
        // 加载子流程List
        loadFlowListLoading.value = true;
        let res = await http.post("/approval/configList", {
            mainEntity: 'ApprovalConfig',
            fieldsList: 'flowName, entityCode',
            filter: {
                equation:"AND",
                items: [
                    {
                        fieldName: "flowType",
                        op: "LK",
                        value: 2
                    }
                ]
            },
            pageSize: 99999,
            pageNo: 1,
        });
        if(res){
            flowList.value = res.data.dataList;
            selectedSubApproval();
        }
        loadFlowListLoading.value = false;
        
    }
}


const selectedSubApproval = () => {
    let findSelectedFlow = flowList.value.filter(el => el.approvalConfigId == myFormData.value.approvalConfigId);
    if(findSelectedFlow.length > 0){
        curSelectedFlow.value = findSelectedFlow[0];
        formatDtOpList.value = dtList.value.filter(el => el.targetEntity == allEntityName.value[curSelectedFlow.value.entityCode]);
    }else {
        curSelectedFlow.value = {};
        formatDtOpList.value = [];
    }
    // 如果格式化后的数据转换是空，清空数据转换绑定字段
    if(formatDtOpList.value.length < 1){
        myFormData.value.transformId = null;
        return
    }
    // 如果格式化后的数据有值，但是没有 数据转换绑定字段的 item 也清空 数据转换绑定字段
    let findTransformId = formatDtOpList.value.filter(el => el.transformId == myFormData.value.transformId);
    if(findTransformId.length < 1){
        myFormData.value.transformId = null;
    }
}


/**
 * 选择子流程相关 end
 */

 /**
  * 事件设置相关
  */
// 事件设置出发切换
const eventTabChange = (name) => {
    if(name == 2){
        loadTriggerConfigList()
    }
}

// 触发器列表
let triggerConfigList = ref([]);
let loadTCLoading = ref(false);

let loadTriggerConfigList = async () => {
    loadTCLoading.value = true;
    let res = await getDataList(
        "TriggerConfig",
        "name",
        {
            equation:"AND",
            items: [
                {
                    fieldName: "entityCode",
                    op: "EQ",
                    value: entityCode.value
                },
                {
                    fieldName: "isDisabled",
                    op: "EQ",
                    value: 0
                }
            ]
        },
        99999,
        1,
    )
    
    if(res){
        triggerConfigList.value = res.data.dataList;
    }
    loadTCLoading.value = false;
}

/**
 * 审批按钮文案自定义
 */
let customTextDialogConf = ref({
    show: false,
    rows: [
        {
            label:"确认文案",
            key: "confirmButtonText",
        },
        {
            label:"驳回文案",
            key: "rejectButtonText",
        },
        {
            label:"取消文案",
            key: "cancelButtonText",
        },
        {
            label:"转审文案",
            key: "specialReviewButtonText",
        },
        {
            label:"加签文案",
            key: "addSignatureButtonText",
        },
    ],
    customTextSet: {},
});


let customButtonJson = ref({
    confirmButtonText: {
        default: '同意',
        custom:""
    },
    rejectButtonText: {
        default: '驳回',
        custom:""
    },
    cancelButtonText: {
        default: '取消',
        custom:""
    },
    specialReviewButtonText: {
        default: '转审',
        custom:""
    },
    addSignatureButtonText: {
        default: '加签',
        custom:""
    },
})

const openCustomTextDialog = () => {
    customTextDialogConf.value.show = true;
    customTextDialogConf.value.customTextSet = deepClone(customButtonJson.value);
}

const saveCustomText = () => {
    customButtonJson.value = deepClone(customTextDialogConf.value.customTextSet);
    myFormData.value.customButtonJson = JSON.stringify(customButtonJson.value);
    customTextDialogConf.value.show = false;
};

watchEffect(() => {
    myFormList.value = props.formList;
    entityCode.value = Router.currentRoute.value.query.entityCode;
    if (entityCode) {
        entityName.value = allEntityName.value[entityCode.value];
    }
    initApi();
})

defineExpose({
    getFormData,
});
</script>
<style lang='scss' scoped>
.edit-field-list-box {
    .edit-field-list {
        border-top: 1px solid rgba(0, 0, 0, 0.1);
        height: 38px;
        line-height: 38px;
        font-size: 13px;
        color: #404040;
        &:last-child {
            border-bottom: 1px solid rgba(0, 0, 0, 0.1);
        }
        .del-icon {
            margin-right: 3px;
            position: relative;
            top: 2px;
            cursor: pointer;
            color: #999;
            &:hover {
                color: #6f6f6f;
            }
        }
        .required-icon {
            position: relative;
            top: 1px;
            margin-right: 30px;
        }
    }
}
</style>
<style scoped lang="scss">
.mb-10 {
    margin-bottom: 10px !important;
}
</style>