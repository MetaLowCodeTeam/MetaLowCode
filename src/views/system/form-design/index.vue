<template>
    <div v-loading="pageLoading" style="height:100%">
        <v-form-designer
            ref="vfDesigner"
            :designer-config="designerConfig"
            :global-dsv="globalDsv"
            :field-list-data="fieldListData"
            @field-widget-used="handleFWU"
            @field-widget-removed="handleFWR"
            @form-json-updated="handleFJU"
            class="visual-design"
        >
            <!-- 配置工具按钮 -->
            <template #customToolButtons>
                <el-dropdown
                    class="ml-button-dropdown"
                    @command="handleNewFieldCommand"
                    size="small"
                >
                    <el-button link type="primary">
                        <el-icon>
                            <MagicStick />
                        </el-icon>新建字段
                    </el-button>
                    <template #dropdown>
                        <el-dropdown-menu>
                            <el-dropdown-item command="BooleanWE">布尔 / Boolean</el-dropdown-item>
                            <el-dropdown-item command="IntegerWE">整数 / Integer</el-dropdown-item>
                            <el-dropdown-item command="DecimalWE">精度小数 / Decimal</el-dropdown-item>
                            <el-dropdown-item command="MoneyWE">金额 / Money</el-dropdown-item>
                            <el-dropdown-item command="TextWE" divided>文本 / Text</el-dropdown-item>
                            <el-dropdown-item command="TextAreaWE">长文本 / TextArea</el-dropdown-item>
                            <el-dropdown-item command="OptionWE" divided>单选项 / Option</el-dropdown-item>
                            <el-dropdown-item command="TagWE">多选项 / Tag</el-dropdown-item>
                            <el-dropdown-item command="AreaSelectWE">地区选择 / AreaSelect</el-dropdown-item>
                            <el-dropdown-item command="DateWE" divided>日期 / Date</el-dropdown-item>
                            <el-dropdown-item command="DateTimeWE">日期时间 / DateTime</el-dropdown-item>
                            <el-dropdown-item command="PictureWE" divided>图片 / Picture</el-dropdown-item>
                            <el-dropdown-item command="FileWE">文件 / File</el-dropdown-item>
                            <el-dropdown-item command="ReferenceWE" divided>一对一引用 / Reference</el-dropdown-item>
                        </el-dropdown-menu>
                    </template>
                </el-dropdown>
                <el-button type="primary" link @click="saveDesign">
                    <el-icon>
                        <Finished />
                    </el-icon>保存设计
                </el-button>
                <el-button type="primary" link @click="saveAsDesign" v-if="saveAsBtnShow">
                    <el-icon>
                        <Finished />
                    </el-icon>另存为
                </el-button>
            </template>
        </v-form-designer>
    </div>

    <el-dialog
        :title="'新建字段 / ' + curEditorType"
        v-model="showNewFieldDialogFlag"
        v-if="showNewFieldDialogFlag"
        :show-close="true"
        :destroy-on-close="true"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
        class="no-padding"
        width="620px"
    >
        <component
            :is="curFWEditor"
            :entity="entity"
            @fieldSaved="onFieldSaved"
            @cancelSave="onCancelSaveField"
            :showingInDialog="true"
        ></component>
    </el-dialog>
    <!-- 选择表单弹框 -->
    <ml-dialog
        title="选择表单"
        v-model="formLayoutDialogConf.isShow"
        append-to-body
        width="300"
        draggable
        :showClose="false"
    >
        <div
            class="form-layout-item"
            v-for="(item,inx) of formLayoutDialogConf.list"
            :key="inx"
            @click="selectedFormLayou(inx)"
        >
            <div
                class="form-layout-item-name yichu fl"
                :title="item.layoutName"
            >{{ item.layoutName }}</div>
            <div class="form-layout-item-icon fl">
                <span class="form-layout-item-edit" @click.stop="editActionFormLayout(inx)">
                    <el-icon size="18">
                        <ElIconEdit />
                    </el-icon>
                </span>
                <span class="form-layout-item-del" @click.stop="delActionFormLayout(inx)">
                    <el-icon size="18">
                        <ElIconDelete />
                    </el-icon>
                </span>
            </div>
        </div>
    </ml-dialog>
    <!-- 另存为弹框 -->
    <ml-dialog
        :title="saveAsDialogConf.formLayout.formLayoutId ? '表单编辑' : '表单另存为'"
        v-model="saveAsDialogConf.isShow"
        append-to-body
        width="500"
        draggable
    >
        <div v-loading="saveAsDialogConf.loading" class="pr-30">
            <el-form label-width="70px">
                <el-form-item label="名称" class="mb-5 is-required">
                    <el-input v-model="saveAsDialogConf.formLayout.layoutName" clearable />
                </el-form-item>
                <el-form-item class="mb-5">
                    <mlShareTo v-model="saveAsDialogConf.formLayout.shareTo" />
                </el-form-item>
            </el-form>
            <div class="w-100" style="text-align: right;">
                <el-button @click="saveAsDialogConf.isShow = false">取消</el-button>
                <el-button type="primary" @click="confirmSaveAs">确认</el-button>
            </div>
        </div>
    </ml-dialog>
