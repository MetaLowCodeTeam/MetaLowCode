<template>
    <el-container class="field-props-container" v-loading="saveLoading">
        <el-header class="field-props-header" v-if="!showingInDialog">[多选项]字段属性设置</el-header>
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
                    <el-checkbox v-model="checkedSync" :disabled="getCheckedSyncDisabled()"/>
                </el-form-item>
                <el-form-item label="请选择跟哪个字段同步" v-if="this.checkedSync">
                    <el-select
                        v-model="useFieldSync"
                        placeholder="选择字段"
                        filterable
                        :disabled="getCheckedSyncDisabled()"
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
                    :optionItems="tagItems" 
                    @addOption="addTag" 
                    @insertOption="insertTag" 
                    @upOption="upTag" 
                    @downOption="downTag" 
                    @editOption="editTag" 
                    @deleteOption="deleteTag"
                    showCode
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
    addTagField,
    updateTagField,
    getField,
    getTagItems,
    getTagFields,
} from "@/api/system-manager";
import FieldState from "@/views/system/field-state-variables";
import {fieldEditorMixin} from "./field-editor-mixin";
import { copyObj } from "@/utils/util";
import OptionsCard from "./components/OptionsCard.vue";
export default {
    name: "TagWidgetEditor",
    components: {
        OptionsCard
    },
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
                type: "Tag",
                defaultMemberOfListFlag: false,
                nullable: false,
                creatable: true,
                updatable: true,
                'extraAttrs': {
                    'onlyUpdateByTrigger': 'false',
                },
                fieldViewModel: {
                    validators: [],
                },
            },

            tagItems: [],

            hoverIdx: -1,

            validators: [],
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
        getCheckedSyncDisabled(){
            let isDisabled = false;
            if(this.fieldState !== 1 && this.fieldProps?.fieldViewModel?.tagSyncModel?.entityName){
                return true
            }
            return isDisabled;
        },
        async initApi(){
            // 取所有可同步的字段
            let res = await getTagFields();
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
            if (res && res.code == 200) {
                if (res.data) {
                    this.readFieldProps(res.data);
                }
            }
        },

        async readFieldProps(savedProps) {
            copyObj(this.fieldProps, savedProps);
             // 如果不是新建
             if(this.fieldState !== 1){
                // 如果有同步数据表示勾选了同步
                let { tagSyncModel } = this.fieldProps.fieldViewModel;
                if(tagSyncModel){
                    let { entityName, fieldName } = tagSyncModel;
                    if(entityName && fieldName){
                        this.checkedSync = true;
                        this.useFieldSync = entityName + '.' + fieldName
                    }
                }
            }
            if (!!savedProps.entityCode) {
                this.fieldProps.entityCode = savedProps.entityCode;
            }
            if(!this.fieldProps.extraAttrs){
                this.fieldProps.extraAttrs = {
                    onlyUpdateByTrigger: 'false',
                }
            }
            let res = await getTagItems(this.entity, this.fieldName);
            if (res && res.code == 200) {
                this.tagItems = !res.data ? [] : res.data;
            }
        },

        saveField() {
            this.$refs["editorForm"].validate(async (success) => {
                if (!success) {
                    this.$message.error("数据不合规范，请检查");
                    return false;
                }

                this.fieldProps.type = "Tag";
                let tagList = [];
                this.tagItems.forEach((item) => {
                    if (!!item.label) {
                        tagList.push(item.label);
                    }
                });
                // 如果启用了同步
                if(this.checkedSync){
                    let fieldSync = this.useFieldSync.split('.');
                    let tagSyncModel = {
                        entityName: fieldSync[0],
                        fieldName: fieldSync[1]
                    };
                    this.fieldProps.fieldViewModel.tagSyncModel = tagSyncModel
                }

                let saveMethod = addTagField;
                if (this.fieldState === FieldState.EDIT) {
                    saveMethod = updateTagField;
                }
                let res = await saveMethod(
                    this.fieldProps,
                    this.entity,
                    tagList
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

        validateTag(tagTxt, tagIdx) {
            let result = true;
            this.tagItems.forEach((item, idx) => {
                if (item.label === tagTxt && idx !== tagIdx) result = false;
            });
            return result;
        },

        addTag() {
            this.$prompt("请输入选项名称", "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                inputPattern:/^[^\s,](?:.*[^\s,])?$/,
                inputErrorMessage: "输入不正确",
            })
                .then(({ value }) => {
                    if (this.validateTag(value, -1)) {
                        let newTag = {
                            label: value,
                            value: value,
                            saved: false,
                        };
                        if(newTag.label.indexOf('/') !== -1){
                            this.$message.warning("选项名称不能包含【/】");
                            return;
                        }
                        this.tagItems.push(newTag);
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

        insertTag(tagIdx) {
            this.$prompt("请输入选项名称", "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                inputPattern:/^[^\s,](?:.*[^\s,])?$/,
                inputErrorMessage: "输入不正确",
            })
                .then(({ value }) => {
                    if (this.validateTag(value, -1)) {
                        let newTag = {
                            label: value,
                            value: value,
                            saved: false,
                        };
                        if(newTag.label.indexOf('/') !== -1){
                            this.$message.warning("选项名称不能包含【/】");
                            return;
                        }
                        this.tagItems.splice(tagIdx + 1, 0, newTag);
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

        upTag(tagIdx) {
            if (tagIdx === 0) {
                this.$message.info("已到最上");
                return;
            }

            let tempTag = this.tagItems[tagIdx];
            this.tagItems[tagIdx] = this.tagItems[tagIdx - 1];
            this.tagItems[tagIdx - 1] = tempTag;
        },

        downTag(tagIdx) {
            console.log(
                "length: " + this.tagItems.length + ", current idx: " + tagIdx
            );
            if (tagIdx === this.tagItems.length - 1) {
                this.$message.info("已到最下");
                return;
            }

            let tempTag = this.tagItems[tagIdx];
            this.tagItems[tagIdx] = this.tagItems[tagIdx + 1];
            this.tagItems[tagIdx + 1] = tempTag;
        },

        editTag(tagIdx) {
            let oldTagLabel = this.tagItems[tagIdx].label;
            this.$prompt("请修改选项名称", "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                inputValue: oldTagLabel,
                inputPattern:/^[^\s,](?:.*[^\s,])?$/,
                inputErrorMessage: "输入不正确",
            })
                .then(({ value }) => {
                    if(value.indexOf('/') !== -1){
                        this.$message.warning("选项名称不能包含'/'");
                        return;
                    }
                    if (this.validateTag(value, oldTagLabel)) {
                        this.tagItems[tagIdx].label = value;
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

        deleteTag(tagIdx) {
            console.log(tagIdx);
            this.$confirm("确定删除该选项?", "提示")
                .then(() => {
                    this.tagItems.splice(tagIdx, 1);
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

.clear-fix:before,
.clear-fix:after {
    display: table;
    content: "";
}

.clear-fix:after {
    clear: both;
}
</style>
