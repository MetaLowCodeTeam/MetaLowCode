<template>
	<div class="reference-search-main">
		<div
			class="reference-search-table"
			v-loading="loading"
			:element-loading-text="loadingText"
		>
			<div v-if="isSingleCheck">
				<div class="work-flow-conditions w-100">
					<div class="head-selector-container">
						<el-input style="width: 100%;" v-model="filterText" placeholder="输入关键字过滤" clearable>
						</el-input>
					</div>
				</div>
				<div class="user-single-selector-container">
					<el-tree
						ref="treeRef"
						class="tree"
						:data="treeData"
						:props="defaultProps"
						node-key="id"
						highlight-current
						:check-strictly="isSingleCheck"
						:default-checked-keys="checkedKeys"
						:filter-node-method="filterNode"
						:default-expanded-keys="expandedKeys"
						@node-click="handleNodeClick"
                        :empty-text="hasDepartmentField ? '暂无数据' : '该字段引用实体处搜索字段没有部门字段，请先配置'"
					>
					</el-tree>
				</div>
			</div>
			<div v-else>
				<div class="work-flow-conditions w-100">
					<div class="head-selector-container">
						<div class="head-tree-container">
							<el-input class="head-tree-input" v-model="filterText" placeholder="输入关键字过滤" clearable>
							</el-input>
						</div>
						<div class="head-selected-container">
							<span>已选用户 ({{ selectedUsers.length }})</span>
							<el-button
								type="text"
								@click="clearAll"
								:disabled="selectedUsers.length === 0"
							>
								清空
							</el-button>
						</div>
					</div>
				</div>
				<div class="main-table mt-10">
					<div class="user-selector-container">
						<!-- 左边组织用户结构树 -->
						<div class="tree-container">
							<el-tree
								ref="treeRef"
								class="tree"
								:data="treeData"
								:props="defaultProps"
								node-key="id"
								show-checkbox
								:check-strictly="isSingleCheck"
								:default-checked-keys="checkedKeys"
								:filter-node-method="filterNode"
								@check="handleNodeCheck"
								:default-expanded-keys="expandedKeys"
                                :empty-text="hasDepartmentField ? '暂无数据' : '该字段引用实体处搜索字段没有部门字段，请先配置'"
							/>
						</div>
						<!-- 右边选中的用户列表 -->
						<div class="selected-container">
							<div class="user-list">
								<div
									v-for="user in selectedUsers"
									:key="user.id"
									class="user-item"
								>
									<span>{{ user.userName }} ({{ user.departmentId.name }})</span>
									<el-button
										type="text"
										icon="el-icon-close"
										@click="removeUser(user)"
									/>
								</div>
								<div v-if="selectedUsers.length === 0" class="empty-tip">
									暂无选中用户
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
		<div class="footer-box" v-if="showMultipleSelectConfirm">
			<el-button type="primary" @click="multipleSelectRecord">
				确认选择
			</el-button>
		</div>
	</div>
</template>

