<style scoped lang="scss">
.app-manager-dialog-label {
	display: flex;
	width: 100%;
	.app-manager-dialog-input {
		flex: 1;
	}
	.app-manger-zw {
		// width: 20px;
	}
}
:deep(.el-form-item) {
	align-items: initial !important;
}
.ml-upload {
	display: inline-block;
}
.file-name-span {
	position: relative;
	top: -1px;
	font-weight: bold;
	text-decoration: underline;
	margin-left: 15px;
}
</style>
<template>
	<ml-dialog
		v-model="dialogVisible"
		:title="fromData.title"
		width="700px"
		:show-close="!loading"
	>
		<!-- 新建编辑 -->
		<div
			v-if="fromData.type === 'add' || fromData.type === 'edit'"
			v-loading="loading"
		>
			<el-form :label-width="language == 'zh-CN' ? '110px' : '150px'">
				<el-form-item
					:label="$t('appManager.1100')"
					class="is-required"
				>
					<div class="app-manager-dialog-label">
						<el-input
							v-model="fromData.appName"
							class="app-manager-dialog-input"
							:class="{ 'is-error': errorInfo.appNameError }"
							@focus="errorInfo.appNameError = false"
						/>
						<span class="app-manger-zw"></span>
					</div>
				</el-form-item>
				<el-form-item
					:label="$t('appManager.1101')"
					class="is-required"
				>
					<div class="app-manager-dialog-label">
						<el-input
							v-model="fromData.abbrName"
							class="app-manager-dialog-input"
							:disabled="fromData.type === 'edit'"
							:class="{
								'is-error': errorInfo.abbrNameError,
							}"
							@focus="errorInfo.abbrNameError = false"
						/>
						<el-tooltip placement="top">
							<template #content>
								<div style="width: 200px">
									{{ t("appManager.1101-1") }}
								</div>
							</template>
							<span class="ml-5">
								<el-icon><WarningFilled /></el-icon>
							</span>
						</el-tooltip>
					</div>
				</el-form-item>
				<el-form-item
					:label="$t('appManager.1102')"
					class="is-required"
				>
					<div class="app-manager-dialog-label">
						<el-input-number
							v-model="fromData.startingCode"
							class="app-manager-dialog-input"
							:class="{
								'is-error': errorInfo.startingCodeError,
							}"
							@focus="errorInfo.startingCodeError = false"
							:min="1"
							:max="9999999999"
						/>
						<el-tooltip placement="top">
							<template #content>
								<div style="width: 200px">
									{{ t("appManager.1102-1") }}
								</div>
							</template>
							<span class="ml-5">
								<el-icon><WarningFilled /></el-icon>
							</span>
						</el-tooltip>
					</div>
				</el-form-item>
				<el-form-item
					:label="$t('appManager.1103')"
					class="is-required"
				>
					<div class="app-manager-dialog-label">
						<el-input-number
							v-model="fromData.entityNumber"
							:min="30"
							:max="3000"
							class="w-100"
							:class="{
								'is-error': errorInfo.entityNumberError,
							}"
							@focus="errorInfo.entityNumberError = false"
						/>
						<el-tooltip placement="top">
							<template #content>
								<div style="width: 200px">
									{{ t("appManager.1103-1") }}
								</div>
							</template>
							<span class="ml-5">
								<el-icon><WarningFilled /></el-icon>
							</span>
						</el-tooltip>
					</div>
				</el-form-item>
				<el-form-item :label="$t('appManager.1104')" class="mb-0">
					<div class="app-manager-dialog-label">
						<el-input
							v-model="fromData.remarks"
							class="app-manager-dialog-input"
							type="textarea"
							:rows="3"
						/>
						<span class="app-manger-zw"></span>
					</div>
				</el-form-item>
			</el-form>
		</div>
		<!-- 安装 -->
		<div v-if="fromData.type === 'install'" v-loading="loading">
			<el-form :label-width="language == 'zh-CN' ? '110px' : '150px'">
				<el-form-item :label="$t('appManager.1106')">
					<ml-upload
						accept=".zip"
						customUpload
						@on-custom-upload="onCustomUpload"
						class="ml-upload"
                        :maxSize="500"
					>
						<template #trigger>
							<el-button>
								<el-icon>
									<ElIconUpload />
								</el-icon>
								上传文件
							</el-button>
						</template>
					</ml-upload>
					<span
						class="file-name-span"
						v-if="fromData.originalFilename"
					>
						{{ fromData.originalFilename }}
					</span>
				</el-form-item>
				<el-form-item :label="$t('appManager.1105')" class="mb-0">
					<div class="app-manager-dialog-label">
						<el-input
							v-model="fromData.installPassword"
							class="app-manager-dialog-input"
							clearable
                            :placeholder="$t('appManager.1105-2')"
						/>
					</div>
					<div class="info-text mt-5">
						{{ $t("appManager.1302") }}
					</div>
				</el-form-item>
			</el-form>
		</div>
		<!-- 导出 -->
		<div v-if="fromData.type === 'export'" v-loading="loading">
			<el-form :label-width="language == 'zh-CN' ? '110px' : '150px'">
				<el-form-item
					:label="$t('appManager.1100')"
					class="is-required"
				>
					<div class="app-manager-dialog-label">
						<el-input
							v-model="fromData.appName"
							class="app-manager-dialog-input"
							disabled
						/>
					</div>
				</el-form-item>
				<el-form-item :label="$t('appManager.1104')">
					<div class="app-manager-dialog-label">
						<el-input
							v-model="fromData.remarks"
							class="app-manager-dialog-input"
							type="textarea"
							:rows="3"
							disabled
						/>
					</div>
				</el-form-item>
				<el-form-item :label="$t('appManager.1105')" class="mb-0">
					<div class="app-manager-dialog-label">
						<el-input
							v-model="fromData.installPassword"
							class="app-manager-dialog-input"
							clearable
                            :placeholder="$t('appManager.1105-1')"
						/>
					</div>
				</el-form-item>
			</el-form>
		</div>
		<template #footer>
			<el-button @click="dialogVisible = false" :loading="loading">
				{{ $t("operation.7000") }}
			</el-button>
			<el-button
				type="primary"
				@click="handleSubmit"
				v-if="fromData.type === 'add' || fromData.type === 'edit'"
				:loading="loading"
			>
				{{ $t("operation.6000") }}
			</el-button>
			<el-button
				type="primary"
				@click="handleSubmit"
				v-if="fromData.type === 'install'"
				:loading="loading"
			>
				{{ $t("appManager.1009") }}
			</el-button>
			<el-button
				type="primary"
				@click="handleSubmit"
				v-if="fromData.type === 'export'"
				:loading="loading"
			>
				{{ $t("appManager.1010") }}
			</el-button>
		</template>
	</ml-dialog>
