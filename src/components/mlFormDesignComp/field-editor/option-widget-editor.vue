<template>
    <el-container class="field-props-container" v-loading="saveLoading">
        <el-header class="field-props-header" v-if="!showingInDialog">[单选项]字段属性设置</el-header>
        <el-main class="field-props-pane">
            <el-form
                ref="editorForm"
                :model="fieldProps"
                :rules="rules"
                label-position="left"
                label-width="220px"
                @submit.prevent
            >
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
				<el-form-item label="字段值是否唯一/不可重复">
					<el-radio-group v-model="fieldProps.fieldViewModel.uniqueness" style="float: right">
						<el-radio :value="true">是</el-radio>
						<el-radio :value="false">否</el-radio>
					</el-radio-group>
				</el-form-item>
                <el-form-item label="是否在列表中默认显示">
                    <el-radio-group
                        v-model="fieldProps.defaultMemberOfListFlag"
                        style="float: right"
                    >
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
                <el-form-item label="开启选项数据同步" >
                    <el-checkbox v-model="checkedSync"/>
                </el-form-item>
                <el-form-item label="请选择跟哪个字段同步" v-if="this.checkedSync">
                    <el-select
                        v-model="useFieldSync"
                        placeholder="选择字段"
                        filterable
                    >
                        <el-option
                            v-for="item in fieldsSync"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value"
                        />
                    </el-select>
                </el-form-item>
                <OptionsCard 
                    v-else
                    :optionItems="optionItems"
                    @addOption="addOption"
                    @insertOption="insertOption"
                    @upOption="upOption"
                    @downOption="downOption"
                    @editOption="editOption"
                    @deleteOption="deleteOption"
                />
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
import {
    addOptionField,
    updateOptionField,
    getField,
    getOptionItems,
    getOptionFields,
} from "@/api/system-manager";
import { copyObj } from "@/utils/util";
import FieldState from "@/views/system/field-state-variables";
import {fieldEditorMixin} from "./field-editor-mixin";

