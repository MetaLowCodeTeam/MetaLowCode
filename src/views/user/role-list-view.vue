<template>
	<el-container direction="horizontal">
		<data-list ref="dataList" :entity="entity" :custom-add-action="true" @addTableRecord="addNewRole"
				   :custom-edit-action="true" @editTableRow="editRole"
				   :custom-delete-action="true" @deleteTableRow="deleteRole"
				   :custom-data-load="true" :page="page" @handleSizeChange="handleSizeChange"
				   @handleCurrentChange="handleCurrentChange" @refreshTable="handelTableRefresh"
				   @searchData="searchRole" @clearSearch="clearSearch"></data-list>

		<el-dialog :title="formTitle" v-model="showRoleFormDialogFlag" v-if="showRoleFormDialogFlag"
				   :destroy-on-close="true" :close-on-click-modal="false" class="small-padding"
				   :show-close="true" :close-on-press-escape="false">
			<el-form label-position="left" :label-width="'150px'" size="" ref="roleForm"
					 :model="formModel" :rules="formRules">
				<el-row :gutter="12">
					<el-col :span="12">
						<el-form-item label="角色名称" prop="roleName">
							<el-input v-model="formModel.roleName" maxlength="30"></el-input>
						</el-form-item>
					</el-col>
					<el-col :span="12">
						<el-form-item label="是否禁用">
							<el-radio-group v-model="formModel.disabled">
								<el-radio :label="true">是</el-radio>
								<el-radio :label="false">否</el-radio>
							</el-radio-group>
						</el-form-item>
					</el-col>
				</el-row>
				<el-row :gutter="12">
					<el-col :span="24">
						<el-form-item label="角色说明">
							<el-input type="textarea" :autosize="{ minRows: 2, maxRows: 3}"
									  v-model="formModel.description"></el-input>
						</el-form-item>
					</el-col>
				</el-row>

				<el-tabs type="border-card">
					<el-tab-pane label="数据权限">
						<el-row :gutter="12" class="entity-right-setting">
							<el-col :offset="0" :span="4"></el-col>
							<el-col :span="5" class="text-align-center bold">查看权限</el-col>
							<el-col :span="5" class="text-align-center bold">新建权限</el-col>
							<el-col :span="5" class="text-align-center bold">修改权限</el-col>
							<el-col :span="5" class="text-align-center bold">删除权限</el-col>
						</el-row>
						<el-row>
							<hr style="border: 0;border-top: 1px dotted #cccccc"/>
						</el-row>
						<el-row :gutter="12" v-for="(rightEntity, entityIdx) in rightEntityList" :key="entityIdx"
								class="entity-right-row">
							<el-col :offset="0" :span="4" :title="rightEntity.entityCode">{{ rightEntity.label }}</el-col>
							<el-col :span="5">
								<el-select v-model="formModel.rightValueMap['r' + rightEntity.entityCode + '-1']"
										   @change="(val) => handleReadRightChange(rightEntity.entityCode, val)" size="small">
									<el-option
										v-for="item in getRightLevels(rightEntity)"
										:key="item.value"
										:label="item.label"
										:value="item.value">
									</el-option>
								</el-select>
							</el-col>
							<el-col :span="5">
								<el-select v-model="formModel.rightValueMap['r' + rightEntity.entityCode + '-2']"
										   @change="(val) => handleEntityRightChange(rightEntity.entityCode, 2, val)"
										   size="small">
									<el-option
										v-for="item in oneselfRightLevels"
										:key="item.value"
										:label="item.label"
										:value="item.value">
									</el-option>
								</el-select>
							</el-col>
							<el-col :span="5">
								<el-select v-model="formModel.rightValueMap['r' + rightEntity.entityCode + '-3']"
										   @change="(val) => handleEntityRightChange(rightEntity.entityCode, 3, val)"
										   size="small">
									<el-option
										v-for="item in getRightLevels(rightEntity)"
										:key="item.value"
										:label="item.label"
										:value="item.value">
									</el-option>
								</el-select>
							</el-col>
							<el-col :span="5">
								<el-select v-model="formModel.rightValueMap['r' + rightEntity.entityCode + '-4']"
										   @change="(val) => handleEntityRightChange(rightEntity.entityCode, 4, val)"
										   size="small">
									<el-option
										v-for="item in getRightLevels(rightEntity)"
										:key="item.value"
										:label="item.label"
										:value="item.value">
									</el-option>
								</el-select>
							</el-col>
						</el-row>
					</el-tab-pane>

					<el-tab-pane label="功能权限">
						<el-row :gutter="12" class="function-right-setting">
							<el-col :offset="0" :span=4>功能权限设置</el-col>
						</el-row>
						<el-row>
							<hr style="border: 0;border-top: 1px dotted #cccccc"/>
						</el-row>
						<el-row :gutter="12" class="function-right-row">
							<el-col :span="12">
								<el-form-item label="允许管理实体" title="r6001">
									<el-radio-group v-model="formModel.rightValueMap['r6001']">
										<el-radio :label="true">是</el-radio>
										<el-radio :label="false">否</el-radio>
									</el-radio-group>
								</el-form-item>
							</el-col>
							<el-col :span="12">
								<el-form-item label="允许删除实体" title="r6002">
									<el-radio-group v-model="formModel.rightValueMap['r6002']">
										<el-radio :label="true">是</el-radio>
										<el-radio :label="false">否</el-radio>
									</el-radio-group>
								</el-form-item>
							</el-col>
						</el-row>
						<el-row :gutter="12" class="function-right-row">
							<el-col :span="12">
								<el-form-item label="允许设计表单" title="r6003">
									<el-radio-group v-model="formModel.rightValueMap['r6003']">
										<el-radio :label="true">是</el-radio>
										<el-radio :label="false">否</el-radio>
									</el-radio-group>
								</el-form-item>
							</el-col>
							<el-col :span="12">
								<el-form-item label="允许配置列表布局" title="r6008">
									<el-radio-group v-model="formModel.rightValueMap['r6008']">
										<el-radio :label="true">是</el-radio>
										<el-radio :label="false">否</el-radio>
									</el-radio-group>
								</el-form-item>
							</el-col>
						</el-row>
						<el-row :gutter="12" class="function-right-row">
							<el-col :span="12">
								<el-form-item label="允许配置导航菜单" title="r6007">
									<el-radio-group v-model="formModel.rightValueMap['r6007']">
										<el-radio :label="true">是</el-radio>
										<el-radio :label="false">否</el-radio>
									</el-radio-group>
								</el-form-item>
							</el-col>
						</el-row>
						<el-row :gutter="12" class="function-right-row">
							<el-col :span="12">
								<el-form-item label="允许管理单选项" title="r6005">
									<el-radio-group v-model="formModel.rightValueMap['r6005']">
										<el-radio :label="true">是</el-radio>
										<el-radio :label="false">否</el-radio>
									</el-radio-group>
								</el-form-item>
							</el-col>
							<el-col :span="12">
								<el-form-item label="允许管理多选项" title="r6006">
									<el-radio-group v-model="formModel.rightValueMap['r6006']">
										<el-radio :label="true">是</el-radio>
										<el-radio :label="false">否</el-radio>
									</el-radio-group>
								</el-form-item>
							</el-col>
						</el-row>
						<el-row :gutter="12" class="function-right-row">
							<el-col :span="12">
								<el-form-item label="允许管理回收站" title="r6009">
									<el-radio-group v-model="formModel.rightValueMap['r6009']">
										<el-radio :label="true">是</el-radio>
										<el-radio :label="false">否</el-radio>
									</el-radio-group>
								</el-form-item>
							</el-col>
							<el-col :span="12">
								<el-form-item label="允许查看修改历史" title="r6010">
									<el-radio-group v-model="formModel.rightValueMap['r6010']">
										<el-radio :label="true">是</el-radio>
										<el-radio :label="false">否</el-radio>
									</el-radio-group>
								</el-form-item>
							</el-col>
						</el-row>
						<el-row :gutter="12" class="function-right-row">
							<el-col :span="12">
								<el-form-item label="允许导入数据" title="r6011">
									<el-radio-group v-model="formModel.rightValueMap['r6011']">
										<el-radio :label="true">是</el-radio>
										<el-radio :label="false">否</el-radio>
									</el-radio-group>
								</el-form-item>
							</el-col>
						</el-row>
					</el-tab-pane>
				</el-tabs>

			</el-form>
			<template #footer>
				<div class="dialog-footer">
					<el-button type="primary" @click="saveRole" style="width: 90px">保 存</el-button>
					<el-button @click="showRoleFormDialogFlag = false">取 消</el-button>
				</div>
			</template>
		</el-dialog>
	</el-container>