</template>
<script setup>
import { ref } from "vue";
import { t } from "@/locales";
import { ElMessage, ElMessageBox } from "element-plus";
// API
import { saveRecord, exportApp, installApp } from "@/api/appManager";
import { downloadBase64 } from "@/utils/util";

// 语言
let language = ref(localStorage.getItem("Language") || "zh-CN");

// 事件
const emit = defineEmits(["refresh"]);

const DialogType = {
	add: t("appManager.1005"),
	edit: t("appManager.1008"),
	install: t("appManager.1006"),
	export: t("appManager.1007"),
};

let fromData = ref({});

let loading = ref(false);
let dialogVisible = ref(false);

const openDialog = (type, data) => {
	dialogVisible.value = true;
	if (type === "edit" || type === "export") {
		fromData.value = JSON.parse(JSON.stringify(data));
	} else {
		fromData.value = {
			entityNumber: 300,
			startingCode: 1000,
		};
	}
	fromData.value.type = type;
	fromData.value.title = DialogType[type];
};

// 上传文件
const onCustomUpload = (file) => {
	fromData.value.originalFilename = file.name;
	fromData.value.originalFile = file;
};

// 错误信息
let errorInfo = ref({
	nameError: false,
	abbrNameError: false,
	startingCodeError: false,
	entityNumberError: false,
});

// 提交
const handleSubmit = async () => {
	let {
		type,
		appName,
		abbrName,
		startingCode,
		entityNumber,
		originalFilename,
		originalFile,
		remarks,
		installPassword,
	} = fromData.value;
	if (type === "add" || type === "edit") {
		if (!appName) {
			errorInfo.value.appNameError = true;
			ElMessage.error(t("appManager.1200"));
			return;
		}
		if (!abbrName) {
			errorInfo.value.abbrNameError = true;
			ElMessage.error(t("appManager.1201"));
			return;
		}
		// 只能是英文，且首字母大写
		let reg = /^[A-Z][a-zA-Z]*$/;
		if (!reg.test(abbrName)) {
			errorInfo.value.abbrNameError = true;
			ElMessage.error(t("appManager.1204"));
			return;
		}
		if (startingCode < 1 || startingCode > 9999999999) {
			errorInfo.value.startingCodeError = true;
			ElMessage.error(t("appManager.1202"));
			return;
		}
		if (entityNumber < 30 || entityNumber > 3000) {
			errorInfo.value.entityNumberError = true;
			ElMessage.error(t("appManager.1203"));
			return;
		}
		let res = await saveRecord(fromData.value.appManagementId, {
			appName,
			abbrName,
			startingCode,
			entityNumber,
			remarks,
		});
		if (res) {
			ElMessage.success(t("operation.6100"));
			dialogVisible.value = false;
			emit("refresh");
		}
		loading.value = false;
	}
	if (type === "install") {
		if (!originalFilename) {
			ElMessage.error(t("appManager.1205"));
			return;
		}
		let paramsFormData = new FormData();
		paramsFormData.append("file", originalFile);
		loading.value = true;
		let res = await installApp(paramsFormData, {
			headers: { "Content-Type": "multipart/form-data" },
			params: {
				password: installPassword,
			},
		});
		if (res) {
			ElMessageBox.confirm(t('appManager.1301'), t('operation.9000'), {
				confirmButtonText: t('operation.6105'),
				showCancelButton: false,
				showClose: false,
				closeOnClickModal: false,
				closeOnPressEscape: false,
				type: "success",
			})
				.then(async () => {
					window.location.reload();
				})
				.catch(() => {
					// 取消
				});
			dialogVisible.value = false;
		}
		loading.value = false;
	}
	if (type === "export") {
		loading.value = true;
		let res = await exportApp(abbrName, installPassword);
		if (res) {
			downloadBase64(res.data, appName + ".zip");
			dialogVisible.value = false;
		}
		loading.value = false;
	}
	console.log(fromData.value);
};

defineExpose({
	openDialog,
});
</script>
