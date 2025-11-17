<template>
	<div class="table-gantt-page">
		<div class="gantt-box">
			<vxe-gantt
				v-bind="ganttOptions"
				@toolbar-tool-click="toolbarToolClickEvent"
				v-on="ganttEvents"
			>
				<template #task-bar="{ row }">
					<div
						class="custom-task-bar"
						:style="{ backgroundColor: setRowBgColor(row) }"
					>
						<div class="yc" :title="row.start + ' - ' + row.end">
							{{ row.start }} - {{ row.end }}
						</div>
					</div>
				</template>
			</vxe-gantt>
		</div>
	</div>
</template>

<script setup>
import { ref, onMounted, reactive } from "vue";
import { VxeUI, VxeGantt } from "vxe-gantt";
import { crudListQuery } from "@/api/crud";
import "vxe-gantt/lib/style.css";

let buttonList = ref([
	{
		label: "月-日",
		value: "month-day",
		taskViewConfig: {
			scales: ["month", "date"],
		},
	},
	{
		label: "天-时",
		value: "day-time",
		taskViewConfig: {
			scales: ["date", "hour"],
		},
	},
]);

// 分页
const pagerVO = reactive({
	total: 0,
	currentPage: 1,
	pageSize: 20,
});

const defaultGanttOptions = ref({
	height: 377,
	loading: false,
	taskViewConfig: {},
	pagerConfig: pagerVO,
	border: true,
	size: "small",
	// 合并单元格配置
	// row: 起始行索引（从0开始）
	// col: 起始列索引（从0开始，0=生产工单号，1=班组，2=车间，3=设备，4=工序）
	// rowspan: 向下合并的行数
	// colspan: 向右合并的列数
	mergeCells: [
		// 示例：合并第1行（索引1）的生产工单号列，向下合并3行
		// { row: 1, col: 0, rowspan: 3, colspan: 1 },
		// 示例：合并第4行（索引4）的生产工单号列，向下合并4行
		// { row: 4, col: 0, rowspan: 4, colspan: 1 }
	],
	columnConfig: {
		resizable: true,
	},
	customConfig: {
		mode: "modal",
	},
	toolbarConfig: {
		tools: [
			{
				name: "月-日",
				code: "month-day",
				status: "primary",
				size: "small",
				taskViewConfig: {
					scales: ["month", "date"],
				},
			},
			{
				name: "天-时",
				code: "day-time",
				status: "default",
				size: "small",
				class: "mr-10",
				taskViewConfig: {
					scales: ["date", "hour"],
				},
			},
		],
	},
	taskBarConfig: {
		barStyle: {
			round: true,
		},
	},
	columns: [
		{
			field: "productionTask",
			title: "生产工单号",
		},
		{
			field: "workshop",
			title: "车间",
		},
		{
			field: "equipment",
			title: "设备",
		},
		{
			field: "workTeam",
			title: "班组",
		},
		{
			field: "selectedProcess.processName",
			title: "工序",
		},
	],
	data: [],
});

const allList = [];

let ganttOptions = ref({});
onMounted(() => {
	ganttOptions.value = JSON.parse(JSON.stringify(defaultGanttOptions.value));
	handlePageData();
});

// 根据状态设置行样式
const setRowBgColor = (row) => {
	const status = String(row.productionStatus ?? "");
	switch (status) {
		case "1":
		case "2":
			return "#01B3F6"; // 蓝色
		case "6":
			return "#808080"; // 灰色
		case "3":
			return "#00B342"; // 绿色
		case "7":
			return "#FF0000"; // 红色
		case "4":
			return "#FFBD01"; // 黄色
	}
};

// 工具栏点击事件
const toolbarToolClickEvent = (item) => {
	let sourceData = JSON.parse(JSON.stringify(ganttOptions.value.data));
	ganttOptions.value.taskViewConfig = item.tool.taskViewConfig;
	ganttOptions.value.toolbarConfig.tools.forEach((tool) => {
		if (tool.code === item.code) {
			tool.status = "primary";
		} else {
			tool.status = "default";
		}
	});
	ganttOptions.value.data = sourceData;
};

// 分页数据
const ganttEvents = {
	// 分页切换
	pageChange({ pageSize, currentPage }) {
		pagerVO.currentPage = currentPage;
		pagerVO.pageSize = pageSize;
		handlePageData();
	},
};

