<style lang="scss" scoped></style>
<template>
	<!--  -->
	<div class="w-100">
		<!-- <el-button type="primary" link icon="Stopwatch"> 中止 </el-button> -->
		<el-button
			link
			v-for="(btn, inx) of ActionButtons"
			:key="inx"
			:type="btn.type || 'primary'"
			:icon="btn.icon"
			:disabled="btn.disabled ? btn.disabled() : false"
			@click="handle(btn)"
		>
			{{ btn.label }}
		</el-button>
		<mlSearchInput
			class="fr"
			v-model="keyword"
			placeholder="搜索流程名称"
			@confirm="onSearch"
		/>
	</div>
	<mlApproveHistory
		ref="MlApproveHistoryRefs"
		title="审批历史"
		:entityId="entityId"
	/>
	<ProcessInstanceDialog
		ref="ProcessInstanceDialogRef"
		@onConfirm="processInstanceDialogConfirm"
	/>
</template>

<script setup>
import { ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
// 审批历史
import mlApproveHistory from "@/components/mlApproveHistory/index.vue";
// 重置流程弹框
import ProcessInstanceDialog from "./ProcessInstanceDialog.vue";
/**
 * API
 */
import {
	// 中止
	workflowProcessDiscontinue,
	// 挂起
	workflowProcessSuspended,
	// 恢复
	workflowProcessRestore,
	// 删除
	workflowProcessDelete,
	// 撤回
	workflowProcessWithdraw,
	// 获取可重置的任务
	queryTaskByInstanceId,
	// 获取任务节点
	getRejectNodeList,
	// 查看流程
	getTaskDetailsById,
} from "@/api/approval";

const props = defineProps({
	multipleSelection: { type: Object, default: () => [] },
});

const emit = defineEmits(["handleLoading", "refresh", "onSearch"]);

const ActionButtons = [
	{
		label: "中止",
		icon: "Stopwatch",
		code: "Stop",
	},
	{
		label: "挂起",
		icon: "Wallet",
		code: "Suspended",
	},
	{
		label: "恢复",
		icon: "CaretRight",
		code: "Restore",
	},
	{
		label: "重置",
		icon: "RefreshLeft",
		code: "Reset",
		disabled: () => {
			return props.multipleSelection.length > 1;
		},
	},
	{
		label: "删除",
		icon: "Delete",
		code: "Delete",
	},
	{
		label: "撤回",
		icon: "Back",
		code: "Withdraw",
	},
	{
		label: "查看流程",
		icon: "ScaleToOriginal",
		disabled: () => {
			return props.multipleSelection.length > 1;
		},
		code: "View",
	},
	{
		label: "刷新",
		icon: "Refresh",
		code: "Refresh",
	},
];

let keyword = ref("");

let entityId = ref("");

/**
 * 未提交 0
 * 审核中 1
 * 已驳回 2
 * 已完成 3
 * 撤销 4
 * 已中止 5
 * 已挂起 6
 */

const handle = (btn) => {
	let { label, code } = btn;
	// 刷新
	if (code == "Refresh") {
		emit("refresh", "刷新成功");
		return;
	}
	let { multipleSelection } = props;
	if (multipleSelection.length < 1) {
		ElMessage.error("请选择一条记录！");
		return;
	}
	// 查看流程
	if (code == "View") {
		let { record } = multipleSelection[0];
		if (!record.id) {
			ElMessage.error("记录ID不存在，该记录可能已被删除。。。");
			return;
		}
		entityId.value = record.id;
		openHistoryDialog(multipleSelection[0]);
		return;
	}

	let result = [],
		api;

	// 删除
	if (code == "Reset") {
		result = filterData([1], "只能重置审批中的数据");
		if (result.length > 0) {
			onReset(result[0]);
		}
		return;
	}
	// 中止
	if (code == "Stop") {
		result = filterData([1], "只能中止审批中的数据");
		api = workflowProcessDiscontinue;
	}
	// 挂起
	else if (code == "Suspended") {
		result = filterData([1], "只能挂起审批中的数据");
		api = workflowProcessSuspended;
	}
	// 恢复
	else if (code == "Restore") {
		result = filterData([5, 6], "只能恢复中止或挂起中的数据");
		api = workflowProcessRestore;
	}
	// 撤回
	else if (code == "Withdraw") {
		result = filterData([1, 6], "只能撤回审批中、挂起、中止的数据");
		api = workflowProcessWithdraw;
	}
	// 删除
	else if (code == "Delete") {
		result = filterData([1, 2, 3, 4, 5, 6], "只能删除未删除的数据");
		api = workflowProcessDelete;
	}
	// 执行操作
	if (result.length > 0) {
		ElMessageBox.confirm("是否确认" + btn.label + "选中记录?", "提示：", {
			confirmButtonText: "确认",
			cancelButtonText: "取消",
			type: "warning",
		})
			.then(() => {
				executeAction(api, result, btn);
			})
			.catch(() => {});
	}
};

/**
 * 重置
 */
// 处理流程弹框
let ProcessInstanceDialogRef = ref();
const onReset = async (processInstanceId) => {
	emit("handleLoading", { target: true, text: "正在获取进行中的流程..." });
	let res = await queryTaskByInstanceId(processInstanceId);
	if (res) {
		if (!res.data || res.data.length < 1) {
			ElMessage.error("未查到进行中的流程。");
			emit("handleLoading", { target: false });
			return;
		}
		let opList = res.data.map((el) => {
			return {
				label: el.stepName,
				value: el.approvalTaskId,
				taskId: el.wfTaskId,
				procInsId: el.wfProcInsId,
			};
		});
		ProcessInstanceDialogRef.value?.openDialog(opList);
	}
	emit("handleLoading", { target: false });
};

const processInstanceDialogConfirm = () => {
	emit("refresh");
};

// 执行操作
const executeAction = async (Api, params, btn) => {
	emit("handleLoading", { target: true, text: btn.label + "中..." });
	let res = await Api(params);
	if (res) {
		emit("refresh", btn.label + "成功");
	}
};

// 过滤数据
const filterData = (status, errMsg) => {
	let result = [];
	for (let index = 0; index < props.multipleSelection.length; index++) {
		const el = props.multipleSelection[index];
		if (status && !status.includes(el.approvalStatus)) {
			ElMessage.error(errMsg);
			return [];
		}
		result.push(el.processInstanceId);
	}
	return result;
};

// 搜索
const onSearch = () => {
	emit("onSearch", keyword.value);
};

/**
 * ************************************ 审批详情
 */
// 审批详情弹框
let MlApproveHistoryRefs = ref();
let approveHistoryLoading = ref(false);
// 审批历史
const openHistoryDialog = async (row) => {
	emit("handleLoading", { target: true, text: "加载流程中..." });
	let res = await getTaskDetailsById(row.record.id);
	if (res) {
		MlApproveHistoryRefs.value?.openDialog(
			res.data.flowType,
			res.data.approvalStepsList || []
		);
	}
	emit("handleLoading", { target: false });
};
</script>
