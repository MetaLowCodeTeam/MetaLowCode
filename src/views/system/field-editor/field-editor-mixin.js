import FieldState from "@/views/system/field-state-variables";
import {addField, getField, updateField} from "@/api/system-manager";
import {copyObj, getSimplePinYin, upperFirstLetter} from "@/utils/util";

export const fieldEditorMixin = {
	data() {
		return {
			rules: {
				name: [
					{required: true, message: '请输入字段名称', trigger: 'blur'},
					{
						pattern: /^[a-z]+[A-Za-z\d]*$/,
						message: '请以小写英文字母开头，中间可输入字母或数字，禁止中文',
						trigger: 'blur'
					},
					{min: 2, max: 30, message: '请输入至少两个字符', trigger: 'blur'},
				],
				label: [
					{required: true, message: '请输入显示名称', trigger: 'blur'},
					{
						pattern: /^[A-Za-z\d\u4e00-\u9fa5]+[_-]*/,
						message: '请以中文、英文字母、数字开头，中间可输入下划线或横杠',
						trigger: 'blur'
					},
					{min: 2, max: 30, message: '请输入至少两个字符', trigger: 'blur'},
				],
			},
		}
	},
	mounted() {
		if (this.fieldState === FieldState.EDIT) {
			this.loadFieldProps()
		}
	},
	methods: {
		createNewField() {
			addField(this.fieldProps, this.entity).then(res => {
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

		modifyOldField() {
			updateField(this.fieldProps, this.entity).then(res => {
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

		doSave(fieldType) {
			this.$refs['editorForm'].validate((success) => {
				if (!success) {
					this.$message.error('数据不合规范，请检查')
					return false
				}

				this.fieldProps.type = fieldType
				if (this.fieldState === FieldState.NEW) {
					this.createNewField()
				} else if (this.fieldState === FieldState.EDIT) {
					this.modifyOldField()
				} else {
					// error
				}
			})
		},

		cancelSave() {
			this.$emit('cancelSave')
		},

		loadFieldProps() {
			if (this.fieldState !== FieldState.EDIT) {
				return
			}

			getField(this.fieldName, this.entity).then(res => {
				if (res.error != null) {
					this.$message({message: res.error, type: 'error'})
					return
				}

				//console.log(res.data)
				copyObj(this.fieldProps, res.data)
				if (!this.fieldProps.fieldViewModel) {
					this.fieldProps.fieldViewModel = {}
				}
				if (!this.fieldProps.referenceSetting) {
					this.fieldProps.referenceSetting = []
				}

				//console.log( this.fieldProps )
			}).catch(res => {
				this.$message({message: res.message, type: 'error'})
			})
		},

		handleFieldLabelChange(val) {
			if (!val) {
				return
			}

			if (!this.fieldProps.name) {
				this.fieldProps.name = getSimplePinYin(val)
			}
		},

		generateFieldName() {
			this.fieldProps.name = getSimplePinYin(this.fieldProps.label)
		},

	}
}
