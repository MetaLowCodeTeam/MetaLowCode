<template>
    <el-container class="field-props-container" v-loading="saveLoading" element-loading-text="数据加载中...">
        <el-header class="field-props-header" v-if="!showingInDialog">[一对一引用]字段属性设置</el-header>
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
                <el-form-item label="引用实体" class="is-required">
                    <el-input v-model="refEntityAndFields" readonly>
                        <template #suffix>
                            <el-icon
                                title="清除"
                                v-if="!!refEntityAndFields && (fieldState === 1) || (fieldState === 2)"
                                class="el-input__icon"
                                @click="clearReferTo"
                            >
                                <Close />
                            </el-icon>
                        </template>
                        <template #append v-if="(fieldState === 1) || (fieldState === 2)">
                            <el-button
                                icon="el-icon-search"
                                title="选择"
                                @click="showRefEntitySettingDialog"
                            ></el-button>
                        </template>
                    </el-input>
                </el-form-item>
                <el-form-item label="搜索弹窗宽度（单位：像素）：">
                    <el-input-number
                        type="number"
                        v-model.number="fieldProps.fieldViewModel.searchDialogWidth"
                        style="width: 100%"
                    ></el-input-number>
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
                <hr style="border: 0;margin-bottom: 15px" />
                <el-form-item>
                    <el-button type="primary" style="width: 120px" @click="saveField">保存字段</el-button>
                    <el-button v-if="!!showingInDialog" @click="cancelSave">取消</el-button>
                </el-form-item>
            </el-form>
        </el-main>

        <el-dialog
            title="引用实体设置"
            class="refer-entity-dialog"
            v-model="showRefEntityDialogFlag"
            v-if="showRefEntityDialogFlag"
            :append-to-body="true"
            width="560px"
        >
            <el-container>
                <el-header style="height: 100%;padding: 10px 0">
					<el-row style="width: 100%">
						<el-col :span="24">
							<ml-select-entity
                                v-model="refEntityName"
                                placeholder="请选择引用实体"
                                @change="handleEntityChange"
                            />
						</el-col>
					</el-row>
                </el-header>
                <el-main style="padding: 0">
                    <el-tabs v-model="activeTabName" v-loading="fieldLoading" element-loading-text="加载中...">
                        <el-tab-pane label="选择实体搜索列表字段" name="first">
                            <ReferenceEntitySet 
                                :fieldList="fieldItems"
                                v-model="selectedFieldItems"
                                moreSetting
                            />
                        </el-tab-pane>
                        <el-tab-pane label="选择表单关联展示字段" name="second">
                            <ReferenceEntitySet 
                                :fieldList="filterFieldItems(fieldItems)" 
                                v-model="virtualFields"
                            />
                        </el-tab-pane>
                    </el-tabs>
                </el-main>
            </el-container>
            <template #footer>
                <div class="dialog-footer">
                    <el-button @click="showRefEntityDialogFlag = false">取 消</el-button>
                    <el-button type="primary" @click="setRefEntity">确 定</el-button>
                </div>
            </template>
        </el-dialog>
    </el-container>
</template>