// 分页
const handlePageData = async () => {
	ganttOptions.value.loading = true;
	let fieldsList = defaultGanttOptions.value.columns
		.map((item) => item.field)
		.join(",");
	const { pageSize, currentPage } = pagerVO;
	let res = await crudListQuery({
		mainEntity: "ProcessTaskOrder",
		fieldsList:
			fieldsList + ",productionStatus,expectedStartTime,expectedEndTime",
		pageSize: pageSize,
		pageNo: currentPage,
		filters: {
			equation: "OR",
			items: [
				{
					fieldName: "productionStatus",
                    op: "NEQ",
                    value: "5"
				},
			],
		},
		sortFields: [{ fieldName: "productionTask", type: "DESC" }],
	});
	if (res?.code == 200) {
		let dataList = res.data.dataList || [];
		dataList = dataList.map((el) => {
			el.productionTask = el.productionTask?.name;
			el.workTeam = el.workTeam?.name;
			el.workshop = el.workshop?.name;
			el.equipment = el.equipment?.name;
			el.start = el.expectedStartTime;
			el.end = el.expectedEndTime;
			el.productionStatus = el.productionStatus.value;
			return el;
		});

		// 自动计算合并单元格（分层合并）
		// 列索引：0=生产工单号, 1=车间, 2=设备, 3=班组, 4=工序（不合并）
		// 合并规则：优先工单分组，工单分组后车间，车间分组后设备，设备分组后班组
		let mergeCells = [];

		if (dataList.length > 0) {
			// 标准化值函数
			const normalizeValue = (value) => {
				return value === undefined || value === null ? "" : String(value);
			};

			// 获取指定列的值
			const getColumnValue = (row, col) => {
				if (col === 0) return normalizeValue(row.productionTask);
				if (col === 1) return normalizeValue(row.workshop);
				if (col === 2) return normalizeValue(row.equipment);
				if (col === 3) return normalizeValue(row.workTeam);
				return "";
			};

			// 检查从startRow到endRow（不包括endRow）之间的所有行，是否所有上层列的值都相同
			const checkParentColumnsSame = (startRow, endRow, currentCol) => {
				for (let parentCol = 0; parentCol < currentCol; parentCol++) {
					const firstValue = getColumnValue(dataList[startRow], parentCol);
					for (let i = startRow + 1; i < endRow; i++) {
						if (getColumnValue(dataList[i], parentCol) !== firstValue) {
							return false;
						}
					}
				}
				return true;
			};

			// 检查从startRow到endRow，当前列和所有上层列的值是否都相同
			const canMerge = (startRow, endRow, col) => {
				if (endRow - startRow < 2) return false;
				
				// 检查当前列的值是否相同
				const currentColValue = getColumnValue(dataList[startRow], col);
				for (let i = startRow + 1; i < endRow; i++) {
					if (getColumnValue(dataList[i], col) !== currentColValue) {
						return false;
					}
				}
				
				// 检查所有上层列的值是否相同
				return checkParentColumnsSame(startRow, endRow, col);
			};

			// 检查上层列是否发生变化（从上一行到当前行）
			const parentColumnsChanged = (prevIndex, currIndex, currentCol) => {
				for (let parentCol = 0; parentCol < currentCol; parentCol++) {
					const prevValue = getColumnValue(dataList[prevIndex], parentCol);
					const currValue = getColumnValue(dataList[currIndex], parentCol);
					if (prevValue !== currValue) {
						return true;
					}
				}
				return false;
			};

			// 对每一列进行分层合并
			for (let col = 0; col < 4; col++) {
				let startRow = 0;
				let startColValue = getColumnValue(dataList[0], col);

				for (let index = 1; index < dataList.length; index++) {
					const currColValue = getColumnValue(dataList[index], col);
					
					// 检查是否需要结束当前合并组
					// 如果当前列的值变化了，或者上层列的值变化了
					const shouldEndMerge = currColValue !== startColValue || 
						(index > startRow && parentColumnsChanged(index - 1, index, col));
					
					if (shouldEndMerge) {
						// 如果之前有连续相同的行（>=2行），且满足合并条件
						if (canMerge(startRow, index, col)) {
							mergeCells.push({
								row: startRow,
								col: col,
								rowspan: index - startRow,
								colspan: 1,
							});
						}
						// 开始新的连续区域
						startRow = index;
						startColValue = currColValue;
					}
				}

				// 处理最后一段连续区域
				if (canMerge(startRow, dataList.length, col)) {
					mergeCells.push({
						row: startRow,
						col: col,
						rowspan: dataList.length - startRow,
						colspan: 1,
					});
				}
			}
		}

		pagerVO.total = res.data.pagination.total;
		ganttOptions.value.mergeCells = mergeCells;
		ganttOptions.value.pagerConfig = pagerVO;
		ganttOptions.value.data = dataList;
	}
	ganttOptions.value.loading = false;
};
</script>
<style lang="scss" scoped>
.table-gantt-page {
	padding: 10px 10px;
    padding-top: 0;
	box-sizing: border-box;
	height: 100%;
}
.gantt-box {
	.gantt-header {
		height: 30px;
		line-height: 30px;
		text-align: right;
	}
}
.custom-task-bar {
	box-sizing: border-box;
	width: 100%;
	text-align: center;
	box-sizing: border-box;
	padding: 0 10px;
	.yc {
		// 超出显示...
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
}
:deep(.mr-10) {
	margin-right: 10px !important;
}
:deep(.vxe-gantt--pager-wrapper) {
    .vxe-pager {
        text-align: center;
    }
}
</style>
