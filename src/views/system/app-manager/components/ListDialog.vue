<style scoped lang="scss">
.app-manager-dialog-label {
	display: flex;
	width: 100%;
	.app-manager-dialog-input {
		flex: 1;
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
.select-icon-span {
    display: inline-block;
    cursor: pointer;
    width: 24px;
    height: 24px;
    border: 1px solid #E4E7ED;
    border-radius: 5px;
    text-align: center;
    line-height: 24px;
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
			<el-form :label-width="language == 'zh-CN' ? '110px' : '150px'" @submit.prevent>
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
                            @change="handleAppNameChange"
						/>
						<span class="app-manger-zw"></span>
					</div>
				</el-form-item>
                <el-form-item :label="$t('appManager.1107')">
                    <div class="app-manager-dialog-label">
                        <span
                            class="select-icon-span"
                            title="选择图标"
                            @click="openSelectIconDialog"
                        >
                            <el-icon class="icon-top-2" v-if="!fromData?.iconConfig?.useIcon">
                                <SetUp />
                            </el-icon>
                            <el-icon class="icon-top-2" v-else :color="fromData?.iconConfig?.iconColor">
                                <component :is="fromData?.iconConfig?.useIcon" />
                            </el-icon>
                        </span>
                    </div>
                </el-form-item>
				<el-form-item
					:label="$t('appManager.1101')"
					class="is-required"
				>
					<div class="app-manager-dialog-label">
						<el-input
							v-model="fromData.appAbbr"
							class="app-manager-dialog-input"
							:disabled="fromData.type === 'edit'"
							:class="{
								'is-error': errorInfo.appAbbrError,
							}"
							@focus="errorInfo.appAbbrError = false"
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
                            :disabled="fromData.type === 'edit'"
							:class="{
								'is-error': errorInfo.startingCodeError,
							}"
							@focus="errorInfo.startingCodeError = false"
							:min="100000"
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
							:min="1"
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
			<el-form :label-width="language == 'zh-CN' ? '110px' : '150px'" @submit.prevent>
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
								{{ $t("appManager.1307") }}
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
			<el-form :label-width="language == 'zh-CN' ? '110px' : '150px'" @submit.prevent>
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
    <ml-dialog v-model="errMsgDialog.isShow" :title="$t('appManager.1305')" width="600px">
		<el-table 
            :data="errMsgDialog.msgList" 
            style="width: 100%" 
            :show-header="false"
            max-height="400"
            class="err-msg-table"
        >
			<el-table-column prop="msg" label="" />
		</el-table>
	</ml-dialog>
    <mlSelectIcon v-model="isShowIconDialog" :useIcon="cutMenuIcon" @confirmIcon="selectIcon" />
</template> 
<script setup>
import { ref, reactive } from "vue";
import { t } from "@/locales";
import { ElMessage, ElMessageBox } from "element-plus";
import { getSimplePinYin, upperFirstLetter } from "@/utils/util";
import mlSelectIcon from "@/components/mlSelectIcon/index.vue";
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
        if(data) {
            // 没有数据，则默认设置
            if(data.length < 1) {
                fromData.value = {
                    entityNumber: 1000,
                    startingCode: 100000,
                };
            }else {
                // 找到 数据里 startingCode 最大的那条数据
                let maxStartingCodeItem = data.reduce((maxItem, item) => {
                    return maxItem.startingCode > item.startingCode ? maxItem : item;
                }, data[0]);
                fromData.value = {
                    entityNumber: 1000,
                    startingCode: maxStartingCodeItem.startingCode + maxStartingCodeItem.entityNumber,
                };
            }
        }
	}
	fromData.value.type = type;
    console.log(fromData.value);
	fromData.value.title = DialogType[type];
    if(!fromData.value.iconConfig) {
        fromData.value.iconConfig = {
            useIcon: "",
            iconColor: "",
        };
    }
};

// 上传文件
const onCustomUpload = (file) => {
	fromData.value.originalFilename = file.name;
	fromData.value.originalFile = file;
};

// 错误信息
let errorInfo = ref({
	nameError: false,
	appAbbrError: false,
	startingCodeError: false,
	entityNumberError: false,
});

// 导入错误msg
let errMsgDialog = reactive({
	isShow: false,
	msgList: [],
});

// 提交
const handleSubmit = async () => {
	let {
		type,
		appName,
		appAbbr,
		startingCode,
		entityNumber,
		originalFilename,
		originalFile,
		remarks,
		installPassword,
        iconConfig,
	} = fromData.value;
	if (type === "add" || type === "edit") {
		if (!appName) {
			errorInfo.value.appNameError = true;
			ElMessage.error(t("appManager.1200"));
			return;
		}
		if (!appAbbr) {
			errorInfo.value.appAbbrError = true;
			ElMessage.error(t("appManager.1201"));
			return;
		}
		// 只能是英文，且首字母大写
		let reg = /^[A-Z][a-zA-Z0-9]*$/;
		if (!reg.test(appAbbr)) {
			errorInfo.value.appAbbrError = true;
			ElMessage.error(t("appManager.1204"));
			return;
		}
		if (startingCode < 100000 || startingCode > 9999999999) {
			errorInfo.value.startingCodeError = true;
			ElMessage.error(t("appManager.1202"));
			return;
		}
		if (entityNumber < 1 || entityNumber > 3000) {
			errorInfo.value.entityNumberError = true;
			ElMessage.error(t("appManager.1203"));
			return;
		}
		let res = await saveRecord(fromData.value.appManagementId, {
			appName,
			appAbbr,
			startingCode,
			entityNumber,
			remarks,
            iconConfig: JSON.stringify(iconConfig),
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
		if (res && res.code == 200) {
            if(res.data) {
                errMsgDialog.msgList = res.data.map((el) => {
                    return {
                        msg: el,
                    };
                });
                errMsgDialog.isShow = true;
                dialogVisible.value = false;
            }else {
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
		}
		loading.value = false;
	}
	if (type === "export") {
		loading.value = true;
		let res = await exportApp(appAbbr, installPassword);
		if (res) {
			downloadBase64(res.data, appName + ".zip");
			dialogVisible.value = false;
		}
		loading.value = false;
	}
	console.log(fromData.value);
};

const handleAppNameChange = (val) => {
    if (!val) {
        return;
    }

    if (!fromData.value.appAbbr) {
        const pyName = getSimplePinYin(val);
        fromData.value.appAbbr = upperFirstLetter(pyName);
    }
};

let isShowIconDialog = ref(false);
// 当前菜单ICON
let cutMenuIcon = ref({});

// 打开选择图标弹框
const openSelectIconDialog = () => {
    isShowIconDialog.value = true;
    cutMenuIcon.value = {
        name: fromData.value.iconConfig?.useIcon,
        color: fromData.value.iconConfig?.iconColor || "",
    };
};

// 选择图标
const selectIcon = ({ name, color }) => {
    fromData.value.iconConfig.useIcon = name;
    fromData.value.iconConfig.iconColor = color;
    isShowIconDialog.value = false;
};

defineExpose({
	openDialog,
});
</script>
