<template>
	<div class="position-distribution-container">
		<!-- 左侧：仓库基本信息树 -->
		<div class="left-sidebar">
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
                                    style="margin-right: 2px;"
								>
									<el-icon><EditPen /></el-icon>
								</el-button>
								<el-button
									link
									type="primary"
									@click.stop="handleDelete(data)"
                                    style="margin-right: 2px;margin-left: 0;"
								>
									<el-icon><Delete /></el-icon>
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
		<div class="right-content">
			<div class="content-header">
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
				<div class="title-legend-row">
					<div class="warehouse-title">
						{{
							currentWarehouseTitle ||
							"显示 AGV入库仓库区域的仓位分布"
						}}
					</div>
					<div class="legend">
						<div class="legend-item">
							<span
								class="legend-color"
								style="background-color: #67c23a"
							></span>
							<span>有货</span>
						</div>
						<div class="legend-item">
							<span
								class="legend-color"
								style="background-color: #e6a23c"
							></span>
							<span>满仓</span>
						</div>
						<div class="legend-item">
							<span
								class="legend-color"
								style="
									background-color: #ffffff;
									border: 1px solid #dcdfe6;
								"
							></span>
							<span>空闲</span>
						</div>
						<div class="legend-item">
							<span
								class="legend-color"
								style="background-color: #f56c6c"
							></span>
							<span>停用</span>
						</div>
					</div>
				</div>
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
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";

// 树形数据
const treeData = ref([
	{
		id: "area1",
		label: "区域1",
		children: [],
	},
	{
		id: "area2",
		label: "区域2",
		children: [
			{
				id: "warehouse1",
				label: "普通存储仓库A",
				parentId: "area2",
			},
			{
				id: "warehouse2",
				label: "普通存储仓库B",
				parentId: "area2",
			},
		],
	},
	{
		id: "area3",
		label: "区域3",
		children: [
			{
				id: "warehouse3",
				label: "冷藏仓库",
				parentId: "area3",
			},
		],
	},
]);

const treeProps = {
	children: "children",
	label: "label",
};

const treeRef = ref(null);
const currentWarehouseId = ref(null);
const currentWarehouseTitle = ref("");

// 仓位数据
const slotList = ref([]);

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

// 树节点点击事件
const handleNodeClick = (data) => {
	// 只处理二级节点（仓库）
	if (!data.children || data.children.length === 0) {
		currentWarehouseId.value = data.id;
		currentWarehouseTitle.value = `显示 ${data.label}的仓位分布`;
		loadSlotData(data.id);
	}
};

// 加载仓位数据
const loadSlotData = (warehouseId) => {
	// 模拟数据，实际应该调用API
	// 根据warehouseId生成4行10列的仓位数据
	const slots = [];
	const rows = ["A", "B", "C", "D"];
	const statuses = ["inStock", "full", "idle", "disabled"];

	rows.forEach((row, rowIndex) => {
		for (let col = 1; col <= 10; col++) {
			const slotNum = String(col).padStart(2, "0");
			const statusIndex = (rowIndex * 10 + col - 1) % statuses.length;
			slots.push({
				id: `${warehouseId}_${row}-1-${slotNum}`,
				label: `${row}-1-${slotNum}`,
				status: statuses[statusIndex],
				warehouseId: warehouseId,
			});
		}
	});

	slotList.value = slots;
};

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
	console.log("点击仓位:", slot);
	// TODO: 跳转到仓位详情页
	ElMessage.info(`点击了仓位: ${slot.label}`);
};

// 新增
const handleAdd = () => {
	console.log("新增区域/仓库");
};

// 编辑
const handleEdit = (data) => {
	console.log("编辑仓库:", data);
};

// 删除
const handleDelete = async (data) => {
	try {
		await ElMessageBox.confirm(
			`确定要删除 "${data.label}" 吗？`,
			"删除确认",
			{
				confirmButtonText: "确定",
				cancelButtonText: "取消",
				type: "warning",
			}
		);
		// TODO: 调用删除API
		ElMessage.success("删除成功");
		// 刷新树数据
		// refreshTreeData();
	} catch {
		// 用户取消删除
	}
};

// 保存（如果需要的话可以保留，但当前不调用）
const handleSave = () => {
	console.log("保存");
};

// 初始化：默认加载第一个仓库的数据
onMounted(() => {
	// 查找第一个有子节点的区域
	const firstArea = treeData.value.find(
		(area) => area.children && area.children.length > 0
	);
	if (firstArea && firstArea.children.length > 0) {
		handleNodeClick(firstArea.children[0]);
	}
});
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
			height: 36px;
			line-height: 36px;
		}

		.tree-node-wrapper {
			display: flex;
			align-items: center;
			justify-content: space-between;
			width: 100%;

			.node-label {
				display: flex;
				align-items: center;
				flex: 1;

				.location-icon {
					margin-right: 6px;
					color: #409eff;
				}
			}

			.node-actions {
				display: none;
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
		justify-content: flex-end;
		align-items: center;
		padding: 15px;
		border-bottom: 1px solid #e4e7ed;
		flex-shrink: 0;
		min-height: 54px;
		box-sizing: border-box;
		background: #fff;

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
		.title-legend-row {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 20px;
			background: #fff;
			border: 1px solid #e4e7ed;
			border-radius: 4px;
			padding: 12px 15px;
		}

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
			grid-template-rows: repeat(4, 1fr);
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

:deep(.el-tree--highlight-current) {
	.el-tree-node__content {
		&::after {
			display: none;
		}
	}
	.el-tree-node.is-current {
		.el-tree-node__content {
			background: var(--el-tree-node-hover-bg-color);
		}
	}
}
</style>
