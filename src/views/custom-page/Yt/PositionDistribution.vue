<template>
	<div class="position-distribution-container">
		<!-- 左侧：仓库基本信息树 -->
		<div
			class="left-sidebar"
			v-loading="treeLoading"
			element-loading-text="加载中..."
		>
			<div class="sidebar-header">
				<h3>仓库基本信息</h3>
			</div>
			<div class="tree-container">
				<el-tree
					ref="treeRef"
					:data="treeData"
					:props="treeProps"
					node-key="id"
					highlight-current
					@node-click="handleNodeClick"
					default-expand-all
				>
					<template #default="{ node, data }">
						<div class="tree-node-wrapper">
							<span class="node-label">
								<el-icon
									v-if="
										!data.children ||
										data.children.length === 0
									"
									class="location-icon"
								>
									<ElIconLocation />
								</el-icon>
								<span>{{ node.label }}</span>
							</span>
							<!-- 二级节点显示编辑和删除按钮 -->
							<span
								v-if="node.level === 2"
								class="node-actions"
								@click.stop
							>
								<el-button
									link
									type="primary"
									@click.stop="handleEdit(data)"
									style="margin-right: 2px"
								>
									<el-icon><EditPen /></el-icon>
								</el-button>
							</span>
						</div>
					</template>
				</el-tree>
			</div>
			<div class="sidebar-footer">
				<span class="add-button" @click="handleAdd">
					<el-icon class="add-icon"><ElIconPlus /></el-icon>
					<span class="add-text">新增区域/仓库</span>
				</span>
			</div>
		</div>

		<!-- 右侧：仓位分布 -->
		<div
			class="right-content"
			v-loading="slotLoading"
			element-loading-text="加载中..."
		>
			<div class="content-header">
                <div class="header-left">
                    <span class="warehouse-title">{{ currentWarehouseTitle }}</span>
                </div>
				<div class="header-right">
					<div class="status-summary">
						<div class="status-item">
							<span class="status-circle status-green">
								<el-icon class="status-icon-inner"
									><ElIconCheck
								/></el-icon>
							</span>
							<span>有货: {{ statusCounts.inStock }}</span>
						</div>
						<div class="status-item">
							<span class="status-circle status-orange"></span>
							<span>满仓: {{ statusCounts.full }}</span>
						</div>
						<div class="status-item">
							<span class="status-circle status-white"></span>
							<span>空闲: {{ statusCounts.idle }}</span>
						</div>
						<div class="status-item">
							<span class="status-circle status-red">
								<el-icon class="status-icon-inner"
									><ElIconClose
								/></el-icon>
							</span>
							<span>停用: {{ statusCounts.disabled }}</span>
						</div>
					</div>
				</div>
			</div>
			<div class="slot-grid-container">
				<div class="slot-grid">
					<div
						v-for="slot in slotList"
						:key="slot.id"
						class="slot-cell"
						:class="getSlotClass(slot.status)"
						@click="handleSlotClick(slot)"
					>
						<span class="slot-label">{{ slot.label }}</span>
					</div>
				</div>
			</div>
		</div>
	</div>
	<mlCustomEdit
		ref="editRefs"
		entityName="BasicInformationoftheWarehouse"
		@saveFinishCallBack="onLoadTreeData"
	/>
	<mlCustomDetail
		ref="detailRefs"
		entityName="WarehouseLocationInformation"
		@updateData="() => {}"
	/>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { crudListQuery } from "@/api/crud";
import http from "@/utils/request";
import mlCustomDetail from "@/components/mlCustomDetail/index.vue";
import mlCustomEdit from "@/components/mlCustomEdit/index.vue";
// 树形数据
const treeData = ref([]);

const treeProps = {
	children: "children",
	label: "label",
};
// 编辑组件
let editRefs = ref(null);
// 详情组件
let detailRefs = ref(null);
const treeRef = ref(null);
const currentWarehouseId = ref(null);
const currentWarehouseTitle = ref("");

// 仓位数据
const slotList = ref([]);

let treeLoading = ref(false);
let slotLoading = ref(false);

// 初始化：
onMounted(() => {
	onLoadTreeData('inStock');
});

// 加载树数据
const onLoadTreeData = async (status) => {
	treeLoading.value = true;
	let res = await crudListQuery({
		mainEntity: "BasicInformationoftheWarehouse",
		pageSize: 99999,
		pageNo: 1,
	});
	if (res?.code == 200) {
		let dataList = res.data.dataList || [];

		// 按 region?.label 分组
		const groupedData = {};
		dataList.forEach((item) => {
			const regionLabel = item.region?.label || "未分组";
			if (!groupedData[regionLabel]) {
				groupedData[regionLabel] = [];
			}
			groupedData[regionLabel].push(item);
		});

		// 转换为树形结构
		const formattedTreeData = Object.keys(groupedData).map(
			(regionLabel, index) => {
				const warehouses = groupedData[regionLabel];
				return {
					id: `region_${index}_${regionLabel}`,
					label: regionLabel,
					children: warehouses.map((warehouse, wIndex) => ({
						id:
							warehouse.basicInformationoftheWarehouseId ||
							`warehouse_${index}_${wIndex}`,
						label: warehouse.warehouseName || "未命名仓库",
						rawData: warehouse, // 保存原始数据，用于后续操作
					})),
				};
			}
		);

		treeData.value = formattedTreeData;

		// 默认加载第一个仓库的数据
		if (
			formattedTreeData.length > 0 &&
			formattedTreeData[0].children.length > 0
            && status == 'inStock'
		) {
			const firstWarehouse = formattedTreeData[0].children[0];
			handleNodeClick(firstWarehouse);
		}
	}
	treeLoading.value = false;
};

