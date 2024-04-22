<template>
    <div class="action-div" v-loading="contentLoading">
        <el-form-item label="使用审批流程">
            <el-select
                v-model="trigger.actionContent.approvalConfigId"
                placeholder="Select"
                style="width: 400px;"
                @change="workflowChange"
            >
                <el-option
                    v-for="item in approvalList"
                    :key="item.approvalConfigId"
                    :label="item.flowName"
                    :value="item.approvalConfigId"
                />
            </el-select>
            <div class="w-100">
                <span class="info-text">
                    需要先添加
                    <span class="ml-a-span" @click="goProcess">审批流程</span> 才能在此处选择
                </span>
            </div>
            <div class="w-100 mt-5">
                <el-row>
                    <el-checkbox v-model="trigger.actionContent.submitMode" :disabled="isSelectedComplexWorkflow">
                        提交模式<span v-if="isSelectedComplexWorkflow">（复杂工作流暂时只支持提交模式）</span>
                    </el-checkbox>
                </el-row>
                <el-row>
                    <span class="info-text">1.勾选提交模式当满足条件将自动提交审批，但不会自动审核，需审核人人工审核。</span>
                </el-row>
                <el-row>
                    <span class="info-text">2.不勾选提交模式当满足条件将自动提交审批，且自动审核通过。</span>
                </el-row>
                <el-row>
                    <span class="info-text">注：审批流程中至少配置一个审批人，否则会提交失败</span>
                </el-row>
            </div>
        </el-form-item>
    </div>
</template>

<script setup>
import { ref, onMounted, inject } from "vue";
import { getDataList } from "@/api/crud";
import { useRouter } from "vue-router";
const router = useRouter();
const $API = inject("$API");
const $ElMessage = inject("$ElMessage");
const props = defineProps({
    modelValue: null,
});
// 内容加载loading
let contentLoading = ref(false);

// 数据源
let trigger = ref({
    actionContent: {},
});



let approvalList = ref([]);
onMounted(() => {
    trigger.value = props.modelValue;

    getApprovalList();
});

// 获取 当前实体 审批列表
const getApprovalList = async () => {
    let param = {
        mainEntity: "ApprovalConfig",
        fieldsList: "approvalConfigId,entityCode,flowName,flowType",
        filter: {
            equation: "AND",
            items: [
                {
                    fieldName: "entityCode",
                    op: "EQ",
                    value: trigger.value.entityCode,
                },
            ],
        },
        sortFields: [{ fieldName: "modifiedOn", type: "DESC" }],
    };
    contentLoading.value = true;
    let res = await getDataList(
        param.mainEntity,
        param.fieldsList,
        param.filter,
        null,
        null,
        param.sortFields
    );
    if (res) {
        approvalList.value = res.data.dataList || [];
        approvalList.value.unshift({
            flowName: "不使用",
            approvalConfigId: "",
        });
        if (!trigger.value.actionContent.approvalConfigId) {
            trigger.value.actionContent.approvalConfigId = "";
        }
        workflowChange();
    } 
    contentLoading.value = false;
};

// 跳转到审批流程列表
const goProcess = () => {
    router.push({
        path: "/web/process-list",
    });
};

/**
 * 工作切换
 */
// 是否选择复杂工作流
let isSelectedComplexWorkflow = ref(false);

const workflowChange = () => {
    isSelectedComplexWorkflow.value = false;
    let { approvalConfigId }  = trigger.value.actionContent;
    for (let index = 0; index < approvalList.value.length; index++) {
        const element = approvalList.value[index];
        if(element.approvalConfigId == approvalConfigId && element.flowType == 2){
            isSelectedComplexWorkflow.value = true;
            return
        }
    }
}
</script>

<style>
</style>