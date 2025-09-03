<template>
	<ml-dialog
		:title="title"
		v-model="isShow"
		width="550"
		:show-close="!loading"
	>
		<el-form label-width="80px" v-loading="loading">
			<el-form-item label="导出版本">
				<el-input v-model="formData.versionName" disabled />
			</el-form-item>
			<el-form-item label="开始版本">
				<el-select
					v-model="formData.beginVersion"
					placeholder="请选择开始版本"
				>
					<el-option
						v-for="item in versionList"
						:key="item.id"
						:label="item.versionName + '(' + item.version + ')'"
						:value="item.version"
					/>
				</el-select>
			</el-form-item>
			<el-form-item label="导出模块">
				<el-checkbox-group v-model="formData.exportTypeList">
					<el-row :gutter="10">
						<el-col
							:span="6"
							v-for="item in defaultExportModules"
							:key="item.value"
						>
							<el-checkbox
								:label="item.label"
								:value="item.value"
							/>
						</el-col>
					</el-row>
				</el-checkbox-group>
                <div class="info-text">
                    在版本导出操作中，实体数据与字段数据将被一并导出。
				</div>
				<div class="info-text">
					注意：同一版本无法重复导入。请谨慎选择导出模块。
				</div>
			</el-form-item>
		</el-form>
		<template #footer>
			<el-button type="primary" @click="handleExport" :loading="loading">
				确定
			</el-button>
			<el-button @click="isShow = false" :loading="loading">
				取消
			</el-button>
		</template>
	</ml-dialog>
</template>

<script setup>
import { ref } from "vue";
import { listQuery, exportDevelopSql } from "@/api/devVersionHistory";
const emit = defineEmits(["refresh"]);
let isShow = ref(false);
let title = ref("");
let formData = ref({});
let loading = ref(false);
let versionList = ref([]);
const defaultExportModules = ref([
	{
		label: "用户",
		value: "User",
	},
	{
		label: "部门",
		value: "Department",
	},
	{
		label: "团队",
		value: "Team",
	},
	{
		label: "系统常量",
		value: "SystemConstant",
	},
	{
		label: "单选项",
		value: "OptionItem",
	},
	{
		label: "多选项",
		value: "TagItem",
	},
	{
		label: "表单布局",
		value: "FormLayout",
	},
	{
		label: "权限角色",
		value: "Role",
	},
	{
		label: "导航菜单",
		value: "RouterMenu",
	},
	{
		label: "审批配置",
		value: "ApprovalConfig",
	},
	{
		label: "审批流程",
		value: "ApprovalFlow",
	},
	{
		label: "报表模板",
		value: "ReportConfig",
	},
	{
		label: "触发器",
		value: "TriggerConfig",
	},
	{
		label: "布局设置",
		value: "LayoutConfig",
	},
	{
		label: "API管理",
		value: "MetaApi",
	},
	{
		label: "仪表盘",
		value: "Chart",
	},
	{
		label: "外置表单",
		value: "ExternalForm",
	},
	{
		label: "数据转化",
		value: "Transform",
	},
    {
		label: "自定义方法",
		value: "CustomMethod",
	},
	{
		label: "国际化翻译项",
		value: "I18n",
	},
	{
		label: "国际化翻译",
		value: "I18nItem",
	},

]);

const openDialog = async (data) => {
	formData.value.endVersion = data.version;
	formData.value.versionName = data.versionName;
	formData.value.exportTypeList = defaultExportModules.value.map(
		(item) => item.value
	);
	isShow.value = true;
	title.value = "版本导出";
	loading.value = true;
	let res = await listQuery(
		"DevVersionHistory",
		"version, versionName",
		{
			equation: "OR",
			items: [
				{
					fieldName: "version",
					value: data.version,
					op: "LT",
				},
			],
		},
		99999,
		1,
		[
			{
				fieldName: "createdOn",
				type: "DESC",
			},
		]
	);
	if (res) {
		versionList.value = res.data.dataList;
		if (res.data.dataList.length > 0) {
			formData.value.beginVersion = res.data.dataList[0].version;
		}
	}
	loading.value = false;
};

defineExpose({
	openDialog,
});

const appServe = import.meta.env.VITE_APP_BASE_API;

const handleExport = async () => {
	loading.value = true;
	let { beginVersion, endVersion, exportTypeList } = formData.value;
	let res = await exportDevelopSql({
		beginVersion,
		endVersion,
		exportTypeList,
	});
	if (res && res.data && res.data.bytes) {
		// 创建一个 Blob 对象，并设置文件类型
		const blob = new Blob([res.data.bytes], {
			type: "application/octet-stream",
		});
		// 创建一个链接并指向 Blob 对象
		const downloadUrl = URL.createObjectURL(blob);
		// 创建一个临时的 a 标签并模拟点击进行下载
		const a = document.createElement("a");
		a.href = downloadUrl;
		a.download = res.data.filename; // 设置下载文件的名称
		a.click();
		// 清理创建的 URL 对象
		URL.revokeObjectURL(downloadUrl);
		isShow.value = false;
	}
	loading.value = false;
};
</script>

<style lang="scss" scoped>
.el-form-item {
	align-items: initial;
}
</style>