// 树节点点击事件
const handleNodeClick = (data) => {
	// 只处理二级节点（仓库）
	if (!data.children || data.children.length === 0) {
		currentWarehouseId.value = data.id;
		currentWarehouseTitle.value = `${data.label}的仓位`;
		// 使用原始数据中的ID或当前节点ID
		const warehouseId = data.rawData?.basicInformationoftheWarehouseId;
		loadSlotData(warehouseId);
	}
};

// 状态值映射：locationStatus.value -> 内部状态
const mapStatusValue = (statusValue) => {
	// 根据状态值映射
	// 2: 停用, 3: 有货, 4: 满仓, 5: 空闲, else: 停用
	const statusMap = {
		2: "disabled", // 停用
		3: "inStock", // 有货
		4: "full", // 满仓
		5: "idle", // 空闲
	};

	// 如果 statusValue 是 null 或 undefined，或者不在映射表中，返回停用
	if (statusValue === null || statusValue === undefined) {
		return "disabled";
	}

	return statusMap[statusValue] || "disabled";
};

// 加载仓位数据
const loadSlotData = async (basicInformationoftheWarehouseId) => {
	if (!basicInformationoftheWarehouseId) {
		slotList.value = [];
		return;
	}
	slotLoading.value = true;
	let res = await http.post("/cm/call/storageLocations", {
		basicInformationoftheWarehouseId,
	});
	if (res?.code == 200) {
		let dataList = res.data || [];

		// 转换为网格数据格式
		const slots = dataList.map((item) => {
			// 映射状态：locationStatus.value 是状态值，null 表示停用
			const status = mapStatusValue(item.locationStatus?.value);

			return {
				id: item.warehouseLocationInformationId,
				label: item.locationSeqNo || "未编号", // 编号使用 locationSeqNo
				status: status,
				warehouseId: basicInformationoftheWarehouseId,
				rawData: item, // 保存原始数据
			};
		});

		slotList.value = slots;
	} else {
		slotList.value = [];
	}
	slotLoading.value = false;
};

// 状态统计
const statusCounts = computed(() => {
	const counts = {
		inStock: 0,
		full: 0,
		idle: 0,
		disabled: 0,
	};
	slotList.value.forEach((slot) => {
		if (slot.status === "inStock") counts.inStock++;
		else if (slot.status === "full") counts.full++;
		else if (slot.status === "idle") counts.idle++;
		else if (slot.status === "disabled") counts.disabled++;
	});
	return counts;
});

// 获取仓位样式类
const getSlotClass = (status) => {
	const classMap = {
		inStock: "slot-in-stock",
		full: "slot-full",
		idle: "slot-idle",
		disabled: "slot-disabled",
	};
	return classMap[status] || "slot-idle";
};

// 仓位点击事件
const handleSlotClick = (slot) => {
	// 跳转到仓位详情页，传递 warehouseLocationInformationId
	if (slot.rawData?.warehouseLocationInformationId && detailRefs.value) {
		detailRefs.value.openDialog(
			slot.rawData.warehouseLocationInformationId
		);
	}
};

// 新增
const handleAdd = () => {
	let tempV = {};
	editRefs.value.openDialog({
		entityName: "BasicInformationoftheWarehouse",
	});
};

// 编辑
const handleEdit = (data) => {
	// 使用原始数据
	if (data.rawData) {
		console.log("原始数据:", data.rawData);
	}
	let tempV = {
		entityName: "BasicInformationoftheWarehouse",
		detailId: data.rawData?.basicInformationoftheWarehouseId,
	};
	editRefs.value.openDialog(tempV);
};

</script>

<style lang="scss" scoped>
.position-distribution-container {
	display: flex;
	height: 100%;
	background: #f5f7fa;
	gap: 0;
	align-items: stretch;
	overflow: hidden;
}

