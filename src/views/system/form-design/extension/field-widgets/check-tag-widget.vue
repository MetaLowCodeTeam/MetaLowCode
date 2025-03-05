<template>
	<form-item-wrapper
		:designer="designer"
		:field="field"
		:rules="rules"
		:design-state="designState"
		:parent-widget="parentWidget"
		:parent-list="parentList"
		:index-of-parent-list="indexOfParentList"
		:sub-form-row-index="subFormRowIndex"
		:sub-form-col-index="subFormColIndex"
		:sub-form-row-id="subFormRowId"
	>
        <template v-if="field.options.showButton && !isReadMode">
            <el-checkbox-group 
                v-model="checkboxGroup"
                @change="onCheckboxGroupChange"
            >
                <el-checkbox-button 
                    v-for="(item,inx) of options"
                    :key="inx"
                    :value="item.label"
                >
                    {{ item.label }}
                </el-checkbox-button>
            </el-checkbox-group>
        </template>
        <template v-else-if="field.options.showSelect && !isReadMode">
            <el-select 
                v-model="selectValue" 
                :disabled="field.options.disabled" 
                multiple
                @change="onSelectChange"
            >
                <el-option 
                    v-for="(item,inx) of options" 
                    :key="inx" 
                    :label="item.label" 
                    :value="item.label"
                />
            </el-select>
        </template>
        <template v-else-if="field.options.showCheckbox && !isReadMode">
            <el-checkbox 
                v-for="(item,inx) of options"
                :Key="inx"
                v-model="item.checked" 
                :label="item.label" 
                :disabled="field.options.disabled"
                :border="field.options.showBorder"
                @change="onCheckboxChange"
            />
        </template>
        <template v-else-if="!field.options.showCheckbox && !isReadMode">
            <template
                v-for="(item, index) in field.options.optionItems"
                :key="index"
            >
                <el-check-tag
                    :checked="isChecked(item)"
                    @change="(checked) => onCheckTagChange(item, checked)"
                    style="margin-right: 8px"
                >
                    {{ item.label }}
                </el-check-tag>
            </template>
        </template>
        <template v-if="isReadMode">
            <span class="readonly-mode-field">{{ fieldModel || "--" }}</span>
        </template>
		
	</form-item-wrapper>
</template>

<script>
import VisualDesign from "@/../lib/visual-design/designer.umd.js";
import { overwriteObj } from "@/utils/util";

const { FormItemWrapper, emitter, i18n, fieldMixin, Utils } =
	VisualDesign.VFormSDK;

