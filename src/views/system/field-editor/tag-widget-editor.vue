<template>
	<el-container class="field-props-container">
		<el-header class="field-props-header" v-if="!showingInDialog">[多选项]字段属性设置</el-header>
		<el-main class="field-props-pane">
			<el-form ref="editorForm" :model="fieldProps" :rules="rules" label-position="left"
					 label-width="220px" @submit.prevent>
				<el-form-item label="字段名称" prop="name">
					<el-input v-model="fieldProps.name" :disabled="fieldState !== 1"></el-input>
				</el-form-item>
				<el-form-item label="显示名称" prop="label">
					<el-input v-model="fieldProps.label"></el-input>
				</el-form-item>
				<el-form-item label="字段校验函数(可多选)" prop="fieldViewModel.validators">
					<el-select multiple allow-create filterable default-first-option :popper-append-to-body="false"
							   v-model="fieldProps.fieldViewModel.validators" style="width: 100%">
						<el-option
							v-for="(vt, vtIdx) in validators"
							:key="vtIdx"
							:label="vt.label"
							:value="vt.value">
						</el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="是否在列表中默认显示">
					<el-radio-group v-model="fieldProps.defaultMemberOfListFlag" style="float: right">
						<el-radio :label="true">是</el-radio>
						<el-radio :label="false">否</el-radio>
					</el-radio-group>
				</el-form-item>
				<el-form-item label="是否允许空值">
					<el-radio-group v-model="fieldProps.nullable" style="float: right">
						<el-radio :label="true">是</el-radio>
						<el-radio :label="false">否</el-radio>
					</el-radio-group>
				</el-form-item>
				<el-form-item label="新建记录时允许修改字段">
					<el-radio-group v-model="fieldProps.creatable" style="float: right">
						<el-radio :label="true">是</el-radio>
						<el-radio :label="false">否</el-radio>
					</el-radio-group>
				</el-form-item>
				<el-form-item label="更新记录时允许修改字段">
					<el-radio-group v-model="fieldProps.updatable" style="float: right">
						<el-radio :label="true">是</el-radio>
						<el-radio :label="false">否</el-radio>
					</el-radio-group>
				</el-form-item>
				<el-card class="box-card" shadow="never">
					<template #header>
						<div class="clear-fix">
							<span>选项管理</span>
							<el-button style="float: right; padding: 3px 0" link type="primary" @click="addTag">
								新增选项
							</el-button>
						</div>
					</template>
					<!--
					<div class="clear-fix">(空值)</div>
					-->
					<div v-for="(tagItem, idx) in tagItems" :key="idx" class="clear-fix" @mouseenter="hoverIdx = idx"
						 @mouseleave="hoverIdx = -1">
						{{ tagItem.label }}
						<div class="tag-item" v-if="!!tagItem.value && (hoverIdx === idx)">
							<el-button link type="primary" class="tag-item-insert" title="插入" icon="el-icon-plus"
									   @click="insertTag(idx)"></el-button>
							<el-button link type="primary" class="tag-item-up" title="上移" icon="el-icon-top"
									   @click="upTag(idx)"></el-button>
							<el-button link type="primary" class="tag-item-down" title="下移" icon="el-icon-bottom"
									   @click="downTag(idx)"></el-button>
							<el-button link type="primary" class="tag-item-edit" title="编辑" icon="el-icon-edit"
									   @click="editTag(idx)"></el-button>
							<el-button link type="primary" class="tag-item-delete" title="删除" icon="el-icon-delete"
									   @click="deleteTag(idx)"></el-button>
						</div>
					</div>
				</el-card>
				<hr style="border: 0;margin-bottom: 15px" />
				<el-form-item>
					<el-button type="primary" style="width: 120px" @click="saveField">保存字段</el-button>
					<el-button v-if="!!showingInDialog" @click="cancelSave">取消</el-button>
				</el-form-item>
			</el-form>
		</el-main>
	</el-container>
</template>

<script>
import {addTagField, updateTagField, getField, getTagItems} from '@/api/system-manager'
import FieldState from "@/views/system/field-state-variables";
import {fieldEditorMixin} from "@/views/system/field-editor/field-editor-mixin";
import {copyObj} from "@/utils/util";

