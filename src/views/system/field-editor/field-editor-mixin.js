import FieldState from "@/views/system/field-state-variables";
import {addField, getField, updateField} from "@/api/system-manager";
import {copyObj, getSimplePinYin, upperFirstLetter} from "@/utils/util";

export const fieldEditorMixin = {
	data() {
		return {
            saveLoading: false,
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
			},
		}
	},
	mounted() {
		if (this.fieldState === FieldState.EDIT) {
			this.loadFieldProps()
		}
	},
	methods: {
		async createNewField() {
            this.saveLoading = true;
            let res = await addField(this.fieldProps, this.entity);
            if(res && res.code == 200){
                this.$message.success('保存成功')
                this.$emit('fieldSaved')
            }
            this.saveLoading = false;
		},

		async modifyOldField() {
            this.saveLoading = true;
            let res = await updateField(this.fieldProps, this.entity);
            if(res && res.code == 200){
                this.$message.success('保存成功')
				this.$emit('fieldSaved')
            }
            this.saveLoading = false;
		},

		validateField() {
            if(this.fieldProps.fieldViewModel.minLength >= this.fieldProps.fieldViewModel.maxLength){
                this.$message.error('最小长度必须小于最大长度！')
                return false;
            }

			if (this.fieldProps.fieldViewModel.minValue >= this.fieldProps.fieldViewModel.maxValue) {
				this.$message.error('最小值必须小于最大值！')
				return false;
			} else {
				return true;
			}
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
        handleNullableChange(){
            if(!this.fieldProps.nullable){
                this.fieldProps.creatable = true;
            }
        },

		async loadFieldProps() {
			if (this.fieldState !== FieldState.EDIT) {
				return
			}
            let res = await getField(this.fieldName, this.entity);
            if(res && res.code == 200){
                copyObj(this.fieldProps, res.data)
				if (!this.fieldProps.fieldViewModel) {
					this.fieldProps.fieldViewModel = {}
				}
				if (!this.fieldProps.referenceSetting) {
					this.fieldProps.referenceSetting = []
				}
            }
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
