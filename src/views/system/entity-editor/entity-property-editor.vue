<template>
	<el-container class="entity-props-container">
		<el-header v-if="showTitle" class="entity-props-header">&lt;实体&gt;属性设置</el-header>
		<el-main class="entity-props-pane">
			<el-form :model="entityProps" :rules="rules" ref="entityPropsForm" label-position="left"
					 label-width="230px">
				<el-form-item label="显示名称" prop="label">
					<el-input v-model="entityProps.label" minlength="2"
							  placeholder="以中文、英文字母、数字开头，中间可输入下划线或横杠" @change="handleEntityLabelChange"></el-input>
				</el-form-item>
				<el-form-item label="实体名称" prop="name"> <!-- prop必须跟v-model名称一致！！ -->
					<el-input v-model="entityProps.name" minlength="2"
							  placeholder="英文大写字母开头，不可包含中文、空格，中间可输入字母、下划线或横杠">
						<template #append>
							<el-button @click="generateEntityName">刷新生成</el-button>
						</template>
					</el-input>
				</el-form-item>
				<el-form-item label="实体编码">
					<el-input v-model="entityProps.entityCode" readonly disabled
							  placeholder="系统自动生成"></el-input>
				</el-form-item>
				<el-form-item label="是否允许设计表单">
					<el-switch style="display: block; float: right" v-model="entityProps.layoutable"
							   active-text="是" inactive-text="否">
					</el-switch>
				</el-form-item>
				<el-form-item label="是否允许设计列表">
					<el-switch style="display: block; float: right" v-model="entityProps.listable"
							   active-text="是" inactive-text="否">
					</el-switch>
				</el-form-item>
				<el-form-item label="是否开启记录级权限">
					<el-switch style="display: block; float: right" v-model="entityProps.authorizable"
							   active-text="是" inactive-text="否" @change="changeAuthorization">
					</el-switch>
				</el-form-item>
				<!--
				<el-form-item label="是否允许分配记录">
				  <el-switch style="display: block; float: right" v-model="entityProps.assignable"
							 active-text="开启" inactive-text="禁用" :disabled="!entityProps.authorizable">
				  </el-switch>
				</el-form-item>
				<el-form-item label="是否允许共享记录">
				  <el-switch style="display: block; float: right" v-model="entityProps.shareable"
							 active-text="开启" inactive-text="禁用" :disabled="!entityProps.authorizable">
				  </el-switch>
				</el-form-item>
				-->
				<el-form-item>
					<template #label>
						是否明细实体<el-tooltip content="明细实体不能单独设置权限，受主实体控制" effect="light">
							<el-icon><InfoFilled /></el-icon>
						</el-tooltip>
					</template>
					<el-switch style="display: block; float: right" v-model="entityProps.detailEntityFlag"
							   active-text="是" inactive-text="否" @change="onToggleDetailEntityFlag">
					</el-switch>
				</el-form-item>
				<el-form-item label="所属主实体">
					<el-input readonly :disabled="!entityProps.detailEntityFlag" v-model="mainEntityName">
						<template #append v-if="!!entityProps.detailEntityFlag && !!mainEntityName">
							<el-button icon="el-icon-close" title="清除"
									   @click="clearMainEntity"></el-button>
						</template>
						<template #append v-else-if="!!entityProps.detailEntityFlag">
							<el-button icon="el-icon-search" title="选择主实体"
									   @click="showEntityListDialog"></el-button>
						</template>
					</el-input>
				</el-form-item>
			</el-form>
		</el-main>

		<el-dialog ref="selectMainEntityDlg" title="选择主实体" v-model="showMainEntityDialogFlag"
				   :append-to-body="true"
				   class="no-padding" width="560px">
			<SimpleTable :show-pagination="false" :show-check-box="false" :table-size="'small'" :columns="columns"
						 :show-operation-column="true" :data="tableData" :max-height="420">
				<template #table_operation="{scope}">
					<el-button class="" icon="el-icon-check" @click="selectMainEntity(scope.row)">选择</el-button>
				</template>
			</SimpleTable>
		</el-dialog>
	</el-container>
