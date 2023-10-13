<template>
	<el-container class="hidden-x-scrollbar">
		<el-aside class="left-tree-panel">
			<el-tree
				:data="treeData"
				show-checkbox
				default-expand-all
				node-key="id"
				ref="tree"
				highlight-current
				:expand-on-click-node="false"
				:props="defaultProps">
				<template #default="{ node, data }">
          <span class="custom-tree-node" @mouseenter="hoverNodeId = node.id" @mouseleave="hoverNodeId = -1">
            <span>{{ node.label }}</span>
            <span :class="{'hidden-action-button': hoverNodeId !== node.id}">
              <el-button link type="primary" @click="addDepartment(node, data)">添加</el-button>
              <el-button link type="primary" @click="editDepartment(node, data)">编辑</el-button>
              <el-button link type="primary" @click="deleteDepartment(node, data)">删除</el-button>
            </span>
          </span>
				</template>
			</el-tree>

			<el-dialog :title="departmentFormTitle" v-model="showDepartmentFormDialogFlag" :show-close="true"
					   :destroy-on-close="true" :close-on-click-modal="false"
					   v-if="showDepartmentFormDialogFlag" :close-on-press-escape="false">
				<!--
				<FormWidget :entity="'Department'" :layout="departmentLayout" :form-model="departmentFormModel"
							:field-props-map="departmentFieldPropsMap"
							:labels-model="departmentLabelsModel" :form-state="departmentFormState"
							ref="departmentFormWidget">
				</FormWidget>
				-->
				<v-form-render :global-dsv="departmentDsv" ref="departmentFormRef"></v-form-render>
				<template #footer>
					<div class="dialog-footer">
						<el-button type="primary" @click="saveDepartment" style="width: 90px">保 存</el-button>
						<el-button @click="showDepartmentFormDialogFlag = false">取 消</el-button>
					</div>
				</template>
			</el-dialog>
		</el-aside>

		<el-container>
			<el-header class="list-search-panel">
				<div class="search-panel-left">
					<el-button type="primary" icon="el-icon-plus" @click="addUser">新建用户</el-button>
					<el-button :disabled="multipleSelection.length !== 1" @click="resetPasswordDialogIsShow = true">
						重置登录密码
					</el-button>
				</div>
				<div style="flex: 1"></div>
				<div class="search-panel-right">
					<el-input type="primary" placeholder="请输入关键词搜索" :clearable="true" class="v-middle"
							  v-model="keyword" @keyup.enter="searchData" @clear="clearSearch"
							  suffix-icon="el-icon-search">
						<template #append>
							<el-button icon="el-icon-refresh-right" title="刷新" @click="refreshTableData"></el-button>
						</template>
					</el-input>
				</div>
			</el-header>

			<el-main ref="tableContainer">
				<div style="height: 100%">
					<SimpleTable :columns="columns" :data="tableData" :pagination="page" :show-check-box="true"
								 :height="tableHeight + 'px'"
								 @handleSizeChange="handleSizeChange" @handleCurrentChange="handleCurrentChange"
								 @handleSelectionChange="handleSelectionChange"
								 :show-operation-column="true"
								 table-width="100% !important">
						<template #table_operation="{scope}">
							<el-button link type="primary" size="small" icon="el-icon-edit"
									   @click="editTableData(scope.row)">修改
							</el-button>
							<el-button link type="primary" size="small" icon="el-icon-delete"
									   @click="deleteTableData(scope.row)">删除
							</el-button>
						</template>
					</SimpleTable>
				</div>

				<!-- 注意：必须同时设置v-if和close-on-press-escape属性，保证FormWidget在每一次对话框显示时都重新初始化！！ -->
				<el-dialog :title="formTitle" v-model="showFormDialogFlag" :show-close="true"
						   :destroy-on-close="true" :close-on-click-modal="false"
						   v-if="showFormDialogFlag" :close-on-press-escape="false">
					<!--
					<FormWidget :entity="entity" :layout="layout" :form-model="formModel"
								:field-props-map="fieldPropsMap"
								:labels-model="labelsModel" :form-state="formState" :extra-rules="extraRules"
								ref="formWidget">
					</FormWidget>
					-->
					<v-form-render :global-dsv="userDsv" ref="userFormRef"></v-form-render>
					<template #footer>
						<div class="dialog-footer">
							<el-button type="primary" @click="saveFormData" style="width: 90px">保 存</el-button>
							<el-button @click="showFormDialogFlag = false">取 消</el-button>
						</div>
					</template>
				</el-dialog>
			</el-main>
		</el-container>
		<!-- 重置密码 -->
		<ml-dialog title="重置密码" v-model="resetPasswordDialogIsShow" appendToBody width="450px">
			<el-input v-model="newPassword" placeholder="输入密码" clearable>
				<template #append>
					<span class="generate-pwd" @click="generatePwd">生成随机密码</span>
				</template>
			</el-input>
			<template #footer>
				<el-button @click="resetPasswordDialogIsShow = false">取消</el-button>
				<el-button type="primary" @click="confirm">确定</el-button>
			</template>

		</ml-dialog>
	</el-container>
