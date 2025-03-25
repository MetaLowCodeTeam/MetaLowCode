<template>
	<!--  --> 
	<el-form-item label="移动端扫码录入" label-width="120px">
		<el-switch @change="onchange" v-model="optionModel.qrCodeOnMobileEnabled" />
	</el-form-item>
</template>

<script>
import VisualDesign from "@/../lib/visual-design/designer.umd.js";
const { i18n, eventMixin, Utils } = VisualDesign.VFormSDK;

export default {
	name: "qrCodeOnMobileEnabled-editor",
	mixins: [i18n, eventMixin, Utils],
	props: {
		designer: Object,
		selectedWidget: Object,
		optionModel: Object,
	},

	data() {
		return {};
	},
	methods: {
        onchange(){
            if(this.optionModel.qrCodeOnMobileEnabled){
                this.optionModel.onAppendButtonClick = "let gsv = this.getGlobalDsv()\nlet onQrCodeSuccess = (res) => {\n  // res返回一个对象：\n  // decodedText 二维码结果文本（通常用这个）\n  // decodedResult 二维码对象\n  this.setValue(res.decodedText)\n}\nlet onQrCodeError = (err) => {\n  // 扫码失败\n}\n// openQrCode 接收1个成功回调和失败回调，失败回调可传可不传\ngsv.openQrCode(onQrCodeSuccess,onQrCodeError)"
                this.optionModel.onCreated = "if (this.$isMobile) {\n  this.field.options.appendButton = true;\n  this.field.options.buttonIcon = \"CameraFilled\";\n}\n\n";
            }else{
                this.optionModel.onAppendButtonClick = "";
                this.optionModel.onCreated = "";
            }
        }
    },
};
</script>
<style lang="scss" scoped>
.form-label {
	line-height: 32px;
	font-size: 14px;
}
</style>
