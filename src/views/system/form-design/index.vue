<template>
    <div class="form-design-box-div" v-loading="pageLoading">
        <v-form-designer
            ref="vfDesigner"
            :designer-config="designerConfig"
            :global-dsv="globalDsv"
            :field-list-data="fieldListData"
            @field-widget-used="handleFWU"
            @field-widget-removed="handleFWR"
            @form-json-updated="handleFJU"
            :banned-widgets="['reference','reference-list','outer-reference','cascader-option']"
            class="visual-design"
        >
            <!-- 配置工具按钮 -->
            <template #customToolButtons>
                <AddField @onFieldSaved="onFieldSaved" :entity="entity">
                    <el-button link type="primary">
                        <el-icon>
                            <MagicStick />
                        </el-icon>新建字段
                    </el-button>
                </AddField>
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
            <template #actionRules="{designer, formConfig}">
                <ActionRulesSetting 
                    ref="actionRulesSetting"
                    :designer="designer" 
                    :form-config="formConfig"
                    :entity="entity"
                    :entityLabel="entityLabel"
                    @initFormWidgets="initFormWidgets"
                ></ActionRulesSetting>
            </template>
        </v-form-designer>
    </div>
    <!-- 选择表单弹框 -->
    <ml-dialog
        title="选择表单"
        v-model="formLayoutDialogConf.isShow"
        append-to-body
        width="330"
        draggable
        :showClose="false"
    >
        <div
            class="form-layout-item"
            v-for="(item, idx) of formLayoutDialogConf.list"
            :key="idx"
            @click="selectedFormLayout(idx)"
        >
            <div
                class="form-layout-item-name yichu fl"
                :title="item.layoutName"
            >
                <el-tooltip content="点击复制表单ID" placement="top">
                    <span @click.stop="copyFormLayoutId(item)">
                        <el-icon size="18" class="icon-top-4">
                            <ElIconDocumentCopy />
                        </el-icon>
                    </span>
                </el-tooltip>
                {{ item.layoutName }}
            </div>
            <div class="form-layout-item-icon fl">
                <span class="form-layout-item-edit" @click.stop="editActionFormLayout(idx)">
                    <el-icon size="18">
                        <ElIconEdit />
                    </el-icon>
                </span>
                <span class="form-layout-item-del" @click.stop="delActionFormLayout(idx)">
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
    saveFormLayout,
    getMDFieldList,
    getFormLayoutList,
    deleteFormLayout,
} from "@/api/system-manager";
import { deepClone, overwriteObj, mlShortcutkeys, copyText } from "@/utils/util";
import { formFieldMapping } from "@/views/system/form-design/formFieldMapping";
import MlShareTo from "@/components/mlShareTo/index.vue";
import AddField from "@/components/mlFormDesignComp/AddField.vue";
import ActionRulesSetting from "./custom/ActionRulesSetting.vue";
export default {
    name: "form-design",
    components: {
        AddField,
        MlShareTo,
        ActionRulesSetting,
    },
    prop: {
        entity: {
            type: String,
        },
        entityLabel: {
            type: String,
        },
    },
    props: {
        isAppManagement: {
            type: Boolean,
            default: false,
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
				baseApi: import.meta.env.VITE_APP_BASE_API,
                SERVER_API: import.meta.env.VITE_APP_BASE_API,
            },
            fieldListData: {},
            layoutId: null,
            formOptionData: {},

            metaFieldsResult: null,
            usedFieldNames: {},

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
            // 快捷键
            mlShortcutCleanup: null,
        };
    },
    created() {
        window.advancedDevMode = true;
        this.entity = this.$route.query.entity;
        this.entityLabel = this.$route.query.entityLabel;
        this.designerConfig.componentLib = !!window.advancedDevMode;
        this.designerConfig.eventCollapse = !!window.advancedDevMode;
        this.saveAsBtnShow = !!window.advancedDevMode;
    },
    mounted() {
        this.loadDesign();
        this.mlShortcutCleanup = mlShortcutkeys(() => {
            window.advancedDevMode = !window.advancedDevMode;
            this.designerConfig.componentLib = !!window.advancedDevMode;
            this.designerConfig.eventCollapse = !!window.advancedDevMode;
            this.saveAsBtnShow = !!window.advancedDevMode;
        });
    },
    beforeDestroy() {
        if(this.mlShortcutCleanup){
            this.mlShortcutCleanup();
        }
    },
    emits: ['initComplete'],
    methods: {
        initFormWidgets() {
            let fieldWidgets = this.$refs.vfDesigner.getFieldWidgets()
            let containerWidgets = this.$refs.vfDesigner.getContainerWidgets();
            console.log(containerWidgets,'getContainerWidgets')
            this.$refs.actionRulesSetting.setFieldWidgets(fieldWidgets)
            this.$refs.actionRulesSetting.setContainerWidgets(containerWidgets)
        },
        loadFieldListData() {
            getMDFieldList(this.entity)
                .then((res) => {
                    if (res.data.fieldList) {
                        this.fieldListData.fieldList = res.data.fieldList;
                        if (res.data.subFormList) {
                            this.fieldListData.subFormList = res.data.subFormList;
                        }
						if (res.data.referenceFormList) {
							this.fieldListData.referenceFormList = res.data.referenceFormList;
						}
                        this.metaFieldsResult = res;
                        const metaFields = this.buildMetaFields(
                            this.metaFieldsResult
                        );
                        this.$refs.vfDesigner.setFieldListData(
                            this.fieldListData
                        );
                        this.$refs.vfDesigner.setMetaFields(metaFields);
                        // 发射事件
                        if(this.isAppManagement){
                            this.$emit("initComplete")
                        }
                    }
                })
                .catch((res) => {
                    this.$message({ message: res.message, type: "error" });
                    // 发射事件
                    if(this.isAppManagement){
                        this.$emit("initComplete")
                    }
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
                            fld.type === "AnyReference"
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
                                fld.type === "AnyReference"
                            ) {
                                return;
                            }

                            if (this.usedFieldNames.hasOwnProperty(fld.detailEntity + '.' + fld.name)) {
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
                            fieldSchema.subFormName = fld.detailEntity;
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
			if (fldObj.virtualFlag === "1") {
				fieldSchema.virtualFlag = true
				fieldSchema.options.disabled = true
				fieldSchema.options.required = false
			}

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
				fieldSchema.options.limit = fldObj.maxFileCount * 1 || 3
				fieldSchema.options.fileMaxSize = fldObj.fileMaxSize * 1 || 5
				fieldSchema.options.uploadTip = fldObj.uploadHint || ''
				if (fldObj.uploadFileTypes) {
					fieldSchema.options.fileTypes = fldObj.uploadFileTypes.split(',')
				}

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
				fieldSchema.options.minLength = !fldObj.minLength
					? fieldSchema.options.minLength
					: fldObj.minLength * 1;
				fieldSchema.options.maxLength = !fldObj.maxLength
					? fieldSchema.options.maxLength
					: fldObj.maxLength * 1;

				if (fldObj.type === "TextArea") {
					fieldSchema.options.rows = !fldObj.rows
						? fieldSchema.options.rows
						: fldObj.rows * 1;
				}
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

				// 因为初始默认值为0，如果最小值大于0，则默认值等于最小值
				if (fieldSchema.options.min > 0) {
					fieldSchema.options.defaultValue = fieldSchema.options.min
				}
				if (fieldSchema.options.max < 0) {
					fieldSchema.options.defaultValue = fieldSchema.options.max
				}
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

				fieldSchema.refUserFlag = !!fldObj.refUserFlag
				fieldSchema.refDepartmentFlag = !!fldObj.refDepartmentFlag
            }

			/* 处理单选项字段 */
            if (fieldSchema.options.hasOwnProperty("optionItems")) {
				let optionDataKeyName = fieldSchema.options.name
				if (fieldSchema.subFormName) {
					optionDataKeyName = fieldSchema.subFormName + '.' + fieldSchema.options.name
				}
				if (this.formOptionData.hasOwnProperty(optionDataKeyName)) {
					fieldSchema.options.optionItems = deepClone(
						this.formOptionData[optionDataKeyName]
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

        handleFWU(fwName, subFormName) {
			if (!subFormName) {
				this.usedFieldNames[fwName] = 1;
			} else {
				this.usedFieldNames[subFormName + '.' + fwName] = 1;
			}

            /* 必须延时处理，否则draggable会报错 */
            setTimeout(() => {
                const metaFields = this.buildMetaFields(this.metaFieldsResult);
                this.$refs.vfDesigner.setMetaFields(metaFields);
            }, 800);
        },

        handleFWR(fwName, subFormName) {
			if (!subFormName) {
				delete this.usedFieldNames[fwName];
			} else {
				delete this.usedFieldNames[subFormName + '.' + fwName];
			}

            /* 必须延时处理，否则draggable会报错 */
            setTimeout(() => {
                const metaFields = this.buildMetaFields(this.metaFieldsResult);
                this.$refs.vfDesigner.setMetaFields(metaFields);
            }, 800);
        },

        handleFJU() {
            this.handleUsedFields();
            setTimeout(() => {
                const metaFields = this.buildMetaFields(this.metaFieldsResult);
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
				if (!fwItem.field.subFormName) {
					this.usedFieldNames[fwItem.name] = 1;
				} else {
					this.usedFieldNames[fwItem.field.subFormName + '.' + fwItem.name] = 1;
				}
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
        selectedFormLayout(idx) {
            this.setDesign(this.formLayoutDialogConf.list[idx]);
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
            if (data.optionData || data.codeOptionData) {
                this.formOptionData = data.optionData;
                if(data.codeOptionData) {
                    this.formOptionData = Object.assign(this.formOptionData, data.codeOptionData);
                }
                if(data.cascaderOptionData) {
                    this.formOptionData = Object.assign(this.formOptionData, data.cascaderOptionData);
                }
                this.$refs.vfDesigner.setTestOptionData(this.formOptionData);
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
            let formJson = this.$refs.vfDesigner.getFormJson()
            let res = await saveFormLayout(
                this.entity,
                null,
                layoutName,
                shareTo,
                formJson,
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
            let { shareTo } =
                this.saveAsDialogConf.formLayout;
            let formJson = this.$refs.vfDesigner.getFormJson();
            // console.log(formJson,'111');
            formJson.formConfig.actionRules = this.$refs.actionRulesSetting.getActionRules()
            this.loadActionLoading(false, true);
            let res = await saveFormLayout(
                this.entity,
                this.layoutId,
                null,
                shareTo,
                formJson
            );

            if (res && res.code == 200) {
                this.$message.success("保存成功");
            }
            this.loadActionLoading(false, false);

        },
        // 编辑表名
        async updateNameFormLayout(layoutName, shareTo) {
            this.loadActionLoading(layoutName, true);
            let res = await saveFormLayout(
                this.entity,
                this.layoutId,
                layoutName,
            );

            if (res && res.code == 200) {
                this.$message.success("保存成功");
                this.loadDesign();
                this.saveAsDialogConf.isShow = false;
            }
            this.loadActionLoading(layoutName, false);
        },
        // 复制表单ID
        copyFormLayoutId(item) {
            copyText(item.formLayoutId);
        },
        // 加载操作loading
        loadActionLoading(layoutName, status) {
            if (layoutName) {
                this.saveAsDialogConf.loading = status;
            } else {
                this.pageLoading = status;
            }
        },


        onFieldSaved() {
            setTimeout(() => {
                this.loadFieldListData(); //重新加载元数据字段
            }, 300);
        },

    },
};
</script>

<style lang="scss" scoped>
:deep(.toolbar-header .toolbar-container) {
    width: 100%;
}

:deep(.setting-panel-container .el-tabs__item) {
    padding: 0 10px !important;
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
    .form-layout-item-name {
        &:hover {
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

.form-design-box-div {
    min-width: 1400px;
    height: 100%;
    overflow: auto;
}
</style>
