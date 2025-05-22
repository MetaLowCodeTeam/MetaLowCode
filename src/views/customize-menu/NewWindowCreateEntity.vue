<style scoped lang="scss">
.new-window-create-entity {
	width: 100%;
	height: 100%;
	.nw-content-box {
		height: calc(100% - 52px);
		overflow: auto;
		overflow-x: hidden;
		padding: 10px 15px;
		box-sizing: border-box;
		.nw-content {
			border-radius: 4px;
			padding: 10px;
			background: #fff;
			box-sizing: border-box;
			min-height: 100%;
		}
		.nw-empty {
			display: flex;
			justify-content: center;
			align-items: center;
			height: 100%;
		}
	}
	.nw-footer {
		height: 51px;
		border-top: 1px solid #e6e6e6;
		box-sizing: border-box;
		background: #fff;
		line-height: 51px;
		padding: 0 15px;
		text-align: right;
	}
}
</style>
<template>
	<div
		class="new-window-create-entity"
		v-loading="loading"
		loading-text="加载中..."
	>
		<div class="nw-content-box">
			<div class="nw-content" v-if="!showEmptyForm">
				<v-form-render
					v-if="haveLayoutJson"
					ref="vFormRef"
					:global-dsv="globalDsv"
					:option-data="optionData"
				/>
			</div>
			<div class="nw-empty" v-else>
				<el-empty
					:image-size="100"
					description="未查询到相关配置数据"
				/>
			</div>
		</div>
		<div class="nw-footer">
			<el-button @click="closeTab">取消</el-button>
			<el-button type="primary" @click="saveForm">保存</el-button>
			<el-button type="primary" @click="saveForm('close')"
				>保存并关闭</el-button
			>
		</div>
	</div>
</template>

<script setup>
import { onMounted, ref, nextTick } from "vue";
import { ElMessage } from "element-plus";
import { globalDsvDefaultData } from "@/utils/util";
// 引入 控制Tabs方法
import useTabs from "@/utils/useTabs";
import { useRouter } from "vue-router";

// API
import { getFormLayout } from "@/api/system-manager";
import { saveRecord } from "@/api/crud";

const router = useRouter();

// 实体名称
let entity = ref("");

// 表单ID
let formId = ref("");

onMounted(() => {
	entity.value = router.currentRoute.value.params.entityName;
	formId.value = router.currentRoute.value.query.formId;
	// 加载表单
	loadForm();
});

// 表单相关配置
let haveLayoutJson = ref(false);
let globalDsv = ref(globalDsvDefaultData());
let optionData = ref({});

// 加载状态
let loading = ref(false);
// 是否显示空表单
let showEmptyForm = ref(false);

// 表单渲染
let vFormRef = ref(null);

// 加载表单
const loadForm = async () => {
	loading.value = true;
	let res = await getFormLayout(entity.value, formId.value);
	if (res) {
		if (res.data?.layoutJson) {
			haveLayoutJson.value = true;
			optionData.value = res.data.optionData || {};
            if(res.data.codeOptionData) {
                optionData.value = Object.assign(optionData.value, res.data.codeOptionData);
            }
			if (res.data.formUploadParam) {
				globalDsv.value.cloudUploadToken =
					res.data.formUploadParam.cloudUploadToken;
				globalDsv.value.cloudStorage =
					res.data.formUploadParam.cloudStorage;
				globalDsv.value.picUploadURL =
					res.data.formUploadParam.picUploadURL;
				globalDsv.value.fileUploadURL =
					res.data.formUploadParam.fileUploadURL;
				globalDsv.value.picDownloadPrefix =
					res.data.formUploadParam.picDownloadPrefix;
				globalDsv.value.fileDownloadPrefix =
					res.data.formUploadParam.fileDownloadPrefix;
			}
			globalDsv.value.formStatus = "new";
			globalDsv.value.formEntityId = "";
			nextTick(() => {
				vFormRef.value.setFormJson(res.data.layoutJson);
			});
		}
	}
	if (!haveLayoutJson.value) {
		showEmptyForm.value = true;
	}
	loading.value = false;
};

// 保存表单
const saveForm = (type) => {
	let listSubForm = [];
	vFormRef.value.getContainerWidgets().forEach((el) => {
		if (el.type == "list-sub-form") {
			listSubForm.push(el.name);
		}
	});
	vFormRef.value
		.getFormData()
		.then(async (formData) => {
			if (formData) {
				listSubForm.forEach((el) => {
					delete formData[el];
				});
				loading.value = true;
				let saveRes = await saveRecord(entity.value, "", formData);
				if (
					saveRes &&
					(saveRes.data?.code == 200 || saveRes.code == 200)
				) {
					ElMessage.success("保存成功");
                    if(type == 'close'){
                        closeTab();
                        localStorage.setItem("NewWindowCreateEntity", entity.value);
                    }
				}
				loading.value = false;
			}
		})
		.catch((err) => {
			console.log(err, "err");
			ElMessage.error("表单校验失败，请修改后重新提交");
		});
};

// 关闭页签
const closeTab = () => {
	useTabs.close(router.currentRoute.value);
};
</script>
