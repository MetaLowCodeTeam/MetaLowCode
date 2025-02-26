<template>
	<div class="group-button-label">流程操作</div>
	<el-row v-if="myApproval.imApproval">
		<el-button type="success" plain @click="openApproveDialog">
			审批
		</el-button>
	</el-row>
	<el-row v-if="myApproval.startApproval">
		<el-button type="success" plain @click="openDialog">
			提交审批
		</el-button>
	</el-row>
    <el-row v-if="$TOOL.checkRole('r6013') && myApproval.revokeApproval">
		<el-button 
            type="success" 
            plain 
            @click="revokeApproval"
            :loading="approvalDialog.loading"
        >
			撤销审批
		</el-button>
	</el-row>
    <el-row v-if="myApproval.withdrawApproval">
		<el-button 
            type="success" 
            plain 
            @click="withdrawApproval" 
            :loading="approvalDialog.loading"
        >
			撤回审批
		</el-button>
	</el-row>
	<el-row v-if="myApproval.queryHistory">
		<el-button
			type="success"
			plain
			@click="openHistoryDialog"
			:loading="approveHistoryLoading"
		>
			审批历史
		</el-button>
	</el-row>
	
	<div v-if="approveDialogIsShow">
		<mlApprove
			v-model="approveDialogIsShow"
			:taskId="myApproval.approvalTaskId"
			:entityId="myApproval.recordId"
			:approvalName="myApproval.approvalName"
			@confirm="confirmApproval"
			title="审批"
		/>
	</div>
	<div v-if="myApproval">
		<mlApproveHistory
			ref="MlApproveHistoryRefs"
			:entityId="myApproval.recordId"
			@confirm="confirm"
			title="审批历史"
		/>
	</div>
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
					v-model="approveTaskConf.taksId"
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
    <SubmitApprovalDialog ref="SubmitApprovalDialogRefs" @onSubmit="confirmApproval"/>
</template>

<script setup>
import { ElMessageBox, ElMessage } from "element-plus";
import { onMounted, watch, ref, reactive, inject, watchEffect } from "vue";
import { useRouter } from "vue-router";
import mlApprove from "@/components/mlApprove/index.vue";
import mlApproveHistory from "@/components/mlApproveHistory/index.vue";
import useCommonStore from "@/store/modules/common";
import { storeToRefs } from "pinia";
const { publicSetting } = storeToRefs(useCommonStore());
import http from "@/utils/request";

// 提交审批弹框
import SubmitApprovalDialog from "@/components/mlApprove/SubmitApprovalDialog.vue";

const Route = useRouter();
const $API = inject("$API");
const $TOOL = inject("$TOOL");
const props = defineProps({
	recordApproval: { type: Object, default: () => {} },
	// 是否显示这个按钮
	showApprovalRelated: { type: Boolean, default: true },
	detailParamConf: { type: Object, default: () => {} },
});
const emits = defineEmits(["onSubmit", "closeDialog"]);
let myApproval = ref({});



let approvalDialog = reactive({
	isShow: false,
	loading: false,
	approvalConfig: "",
});

let SubmitApprovalDialogRefs = ref();
// 打开提交审批弹框
const openDialog = async () => {
    let beforeSubmitApproval = props.detailParamConf.beforeSubmitApproval();
    if(typeof beforeSubmitApproval == "boolean" && !beforeSubmitApproval){
        return
    }
    if(beforeSubmitApproval instanceof Promise){
        let res = await beforeSubmitApproval;
        if(!res){
            return
        }
    }
	SubmitApprovalDialogRefs.value?.openDialog(myApproval.value.recordId);
};

const closeDialog = () => {
	approvalDialog.isShow = false;
};

/**
 * ************************************ 审批详情
 */
// 审批详情弹框
let MlApproveHistoryRefs = ref();
let approveHistoryLoading = ref(false);
// 审批历史
const openHistoryDialog = async (row) => {
	approveHistoryLoading.value = true;
	let res = await http.get("/approval/getTaskDetailsById", {
		entityId: myApproval.value.recordId,
	});
	if (res) {
        let nodeConfig = {};
        if(res.data.approvalTask){
            let { approvalTask } = res.data;
            nodeConfig = {
                nodeName: "发起人",
                type: 0,
                // 谁可以审批
                nodeRoleType: 3,
                isHighlight: true,
                // 指定用户
                nodeRoleList: [
                    { id: 1, name: res.data.approvalStepsList ? res.data.approvalStepsList[0].stepUserName : "" }
                ],
                // 发起条件
                filter: {
                    equation: "",
                    items: [],
                },
                childNode: formatAttrMore(approvalTask.attrMore ? JSON.parse(approvalTask.attrMore) : [], approvalTask.currentNode)
            };
        }
        MlApproveHistoryRefs.value?.openDialog(
			res.data.flowType,
			res.data.approvalStepsList || [],
            nodeConfig
		);
	}
	approveHistoryLoading.value = false;
};

