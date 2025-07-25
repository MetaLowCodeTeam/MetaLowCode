<template>
	<div class="filter-node">
		<!-- 条件组节点 -->
		<div v-if="nodeData.type === 'group'" class="group-node">
			<div class="node-row">
				<!-- 左侧连接符 -->
				<div class="left-connector">
					<el-select
						v-if="showConnector"
						v-model="nodeData.connector"
						size="small"
						class="connector-select"
						@change="onNodeChange"
					>
						<el-option label="AND" value="AND" />
						<el-option label="OR" value="OR" />
					</el-select>
					<div v-else class="connector-placeholder"></div>
				</div>

				<!-- 条件组卡片 -->
				<div class="node-content">
					<el-card class="group-card" shadow="hover">
						<template #header>
							<div class="group-header">
								<div class="group-info">
									<el-icon class="group-icon"
										><Folder
									/></el-icon>
									<span>条件组</span>
									<el-tag size="small" type="info"
										>{{
											nodeData.children?.length || 0
										}}
										项</el-tag
									>
								</div>
								<div class="group-actions">
									<el-dropdown @command="handleAddCommand">
										<el-button type="primary" size="small">
											<el-icon><Plus /></el-icon>
											添加
											<el-icon class="el-icon--right"
												><ArrowDown
											/></el-icon>
										</el-button>
										<template #dropdown>
											<el-dropdown-menu>
												<el-dropdown-item
													command="condition"
												>
													<el-icon
														><Document
													/></el-icon>
													添加条件
												</el-dropdown-item>
												<el-dropdown-item
													command="group"
												>
													<el-icon
														><Folder
													/></el-icon>
													添加条件组
												</el-dropdown-item>
											</el-dropdown-menu>
										</template>
									</el-dropdown>
									<el-button
										type="danger"
										size="small"
										@click="removeNode"
										:disabled="!canRemove"
									>
										<el-icon><Delete /></el-icon>
									</el-button>
								</div>
							</div>
						</template>

						<div class="group-content">
							<div
								v-if="
									!nodeData.children ||
									nodeData.children.length === 0
								"
								class="empty-group"
							>
								<el-empty
									description="暂无条件"
									:image-size="60"
								/>
							</div>
							<div v-else class="children-container">
								<!-- 子节点容器 -->
								<div class="group-children-container">
									<!-- 逻辑选择器（垂直居中显示） -->
									<div
										v-if="nodeData.children.length > 1"
										class="logic-selector-wrapper"
									>
										<el-select
											v-model="nodeData.childrenLogic"
											size="small"
											class="children-logic-select"
											@change="onChildrenLogicChange"
										>
											<el-option
												label="AND"
												value="AND"
											/>
											<el-option label="OR" value="OR" />
										</el-select>
									</div>

									<!-- 子节点列表 -->
									<div class="children-list">
										<div
											v-for="child in nodeData.children"
											:key="child.id"
											class="child-item"
										>
											<!-- 子节点内容 -->
											<div class="child-content">
												<FilterNode
													:node-data="child"
													:field-options="
														fieldOptions
													"
													:operator-options="
														operatorOptions
													"
													:depth="depth + 1"
													:show-connector="false"
													:can-remove="
														nodeData.children
															.length > 1 ||
														canRemove
													"
													@change="onChildChange"
													@remove="removeChild"
												/>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</el-card>
				</div>
			</div>
		</div>

		<!-- 条件节点 -->
		<div v-else-if="nodeData.type === 'condition'" class="condition-node">
			<div class="node-row">
				<!-- 左侧连接符 -->
				<div class="left-connector">
					<el-select
						v-if="showConnector"
						v-model="nodeData.connector"
						size="small"
						class="connector-select"
						@change="onNodeChange"
					>
						<el-option label="AND" value="AND" />
						<el-option label="OR" value="OR" />
					</el-select>
					<div v-else class="connector-placeholder"></div>
				</div>

				<!-- 条件卡片 -->
				<div class="node-content">
					<el-card class="condition-card" shadow="hover">
						<div class="condition-content">
							<div class="condition-header" v-if="false">
								<el-icon class="condition-icon"
									><Document
								/></el-icon>
								<span>条件</span>
							</div>

							<div class="condition-form">
								<el-select
									v-model="nodeData.field"
									placeholder="请选择字段"
									class="field-select"
									@change="
										onSelectFieldChange(nodeData.field)
									"
								>
									<el-option-group
										v-for="group in fieldOptions"
										:key="group.label"
										:label="group.label"
									>
										<el-option
											v-for="field in group.options"
											:key="field.value"
											:label="field.label"
											:value="field.value"
										/>
									</el-option-group>
								</el-select>

								<el-select
									v-model="nodeData.operator"
									placeholder="请选择操作符"
									class="operator-select"
									@change="onNodeChange"
								>
									<el-option
										v-for="op in operatorOptions"
										:key="op.value"
										:label="op.label"
										:value="op.value"
									/>
								</el-select>

								<el-input
									v-if="!isEmptyOperator"
									v-model="nodeData.value"
									placeholder="请输入值"
									class="value-input"
									@input="onNodeChange"
								/>

								<el-button
									type="danger"
									size="small"
									@click="removeNode"
									:disabled="!canRemove"
								>
									<el-icon><Delete /></el-icon>
								</el-button>
							</div>
						</div>
					</el-card>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
