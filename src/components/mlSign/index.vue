<template>
	<ml-dialog v-model="signConf.show" :title="title" width="845" appendToBody>
        <div class="sign-tool-bar">
            <el-form label-width="90px" inline :disabled="!!signConf.resultImg">
                <el-form-item label="画布背景色">
                    <el-color-picker v-model="signConf.bgColor" />
                </el-form-item>
                <el-form-item label="画笔粗细">
                    <el-input-number v-model="signConf.lineWidth" :min="1" :max="10" />
                </el-form-item>
                <el-form-item label="画笔颜色">
                    <el-color-picker v-model="signConf.lineColor" />
                </el-form-item>
                <el-form-item label="是否裁剪">
                    <el-tooltip content="在画布原有尺寸基础上裁掉四周空白部分">
                        <el-switch v-model="signConf.isCrop" />
                    </el-tooltip>
                </el-form-item>
            </el-form>
        </div>
		<div v-if="signConf.resultImg" class="has-sign-box">
			<img :src="signConf.resultImg" alt="" />
		</div>
		<vue-esign
			v-else
			ref="signRef"
			class="esignature"
			:width="800"
			:height="300"
			:isCrop="signConf.isCrop"
			:lineWidth="signConf.lineWidth"
			:lineColor="signConf.lineColor"
			v-model:bgColor="signConf.bgColor"
		/>
		<template #footer>
			<template v-if="signConf.resultImg">
				<el-button @click="clearSign">清空签名</el-button>
				<el-button type="primary" disabled>已签名</el-button>
			</template>
			<template v-else>
				<el-button @click="handleReset">重签</el-button>
				<el-button type="primary" @click="handleGenerate">
					确认
				</el-button>
			</template>
		</template>
	</ml-dialog>
</template>

<script setup>
import vueEsign from "vue-esign";
import { ref, watchEffect } from "vue";
import { ElMessage } from "element-plus";
const props = defineProps({
	// 绑定值
	modelValue: {
		type: String,
		default: "",
	},
	// 标题
	title: {
		type: String,
		default: "手写签名",
	},
	// 是否必填
	required: {
		type: Boolean,
		default: false,
	},
	// 必填提示
	requiredTip: {
		type: String,
		default: "请先签名",
	},
});

const emit = defineEmits(["onGenerate"]);

const signRef = ref(null);
const signConf = ref({
	show: false,
	resultImg: "",
	isCrop: false,
	lineWidth: 2,
	lineColor: "#000",
	bgColor: "",
});

watchEffect(() => {
	signConf.value.resultImg = props.modelValue;
});

// 重签
const handleReset = () => {
	signRef.value.reset();
};

// 确认
const handleGenerate = () => {
	signRef.value
		.generate()
		.then((res) => {
			emit("onGenerate", res);
			signConf.value.show = false;
		})
		.catch((err) => {
			if (err == "Warning: Not Signned!") {
				if (props.required) {
					ElMessage.error(props.requiredTip);
					return;
				}
				emit("onGenerate", null);
				signConf.value.show = false;
			} else {
				console.log(err);
				this.$message.error(err);
			}
		});
};



// 清空签名
const clearSign = () => {
	signConf.value.resultImg = "";
};

const openSign = () => {
	signConf.value.show = true;
    signConf.value.resultImg = props.modelValue;
};

defineExpose({
	openSign,
});
</script>

<style scoped lang="scss">
:deep(.el-form) {
    .el-form-item {
        margin-bottom: 0;
    }
}
.esignature {
	border: 1px solid #dcdfe6;
    box-sizing: border-box;
    border-radius: 4px;
}
.has-sign-box {
	width: 800px;
	height: 300px;
	border: 1px solid #dcdfe6;
	box-sizing: border-box;
    border-radius: 4px;
	img {
		display: block;
        border-radius: 4px;
		width: 100%;
		height: 100%;
	}
}
.sign-tool-bar {
    margin-bottom: 10px;
}
</style>
