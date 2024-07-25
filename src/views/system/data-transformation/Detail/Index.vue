<template>
	<!--  -->
	<div
		class="data-transformation-detail"
		v-loading="loading"
		:element-loading-text="loadingText"
	>
		<div class="d-t-header">
			<span class="transformation-title">数据转化</span> /
			<span class="transformation-name">{{ row.transformName }}</span>
		</div>
		<div class="d-t-main">
			<div class="d-t-m">
				<el-scrollbar height="100%">
					<el-form label-width="100px">
						<el-form-item class="info-form-item">
							<el-row :gutter="10" class="info-form-row">
								<el-col :span="9">
									{{ targetEntity.label }}
								</el-col>
								<el-col :span="9" :offset="4">
									{{ sourceEntity.label }}
								</el-col>
							</el-row>
						</el-form-item>
						<el-form-item label="转化字段映射">
							<MappingComp
								v-if="isFinish"
								v-model="fieldMapping"
								:sourceEntity="sourceEntity"
								:targetEntity="targetEntity"
								title="转化字段映射"
                                :isError="fieldMappingError"
                                @clearError="fieldMappingError = false"
							/>
						</el-form-item>
						<el-form-item
							class="info-form-item"
							style="margin-top: 100px"
						>
							<el-row :gutter="10" class="info-form-row">
								<el-col :span="9">
									{{ sourceEntity.label }}
								</el-col>
								<el-col :span="9" :offset="4">
									{{ targetEntity.label }}
								</el-col>
							</el-row>
						</el-form-item>
						<el-form-item label="回填字段映射">
							<MappingComp
								v-if="isFinish"
								v-model="backfill"
								:sourceEntity="targetEntity2"
								:targetEntity="sourceEntity2"
								title="回填字段映射"
							/>
						</el-form-item>
						<el-form-item style="margin-top: 100px">
							<el-button
								type="primary"
								style="width: 100px"
								@click="onSave"
							>
								保存
							</el-button>
						</el-form-item>
					</el-form>
				</el-scrollbar>
			</div>
		</div>
	</div>
	<ml-dialog v-model="notTitleDialogShow" width="500" not-header top="30vh">
		<div class="save-success">
			<div>
				<el-icon class="save-icon" size="50">
					<ElIconWarning />
				</el-icon>
			</div>
			<div class="mt-5 save-info">保存成功</div>
			<div class="mt-20">
				<el-button @click="goDataTransformation">返回列表</el-button>
				<el-button type="primary" @click="notTitleDialogShow = false">
					继续编辑
				</el-button>
			</div>
		</div>
	</ml-dialog>
</template>