</template>

<script>
import {
    createFormLayout,
    updateFormLayout,
    getFormLayout,
    getMDFieldList,
    getFormLayoutList,
    deleteFormLayout,
    updateNameFormLayout,
} from "@/api/system-manager";
import { deepClone, overwriteObj } from "@/utils/util";
import { formFieldMapping } from "@/views/system/form-design/formFieldMapping";
import BooleanWE from "@/views/system/field-editor/boolean-widget-editor.vue";
import IntegerWE from "@/views/system/field-editor/integer-widget-editor.vue";
import DecimalWE from "@/views/system/field-editor/decimal-widget-editor.vue";
import MoneyWE from "@/views/system/field-editor/money-widget-editor.vue";
import TextWE from "@/views/system/field-editor/text-widget-editor.vue";
import EmailWE from "@/views/system/field-editor/email-widget-editor.vue";
import UrlWE from "@/views/system/field-editor/url-widget-editor.vue";
import TextAreaWE from "@/views/system/field-editor/textarea-widget-editor.vue";
import PasswordWE from "@/views/system/field-editor/password-widget-editor.vue";
import OptionWE from "@/views/system/field-editor/option-widget-editor.vue";
import TagWE from "@/views/system/field-editor/tag-widget-editor.vue";
import AreaSelectWE from "@/views/system/field-editor/areaselect-widget-editor.vue";
import DateWE from "@/views/system/field-editor/date-widget-editor.vue";
import DateTimeWE from "@/views/system/field-editor/datetime-widget-editor.vue";
import PictureWE from "@/views/system/field-editor/picture-widget-editor.vue";
import FileWE from "@/views/system/field-editor/file-widget-editor.vue";
import ReferenceWE from "@/views/system/field-editor/reference-widget-editor.vue";
import AnyReferenceWE from "@/views/system/field-editor/anyreference-widget-editor.vue";
import ReferenceListWE from "@/views/system/field-editor/referencelist-widget-editor.vue";
import MlShareTo from "@/components/mlShareTo/index.vue";
//const visualDesign = import.meta.glob('@/../lib/visual-design/designer.umd.js')
import { mlShortcutkeys } from "@/utils/util";
export default {
    name: "form-design",
    components: {
        BooleanWE,
        IntegerWE,
        DecimalWE,
        MoneyWE,
        TextWE,
        EmailWE,
        UrlWE,
        TextAreaWE,
        PasswordWE,
        OptionWE,
        TagWE,
        AreaSelectWE,
        DateWE,
        DateTimeWE,
        PictureWE,
        FileWE,
        ReferenceWE,
        AnyReferenceWE,
        ReferenceListWE,
        MlShareTo,
    },
    prop: {
        entity: {
            type: String,
        },
        entityLabel: {
            type: String,
        },
    },
    data() {
        return {
            designerConfig: {
                componentLib: false,
                formTemplates: false,
                eventCollapse: false,
                metadataLib: true,
                logoHeader: false,
                exportCodeButton: false,
                generateSFCButton: false,
                toolbarMaxWidth: 300,
            },
            globalDsv: {
                uploadServer: import.meta.env.VITE_APP_BASE_API,
            },
            fieldListData: {},
            layoutId: null,
            formOptionData: {},

            meteFieldsResult: null,
            usedFieldNames: {},

            curFWEditor: "",
            curEditorType: "",
            showNewFieldDialogFlag: false,
            pageLoading: false,
            /**
             * 多表单设计 2024-02-22
             */
            formLayoutDialogConf: {
                isShow: false,
                list: [],
            },
            saveAsBtnShow:false,
            // 另存为弹框
            saveAsDialogConf: {
                isShow: false,
                loading: false,
                // 表单数据
                formLayout: {},
            },
        };
    },
    created() {
        this.entity = this.$route.query.entity;
        this.entityLabel = this.$route.query.entityLabel;
        this.designerConfig.componentLib = !!window.advancedDevMode;
        this.designerConfig.eventCollapse = !!window.advancedDevMode;
    },
    mounted() {
        this.loadDesign();
        mlShortcutkeys(() => {
            window.advancedDevMode = !window.advancedDevMode;
            this.designerConfig.componentLib = !!window.advancedDevMode;
            this.designerConfig.eventCollapse = !!window.advancedDevMode;
            this.saveAsBtnShow = !this.saveAsBtnShow;
        });
    },
    methods: {
        loadFieldListData() {
            getMDFieldList(this.entity)
                .then((res) => {
                    if (res.data.fieldList) {
                        this.fieldListData.fieldList = res.data.fieldList;
                        if (res.data.subFormList) {
                            this.fieldListData.subFormList =
                                res.data.subFormList;
                        }
                        this.meteFieldsResult = res;
                        const metaFields = this.buildMetaFields(
                            this.meteFieldsResult
                        );
                        this.$refs.vfDesigner.setFieldListData(
                            this.fieldListData
                        );
                        this.$refs.vfDesigner.setMetaFields(metaFields);
                    }
                })
                .catch((res) => {
                    this.$message({ message: res.message, type: "error" });
                });
        },

        buildMetaFields(mdResult) {
            const result = {
                main: {
                    entityName: this.entity,
                    entityLabel: this.entityLabel,
                    fieldList: [],
                },
                detail: [],
            };

            if (mdResult && mdResult.data?.fieldList) {
                mdResult.data.fieldList.forEach((fld) => {
                    if (!fld.detailEntity && fld.type !== "PrimaryKey") {
                        //跳过id主键
                        if (fld.name === "loginPwd") {
                            return;
                        }

                        if (
                            fld.type === "AnyReference" ||
                            fld.type === "ReferenceList"
                        ) {
                            return;
                        }

                        if (this.usedFieldNames.hasOwnProperty(fld.name)) {
                            return; //跳过本次循环
                        }

                        const fieldNewProps = deepClone(
                            formFieldMapping[fld.type]
                        );
                        const fieldSchema = deepClone(
                            this.$refs.vfDesigner.designer.getFieldWidgetByType(
                                fieldNewProps.type
                            )
                        );
                        overwriteObj(
                            fieldSchema.options,
                            fieldNewProps.options
                        );

                        fieldSchema.displayName = fld.label;
                        fieldSchema.nameReadonly = true;
                        fieldSchema.options.name = fld.name;
                        fieldSchema.options.label = fld.label;
                        this.adjustFieldSchema(fieldSchema, fld, mdResult);
                        result.main.fieldList.push(fieldSchema);
                    }
                });
            }

            if (mdResult && mdResult.data?.subFormList) {
                mdResult.data.subFormList.forEach((sf) => {
                    const deName = sf.name;
                    const deLabel = sf.label;
                    const detailDataItem = {
                        entityName: deName,
                        entityLabel: deLabel,
                        fieldList: [],
                    };

                    mdResult.data.fieldList.forEach((fld) => {
                        if (
                            fld.detailEntity &&
                            fld.detailEntity === deName &&
                            fld.type !== "PrimaryKey"
                        ) {
                            //跳过id主键
                            if (
                                fld.type === "AnyReference" ||
                                fld.type === "ReferenceList"
                            ) {
                                return;
                            }

                            if (this.usedFieldNames.hasOwnProperty(fld.name)) {
                                return; //跳过本次循环
                            }

                            const fieldNewProps = deepClone(
                                formFieldMapping[fld.type]
                            );
                            const fieldSchema = deepClone(
                                this.$refs.vfDesigner.designer.getFieldWidgetByType(
                                    fieldNewProps.type
                                )
                            );
                            overwriteObj(
                                fieldSchema.options,
                                fieldNewProps.options
                            );

                            fieldSchema.displayName = fld.label;
                            fieldSchema.nameReadonly = true;
                            fieldSchema.options.name = fld.name;
                            fieldSchema.options.label = fld.label;
                            this.adjustFieldSchema(fieldSchema, fld, mdResult);
                            detailDataItem.fieldList.push(fieldSchema);
                        }
                    });

                    result.detail.push(detailDataItem);
                });
            }

            return result;
        },

        adjustFieldSchema(fieldSchema, fldObj, mdResult) {
            // 处理图片、文件上传字段！！
            let cloudStorageFlag = false;
            let cloudStorageType = "";
            if (mdResult.data.storageSetting) {
                cloudStorageFlag =
                    mdResult.data.storageSetting[0].cloudStorage === "true";
                if (cloudStorageFlag) {
                    cloudStorageType =
                        mdResult.data.storageSetting[0].cloudStorageType;
                }
            }

            if (fldObj.type === "Picture" || fldObj.type === "File") {
                if (cloudStorageFlag) {
                    //设置withCredentials
                    fieldSchema.options.withCredentials = false;

                    //设置onBeforeUpload事件代码(还需要生成uuid新文件名)
                    fieldSchema.options.onBeforeUpload =
                        "const gDSV = this.getGlobalDsv();\nconst wType = this.field.type;\nif (wType === 'picture-upload') {\n  this.field.options.uploadURL = gDSV.picUploadURL;\n} else if (wType === 'file-upload')  {\n  this.field.options.uploadURL = gDSV.fileUploadURL;\n}\n\nconst cloudStorage = gDSV.cloudStorage;\nif (cloudStorage === \"true\") {\n  this.field.options.withCredentials = false\n  const token = gDSV.cloudUploadToken;\n  this.setUploadData('token', token);\n  \n  const randomNum = Math.floor(Math.random() * 100);\n  const newFileName = new Date().getTime() + randomNum+ '_' + file.name;\n  this.setUploadData('key', newFileName);\n} else {\n  //this.field.options.withCredentials = true\n}\n";

                    //设置onUploadSuccess事件代码(上传返回结果需要设置QiNiu=前缀)
                    fieldSchema.options.onUploadSuccess =
                        "const gDSV = this.getGlobalDsv();\nconst cloudStorage = gDSV.cloudStorage;\nif (cloudStorage === \"true\") {\n  const wType = this.field.type;\n  let downloadPrefix = \"\"\n  if (wType === 'picture-upload') {\n    downloadPrefix = gDSV.picDownloadPrefix;\n  } else if (wType === 'file-upload')  {\n    downloadPrefix = gDSV.fileDownloadPrefix;\n  }\n  \n  let downUrl = downloadPrefix + result.key;\n  const paramName = (downUrl.indexOf(\"?\") === -1) ? '?fileName=' : '&fileName=';\n  return {\n    name: file.name,\n    url: downUrl + paramName + file.name\n  }\n} else {\n  const paramName = (result.url.indexOf(\"?\") === -1) ? '?fileName=' : '&fileName=';\n  return {\n    name: file.name,\n    url: result.url + paramName + file.name\n  }\n}\n";
                }
            }
            // 处理图片、文件上传字段 -- 结束

			/* 处理文本、长文本字段 */
			if (fldObj.type === "Text" || fldObj.type === "TextArea") {
				fieldSchema.options.maxLength = !fldObj.maxLength
					? fieldSchema.options.maxLength
					: fldObj.maxLength * 1;
			}

            /* 处理精度小数字段 */
            if (
                fldObj.type === "Integer" ||
                fldObj.type === "Percent" ||
                fldObj.type === "Money" ||
                fldObj.type === "Decimal"
            ) {
                fieldSchema.options.precision = !fldObj.precision
                    ? fieldSchema.options.precision
                    : fldObj.precision * 1;
                fieldSchema.options.min = !fldObj.min
                    ? fieldSchema.options.min
                    : fldObj.min * 1;
                fieldSchema.options.max = !fldObj.max
                    ? fieldSchema.options.max
                    : fldObj.max * 1;
            }

            /* 处理地区选择字段 */
            if (fldObj.type === "AreaSelect") {
                fieldSchema.optionItemsReadonly = true;
                fieldSchema.options.areaDataType = !fldObj.areaDataType
                    ? fieldSchema.options.areaDataType
                    : fldObj.areaDataType * 1;
            }

            /* 处理一对一字段 */
            if (fldObj.type === "Reference") {
                fieldSchema.options.searchDialogWidth =
                    !fldObj.searchDialogWidth
                        ? fieldSchema.options.searchDialogWidth
                        : fldObj.searchDialogWidth;
            }

			/* 处理单选项字段 */
            if (fieldSchema.options.hasOwnProperty("optionItems")) {
                if (
                    this.formOptionData.hasOwnProperty(fieldSchema.options.name)
                ) {
                    fieldSchema.options.optionItems = deepClone(
                        this.formOptionData[fieldSchema.options.name]
                    );
                }

                if (fldObj.type === "Boolean") {
                    fieldSchema.options.optionItems = [
                        { value: true, label: "是" },
                        { value: false, label: "否" },
                    ];
                }

                fieldSchema.optionItemsReadonly = true;
            }

			/* 设置字段必填校验 */
			if (fldObj.hasOwnProperty("required")) {
				fieldSchema.options.required = fldObj["required"] === "1";
			}

			/* 取消系统字段的必填校验 */
			if (fieldSchema.options.name === "createdOn" || fieldSchema.options.name === "createdBy"
				|| fieldSchema.options.name === "modifiedOn" || fieldSchema.options.name === "modifiedBy"
				|| fieldSchema.options.name === "ownerUser" || fieldSchema.options.name === "ownerDepartment"
				|| fieldSchema.options.name === "approvalConfigId" || fieldSchema.options.name === "approvalStatus"
				|| fieldSchema.options.name === "lastApprovedBy" || fieldSchema.options.name === "lastApprovedOn") {
				fieldSchema.options.required = false;
			}

			//
        },

        handleFWU(fwName) {
            this.usedFieldNames[fwName] = 1;

            /* 必须延时处理，否则draggable会报错 */
            setTimeout(() => {
                const metaFields = this.buildMetaFields(this.meteFieldsResult);
                this.$refs.vfDesigner.setMetaFields(metaFields);
            }, 800);
        },

        handleFWR(fwName) {
            delete this.usedFieldNames[fwName];

            /* 必须延时处理，否则draggable会报错 */
            setTimeout(() => {
                const metaFields = this.buildMetaFields(this.meteFieldsResult);
                this.$refs.vfDesigner.setMetaFields(metaFields);
            }, 800);
        },

        handleFJU() {
            this.handleUsedFields();
            setTimeout(() => {
                const metaFields = this.buildMetaFields(this.meteFieldsResult);
                this.$refs.vfDesigner.setMetaFields(metaFields);
            }, 300);
        },

        /**
         * 过滤已使用字段组件
         */
        handleUsedFields() {
            this.usedFieldNames = {};
            const allFieldWidgets = this.$refs.vfDesigner.getFieldWidgets();
            allFieldWidgets.forEach((fwItem) => {
                this.usedFieldNames[fwItem.name] = 1;
            });
        },

        async loadDesign() {
            this.pageLoading = true;
            this.$refs.vfDesigner.clearDesigner();
            let res = await getFormLayoutList(this.entity);
            if (res) {
                this.formLayoutDialogConf.list = res.data;
                if (res.data) {
                    // 如果有多个表单需要弹框选择表单
                    if (res.data.length > 1) {
                        this.formLayoutDialogConf.isShow = true;
                    } else {
                        this.setDesign(res.data[0]);
                    }
                } else {
                    this.setDesign({});
                }
            }
            this.pageLoading = false;
        },

        // 选择表单
        selectedFormLayou(inx) {
            this.setDesign(this.formLayoutDialogConf.list[inx]);
            this.formLayoutDialogConf.isShow = false;
        },

        // 设置表单数据
        setDesign(data) {
            if (data.layoutJson) {
                this.layoutId = data.formLayoutId;
                this.$refs.vfDesigner.setFormJson(data.layoutJson);
                this.handleUsedFields();
            } else {
                this.$refs.vfDesigner.clearDesigner();
            }

            if (data.optionData) {
                this.formOptionData = data.optionData;
                this.$refs.vfDesigner.setTestOptionData(data.optionData);
            }
            this.loadFieldListData();
        },

        // 打开编辑表单弹框
        editActionFormLayout(inx) {
            this.saveAsDialogConf.formLayout = JSON.parse(
                JSON.stringify(this.formLayoutDialogConf.list[inx])
            );
            this.saveAsDialogConf.isShow = true;
        },
        // 删除表单
        delActionFormLayout(inx) {
            //
            this.$confirm("是否删除该表?", "确认信息", {
                distinguishCancelAndClose: true,
                confirmButtonText: "确认",
                cancelButtonText: "取消",
                type: "warning",
                beforeClose: async (action, instance, done) => {
                    if (action === "confirm") {
                        instance.confirmButtonLoading = true;
                        instance.confirmButtonText = "删除中...";
                        let res = await deleteFormLayout(
                            this.formLayoutDialogConf.list[inx].formLayoutId
                        );
                        if (res && res.code == 200) {
                            this.$message.success("删除成功");
                            this.loadDesign();
                            done();
                            instance.confirmButtonLoading = false;
                        }
                    } else {
                        done();
                    }
                },
            }).then(() => {});
        },

        // 另存为
        saveAsDesign() {
            this.saveAsDialogConf.formLayout = {
                shareTo: "ALL",
            };
            this.saveAsDialogConf.isShow = true;
        },

        // 确认另存为
        confirmSaveAs() {
            let { formLayoutId, layoutName, shareTo } =
                this.saveAsDialogConf.formLayout;
            if (!layoutName) {
                this.$message.warning("请输入名称");
                return;
            }
            if (!formLayoutId) {
                this.createFormLayout(layoutName, shareTo);
            } else {
                this.layoutId = formLayoutId;
                this.updateNameFormLayout(layoutName, shareTo);
            }
        },
        // openSaveAsDialog() {
        //     console.log("点击修改");
        // },

        saveDesign() {
            //TODO: 检查表单设计是否符合规范！！！
            /**
             * 1. 必填字段必须添加到表单；
             * 2. 子表单名称关联到明细实体，必须正确设置；
             * 3. 主实体字段不能出现在子表单中、明细实体字段只能出现在明细实体关联的子表单中。
             */

            if (!this.layoutId) {
                this.createFormLayout();
            } else {
                this.updateFormLayout();
            }
        },
        // 新建表单
        async createFormLayout(layoutName, shareTo) {
            this.loadActionLoading(layoutName, true);
            let res = await createFormLayout(
                this.entity,
                this.$refs.vfDesigner.getFormJson(),
                layoutName,
                shareTo
            );

            if (res && res.code == 200) {
                if (layoutName) {
                    this.saveAsDialogConf.isShow = false;
                }
                this.layoutId = res.data;
                this.$message.success("保存成功");
            }
            this.loadActionLoading(layoutName, false);
        },
        // 编辑表单
        async updateFormLayout() {
            this.loadActionLoading(false, true);
            let res = await updateFormLayout(
                this.layoutId,
                this.$refs.vfDesigner.getFormJson()
            );

            if (res && res.code == 200) {
                this.$message.success("保存成功");
            }
            this.loadActionLoading(false, false);
        },
        // 编辑表名
        async updateNameFormLayout(layoutName, shareTo) {
            this.loadActionLoading(layoutName, true);
            let res = await updateNameFormLayout(
                this.layoutId,
                layoutName,
                shareTo
            );

            if (res && res.code == 200) {
                this.$message.success("保存成功");
                this.loadDesign();
                this.saveAsDialogConf.isShow = false;
            }
            this.loadActionLoading(layoutName, false);
        },
        //
        // 加载操作loading
        loadActionLoading(layoutName, status) {
            if (layoutName) {
                this.saveAsDialogConf.loading = status;
            } else {
                this.pageLoading = status;
            }
        },

        handleNewFieldCommand(command) {
            // TODO: 此处应该判断是否具备实体字段创建权限！！

            this.curFWEditor = command;
            this.curEditorType = command.replace(/WE$/, "");
            this.showNewFieldDialogFlag = true;
        },

        onFieldSaved() {
            this.showNewFieldDialogFlag = false;
            setTimeout(() => {
                this.loadFieldListData(); //重新加载元数据字段
            }, 300);
        },

        onCancelSaveField() {
            this.showNewFieldDialogFlag = false;
        },
    },
};
</script>

