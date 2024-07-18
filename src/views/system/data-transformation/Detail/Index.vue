<template>
	<!--  -->
	<div
		class="data-transformation-detail"
		v-loading="loading"
		:element-loading-text="loadingText"
	>
		<div class="d-t-m">
			<el-scrollbar height="100%">
				<el-form label-width="100px">
					<el-form-item class="info-form-item">
						<el-row :gutter="10" style="width: 600px">
							<el-col :span="9">{{ targetEntity.label }}</el-col>
							<el-col :span="9" :offset="6">
								{{ sourceEntity.label }}
							</el-col>
						</el-row>
					</el-form-item>
					<el-form-item label="转化字段映射">
						<MappingComp
							v-if="isFinish"
							v-model="fieldMapping"
							:sourcesFields="sourceEntity.fields"
							:targetFields="targetEntity.fields"
						/>
					</el-form-item>
					<el-form-item class="info-form-item">
						<el-row :gutter="10" style="width: 600px">
							<el-col :span="9">
								{{ sourceEntity.label }}
							</el-col>
							<el-col :span="9" :offset="6">
								{{ targetEntity.label }}
							</el-col>
						</el-row>
					</el-form-item>
					<el-form-item label="回填字段映射">
						<MappingComp
							v-if="isFinish"
							v-model="backfill"
							:sourcesFields="targetEntity.fields"
							:targetFields="sourceEntity.fields"
						/>
					</el-form-item>
					<el-form-item>
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
			let sourceRes = await queryEntityFields(
				sourceEntity.value.code,
				true,
				true,
				false
			);
			if (sourceRes) {
				sourceEntity.value.fields = sourceRes.data;
			}
		}
		// 格式化目标实体
		if (row.value.targetEntity) {
			formatEntityData(targetEntity, "targetEntity");
			let targetRes = await queryEntityFields(
				targetEntity.value.code,
				true,
				true,
				false
			);
			if (targetRes) {
				targetEntity.value.fields = targetRes.data;
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

// 保存
const onSave = () => {
	console.log(fieldMapping.value, "转化字段映射");
	console.log(backfill.value, "回填字段映射");
};
</script>
<style lang="scss" scoped>
.data-transformation-detail {
	padding: 20px;
	height: 100%;
	box-sizing: border-box;
	.d-t-m {
		height: 100%;
		padding: 20px;
		box-sizing: border-box;
		background: #fff;
		border-radius: 4px;
	}
	.info-form-item {
		margin-bottom: 0 !important;
		text-align: center;
	}
	.el-form-item {
		align-items: initial;
	}
}
</style>
