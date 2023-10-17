<template>
	<el-container>
		<el-header class="list-search-panel">
			<div class="search-panel-left">
				<!-- TODO: 此处应该增加按钮插槽!! -->
				<slot name="listTitle"></slot>
			</div>
			<div style="flex: 1"></div>
			<div class="search-panel-right">
				<el-input type="primary" placeholder="请输入关键词搜索" :clearable="true"
						  v-model="keyword" @keyup.enter="searchData" @clear="clearSearch"
						  suffix-icon="el-icon-search">
					<template #append>
						<el-button icon="el-icon-refresh-right" @click="refreshTableData" title="刷新"></el-button>
					</template>
				</el-input>
				<el-button type="primary" icon="el-icon-plus" @click="addNewRecord">新建{{ entityLabel }}</el-button>
			</div>
		</el-header>

		<el-main ref="tableContainer" class="table-container">
			<div style="height: 100%">
				<SimpleTable :columns="columns" :data="tableData" :pagination="page" :show-check-box="true"
							 :height="tableHeight + 'px'"
							 @handleSizeChange="handleSizeChange" @handleCurrentChange="handleCurrentChange"
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
			<el-dialog :title="formTitle" v-model="showFormDialogFlag" v-if="showFormDialogFlag"
					   :destroy-on-close="true" :close-on-click-modal="false"
					   :show-close="true" :close-on-press-escape="false">
				<v-form-render ref="formWidget"></v-form-render>
				<template #footer>
					<div class="dialog-footer">
						<el-button type="primary" @click="saveFormData" style="width: 90px">保 存</el-button>
						<el-button @click="showFormDialogFlag = false">取 消</el-button>
					</div>
				</template>
			</el-dialog>
		</el-main>
	</el-container>
</template>

<script>
import FormState from "@/views/system/form-state-variables";
import {initDataList, createRecord, updateRecord, saveRecord, deleteRecord, getDataList} from "@/api/crud";
import {arrayContain, isEmptyStr, setColumnFormatter} from "@/utils/util";
import eventBus from "@/utils/event-bus";

