<template>
    <el-container class="field-props-container">
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
                            <el-button @click="generateFieldName">刷新生成</el-button>
                        </template>
                    </el-input>
                </el-form-item>
				<el-form-item label="字段值是否唯一/不可重复">
					<el-radio-group v-model="fieldProps.fieldViewModel.uniqueness" style="float: right">
						<el-radio :label="true">是</el-radio>
						<el-radio :label="false">否</el-radio>
					</el-radio-group>
				</el-form-item>
                <el-form-item label="是否在列表中默认显示">
                    <el-radio-group
                        v-model="fieldProps.defaultMemberOfListFlag"
                        style="float: right"
                    >
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
                <el-form-item label="开启选项数据同步" >
                    <el-checkbox v-model="checkedSync" :disabled="fieldState !== 1"/>
                </el-form-item>
                <el-form-item label="请选择跟哪个字段同步" v-if="this.checkedSync">
                    <el-select 
                        v-model="useFieldSync" 
                        placeholder="选择字段"
                        :disabled="fieldState !== 1"
                    >
                        <el-option
                            v-for="item in fieldsSync"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value"
                        />
                    </el-select>
                </el-form-item>
                <el-card class="box-card" shadow="never" v-else>
                    <template #header>
                        <div class="clear-fix">
                            <span>选项管理</span>
                            <el-button
                                style="float: right; padding: 3px 0"
                                link
                                type="primary"
                                @click="addOption"
                            >新增选项</el-button>
                        </div>
                    </template>
                    <!--
					<div class="clear-fix">(空值)</div>
                    -->
                    <div
                        v-for="(optionItem, idx) in optionItems"
                        :key="idx"
                        class="clear-fix"
                        @mouseenter="hoverIdx = idx"
                        @mouseleave="hoverIdx = -1"
                    >
                        {{ optionItem.label }}
                        <div class="option-item" v-show="!!optionItem.value && (hoverIdx === idx)">
                            <el-button
                                link
                                type="primary"
                                class="option-item-insert"
                                title="插入"
                                icon="el-icon-plus"
                                @click="insertOption(idx)"
                            ></el-button>
                            <el-button
                                link
                                type="primary"
                                class="option-item-up"
                                title="上移"
                                icon="el-icon-top"
                                @click="upOption(idx)"
                            ></el-button>
                            <el-button
                                link
                                type="primary"
                                class="option-item-down"
                                title="下移"
                                icon="el-icon-bottom"
                                @click="downOption(idx)"
                            ></el-button>
                            <el-button
                                link
                                type="primary"
                                class="option-item-edit"
                                title="编辑"
                                icon="el-icon-edit"
                                @click="editOption(idx)"
                            ></el-button>
                            <el-button
                                link
                                type="primary"
                                class="option-item-delete"
                                title="删除"
                                icon="el-icon-delete"
                                @click="deleteOption(idx)"
                            ></el-button>
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
import {
    addOptionField,
    updateOptionField,
    getField,
    getOptionItems,
    getOptionFields,
} from "@/api/system-manager";
import { ElMessage, ElMessageBox as MessageBox } from "element-plus";
import { copyObj, generateId } from "@/utils/util";
import FieldState from "@/views/system/field-state-variables";
import { fieldEditorMixin } from "@/views/system/field-editor/field-editor-mixin";

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
            // 取所有可同步的字段
            let res = await getOptionFields();
            this.fieldsSync = [];
            if(res){
                let fields = res.data || [];
                fields.forEach(el => {
                    el.fieldList.forEach(subEl => {
                        if(!subEl.syncFlag == "1"){
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
                inputPattern:
                    /^[A-Za-z\u4e00-\u9fa5\uff0c\u3001\uff1b\uff1a\uff08\uff09\u2014\u201c\u201d\d]+$/ /* 匹配由字母大小写、汉字或数字组成的字符串 */,
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
                inputPattern:
                    /^[A-Za-z\u4e00-\u9fa5\uff0c\u3001\uff1b\uff1a\uff08\uff09\u2014\u201c\u201d\d]+$/ /* 匹配由字母大小写、汉字或数字组成的字符串 */,
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
                inputPattern:
                    /^[A-Za-z\u4e00-\u9fa5\uff0c\u3001\uff1b\uff1a\uff08\uff09\u2014\u201c\u201d\d]+$/ /* 匹配由字母大小写、汉字或数字组成的字符串 */,
                inputErrorMessage: "输入不正确",
            })
                .then(({ value }) => {
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
@import "@/style/form-layout/field-editor-common.scss";

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