<script>
import {
    addRefField,
    updateRefField,
    getRefFieldExtras,
    getFieldSet,
    getField,
    filterEntitySet,
} from "@/api/system-manager";
import { 
    queryEntityListableFields,
    queryEntityListableFieldsByRefField
} from "@/api/crud";
import { copyObj, getSimplePinYin } from "@/utils/util";
import FieldState from "@/views/system/field-state-variables";
import ReferenceEntitySet from "@/components/mlReferenceSearch/reference-entity-set.vue";
import useCommonStore from "@/store/modules/common";
import { fieldEditorMixin } from "./field-editor-mixin";
import mlSelectEntity from "@/components/mlSelectEntity/index.vue";
const { queryEntityCodeByName } = useCommonStore();
export default {
    name: "ReferenceWidgetEditor",
    mixins: [fieldEditorMixin],
    props: {
        entity: String,
        fieldName: String,
        showingInDialog: Boolean,
        fieldState: {
            type: Number,
            default: FieldState.NEW /* 1新建字段，2编辑字段 */,
        },
        entityProps: Object,
    },
    emits: ['fieldSaved', 'cancelSave'],
    components: {
        ReferenceEntitySet,
        mlSelectEntity
    },
    data() {
        return {

            saveLoading: false,
            fieldProps: {
                name: "",
                label: "",
                type: "Reference",
                defaultMemberOfListFlag: true,
                nullable: false,
                creatable: true,
                updatable: true,
                'extraAttrs': {
                    'onlyUpdateByTrigger': 'false',
                },
                fieldViewModel: {
					uniqueness: false,
                    searchDialogWidth: 520,
                    validators: [],
                },
                referenceSetting: null,
            },
            validators: [],

            currentRefEntity: "",
            refEntityAndFields: "",

            refEntityName: "",
            refEntityLabel: "",

            showRefEntityDialogFlag: false,

            fieldItems: [],
            selectedFieldItems: [],
            virtualFields: [],
            activeTabName: "first",
            // 字段样式
            fieldStyleMap: {},
            // 字段加载中
            fieldLoading: false,
        };
    },
    mounted() {
        if (this.fieldState === FieldState.EDIT) {
            this.getFieldProps();
        }
    },
    methods: {
        filterFieldItems(fieldItems){
            return fieldItems.filter(el => {
                const dotCount = (el.fieldName.match(/\./g) || []).length;
                return dotCount <= 1; // 允许 0 或 1 个点，过滤掉 2 个及以上
            });
        },
        async getFieldProps() {
            this.saveLoading = true;
            let res = await getField(this.fieldName, this.entity);
            if (res && res.code == 200) {
                if (res.data) {
                    this.readFieldProps(res.data);
                }
            }else {
                this.saveLoading = false;
            }

        },

        async readFieldProps(savedProps) {
            copyObj(this.fieldProps, savedProps);
            //console.log(this.fieldProps)
            if (!this.fieldProps.fieldViewModel) {
                //设置搜索弹窗默认宽度
                this.fieldProps["fieldViewModel"] = {
                    searchDialogWidth: 520,
                };
            }
            if(!this.fieldProps.extraAttrs){
                this.fieldProps.extraAttrs = {
                    onlyUpdateByTrigger: 'false',
                }
            }
            if (!!savedProps.entityCode) {
                this.fieldProps.entityCode = savedProps.entityCode;
            }
            this.saveLoading = true;
            let res = await getRefFieldExtras(savedProps.name, this.entity);
            if (res && res.code == 200) {
                if (res.data) {
                    this.currentRefEntity = res.data.currentRefEntity;
                    this.refEntityName = res.data.refEntityName;
                    this.refEntityLabel = res.data.refEntityLabel;
                    this.refEntityAndFields = res.data.refEntityAndFields;
                    this.fieldStyleMap = res.data.fieldStyleMap || {};
                    this.selectedFieldItems = res.data.selectedFieldItems.map(el => {
                        const fieldStyle = this.fieldStyleMap[el.name];
                        return {
                            ...el,
                            ...(fieldStyle || {}),
                        };
                    });
                    this.virtualFields = res.data.virtualFields; 
                }
            }
            this.loadFieldItemList(savedProps.name, this.entity);
            this.saveLoading = false;
        },

		saveField() {
            this.$refs["editorForm"].validate(async (success) => {
                if (!success) {
                    this.$message.error("数据不合规范，请检查");
                    return false;
                }

                if (!this.fieldProps.referenceSetting) {
                    this.$message.error("请设置引用实体！");
                    return;
                }

                this.fieldProps.type = "Reference";
                let saveMethod = addRefField;
                if (this.fieldState === FieldState.EDIT) {3
                    saveMethod = updateRefField;
                }
                let res = await saveMethod(
                    this.fieldProps,
                    this.entity,
                    this.currentRefEntity
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

        clearReferTo() {
            this.currentRefEntity = "";
            this.refEntityAndFields = "";
            this.fieldProps.referenceSetting = null;
        },

        showRefEntitySettingDialog() {
            this.showRefEntityDialogFlag = true;
        },

        async handleEntityChange(entityName) {
            if (!entityName) {
                this.refEntityLabel = "";
                this.refEntityAndFields = "";
                this.fieldItems.length = 0;
                this.selectedFieldItems.length = 0;
                this.virtualFields.length = 0;
                return;
            }
            const { queryEntityInfoByName } = useCommonStore();
            const entity = await queryEntityInfoByName(entityName);
            if (entity) {
                this.refEntityLabel = entity.label;
                this.loadFieldItemList();
            }
        },

        setRefEntity() {
            if (this.selectedFieldItems.length <= 0) {
                this.$message.info("请至少选择一个实体搜索列表字段！");
                return;
            }

            let tempStr = this.refEntityLabel + "[";
            for (let i = 0; i < this.selectedFieldItems.length; i++) {
                tempStr += this.selectedFieldItems[i].label + ",";
            }
            tempStr += "]";
            this.refEntityAndFields = tempStr;
            this.currentRefEntity = this.refEntityName;
            let fieldList = this.selectedFieldItems.map(el => {
                this.fieldStyleMap[el.name] = {...el}
                return el.name;
            });
            let virtualFieldNames = this.virtualFields.map(el => el.name);
            this.fieldProps.referenceSetting = [
                { 
                    entityName: this.currentRefEntity, 
                    fieldList: fieldList,
                    virtualFields: virtualFieldNames,
                    fieldStyleMap: this.fieldStyleMap,
                },
            ];       
            this.showRefEntityDialogFlag = false;
        },

        async loadFieldItemList(savedPropsName, entity) {
            this.fieldLoading = true;
            let res;
            if(savedPropsName && entity){
                res = await queryEntityListableFieldsByRefField(savedPropsName, entity);
            }else{
                res = await queryEntityListableFields(queryEntityCodeByName(this.refEntityName));
            }
            if (res && res.code == 200) {
                this.fieldItems = res.data.map(el => {
                    el.label = el.fieldLabel;
                    el.name = el.fieldName;
                    el.type = el.fieldType;
                    return el;
                });
            }
            this.fieldLoading = false;
        },

        setRefEntityListField(fieldItem, value) {
            if (!!value) {
                this.selectedFieldItems.push(fieldItem);
            } else {
                for (let i = this.selectedFieldItems.length - 1; i >= 0; i--) {
                    if (this.selectedFieldItems[i].name === fieldItem.name) {
                        this.selectedFieldItems.splice(i, 1);
                    }
                }
            }
        },

        isSelectedField(fieldItem) {
            let matchedFlag = false;
            this.selectedFieldItems.forEach((item) => {
                if (fieldItem.name === item.name) {
                    matchedFlag = true;
                }
            });
            return matchedFlag;
        },

        handleFieldLabelChange(val) {
            if (!val) {
                return;
            }

            if (!this.fieldProps.name) {
                this.fieldProps.name = getSimplePinYin(val);
            }
        },

        generateFieldName() {
            this.fieldProps.name = getSimplePinYin(this.fieldProps.label);
        },

        handleNullableChange(){
            if(!this.fieldProps.nullable){
                this.fieldProps.creatable = true;
            }
        },
    },
};
</script>

<style lang="scss" scoped>
@use "@/style/form-layout/field-editor-common.scss";

/* 注意：当el-dialog设置append-to-body为true后，scoped样式无法应用到el-dialog组件！！ */
/*
.refer-entity-dialog,
.entity-list-dialog {
    :deep(.el-dialog__header) {
        padding: 15px 15px 3px;
    }

    :deep(.el-dialog__body) {
        padding: 6px !important;
    }

    .table-main-wrapper {
        padding: 6px !important;
    }
}
*/
</style>

<style lang="scss">
.refer-entity-dialog,
.entity-list-dialog {
	.el-dialog__header {
		padding: 15px 15px 3px;
	}

	.el-dialog__body {
		padding: 6px !important;
	}

	.table-main-wrapper {
		padding: 6px !important;
	}
}
</style>
