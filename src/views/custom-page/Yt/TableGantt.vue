<template>
	<div v-loading="globalLoading" element-loading-text="加载中...">
		<div class="search-box">
			<el-form :model="searchForm" label-width="100px">
				<!-- 第一行：5个字段 -->
				<div class="search-row">
					<el-form-item label="生产订单号" class="search-item">
						<el-input
							v-model="searchForm.productionTask"
							placeholder="请输入生产订单号"
							clearable
						/>
					</el-form-item>
					<el-form-item label="生产单状态" class="search-item">
						<el-select
							v-model="searchForm.productionStatus"
							placeholder="请选择生产单状态"
							clearable
							style="width: 100%"
						>
							<el-option label="全部" value="all" />
							<el-option v-for="item in optionItems" :key="item.value" :label="item.label" :value="item.value" />
						</el-select>
					</el-form-item>
					<el-form-item label="产品编号" class="search-item">
						<el-input
							v-model="searchForm.productCode"
							placeholder="请输入产品编号"
							clearable
						/>
					</el-form-item>
					<el-form-item label="名称" class="search-item">
						<el-input
							v-model="searchForm.productName"
							placeholder="请输入名称"
							clearable
						/>
					</el-form-item>
					<el-form-item label="计划日期范围" class="search-item">
						<el-date-picker
							v-model="searchForm.dateRange"
							type="daterange"
							range-separator="至"
							start-placeholder="开始日期"
							end-placeholder="结束日期"
							value-format="YYYY-MM-DD"
							style="width: 100%"
							clearable
						/>
					</el-form-item>
				</div>
				<!-- 第二行：3个字段 + 按钮区域 -->
				<div class="search-row">
                    <el-form-item label="车间" class="search-item">
						<reference-search-table-input
							v-model="searchForm.workshop"
							entity="ProcessTaskOrder"
							refField="workshop"
							:enableAdd="false"
							:enableSavePlanQuery="false"
                            placeholder="请选择车间"
						/>
					</el-form-item>
					<el-form-item label="设备" class="search-item">
						<reference-search-table-input
							v-model="searchForm.equipment"
							entity="ProcessTaskOrder"
							refField="equipment"
							:enableAdd="false"
							:enableSavePlanQuery="false"
                            placeholder="请选择设备"
						/>
					</el-form-item>
					<el-form-item label="班组" class="search-item">
						<reference-search-table-input
							v-model="searchForm.workTeam"
							entity="ProcessTaskOrder"
							refField="workTeam"
							:enableAdd="false"
							:enableSavePlanQuery="false"
                            placeholder="请选择班组"
						/>
					</el-form-item>
					<div class="search-buttons">
						<el-button
							type="primary"
							style="width: 80px"
							@click="handleSearch"
						>
							搜索
						</el-button>
						<el-button style="width: 80px" @click="handleReset">
							重置
						</el-button>
					</div>
				</div>
			</el-form>
		</div>
		<EntityList
			ref="entityListRef"
			:listConf="listParamConf"
			customEntity="ProductionTas"
			modelName="Yt-TableGantt"
			:externalFilterItems="listFilterItems"
			:externalSort="[{ fieldName: 'productionTask', type: 'DESC' }]"
            @onSelectedChange="handleSelectedChange"
		/>
		<Gantt ref="ganttRef" :searchParams="searchParams" :selectedProductionTaskNos="selectedProductionTaskNos" />
	</div>
</template>

<script setup>
import { ref, onMounted, computed, watch, watchEffect } from "vue";
import EntityList from "@/views/customize-menu/list.vue";
import Gantt from "./TableGantt-Gantt.vue";
import ReferenceSearchTableInput from "@/components/mlReferenceSearch/reference-search-table-input.vue";
import { getOptionItems } from "@/api/system-manager";
let listParamConf = ref({
	// 是否显示头部
	showHeader: false,
	// 是否显示快速查询
	showQuickQuery: false,
	// 是否显示打开按钮
	showOpenBtn: false,
	// 是否显示编辑按钮
	showEditBtn: false,
	// 是否显示新建按钮
	showAddBtn: false,
	// 是否显示更多按钮
	showMoreBtn: false,
});

// 搜索表单数据
const searchForm = ref({
	productionTask: "",
	productionStatus: "",
	workshop: null,
	equipment: null,
	workTeam: null,
	productCode: "",
	productName: "",
	dateRange: null,
});

// 搜索参数，传递给 Gantt 组件
const searchParams = ref({});
const listFilterItems = ref([]);

let loading = ref(false);
const entityListRef = ref(null);
const ganttRef = ref(null);
const entityListLoading = ref(false);
const ganttLoading = ref(false);
const globalLoading = computed(
	() => loading.value || entityListLoading.value || ganttLoading.value
);

onMounted(() => {
	// getOptionItems("ProductionTask", "productionStatus").then(res => {
	// 	console.log(res);
	// });
	loadOptions();
});

let optionItems = ref([]);

const loadOptions = async () => {
	loading.value = true;
	let res = await getOptionItems("ProcessTaskOrder", "productionStatus");
	if (res && res.code == 200) {
		optionItems.value = !res.data ? [] : res.data;
        optionItems.value = optionItems.value.filter(item => item.value != 5 || item.label != "未排产");
	}
	loading.value = false;
};