export default {
	name: "check-tag-widget",
	componentName: "FieldWidget", //必须固定为FieldWidget，用于接收父级组件的broadcast事件
	mixins: [emitter, fieldMixin, i18n],
	props: {
		field: Object,
		parentWidget: Object,
		parentList: Array,
		indexOfParentList: Number,
		designer: Object,

		designState: {
			type: Boolean,
			default: false,
		},

		subFormRowIndex: {
			/* 子表单组件行索引，从0开始计数 */ type: Number,
			default: -1,
		},
		subFormColIndex: {
			/* 子表单组件列索引，从0开始计数 */ type: Number,
			default: -1,
		},
		subFormRowId: {
			/* 子表单组件行Id，唯一id且不可变 */ type: String,
			default: "",
		},
	},
	components: {
		FormItemWrapper,
	},
    watch: {
        fieldModel: {
            handler(newValue, oldValue) {
                this.initOptionsChecked();
            },
            deep: true
        }
    },
	data() {
		return {
			oldFieldValue: null, //field组件change之前的值
			fieldModel: null,
			rules: [],
            options: [],
            checkboxGroup: [],
            selectValue: []
		};
	},
	computed: {
    },
	beforeCreate() {
		/* 这里不能访问方法和属性！！ */
	},

	created() {
		/* 注意：子组件mounted在父组件created之后、父组件mounted之前触发，故子组件mounted需要用到的prop
		   需要在父组件created中初始化！！ */
		this.registerToRefList();
		this.initOptionItems();
		this.initFieldModel();
		this.initEventHandler();
		this.buildFieldRules();

		this.handleOnCreated();
	},

	mounted() {
		this.handleOnMounted();
        this.initOptionsChecked();
	},

	beforeUnmount() {
		this.unregisterFromRefList();
	},

	methods: {
        initOptionsChecked(){
            this.checkboxGroup = [];
            this.selectValue = [];
            let sourceFields = [];
            if(this.fieldModel){
                sourceFields = this.fieldModel.split(",").map(el => {
                    return {
                        label: el,
                        value: this.getGuid()
                    }
                });
            }
            let newOption = Object.assign([], this.field.options.optionItems, sourceFields);
            this.options = newOption.map(el => {
                let newValue = el.label || el.value;
                if(this.fieldModel && this.fieldModel.split(",").includes(newValue)) {
                    this.checkboxGroup.push(newValue);
                    this.selectValue.push(newValue);
                }
                return {
                    value: newValue,
                    label: newValue,
                    checked: this.fieldModel ? this.fieldModel.split(",").includes(newValue) : false
                }
            });
        },
        getGuid(){
            return "xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx".replace(/[xy]/g, function (c) {
                var r = (Math.random() * 16) | 0,
                    v = c == "x" ? r : (r & 0x3) | 0x8;
                return v.toString(16);
            });
        },
		async initOptionItems(keepSelected) {
			if (this.designState) {
				return;
			}

			/* 首先处理数据源选项加载 */
			if (!!this.field.options.dsEnabled) {
				this.field.options.optionItems.splice(
					0,
					this.field.options.optionItems.length
				); // 清空原有选项
				let curDSName = this.field.options.dsName;
				let curDSetName = this.field.options.dataSetName;
				let curDS = Utils.getDSByName(this.formConfig, curDSName);
				if (!!curDS && !curDSetName) {
					let gDsv = this.getGlobalDsv() || {};
					//console.log('Global DSV is: ', gDsv)
					let localDsv = new Object({});
					overwriteObj(localDsv, gDsv);
					localDsv["widgetName"] = this.field.options.name;
					localDsv["widgetKeyName"] = this.fieldKeyName;
					let dsResult = null;
					try {
						dsResult = await Utils.runDataSourceRequest(
							curDS,
							localDsv,
							this.getFormRef(),
							false,
							this.$message
						);
						this.loadOptions(dsResult);
					} catch (err) {
						this.$message.error(err.message);
					}
				} else if (
					!!curDS &&
					!!curDSetName &&
					!this.dataSetLoadedFlag
				) {
					this.loadOptionItemsFromDataSet(curDSName);
				}
                return;
			}

			/* 异步更新option-data之后globalOptionData不能获取到最新值，改用provide的getOptionData()方法 */
			const newOptionItems = this.getOptionData();
			if (
				!!newOptionItems &&
				newOptionItems.hasOwnProperty(this.fieldKeyName)
			) {
				if (!!keepSelected) {
					this.reloadOptions(newOptionItems[this.fieldKeyName]);
				} else {
					this.loadOptions(newOptionItems[this.fieldKeyName]);
				}
			}
            let sourceFields = this.field.options.optionItems;
            if(this.fieldModel){
                let labels = sourceFields.map(el => el.label);
                let fieldModelLabels = this.fieldModel.split(",");
                let diffLabels = fieldModelLabels.filter(el => !labels.includes(el));
                diffLabels.forEach(el => {
                    this.field.options.optionItems.push({
                        label: el,
                        value: this.getGuid()
                    })
                })
            }
		},

		isChecked(item) {
			if (!this.fieldModel) {
				return false;
			}

			const labelArray = this.fieldModel.split(",");
			for (const label of labelArray) {
				if (!!label && label === item.label) {
					return true;
				}
			}

			return false;
		},

		onCheckTagChange(item, checked) {
			if (this.field.options.disabled) {
				return;
			}

			if (checked) {
				this.fieldModel = !this.fieldModel
					? item.label
					: this.fieldModel + "," + item.label;
			} else {
				if (this.fieldModel) {
					let newFieldModel = "";
					const labelArray = this.fieldModel.split(",");
					for (const label of labelArray) {
						if (label !== item.label) {
							newFieldModel = !newFieldModel
								? label
								: newFieldModel + "," + label;
						}
					}

					this.fieldModel = newFieldModel;
				}
			}

			this.handleChangeEvent(this.fieldModel);
		},
        
        // 单选组件切换
        onCheckboxChange(){
            let selected = [];
            this.options.forEach(el => {
                if(el.checked) {
                    selected.push(el.label)
                }
            });
            this.fieldModel = selected.join(",");
            this.handleChangeEvent(this.fieldModel);
        },
        // 多选组件切换
        onCheckboxGroupChange(){
            this.fieldModel = this.checkboxGroup.join(",");
            this.handleChangeEvent(this.fieldModel);
        },
        // 下拉组件切换
        onSelectChange(){
            this.fieldModel = this.selectValue.join(",");
            this.handleChangeEvent(this.fieldModel);
        }
	},
};
</script>

<style scoped lang="scss"></style>