</template>

<script>
import DataList from '@/components/business/DataList/index.vue'
import {copyNew, isEmptyStr} from "@/utils/util";
import {getDataList} from "@/api/crud";
import {deleteRoleById, getBlankRoleData, getRoleData, saveRoleData} from "@/api/user";

export default {
	name: "RoleListView",
	components: {DataList},
	props: {
		entity: {
			type: String,
			default: 'Role'
		},
	},
	data() {
		return {
			fieldsList: 'roleName, disabled, description',

			columns: [
				{prop: 'roleName', label: '用户名称', width: '180', type: 'Text', align: 'center'},
				{prop: 'disabled', label: '是否禁用', width: '120', type: 'Boolean', align: 'left'},
				{prop: 'description', label: '角色描述', type: 'TextArea', align: 'center'},
			],

			page: {
				pageNo: 1,
				limit: 20,
				sizes: [10, 20, 30, 50, 100],
				total: 0
			},

			searchFilter: '',

			showRoleFormDialogFlag: false,

			rowRightLevels: [
				{label: '无权限', value: 0},
				{label: '本人', value: 10},
				{label: '本部门', value: 20},
				{label: '本部门及以下', value: 30},
				{label: '上级部门及以下', value: 40},
				{label: '全部数据', value: 50},
			],

			oneselfRightLevels: [
				{label: '无权限', value: 0},
				{label: '允许', value: 10},
			],

			simpleRightLevels: [
				{label: '无权限', value: 0},
				{label: '允许', value: 50},
			],

			formModel: {
				roleId: '',
				roleName: '',
				disabled: false,
				description: '',
				rightValueMap: {
					'r101-1': 20,
					'r101-2': 30,
					'r101-3': 50,
					'r101-4': 0,

					'r6001': false,
					'r6002': false,
					'r6003': false,
					'r6004': false,
					'r6005': false,
					'r6006': false,
					'r6007': false,
					'r6008': false,
					'r6009': true,
					'r6010': true,
					'r6011': true,
				},
			},

			rightEntityList: [],

			formRules: {
				roleName: [
					{validator: this.validateRoleName, trigger: 'blur'}
				],
			},
		}
	},
	computed: {
		formTitle() {
			return !!this.formModel.roleId ? '编辑权限角色' : '新建权限角色'
		},
	},
	mounted() {
		this.loadRoleData()
	},
	methods: {
		validateRoleName(rule, value, callback) {
			if (!value) {
				callback(new Error('请输入角色名称'))
				// this.$message.error('请输入角色名称')
				return
			}
			if (value.length < 2) {
				callback(new Error('请输入至少两个字符'))
				// this.$message.error('角色名称至少两个字符')
				return
			}
			if (value.length > 30) {
				callback(new Error('名字最多只能30个字符'))
				// this.$message.error('角色名称最多30字符')
				return
			}
			let regEx = /^[A-Za-z\d\u4e00-\u9fa5]+[_-]*/;
			if (!regEx.test(value)) {
				callback(new Error('请以中文、英文字母、数字开头，中间可输入下划线或横杠'))
				// this.$message.error('请以中文、英文字母、数字开头，中间可输入下划线或横杠')
				return
			}
			callback()

		},
		getRightLevels(rightEntity) {
			if (rightEntity.authorizable === true) {
				return this.rowRightLevels
			} else {
				return this.simpleRightLevels
			}
		},

		loadRoleData(filter) {
			let realFilter = isEmptyStr(filter) ? null : filter
			getDataList(this.entity, this.fieldsList, realFilter, this.page.limit, this.page.pageNo).then(res => {
				if (res.error != null) {
					this.$message({message: res.error, type: 'error'})
					return
				}

				this.$refs['dataList'].setTableData(this.columns, res.data.dataList)
				this.page.total = res.data.pagination.total
			}).catch(res => {
				this.$message({message: res.message, type: 'error'})
			})

		},

		addNewRole() {
			getBlankRoleData().then(res => {
				if (res.error != null) {
					this.$message({message: res.error, type: 'error'})
					return
				}

				let resData = res.data.data
				this.formModel.roleId = ''
				this.formModel.roleName = resData.roleName
				this.formModel.disabled = resData.disabled
				this.formModel.description = resData.description
				this.formModel.rightValueMap = resData.rightValueMap
				this.rightEntityList = copyNew(resData.rightEntityList)
				this.showRoleFormDialogFlag = true
			}).catch(res => {
				this.$message({message: res.message, type: 'error'})
			})
		},

		handleReadRightChange(entityCode, readRight) {
			this.adjustEntityRight(entityCode, 2, readRight)
			this.adjustEntityRight(entityCode, 3, readRight)
			this.adjustEntityRight(entityCode, 4, readRight)
		},

		adjustEntityRight(entityCode, rightType, readRight) {
			let entityRight = this.formModel.rightValueMap['r' + entityCode + '-' + rightType]
			if (!entityRight) {
				entityRight = 0
			}

			if (entityRight > readRight) {
				this.formModel.rightValueMap['r' + entityCode + '-' + rightType] = readRight
			}
		},

		handleEntityRightChange(entityCode, rightType, val) {
			let entityReadRight = this.formModel.rightValueMap['r' + entityCode + '-1']
			if (!entityReadRight) {
				entityReadRight = 0
			}

			if (val > entityReadRight) {
				let infoContent = '新建权限不能高于查看权限'
				if (rightType === 2) {
					//
				}
				if (rightType === 3) {
					infoContent = '修改权限不能高于查看权限'
				}
				if (rightType === 4) {
					infoContent = '删除权限不能高于查看权限'
				}
				this.$message.info(infoContent)
				this.formModel.rightValueMap['r' + entityCode + '-' + rightType] = entityReadRight
			}
		},

		saveRole() {

			this.$refs['roleForm'].validate((valid) => {

				if (valid) {
					//TODO 检查实体权限是否合理，比如删除权限是否大于读取权限
					saveRoleData(this.formModel).then(res => {
						if (res.error != null) {
							this.$message({message: res.error, type: 'error'})
							return
						}
						this.$message.success('保存成功')
						this.showRoleFormDialogFlag = false
						this.loadRoleData(this.searchFilter)
					}).catch(res => {
						this.$message({message: res.message, type: 'error'})
					})
				} else {
					this.$nextTick(() => {
						this.elFormErrorScrollIntoView();
					});
					return false;
				}
			})

		},
		elFormErrorScrollIntoView() {
			// 获取第一个校验错误的元素
			const element = document.querySelectorAll('.el-form-item__error')[0]
			// 滚动到错误元素对应位置
			element.scrollIntoView({
				behavior: 'smooth',
				block: 'center'
			})
		},


		editRole(row) {
			if (row.roleId === '023-000000000000000000000000000000000001') {
				this.$message.info('管理员角色禁止修改！')
				return
			}

			getRoleData(row.roleId).then(res => {
				if (res.error != null) {
					this.$message({message: res.error, type: 'error'})
					return
				}

				const resData = res.data.data
				this.formModel.roleId = resData.roleId
				this.formModel.roleName = resData.roleName
				this.formModel.disabled = resData.disabled
				this.formModel.description = resData.description
				this.formModel.rightValueMap = resData.rightValueMap
				this.rightEntityList = copyNew(resData.rightEntityList)
				this.showRoleFormDialogFlag = true
			}).catch(res => {
				this.$message({message: res.message, type: 'error'})
			})
		},

		deleteRole(row) {
			if (row.roleId === '023-000000000000000000000000000000000001') {
				this.$message.info('管理员角色禁止删除！')
				return
			}

			this.$confirm('是否删除该权限角色?', '删除确认').then(() => {
				deleteRoleById(row.roleId).then(res => {
					if (res.error != null) {
						this.$message({message: res.error, type: 'error'})
						return
					}

					this.$message.success('删除成功')
					this.loadRoleData(this.searchFilter)
				}).catch(res => {
					this.$message({message: res.message, type: 'error'})
				})
			}).catch(() => {
				this.$message.info('取消删除')
			})
		},

		handleSizeChange(val) {
			this.page.limit = val
			this.page.pageNo = 1
			this.loadRoleData(this.searchFilter)
		},

		handleCurrentChange(val) {
			this.page.pageNo = val
			this.loadRoleData(this.searchFilter)
		},

		handelTableRefresh() {
			this.loadRoleData(this.searchFilter)
		},

		searchRole(keyword) {
			this.searchFilter = `([roleName] like '%${keyword}%')`
			this.loadRoleData(this.searchFilter)
		},

		clearSearch() {
			this.searchFilter = ''
			this.loadRoleData();
		},

	},
}
</script>

<style lang="scss" scoped>
.el-container {
	width: 100% !important;
	overflow-x: hidden; /* 注意：IE浏览器中会出现水平滚动条，暂未找到原因！！ */
}

.small-padding :deep(.el-dialog__body) {
	padding: 18px;
}

.el-row.entity-right-row {
	margin-top: 6px;
	margin-bottom: 6px;
}

.el-row.function-right-row {
	margin-top: 0;
	margin-bottom: 0;

	:deep(.el-form-item) {
		margin-bottom: 6px;
	}
}

.el-row.entity-right-setting {
	margin-top: 0;
	margin-bottom: 0;
	font-size: 12px;
	//font-style: italic;

	.el-col.text-align-center {
		text-align: center;
	}

	.bold {
		//font-weight: 600;
		//text-decoration: underline;
	}
}

.el-row.function-right-setting {
	margin-top: 15px;
	margin-bottom: 0;
	font-size: 12px;
}

</style>
