<template>
	<div>
		<el-form-item prop="name" :rules="nameRequiredRule">
			<template #label>
				<span>
					{{ i18nt("designer.setting.uniqueName") }}
					<el-tooltip effect="light" :content="i18nt('designer.setting.editNameHelp')">
						<el-icon><InfoFilled /></el-icon>
					</el-tooltip>
				</span>
			</template>
			<el-input v-model="optionModel.name" @change="updateWidgetNameAndRef" />
		</el-form-item>
		<el-form-item label="元数据">
			<el-input :model-value="displayValue" disabled />
		</el-form-item>
	</div>
</template>

<script>
import { InfoFilled } from "@element-plus/icons-vue";
import VisualDesign from "@/../lib/visual-design/designer.umd.js";

const { i18n, Utils } = VisualDesign.VFormSDK;
const { isEmptyStr } = Utils;

export default {
	name: "report-field-name-editor",
	mixins: [i18n],
	components: {
		InfoFilled,
	},
	props: {
		designer: Object,
		selectedWidget: Object,
		optionModel: Object,
	},
	inject: {
		getServerMetaFields: {
			default: null,
		},
	},
	data() {
		return {
			nameRequiredRule: [{ required: true, message: "name required" }],
		};
	},
	computed: {
		displayValue() {
			return this.optionModel.modelLabel || this.getModelLabelFromMetaFields() || this.optionModel.modelName || "";
		},
	},
	methods: {
		updateWidgetNameAndRef(newName) {
			const oldName = this.designer.selectedWidgetName;
			if (isEmptyStr(newName)) {
				this.selectedWidget.options.name = oldName;
				this.$message.info(this.i18nt("designer.hint.nameRequired"));
				return;
			}

			if (!this.designer.formWidget) {
				return;
			}

			const widgetId = this.designer.selectedId;
			const foundRef = this.designer.formWidget.getWidgetRefById(widgetId, newName);
			if (foundRef) {
				this.selectedWidget.options.name = oldName;
				this.$message.info(this.i18nt("designer.hint.duplicateName") + newName);
				return;
			}

			const widgetInDesign = this.designer.formWidget.getWidgetRefById(widgetId, oldName);
			if (widgetInDesign?.registerToRefList) {
				widgetInDesign.registerToRefList(oldName);
				this.designer.updateSelectedWidgetNameAndLabel(this.selectedWidget, newName, null);
			}
		},
		getModelLabelFromMetaFields() {
			const metaFields = this.getServerMetaFields ? this.getServerMetaFields() : null;
			const modelAssociationId = this.optionModel.modelAssociationId || this.selectedWidget?.dataCode || this.selectedWidget?.metaModelName;
			if (!metaFields || !modelAssociationId) {
				return "";
			}

			const groups = [metaFields.main, ...(Array.isArray(metaFields.detail) ? metaFields.detail : [])].filter(Boolean);
			const matchedGroup = groups.find((group) => {
				const groupCode = group.entityName || group.dataCode || group.modelName || group.name;
				return groupCode === modelAssociationId;
			});

			return matchedGroup?.entityLabel || matchedGroup?.label || matchedGroup?.modelLabel || "";
		},
	},
};
</script>