</template>

<script>
import {getSimplePinYin, upperFirstLetter} from "@/utils/util";

export default {
	name: "EntityPropEditor",
	props: ['entityProps', 'showTitle', 'filterEntityMethod'],
	data() {
		return {
			rules: {
				name: [
					{required: true, message: '请输入实体名称', trigger: 'blur'},
					{
						pattern: /^[A-Z]+[A-Za-z\d_-]*$/,
						message: '英文大写字母开头，不可包含中文、空格，中间可输入字母、下划线或横杠',
						trigger: 'blur'
					},
					{min: 2, max: 30, message: '文字长度应在2-30之间', trigger: 'blur'},
				],
				label: [
					{required: true, message: '请输入显示名称', trigger: 'blur'},
					{
						pattern: /^[A-Za-z\d\u4e00-\u9fa5\uff0c\u3001\uff1b\uff1a\uff08\uff09\u2014\u201c\u201d]+[_-]*[A-Za-z\d\u4e00-\u9fa5\uff0c\u3001\uff1b\uff1a\uff08\uff09\u2014\u201c\u201d]/,
						message: '以中文、英文字母、数字开头，中间可输入下划线或横杠',
						trigger: 'blur'
					},
					{min: 2, max: 30, message: '文字长度应在2-30之间', trigger: 'blur'},
				],
			},

			showMainEntityDialogFlag: false,
			mainEntityName: '',

			columns: [
				{prop: 'name', label: '实体名称', width: '150', align: 'center'},
				{prop: 'label', label: '显示名称', width: '200', align: 'center', formatter: this.formatter},
			],
			tableData: [],
		}
	},

	methods: {
		onToggleDetailEntityFlag(val) {
			if (!!val) {
				this.entityProps.authorizable = false
			}
		},

		showEntityListDialog() {
			if (!this.entityProps.detailEntityFlag) {
				return
			}

			if (!!this.filterEntityMethod) {
				this.filterEntityMethod(this.tableData, () => {
					this.showMainEntityDialogFlag = true
				})
			}
		},

		selectMainEntity(row) {
			if (!!row) {
				this.entityProps.mainEntity = row.name
				this.mainEntityName = row.label + '(' + row.name + ')'
				this.showMainEntityDialogFlag = false
			}
		},

		clearMainEntity() {
			this.mainEntityName = ''
			this.entityProps.mainEntity = ''
		},

		changeAuthorization(value) {
			if (!value) {
				this.entityProps.assignable = false
				this.entityProps.shareable = false
			} else {
				this.entityProps.detailEntityFlag = false
			}
		},

		validateForm(callback) {
			this.$refs['entityPropsForm'].validate((success) => {
				if (!success) {
					this.$message.error('数据不合规范，请检查')
				} else {
					if (!!this.entityProps.detailEntityFlag && !this.mainEntityName) {
						this.$message.info('请选择所属主实体')
						return
					}

					callback()
				}
			})
		},

		handleEntityLabelChange(val) {
			if (!val) {
				return
			}

			if (!this.entityProps.name) {
				const pyName = getSimplePinYin(val)
				this.entityProps.name = upperFirstLetter(pyName)
			}
		},

		generateEntityName() {
			let newName = getSimplePinYin(this.entityProps.label)
			this.entityProps.name = upperFirstLetter(newName)
		},

	},
}
</script>

<style lang="scss" scoped>
.el-container.entity-props-container {
	min-width: 500px;
	border: 1px solid #e5e5e5;
}

.el-header.entity-props-header {
	/* background: $--color-primary; */
	background: #cac6c6;
	color: #ffffff;
	text-align: center;
	line-height: 36px !important;
	height: 36px !important;
}

.el-main.entity-props-pane {
	padding: 20px;

	.float-right {
		float: right;
	}
}

:deep(.no-padding .el-dialog__body) {
	padding: 0;
}

:deep(.el-form-item__label) {
	align-items: center;
}

/*:deep(.el-switch__label) * {*/
/*  font-size: 12px;*/
/*}*/
</style>