export default {
	name: "DataList",
	props: {
		entity: String,
		customAddAction: {
			type: Boolean,
			default: false
		},
		customEditAction: {
			type: Boolean,
			default: false
		},
		customDeleteAction: {
			type: Boolean,
			default: false
		},
		customDataLoad: {
			type: Boolean,
			default: false
		},
		page: {
			type: Object,
			default: () => {
				return {
					pageNo: 1,
					limit: 20,
					sizes: [10, 20, 30, 50, 100],
					total: 0
				}
			}
		},

		crudMethods: {
			type: Object,
			default: () => {
				return {
					initDataList: initDataList,
					createRecord: createRecord,
					updateRecord: updateRecord,
					saveRecord: saveRecord,
					deleteRecord: deleteRecord
				}
			}
		},
	},
	data() {
		return {
			entityLabel: '',
			idFieldName: null,
			nameFieldName: null,
			curRecordId: null,

			keyword: '',
			searchFilter: '',

			columns: [],
			tableData: [],

			showFormDialogFlag: false,
			layout: {},
			formState: 1,
			formModel: {},
			labelsModel: {},
			fieldPropsMap: {},

			tableHeight: 200
		}
	},
	computed: {
		formTitle() {
			if (this.formState === FormState.NEW) {
				return '新建' + this.entityLabel
			} else if (this.formState === FormState.EDIT) {
				return '编辑' + this.entityLabel
			} else {
				return this.entityLabel + '详情'
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

		this.initTable()
	},
	methods: {
		resizeTableHeight() {  /* table自适应高度 */
			if (!this.$refs.tableContainer) {
				return
			}
			if (!!this.$refs.tableContainer.$el) {
				this.tableHeight = this.$refs.tableContainer.$el.offsetHeight - 42
			}
		},

		initTable() {
			if (!this.entity) {
				this.$message.error('entity of prop is null')
				return
			}

			if (this.customDataLoad === true) {
				return
			}

			this.crudMethods.initDataList(this.entity).then(res => {
				if (res.error != null) {
					this.$message({message: res.error, type: 'error'})
					return
				}

				this.setTableData(res.data.columnList, res.data.dataList)
				this.page.total = res.data.pagination.total
				this.entityLabel = res.data.entityBasicInfo.label
				this.idFieldName = res.data.entityBasicInfo.idField
				if (!!res.data.entityBasicInfo.nameField) {
					this.nameFieldName = res.data.entityBasicInfo.nameField
				}
			}).catch(res => {
				this.$message({message: res.message, type: 'error'})
			})
		},

		/**/
		setTableData(columnList, recordList) {
			this.columns = columnList
			this.columns.forEach(col => {
				setColumnFormatter(col)
			})
			this.tableData = recordList
		},

		/* 保持查询条件，重新当前页加载数据 */
		loadTableData(filter) {
			let realFilter = isEmptyStr(filter) ? '(1=1)' : filter
			let fieldsList = ''
			this.columns.forEach(col => {
				fieldsList += col.prop + ','
			})
			getDataList(this.entity, fieldsList, realFilter, this.page.limit, this.page.pageNo).then(res => {
				if (res.error != null) {
					this.$message({message: res.error, type: 'error'})
				} else {
					this.tableData = res.data.dataList
					this.page.total = res.data.pagination.total
				}
			}).catch(res => {
				this.$message({message: res.message, type: 'error'})
			})
		},

		// 改变分页大小处理
		handleSizeChange(val) {
			if (this.customDataLoad === true) {
				this.$emit('handleSizeChange', val)  //父组件发出消息，由父组件处理
				return
			}

			this.page.limit = val
			this.page.pageNo = 1
			this.loadTableData(this.searchFilter)
		},

		// 翻页处理
		handleCurrentChange(val) {
			if (this.customDataLoad === true) {
				this.$emit('handleCurrentChange', val)  //父组件发出消息，由父组件处理
				return
			}

			this.page.pageNo = val
			this.loadTableData(this.searchFilter)
		},

		searchData() {
			if (this.customDataLoad === true) {
				this.$emit('searchData', this.keyword)  //父组件发出消息，由父组件处理
				return
			}

			if (!this.nameFieldName) {
				this.$message.error('当前实体[' + this.entity + ']未指定名称字段，不能搜索！')
				return
			}

			let searchField = this.nameFieldName
			let searchWord = this.keyword
			this.searchFilter = `([${searchField}] like '%${searchWord}%')`
			this.loadTableData(this.searchFilter)
		},

		clearSearch() {
			if (this.customDataLoad === true) {
				this.keyword = ''
				this.$emit('clearSearch')  //父组件发出消息，由父组件处理
				return
			}

			this.searchFilter = ''
			this.loadTableData();
		},

		refreshTableData() {
			if (this.customDataLoad === true) {
				this.$emit('refreshTable')  //父组件发出消息，由父组件处理
				return
			}

			this.loadTableData(this.searchFilter)
		},

		addNewRecord() {
			if (this.customAddAction === true) {
				this.$emit('addTableRecord')  //父组件发出消息，由父组件处理
				return
			}

			this.crudMethods.createRecord(this.entity).then(res => {
				if (res.error != null) {
					this.$message({message: res.error, type: 'error'})
					return
				}

				if ((!!res.data) && (!!res.data.layoutJson)) {
					this.curRecordId = null
					this.layout = this.buildLayoutObj()
					this.layout.setLayoutPropsFromServer(res)
					this.handleDeletedFields(res) /* 处理表单已删除字段！！ */
					this.formModel = res.data.formData
					this.labelsModel = res.data.labelData
					this.fieldPropsMap = res.data.fieldPropsMap
					this.formState = FormState.NEW
					this.showFormDialogFlag = true;
					if (!!this.$refs['formWidget']) {
						this.$refs['formWidget'].clearFormValidate()
					}
				} else {
					this.$message({message: '加载表单布局出错', type: 'error'})
				}
			}).catch(res => {
				this.$message({message: res.message, type: 'error'})
			})
		},

		buildLayoutObj() {
			return createLayoutObj(eventBus)
		},

		handleDeletedFields(res) {
			let deletedFields = res.data.deletedFields
			if (!!deletedFields && Array.isArray(deletedFields)) {
				let layoutFieldWrappers = this.layout.getAllLayoutFieldWrappers()
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

		editTableData(row) {
			if (this.customEditAction === true) {
				this.$emit('editTableRow', row)  //向父组件发出消息，由父组件处理
				return
			}

			this.curRecordId = row[this.idFieldName]
			this.crudMethods.updateRecord(this.entity, this.curRecordId).then(res => {
				if (res.error != null) {
					this.$message({message: res.error, type: 'error'})
					return
				}

				if ((!!res.data) && (!!res.data.layoutJson)) {
					this.layout = this.buildLayoutObj()
					this.layout.setLayoutPropsFromServer(res)
					this.handleDeletedFields(res) /* 处理表单已删除字段！！ */
					this.formModel = res.data.formData
					this.labelsModel = res.data.labelData
					this.fieldPropsMap = res.data.fieldPropsMap
					this.formState = FormState.EDIT //编辑记录状态
					this.showFormDialogFlag = true;
					if (!!this.$refs['formWidget']) {
						this.$refs['formWidget'].clearFormValidate()
					}
				} else {
					this.$message({message: '加载表单布局出错', type: 'error'})
				}
			}).catch(res => {
				this.$message({message: res.message, type: 'error'})
			})
		},

		saveFormData() {
			let validResult = false
			this.$refs['formWidget'].validateForm((valid) => {
				validResult = valid
				if (!!!valid) {
					return false
				}
			})
			if (!!!validResult) {
				return
			}

			this.crudMethods.saveRecord(this.entity, this.formState === FormState.NEW ? '' : this.curRecordId,
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
		},

		deleteTableData(row) {
			if (this.customDeleteAction === true) {
				this.$emit('deleteTableRow', row)  //向父组件发出消息，由父组件处理
				return
			}

			this.$confirm('是否删除该数据?', '删除确认').then(() => {
				this.crudMethods.deleteRecord(row[this.idFieldName]).then(res => {
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

	},
}
</script>

<style lang="scss" scoped>
:deep(.el-main) {
	padding: 0;
}

.list-search-panel {
	height: 62px !important;
	line-height: 62px;
	border-left: 1px solid #EBEEF5;
	margin-bottom: 0;
}

.list-search-panel:after {
	content: "";
	display: block;
	clear: both;
}

.search-panel-left {
	float: left;
	font-size: 16px;
}

.search-panel-right {
	float: right;
	width: 360px;
	display: flex;
	align-items: center;
}

.table-container :deep(.el-table) {
	font-size: 14px;
}

</style>
