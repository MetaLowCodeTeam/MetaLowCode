<template>
	<ml-dialog
		v-model="isShow"
		:title="title"
		width="500px"
		draggable
		:show-close="!loading"
	>
		<div v-loading="loading" element-loading-text="加载中...">
			<el-form
				ref="formRef"
				:model="form"
				:rules="rules"
				label-width="80px"
				:disabled="isView"
			>
				<el-form-item label="租户名称" prop="tenantName">
					<el-input
						v-model="form.tenantName"
						clearable
						maxlength="255"
					/>
				</el-form-item>
				<el-form-item label="租户编码" prop="tenantCode">
					<el-input
						v-model="form.tenantCode"
						clearable
						maxlength="255"
						:disabled="dialogType == 2"
					/>
				</el-form-item>
				<el-form-item label="租户模版" prop="tenantTemplateId">
					<el-select
						v-model="form.initializeTemplate"
						placeholder="请选择租户模版"
						clearable
						v-if="dialogType == 1"
					>
						<el-option
							v-for="(item, inx) in tenantTemplateList"
							:key="inx"
							:label="item.tenantName"
							:value="item.tenantTemplateId"
						/>
					</el-select>
					<el-input v-else v-model="tenantTemplateName" disabled />
				</el-form-item>
				<el-form-item label="启用">
					<el-switch
						v-model="form.isDisabled"
						:active-value="false"
						:inactive-value="true"
					/>
				</el-form-item>
                <el-form-item label="应用管理">
					<el-switch
						v-model="form.appManagementSwitch"
					/>
                    <span class="ml-5 info-text icon-top-1">允许租户开发应用</span>
				</el-form-item>
			</el-form>
		</div>
		<template #footer>
			<el-button type="primary" @click="beforeSave"> 保存 </el-button>
			<el-button @click="isShow = false">取消</el-button>
		</template>
	</ml-dialog>
</template>
<script setup>
import { ref } from "vue";
import { saveTenantRecord, getTenantTemplateList } from "@/api/plugins";
import { ElMessage } from "element-plus";
const emits = defineEmits(["refresh"]);
let isShow = ref(false);
let loading = ref(false);
let title = ref("");
let form = ref({
	tenantName: "",
	tenantCode: "",
	isDisabled: false,
	initializeTemplate: null,
    appManagementSwitch: false,
});
let rules = ref({
	tenantName: [
		{ required: true, message: "请输入租户名称", trigger: "blur" },
	],
	tenantCode: [
		{ required: true, message: "请输入租户编码", trigger: "blur" },
        // 只能英文或数组 不能加其他的
		{
			validator: (rule, value, callback) => {
				let reg = /^[a-zA-Z0-9]+$/;
				if (!reg.test(value)) {
					callback(new Error("只能输入英文或数字"));
				}
				callback();
			},
			trigger: "blur",
		},
	],
});

let isView = ref(false);
// 1 新增  2 编辑  3 查看
let dialogType = ref(null);

// 模板名称
let tenantTemplateName = ref("");

const openDialog = (row, target) => {
	isShow.value = true;
	title.value = row.tenantId
		? (target == "view" ? "查看" : "编辑") + row.tenantName
		: "新增租户";
	isView.value = false;
	dialogType.value = row.tenantId ? (target == "view" ? 3 : 2) : 1;

	form.value = {
		tenantName: "",
		tenantCode: "",
		isDisabled: false,
		initializeTemplate: null,
        appManagementSwitch: false,
	};
	// 如果是编辑
	if (row.tenantId) {
		form.value = {
			tenantName: row.tenantName,
			tenantCode: row.tenantCode,
			isDisabled: row.isDisabled,
			tenantId: row.tenantId,
            appManagementSwitch: row.appManagementSwitch,
		};
		tenantTemplateName.value = row.initializeTemplate?.name || "未使用模板";
	}
	// 如果是查看
	if (target == "view") {
		isView.value = true;
	}
	// 加载租户列表模版
	loadTenantTemplateList();
};
const formRef = ref("");
const beforeSave = () => {
	formRef.value.validate(async (valid) => {
		if (valid) {
			onSave(form.value);
		}
	});
};

const onSave = async (data) => {
	loading.value = true;
	let res = await saveTenantRecord("Tenant", data.tenantId, data);
	if (res && res.code == 200) {
		ElMessage.success("保存成功");
		isShow.value = false;
		emits("refresh");
	}
	loading.value = false;
};

// 加载租户列表模版
let tenantTemplateList = ref([]);
const loadTenantTemplateList = async () => {
	loading.value = true;
	let res = await getTenantTemplateList({
		mainEntity: "TenantTemplate",
		fieldsList: "tenantName, isDefault",
	});
	if (res && res.code == 200) {
		tenantTemplateList.value = res.data.dataList;
		let defaultTemplate = tenantTemplateList.value.find(
			(item) => item.isDefault == 1
		);
		if (defaultTemplate) {
			form.value.initializeTemplate = defaultTemplate.tenantTemplateId;
		}
	}
	loading.value = false;
};

defineExpose({
	openDialog,
	onSave,
});
</script>
