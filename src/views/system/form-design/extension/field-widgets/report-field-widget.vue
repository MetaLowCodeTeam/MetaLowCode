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
			<template v-if="designer">
				{{ field.options.label }}
			</template>
			<template v-else-if="isImageDisplay">
				<img
					:src="imageSrc"
					:style="imageStyle"
					alt=""
				>
			</template>
			<div
				v-else-if="isHtmlDisplay"
				class="vf-report-field__html"
				v-html="sanitizedHtml"
			></div>
			<template v-else>
				{{ displayValue }}
			</template>
		</div>
	</static-content-wrapper>
</template>

<script>
import VisualDesign from "@/../lib/visual-design/designer.umd.js";

const { StaticContentWrapper, emitter, i18n } = VisualDesign.VFormSDK;

const ALLOWED_HTML_TAGS = new Set([
	"A", "B", "BLOCKQUOTE", "BR", "CODE", "DIV", "EM", "HR", "I", "LI",
	"OL", "P", "PRE", "S", "SPAN", "STRONG", "SUB", "SUP", "TABLE",
	"TBODY", "TD", "TFOOT", "TH", "THEAD", "TR", "U", "UL",
]);
const BLOCKED_HTML_TAGS = new Set([
	"BUTTON", "EMBED", "FORM", "IFRAME", "INPUT", "LINK", "MATH", "META",
	"OBJECT", "SCRIPT", "STYLE", "SVG", "TEXTAREA",
]);
const ALLOWED_STYLE_PROPERTIES = new Set([
	"background-color", "border", "border-collapse", "border-color", "border-style",
	"border-width", "color", "font-size", "font-style", "font-weight", "height",
	"line-height", "margin", "margin-bottom", "margin-left", "margin-right",
	"margin-top", "padding", "padding-bottom", "padding-left", "padding-right",
	"padding-top", "text-align", "text-decoration", "vertical-align", "white-space",
	"width",
]);

