<template>
	<v-form-designer ref="vfDesigner"
					 :designer-config="designerConfig"
					 :field-list-data="fieldListData"
					 @field-widget-used="handleFWU"
					 @field-widget-removed="handleFWR"
					 @form-json-updated="handleFJU"
					 class="visual-design">
		<!-- 配置工具按钮 -->
		<template #customToolButtons>
			<el-dropdown class="ml-button-dropdown" @command="handleNewFieldCommand" size="small">
				<el-button link type="primary">
					<el-icon ><MagicStick /></el-icon>新建字段
				</el-button>
				<template #dropdown>
					<el-dropdown-menu>
						<el-dropdown-item command="BooleanWE">布尔 / Boolean</el-dropdown-item>
						<el-dropdown-item command="IntegerWE">整数 / Integer</el-dropdown-item>
						<el-dropdown-item command="DecimalWE">精度小数 / Decimal</el-dropdown-item>
						<el-dropdown-item command="PercentWE">百分比 / Percent</el-dropdown-item>
						<el-dropdown-item command="MoneyWE">金额 / Money</el-dropdown-item>
						<el-dropdown-item command="TextWE" divided>文本 / Text</el-dropdown-item>
						<el-dropdown-item command="TextAreaWE">长文本 / TextArea</el-dropdown-item>
						<el-dropdown-item command="OptionWE" divided>单选项 / Option</el-dropdown-item>
						<el-dropdown-item command="TagWE">多选项 / Tag</el-dropdown-item>
						<el-dropdown-item command="DateWE" divided>日期 / Date</el-dropdown-item>
						<el-dropdown-item command="DateTimeWE">日期时间 / DateTime</el-dropdown-item>
						<el-dropdown-item command="PictureWE" divided>图片 / Picture</el-dropdown-item>
						<el-dropdown-item command="FileWE">文件 / File</el-dropdown-item>
						<el-dropdown-item command="ReferenceWE" divided>一对一引用 / Reference</el-dropdown-item>
					</el-dropdown-menu>
				</template>
			</el-dropdown>
			<el-button type="primary" link @click="saveDesign">
				<el-icon>
					<Finished/>
				</el-icon>
				保存设计
			</el-button>
		</template>
	</v-form-designer>

	<el-dialog :title="'新建字段 / ' + curEditorType" v-model="showNewFieldDialogFlag"
			   v-if="showNewFieldDialogFlag"
			   :show-close="true" :destroy-on-close="true" :close-on-click-modal="false"
			   :close-on-press-escape="false" class="no-padding" width="620px">
		<component :is="curFWEditor" :entity="entity" @fieldSaved="onFieldSaved" @cancelSave="onCancelSaveField"
				   :showingInDialog="true"></component>
	</el-dialog>
</template>

<script>
import {createFormLayout, updateFormLayout, getFormLayout, getMDFieldList} from '@/api/system-manager'
import {deepClone, overwriteObj} from "@/utils/util";
import {formFieldMapping} from "@/views/system/form-design/formFieldMapping";
import BooleanWE from '@/views/system/field-editor/boolean-widget-editor.vue';
import IntegerWE from '@/views/system/field-editor/integer-widget-editor.vue';
import DecimalWE from '@/views/system/field-editor/decimal-widget-editor.vue';
import PercentWE from '@/views/system/field-editor/percent-widget-editor.vue';
import MoneyWE from '@/views/system/field-editor/money-widget-editor.vue';
import TextWE from '@/views/system/field-editor/text-widget-editor.vue';
import EmailWE from '@/views/system/field-editor/email-widget-editor.vue';
import UrlWE from '@/views/system/field-editor/url-widget-editor.vue';
import TextAreaWE from '@/views/system/field-editor/textarea-widget-editor.vue';
import PasswordWE from '@/views/system/field-editor/password-widget-editor.vue';
import OptionWE from '@/views/system/field-editor/option-widget-editor.vue';
import TagWE from '@/views/system/field-editor/tag-widget-editor.vue';
import DateWE from '@/views/system/field-editor/date-widget-editor.vue';
import DateTimeWE from '@/views/system/field-editor/datetime-widget-editor.vue';
import PictureWE from '@/views/system/field-editor/picture-widget-editor.vue';
import FileWE from '@/views/system/field-editor/file-widget-editor.vue';
import ReferenceWE from '@/views/system/field-editor/reference-widget-editor.vue';
import AnyReferenceWE from '@/views/system/field-editor/anyreference-widget-editor.vue';
import ReferenceListWE from '@/views/system/field-editor/referencelist-widget-editor.vue';

