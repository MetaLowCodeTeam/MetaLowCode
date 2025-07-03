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
		<el-cascader
            v-model="fieldModel"
            :options="options"
            :props="{ multiple: field.options.cascaderConfig?.multiple }"
            :show-all-levels="!field.options.cascaderConfig?.showAllLevels"
            clearable
            :placeholder="field.options.cascaderConfig?.placeholder"
            :disabled="field.options.disabled"
            :style="{ width: formatPx(field.options.cascaderConfig?.compWidth) }"
        />
	</form-item-wrapper>
</template>

<script>
import VisualDesign from "@/../lib/visual-design/designer.umd.js";
const { FormItemWrapper, emitter, i18n, fieldMixin, Utils } =
	VisualDesign.VFormSDK;
export default {
	name: "cascader-option-widget",
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
            options: [
                {
                    value: "1",
                    label: "测试一级",
                    children: [
                        {
                            value: "1-1",
                            label: "测试二级",
                            children: [
                                {
                                    value: "1-1-1",
                                    label: "测试三级1",
                                },
                                {
                                    value: "1-1-2",
                                    label: "测试三级2",
                                }
                            ]
                        },
                        {
                            value: "1-2",
                            label: "测试二级2",
                            children: [
                                {
                                    value: "1-2-1",
                                    label: "测试三级3",
                                }
                            ]
                        }
                    ]
                },
            ],
            rules: [],
		};
	},
	computed: {
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

	methods: {
        // 格式化PX
		formatPx(value) {
            if (!value) {
                return "100%";
            }
			let newValue = value.replace("px", "");
			if (newValue.endsWith("%")) {
				return newValue;
			}
			return newValue + "px";
		},
	},
};
</script>

<style lang="scss" scoped>

</style>
