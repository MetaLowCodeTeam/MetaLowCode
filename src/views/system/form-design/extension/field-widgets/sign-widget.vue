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
		<div
			class="sign-widget"
			:style="{
				width: formatPx(field.options.signConfig.signWidth),
				height: formatPx(field.options.signConfig.signHeight),
			}"
			v-if="!isReadMode"
		>
			<div class="sign-widget-img">
                <el-image
                    v-if="fieldModel"
                    :src="fieldModel"
                    :zoom-rate="1.2"
                    :max-scale="7"
                    :min-scale="0.2"
                    :preview-src-list="[fieldModel]"
                    preview-teleported
                />
			</div>
			<el-button
				class="sign-widget-btn"
				@click="openEsign"
				icon="EditPen"
				link
				v-if="!designState"
				:disabled="field.options.disabled"
			></el-button>
			<div class="disabled-box" v-if="field.options.disabled"></div>
		</div>
		<div
			:style="{
				width: formatPx(field.options.signConfig.signWidth),
				height: formatPx(field.options.signConfig.signHeight),
			}"
			v-else
            class="sign-widget-img"
		>
			<el-image
				:src="fieldModel"
				:zoom-rate="1.2"
				:max-scale="7"
				:min-scale="0.2"
				:preview-src-list="[fieldModel]"
			/>
		</div>
	</form-item-wrapper>
    <MlSign v-model="fieldModel" ref="mlSignRef" @onGenerate="handleGenerate" />
    <MlSignMobile v-model="fieldModel" ref="mlSignMobileRef" @onGenerate="handleGenerate" />
</template>

<script>
// 签名组件
import VisualDesign from "@/../lib/visual-design/designer.umd.js";
const { FormItemWrapper, emitter, i18n, fieldMixin, Utils } =
	VisualDesign.VFormSDK;
import MlSign from "@/components/mlSign/index.vue";
// 移动端签名
import MlSignMobile from "@/components/mlSign/mobile-index.vue";

export default {
	name: "sign-widget",
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
		MlSign,
		MlSignMobile,
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

	methods: {
		// 打开签名组件
		openEsign() {
            if (this.isMobileUA()) {
                this.$refs.mlSignMobileRef && this.$refs.mlSignMobileRef.openSign();
            } else {
                this.$refs.mlSignRef && this.$refs.mlSignRef.openSign();
            }
		},
		// UA 判断：是否为移动端
		isMobileUA() {
            if (typeof navigator === "undefined") return false;
            const ua = navigator.userAgent || navigator.vendor || window.opera;
            const isIpadOS13 = navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
            const isMobileMatch = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua);
            const isUaDataMobile = !!(navigator.userAgentData && navigator.userAgentData.mobile);
            return isMobileMatch || isIpadOS13 || isUaDataMobile;
		},
		// 确认签名
		handleGenerate(signImg) {
			this.setFieldModel(signImg);
		},
		// 设置fieldModel
		setFieldModel(model) {
			this.fieldModel = model;
			this.onFieldChangeEvent(model);
		},
		// 格式化PX
		formatPx(value) {
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

span.no-wrap {
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.sign-widget {
	width: 100%;
	height: 60px;
	// min-height: 60px;
	position: relative;
	border: 1px solid #dcdfe6;
	border-radius: 4px;
	&.readonly-mode-field {
		border: none;
	}
	.disabled-box {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		border-radius: 4px;
		background: #f5f7fa;
		// z-index: 11;
	}

	.sign-widget-btn {
		position: absolute;
		bottom: 2px;
		right: 2px;
		z-index: 10;
	}
}

.sign-widget-img {
	height: 100%;
	width: 100%;
	box-sizing: border-box;
	border-radius: 4px;
	position: relative;
    :deep(.el-image) {
        border-radius: 4px;
        width: 100%;
        height: 100%;
        img {
            border-radius: 4px;
            width: 100%;
            height: 100%;
        }
    }
	// img {
	// 	display: block;
    //     border-radius: 4px;
	// 	width: 100%;
	// 	height: 100%;
	// }
}


</style>
