<template>
	<el-container class="field-props-container" v-loading="saveLoading">
		<el-header class="field-props-header" v-if="!showingInDialog">[文件]字段属性设置</el-header>
		<el-main class="field-props-pane">
			<el-form ref="editorForm" :model="fieldProps" :rules="rules" label-position="left"
					 label-width="220px" @submit.prevent>
				<el-form-item label="显示名称" prop="label">
					<el-input v-model="fieldProps.label" @change="handleFieldLabelChange"></el-input>
				</el-form-item>
				<el-form-item label="字段名称" prop="name">
					<el-input v-model="fieldProps.name" :disabled="fieldState !== 1">
						<template v-if="fieldState === 1" #append>
							<el-button @click="generateFieldName" style="color: #606266;">刷新生成</el-button>
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
                        <el-form-item label="上传文件数量上限">
                            <el-input-number v-model="fieldProps.fieldViewModel.maxFileCount"
                                            :min="1" :max="20" style="width: 100%"></el-input-number>
                        </el-form-item>
                        <el-form-item label="单张文件大小上限(单位MB)">
                            <el-input-number v-model="fieldProps.fieldViewModel.fileMaxSize"
                                            :min="1" :max="100" style="width: 100%"></el-input-number>
                        </el-form-item>
                        <el-form-item label="上传说明提示">
                            <el-input v-model="fieldProps.fieldViewModel.uploadHint"></el-input>
                        </el-form-item>
                    </el-collapse-item>
                </el-collapse>
<!--				<el-form-item label="上传文件类型(多选、可追加类型)" prop="fieldViewModel.uploadFileTypes">-->
<!--					<el-select multiple allow-create filterable default-first-option :popper-append-to-body="false"-->
<!--							   v-model="fieldProps.fieldViewModel.uploadFileTypes" style="width: 100%">-->
<!--						<el-option-->
<!--							v-for="(ft, ftIdx) in fileTypes"-->
<!--							:key="ftIdx"-->
<!--							:label="ft.label"-->
<!--							:value="ft.value">-->
<!--						</el-option>-->
<!--					</el-select>-->
<!--				</el-form-item>-->
				
				<!--
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
				-->
				<!--
				<el-form-item label="是否在列表中默认显示">
				  <el-radio-group v-model="fieldProps.defaultMemberOfListFlag" style="float: right">
					<el-radio :value="true">是</el-radio>
					<el-radio :value="false">否</el-radio>
				  </el-radio-group>
				</el-form-item>
				-->
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
import {fieldEditorMixin} from "@/views/system/field-editor/field-editor-mixin";

export default {
	name: "FileWidgetEditor",
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
				'type': 'File',
				'defaultMemberOfListFlag': false,
				'nullable': false,
				'creatable': true,
				'updatable': true,
				'fieldViewModel': {
					'maxFileCount': 3,
					'fileMaxSize': 5,
					'uploadFileTypes': [],
					'uploadHint': '',
					'validators': [],
				},
			},

			rules: {
				name: [
					{required: true, message: '请输入字段名称', trigger: 'blur'},
					{
						pattern: /^[a-z]+[A-Za-z\d_]*$/,
						message: '请以小写英文字母开头，中间可输入字母或数字，禁止中文',
						trigger: 'blur'
					},
					{min: 2, max: 30, message: '文字长度应在2-30之间', trigger: 'blur'},
				],
				label: [
					{required: true, message: '请输入显示名称', trigger: 'blur'},
					{
						pattern: /^[A-Za-z\d\u4e00-\u9fa5]+[_-]*/,
						message: '名称长度在2-30之间，以中文、英文字母、数字开头，中间可输入下划线或横杠',
						trigger: 'blur'
					},
					{min: 2, max: 30, message: '名称长度在2-30之间，以中文、英文字母、数字开头，中间可输入下划线或横杠', trigger: 'blur'},
				],
				'fieldViewModel.uploadFileTypes': [
					{required: true, message: '请选择上传文件类型', trigger: 'blur', type: 'array'},
				],
			},
			validators: [],

			fileTypes: [
				{value: 'txt', label: 'txt'},
				{value: 'doc', label: 'doc'},
				{value: 'docx', label: 'docx'},
				{value: 'xls', label: 'xls'},
				{value: 'xlsx', label: 'xlsx'},
				{value: 'ppt', label: 'ppt'},
				{value: 'pptx', label: 'pptx'},
				{value: 'zip', label: 'zip'},
				{value: 'rar', label: 'rar'},
			],
		}
	},
	mounted() {
		//mixin
	},
	methods: {
		saveField() {
			this.doSave('File')
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
