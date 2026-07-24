<template>
	<static-content-wrapper
		:designer="designer"
		:field="field"
		:design-state="designState"
		:parent-widget="parentWidget"
		:parent-list="parentList"
		:index-of-parent-list="indexOfParentList"
		:sub-form-row-index="subFormRowIndex"
		:sub-form-col-index="subFormColIndex"
		:sub-form-row-id="subFormRowId"
	>
		<div
			class="vf-report-field"
			:style="{
				'text-align': field.options.textAlign || 'left',
				'font-size': field.options.fontSize || '14px',
				'font-style': field.options.fontStyle || 'normal',
				'font-weight': field.options.fontWeight || 'normal',
			}"
		>
			{{ designer ? field.options.label : displayValue }}
		</div>
	</static-content-wrapper>
</template>

<script>
import VisualDesign from "@/../lib/visual-design/designer.umd.js";

const { StaticContentWrapper, emitter, i18n } = VisualDesign.VFormSDK;

export default {
	name: "report-field-widget",
	componentName: "FieldWidget",
	mixins: [emitter, i18n],
	components: {
		StaticContentWrapper,
	},
	props: {
		field: Object,
		parentWidget: Object,
		parentList: Array,
		indexOfParentList: Number,
		designer: Object,
		designState: { type: Boolean, default: false },
		subFormRowIndex: { type: Number, default: -1 },
		subFormColIndex: { type: Number, default: -1 },
		subFormRowId: { type: String, default: "" },
		loopRowData: { type: Object, default: null },
	},
	data() {
		return {
			fieldModel: null,
			eventFunctionMapping: {},
		};
	},
	inject: ["refList", "globalModel", "getGlobalDsv"],
	computed: {
		formModel() {
			return this.globalModel?.formModel || {};
		},
		reportFormData() {
			return this.getGlobalDsv?.()?.__reportFormData || this.formModel;
		},
		fieldKeyName() {
			const optionKeyName = this.field.options.keyName;
			if (this.field.options.keyNameEnabled && optionKeyName) {
				return optionKeyName.includes(".") ? optionKeyName.slice(optionKeyName.lastIndexOf(".") + 1) : optionKeyName;
			}
			const bindingPath = this.field.options.bindingPath || this.field.name || "";
			if (bindingPath.includes(".")) {
				return bindingPath.slice(bindingPath.lastIndexOf(".") + 1);
			}
			const fieldKeyName = this.field.options.name;
			return this.field.options.keyNameEnabled ? (optionKeyName || fieldKeyName) : fieldKeyName;
		},
		displayValue() {
			const value = this.fieldModel;
			if (value === null || value === undefined || value === "") {
				return "";
			}
			if (Array.isArray(value)) {
				return value.map((item) => {
					if (item && typeof item === "object") {
						return item.name ?? item.label ?? item.value ?? "";
					}
					return item;
				}).join(", ");
			}
			if (typeof value === "object") {
				return value.name ?? value.label ?? value.value ?? "";
			}
			return String(value);
		},
	},
	methods: {
		initReportFieldModel() {
			if (this.designer || this.designState) {
				return;
			}
			this.fieldModel = this.resolveReportFieldValue(this.reportFormData);
		},
		setValue(newValue) {
			const nextValue = this.normalizeReportFieldValue(newValue);
			this.fieldModel = nextValue;
		},
		getValue() {
			return this.fieldModel;
		},
		reloadReportFieldValue(formData) {
			this.setValue(this.resolveReportFieldValue(formData || this.reportFormData), true);
		},
		initEventHandler() {
			if (this.designState) {
				return;
			}
			this.eventFunctionMapping["setFormData"] = (params) => {
				const newFormData = params[0] || {};
				const disableChangeEvent = params[1];
				this.setValue(this.resolveReportFieldValue(newFormData), disableChangeEvent);
			};
			this.on$("setFormData", this.eventFunctionMapping["setFormData"]);
		},
		normalizeReportFieldValue(value) {
			if (value !== null && value !== undefined && value !== "") {
				return value;
			}
			return this.resolveReportFieldValue(this.reportFormData);
		},
		resolveReportFieldValue(formModel) {
			const modelAssociationId = this.field.options?.modelAssociationId;
			const rowDirectValue = this.loopRowData?.[this.fieldKeyName];
			if (rowDirectValue !== undefined && rowDirectValue !== null && rowDirectValue !== "") {
				return rowDirectValue;
			}
			const modelData = modelAssociationId ? formModel?.[modelAssociationId] : null;
			if (modelAssociationId && Array.isArray(modelData)) {
				const rowIndex = this.subFormRowIndex > -1 ? this.subFormRowIndex : 0;
				const rowData = modelData[rowIndex];
				const rowValue = rowData?.[this.fieldKeyName];
				if (rowValue !== undefined && rowValue !== null && rowValue !== "") {
					return rowValue;
				}
			}
			if (modelAssociationId && modelData && typeof modelData === "object") {
				const fieldName = this.getReportDataFieldName(modelAssociationId);
				const objectValue = modelData?.[fieldName];
				if (objectValue !== undefined && objectValue !== null && objectValue !== "") {
					return objectValue;
				}
			}
			return formModel?.[this.fieldKeyName] ?? null;
		},
		getReportDataFieldName(modelAssociationId) {
			const bindingPath = this.field.options?.bindingPath || "";
			if (bindingPath.startsWith(modelAssociationId + ".")) {
				return bindingPath.slice(modelAssociationId.length + 1);
			}
			const rawName = this.field.name || "";
			if (rawName.startsWith(modelAssociationId + ".")) {
				return rawName.slice(modelAssociationId.length + 1);
			}
			const optionName = this.field.options?.name || "";
			if (optionName.startsWith(modelAssociationId + ".")) {
				return optionName.slice(modelAssociationId.length + 1);
			}
			return rawName.includes(".") ? rawName.slice(rawName.lastIndexOf(".") + 1) : optionName;
		},
		registerToRefList() {
			if (!this.refList || !this.field?.options?.name) {
				return;
			}
			const refName = this.subFormRowId ? this.field.options.name + "@row" + this.subFormRowId : this.field.options.name;
			this.refList[refName] = this;
		},
		unregisterFromRefList() {
			if (!this.refList || !this.field?.options?.name) {
				return;
			}
			const refName = this.subFormRowId ? this.field.options.name + "@row" + this.subFormRowId : this.field.options.name;
			delete this.refList[refName];
		},
	},
	created() {
		this.registerToRefList();
		this.initReportFieldModel();
		this.initEventHandler();
	},
	mounted() {
		this.$nextTick(() => {
			this.reloadReportFieldValue();
		});
	},
	beforeUnmount() {
		this.off$("setFormData", this.eventFunctionMapping["setFormData"]);
		this.unregisterFromRefList();
	},
};
</script>

<style scoped lang="scss">
.vf-report-field {
	padding: 5px 0;
	color: #333;
}
</style>