<script>
import {refFieldQuery2} from "@/api/crud";
import useCommonStore from "@/store/modules/common";
import mlCustomEdit from '@/components/mlCustomEdit/index.vue';
import http from "@/utils/request";
import {getDepartmentTree} from "@/api/user";
//
export default {
	components:{
		mlCustomEdit,
	},
	props: {
		entity: String,
		refField: String,
		extraFilter: String, // 查询条件
		extraSort: String, // 排序
		// 过滤条件
		filterConditions: {
			type: Object,
			default: () => {},
		},
		// 是否显示多选确认按钮
		showMultipleSelectConfirm: {
			type: Boolean,
			default: false,
		},
		// 默认多选数据
		defaultSelected: {
			type: [Array, Object],
			default: () => [],
		},
		// 是否单选
		isSingleCheck: {
			type: Boolean,
			default: false,
		},
	},
	watch: {
		refField: {
			handler(newVal) {
				this.initTreeData()
			},
		},
		filterText(val) {
			this.$refs.treeRef.filter(val)
		}
	},
	name: "ReferenceSearchUser",
	data() {
		return {
			idField: null,
			nameField: null,
			loading: false,
			loadingText: "数据加载中...",
			conditionConf: {
				equation: "AND",
				items: [],
			},
			referenceEntityName: "",
			referenceEntityNameFieldName: "",
			// 表格多选数据
			multipleSelection: [],
			notEmptyItems:[
				"NL",
				"NT",
				"SFU",
				"SFB",
				"SFD",
				"SFT",
				"YTA",
				"TDA",
				"TTA",
				"CUW",
				"CUM",
				"CUQ",
				"CUY",
				"REFD",
				"REFU",
			],
			// 初始树形数据
			treeData: [],
			filterText: '',
			defaultProps: {
				children: 'children',
				label: 'label',
				disabled: 'disabled'
			},
			expandedKeys:[],
			checkedKeys:[], //默认回填数据
			selectedUsers: [], // 选中的用户列表
			userReqParam:{
				entity: "User",
				fieldsList:
					"userName, loginName, jobTitle,mobilePhone,departmentId,disabled,createdOn, createdBy, modifiedOn, modifiedBy, departmentId,avatar,dingTalkUserId,wxWorkUserId",
				// 默认排序
				sortFields: [
					{
						fieldName: 'displayOrder',
						type: "DESC",
					},
					{
						fieldName: "createdOn",
						type: "DESC",
					},
				],
			},
            // 是否有部门字段
            hasDepartmentField: false,
		};
	},

	mounted() {
		const { queryEntityInfoByName } = useCommonStore();
		let entityInfo = queryEntityInfoByName("User");
		this.idField = entityInfo.idFieldName;
		this.nameField = entityInfo.nameFieldName;
		this.setDefaultCheckedNode();
		this.initTreeData();
	},

	methods: {

		// 多选回填
		multipleSelectRecord() {
			if (this.selectedUsers.length < 1) {
				this.$message.info("还未选择数据...");
				return;
			}
			this.$emit(
				"multipleRecordSelected",
				{
					id: this.idField,
					label: this.nameField,
				},
				this.selectedUsers
			);
		},
		// 获取IDNAME字段
		getIdNameField() {
			return {
				idField: this.idField,
				nameField: this.nameField,
			};
		},
		// 获取所有选中数据
		getMultipleSelection() {
			return this.selectedUsers;
		},
		// 查询实体Code
		queryEntityCode(entityName){
			const { queryEntityCodeByName } = useCommonStore();
			return queryEntityCodeByName(entityName)
		},
		// 检查是否明细实体
		isDetailEntityFlag(entityName){
			const { checkDetailEntityFlag } = useCommonStore();
			return checkDetailEntityFlag(entityName)
		},
		// ---------------新用户选择组件 start------------------
		// 初始化树形数据后给默认选中节点
		setDefaultCheckedNode(){
			if(this.defaultSelected && this.defaultSelected.length){
				this.checkedKeys = this.defaultSelected.map(item => item.id);
			}
		},
		// 过滤树节点
		filterNode(value, data) {
			if (!value) return true
			return data[this.defaultProps.label].includes(value)
		},

		// 节点选中状态变化
		handleNodeCheck(checkedNode, checkedStatus) {
			const { checkedNodes, halfCheckedNodes,checkedKeys } = checkedStatus
			const userNodes = this.findUserNodes(checkedNode);
			// 筛选出用户节点
			// const checkedUsers = checkedNodes.filter(node => node.userId)
			// 更新选中用户列表
			for (let u of userNodes){
				if(checkedKeys.includes(u.id)){
					if(!this.selectedUsers.some(su => su.id === u.id)){
						this.selectedUsers.push(u);
					}
				}else{
					this.selectedUsers = this.selectedUsers.filter(su => su.id !== u.id)
				}
			}
		},
		handleNodeClick (data){
			if (data.userId) {
				this.selectRecord(data);
			}
		},
		// 点选回填
		selectRecord(row) {
			this.$emit(
				"recordSelected",
				{
					id: row[this.idField],
					label: row[this.nameField],
				},
				row
			);
		},
		findUserNodes(nodeData) {
			let userList = [];

			if (!nodeData.children || nodeData.children.length === 0) {
				return nodeData.userId ? [nodeData] : [];
			}

			nodeData.children.forEach(child => {
				userList = userList.concat(this.findUserNodes(child));
			});

			return userList;
		},
		// 移除单个用户
		removeUser(user) {
			// 从树中取消选中该用户
			this.$refs.treeRef.setChecked(user.id, false)
			this.selectedUsers = this.selectedUsers.filter(su => su.id !== user.id)
			// 不需要手动更新selectedUsers，因为setChecked会触发handleNodeCheck
		},

		// 清空所有选中
		clearAll() {
			this.$refs.treeRef.setCheckedKeys([])
			this.selectedUsers = []
		},

		// 获取当前选中的用户列表（供父组件调用）
		getSelectedUsers() {
			return this.selectedUsers
		},
		async initTreeData() {
			this.loading = true;
			this.selectedUsers = [];
			this.treeData= [];
			let res = await getDepartmentTree()
			let orgData = res?.data?.data ||  [];
			let userList = await this.getUserList()
            if(userList?.length > 0) {
                this.hasDepartmentField = userList[0]?.departmentId?.id ? true : false;
            }
			this.putUserToOrgTree(orgData,userList);
			this.loading = false;
		},
		async getUserList() {
			let paramStr;
			paramStr = this.entity;
			let tempConditionConf = JSON.parse(JSON.stringify(this.conditionConf));
			tempConditionConf.items = tempConditionConf.items.filter(el => {
				const hasValidValue = (val) => val !== undefined && val !== null && val !== "";
				if ((el.type == 'Date' || el.type == 'DateTime') && !el.value && !el.value2) {
					return false;
				}
				return hasValidValue(el.value) || hasValidValue(el.value2) || this.notEmptyItems.includes(el.op);
			});
			let userList = await this.refFieldQueryApi(
				refFieldQuery2(
					paramStr,
					this.refField,
					1,
					1000000,
					this.extraFilter,
					this.filterConditions || null,
					tempConditionConf,
					this.extraSort
				)
			);
			return userList;
		},
		async refFieldQueryApi(cb) {
			let res = await cb;
			if (res) {
				this.idField = res.data.idFieldName;
				this.nameField = res.data.nameFieldName;
				// let columnList = res.data.columnList;
				this.tableData = res.data.dataList;
				if (!this.referenceEntityName && res.data.filter) {
					this.conditionConf = JSON.parse(
						JSON.stringify(res.data.filter)
					);
				}
				this.referenceEntityName = res.data.entityName;
				this.referenceEntityNameFieldName = res.data.nameFieldName;
				return res.data.dataList || [];
			}
		},
		putUserToOrgTree(orgData, userList){
			if(!userList || userList.length === 0 || !orgData || !orgData.length){
				return
			}
			const deptMap = {};
			// 构建部门映射表
			this.buildDeptMap(orgData, deptMap);
            console.log(deptMap,'deptMap')
			// 遍历用户列表，将用户添加到对应的部门
			userList.forEach(user => {
				const deptId = user?.departmentId?.id;
				if (deptMap[deptId]) {
					// 如果部门节点存在，初始化children数组（如果不存在）
					if (!deptMap[deptId].children) {
						deptMap[deptId].children = [];
					}

					// 将用户添加到部门节点的children中
					// 可以根据需要决定用户节点的结构
					let userNode = {
						id: user.userId,
						label: user.userName,
						name:user.userName,
						parentId: deptId,
						disabled: false,
						// 可以添加其他用户属性
						...user
					};
					if(deptMap[deptId].id === deptId){
						// 如果就是当前部门人，则是领导则放在最前面
						deptMap[deptId].children.unshift(userNode);
					} else {
						deptMap[deptId].children.push(userNode);
					}
					if(this.checkedKeys.includes(userNode.id)){
						this.selectedUsers.push(userNode);
					}
				} else {
					console.warn(`未找到部门ID为 ${deptId} 的部门，用户 ${user.name} 未被添加到树中`);
				}
			});
			orgData = this.filterTreeByUserNodes(orgData);
			// 找出所有一级
			this.expandedKeys = orgData.flatMap(level1 => {
				const level1Keys = [level1.id] // 一级节点key
				// const level2Keys = level1.children ? level1.children.map(level2 => level2.id) : []
				return [...level1Keys]
			})
			this.treeData = orgData;
		},
		buildDeptMap(nodes, deptMap) {
			// 递归遍历组织树，建立部门映射
			nodes.forEach(node => {
				// 将当前部门节点存入映射表，以id为key
				deptMap[node.id] = node;
				node.disabled = this.isSingleCheck ? true :false;
				// 如果有子部门，继续递归处理
				if (node.children && node.children.length > 0) {
					this.buildDeptMap(node.children,deptMap);
				}
			});
		},
		filterTreeByUserNodes(treeData) {
			return treeData.filter(node => {
				// 如果有子节点，先递归处理子节点
				if (node.children && node.children.length > 0) {
					node.children = this.filterTreeByUserNodes(node.children);
				}
				// 保留条件：
				// 1. 当前节点 isUser === true
				// 2. 或者有子节点(经过过滤后子节点不为空)
				return node.userId || (node.children && node.children.length > 0);
			});
		}
	},
};
</script>