export default {
	name: "TagWidgetEditor",
	props: {
		entity: String,
		fieldName: String,
		showingInDialog: Boolean,
		fieldState: {
			type: Number,
			default: FieldState.NEW,
		}
	},
	mixins: [fieldEditorMixin],
	data() {
		return {
			fieldProps: {
				'name': '',
				'label': '',
				'type': 'Tag',
				'defaultMemberOfListFlag': false,
				'nullable': false,
				'creatable': true,
				'updatable': true,
				'fieldViewModel': {
					'validators': [],
				},
			},

			tagItems: [],

			hoverIdx: -1,

			validators: [],

		}
	},
	mounted() {
		if (this.fieldState === FieldState.EDIT) {
			this.getFieldProps()
		}
	},
	methods: {
		getFieldProps() {
			getField(this.fieldName, this.entity).then(res => {
				if (res.error != null) {
					this.$message({message: res.error, type: 'error'})
					return
				}

				this.readFieldProps(res.data)
			}).catch(res => {
				this.$message({message: res.message, type: 'error'})
			})
		},

		readFieldProps(savedProps) {
			copyObj(this.fieldProps, savedProps)
			if (!!savedProps.entityCode) {
				this.fieldProps.entityCode = savedProps.entityCode
			}

			getTagItems(this.entity, this.fieldName).then(res => {
				if (res.error != null) {
					this.$message({message: res.error, type: 'error'})
					return
				}

				this.tagItems = !res.data ? [] : res.data
			}).catch(res => {
				this.$message({message: res.message, type: 'error'})
			})
		},

		saveField() {
			let validResult = true
			this.$refs['editorForm'].validate((success) => {
				if (!success) {
					validResult = false
					return false
				}
			})
			if (!validResult) return

			this.fieldProps.type = 'Tag'
			let tagList = []
			this.tagItems.forEach((item) => {
				if (!!item.label) {
					tagList.push(item.label)
				}
			})


			let saveMethod = addTagField
			if (this.fieldState === FieldState.EDIT) {
				saveMethod = updateTagField
			}
			saveMethod(this.fieldProps, this.entity, tagList).then(res => {
				if (res.error != null) {
					this.$message({message: res.error, type: 'error'})
					return
				}

				this.$message.success('保存成功')
				this.$emit('fieldSaved')
			}).catch(res => {
				this.$message({message: res.message, type: 'error'})
			})
		},

		cancelSave() {
			this.$emit('cancelSave')
		},

		validateTag(tagTxt, tagIdx) {
			let result = true
			this.tagItems.forEach((item, idx) => {
				if ((item.label === tagTxt) && (idx !== tagIdx))
					result = false
			})
			return result
		},

		addTag() {
			this.$prompt('请输入选项名称', '提示', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				inputPattern: /^[A-Za-z\u4e00-\u9fa5\d]+$/, /* 匹配由字母大小写、汉字或数字组成的字符串 */
				inputErrorMessage: '输入不正确'
			}).then(({value}) => {
				if (this.validateTag(value, -1)) {
					let newTag = {'label': value, 'value': value, 'saved': false}
					this.tagItems.push(newTag)
					this.$nextTick(() => {
						console.log('Updated!')
					})
				} else {
					this.$message.warning('选项已存在')
				}
			}).catch(() => {
				this.$message.info('已取消')
			})
		},

		insertTag(tagIdx) {
			this.$prompt('请输入选项名称', '提示', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				inputPattern: /^[A-Za-z\u4e00-\u9fa5\d]+$/, /* 匹配由字母大小写、汉字或数字组成的字符串 */
				inputErrorMessage: '输入不正确'
			}).then(({value}) => {
				if (this.validateTag(value, -1)) {
					let newTag = {'label': value, 'value': value, 'saved': false}
					this.tagItems.splice(tagIdx + 1, 0, newTag)
					this.$nextTick(() => {
						console.log('Updated!')
					})
				} else {
					this.$message.warning('选项已存在')
				}
			}).catch(() => {
				this.$message.info('已取消')
			})
		},

		upTag(tagIdx) {
			if (tagIdx === 0) {
				this.$message.info('已到最上')
				return
			}

			let tempTag = this.tagItems[tagIdx]
			this.tagItems[tagIdx] = this.tagItems[tagIdx - 1]
			this.tagItems[tagIdx - 1] = tempTag
		},

		downTag(tagIdx) {
			console.log('length: ' + this.tagItems.length + ', current idx: ' + tagIdx)
			if (tagIdx === (this.tagItems.length - 1)) {
				this.$message.info('已到最下')
				return
			}

			let tempTag = this.tagItems[tagIdx]
			this.tagItems[tagIdx] = this.tagItems[tagIdx + 1]
			this.tagItems[tagIdx + 1] = tempTag
		},

		editTag(tagIdx) {
			let oldTagLabel = this.tagItems[tagIdx].label
			this.$prompt('请修改选项名称', '提示', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				inputValue: oldTagLabel,
				inputPattern: /^[A-Za-z\u4e00-\u9fa5\d]+$/, /* 匹配由字母大小写、汉字或数字组成的字符串 */
				inputErrorMessage: '输入不正确'
			}).then(({value}) => {
				if (this.validateTag(value, oldTagLabel)) {
					this.tagItems[tagIdx].label = value
					this.$nextTick(() => {
						console.log('Updated!')
					})
				} else {
					this.$message.warning('选项已存在')
				}
			}).catch(() => {
				this.$message.info('已取消')
			})
		},

		deleteTag(tagIdx) {
			console.log(tagIdx)
			this.$confirm('确定删除该选项?', '提示').then(() => {
				this.tagItems.splice(tagIdx, 1)
				this.$message.info('选项已删除')
			}).catch(() => {
				this.$message.info('取消删除')
			})
		},

	}
}
</script>

<style lang="scss" scoped>
@import "@/style/form-layout/field-editor-common.scss";

.box-card {
	font-size: 14px;

	:deep(.el-card__body) {
		height: 220px;
		overflow: auto;
	}

	.tag-item {
		float: right;
		height: 22px;
		line-height: 22px;
		position: relative;

		.tag-item-insert {
			position: absolute;
			top: -8px;
			left: -100px;
		}

		.tag-item-up {
			position: absolute;
			top: -7px;
			left: -86px;
		}

		.tag-item-down {
			position: absolute;
			top: -7px;
			left: -66px;
		}

		.tag-item-edit {
			position: absolute;
			top: -7px;
			left: -42px;
		}

		.tag-item-delete {
			position: absolute;
			top: -8px;
			left: -18px;
		}
	}
}

.clear-fix:before, .clear-fix:after {
	display: table;
	content: "";
}

.clear-fix:after {
	clear: both
}
</style>
