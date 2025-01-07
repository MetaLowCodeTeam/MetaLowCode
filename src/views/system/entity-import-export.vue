<template>
	<ml-dialog
		v-model="dialogConfig.isShow"
		:title="dialogConfig.title"
		:width="dialogConfig.width"
		:show-close="!dialogConfig.loading"
	>
		<div
			v-loading="dialogConfig.loading"
			:element-loading-text="dialogConfig.loadingText"
		>
			<!-- 导入实体 -->
			<div v-if="dialogConfig.type == 'import'">
				<el-input
					v-model="dialogConfig.inputValue"
					placeholder="请输入实体名称"
				/>
			</div>
			<!-- 导出实体 -->
			<div v-if="dialogConfig.type == 'export'">
				<el-form>
					<el-form-item label="导出实体">
						<el-input
							v-model="searchValue"
							placeholder="请输入关键词搜索..."
							@input="initExportEntityList"
							clearable
							class="mb-5"
						/>
						<el-checkbox-group
							v-model="dialogConfig.checkExportEntityValue"
						>
							<el-row :gutter="20">
								<el-col
									:span="6"
									v-for="item in exportEntityList"
									:key="item.id"
								>
									<el-checkbox
										:label="item.label"
										:value="item.name"
									/>
								</el-col>
							</el-row>
						</el-checkbox-group>
					</el-form-item>
					<el-form-item label="导出模块">
						<el-checkbox-group
							v-model="dialogConfig.checkModuleList"
						>
							<el-row :gutter="20">
								<el-col
									:span="6"
									v-for="item in exportModuleList"
									:key="item.value"
								>
									<el-checkbox
										:disabled="item.disabled"
										:label="item.label"
										:value="item.value"
									/>
								</el-col>
							</el-row>
						</el-checkbox-group>
					</el-form-item>
				</el-form>
			</div>
		</div>
		<template #footer>
			<el-button
				@click="dialogConfig.isShow = false"
				:loading="dialogConfig.loading"
			>
				取消
			</el-button>
			<el-button
				type="primary"
				@click="handleSave"
				:loading="dialogConfig.loading"
			>
				确认
			</el-button>
		</template>
	</ml-dialog>
</template>
<script setup>
import { ref, reactive } from "vue";
import { exportEntityData } from "@/api/system-manager";
import { ElMessage } from "element-plus";

const props = defineProps({
	entityList: {
		type: Array,
		default: [],
	},
});

let dialogConfig = reactive({
	isShow: false,
	loading: false,
	loadingText: "导入中...",
	title: "导入导出实体",
	width: "600px",
	type: "import",
	// 导出勾选的所有实体
	checkExportEntityValue: [],
	// 导出模块
	checkModuleList: ["entityFiled"],
});

// 导出模块
let exportModuleList = ref([
	{
		label: "实体字段",
		value: "entityFiled",
		disabled: true,
	},
	{
		label: "表单设计",
		value: "exportFormLayout",
	},
	{
		label: "列表设计",
		value: "exportLayoutConfig",
	},
	{
		label: "审批流程",
		value: "exportApprovalConfig",
	},
]);

// 导出实体搜索
let searchValue = ref("");
// 可导出实体列表
let exportEntityList = ref([]);

// 打开弹框
const openDialog = (type) => {
	dialogConfig.type = type;
	dialogConfig.title = type == "import" ? "导入实体" : "导出实体";
	dialogConfig.loadingText = type == "import" ? "导入中..." : "导出中...";
	dialogConfig.isShow = true;
	// 如果是导出
	if (type == "export") {
		initExportEntityList();
	}
};

const initExportEntityList = () => {
	// 过滤系统实体 以及 搜索关键词
	exportEntityList.value = props.entityList.filter(
		(el) =>
			!el.systemEntityFlag &&
			(el.name.toLowerCase().includes(searchValue.value.toLowerCase()) ||
				el.label
					.toLowerCase()
					.includes(searchValue.value.toLowerCase()))
	);
};

const handleSave = () => {
	// console.log(dialogConfig.checkboxValue);
	if (dialogConfig.type == "export") {
		handleExport();
	}
};

const handleExport = async () => {
    if(dialogConfig.checkExportEntityValue.length == 0) {
        ElMessage.error("请选择导出实体");
        return;
    }
    let params = {
        names: dialogConfig.checkExportEntityValue,
        exportFormLayout: dialogConfig.checkModuleList.includes("exportFormLayout"),
        exportLayoutConfig: dialogConfig.checkModuleList.includes("exportLayoutConfig"),
        exportApprovalConfig: dialogConfig.checkModuleList.includes("exportApprovalConfig"),
    }
    dialogConfig.loading = true;
	let res = await exportEntityData(params);
    if(res) {
        // 创建一个 Blob 对象，并设置文件类型
		const blob = new Blob([res.data.bytes], {
			type: "application/octet-stream",
		});
		// 创建一个链接并指向 Blob 对象
		const downloadUrl = URL.createObjectURL(blob);
		// 创建一个临时的 a 标签并模拟点击进行下载
		const a = document.createElement("a");
		a.href = downloadUrl;
		// 设置下载文件的名称
        let downloadName;
        if(dialogConfig.checkExportEntityValue.length < 2) {
            // downloadName = 
            // a.download = "实体导出（" + downloadName + "）.json";
        } else {
            downloadName = props.entityList.find(el => el.name == dialogConfig.checkExportEntityValue[0]).label + "、";
            downloadName += props.entityList.find(el => el.name == dialogConfig.checkExportEntityValue[1]).label;
            a.download = "实体导出（" + downloadName + "等）.json";
        }
		a.click();
		// 清理创建的 URL 对象
		URL.revokeObjectURL(downloadUrl);
		dialogConfig.isShow = false;
    }
    dialogConfig.loading = false;
	// console.log(res);
};

defineExpose({
	openDialog,
});
</script>
<style lang="scss" scoped>
:deep(.el-form-item) {
	align-items: initial !important;
}
</style>