const formatAttrMore = (attrMore, currentNode) => {
    let newAttrMore = {};
    let current = newAttrMore;
    // 遍历 attrMore，将每个元素链接到其 childNode
    attrMore.forEach((item, index) => {
        if (index === 0) {
            item.isHighlight = currentNode > index;
            item.highlightBefore = currentNode >= index;
            newAttrMore = item;
            current = newAttrMore;
        } else {
            item.isHighlight = currentNode > index;
            item.highlightBefore = currentNode >= index;
            current.childNode = item;
            current = current.childNode;
        }
    });
    console.log(newAttrMore,'newAttrMore')
    return newAttrMore;
}

// 审批历史确认
const confirm = () => {
	emits("closeDialog");
};

/**
 * 审批任务相关
 */
let approveTaskConf = ref({
	isShow: false,
	taskList: [],
	taksId: null,
});

// 确认审批任务
const confirmApproveTask = () => {
	let { taksId } = approveTaskConf.value;
	if (!taksId) {
		ElMessage.error("请选择审批任务");
		return;
	}
	myApproval.value.approvalTaskId = approveTaskConf.value.taksId;
	approveTaskConf.value.isShow = false;
	approveDialogIsShow.value = true;
};

// 审批
let approveDialogIsShow = ref(false);
const openApproveDialog = () => {
	let { parallelTasks } = myApproval.value;
	// 如果有多条审批
	if (parallelTasks && parallelTasks.length > 1) {
		approveTaskConf.value = {
			isShow: true,
			taskList: [...parallelTasks],
			taksId: null,
		};
	} else {
		approveDialogIsShow.value = true;
	}
};

// 确认审批
const confirmApproval = () => {
	emits("onSubmit");
	closeDialog();
};

// 撤销
const revokeApproval = async () => {
    let beforeRevokeApproval = props.detailParamConf.beforeRevokeApproval();
    if(typeof beforeRevokeApproval == "boolean" && !beforeRevokeApproval){
        return
    }
    if(beforeRevokeApproval instanceof Promise){
        let res = await beforeRevokeApproval;
        if(!res){
            return
        }
    }
	ElMessageBox.confirm("是否确认撤销?", "提示：", {
		confirmButtonText: "确认",
		cancelButtonText: "取消",
		type: "warning",
	})
		.then(async () => {
			approvalDialog.loading = true;
			let res = await http.post(
				"/approval/approvalRevocation?entityId=" +
					myApproval.value.recordId
			);
			if (res) {
				ElMessage.success("撤销成功");
				emits("onSubmit");
				closeDialog();
			}
			approvalDialog.loading = false;
		})
		.catch(() => {});
};

// 撤回审批
const withdrawApproval = () => {
	ElMessageBox.confirm("是否确认撤回审批?", "提示：", {
		confirmButtonText: "确认",
		cancelButtonText: "取消",
		type: "warning",
	})
		.then(async () => {
			approvalDialog.loading = true;
            // 是否复杂工作流
            let isFlowVariables = !!myApproval.value.flowVariables;
            if(isFlowVariables){
                // 复杂工作流
                let res = await http.post(
                    "/plugins/metaWorkFlow/workflow/process/withdraw", 
                    [myApproval.value.flowVariables.processInstanceId]
                );
                if (res) {
                	ElMessage.success("撤销成功");
                	emits("onSubmit");
                	closeDialog();
                }
            }else{
                // 简单工作流
                let res = await http.get(
                    "/approval/withdraw?approvalTaskId=" +
                        myApproval.value.approvalTaskId
                );
                if (res) {
                	ElMessage.success("撤销成功");
                	emits("onSubmit");
                	closeDialog();
                }
            }
			approvalDialog.loading = false;
		})
		.catch(() => {});
}



const appPath = import.meta.env.VITE_APP_PATH;
// 配置流程
const goApprovalList = () => {
	Route.push(appPath + "process-list");
};



watchEffect(() => {
    myApproval.value = props.recordApproval;
})

</script>
<style lang="scss" scoped>
.group-button-label {
	font-size: 11px;
	color: #999999;
	margin-bottom: 5px;
}
:deep(.el-form-item) {
    align-items: initial !important;
}
</style>
