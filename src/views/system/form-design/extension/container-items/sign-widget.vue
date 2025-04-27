<template>
	<form-item-wrapper
		:designer="designer"
		:field="field"
		:rules="rules"
		:design-state="designState"
		:parent-widget="parentWidget"
		:parent-list="parentList"
		:index-of-parent-list="indexOfParentList"
		:sub-form-row-index="subFormRowIndex"
		:sub-form-col-index="subFormColIndex"
		:sub-form-row-id="subFormRowId"
	>
		<el-input
			ref="fieldEditor"
			v-model="fieldModel"
			v-show="!isReadMode"
			:disabled="field.options.disabled"
			:readonly="field.options.readonly"
			:size="field.options.size"
			class="hide-spin-button"
			:type="inputType"
			:show-password="field.options.showPassword"
			:placeholder="field.options.placeholder"
			:clearable="field.options.clearable"
			:minlength="field.options.minLength"
			:maxlength="field.options.maxLength"
			:show-word-limit="field.options.showWordLimit"
			:prefix-icon="field.options.prefixIcon"
			:suffix-icon="field.options.suffixIcon"
			@focus="handleFocusCustomEvent"
			@blur="handleBlurCustomEvent"
			@input="handleInputCustomEvent"
			@change="onFieldChangeEvent"
		>
			<template
				#append
				v-if="field.options.appendButton || field.options.appendText"
			>
				<el-button
					v-if="
						field.options.appendButton || field.options.appendText
					"
					:disabled="
						field.options.disabled ||
						field.options.appendButtonDisabled
					"
					@click="emitAppendButtonClick"
				>
					<el-icon
						v-if="
							field.options.appendButton &&
							!!field.options.buttonIcon
						"
						><component :is="field.options.buttonIcon"
					/></el-icon>
					<template v-if="field.options.appendText">
						{{ field.options.textForAppend }}
					</template>
				</el-button>
			</template>
		</el-input>
		<template v-if="isReadMode">
			<template v-if="field.options.type === 'password'">
				<span class="readonly-mode-field">********</span>
			</template>
			<template v-else>
				<span
					class="readonly-mode-field no-wrap"
					:title="contentForReadMode"
					>{{ contentForReadMode }}</span
				>
			</template>
		</template>
	</form-item-wrapper>
</template>

<script>
import VisualDesign from "@/../lib/visual-design/designer.umd.js";
const { FormItemWrapper, emitter, i18n, fieldMixin, Utils } =
	VisualDesign.VFormSDK;


export default {
	name: "input-widget",
	componentName: "FieldWidget", //必须固定为FieldWidget，用于接收父级组件的broadcast事件
	mixins: [emitter, fieldMixin, i18n],
	props: {
		field: Object,
		parentWidget: Object,
		parentList: Array,
		indexOfParentList: Number,
		designer: Object,

		designState: {
			type: Boolean,
			default: false,
		},

		subFormRowIndex: {
			/* 子表单组件行索引，从0开始计数 */ type: Number,
			default: -1,
		},
		subFormColIndex: {
			/* 子表单组件列索引，从0开始计数 */ type: Number,
			default: -1,
		},
		subFormRowId: {
			/* 子表单组件行Id，唯一id且不可变 */ type: String,
			default: "",
		},
	},
	components: {
		FormItemWrapper,
	},
	data() {
		return {
			oldFieldValue: null, //field组件change之前的值
			fieldModel: null,
			rules: [],
		};
	},
	computed: {
		inputType() {
			if (this.field.options.type === "number") {
				return "text"; //当input的type设置为number时，如果输入非数字字符，则v-model拿到的值为空字符串，无法实现输入校验！故屏蔽之！！
			}

			return this.field.options.type;
		},

		contentForReadMode() {
			return this.fieldModel ? this.fieldModel : "--";
		},
	},
	beforeCreate() {
		/* 这里不能访问方法和属性！！ */
	},

	created() {
		/* 注意：子组件mounted在父组件created之后、父组件mounted之前触发，故子组件mounted需要用到的prop
         需要在父组件created中初始化！！ */
		this.registerToRefList();
		this.initFieldModel();
		this.initEventHandler();
		this.buildFieldRules();

		this.handleOnCreated();
	},

	mounted() {
		this.handleOnMounted();
	},

	beforeUnmount() {
		this.unregisterFromRefList();
	},

	methods: {},
};
</script>

<style lang="scss" scoped>
//   @import "../../../../styles/global.scss"; /* form-item-wrapper已引入，还需要重复引入吗？ */

span.no-wrap {
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}
</style>
