<template>
	<!-- 审批弹框 -->
	<ml-dialog v-model="approvalDialog.isShow" title="提交审批" width="460">
		<el-form label-width="100px" v-loading="approvalDialog.loading">
			<el-form-item label="选择审批流程">
				<el-select
					v-if="approvalList.length > 0"
					v-model="approvalDialog.approvalConfig"
					placeholder="请选择审批流程"
					style="width: 100%;"
					value-key="approvalConfigId"
				>
					<el-option
						v-for="item in approvalList"
						:key="item.approvalConfigId"
						:label="item.flowName"
						:value="item"
					/>
				</el-select>
				<div v-else class="info-text">
					暂无审批流程
					<span
						class="ml-a-span"
						@click="goApprovalList"
						v-if="$TOOL.checkRole('r30-1')"
					>
						点击配置
					</span>
				</div>
			</el-form-item>
			<el-form-item
				label="自选审批人"
                class="mt-10"
				v-if="approvalDialog.approvalConfig.userSelectFlag"
			>
				<mlSelectUser v-model="optionalApprovals" multiple clearable />
			</el-form-item>
		</el-form>
		<template #footer>
			<el-button
				style="width: 80px"
				@click="approvalDialog.isShow = false"
			>
				取消
			</el-button>
			<el-button type="primary" style="width: 80px" @click="onSubmit">
				提交
			</el-button>
		</template>
	</ml-dialog>
</template>

<script setup>
import { reactive, ref, inject } from "vue";
import { ElMessage } from "element-plus";

const $API = inject("$API");
const props = defineProps({
	recordId: { type: String, default: "" },
});
const emits = defineEmits(["onSubmit"]);

let approvalDialog = reactive({
	isShow: false,
	loading: false,
	approvalConfig: "",
});

// 审批流程
let approvalList = ref([]);

let currentRecordId = ref('');

const openDialog = async (recordId) => {
	approvalDialog.isShow = true;
	approvalDialog.loading = true;
    currentRecordId.value = recordId;
	let res = await $API.approval.detail.getApprovalList(
		currentRecordId.value
	);
	if (res) {
		approvalList.value = res.data || [];
		if (approvalList.value.length == 1) {
			approvalDialog.approvalConfig = approvalList.value[0];
		}
	}
	approvalDialog.loading = false;
};
// 自选审批人
let optionalApprovals = ref([]);
// 提交接口
const onSubmit = async () => {
	let { approvalConfig } = approvalDialog;
	let { flowType, approvalConfigId, wfProcDefId } = approvalConfig;
	if (!approvalConfigId) {
		ElMessage.warning("请选择审批流程");
		return;
	}

	approvalDialog.loading = true;

	let res;
	// 插件存在，且flowType == 2 走复杂
	if (flowType == 2) {
		res = await $API.approval.detail.startComplexFlowApproval({
			processDefId: wfProcDefId,
			recordId: currentRecordId.value,
			approvalConfigId: approvalConfigId,
		});
	} else {
		res = await $API.approval.detail.startApproval(
			currentRecordId.value,
			approvalConfigId,
			{
				optionalApprovals: optionalApprovals.value.map((el) => el.id),
			}
		);
	}

	if (res) {
		ElMessage.success("提交审批成功");
		emits("onSubmit");
		approvalDialog.isShow = false;
	}
	approvalDialog.loading = false;
};



defineExpose({
	openDialog,
});
</script>

<style scoped lang="scss">
:deep(.el-form-item) {
    align-items: initial !important;
}
</style>
