<template>
	<el-form>
		<el-form-item label="是否开启" class="mb-10">
			<el-switch v-model="slotData.open" class="icon-top-1" />
		</el-form-item>
		<el-form-item label="指定高度" class="mb-10">
			<el-input-number
				v-model="slotData.height"
				:min="0"
				:max="1000"
				:step="10"
				:disabled="!slotData.open"
			/>
			<span class="ml-5">px (0为自适应高度)</span>
		</el-form-item>
		<el-form-item label="插槽类型" class="mb-5">
			<el-radio-group
				v-model="slotData.type"
				:disabled="!slotData.open"
				@change="typeChange"
			>
				<el-radio :value="1">表单</el-radio>
				<el-radio :value="2">仪表盘</el-radio>
			</el-radio-group>
		</el-form-item>
		<template v-if="slotData.type === 1">
			<el-form-item label="选择实体" class="mb-10">
				<el-select
					v-model="slotData.entityName"
					placeholder="请选择实体"
					:disabled="!slotData.open"
					filterable
					@change="changeEntity"
				>
					<el-option
						v-for="(item, index) in entityList"
						:key="index"
						:label="item.label"
						:value="item.name"
					/>
				</el-select>
			</el-form-item>
			<el-form-item label="选择表单" class="mb-0">
				<el-select
					v-model="slotData.formId"
					placeholder="请选择表单"
					:disabled="!slotData.open"
					filterable
					v-loading="formLoading"
                    :class="{'is-error': slotData.formError}"
                    @focus="slotData.formError = false"
				>
					<el-option
						v-for="(item, index) in formList"
						:key="index"
						:label="item.layoutName"
						:value="item.formLayoutId"
					/>
				</el-select>
			</el-form-item>
		</template>
		<template v-else>
			<el-form-item label="选择仪表" class="mb-0">
				<el-select
					v-model="slotData.chartId"
					placeholder="请选择仪表"
					:disabled="!slotData.open"
					filterable
					v-loading="chartLoading"
                    :class="{'is-error': slotData.chartError}"
                    @focus="slotData.chartError = false"
				>
					<el-option
						v-for="(item, index) in chartList"
						:key="index"
						:label="item.chartName"
						:value="item.chartId"
					/>
				</el-select>
			</el-form-item>
		</template>
	</el-form>
</template>

<script setup>
import { ref, onMounted } from "vue";
import useCommonStore from "@/store/modules/common";
import { getFormLayoutList } from "@/api/system-manager";
import { crudListQuery } from "@/api/crud";
const { queryAllEntityList } = useCommonStore();
const slotData = defineModel({ type: Object, required: true });

let formLoading = ref(false);
let formList = ref([]);

let chartLoading = ref(false);
let chartList = ref([]);

let entityList = ref([]);

onMounted(() => {
	entityList.value = queryAllEntityList();
    getFormList();
    getChartList();
});

const typeChange = () => {
	if (slotData.value.type == 2) {
		getChartList();
	}
};

const changeEntity = () => {
    slotData.value.formId = "";
    getFormList();
}

// 获取表单列表
const getFormList = async () => {
	if (!slotData.value.entityName) {
		formList.value = [];
		return;
	}
	formLoading.value = true;
	try {
		let res = await getFormLayoutList(slotData.value.entityName);
		if (res?.code == 200) {
			formList.value = res.data || [];
            formList.value = formList.value.filter(item => item.formLayoutId);
		}
	} catch (error) {
		console.log(error);
	} finally {
		formLoading.value = false;
	}
};
// 获取仪表列表
const getChartList = async () => {
	chartLoading.value = true;
	try {
		let res = await crudListQuery({
			mainEntity: "Chart",
			fieldsList: "chartName,defaultChart",
			filter: {
				equation: "AND",
				items: [
					{
						fieldName: "chartData",
						op: "NT",
						value: "",
					},
				],
			},
		});
		if (res?.code == 200) {
			chartList.value = res.data.dataList || [];
		}
	} catch (error) {
		console.log(error);
	} finally {
		chartLoading.value = false;
	}
};
</script>
