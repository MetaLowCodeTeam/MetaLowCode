<template>
	<ml-dialog
		title="手动排程"
		v-model="isShow"
		width="1200px"
		:show-close="!loading"
	>
		<div v-loading="loading" element-loading-text="加载中...">
			<el-table
				:data="dataList"
				border
				stripe
				style="width: 100%"
				:max-height="500"
			>
				<!-- 工单号 -->
				<el-table-column
					prop="taskOrderNo"
					label="工单号"
					width="150"
					fixed="left"
				/>

				<!-- 物料编码 -->
				<el-table-column
					prop="selectedProductName"
					label="物料编码"
					width="150"
				/>

				<!-- 数量 -->
				<el-table-column prop="taskQuantity" label="数量" width="100" />

				<!-- 工序 -->
				<el-table-column
					prop="selectedProcess"
					label="工序"
					width="120"
				/>

				<!-- 车间 -->
				<el-table-column prop="workshop" label="*车间" width="200">
					<template #default="{ row }">
						<reference-search-table-input
							v-model="row.workshop"
							:errorField="row.workshopIsError"
							@update:errorField="row.workshopIsError = $event"
							entity="ProcessTaskOrder"
							refField="workshop"
							:enableAdd="false"
							:enableSavePlanQuery="false"
						/>
					</template>
				</el-table-column>

				<!-- 设备 -->
				<el-table-column prop="equipment" label="*设备" width="200">
					<template #default="{ row }">
						<reference-search-table-input
							:extraFilter="row.equipmentSqlFilter"
							v-model="row.equipment"
							:errorField="row.equipmentIsError"
							@update:errorField="row.equipmentIsError = $event"
							entity="ProcessTaskOrder"
							refField="equipment"
							:onAppendButtonClick="
								() => handleEquipmentClick(row)
							"
							:enableAdd="false"
							:enableSavePlanQuery="false"
							showCheckBox
						/>
					</template>
				</el-table-column>

				<!-- 班组 -->
				<el-table-column prop="workTeam" label="*班组" width="200">
					<template #default="{ row }">
						<reference-search-table-input
							:extraFilter="row.workTeamSqlFilter"
							v-model="row.workTeam"
							:errorField="row.workTeamIsError"
							@update:errorField="row.workTeamIsError = $event"
							entity="ProcessTaskOrder"
							refField="workTeam"
							:onAppendButtonClick="
								() => handleWorkTeamClick(row)
							"
							:enableAdd="false"
							:enableSavePlanQuery="false"
							showCheckBox
						/>
					</template>
				</el-table-column>

				<!-- 计划开始时间 -->
				<el-table-column
					prop="expectedStartTime"
					label="*计划开始时间"
					width="200"
				>
					<template #default="{ row }">
						<el-date-picker
							v-model="row.expectedStartTime"
							type="datetime"
							placeholder="选择计划开始时间"
							style="width: 100%"
							value-format="YYYY-MM-DD HH:mm:ss"
							:class="{
								'is-error': row.expectedStartTimeIsError,
							}"
							@focus="row.expectedStartTimeIsError = false"
							:enableAdd="false"
							:enableSavePlanQuery="false"
						/>
					</template>
				</el-table-column>

				<!-- 计划结束时间 -->
				<el-table-column
					prop="expectedEndTime"
					label="*计划结束时间"
					width="200"
				>
					<template #default="{ row }">
						<el-date-picker
							v-model="row.expectedEndTime"
							type="datetime"
							placeholder="选择计划结束时间"
							style="width: 100%"
							value-format="YYYY-MM-DD HH:mm:ss"
							:class="{ 'is-error': row.expectedEndTimeIsError }"
							@focus="row.expectedEndTimeIsError = false"
						/>
					</template>
				</el-table-column>
			</el-table>
		</div>

		<template #footer>
			<el-button @click="closeDialog" :loading="loading">取消</el-button>
			<el-button type="primary" @click="confirmDialog" :loading="loading">
				保存
			</el-button>
		</template>
	</ml-dialog>
</template>

<script setup>
import { ElMessage } from "element-plus";
import ReferenceSearchTableInput from "@/components/mlReferenceSearch/reference-search-table-input.vue";
import { ref } from "vue";
import http from "@/utils/request";

const emit = defineEmits(["onRefresh"]);

let isShow = ref(false);

let dataList = ref([]);
let loading = ref(false);

