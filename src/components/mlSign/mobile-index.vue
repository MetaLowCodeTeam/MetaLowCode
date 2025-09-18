<template>
    <Overlay :show="signConf.show" z-index="3000">
        <div class="esign-wrapper" @click.stop>
            <div class="sign-tool-bar">
                <el-form
                    label-width="85px"
                    inline
                    :disabled="!!signConf.resultImg"
                >
                    <el-row>
                        <el-col :span="12">
                            <el-form-item label="画布背景色">
                                <el-color-picker v-model="signConf.bgColor" show-alpha teleported  popper-class="sign-color-picker" :predefine="getElColorPickerPredefineColors()" />
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item label="画笔粗细">
                                <el-input-number
                                    v-model="signConf.lineWidth"
                                    :min="1"
                                    :max="10"
                                    controls-position="right"
                                    style="width: 100px"
                                />
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item label="画笔颜色">
                                <el-color-picker v-model="signConf.lineColor" show-alpha teleported  popper-class="sign-color-picker" :predefine="getElColorPickerPredefineColors()" />
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item label="是否裁剪">
                                <el-switch v-model="signConf.isCrop" />
                                <el-icon class="ml-10" @click="handleCrop">
                                    <InfoFilled />
                                </el-icon>
                            </el-form-item>
                        </el-col>
                    </el-row>
                </el-form>
            </div>
            <div class="esign-wrapper-content">
                <vue-esign
                    v-if="showEsignCom && !signConf.resultImg"
                    ref="signRef"
                    class="esignature"
                    :width="300"
                    :height="signHeight"
                    :isCrop="signConf.isCrop"
                    :lineWidth="signConf.lineWidth"
                    :lineColor="signConf.lineColor"
                    v-model:bgColor="signConf.bgColor"
                />
                <img
                    v-else
                    class="sign-result-img"
                    :src="signConf.resultImg"
                    alt=""
                    style="width: 100%"
                />
            </div>
            <div class="esign-wrapper-btn">
                <el-button @click="signConf.show = false"> 取消 </el-button>
                <template v-if="signConf.resultImg">
                    <el-button @click="clearSign" class="rotate90 reset-btn">
                        清空签名
                    </el-button>
                    <el-button
                        type="primary"
                        class="rotate90 confirm-btn"
                        disabled
                    >
                        已签名
                    </el-button>
                </template>
                <template v-else>
                    <el-button @click="handleReset" class="rotate90 reset-btn">
                        重签
                    </el-button>
                    <el-button
                        type="primary"
                        class="rotate90 confirm-btn"
                        @click="handleGenerate"
                    >
                        确认
                    </el-button>
                </template>
            </div>
        </div>
    </Overlay>
</template>
<script setup>
import vueEsign from "vue-esign";
import { Overlay, showDialog  } from "vant";
import { ref, watchEffect, nextTick } from "vue";
import { ElMessage } from "element-plus";
import { getElColorPickerPredefineColors } from "@/utils/util";
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
    bgColor: "#fff",
});
let signHeight = ref(400);
let showEsignCom = ref(false);

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
    nextTick(() => {
        signHeight.value = document.querySelector(
            ".esign-wrapper-content"
        ).offsetHeight;
        signHeight.value -= 10;
        showEsignCom.value = true;
    });
};

const handleCrop = () => {
    showDialog({
        title: "提示",
        message: "在画布原有尺寸基础上裁掉四周空白部分",
        teleport: ".esign-wrapper",
    });
};

defineExpose({
    openSign,
});
</script>
<style lang="scss" scoped>
.esign-wrapper {
    width: 100%;
    height: 100%;
    // padding-top: 0.2rem;
    background: #fff;
    :deep(.el-form-item) {
        margin-bottom: 0;
    }
    .esign-wrapper-content {
        height: calc(100% - 160px);
        border: 1px solid #dcdfe6;
        box-sizing: border-box;
        width: 300px;
        margin: 0 auto;
        margin-bottom: 10px;
        .sign-result-img {
            width: 100%;
            height: 100%;
        }
    }
    .esign-wrapper-btn {
        width: 300px;
        margin: 0 auto;
        text-align: right;
        // box-sizing: border-box;
        // padding: 0 2px;
        // padding-right: 5px;
        // text-align: right;
    }
}
</style>

<style lang="scss">
.sign-color-picker {
    z-index: 9999 !important;
}
</style>

