<template>
	<!--  -->
	<ml-dialog
		title="重置任务"
		v-model="dialogConf.isShow"
		width="400"
		bodyNoPadding
        :show-close="!processResetLoading"
	>
		<div
			class="mt-20 pl-20 pr-20"
			v-loading="processResetLoading"
			element-ui-loading-text="重置中..."
		>
			<el-form label-width="100px">
				<el-form-item label="选择审批任务" v-if="dialogConf.taskList.length > 1">
					<el-select
						v-model="dialogConf.selectedTask"
						placeholder="请选择要重置的任务"
						style="width: 100%"
						clearable
						:class="{ 'is-error': dialogConf.taskError }"
						@focus="dialogConf.taskError = false"
						@change="loadNodeList"
						value-key="value"
					>
						<el-option
							v-for="item in dialogConf.taskList"
							:key="item.value"
							:label="item.label"
							:value="item"
						/>
					</el-select>
				</el-form-item>
				<el-form-item label="选择重置节点" v-loading="loadNodeLoading">
					<el-select
						v-model="dialogConf.selectedNode"
						placeholder="请选择要重置的节点"
						style="width: 100%"
						clearable
						:class="{ 'is-error': dialogConf.nodeError }"
						@focus="dialogConf.nodeError = false"
					>
						<el-option
							v-for="item in dialogConf.nodeList"
							:key="item.value"
							:label="item.label"
							:value="item.value"
						/>
					</el-select>
				</el-form-item>
			</el-form>
		</div>
		<template #footer>
			<el-button
				@click="dialogConf.isShow = false"
				:loading="processResetLoading"
			>
				取消
			</el-button>
			<el-button
				type="primary"
				@click="onConfirm"
				:loading="processResetLoading"
			>
				重置任务
			</el-button>
		</template>
	</ml-dialog>
</template>

<script setup>
import { ElMessage } from "element-plus";
import { reactive, ref } from "vue";
import {
	// 获取任务节点
	getRejectNodeList,
	// 重置
	processReset,
} from "@/api/approval";
const emit = defineEmits(["onConfirm"]);

let dialogConf = reactive({
	isShow: false,
	taskList: [],
	// 选择任务
	selectedTask: {},
	taskError: false,
	// 选择节点
	selectedNode: "",
	nodeError: false,
});

const openDialog = (opList) => {
	dialogConf.isShow = true;
	dialogConf.taskList = JSON.parse(JSON.stringify(opList));
	dialogConf.selectedTask = "";
	dialogConf.selectedNode = "";
	dialogConf.taskError = false;
	dialogConf.nodeError = false;
	if (dialogConf.taskList.length == 1) {
		dialogConf.selectedTask = dialogConf.taskList[0];
		loadNodeList();
	}
};


// 加载节点API
let loadNodeLoading = ref(false);
const loadNodeList = async () => {
	if (!dialogConf.selectedTask.value) {
		return;
	}
	dialogConf.selectedNode = "";
	loadNodeLoading.value = true;
	let res = await getRejectNodeList(dialogConf.selectedTask.value);
	if (res) {
		if (!res.data || res.data.length < 1) {
			ElMessage.error("未查到可重置的节点。");
			loadNodeLoading.value = false;
			return;
		}
		dialogConf.nodeList = res.data.map((el) => {
			return {
				label: el.targetName,
				value: el.targetKey,
			};
		});
	}
	loadNodeLoading.value = false;
};


// 确认重置
let processResetLoading = ref(false);
const onConfirm = async () => {
	let { selectedTask, selectedNode } = dialogConf;
	if (!selectedTask.value) {
		ElMessage.error("请选择审批任务");
		dialogConf.taskError = true;
		return;
	}
	if (!selectedNode) {
		ElMessage.error("请选择重置节点");
		dialogConf.nodeError = true;
		return;
	}
    let param = {
        taskId: selectedTask.taskId,
        procInsId: selectedTask.procInsId,
        targetKey: selectedNode
    };
    processResetLoading.value = true;
    let res = await processReset(param);
    if(res) {
        ElMessage.success("重置成功");
        dialogConf.isShow = false;
        emit("onConfirm")
    }
    processResetLoading.value = false;
 
};



defineExpose({
	openDialog,
});
</script>
<style lang="scss" scoped></style>
