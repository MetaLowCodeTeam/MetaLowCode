<template>
	<el-container class="field-props-container" v-loading="saveLoading">
		<el-header class="field-props-header" v-if="!showingInDialog">[文本]字段属性设置</el-header>
		<el-main class="field-props-pane">
			<el-form ref="editorForm" :model="fieldProps" :rules="rules" label-position="left"
					 label-width="220px" @submit.prevent>
				<el-form-item label="显示名称" prop="label">
					<el-input v-model="fieldProps.label" @change="handleFieldLabelChange"></el-input>
				</el-form-item>
				<el-form-item label="字段名称" prop="name">
					<el-input v-model="fieldProps.name" :disabled="fieldState !== 1">
						<template v-if="fieldState === 1" #append>
							<el-button @click="generateFieldName" style="color: var(--el-color-primary)">刷新生成</el-button>
						</template>
					</el-input>
				</el-form-item>
                <el-collapse accordion class="mb-10">
                    <el-collapse-item name="1">
                        <template #title>
                            <span class="field-editor-collapse-title">默认值设置</span>
                            <el-tooltip content="该默认值设置后需在表单设计里重新拖拽，才可生效" placement="top">
                                <span class="ml-5">
                                    <el-icon class="icon-top-2">
                                        <info-filled />
                                    </el-icon>
                                </span>
                            </el-tooltip>
                        </template>
                        <el-form-item label="最小长度">
                            <el-input-number v-model="fieldProps.fieldViewModel.minLength"
                                            :min="0" :max="190" style="width: 100%"></el-input-number>
                        </el-form-item>
                        <el-form-item label="最大长度（建议不超过200）">
                            <el-input-number v-model="fieldProps.fieldViewModel.maxLength"
                                            :min="0" :max="500" style="width: 100%"></el-input-number>
                        </el-form-item>
                    </el-collapse-item>
                </el-collapse>
				<el-form-item label="字段值是否唯一/不可重复">
					<el-radio-group v-model="fieldProps.fieldViewModel.uniqueness" style="float: right">
						<el-radio :value="true">是</el-radio>
						<el-radio :value="false">否</el-radio>
					</el-radio-group>
				</el-form-item>
				<el-form-item label="是否在列表中默认显示">
					<el-radio-group v-model="fieldProps.defaultMemberOfListFlag" style="float: right">
						<el-radio :value="true">是</el-radio>
						<el-radio :value="false">否</el-radio>
					</el-radio-group>
				</el-form-item>
				<el-form-item label="是否允许空值">
					<el-radio-group v-model="fieldProps.nullable" style="float: right" @change="handleNullableChange">
						<el-radio :value="true">是</el-radio>
						<el-radio :value="false">否</el-radio>
					</el-radio-group>
				</el-form-item>
				<el-form-item label="新建记录时允许修改字段">
					<el-radio-group v-model="fieldProps.creatable" style="float: right" :disabled="!fieldProps.nullable">
						<el-radio :value="true">是</el-radio>
						<el-radio :value="false">否</el-radio>
					</el-radio-group>
				</el-form-item>
				<el-form-item label="更新记录时允许修改字段">
					<el-radio-group v-model="fieldProps.updatable" style="float: right">
						<el-radio :value="true">是</el-radio>
						<el-radio :value="false">否</el-radio>
					</el-radio-group>
				</el-form-item>
                <el-form-item label="仅触发器可赋值" v-if="fieldProps.updatable">
					<el-radio-group v-model="fieldProps.extraAttrs.onlyUpdateByTrigger" style="float: right">
						<el-radio :value="true">是</el-radio>
						<el-radio :value="false">否</el-radio>
					</el-radio-group>
				</el-form-item>
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
import FieldState from '@/views/system/field-state-variables'
import {fieldEditorMixin} from "@/views/system/field-editor/field-editor-mixin";

export default {
	name: "TextWidgetEditor",
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
				'type': 'Text',
				'defaultMemberOfListFlag': true,
				'nullable': false,
				'creatable': true,
				'updatable': true,
                'extraAttrs': {
                    'onlyUpdateByTrigger': false,
                },
				'fieldViewModel': {
					'minLength': 0,
					'maxLength': 200,
					uniqueness: false,
					'validators': [],
				},
			},

			validators: [
				{value: 'number', label: '数字'},
				{value: 'letterStartNumberIncluded', label: '字母开头可包含数字'},
				{value: 'mobile', label: '手机号码'},
				{value: 'noChinese', label: '禁止中文'},
				{value: 'email', label: '电子邮箱'},
				{value: 'url', label: 'URL网址'},
			],

		}
	},
	mounted() {
		//mixin
	},
	methods: {
		saveField() {
            if (!this.validateField()) {
				return
			}
			this.doSave('Text')
		},

		cancelSave() {
			this.$emit('cancelSave')
		},
        handleNullableChange(){
            if(!this.fieldProps.nullable){
                this.fieldProps.creatable = true;
            }
        },

	}
}
</script>

<style lang="scss" scoped>
@use "@/style/form-layout/field-editor-common.scss";
</style>
