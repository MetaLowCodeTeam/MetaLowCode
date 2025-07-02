<style lang="scss" scoped>
.main-detail {
	height: 100%;
	.main-detail-content {
		height: 100%;
		.main-detail-main {
			height: calc(100% - 60px);
			padding: 0 10px;
			box-sizing: border-box;
			margin-bottom: 10px;
			overflow: auto;
		}
		.main-detail-footer {
			height: 50px;
			box-sizing: border-box;
			border-top: 1px solid #e6e6e6;
			text-align: right;
			padding: 10px;
		}
	}
}
</style>
<template>
	<div
		class="main-detail"
		v-loading="loading"
		:element-loading-text="loadingText"
	>
		<div v-if="!notLayoutJson" class="main-detail-content">
			<div class="main-detail-main">
				<v-form-render
					v-if="haveLayoutJson"
					:option-data="optionData"
					:global-dsv="globalDsv"
					ref="vFormRef"
				/>
			</div>
			<div class="main-detail-footer">
				<el-button type="primary" icon="Select" @click="handleSave">保存</el-button>
				<!-- <el-button type="danger">删除</el-button> -->
			</div>
		</div>
		<el-empty
			v-if="notLayoutJson"
			:image-size="100"
			description="未查询到相关配置数据"
		/>
	</div>
</template>
<script setup>
import { ref, onMounted, nextTick } from "vue";
import { ElMessage } from "element-plus";
import { useRouter } from "vue-router";
import { globalDsvDefaultData } from "@/utils/util";
const router = useRouter();


// API
import { getFormLayout } from "@/api/system-manager";
import { queryById, saveRecord } from "@/api/crud";

const emit = defineEmits(['saveFinishCallBack','initFinish']);

const props = defineProps({
    type: {
        type: String,
        default: "edit",
    }
});

let vFormRef = ref(null);
let haveLayoutJson = ref(false);
let notLayoutJson = ref(false);

let loading = ref(false);
let loadingText = ref("加载中...");

let optionData = ref({});
let globalDsv = ref(globalDsvDefaultData());

let myEntity = ref({});

const initFormData = async (entity) => {
    myEntity.value = entity;
	haveLayoutJson.value = false;
	let res = await getFormLayout(entity.name);
	if (res && res.data) {
		if (res.data.layoutJson) {
			haveLayoutJson.value = true;
			optionData.value = res.data.optionData || {};
            if(res.data.codeOptionData) {
                optionData.value = Object.assign(optionData.value, res.data.codeOptionData);
            }
			let { type } = props;
			nextTick(async () => {
				// 编辑
				if (type == "edit") {
                    globalDsv.value.formStatus = "edit";
				    globalDsv.value.formEntityId = entity.recordId;
					let queryByIdRes = await queryById(entity.recordId);
					if (queryByIdRes && queryByIdRes.data) {
						globalDsv.value.recordData = queryByIdRes.data;
						vFormRef.value?.setFormJson(res.data.layoutJson);
						nextTick(() => {
							vFormRef.value?.setFormData(queryByIdRes.data);
							nextTick(() => {
								vFormRef.value?.reloadOptionData();
                                emit('initFinish');
							});
						});
					}
				}
                // 新建
                else {
                    globalDsv.value.formStatus = "add";
                    globalDsv.value.formEntityId = '';
                    vFormRef.value.setFormJson(res.data.layoutJson);
                    nextTick(() => {
                        vFormRef.value.reloadOptionData();
                        loading.value = false;
                        emit('initFinish');
                    });
                }
			});
		} else {
			notLayoutJson.value = true;
            emit('initFinish');
		}
	} else {
        emit('initFinish');
	}

};

const handleSave = () => {
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
				let saveRes = await saveRecord(
					myEntity.value.name,
					props.type == "add" ? '' : myEntity.value.recordId,
					formData
				);
				if (
					saveRes &&
					(saveRes.data?.code == 200 || saveRes.code == 200)
				) {
					ElMessage.success("保存成功");
                    if(props.type == "add") {
                        emit('saveFinishCallBack', saveRes.data.formData)
                    }
				}
                loading.value = false;
			}
		})
		.catch((err) => {
			console.log(err, "err");
			if(!globalDsv.value.defaultValidationMessageDisabled){
				ElMessage.error("表单校验失败，请修改后重新提交");
			}
		});
};

defineExpose({
	initFormData,
});
</script>
