<template>
    <el-container class="field-props-container">
        <el-header class="field-props-header" v-if="!showingInDialog">[一对多引用]字段属性设置</el-header>
        <el-main class="field-props-pane">
            <el-form
                :model="fieldProps"
                ref="editorForm"
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
                <el-form-item label="引用实体设置">
                    <el-button style="float: right" icon="el-icon-plus" @click="addRefEntity">添加</el-button>
                </el-form-item>
                <hr style="border: 0;margin-bottom: 15px" />
                <el-form-item
                    :label="'引用实体' + (refIdx + 1)"
                    v-for="(refEntity, refIdx) in referenceList"
                    :key="refIdx"
                >
                    <el-input v-model="refEntity.refEntityAndFields" readonly>
                        <template #append>
                            <el-button
                                icon="el-icon-close"
                                title="清除"
                                v-if="!!refEntity.currentRefEntity"
                                @click="clearReferTo(refIdx)"
                            ></el-button>
                            <el-button
                                icon="el-icon-search"
                                title="选择"
                                @click="showRefEntitySettingDialog(refIdx)"
                            ></el-button>
                            <el-button
                                icon="el-icon-delete"
                                title="删除"
                                @click="deleteRefEntity(refIdx)"
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
                    <el-input placeholder="请选择引用实体" v-model="refEntityFullName">
                        <template #append>
                            <el-button
                                icon="el-icon-search"
                                title="选择"
                                @click="showEntityListDialog"
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

        <el-dialog
            ref="entityListDlg"
            title="选择引用实体"
            v-model="showEntityListDialogFlag"
            :append-to-body="true"
            class="entity-list-dialog"
            width="560px"
        >
            <SimpleTable
                :show-pagination="false"
                :show-check-box="false"
                :table-size="'small'"
                :columns="columns"
                :data="tableData"
                :show-operation-column="true"
                :max-height="420"
            >
                <template #table_operation="{scope}">
                    <el-button class icon="el-icon-check" @click="selectEntity(scope.row)">选择</el-button>
                </template>
            </SimpleTable>
        </el-dialog>
    </el-container>
</template>

<script>
import {
    addAnyRefField,
    getEntitySet,
    getFieldSet,
} from "@/api/system-manager";
import { getSimplePinYin } from "@/utils/util";
import { fieldEditorMixin } from "./field-editor-mixin";

export default {
    name: "AnyReferenceWidgetEditor",
    props: ["entity", "showingInDialog"],
    mixins: [fieldEditorMixin],
    data() {
        return {
            fieldProps: {
                name: "",
                label: "",
                type: "AnyReference",
                defaultMemberOfListFlag: false,
                nullable: false,
                creatable: true,
                updatable: true,
                fieldViewModel: {
					uniqueness: false,
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
        //mixin
    },
    methods: {
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

                this.fieldProps.type = "AnyReference";
                let referToEntities = "";
                this.fieldProps.referTo.forEach((item, idx) => {
                    if (idx !== this.fieldProps.referTo.length - 1) {
                        referToEntities += item + ",";
                    } else {
                        referToEntities += item;
                    }
                });
                let res = await addAnyRefField(
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

            this.refEntityName = "";
            this.refEntityLabel = "";
            this.refEntityFullName = "";
            this.fieldItems.length = 0;
            this.selectedFieldItems.length = 0;
        },

        setRefEntity() {
            this.showRefEntityDialogFlag = false;
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
        },

        async showEntityListDialog() {
            this.tableData.length = 0;
            let res = await getEntitySet();
            if (res && res.code == 200) {
                let entityItems = res.data;
                if (!!entityItems) {
                    entityItems.filter((entity) => {
                        if (entity.detailEntityFlag === false) {
                            this.tableData.push({
                                name: entity.name,
                                label: entity.label,
                            });
                        }
                    });
                }
                this.showEntityListDialogFlag = true;
            }
        },

        async selectEntity(row) {
            this.refEntityName = row.name;
            this.refEntityLabel = row.label;
            this.refEntityFullName =
                this.refEntityLabel + "(" + this.refEntityName + ")";
            this.showEntityListDialogFlag = false;

            this.fieldItems.length = 0;
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
            // this.fieldProps.referenceSetting = []

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
        padding: 6px;
    }
}
</style>