import OptionsCard from "./components/OptionsCard.vue";
export default {
    name: "OptionWidgetEditor",
    props: {
        entity: String,
        fieldName: String,
        showingInDialog: Boolean,
        fieldState: {
            type: Number,
            default: FieldState.NEW,
        },
    },
    mixins: [fieldEditorMixin],
    components: {
        OptionsCard
    },
    data() {
        return {
            fieldProps: {
                name: "",
                label: "",
                type: "Option",
                defaultMemberOfListFlag: true,
                nullable: false,
                creatable: true,
                updatable: true,
                'extraAttrs': {
                    'onlyUpdateByTrigger': 'false',
                },
				fieldViewModel: {
					uniqueness: false,
                    optionSyncModel: {
                        entityName: '',
                        fieldName: ''
                    }

				},
            },

            optionItems: [],

            hoverIdx: -1,
            // 同步是否勾选
            checkedSync: false,
            // 所有可选的同步字段
            fieldsSync: [],
            // 选择的同步字段
            useFieldSync: "",
        };
    },
    mounted() {
        // 初始化API
        this.initApi();
    },
    methods: {
        async initApi(){
            let appAbbr = this.$route.query.appAbbr;
            // 取所有可同步的字段
            let res = await getOptionFields(appAbbr);
            this.fieldsSync = [];
            if(res){
                let fields = res.data || [];
                fields.forEach(el => {
                    el.fieldList.forEach(subEl => {
                        if(subEl.syncFlag !== "1"){
                            this.fieldsSync.push({
                                label: el.entityLabel + "." + subEl.fieldLabel,
                                value: el.entityName + '.' + subEl.fieldName
                            })
                        }
                    })
                })
            }
            if (this.fieldState === FieldState.EDIT) {
                this.getFieldProps();
            }
        },
        async getFieldProps() {
            let res = await getField(this.fieldName, this.entity);
            if(res){
                this.readFieldProps(res.data);
            }
        },

        async readFieldProps(savedProps) {
            copyObj(this.fieldProps, savedProps);
            // 如果不是新建
            if(this.fieldState !== 1){
                // 如果有同步数据表示勾选了同步
                let { optionSyncModel } = this.fieldProps.fieldViewModel;
                if(optionSyncModel){
                    let { entityName, fieldName } = optionSyncModel;
                    if(entityName && fieldName){
                        this.checkedSync = true;
                        this.useFieldSync = entityName + '.' + fieldName
                    }
                }
            }
            if(!this.fieldProps.extraAttrs){
                this.fieldProps.extraAttrs = {
                    onlyUpdateByTrigger: 'false',
                }
            }
            // if(this.fieldProps.fieldViewModel )
            if (!!savedProps.entityCode) {
                this.fieldProps.entityCode = savedProps.entityCode;
            }
            let res = await getOptionItems(this.entity, this.fieldName);
            if (res && res.code == 200) {
                this.optionItems = !res.data ? [] : res.data;
            }
        },

        saveField() {
            this.$refs["editorForm"].validate(async (success) => {
                if (!success) {
                    this.$message.error("数据不合规范，请检查");
                    return false;
                }

                this.fieldProps.type = "Option";
                let optionList = [];
                this.optionItems.forEach((item) => {
                    if (!!item.value) {
                        optionList.push({ key: item.label, value: item.value });
                    }
                });
                // 如果启用了同步
                if(this.checkedSync){
                    let fieldSync = this.useFieldSync.split('.');
                    let optionSyncModel = {
                        entityName: fieldSync[0],
                        fieldName: fieldSync[1]
                    };
                    this.fieldProps.fieldViewModel.optionSyncModel = optionSyncModel
                }
                let saveMethod = addOptionField;
                if (this.fieldState === FieldState.EDIT) {
                    saveMethod = updateOptionField;
                }
                let res = await saveMethod(
                    this.fieldProps,
                    this.entity,
                    optionList
                );
                if (res && res.code == 200) {
                    this.$message.success("保存成功");
                    this.$emit("fieldSaved");
                }
            });
        },

        cancelSave() {
            this.$emit("cancelSave");
        },

        validateOption(optionTxt, optionIdx) {
            let result = true;
            this.optionItems.forEach((item, idx) => {
                if (item.label === optionTxt && idx !== optionIdx)
                    result = false;
            });
            return result;
        },

        getOptionMaxValue() {
            let maxValue = 0;
            this.optionItems.forEach((item, idx) => {
                if (item.value > maxValue) {
                    maxValue = item.value;
                }
            });
            return maxValue;
        },

        addOption() {
            this.$prompt("请输入选项名称", "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                inputPattern:/^[^\s,](?:.*[^\s,])?$/,
                inputErrorMessage: "输入不正确",
            })
                .then(({ value }) => {
                    if (this.validateOption(value, -1)) {
                        let newOptionValue = this.getOptionMaxValue() + 1;
                        let newOption = {
                            label: value,
                            value: newOptionValue,
                            saved: false,
                        };
                        if(newOption.label.indexOf('/') !== -1){
                            this.$message.warning("选项名称不能包含【/】");
                            return;
                        }
                        this.optionItems.push(newOption);
                        this.$nextTick(() => {
                            console.log("Updated!");
                        });
                    } else {
                        this.$message.warning("选项已存在");
                    }
                })
                .catch((err) => {
                    console.error("eeee", err);
                    //this.$message.error(err.message)
                    this.$message.info("已取消");
                });
        },

        insertOption(optionIdx) {
            this.$prompt("请输入选项名称", "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                inputPattern:/^[^\s,](?:.*[^\s,])?$/,
                inputErrorMessage: "输入不正确",
            })
                .then(({ value }) => {
                    if (this.validateOption(value, -1)) {
                        let newOptionValue = this.getOptionMaxValue() + 1;
                        let newOption = {
                            label: value,
                            value: newOptionValue,
                            saved: false,
                        };
                        if(newOption.label.indexOf('/') !== -1){
                            this.$message.warning("选项名称不能包含【/】");
                            return;
                        }
                        this.optionItems.splice(optionIdx + 1, 0, newOption);
                        this.$nextTick(() => {
                            console.log("Updated!");
                        });
                    } else {
                        this.$message.warning("选项已存在");
                    }
                })
                .catch(() => {
                    this.$message.info("已取消");
                });
        },

        upOption(optionIdx) {
            if (optionIdx === 0) {
                this.$message.info("已到最上");
                return;
            }

            let tempOption = this.optionItems[optionIdx];
            this.optionItems[optionIdx] = this.optionItems[optionIdx - 1];
            this.optionItems[optionIdx - 1] = tempOption;
        },

        downOption(optionIdx) {
            console.log(
                "length: " +
                    this.optionItems.length +
                    ", current idx: " +
                    optionIdx
            );
            if (optionIdx === this.optionItems.length - 1) {
                this.$message.info("已到最下");
                return;
            }

            let tempOption = this.optionItems[optionIdx];
            this.optionItems[optionIdx] = this.optionItems[optionIdx + 1];
            this.optionItems[optionIdx + 1] = tempOption;
        },

        editOption(optionIdx) {
            let oldOptionLabel = this.optionItems[optionIdx].label;
            this.$prompt("请修改选项名称", "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                inputValue: oldOptionLabel,
                inputPattern:/^[^\s,](?:.*[^\s,])?$/,
                inputErrorMessage: "输入不正确",
            })
                .then(({ value }) => {
                    if(value.indexOf('/') !== -1){
                        this.$message.warning("选项名称不能包含'/'");
                        return;
                    }
                    if (this.validateOption(value, optionIdx)) {
                        this.optionItems[optionIdx].label = value;
                        this.$nextTick(() => {
                            console.log("Updated!");
                        });
                    } else {
                        this.$message.warning("选项已存在");
                    }
                })
                .catch(() => {
                    this.$message.info("已取消");
                });
        },

        deleteOption(optionIdx) {
            this.$confirm("确定删除该选项?", "提示")
                .then(() => {
                    //TODO：后台需要检查改选项是否已被实体记录所引用！！
                    this.optionItems.splice(optionIdx, 1);
                    this.$message.info("选项已删除");
                })
                .catch(() => {
                    this.$message.info("取消删除");
                });
        },
    },
};
</script>

<style lang="scss" scoped>
@use "@/style/form-layout/field-editor-common.scss";

.box-card {
    font-size: 14px;

    :deep(.el-card__body) {
        height: 220px;
        overflow: auto;
    }

    .option-item {
        float: right;
        height: 22px;
        line-height: 22px;
        position: relative;

        .option-item-insert {
            position: absolute;
            top: -8px;
            left: -100px;
        }

        .option-item-up {
            position: absolute;
            top: -6px;
            left: -86px;
        }

        .option-item-down {
            position: absolute;
            top: -7px;
            left: -66px;
        }

        .option-item-edit {
            position: absolute;
            top: -7px;
            left: -42px;
        }

        .option-item-delete {
            position: absolute;
            top: -8px;
            left: -18px;
        }
    }
}

.clear-fix:before,
.clear-fix:after {
    display: table;
    content: "";
}

.clear-fix:after {
    clear: both;
}
</style>