// 构建搜索参数
const buildSearchParams = () => {
	const params = {};

	// 生产订单号
	if (searchForm.value.productionTask) {
		params.productionTask = searchForm.value.productionTask;
	}

	// 生产单状态
	if (searchForm.value.productionStatus) {
		params.productionStatus = searchForm.value.productionStatus;
	}

	// 车间
	if (searchForm.value.workshop?.id) {
		params.workshopId = searchForm.value.workshop.id;
	}

	// 设备
	if (searchForm.value.equipment?.id) {
		params.equipmentId = searchForm.value.equipment.id;
	}

	// 班组
	if (searchForm.value.workTeam?.id) {
		params.workTeamId = searchForm.value.workTeam.id;
	}

	// 产品编号
	if (searchForm.value.productCode) {
		params.productCode = searchForm.value.productCode;
	}

	// 名称
	if (searchForm.value.productName) {
		params.productName = searchForm.value.productName;
	}

	// 计划日期范围
	if (searchForm.value.dateRange && searchForm.value.dateRange.length === 2) {
		params.expectedStartTime = searchForm.value.dateRange[0];
		params.expectedEndTime = searchForm.value.dateRange[1];
	}

	return params;
};

// 搜索
const buildListFilterItems = (params) => {
	const items = [];
	// 生产订单号
	if (params.productionTask) {
		items.push({
			fieldName: "productionTaskNo",
			op: "LK",
			value: params.productionTask,
		});
	}
	// 生产单状态
	if (params.productionStatus && params.productionStatus !== "all") {
		items.push({
			fieldName: "productionStatus",
			op: "SQL",
			value: `exists (select processTaskOrderId from ProcessTaskOrder where productionTask = _.productionTasId AND productionStatus = '${params.productionStatus}')`,
		});
	}
	// 车间
	if (params.workshopId) {
		items.push({
			fieldName: "workshop",
			op: "SQL",
			value: `exists (select processTaskOrderId from ProcessTaskOrder where productionTask = _.productionTasId AND workshop = '${params.workshopId}')`,
		});
	}
	// 设备
	if (params.equipmentId) {
		items.push({
			fieldName: "equipment",
			op: "SQL",
			value: `exists (select processTaskOrderId from ProcessTaskOrder where productionTask = _.productionTasId AND equipment = '${params.equipmentId}')`,
		});
	}
	// 班组
	if (params.workTeamId) {
		items.push({
			fieldName: "workTeam",
			op: "SQL",
			value: `exists (select processTaskOrderId from ProcessTaskOrder where productionTask = _.productionTasId AND workTeam = '${params.workTeamId}')`,
		});
	}
	// 产品编号
	if (params.productCode) {
		items.push({
			fieldName: "selectProduct.productcode",
			op: "LK",
			value: params.productCode,
		});
	}
	// 名称
	if (params.productName) {
		items.push({
			fieldName: "selectedProduct.productName",
			op: "LK",
			value: params.productName,
		});
	}
	// 计划日期范围
	if (params.expectedStartTime) {
		items.push({
			fieldName: "plannedStartTime",
			op: "GT",
			value: params.expectedStartTime,
		});
	}
	if (params.expectedEndTime) {
		items.push({
			fieldName: "plannedEndTime",
			op: "LT",
			value: params.expectedEndTime,
		});
	}
    console.log(items, "items");
	return items;
};

const handleSearch = () => {
	const params = buildSearchParams();
	searchParams.value = params;
	listFilterItems.value = buildListFilterItems(params);
};

// 重置
const handleReset = () => {
	searchForm.value = {
		productionTask: "",
		productionStatus: "",
		workshop: null,
		equipment: null,
		workTeam: null,
		productCode: "",
		productName: "",
		dateRange: null,
	};
	// 重置后也触发搜索
	searchParams.value = {};
	listFilterItems.value = [];
};

const selectedProductionTaskNos = ref([]);
const handleSelectedChange = (selected) => {
    let productionTaskNoList = selected.map(el => el.productionTaskNo);
    selectedProductionTaskNos.value = productionTaskNoList;
};

watch(
	() => entityListRef.value?.pageLoading?.value,
	(val) => {
		entityListLoading.value = !!val;
	},
	{ immediate: true }
);

watchEffect(() => {
	ganttLoading.value = !!(ganttRef.value?.loading && ganttRef.value.loading.value);
});
</script>

<style scoped lang="scss">
.search-box {
	background: #fff;
	margin: 10px;
	box-sizing: border-box;
	padding: 20px 20px 10px 10px;
	border-radius: 4px;
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	margin-bottom: 0;
	
	.search-row {
		display: flex;
		flex-wrap: wrap;
		gap: 20px;
		margin-bottom: 10px;
		
		&:last-child {
			margin-bottom: 0;
		}
		
		// 第一行：5个字段平均分配
		&:first-child .search-item {
			flex: 0 0 calc(20% - 16px);
			min-width: 0;
		}
		
		// 第二行：3个字段 + 按钮区域
		&:last-child {
			justify-content: space-between;
			
			.search-item {
				flex: 0 0 calc(20% - 16px);
				min-width: 0;
			}
			
			.search-buttons {
				flex: 0 0 calc(40% - 16px);
				display: flex;
				justify-content: flex-end;
				align-items: flex-end;
			}
		}
		
		.search-item {
			margin-bottom: 0;
		}
		
		.search-buttons {
			.el-button {
				margin-left: 10px;
				
				&:first-child {
					margin-left: 0;
				}
			}
		}
	}
	
	:deep(.el-form-item) {
		margin-bottom: 0;
	}
}

:deep(.customize-menu-list) {
	padding: 10px;
	.table-box {
		height: 359px;
		background: #fff;
		box-sizing: border-box;
		padding-top: 10px;
		.table-div {
			height: calc(100% - 41px) !important;
		}
	}
	.table-footer.bottom {
		bottom: 12px;
		padding: 0 10px;
		background: transparent;
		border: none;
		.el-pagination {
			background: #fff;
		}
	}
}
</style>