// 配置文件
import conditionsConfig from "@/config/conditionsConfig";
export default {
	name: "FilterNode",
	props: {
		nodeData: {
			type: Object,
			required: true,
		},
		fieldOptions: {
			type: Array,
			default: () => [],
		},
		operatorOptions: {
			type: Array,
			default: () => [],
		},
		depth: {
			type: Number,
			default: 0,
		},
		showConnector: {
			type: Boolean,
			default: false,
		},
		canRemove: {
			type: Boolean,
			default: true,
		},
	},
	emits: ["change", "remove"],
	data() {
		return {
			idCounter: Date.now(),
			formFieldMapping: {
				input: "Text",
				textarea: "TextArea",
				radio: "Boolean",
				number: "Integer",
				select: "Option",
				"check-tag": "Tag",
				date: "Date",
				reference: "Reference",
				"reference-list": "ReferenceList",
				"outer-reference": "OuterReference",
			},
		};
	},
	computed: {
		isEmptyOperator() {
			return ["isEmpty", "isNotEmpty"].includes(this.nodeData.operator);
		},
	},
	methods: {
		generateId() {
			return ++this.idCounter;
		},
		onNodeChange() {
			this.$emit("change");
		},
		// 选择字段触发
		onSelectFieldChange(field) {
			// 1. 取当前选择的字段
			// 从分组选项中查找字段
			let selectField = null;
			for (let group of this.fieldOptions) {
				if (group.options) {
					selectField = group.options.find(
						(item) => item.value === field
					);
					if (selectField) break;
				}
			}
            let fieldValue = field.split('_')[1];
            console.log(selectField,'selectField')
            console.log(fieldValue,'fieldValue')
			// // 2. 取当前字段类型
			// let fieldType = this.formFieldMapping[selectField.type];
			// console.log(fieldType, "fieldType");
			// // 3. 取当前字段类型对应的条件op
			// let op = conditionsConfig[fieldType];
			// console.log(op, "op");
			// // console.log(formFieldMapping[selectField.type],'selectField.type')
			// console.log(conditionsConfig, "conditionsConfig");
			// // console.log(selectField,'selectField')
			this.onNodeChange();
			//
		},

		onChildChange() {
			this.$emit("change");
		},
		removeNode() {
			this.$emit("remove", this.nodeData.id);
		},
		onChildrenLogicChange() {
			if (!this.nodeData.childrenLogic) {
				this.nodeData.childrenLogic = "AND";
			}
			this.onNodeChange();
		},
		removeChild(childId) {
			if (this.nodeData.children) {
				const index = this.nodeData.children.findIndex(
					(child) => child.id === childId
				);
				if (index > -1) {
					this.nodeData.children.splice(index, 1);
					this.onNodeChange();
				}
			}
		},
		handleAddCommand(command) {
			if (!this.nodeData.children) {
				this.nodeData.children = [];
			}
			if (!this.nodeData.childrenLogic) {
				this.nodeData.childrenLogic = "AND";
			}
			if (command === "condition") {
				this.addCondition();
			} else if (command === "group") {
				this.addGroup();
			}
		},
		addCondition() {
			const newCondition = {
				id: this.generateId(),
				type: "condition",
				connector: "AND",
				field: "",
				operator: "",
				value: "",
			};
			this.nodeData.children.push(newCondition);
			this.onNodeChange();
		},
		addGroup() {
			const newGroup = {
				id: this.generateId(),
				type: "group",
				connector: "AND",
				childrenLogic: "AND",
				children: [],
			};
			this.nodeData.children.push(newGroup);
			this.onNodeChange();
		},
	},
};
</script>

<style scoped>
.filter-node {
	margin-bottom: 12px;
}

/* 节点行布局 */
.node-row {
	display: flex;
	align-items: flex-start;
	gap: 12px;
}

/* 左侧连接符区域 */
.left-connector {
	display: flex;
	flex-direction: column;
	align-items: center;
	min-width: 20px;
	padding-top: 20px;
}

.connector-select {
	width: 70px;
	margin-bottom: 8px;
}

.connector-placeholder {
	width: 20px;
	height: 32px;
}

/* 节点内容区域 */
.node-content {
	flex: 1;
	position: relative;
}

/* 树形连接线 */
.left-connector::after {
	content: "";
	position: absolute;
	top: 50px;
	left: 50%;
	width: 12px;
	height: 2px;
	background-color: #dcdfe6;
	transform: translateX(-50%);
}

