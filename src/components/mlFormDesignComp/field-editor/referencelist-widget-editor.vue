<template>
    <el-container class="field-props-container" v-loading="saveLoading" element-loading-text="数据加载中...">
        <el-header class="field-props-header" v-if="!showingInDialog">[多对多引用]字段属性设置</el-header>
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
                <el-form-item label="引用实体设置" class="mb-0">
                    <el-button 
                        :disabled="fieldState !== 1"
                        style="float: right" 
                        icon="el-icon-plus" 
                        @click="addRefEntity"
                    >
                        添加
                    </el-button>
                </el-form-item>
                <hr style="border: 0;margin-bottom: 15px" />
                <el-form-item
                    :label="'引用实体' + (refIdx + 1)"
                    v-for="(refEntity, refIdx) in referenceList"
                    :key="refIdx"
                    class="is-required"
                >
                    <el-input v-model="refEntity.refEntityAndFields" readonly>
                        <template #append>
                            <el-button
                                icon="el-icon-close"
                                title="清除"
                                v-if="!!refEntity.currentRefEntity"
                                @click="clearReferTo(refIdx)"
                                style="margin-right: 5px"
                                :disabled="fieldState !== 1"
                            ></el-button>
                            <el-button
                                icon="el-icon-search"
                                title="选择"
                                @click="showRefEntitySettingDialog(refIdx)"
                                style="margin-right: 5px"
                            ></el-button>
                            <el-button
                                icon="el-icon-delete"
                                title="删除"
                                @click="deleteRefEntity(refIdx)"
                                :disabled="fieldState !== 1"
                            ></el-button>
                        </template>
                    </el-input>
                </el-form-item>
                <hr style="border: 0;border-top: 1px dotted #cccccc;margin: -8px 0 12px" />
                <el-form-item label="搜索弹窗宽度（单位：像素）：">
                    <el-input-number
                        type="number"
                        v-model.number="fieldProps.fieldViewModel.searchDialogWidth"
                        style="width: 100%"
                    ></el-input-number>
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
            :append-to-body="true"
            width="560px"
        >
            <el-container>
                <el-header>
                    <el-input placeholder="请选择引用实体" v-model="refEntityFullName" :disabled="fieldState !== 1">
                        <template #append>
                            <el-button
                                icon="el-icon-search"
                                title="选择"
                                @click="showEntityListDialog"
                                :disabled="fieldState !== 1"
                            ></el-button>
                        </template>
                    </el-input>
                </el-header>
                <el-main>
                    <div>
                        <div style="margin-bottom: 6px">选择实体搜索列表字段：</div>
                        <!--            <hr style="border: 0;border-top: 1px solid rgb(220, 223, 230)" />-->
                        <el-card shadow="never">
                            <div style="font-style: italic" v-if="fieldItems.length <= 0">暂无字段可选</div>
                            <el-checkbox
                                v-for="(fieldItem, idx) in fieldItems"
                                :key="idx"
                                :checked="isSelectedField(fieldItem)"
                                @change="(value) => setRefEntityListField(fieldItem, value)"
                            >{{ fieldItem.label }}({{ fieldItem.name }})</el-checkbox>
                        </el-card>
                    </div>
                    <div>
                        <div style="margin: 20px 0 6px">已选择的显示字段：</div>
                        <el-card shadow="never">
                            <div
                                style="font-style: italic"
                                v-if="selectedFieldItems.length <= 0"
                            >未选择显示字段</div>
                            <div
                                v-for="(selectedField, selectedIdx) in selectedFieldItems"
                                :key="selectedIdx"
                            >{{ selectedField.label }}({{ selectedField.name }})</div>
                        </el-card>
                    </div>
                </el-main>
            </el-container>
            <template #footer>
                <div class="dialog-footer">
                    <el-button @click="showRefEntityDialogFlag = false">取 消</el-button>
                    <el-button type="primary" @click="setRefEntity">确 定</el-button>
                </div>
            </template>
        </el-dialog>
        <SelectEntityDialog ref="selectEntityDialogRef" @selectEntity="selectEntity" />
    </el-container>
</template>