<style lang="scss" scoped>
:deep(.toolbar-header .toolbar-container) {
    width: 100%;
}

.el-button + .el-dropdown {
    margin-left: 0 !important;
    margin-top: -2px;
}

.form-layout-item {
    height: 30px;
    line-height: 30px;
    border-bottom: 1px solid #ddd;
    margin-bottom: 10px;
    cursor: pointer;
    &:hover {
        // background: #ccc;
        .form-layout-item-name {
            color: var(--el-color-primary);
        }
    }
    .form-layout-item-name {
        width: 215px;
    }
    .form-layout-item-icon {
        width: 45px;
        box-sizing: border-box;
        padding-top: 4px;
        .form-layout-item-edit {
            margin-right: 5px;
        }
        span {
            &:hover {
                color: #000;
            }
        }
    }
    // .form-layout-item-icon {
    //     position: relative;
    //     top: 4px;
    //     margin-right: 5px;
    // }
}
</style>
<style>
.main-container.visual-design li {
    box-sizing: content-box !important;
}

.ds-setting-drawer .el-drawer__body {
    padding: 20px !important;
}

.el-dropdown.ml-button-dropdown {
    height: 45px;
}

.form-widget-container,
.form-render-wrapper {
    .el-form-item--default,
    .el-form-item {
        margin-bottom: 5px !important;
    }
}

.vf-preview-dialog {
    width: 53.7%;
}
</style>