.filter-node:not(:last-child) .left-connector::before {
	content: "";
	position: absolute;
	top: 50px;
	left: 50%;
	width: 2px;
	height: calc(100% + 12px);
	background-color: #dcdfe6;
	transform: translateX(-50%);
}

/* 条件组样式 */
.group-node {
	position: relative;
}

.group-card {
	border: 2px solid #e4e7ed;
	transition: all 0.3s;
}

.group-card:hover {
	border-color: #409eff;
	box-shadow: 0 4px 12px rgba(64, 158, 255, 0.15);
}

.group-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.group-info {
	display: flex;
	align-items: center;
	gap: 8px;
}

.group-icon {
	color: #409eff;
	font-size: 16px;
}

.group-actions {
	display: flex;
	gap: 8px;
}

.group-content {
	min-height: 60px;
}

.empty-group {
	display: flex;
	justify-content: center;
	align-items: center;
	min-height: 120px;
}

.children-container {
	padding-left: 0;
	margin-top: 16px;
	position: relative;
}

/* 条件组子节点容器 */
.group-children-container {
	display: flex;
	align-items: stretch;
	gap: 8px;
	position: relative;
	margin-top: 12px;
}

/* 逻辑选择器（垂直居中） */
.logic-selector-wrapper {
	display: flex;
	align-items: center;
	position: relative;
	z-index: 10;
	/*
  background-color: #f0f9ff;
  border: 2px solid #409eff;
  border-radius: 10px;
  padding: 6px 10px;
  gap: 6px;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
   */

	white-space: nowrap;
}

.children-logic-select {
	width: 70px;
}

.children-logic-select .el-input__wrapper {
	background-color: rgba(255, 255, 255, 0.95);
	border: 1px solid #409eff;
	border-radius: 6px;
}

/* 子节点列表 */
.children-list {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 8px;
}

.child-item {
	display: flex;
	align-items: center;
	position: relative;
}

/* 子节点内容 */
.child-content {
	flex: 1;
	min-width: 0;
}

/* 条件样式 */
.condition-node {
	position: relative;
}

.condition-card {
	border: 2px solid #f0f0f0;
	transition: all 0.3s;
}

.condition-card:hover {
	border-color: #67c23a;
	box-shadow: 0 2px 8px rgba(103, 194, 58, 0.15);
}

.condition-content {
	display: flex;
	flex-direction: column;
	gap: 12px;
}

.condition-header {
	display: flex;
	align-items: center;
	gap: 8px;
	font-weight: 500;
}

.condition-icon {
	color: #67c23a;
	font-size: 16px;
}

.condition-form {
	display: flex;
	align-items: center;
	gap: 12px;
	flex-wrap: wrap;
}

.field-select {
	width: 150px;
}

.operator-select {
	width: 120px;
}

.value-input {
	width: 200px;
}

/* 深度样式 - 根据深度调整颜色 */
.group-node .group-card {
	border-color: #409eff;
	background-color: #f0f9ff;
}

.condition-node .condition-card {
	border-color: #67c23a;
	background-color: #f0f9f0;
}

/* 连接符样式增强 */
.connector-select .el-input__wrapper {
	border-radius: 20px;
	font-weight: 600;
	text-align: center;
}

.connector-select .el-select__placeholder {
	text-align: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
	.node-row {
		flex-direction: column;
		gap: 8px;
	}

	.left-connector {
		flex-direction: row;
		justify-content: center;
		min-width: auto;
		padding-top: 0;
		padding-bottom: 8px;
	}

	.left-connector::after,
	.left-connector::before {
		display: none;
	}

	.condition-form {
		flex-direction: column;
		align-items: stretch;
	}

	.field-select,
	.operator-select,
	.value-input {
		width: 100%;
	}

	.group-header {
		flex-direction: column;
		gap: 12px;
		align-items: stretch;
	}

	.group-actions {
		justify-content: center;
	}

	.connector-select {
		width: 60px;
	}

	/* 移动端条件组布局调整 */
	.group-children-container {
		flex-direction: column;
		gap: 10px;
	}

	.logic-selector-wrapper {
		align-self: center;
		margin-bottom: 10px;
	}

	.logic-selector-wrapper {
		padding: 6px 10px;
	}

	.children-logic-select {
		transform: none;
		width: 70px;
	}

	.tree-connector {
		display: none;
	}
}

/* 动画效果 */
.filter-node {
	animation: fadeInLeft 0.3s ease;
}

@keyframes fadeInLeft {
	from {
		opacity: 0;
		transform: translateX(-20px);
	}
	to {
		opacity: 1;
		transform: translateX(0);
	}
}

/* 连接线悬停效果 */
.node-row:hover .left-connector::after {
	background-color: #409eff;
}

.node-row:hover .left-connector::before {
	background-color: #409eff;
}
</style>
