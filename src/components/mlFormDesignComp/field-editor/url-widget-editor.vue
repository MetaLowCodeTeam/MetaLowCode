<template>
	<el-container class="field-props-container">
		<el-header class="field-props-header" v-if="!showingInDialog">[网址]字段属性设置</el-header>
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
				<el-form-item label="最小长度">
					<el-input-number v-model="fieldProps.fieldViewModel.minLength"
									 :min="0" :max="190" style="width: 100%"></el-input-number>
				</el-form-item>
				<el-form-item label="最大长度（不能超过300字符）">
					<el-input-number v-model="fieldProps.fieldViewModel.maxLength"
									 :min="0" :max="300" style="width: 100%"></el-input-number>
				</el-form-item>
<!--				<el-form-item label="字段校验函数(可多选)" prop="fieldViewModel.validators">-->
<!--					<el-select multiple allow-create filterable default-first-option :popper-append-to-body="false"-->
<!--							   v-model="fieldProps.fieldViewModel.validators" style="width: 100%">-->
<!--						<el-option-->
<!--							v-for="(vt, vtIdx) in validators"-->
<!--							:key="vtIdx"-->
<!--							:label="vt.label"-->
<!--							:value="vt.value">-->
<!--						</el-option>-->
<!--					</el-select>-->
<!--				</el-form-item>-->
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
						<el-radio value="true">是</el-radio>
						<el-radio value="false">否</el-radio>
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
import {addField} from '@/api/system-manager'
import FieldState from "@/views/system/field-state-variables";
import {fieldEditorMixin} from "./field-editor-mixin";

export default {
	name: "UrlWidgetEditor",
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
				'type': 'Url',
				'defaultMemberOfListFlag': false,
				'nullable': false,
				'creatable': true,
				'updatable': true,
                'extraAttrs': {
                    'onlyUpdateByTrigger': 'false',
                },
				'fieldViewModel': {
					'minLength': 0,
					'maxLength': 300,
					'validators': [],
				},
			},

			validators: [],

		}
	},
	mounted() {
		//mixin
	},
	methods: {
		saveField() {
			this.doSave('Url')
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