export default {
	name: "form-design",
	components: {
		BooleanWE,
		IntegerWE,
		DecimalWE,
		PercentWE,
		MoneyWE,
		TextWE,
		EmailWE,
		UrlWE,
		TextAreaWE,
		PasswordWE,
		OptionWE,
		TagWE,
		DateWE,
		DateTimeWE,
		PictureWE,
		FileWE,
		ReferenceWE,
		AnyReferenceWE,
		ReferenceListWE,
	},
	prop: {
		entity: {
			type: String,
		},
		entityLabel: {
			type: String
		}
	},
	data() {
		return {
			designerConfig: {
				componentLib: false,
				formTemplates: false,
				metadataLib: true,
				logoHeader: false,
				exportCodeButton: false,
				generateSFCButton: false,
				toolbarMaxWidth: 300,
			},
			fieldListData: {},
			layoutId: null,
			formOptionData: {},

			meteFieldsResult: null,
			usedFieldNames: {},

			curFWEditor: '',
			curEditorType: '',
			showNewFieldDialogFlag: false,
		}
	},
	created() {
		this.entity = this.$route.query.entity
		this.entityLabel = this.$route.query.entityLabel
	},
	mounted() {
		this.loadDesign()
	},
	methods: {
		addMetaField() {
			this.$message.info('待实现...')
		},

		loadFieldListData() {
			getMDFieldList(this.entity).then(res => {
				if (res.data.fieldList) {
					this.fieldListData.fieldList = res.data.fieldList
					if (res.data.subFormList) {
						this.fieldListData.subFormList = res.data.subFormList
					}
					this.meteFieldsResult = res
					const metaFields = this.buildMetaFields(this.meteFieldsResult)
					this.$refs.vfDesigner.setFieldListData(this.fieldListData)
					this.$refs.vfDesigner.setMetaFields(metaFields)
				}
			}).catch(res => {
				this.$message({message: res.message, type: 'error'})
			})
		},

		buildMetaFields(mdResult) {
			const result = {
				main: {
					entityName: this.entity,
					entityLabel: this.entityLabel,
					fieldList: []
				},
				detail: []
			}

			if (mdResult.data.fieldList) {
				mdResult.data.fieldList.forEach(fld => {
					if (!fld.detailEntity && (fld.type !== 'PrimaryKey')) {  //跳过id主键
						if (fld.name === 'loginPwd') {
							return
						}

						if ((fld.type === 'AnyReference') || (fld.type === 'ReferenceList')) {
							return
						}

						if (this.usedFieldNames.hasOwnProperty(fld.name)) {
							return //跳过本次循环
						}

						const fieldNewProps = deepClone(formFieldMapping[fld.type])
						const fieldSchema = deepClone( this.$refs.vfDesigner.designer.getFieldWidgetByType( fieldNewProps.type ) )
						overwriteObj(fieldSchema.options, fieldNewProps.options)

						fieldSchema.displayName = fld.label
						fieldSchema.nameReadonly = true
						fieldSchema.options.name = fld.name
						fieldSchema.options.label = fld.label
						this.adjustFieldSchema(fieldSchema, fld)
						result.main.fieldList.push(fieldSchema)
					}
				})
			}

			if (mdResult.data.subFormList) {
				mdResult.data.subFormList.forEach(sf => {
					const deName = sf.name
					const deLabel = sf.label
					const detailDataItem = {
						entityName: deName,
						entityLabel: deLabel,
						fieldList: []
					}

					mdResult.data.fieldList.forEach(fld => {
						if (fld.detailEntity && (fld.detailEntity === deName) && (fld.type !== 'PrimaryKey')) {  //跳过id主键
							if ((fld.type === 'AnyReference') || (fld.type === 'ReferenceList')) {
								return
							}

							if (this.usedFieldNames.hasOwnProperty(fld.name)) {
								return //跳过本次循环
							}

							const fieldNewProps = deepClone(formFieldMapping[fld.type])
							const fieldSchema = deepClone( this.$refs.vfDesigner.designer.getFieldWidgetByType( fieldNewProps.type ) )
							overwriteObj(fieldSchema.options, fieldNewProps.options)

							fieldSchema.displayName = fld.label
							fieldSchema.nameReadonly = true
							fieldSchema.options.name = fld.name
							fieldSchema.options.label = fld.label
							this.adjustFieldSchema(fieldSchema, fld)
							detailDataItem.fieldList.push(fieldSchema)
						}
					})

					result.detail.push(detailDataItem)
				})
			}

			return result
		},

		adjustFieldSchema(fieldSchema, fldObj) {
			if (fieldSchema.options.hasOwnProperty('optionItems')) {
				if (this.formOptionData.hasOwnProperty(fieldSchema.options.name)) {
					fieldSchema.options.optionItems = deepClone( this.formOptionData[fieldSchema.options.name] )
				}

				if (fldObj.type === 'Boolean') {
					fieldSchema.options.optionItems = [
						{ value: true, label: '是'},
						{ value: false, label: '否'},
						{ value: null, label: '未指定'},
					]
				}

				fieldSchema.optionItemsReadonly = true
			}

			if (fldObj.hasOwnProperty('required')) {
				fieldSchema.options.required = fldObj['required'] === "1"
			}

			//
		},

		handleFWU(fwName) {
			this.usedFieldNames[fwName] = 1

			/* 必须延时处理，否则draggable会报错 */
			setTimeout(() => {
				const metaFields = this.buildMetaFields(this.meteFieldsResult)
				this.$refs.vfDesigner.setMetaFields(metaFields)
			}, 800)
		},

		handleFWR(fwName) {
			delete this.usedFieldNames[fwName]

			/* 必须延时处理，否则draggable会报错 */
			setTimeout(() => {
				const metaFields = this.buildMetaFields(this.meteFieldsResult)
				this.$refs.vfDesigner.setMetaFields(metaFields)
			}, 800)
		},

		handleFJU() {
			this.handleUsedFields()
			setTimeout(() => {
				const metaFields = this.buildMetaFields(this.meteFieldsResult)
				this.$refs.vfDesigner.setMetaFields(metaFields)
			}, 300)
		},

		/**
		 * 过滤已使用字段组件
		 */
		handleUsedFields() {
			//console.error('aaaaaaaaaa')

			this.usedFieldNames = {}
			const allFieldWidgets = this.$refs.vfDesigner.getFieldWidgets()
			allFieldWidgets.forEach(fwItem => {
				this.usedFieldNames[fwItem.name] = 1
			})
		},

		loadDesign() {
			getFormLayout(this.entity).then(res => {
				if (res.error != null) {
					this.$message({message: res.error, type: 'error'})
					return
				}

				if (!!res.data && !!res.data.layoutJson) {
					this.layoutId = res.data.formLayoutId
					this.$refs.vfDesigner.setFormJson(res.data.layoutJson)
					this.handleUsedFields()
				} else {
					this.$refs.vfDesigner.clearDesigner()
				}

				if (!!res.data && !!res.data.optionData) {
					this.formOptionData = res.data.optionData
					this.$refs.vfDesigner.setTestOptionData(res.data.optionData)
				}

				this.loadFieldListData()
			}).catch(res => {
				this.$message({message: res.message, type: 'error'})
			})
		},

		saveDesign() {
			//TODO: 检查表单设计是否符合规范！！！
			/**
			 * 1. 必填字段必须添加到表单；
			 * 2. 子表单名称关联到明细实体，必须正确设置；
			 * 3. 主实体字段不能出现在子表单中、明细实体字段只能出现在明细实体关联的子表单中。
			 */

			if (!this.layoutId) {
				createFormLayout(this.entity, this.$refs.vfDesigner.getFormJson()).then(res => {
					if (res.error != null) {
						this.$message({message: res.error, type: 'error'})
						return
					}

					this.layoutId = res.data
					this.$message.success('保存成功')
				}).catch(res => {
					this.$message({message: res.message, type: 'error'})
				})
			} else {
				updateFormLayout(this.layoutId, this.$refs.vfDesigner.getFormJson()).then(res => {
					if (res.error != null) {
						this.$message({message: res.error, type: 'error'})
					} else {
						this.$message.success('保存成功')
					}
				}).catch(res => {
					this.$message({message: res.message, type: 'error'})
				})
			}
		},

		handleNewFieldCommand(command) {
			// TODO: 此处应该判断是否具备实体字段创建权限！！

			this.curFWEditor = command
			this.curEditorType = command.replace(/WE$/, '')
			this.showNewFieldDialogFlag = true
		},

		onFieldSaved() {
			this.showNewFieldDialogFlag = false
			setTimeout(() => {
				this.loadFieldListData()  //重新加载元数据字段
			}, 300)
		},

		onCancelSaveField() {
			this.showNewFieldDialogFlag = false
		},

	}
}
</script>

<style scoped>
:deep(.toolbar-header .toolbar-container) {
	width: 100%;
}

.el-button + .el-dropdown {
	margin-left: 0 !important;
}

</style>
<style>
.main-container.visual-design li {
	box-sizing: content-box !important;
}

.ds-setting-drawer .el-drawer__body {
	padding: 20px !important;
}

.el-dropdown.ml-button-dropdown {
	height: 45px;
}

.form-widget-container, .form-render-wrapper {
	.el-form-item--default, .el-form-item {
		margin-bottom: 5px !important;
	}
}

</style>
