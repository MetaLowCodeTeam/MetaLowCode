<template>
	<el-form-item :label="i18nt('extension.setting.useTreeDataSelect')">
		<el-switch v-model="optionModel.useTreeDataSelect"></el-switch>
		<el-button
			class="ml-20"
			:disabled="!optionModel.useTreeDataSelect"
			@click="openDialog"
			>配置</el-button
		>
	</el-form-item>
	<ml-dialog
		title="配置树形数据的父子关系字段"
		v-model="dialogConf.isShow"
		width="400px"
	>
		<div
			v-loading="dialogConf.loading"
			:element-loading-text="i18nt('extension.setting.treeDataDialogLoading')"
		>
			<div>
				<el-select
					v-model="optionModel.treeCascadeFieldName"
					:placeholder="i18nt('extension.setting.treeDataDialogPlaceholder')"
                    class="w-100"
                    size="default"
                    clearable
				>
					<el-option
						v-for="item in options"
						:key="item.fieldName"
						:label="item.fieldLabel"
						:value="item.fieldName"
					/>
				</el-select>
			</div>
		</div>
		<template #footer>
			<el-button size="default" @click="onCancel">{{ i18nt('extension.setting.treeDataDialogCancel') }}</el-button>
			<el-button size="default" type="primary" @click="dialogConf.isShow = false">{{ i18nt('extension.setting.treeDataDialogConfirm') }}</el-button>
		</template>
	</ml-dialog>
</template>

<script>
import VisualDesign from "@/../lib/visual-design/designer.umd.js";
import { queryReferToEntityFields } from "@/api/crud";
const { i18n, Utils } = VisualDesign.VFormSDK;

export default {
	name: "reference-treeDataSelect-editor",
	componentName: "PropertyEditor",
	mixins: [i18n, Utils],
	props: {
		designer: Object,
		selectedWidget: Object,
		optionModel: Object,
	},
	data() {
		return {
			dialogConf: {
				isShow: false,
				loading: false,
				data: [],
			},
			options: [],
            // 记录初始值
            oldTreeCascadeFieldName: "",
		};
	},

	created() {
		//
	},
	mounted() {
		//
	},
    inject: ["isSubFormChildWidget"],
	methods: {
		async openDialog() {
            this.oldTreeCascadeFieldName = this.optionModel.treeCascadeFieldName;
            // 1. 取字段名称
            let fieldName = this.selectedWidget.options.name;
            if(!fieldName){
                this.$message.error("没有识别到字段名称");
                return
            }
            // 取主、子表实体名称
            let paramEntity = "";
			// 2. 用getAllContainerWidgets获取表达上的容器组件；
			let allContainerWidgets = Utils.getAllContainerWidgets(
				this.designer.widgetList
			);
            // 3. 遍历上述容器组件，找出子表单容器，type是sub-form或grid-sub-form；获取到子表单内部的字段组件；
			// 所有子表单字段组件
			let subFormWidgets = [];
			// 所有子表单字段名称
			let subFormFieldIds = [];
			// 多行子表单字段
			let gridSubFormIds = [];
            // 所有子表单组件
            this.allSubFormWidgets = [];
			allContainerWidgets.forEach((el) => {
				if (el.type == "sub-form" || el.type == "grid-sub-form") {
                    this.allSubFormWidgets.push(el);
					Utils.traverseFieldWidgetsOfContainer(
						el.container,
						(fw) => {
							let subFw = {
								name: fw.options.name,
								label: fw.options.label,
								targetSubForm: el.container.options.name,
								fieldType: fw.type,
								id: fw.id,
							};
							subFormWidgets.push(subFw);
							subFormFieldIds.push(fw.id);
							if (el.type == "grid-sub-form") {
								gridSubFormIds.push(fw.id);
							}
						}
					);
				}
			});
			// 取选中字段
			let selectedId = this.designer.selectedId;
			// 如果不是子表单 并且 多行子表单里没有这个选中的组件
			if (
				!this.isSubFormChildWidget() &&
				!gridSubFormIds.includes(selectedId)
			) {
				paramEntity = this.$route.query.entity;
			}
			// 如果是子表单
			else {
				subFormWidgets.forEach((el) => {
					if (el.id == selectedId) {
                        paramEntity = el.targetSubForm;
					}
				});
			}
            // 传入实体名称、字段名称，获取引用实体的字段
			this.dialogConf.isShow = true;
			this.dialogConf.loading = true;
			let res = await queryReferToEntityFields(paramEntity, fieldName, true, false, true);
            if(res) {
                // 拿到引用实体的实体名称
                let fieldReferTo;
                if(res.data.field.referTo && res.data.field.referTo[0]){
                    fieldReferTo = res.data.field.referTo[0]?.name;
                    this.optionModel.treeDataEntityName = fieldReferTo;
                }
                let fieldList = res.data.fieldList || [];
                // 如果是引用类型字段，且引用的是自己
                this.options = fieldList.filter(el=> el.fieldType == "Reference" && el.referenceName == fieldReferTo);
                // 如果有数据，且没有选中，默认选中第一条
                if(this.options.length > 0 && !this.optionModel.treeCascadeFieldName){
                    this.optionModel.treeCascadeFieldName = this.options[0].fieldName;
                }
            }
            
			this.dialogConf.loading = false;
		},
        onCancel() {
            this.optionModel.treeCascadeFieldName = this.oldTreeCascadeFieldName;
            this.dialogConf.isShow = false;
        },
	},
};
</script>

<style scoped lang="scss"></style>