const escapeHtml = (value) => String(value)
	.replace(/&/g, "&amp;")
	.replace(/</g, "&lt;")
	.replace(/>/g, "&gt;")
	.replace(/"/g, "&quot;")
	.replace(/'/g, "&#039;");

const sanitizeStyle = (styleText = "") => styleText.split(";").map((item) => {
	const separatorIndex = item.indexOf(":");
	if (separatorIndex < 1) return "";
	const property = item.slice(0, separatorIndex).trim().toLowerCase();
	const value = item.slice(separatorIndex + 1).trim();
	if (!ALLOWED_STYLE_PROPERTIES.has(property) || !value) return "";
	if (/(?:expression|javascript:|url\s*\(|@import|behavior|-moz-binding)/i.test(value)) return "";
	return `${property}: ${value}`;
}).filter(Boolean).join("; ");

const isSafeUrl = (url = "") => {
	const value = url.trim();
	if (!value) return false;
	if (value.startsWith("#") || value.startsWith("/") || value.startsWith("./") || value.startsWith("../")) {
		return true;
	}
	return /^(?:https?:|mailto:|tel:)/i.test(value);
};

const sanitizeHtml = (html) => {
	if (typeof DOMParser === "undefined") {
		return escapeHtml(html);
	}
	const documentNode = new DOMParser().parseFromString(`<div>${String(html)}</div>`, "text/html");
	const root = documentNode.body.firstElementChild;
	if (!root) return "";

	const sanitizeNode = (node) => {
		Array.from(node.childNodes).forEach((child) => {
			if (child.nodeType === 8) {
				child.remove();
				return;
			}
			if (child.nodeType !== 1) return;
			const tagName = child.tagName.toUpperCase();
			if (BLOCKED_HTML_TAGS.has(tagName)) {
				child.remove();
				return;
			}
			sanitizeNode(child);
			if (!ALLOWED_HTML_TAGS.has(tagName)) {
				child.replaceWith(...Array.from(child.childNodes));
				return;
			}

			Array.from(child.attributes).forEach((attribute) => {
				const attributeName = attribute.name.toLowerCase();
				const keepAttribute = attributeName === "title"
					|| attributeName === "style"
					|| (tagName === "A" && ["href", "target", "rel"].includes(attributeName))
					|| (["TD", "TH"].includes(tagName) && ["colspan", "rowspan"].includes(attributeName));
				if (!keepAttribute) {
					child.removeAttribute(attribute.name);
				}
			});

			if (child.hasAttribute("style")) {
				const safeStyle = sanitizeStyle(child.getAttribute("style"));
				if (safeStyle) {
					child.setAttribute("style", safeStyle);
				} else {
					child.removeAttribute("style");
				}
			}
			if (tagName === "A") {
				const href = child.getAttribute("href") || "";
				if (!isSafeUrl(href)) {
					child.removeAttribute("href");
				}
				if (child.getAttribute("target") === "_blank") {
					child.setAttribute("rel", "noopener noreferrer");
				} else {
					child.removeAttribute("target");
					child.removeAttribute("rel");
				}
			}
		});
	};

	sanitizeNode(root);
	return root.innerHTML;
};

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
			oldFieldValue: null,
			_sourceFormData: null,
			_formDataReadyFired: false,
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
				return this.field.options.emptyDisplayText ?? "";
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
		isImageDisplay() {
			return !!this.field?.options?.imageDisplayEnabled && !!this.imageSrc;
		},
		isHtmlDisplay() {
			return !!this.field?.options?.htmlDisplayEnabled && !!this.displayValue;
		},
		sanitizedHtml() {
			return sanitizeHtml(this.displayValue);
		},
		imageSrc() {
			const value = this.fieldModel;
			if (value === null || value === undefined || value === "") {
				return "";
			}
			if (typeof value === "string") {
				return value;
			}
			return String(value);
		},
		imageStyle() {
			return {
				width: this.field?.options?.imageWidth || "80px",
				height: this.field?.options?.imageHeight || "100px",
				display: "inline-block",
				verticalAlign: "top",
				objectFit: "contain",
			};
		},
	},
	methods: {
		initReportFieldModel() {
			if (this.designer || this.designState) {
				return;
			}
			this.fieldModel = this.resolveReportFieldValue(this.reportFormData);
		},
		setValue(newValue, disableChangeEvent = false) {
			const nextValue = this.normalizeReportFieldValue(newValue);
			const oldValue = this.fieldModel;
			this.fieldModel = nextValue;
			if (!disableChangeEvent && this.shouldTriggerChange(nextValue, oldValue)) {
				this.handleOnChange(nextValue, oldValue);
			}
			this.oldFieldValue = this.cloneValue(nextValue);
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
				this._sourceFormData = newFormData;
				const disableChangeEvent = params[1];
				this.setValue(this.resolveReportFieldValue(newFormData), disableChangeEvent);
				this.handleOnFormDataReady(newFormData);
			};
			this.on$("setFormData", this.eventFunctionMapping["setFormData"]);
		},
		cloneValue(value) {
			if (value === undefined) {
				return undefined;
			}
			if (value === null || typeof value !== "object") {
				return value;
			}
			try {
				return JSON.parse(JSON.stringify(value));
			} catch (e) {
				return value;
			}
		},
		isSameValue(value1, value2) {
			if (value1 === value2) {
				return true;
			}
			if ((value1 === null || value1 === undefined) && (value2 === null || value2 === undefined)) {
				return true;
			}
			if (typeof value1 !== "object" || typeof value2 !== "object" || !value1 || !value2) {
				return false;
			}
			try {
				return JSON.stringify(value1) === JSON.stringify(value2);
			} catch (e) {
				return false;
			}
		},
		shouldTriggerChange(newValue, oldValue) {
			if (this.designer || this.designState) {
				return false;
			}
			return !this.isSameValue(newValue, oldValue);
		},
		handleOnCreated() {
			if (this.designState || this.designer) {
				return;
			}
			if (this.field.options?.onCreated) {
				const customFunc = new Function(this.field.options.onCreated);
				customFunc.call(this);
			}
		},
		handleOnMounted() {
			if (this.designState || this.designer) {
				return;
			}
			if (this.field.options?.onMounted) {
				const mountFunc = new Function(this.field.options.onMounted);
				mountFunc.call(this);
			}
		},
		handleOnChange(val, oldVal) {
			if (this.designState || this.designer) {
				return;
			}
			if (this.field.options?.onChange) {
				const changeFunc = new Function("value", "oldValue", this.field.options.onChange);
				changeFunc.call(this, val, oldVal);
			}
		},
		handleOnFormDataReady(formData) {
			if (this.designState || this.designer || this._formDataReadyFired) {
				return;
			}
			this._formDataReadyFired = true;
			if (this.field.options?.onFormDataReady) {
				const scopeData = this.loopRowData || (this.fieldKeyName ? { [this.fieldKeyName]: this.fieldModel } : formData);
				const fn = new Function("formData", "key", "value", this.field.options.onFormDataReady);
				fn.call(this, scopeData, this.fieldKeyName, this.fieldModel);
			}
		},
		tryFireFormDataReady() {
			const data = this.loopRowData || this._sourceFormData || this.reportFormData;
			if (data && typeof data === 'object' && Object.keys(data).length > 0) {
				this.handleOnFormDataReady(data);
			}
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
			const scopedModelData = modelAssociationId
				? this.findModelData(this.loopRowData, modelAssociationId)
				: null;
			const modelData = scopedModelData ?? (modelAssociationId ? formModel?.[modelAssociationId] : null);
			if (scopedModelData && typeof scopedModelData === "object") {
				const scopedValue = this.resolveValueFromModelData(scopedModelData, modelAssociationId);
				if (scopedValue !== undefined && scopedValue !== null && scopedValue !== "") {
					return scopedValue;
				}
			}
			if (modelAssociationId && Array.isArray(modelData)) {
				const arrayValue = this.resolveValueFromModelData(modelData, modelAssociationId);
				if (arrayValue !== undefined && arrayValue !== null && arrayValue !== "") {
					return arrayValue;
				}
			}
			if (modelAssociationId && modelData && typeof modelData === "object") {
				const objectValue = this.resolveValueFromModelData(modelData, modelAssociationId);
				if (objectValue !== undefined && objectValue !== null && objectValue !== "") {
					return objectValue;
				}
			}
			const nestedRowValue = this.findFieldValue(this.loopRowData, this.fieldKeyName);
			if (nestedRowValue !== undefined && nestedRowValue !== null && nestedRowValue !== "") {
				return nestedRowValue;
			}
			return formModel?.[this.fieldKeyName] ?? null;
		},
		resolveValueFromModelData(modelData, modelAssociationId) {
			if (Array.isArray(modelData)) {
				if (modelData.length <= 0) {
					return undefined;
				}
				const rowIndex =
					this.subFormRowIndex > -1 && this.subFormRowIndex < modelData.length
						? this.subFormRowIndex
						: 0;
				return this.resolveValueFromModelData(modelData[rowIndex], modelAssociationId);
			}
			if (!modelData || typeof modelData !== "object") {
				return undefined;
			}
			const fieldName = this.getReportDataFieldName(modelAssociationId);
			const directValue = modelData?.[fieldName];
			if (directValue !== undefined && directValue !== null && directValue !== "") {
				return directValue;
			}
			return this.findFieldValue(modelData, fieldName);
		},
		findModelData(source, modelAssociationId, visited = new WeakSet()) {
			if (!source || !modelAssociationId) {
				return null;
			}
			if (Array.isArray(source)) {
				for (const item of source) {
					const found = this.findModelData(item, modelAssociationId, visited);
					if (found !== null && found !== undefined) {
						return found;
					}
				}
				return null;
			}
			if (typeof source !== "object") {
				return null;
			}
			if (visited.has(source)) {
				return null;
			}
			visited.add(source);
			if (source[modelAssociationId] !== undefined) {
				return source[modelAssociationId];
			}
			for (const value of Object.values(source)) {
				if (!value || typeof value !== "object") {
					continue;
				}
				const found = this.findModelData(value, modelAssociationId, visited);
				if (found !== null && found !== undefined) {
					return found;
				}
			}
			return null;
		},
		findFieldValue(source, fieldName, visited = new WeakSet()) {
			if (!source || !fieldName) {
				return undefined;
			}
			if (Array.isArray(source)) {
				for (const item of source) {
					const found = this.findFieldValue(item, fieldName, visited);
					if (found !== undefined && found !== null && found !== "") {
						return found;
					}
				}
				return undefined;
			}
			if (typeof source !== "object") {
				return undefined;
			}
			if (visited.has(source)) {
				return undefined;
			}
			visited.add(source);
			if (source[fieldName] !== undefined && source[fieldName] !== null && source[fieldName] !== "") {
				return source[fieldName];
			}
			for (const value of Object.values(source)) {
				if (!value || typeof value !== "object") {
					continue;
				}
				const found = this.findFieldValue(value, fieldName, visited);
				if (found !== undefined && found !== null && found !== "") {
					return found;
				}
			}
			return undefined;
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
		registerToRefList(oldRefName) {
			if (!this.refList || !this.field?.options?.name) {
				return;
			}
			if (oldRefName) {
				const oldKey = this.subFormRowId ? oldRefName + "@row" + this.subFormRowId : oldRefName;
				delete this.refList[oldKey];
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
		/**
		 * 获取当前报告字段绑定的原始源数据（即 setFormData 传入的完整数据对象）
		 */
		getReportFormData() {
			return this._sourceFormData || this.reportFormData;
		},
		/**
		 * 直接覆盖当前字段的显示值，不做归一化回退。
		 * @param {*} value 要设置的值
		 * @param {boolean} disableChangeEvent 是否禁止触发 onChange 事件
		 */
		setFieldValue(value, disableChangeEvent = false) {
			const oldValue = this.fieldModel;
			this.fieldModel = value;
			if (!disableChangeEvent && this.shouldTriggerChange(value, oldValue)) {
				this.handleOnChange(value, oldValue);
			}
			this.oldFieldValue = this.cloneValue(value);
		},
	},
	created() {
		this.registerToRefList();
		this.initReportFieldModel();
		this.initEventHandler();
		this.oldFieldValue = this.cloneValue(this.fieldModel);
		this.handleOnCreated();
	},
	mounted() {
		this.$nextTick(() => {
			this.reloadReportFieldValue();
			this.handleOnMounted();
			if (this.loopRowData) {
				this.tryFireFormDataReady();
			}
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

.vf-report-field__html {
	max-width: 100%;
	overflow-wrap: anywhere;
}

.vf-report-field__html :deep(table) {
	max-width: 100%;
	border-collapse: collapse;
}

.vf-report-field__html :deep(img) {
	max-width: 100%;
}
</style>