<script>
import {
    addAnyRefField,
    updateAnyRefField,
    getEntitySet,
    getFieldSet,
    getField,
    getRefFieldExtras,
} from "@/api/system-manager";
import FieldState from "@/views/system/field-state-variables";
import { copyObj, getSimplePinYin } from "@/utils/util";
import { fieldEditorMixin } from "./field-editor-mixin";
import SelectEntityDialog from "./components/SelectEntityDialog.vue";
export default {
    name: "ReferenceListWidgetEditor",
    mixins: [fieldEditorMixin],
    props: {
        entity: String,
        fieldName: String,
        showingInDialog: Boolean,
        fieldState: {
            type: Number,
            default: FieldState.NEW,
        },
    },
    emits: ['fieldSaved', 'cancelSave'],
    components: {
        SelectEntityDialog,
    },
    data() {
        return {
            saveLoading: false,
            fieldProps: {
                name: "",
                label: "",
                type: "ReferenceList",
                defaultMemberOfListFlag: false,
                nullable: false,
                creatable: true,
                updatable: true,
                'extraAttrs': {
                    'onlyUpdateByTrigger': 'false',
                },
                fieldViewModel: {
                    searchDialogWidth: 520,
                    validators: [],
                },
                referTo: [],
                referenceSetting: [],
            },
            validators: [],

            refEntityIndex: -1,
            referenceList: [
                {
                    currentRefEntity: "",
                    selectedFieldItems: [],
                    refEntityAndFields: "",
                },
            ],

            refEntityName: "",
            refEntityLabel: "",
            refEntityFullName: "",

            showRefEntityDialogFlag: false,
            showEntityListDialogFlag: false,

            fieldItems: [],
            selectedFieldItems: [],

            columns: [
                {
                    prop: "name",
                    label: "实体名称",
                    width: "150",
                    align: "center",
                },
                {
                    prop: "label",
                    label: "显示名称",
                    width: "200",
                    align: "center",
                    formatter: this.formatter,
                },
            ],
            tableData: [],
        };
    },
    mounted() {
        if (this.fieldState === FieldState.EDIT) {
            this.getFieldProps();
        }
    },
    methods: {
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
                    this.refEntityName = res.data.refEntityName;
                    this.refEntityLabel = res.data.refEntityLabel;
                    this.refEntityFullName = res.data.refEntityFullName;

                    this.fieldItems = res.data.fieldItems;
                    this.selectedFieldItems = res.data.selectedFieldItems;
                    this.referenceList = res.data.refEntityList.map(el => {
                        return {
                            currentRefEntity: el.currentRefEntity,
                            selectedFieldItems: el.selectedFieldItems,
                            refEntityAndFields: el.refEntityAndFields,
                        }
                    })
                    // [
                    //     {
                    //         currentRefEntity: res.data.currentRefEntity,
                    //         selectedFieldItems: res.data.selectedFieldItems,
                    //         refEntityAndFields: res.data.refEntityAndFields,
                    //     },
                    // ];
                    
                    // 同步更新 fieldProps.referTo 和 fieldProps.referenceSetting
                    this.buildReferToAndReferenceSetting();
                }
            }
            this.saveLoading = false;
        },

        saveField() {
            this.$refs["editorForm"].validate(async (success) => {
                if (!success) {
                    this.$message.error("数据不合规范，请检查");
                    return false;
                }

                if (
                    this.fieldProps.referTo.length <= 0 ||
                    !this.fieldProps.referenceSetting
                ) {
                    this.$message.error("请设置引用实体！");
                    return;
                }

                this.fieldProps.type = "ReferenceList";
                let referToEntities = "";
                this.fieldProps.referTo.forEach((item, idx) => {
                    let filed = item.name || item
                    if (idx !== this.fieldProps.referTo.length - 1) {
                        referToEntities += filed + ",";
                    } else {
                        referToEntities += filed;
                    }
                });

                let saveMethod = addAnyRefField;
                if (this.fieldState === FieldState.EDIT) {
                    saveMethod = updateAnyRefField;
                }
                let res = await saveMethod(
                    this.fieldProps,
                    this.entity,
                    referToEntities
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

        clearReferTo(refIdx) {
            this.referenceList[refIdx].currentRefEntity = "";
            this.referenceList[refIdx].refEntityAndFields = "";
            this.buildReferToAndReferenceSetting();
        },

        showRefEntitySettingDialog(refIdx) {
            this.showRefEntityDialogFlag = true;
            this.refEntityIndex = refIdx;

            // 如果当前引用实体已有数据，则加载对应的数据
            const currentRef = this.referenceList[refIdx];
            if (currentRef && currentRef.currentRefEntity) {
                this.refEntityName = currentRef.currentRefEntity;
                this.refEntityLabel = currentRef.currentRefEntity; // 临时设置，后面会通过API获取正确的标签
                this.refEntityFullName = currentRef.currentRefEntity + "(" + currentRef.currentRefEntity + ")"; // 临时设置
                
                // 先恢复已选择的字段，避免清空后丢失
                if (currentRef.selectedFieldItems && currentRef.selectedFieldItems.length > 0) {
                    this.selectedFieldItems = JSON.parse(JSON.stringify(currentRef.selectedFieldItems));
                } else {
                    this.selectedFieldItems = [];
                }
                
                // 需要根据实体名称重新获取实体标签和字段信息
                this.loadRefEntityData(currentRef.currentRefEntity, currentRef.selectedFieldItems);
            } else {
                // 只有在没有现有数据时才清空
                this.refEntityName = "";
                this.refEntityLabel = "";
                this.refEntityFullName = "";
                this.fieldItems.length = 0;
                this.selectedFieldItems.length = 0;
            }
        },
        
        async loadRefEntityData(entityName, selectedFields = []) {
            try {
                // 获取实体信息
                let res = await getEntitySet();
                if (res && res.code == 200) {
                    const entity = res.data.find(el => el.name === entityName);
                    if (entity) {
                        this.refEntityLabel = entity.label;
                        this.refEntityFullName = this.refEntityLabel + "(" + this.refEntityName + ")";
                    }
                }
                
                // 获取字段信息
                let fieldRes = await getFieldSet(entityName);
                if (fieldRes && fieldRes.code == 200) {
                    this.fieldItems.length = 0;
                    let resultList = fieldRes.data;
                    if (!!resultList) {
                        resultList.filter((item) => {
                            if (item.type !== "PrimaryKey") {
                                this.fieldItems.push(item);
                            }
                        });
                    }
                }
            } catch (error) {
                console.error('加载引用实体数据失败:', error);
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
        setRefEntity() {
            if (this.selectedFieldItems.length <= 0) {
                this.$message.info("请至少选择一个显示字段！");
                return;
            }

            // 检查是否与其他引用实体重复
            for (let i = 0; i < this.referenceList.length; i++) {
                if (i !== this.refEntityIndex && 
                    this.referenceList[i].currentRefEntity === this.refEntityName) {
                    this.$message.error(`不能选择重复的实体：${this.refEntityLabel}(${this.refEntityName})`);
                    return;
                }
            }

            let tempStr = this.refEntityLabel + "[";
            for (let i = 0; i < this.selectedFieldItems.length; i++) {
                tempStr += this.selectedFieldItems[i].label + ",";
            }
            tempStr += "]";
            this.referenceList[this.refEntityIndex].refEntityAndFields =
                tempStr;

            this.referenceList[this.refEntityIndex].currentRefEntity =
                this.refEntityName;
            this.referenceList[this.refEntityIndex].selectedFieldItems =
                JSON.parse(JSON.stringify(this.selectedFieldItems));
            this.buildReferToAndReferenceSetting();
            // console.log( JSON.stringify(this.fieldProps.referenceSetting) )

            this.showRefEntityDialogFlag = false;
            
            
            // 清空对话框相关的数据，避免影响下次使用
            this.refEntityName = "";
            this.refEntityLabel = "";
            this.refEntityFullName = "";
            this.fieldItems.length = 0;
            this.selectedFieldItems.length = 0;
        },

        async showEntityListDialog() {
            this.$refs.selectEntityDialogRef.openDialog(this.$route.query.appAbbr, this.refEntityName);
        },

        async selectEntity(row) {
            // 检查是否与其他引用实体重复
            for (let i = 0; i < this.referenceList.length; i++) {
                if (this.referenceList[i].currentRefEntity === row.name) {
                    this.$message.error(`不能选择重复的实体：${row.label}(${row.name})`);
                    return;
                }
            }

            this.refEntityName = row.name;
            this.refEntityLabel = row.label;
            this.refEntityFullName =
                this.refEntityLabel + "(" + this.refEntityName + ")";
            this.showEntityListDialogFlag = false;

            // 清空之前选择的字段数据
            this.fieldItems.length = 0;
            this.selectedFieldItems.length = 0;
            
            let res = await getFieldSet(this.refEntityName);
            if (res && res.code == 200) {
                let resultList = res.data;
                if (!!resultList) {
                    resultList.filter((item) => {
                        if (item.type !== "PrimaryKey") {
                            this.fieldItems.push(item);
                        }
                    });
                }
            }
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

        addRefEntity() {
            this.referenceList.push({
                currentRefEntity: "",
                selectedFieldItems: [],
                refEntityAndFields: "",
            });
        },

        deleteRefEntity(refIdx) {
            this.referenceList.splice(refIdx, 1);
            this.buildReferToAndReferenceSetting();
        },

        buildReferToAndReferenceSetting() {
            this.fieldProps.referTo.length = 0;
            this.fieldProps.referenceSetting.length = 0;

            this.referenceList.forEach((ref) => {
                if (!!ref.currentRefEntity && !!ref.selectedFieldItems) {
                    let fieldList = [];
                    ref.selectedFieldItems.forEach((item) => {
                        fieldList.push(item.name);
                    });
                    this.fieldProps.referTo.push(ref.currentRefEntity);
                    this.fieldProps.referenceSetting.push({
                        entityName: ref.currentRefEntity,
                        fieldList: fieldList,
                    });
                }
            });

            //console.log(JSON.stringify(this.fieldProps.referTo))
            //console.log(JSON.stringify(this.fieldProps.referenceSetting))
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

.refer-entity-dialog,
.entity-list-dialog {
    :deep(.el-dialog__header) {
        padding: 15px;
        padding-bottom: 3px;
    }

    :deep(.el-dialog__body) {
        padding: 6px !important;
    }
}
</style>