<style lang="scss" scoped>
// :deep(.el-header) {
// 	padding: 0 12px;
// }

:deep(.el-main) {
	padding: 0px;
}

.reference-search-table {
	// max-height: 600px;
	// overflow-x: hidden;
	// overflow-y: auto;
	:deep(.el-pagination) {
		justify-content: center;
	}
}

.footer-box {
	border-top: 1px solid #e5e5e5;
	line-height: 40px;
	padding: 0 20px;
	box-sizing: border-box;
	text-align: right;
}

.show-selected-data {
	margin-bottom: 5px;
	display: flex;
	align-items: center;
	justify-content: flex-start;
	flex-wrap: wrap;
	.item-tag {
		margin-right: 5px;
		margin-bottom: 5px;
	}
}

.head-tree-container {
	flex: 1;
	border-right: 1px solid #ebeef5;
	padding: 0px 10px;
    .head-tree-input {
        width: 100%;
        :deep(.el-input__wrapper){
            box-shadow: none;
            padding: 1px 0;
        }
    }
    
}
</style>

<style>
.reference-dialog .el-dialog__body {
	/* padding-top: 10px !important;
	padding-bottom: 10px !important; */
	padding: 0 !important;
}
#simpleTableFooter {
	padding: 0 !important;
	margin-top: 8px;
	border-top: 0;
}

