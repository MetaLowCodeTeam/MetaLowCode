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
                <el-header style="height: 100%">
					<el-row style="width: 100%">
                        <!--
						<el-col :span="24">
							<el-checkbox v-model="refDetailEntityFlag">引用明细实体</el-checkbox>
						</el-col>
						-->
						<el-col :span="24">
							<el-input placeholder="请选择引用实体" v-model="refEntityFullName" :readonly="true">
								<template #append>
									<el-button
										v-if="fieldState === 1"
										icon="el-icon-search"
										title="选择"
										@click="showEntityListDialog"
									></el-button>
								</template>
							</el-input>
						</el-col>
						<!-- -->
						<el-col :span="24" v-if="refDetailEntityFlag && refDetailEntitySelected" style="margin-top: 12px">
							<el-form-item label="请选择指向明细实体所属主实体的引用字段">
								<el-select placeholder="请选择" style="width: 100%">
									<el-option-group label="当前实体">
										<!--										<el-option label="1" value="1"></el-option>-->
									</el-option-group>
									<el-option-group v-if="true" label="主实体">
										<el-option label="2" value="2"></el-option>
									</el-option-group>
								</el-select>
							</el-form-item>
						</el-col>
						<!-- -->
					</el-row>
                </el-header>
                <el-main>
                    <el-tabs v-model="activeTabName">
                        <el-tab-pane label="选择实体搜索列表字段" name="first">
                            <ReferenceEntitySet 
                                :fieldList="fieldItems"
                                v-model="selectedFieldItems"
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

        <el-dialog
            ref="entityListDlg"
            title="选择引用实体"
            v-model="showEntityListDialogFlag"
            v-if="showEntityListDialogFlag"
            :append-to-body="true"
            :destroy-on-close="true"
            class="entity-list-dialog"
            width="760px"
        >
            <el-container>
                <el-header>
                    <el-input
                        v-model="queryText"
                        type="text"
                        placeholder="请输入关键词搜索"
                        @keyup.enter.native="doSearch"
                        clearable
                        @clear="cancelSearch"
                    >
                        <template #append>
                            <el-button @click="doSearch">
                                <el-icon>
                                    <Search />
                                </el-icon>
                            </el-button>
                        </template>
                    </el-input>
                </el-header>

                <el-main class="table-main-wrapper">
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
                            <el-button
                                class
                                icon="el-icon-check"
                                @click="selectEntity(scope.row)"
                            >选择</el-button>
                        </template>
                    </SimpleTable>
                </el-main>
            </el-container>
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
const { queryEntityCodeByName } = useCommonStore();
export default {
    name: "ReferenceWidgetEditor",
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
    components: {
        ReferenceEntitySet,
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

            rules: {
                name: [
                    {
                        required: true,
                        message: "请输入字段名称",
                        trigger: "blur",
                    },
                    {
                        pattern: /^[a-z]+[A-Za-z\d_]*$/,
                        message:
                            "请以小写英文字母开头，中间可输入字母或数字，禁止中文",
                        trigger: "blur",
                    },
                    {
                        min: 2,
                        max: 30,
                        message: "文字长度应在2-30之间",
                        trigger: "blur",
                    },
                ],
                label: [
                    {
                        required: true,
                        message: "请输入显示名称",
                        trigger: "blur",
                    },
                    {
                        pattern: /^[A-Za-z\d\u4e00-\u9fa5]+[_-]*/,
                        message:
                            "名称长度在2-30之间，以中文、英文字母、数字开头，中间可输入下划线或横杠",
                        trigger: "blur",
                    },
                    {
                        min: 2,
                        max: 30,
                        message: "名称长度在2-30之间，以中文、英文字母、数字开头，中间可输入下划线或横杠",
                        trigger: "blur",
                    },
                ],
            },
            validators: [],

            currentRefEntity: "",
			refDetailEntityFlag: false,
			refDetailEntitySelected: false,
            refEntityAndFields: "",

            refEntityName: "",
            refEntityLabel: "",
            refEntityFullName: "",

            showRefEntityDialogFlag: false,
            showEntityListDialogFlag: false,

            fieldItems: [],
            selectedFieldItems: [],
            virtualFields: [],

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
                {
                    prop: "entityType",
                    label: "实体类型",
                    width: "150",
                    align: "center",
                },
            ],
            tableData: [],
            queryText: "",
            activeTabName: "first",
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
            let res2 = await queryEntityListableFieldsByRefField(savedProps.name, this.entity);
            if (res && res.code == 200) {
                if (res.data) {
                    this.currentRefEntity = res.data.currentRefEntity;
                    this.refEntityName = res.data.refEntityName;
                    this.refEntityLabel = res.data.refEntityLabel;
                    this.refEntityFullName = res.data.refEntityFullName;
                    this.refEntityAndFields = res.data.refEntityAndFields;
                    this.selectedFieldItems = res.data.selectedFieldItems;
                    this.virtualFields = res.data.virtualFields;
                }
            }
            if(res2 && res2.code == 200) {
                this.fieldItems = res2.data.map(el => {
                    el.label = el.fieldLabel;
                    el.name = el.fieldName;
                    el.type = el.fieldType;
                    return el
                });
            }
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
                //console.log( JSON.stringify(this.fieldProps) )
                let saveMethod = addRefField;
                if (this.fieldState === FieldState.EDIT) {
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
            let fieldList = this.selectedFieldItems.map(el => el.name);
            let virtualFieldNames = this.virtualFields.map(el => el.name);
            this.fieldProps.referenceSetting = [
                { 
                    entityName: this.currentRefEntity, 
                    fieldList: fieldList,
                    virtualFields: virtualFieldNames
                },
            ];
            // console.log( JSON.stringify(this.fieldProps.referenceSetting) )

            this.showRefEntityDialogFlag = false;
        },

        showEntityListDialog() {
            this.tableData.length = 0;
            this.loadEntityList();
            this.showEntityListDialogFlag = true;
        },

        async selectEntity(row) {
            this.refEntityName = row.name;
            this.refEntityLabel = row.label;
            this.refEntityFullName =
                this.refEntityLabel + "(" + this.refEntityName + ")";
            this.showEntityListDialogFlag = false;
			this.refDetailEntitySelected = this.refDetailEntityFlag;
            this.fieldItems.length = 0;
            let res = await queryEntityListableFields(queryEntityCodeByName(this.refEntityName));
            if (res && res.code == 200) {
                let resultList = res.data;
                if (resultList) {
                    resultList.filter((item) => {
                        item.label = item.fieldLabel;
                        item.name = item.fieldName;
                        item.type = item.fieldType;
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

        async loadEntityList() {
            let appAbbr = this.$route.query.appAbbr;
            let res = await filterEntitySet(this.queryText);
            if (res && res.code == 200) {
				this.tableData.length = 0
                let entityItems;
                if(appAbbr){
                    entityItems = res.data.filter(el => el.systemEntityFlag || el.appAbbr === appAbbr);
                }else{
                    entityItems = res.data.filter(el => !el.appAbbr);
                }
                if (!!entityItems) {
                    entityItems.filter((entity) => {
                        if (!entity.internalEntityFlag) {
                            this.tableData.push({
                                name: entity.name,
                                label: entity.label,
                                entityType: entity.detailEntityFlag ? "从" : "主",
                            });
                        }
                    });
                }
            }
        },

        doSearch() {
            this.loadEntityList();
        },

        cancelSearch() {
            this.loadEntityList();
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