<script setup>
import http from "@/utils/request";
import { onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";
const Router = useRouter();

import useCommonStore from "@/store/modules/common";
const { queryEntityCodeByName, queryEntityLabelByName } = useCommonStore();

/**
 * API
 */
import { queryEntityFields } from "@/api/crud";

/**
 * 组件
 */
import MappingComp from "./MappingComp.vue";
import { ElMessage } from "element-plus";

let recordId = ref();

let loading = ref(false);
let loadingText = ref("数据加载中...");
let isFinish = ref(false);

onMounted(() => {
	recordId.value = Router.currentRoute.value.params?.recordId;
	if (recordId.value) {
		queryTransformById();
	}
});

// 行数据
let row = ref({});
// 源实体
let sourceEntity = ref({
	name: "",
	label: "",
	code: "",
	fields: [],
});
// 目标实体
let targetEntity = ref({
	name: "",
	label: "",
	code: "",
	fields: [],
});

// 源实体
let sourceEntity2 = ref({
	name: "",
	label: "",
	code: "",
	fields: [],
});
// 目标实体
let targetEntity2 = ref({
	name: "",
	label: "",
	code: "",
	fields: [],
});

// 转化字段映射
let fieldMapping = ref([]);
// 回填字段映射
let backfill = ref([]);

const queryTransformById = async () => {
	loading.value = true;
	loadingText.value = "数据加载中...";
	isFinish.value = false;
	let res = await http.get("/transform/queryById?recordId=" + recordId.value);
	if (res) {
		row.value = res.data || {};
		// 格式化源实体
		if (row.value.sourceEntity) {
			formatEntityData(sourceEntity, "sourceEntity");
			formatEntityData(sourceEntity2, "sourceEntity");
			let sourceRes = await queryEntityFields(
				sourceEntity.value.code,
				true,
				true,
				true
			);
			if (sourceRes) {
				sourceEntity.value.fields = sourceRes.data;
			}
			let sourceRes2 = await queryEntityFields(
				sourceEntity2.value.code,
				false,
				false,
				true
			);
			if (sourceRes2) {
				sourceEntity2.value.fields = sourceRes2.data;
			}
		}
		// 格式化目标实体
		if (row.value.targetEntity) {
			formatEntityData(targetEntity, "targetEntity");
			formatEntityData(targetEntity2, "targetEntity");
			let targetRes = await queryEntityFields(
				targetEntity.value.code,
				false,
				false,
				true
			);
			if (targetRes) {
				targetEntity.value.fields = targetRes.data;
			}
			let targetRes2 = await queryEntityFields(
				targetEntity2.value.code,
				true,
				true,
				true
			);
			if (targetRes2) {
				targetEntity2.value.fields = targetRes2.data;
			}
		}
		// 转化字段映射
		fieldMapping.value = row.value.fieldMapping
			? JSON.parse(row.value.fieldMapping)
			: [];
		// 回填字段映射
		backfill.value = row.value.backfill
			? JSON.parse(row.value.backfill)
			: [];
	}
	if (!res.data) {
		ElMessage.warning("没有查询到：" + recordId.value + " 相关的数据。");
	}
	loading.value = false;
	isFinish.value = true;
};

// 格式化实体数据
const formatEntityData = (target, key) => {
	target.value = {
		name: row.value[key],
		label: queryEntityLabelByName(row.value[key]),
		code: queryEntityCodeByName(row.value[key]),
		fields: [],
	};
};

let fieldMappingError = ref(false);
// 保存
const onSave = async () => {
	// 取转化字段映射目标字段必填字段
	let findTargetFields = targetEntity.value.fields.filter(
		(el) => !el.isNullable
	);
	// 取转化字段映射已添加的目标字段
	let findFieldMappingFields = fieldMapping.value.map((el) => el.targetField);
    // 查必填字段是否存在
	for (let index = 0; index < findTargetFields.length; index++) {
		const element = findTargetFields[index];
		if (!findFieldMappingFields.includes(element.fieldName)) {
			ElMessage.error("转化字段映射目标字段：【" + element.fieldLabel + "】为必填字段。");
            fieldMappingError.value = true;
			return;
		}
	}
	loading.value = true;
	loadingText.value = "数据保存中...";
	let res = await http.post(
		"/transform/saveRecord",
		{
			fieldMapping: JSON.stringify(fieldMapping.value),
			backfill: JSON.stringify(backfill.value),
			isPreview: false,
		},
		{
			params: { recordId: recordId.value },
		}
	);
	if (res) {
		notTitleDialogShow.value = true;
	}
	loading.value = false;
};

// 保存回调弹框
let notTitleDialogShow = ref(false);

// 返回列表
const goDataTransformation = () => {
	notTitleDialogShow.value = false;
	Router.push({
		path: "/web/data-transformation",
	});
};
</script>
<style lang="scss" scoped>
.data-transformation-detail {
	// padding: 20px;
	height: 100%;
	box-sizing: border-box;
	.d-t-header {
		height: 60px;
		line-height: 60px;
		box-sizing: border-box;
		padding: 0 20px;
		border-bottom: 1px solid #e4e7ed;
		background: #fff;
		font-size: 14px;
		color: #5e5e5e;
		.transformation-title {
			font-size: 18px;
			color: #6b6b6b;
			margin-right: 5px;
		}
		.transformation-name {
			font-weight: 700;
		}
	}
	.d-t-main {
		padding: 20px;
		height: calc(100% - 100px);
	}
	.d-t-m {
		height: 100%;
		padding: 20px 20px 0 100px;
		box-sizing: border-box;
		background: #fff;
		border-radius: 4px;
	}
	.info-form-item {
		margin-bottom: 0 !important;
		text-align: center;
		font-weight: bold;
		.info-form-row {
			width: 680px;
			font-size: 16px;
			margin-bottom: 5px;
			// border-bottom: 1px solid #e4e8eb;
		}
	}
	.el-form-item {
		align-items: initial;
	}
}
.save-success {
	text-align: center;
	.save-icon {
		color: var(--el-color-primary);
		position: relative;
		left: 12px;
	}
	.save-info {
		font-size: 13px;
		font-weight: bold;
		color: #404040;
	}
}
</style>