</template>

<script>
import {arrayContain, formatRefColumn, isEmptyStr} from '@/utils/util'
import {deleteDepartmentById, deleteUserById, getDepartmentTree, saveDepartment, saveUser} from '@/api/user'
import {createRecord, getDataList, updateRecord} from '@/api/crud'
import FormState from '@/views/system/form-state-variables'
import eventBus from "@/utils/event-bus"
import http from '@/utils/request'

export default {
	name: "UserTreeTable",
	data() {
		return {
			entity: 'User',
			fieldsList: 'userName, loginName, createdOn, createdBy, modifiedOn, modifiedBy, departmentId',
			showFormDialogFlag: false,
			layout: {},
			formState: 1,
			formModel: {},
			labelsModel: {},
			curUserId: null,
			fieldPropsMap: {},

			showDepartmentFormDialogFlag: false,
			departmentLayout: {},
			departmentFormState: 1,
			departmentFormModel: {},
			departmentLabelsModel: {},
			curDepartmentId: null,
			departmentFieldPropsMap: {},
			departmentDsv: {},
			userDsv: {},

			columns: [
				{prop: 'userName', label: '用户名称', width: '130', align: 'left'},
				{prop: 'loginName', label: '登录名', width: '120', align: 'center'},
				{prop: 'createdOn', label: '创建时间', width: '160', align: 'center'},
				{prop: 'createdBy', label: '创建用户', align: 'center', formatter: formatRefColumn},
				{prop: 'modifiedOn', label: '修改时间', width: '160', align: 'center'},
				{prop: 'modifiedBy', label: '修改用户', align: 'center', formatter: formatRefColumn},
				{prop: 'departmentId', label: '归属部门', align: 'center', formatter: formatRefColumn},
			],
			tableData: [],
			page: {
				pageNo: 1,
				limit: 20,
				sizes: [10, 20, 30, 50, 100],
				total: 0
			},
			treeData: [],
			hoverNodeId: -1,
			defaultProps: {
				children: 'children',
				label: 'label'
			},
			tableHeight: 100,

			keyword: '',
			searchFilter: '',

			extraRules: {
				loginName: {
					max: 20, message: '不能超过20个字符长度', trigger: 'blur'
				},

				profile: [
					{min: 5, message: '请至少输入5个字符', trigger: 'blur'}
				],

			},
			multipleSelection: [],
			// 重置密码
			resetPasswordDialogIsShow: false,
			newPassword: "",
		}
	},
	computed: {
		formTitle() {
			if (this.formState === FormState.NEW) {
				return '新建用户'
			} else if (this.formState === FormState.EDIT) {
				return '编辑用户'
			} else {
				return '用户详情'
			}
		},

		departmentFormTitle() {
			if (this.formState === FormState.NEW) {
				return '新建部门'
			} else if (this.formState === FormState.EDIT) {
				return '编辑部门'
			} else {
				return '查看部门'
			}
		},
	},
	mounted() {
		this.$nextTick(() => {
			this.resizeTableHeight()
		})
		window.onresize = () => {
			this.resizeTableHeight()
		}

		this.initTreeData()
		this.initTableData()
	},
	methods: {
		// 生成密码
		generatePwd() {
			this.newPassword = 'xxxcxxx'.replace(/[xy]/g, function (c) {
				var r = Math.random() * 16 | 0,
					v = c == 'x' ? r : (r & 0x3 | 0x8);
				return v.toString(16);
			})
		},
		// 确认修改密码
		async confirm() {
			if (!this.newPassword) {
				this.$message.error("请输入密码")
				return
			}
			let regEx = /(?=.*([a-zA-Z].*))(?=.*[0-9].*)[a-zA-Z0-9-*/+.~!@#$%^&*()]{6,20}$/;
			if (!regEx.test(this.newPassword)) {
				this.$message.error("必须包含数字、英文。可有字符。密码长度为：6-20位")
				return
			}
			let res = await http.get('/user/resetPassword', {
				password: this.newPassword
			})
			if (res) {
				this.$message.success("重置成功");
				this.newPassword = "";
				this.resetPasswordDialogIsShow = false;
			}
		},
		handleSelectionChange(v) {
			this.multipleSelection = v;
		},
		resizeTableHeight() {  /* table自适应高度 */
			this.tableHeight = this.$refs.tableContainer.$el.offsetHeight - 42
		},

		// 改变分页大小处理
		handleSizeChange(val) {
			this.page.limit = val
			this.page.pageNo = 1
			this.loadTableData(this.searchFilter)
		},

		// 翻页处理
		handleCurrentChange(val) {
			this.page.pageNo = val
			this.loadTableData(this.searchFilter)
		},

		editTableData(row) {
			this.curUserId = row.userId
			updateRecord(this.entity, this.curUserId).then(res => {
				if (res.error != null) {
					this.$message({message: res.error, type: 'error'})
					return
				}

				if ((!!res.data) && (!!res.data.layoutJson)) {
					// this.layout = this.buildLayoutObj()
					// this.layout.setLayoutPropsFromServer(res)
					// this.handleDeletedFields(res, this.layout) /* 处理表单已删除字段！！ */
					// this.formModel = res.data.formData
					// this.labelsModel = res.data.labelData
					// this.fieldPropsMap = res.data.fieldPropsMap
					// this.formState = FormState.EDIT //编辑记录状态
					// this.showFormDialogFlag = true;
					// if (!!this.$refs['formWidget']) {
					// 	this.$refs['formWidget'].clearFormValidate()
					// }

					this.formState = FormState.EDIT
					this.showFormDialogFlag = true;
					this.userDsv['formEntity'] = 'User'
					this.$nextTick(() => {
						this.$refs.userFormRef.setFormJson(res.data.layoutJson)
						this.$nextTick(() => {
							this.$refs.userFormRef.setFormData(res.data.formData)
						})
					})
				} else {
					this.$message({message: '加载表单布局出错', type: 'error'})
				}
			}).catch(res => {
				this.$message({message: res.message, type: 'error'})
			})
		},

		handleDeletedFields(res, layoutObj) {
			let deletedFields = res.data.deletedFields
			if (!!deletedFields && Array.isArray(deletedFields)) {
				let layoutFieldWrappers = layoutObj.getAllLayoutFieldWrappers()
				if (!!layoutFieldWrappers && Array.isArray(layoutFieldWrappers)) {
					layoutFieldWrappers.forEach(fw => {
						let deletedFlag = arrayContain(deletedFields, fw.name)
						if (!!deletedFlag) {
							fw.deleted = true  /* 设置已删除字段标志 */
						}
					})
				}
			}
		},

		deleteTableData(row) {
			if (row.userId === '021-000000000000000000000000000000000001') {
				this.$message.info('管理员用户禁止删除！')
				return
			}

			this.$confirm('是否删除该用户?', '删除确认').then(() => {
				deleteUserById(row.userId).then(res => {
					if (res.error != null) {
						this.$message({message: res.error, type: 'error'})
						return
					}

					this.$message.success('删除成功')
					this.loadTableData(this.searchFilter)
				}).catch(res => {
					this.$message({message: res.message, type: 'error'})
				})
			}).catch(() => {
				this.$message.info('取消删除')
			})
		},

		loadTableData(filter) {
			// let realFilter = isEmptyStr(filter) ? '(1=1)' : filter;
			// let realFilter = [];
			getDataList('User', this.fieldsList, null, this.page.limit, this.page.pageNo).then(res => {
				if (res.error != null) {
					this.$message({message: res.error, type: 'error'})
				} else {
					this.tableData = res.data.dataList
					this.page.total = res.data.pagination.total
					//console.log(res.data)
				}
			}).catch(res => {
				this.$message({message: res.message, type: 'error'})
			})
		},

		initTreeData() {
			getDepartmentTree().then(res => {
				if (res.error != null) {
					this.$message({message: res.error, type: 'error'})
					return
				}

				this.treeData = res.data.data
			}).catch(res => {
				this.$message({message: res.message, type: 'error'})
			})
		},

		initTableData() {
			this.loadTableData('(1=1)')
		},

		buildLayoutObj() {
			return createLayoutObj(eventBus)
		},

		addUser() {
			createRecord(this.entity).then(res => {
				if (res.error != null) {
					this.$message({message: res.error, type: 'error'})
					return
				}

				if ((!!res.data) && (!!res.data.layoutJson)) {
					// this.curUserId = null
					// this.layout = this.buildLayoutObj()
					// this.layout.setLayoutPropsFromServer(res)
					// this.handleDeletedFields(res, this.layout) /* 处理表单已删除字段！！ */
					// this.formModel = res.data.formData
					// this.labelsModel = res.data.labelData
					// this.fieldPropsMap = res.data.fieldPropsMap
					// this.formState = FormState.NEW
					// this.showFormDialogFlag = true;
					// if (!!this.$refs['formWidget']) {
					// 	this.$refs['formWidget'].clearFormValidate()
					// }

					this.curUserId = null
					this.formState = FormState.NEW
					this.showFormDialogFlag = true;
					this.userDsv['formEntity'] = 'User'
					this.$nextTick(() => {
						this.$refs.userFormRef.setFormJson(res.data.layoutJson)
					})
				} else {
					this.$message({message: '加载表单布局出错', type: 'error'})
				}
			}).catch(res => {
				this.$message({message: res.message, type: 'error'})
			})
		},

		saveFormData() {
			// let validResult = false
			// this.$refs['formWidget'].validateForm((valid) => {
			// 	validResult = valid
			// 	if (!!!valid) {
			// 		return false
			// 	}
			// })
			// if (!!!validResult) {
			// 	return
			// }

			this.$refs.userFormRef.getFormData().then(formData => {
				this.formModel = formData
				saveUser(this.entity, this.formState === FormState.NEW ? '' : this.curUserId,
					this.formModel).then(res => {
					if (res.error != null) {
						this.$message({message: res.error, type: 'error'})
						return
					}

					this.formModel = res.data.formData
					this.labelsModel = res.data.labelData
					this.$message({message: '保存成功', type: 'success'})
					this.showFormDialogFlag = false
					this.loadTableData(this.searchFilter)
				}).catch(res => {
					this.$message({message: res.message, type: 'error'})
				})
			}).catch(err => {
				this.$message({message: '数据校验失败', type: 'error'})
			})
		},

		searchData() {
			if (isEmptyStr(this.keyword)) {
				if (!isEmptyStr(this.searchFilter)) {
					this.loadTableData('(1=1)')
				}

				return
			}

			let searchContent = this.keyword.trim()
			this.searchFilter = `([userName] like '%${searchContent}%') or ([loginName] like '%${searchContent}%') or ([departmentId.departmentName] like '%${searchContent}%')`
			this.loadTableData(this.searchFilter)
		},

		clearSearch() {
			if (isEmptyStr(this.searchFilter)) {
				return
			}

			this.searchFilter = ''
			this.loadTableData(this.searchFilter)
		},

		refreshTableData() {
			this.loadTableData(this.searchFilter)
		},

		addDepartment(node, data) {
			//console.log(node)

			createRecord('Department').then(res => {
				if (res.error != null) {
					this.$message({message: res.error, type: 'error'})
					return
				}

				if ((!!res.data) && (!!res.data.layoutJson)) {
					// this.curDepartmentId = null
					// this.departmentLayout = this.buildLayoutObj()
					// this.departmentLayout.setLayoutPropsFromServer(res)
					// this.handleDeletedFields(res, this.departmentLayout) /* 处理表单已删除字段！！ */
					// this.departmentFormModel = res.data.formData
					// this.departmentLabelsModel = res.data.labelData
					// this.departmentFieldPropsMap = res.data.fieldPropsMap
					// this.departmentFormState = FormState.NEW
					// this.showDepartmentFormDialogFlag = true;
					//
					// // 上级部门赋值
					// this.departmentFormModel['parentDepartmentId'] = node.data.id
					// this.departmentLabelsModel['parentDepartmentId'] = node.data.label
					// if (!!this.$refs['departmentDormWidget']) {
					// 	this.$refs['departmentFormWidget'].clearFormValidate()
					// }

					this.curDepartmentId = null
					this.departmentFormState = FormState.NEW
					this.showDepartmentFormDialogFlag = true
					this.departmentDsv['formEntity'] = 'Department'
					this.$nextTick(() => {
						this.$refs.departmentFormRef.setFormJson(res.data.layoutJson)
						const departmentFormData = {
							parentDepartmentId: {
								id: node.data.id,
								name: node.data.label
							}
						}
						this.$nextTick(() => {
							this.$refs.departmentFormRef.setFormData(departmentFormData)
						})
					})
				} else {
					this.$message({message: '加载表单布局出错', type: 'error'})
				}
			}).catch(res => {
				this.$message({message: res.message, type: 'error'})
			})
		},

		editDepartment(node, data) {
			if (node.data.id === '022-000000000000000000000000000000000001') {
				this.$message.info('根部门不可编辑！')
				return
			}

			this.curDepartmentId = node.data.id
			updateRecord('Department', this.curDepartmentId).then(res => {
				if (res.error != null) {
					this.$message({message: res.error, type: 'error'})
					return
				}

				if ((!!res.data) && (!!res.data.layoutJson)) {
					// this.departmentLayout = this.buildLayoutObj()
					// this.departmentLayout.setLayoutPropsFromServer(res)
					// this.handleDeletedFields(res, this.departmentLayout) /* 处理表单已删除字段！！ */
					// this.departmentFormModel = res.data.formData
					// this.departmentLabelsModel = res.data.labelData
					// this.departmentFieldPropsMap = res.data.fieldPropsMap
					// this.departmentFormState = FormState.EDIT //编辑记录状态
					// this.showDepartmentFormDialogFlag = true;
					// if (!!this.$refs['departmentFormWidget']) {
					// 	this.$refs['departmentFormWidget'].clearFormValidate()
					// }

					this.departmentFormState = FormState.EDIT
					this.showDepartmentFormDialogFlag = true
					this.departmentDsv['formEntity'] = 'Department'
					this.$nextTick(() => {
						this.$refs.departmentFormRef.setFormJson(res.data.layoutJson)
						this.$nextTick(() => {
							this.$refs.departmentFormRef.setFormData(res.data.formData)
						})
					})
				} else {
					this.$message({message: '加载表单布局出错', type: 'error'})
				}
			}).catch(res => {
				this.$message({message: res.message, type: 'error'})
			})
		},

		saveDepartment() {
			// let validResult = false
			// this.$refs['departmentFormWidget'].validateForm((valid) => {
			// 	validResult = valid
			// 	if (!!!valid) {
			// 		return false
			// 	}
			// })
			// if (!!!validResult) {
			// 	return
			// }

			this.$refs.departmentFormRef.getFormData().then(formData => {
				this.departmentFormModel = formData
				saveDepartment('Department', this.departmentFormState === FormState.NEW ? '' : this.curDepartmentId,
					this.departmentFormModel).then(res => {
					if (res.error != null) {
						this.$message({message: res.error, type: 'error'})
						return
					}

					this.departmentFormModel = res.data.formData
					this.departmentLabelsModel = res.data.labelData
					this.$message({message: '保存成功', type: 'success'})
					this.showDepartmentFormDialogFlag = false
					this.initTreeData()
				}).catch(res => {
					this.$message({message: res.message, type: 'error'})
				})
			}).catch(err => {
				this.$message({message: '数据校验失败', type: 'error'})
			})
		},

		deleteDepartment(node, data) {
			if (node.data.id === '022-000000000000000000000000000000000001') {
				this.$message.info('根部门不可删除！')
				return
			}

			let dptId = node.data.id
			this.$confirm('是否删除该部门?', '删除确认').then(() => {
				deleteDepartmentById(dptId).then(res => {
					if (res.error != null) {
						this.$message({message: res.error, type: 'error'})
						return
					}

					this.$message.success('删除成功')
					this.initTreeData()
				}).catch(res => {
					this.$message({message: res.message, type: 'error'})
				})
			}).catch(() => {
				this.$message.info('取消删除')
			})
		},

	}
}
</script>

<style lang="scss" scoped>
.generate-pwd {
	cursor: pointer;
}

.el-container.hidden-x-scrollbar {
	overflow-x: hidden; /* 注意：IE浏览器中会出现水平滚动条，暂未找到原因！！ */
}

:deep(.el-main) {
	padding: 0;
}

.el-aside {
	background-color: #ffffff;
}

.left-tree-panel {
	width: 300px;
	margin-right: 0;
	border-right: 2px dotted #EBEEF5;
}

.hidden-action-button {
	display: none;
}

.custom-tree-node {
	flex: 1;
	display: flex;
	align-items: center;
	justify-content: space-between;
	font-size: 14px;
	padding-right: 8px;
}

.list-search-panel {
	height: 62px !important;
	line-height: 62px;
	border-left: 1px solid #EBEEF5;
	/* border-bottom: 2px dotted #EBEEF5; */
	/*margin-bottom: 2px;*/
	margin-bottom: 0;
}

.list-search-panel:after {
	content: "";
	display: block;
	clear: both;
}

.search-panel-left {
}

.search-panel-right {
	width: 360px;

	/* 解决IE浮动元素垂直居中问题 begin */
	position: relative;
	height: 62px;

	:deep(.el-input.v-middle) {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
	}

	/* end */
}

:deep(.el-table th.gutter) { /* 解决表头与内容列不对齐差1个像素的问题！！ */
	display: table-cell !important;
}

:deep(.el-dialog__header) {
	/*border-bottom: 1px #cac6c6 solid;*/
	text-align: center;
	padding-top: 15px;

	.el-dialog__title {
		font-size: 16px;
	}
}

:deep(.el-dialog__body) {
	padding: 12px 10px;
}

:deep(#simpleTableFooter.el-footer) {
	border-left: 1px solid #EBEEF5;
	//height: 48px !important;
	//padding-top: 8px !important;
}
</style>