const openDialog = (rows = []) => {
	let sourceData = rows.filter((item) => item.productionStatus?.value == 5);
	dataList.value = sourceData.map((item) => {
		return {
            processTaskOrderId: item.processTaskOrderId,
			// 工单号
			taskOrderNo: item.taskOrderNo,
			// 物料名称
			selectedProductName: item.selectedProduct?.name,
			// 数量
			taskQuantity: item.taskQuantity,
			// 工序
			selectedProcess: item.selectedProcess?.name,
			// 车间
			workshop: null,
			workshopIsError: false,
			// 设备（多选）
			equipment: [],
			equipmentIsError: false,
			// 班组（多选）
			workTeam: [],
			workTeamIsError: false,
			// 预计开始时间
			expectedStartTime: null,
			expectedStartTimeIsError: false,
			// 预计结束时间
			expectedEndTime: null,
			expectedEndTimeIsError: false,
		};
	});
	ElMessage.success(
		`共选中${rows.length}条数据，可编辑：${sourceData.length}条`
	);
	if (sourceData.length > 0) {
		isShow.value = true;
	}
};

const closeDialog = () => {
	isShow.value = false;
};

// 选设备
let equipmentReferST = ref(null);
const handleEquipmentClick = (row) => {
	let workshopId = row.workshop?.id;
	if (!workshopId) {
		ElMessage.error("请先选择车间");
		row.workshopIsError = true;
		return false;
	}
	row.equipmentSqlFilter = "deviceInfoId in (select toId from ReferenceListMap where fieldName = 'equipment' and objectId='" + workshopId + "' ) ";
    console.log(row.equipmentSqlFilter,'row.equipmentSqlFilter')
	return true;
};

// 选班组
let workTeamReferST = ref(null);
const handleWorkTeamClick = (row) => {
	let equipment = row.equipment;
	if (!equipment || equipment.length == 0) {
		ElMessage.error("请先选择设备");
		row.equipmentIsError = true;
		return false;
	}
	let idStr = equipment.map((item) => `'${item.id}'`).join(",");
    row.workTeamSqlFilter = "workingTeamId in (select toId from ReferenceListMap where fieldName = 'workingTeamId' and objectId in (" + idStr + ") ) ";
	console.log(row.workTeamSqlFilter,'row.workTeamSqlFilter')
	return true;
};

const confirmDialog = async () => {
	let hasError = false;

	// 循环验证数据
	dataList.value.forEach((row, index) => {
		// 验证引用类型字段：车间（单选）、设备/班组（多选）
		const referenceFields = [
			{
				field: "workshop",
				errorField: "workshopIsError",
				multiple: false,
			},
			{
				field: "equipment",
				errorField: "equipmentIsError",
				multiple: true,
			},
			{
				field: "workTeam",
				errorField: "workTeamIsError",
				multiple: true,
			},
		];

		referenceFields.forEach(({ field, errorField, multiple }) => {
			const value = row[field];
			let isInvalid = false;
			if (multiple) {
				isInvalid =
					!Array.isArray(value) ||
					value.length < 1 ||
					value.some(
						(item) =>
							!item || (typeof item === "object" && !item.id)
					);
			} else {
				isInvalid = !value || (typeof value === "object" && !value.id);
			}
			if (isInvalid) {
				row[errorField] = true;
				hasError = true;
			} else {
				row[errorField] = false;
			}
		});

		// 验证时间字段：计划开始时间、计划结束时间
		const timeFields = [
			{
				field: "expectedStartTime",
				errorField: "expectedStartTimeIsError",
			},
			{ field: "expectedEndTime", errorField: "expectedEndTimeIsError" },
		];

		timeFields.forEach(({ field, errorField }) => {
			// 判断字段不存在
			if (!row[field]) {
				row[errorField] = true;
				hasError = true;
			} else {
				row[errorField] = false;
			}
		});
	});

	// 如果有错误，提示用户
	if (hasError) {
		ElMessage.error("请完善数据");
		return;
	}

	// 验证通过，执行保存逻辑
	// console.log(dataList.value, "dataList.value");
	// isShow.value = false;
    loading.value = true;
	let res = await http.post(
		"/cm/call/gxrwplpc",
		{
            dataList: dataList.value.map(item => {
                return {
                    processTaskOrderId: item.processTaskOrderId,
                    expectedStartTime: item.expectedStartTime,
                    expectedEndTime: item.expectedEndTime,
                    workshop: item.workshop,
                    equipment: item.equipment,
                    workTeam: item.workTeam,
                }
            })
        }
	);
	if (res?.code == 200) {
		ElMessage.success("保存成功");
		isShow.value = false;
        emit("onRefresh");
	} 
    loading.value = false;
};

defineExpose({
	openDialog,
});
</script>

<style scoped>
/* 错误状态样式 */
:deep(.is-error) {
	border-color: #f56c6c !important;
}

:deep(.el-date-editor.is-error) {
	border-color: #f56c6c !important;
}

:deep(.el-date-editor.is-error .el-input__inner) {
	border-color: #f56c6c !important;
}
</style>
