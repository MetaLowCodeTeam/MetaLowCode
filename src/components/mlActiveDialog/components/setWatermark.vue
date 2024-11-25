<template>
	<!-- 水印设置 -->
	<ml-dialog v-model="show" title="水印设置" width="400">
		<el-form label-width="70">
			<el-form-item label="是否开启">
				<el-checkbox v-model="watermarkConf.open" />
			</el-form-item>
			<el-form-item label="水印文字">
				<el-input
					v-model="watermarkConf.value"
					clearable
					placeholder="请填写水印文字"
					:class="{ 'is-error': valueError }"
					@focus="valueError = false"
				/>
			</el-form-item>
			<el-form-item label="字体颜色">
				<el-color-picker
					v-model="watermarkConf.fontColor"
					@change="changeColor"
                    color-format="rgb"
				/>
			</el-form-item>
			<el-form-item label="不透明度">
				<el-slider
                    :min="0"
                    :max="100"
					v-model="watermarkConf.opacity"
					:format-tooltip="formatTooltip"
				/>
			</el-form-item>
			<el-form-item label="多行水印">
				<el-radio-group v-model="watermarkConf.rosType">
					<el-radio :value="1">单行</el-radio>
					<el-radio :value="2">多行</el-radio>
				</el-radio-group>
			</el-form-item>
			<el-form-item
				label="旋转水印"
				style="margin-bottom: 5px !important"
			>
				<el-radio-group v-model="watermarkConf.rotationAngle">
					<el-radio :value="0">水平</el-radio>
					<el-radio :value="35">倾斜</el-radio>
				</el-radio-group>
			</el-form-item>
			<el-form-item style="margin-bottom: 0 !important">
				<div class="info-text">该水印仅PDF格式文档生效</div>
			</el-form-item>
		</el-form>
		<template #footer>
			<el-button @click="show = false">取 消</el-button>
			<el-button type="primary" @click="confirm">确 定</el-button>
		</template>
	</ml-dialog>
</template>

<script setup>
import { ElMessage } from "element-plus";
import { reactive, ref } from "vue";

const emits = defineEmits(["confirm"]);

let show = ref(false);
let valueError = ref(false);

const defaultWatermarkConf = reactive({
	// 是否开启
	open: false,
	// 水印文字
	value: "",
	// 字体颜色
	fontColor: "rgb(128,128,128)",
	// 透明度
	opacity: 30,
	// 多行水印
	rosType: 1,
	// 旋转水印
	rotationAngle: 35,
});

let watermarkConf = ref();

const openDialog = (pdfWatermark) => {
	watermarkConf.value = Object.assign(JSON.parse(JSON.stringify(defaultWatermarkConf)), pdfWatermark);
	valueError.value = false;
	show.value = true;
};

// 取色器切换
const changeColor = () => {
	if (!watermarkConf.value.fontColor) {
		watermarkConf.value.fontColor = "rgb(128,128,128)";
	}
};

const confirm = () => {
	if (!watermarkConf.value.value) {
		ElMessage.error("请填写水印文字");
		valueError.value = true;
		return;
	}
    console.log(watermarkConf.value,'watermarkConf.value')
	emits("confirm", watermarkConf.value);
	show.value = false;
};

const formatTooltip = (val) => {
	return val / 100;
};

defineExpose({
	openDialog,
});
</script>
<style lang="scss" scoped>
.watermark-preview {
	height: 300px;
	box-sizing: border-box;
	border: 1px solid var(--el-border-color-light);
}
.el-form-item {
	margin-bottom: 10px !important;
}
</style>