.reference-search-table .work-flow-conditions .ml-add-conditions {
	margin-top: 10px !important;
	border-bottom-width: 0 !important;
}

.reference-search-table .work-flow-conditions {
	padding-bottom: 4px !important;
	border-bottom: 1px solid #eee;
}
.user-selector-container {
	display: flex;
	height: 470px;
	border: 1px solid #ebeef5;
	border-radius: 4px;
	overflow: hidden;
}
.user-single-selector-container {
	height: 470px;
	overflow: auto;
}
.tree-container {
	flex: 1;
	padding: 10px;
	border-right: 1px solid #ebeef5;
	overflow: auto;
}

.selected-container {
	flex: 1;
	padding: 10px;
	overflow: auto;
}
.head-selector-container {
	display: flex;
	border: 1px solid #ebeef5;
	border-radius: 4px;
	overflow: hidden;
}



.head-selected-container {
	flex: 1;
	padding: 0px 10px;
	display: flex;
	justify-content: space-between;
	align-items: center;
	border-radius: 4px;
}
.tree {
	/*margin-top: 10px;*/
}

.user-list {
	/*margin-top: 10px;*/
}

.user-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 8px 10px;
	margin: 5px 0;
	background-color: #f5f7fa;
	border-radius: 4px;
}

.user-item:hover {
	background-color: #ebedf0;
}

.empty-tip {
	color: #909399;
	text-align: center;
	margin-top: 20px;
}

h3 {
	margin-top: 0;
	margin-bottom: 15px;
}
</style>