.left-sidebar {
	width: 240px;
	height: 100%;
	background: #fff;
	display: flex;
	flex-direction: column;
	border-radius: 4px 0 0 4px;
	min-height: 0;
	align-self: stretch;
	overflow: hidden;

	.sidebar-header {
		padding: 15px;
		border-bottom: 1px solid #e4e7ed;
		flex-shrink: 0;
		display: flex;
		align-items: center;
		height: 54px;
		box-sizing: border-box;

		h3 {
			margin: 0;
			font-size: 16px;
			font-weight: 500;
			color: #303133;
			line-height: 1;
		}
	}

	.tree-container {
		flex: 0 1 auto;
		overflow-y: auto;
		padding: 10px;
		min-height: 0;
		max-height: calc(100% - 54px - 72px);
		border-right: none;
		:deep(.el-tree-node__content) {
			min-height: 36px;
			height: auto;
			line-height: 1.5;
			padding: 6px 0;
		}

		.tree-node-wrapper {
			display: flex;
			align-items: flex-start;
			justify-content: space-between;
			width: 100%;

			.node-label {
				display: flex;
				align-items: flex-start;
				flex: 1;
				min-width: 0;

				.location-icon {
					margin-right: 6px;
					color: #409eff;
					flex-shrink: 0;
					margin-top: 2px;
				}

				span {
					white-space: normal;
					word-break: break-word;
					word-wrap: break-word;
					line-height: 1.5;
				}
			}

			.node-actions {
				display: none;
				flex-shrink: 0;
				align-self: flex-start;
				margin-left: 8px;
			}
		}

		:deep(.el-tree-node__content:hover) {
			.node-actions {
				display: block;
			}
		}
	}

	.sidebar-footer {
		padding: 15px;
		box-sizing: border-box;
		height: 72px;
		flex-shrink: 0;
		display: flex;
		align-items: center;

		.add-button {
			display: flex;
			align-items: center;
			justify-content: center;
			gap: 6px;
			width: 100%;
			box-sizing: border-box;
			padding: 10px;
			background: #fff;
			border: 1px dashed #dcdfe6;
			border-radius: 4px;
			cursor: pointer;
			transition: all 0.2s;
			color: #909399;
			font-size: 14px;

			.add-icon {
				font-size: 16px;
				color: #909399;
			}

			.add-text {
				color: #909399;
				user-select: none;
			}

			&:hover {
				border-color: #c0c4cc;
				color: #606266;

				.add-icon,
				.add-text {
					color: #606266;
				}
			}
		}
	}
}

.right-content {
	flex: 1;
	height: 100%;
	display: flex;
	flex-direction: column;
	background: #fafafa;
	border-radius: 0 4px 4px 0;
	min-height: 0;
	align-self: stretch;
	overflow: hidden;
	border-left: 1px solid #e4e7ed;
	.content-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 15px;
		border-bottom: 1px solid #e4e7ed;
		flex-shrink: 0;
		height: 54px;
		box-sizing: border-box;
		background: #fff;

		.header-left {
			display: flex;
			align-items: center;

			.warehouse-title {
				font-size: 14px;
				font-weight: 600;
				color: #303133;
				text-align: left;
			}
		}

		.header-right {
			.status-summary {
				display: flex;
				gap: 20px;

				.status-item {
					display: flex;
					align-items: center;
					gap: 8px;
					font-size: 14px;
					color: #606266;

					.status-circle {
						width: 16px;
						height: 16px;
						border-radius: 50%;
						display: inline-flex;
						align-items: center;
						justify-content: center;
						flex-shrink: 0;

						&.status-green {
							background-color: #67c23a;

							.status-icon-inner {
								color: #fff;
								font-size: 10px;
							}
						}

						&.status-orange {
							background-color: #e6a23c;
						}

						&.status-white {
							background-color: #ffffff;
							border: 1px solid #dcdfe6;
						}

						&.status-red {
							background-color: #f56c6c;

							.status-icon-inner {
								color: #fff;
								font-size: 10px;
							}
						}
					}
				}
			}
		}
	}

	.slot-grid-container {
		flex: 1;
		overflow-y: auto;
		padding: 20px;

		.warehouse-title {
			font-size: 14px;
			font-weight: 500;
			color: #303133;
		}

		.legend {
			display: flex;
			gap: 20px;

			.legend-item {
				display: flex;
				align-items: center;
				gap: 6px;
				font-size: 12px;
				color: #606266;

				.legend-color {
					width: 16px;
					height: 16px;
					border-radius: 2px;
				}
			}
		}

		.slot-grid {
			display: grid;
			grid-template-columns: repeat(10, 1fr);
			gap: 10px;

			.slot-cell {
				aspect-ratio: 1;
				border: 1px solid #dcdfe6;
				border-radius: 4px;
				display: flex;
				align-items: center;
				justify-content: center;
				cursor: pointer;
				transition: all 0.2s;
				min-height: 60px;

				.slot-label {
					font-size: 12px;
					font-weight: 500;
					color: #303133;
				}

				&.slot-in-stock {
					background-color: #67c23a;
					border-color: #67c23a;

					.slot-label {
						color: #fff;
					}
				}

				&.slot-full {
					background-color: #e6a23c;
					border-color: #e6a23c;

					.slot-label {
						color: #fff;
					}
				}

				&.slot-idle {
					background-color: #ffffff;
					border-color: #dcdfe6;
				}

				&.slot-disabled {
					background-color: #f56c6c;
					border-color: #f56c6c;

					.slot-label {
						color: #fff;
					}
				}

				&:hover {
					transform: scale(1.05);
					box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
				}
			}
		}

		.help-text {
			font-size: 12px;
			color: #f56c6c;
			text-align: center;
		}
	}
}

</style>
