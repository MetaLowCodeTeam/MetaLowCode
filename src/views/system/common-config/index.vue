<template>
    <div class="common-config">
        <el-card shadow="never" v-loading="loading">
            <el-tabs v-model="activeName">
                <el-tab-pane
                    v-for="(card,cardInx) of confList"
                    :key="cardInx"
                    :name="card.code"
                    :label="card.label"
                >
                    <el-descriptions :border="true" :column="1">
                        <el-descriptions-item v-for="(item,inx) of card.confs" :key="inx">
                            <template #label>
                                <div class="config-label">
                                    <span class="is-required" v-if="item.required">*</span>
                                    {{ item.label }}
                                </div>
                            </template>
                            <!-- 输入框 -->
                            <div v-if="item.type == 'input'">
                                <el-input
                                    :class="{'is-error':item.isError}"
                                    @focus="item.isError = false"
                                    v-model="confData[item.key]"
                                    clearable
                                    :disabled="isDisabled(card,item)"
                                    :placeholder="'请输入' + item.label"
                                ></el-input>
                            </div>
                            <!-- 复选框 -->
                            <div v-else-if="item.type == 'switch'">
                                <el-switch v-model="confData[item.key]" />
                            </div>
                            <!-- 颜色选择器 -->
                            <div v-else-if="item.type == 'picker'">
                                <el-color-picker v-model="confData[item.key]" />
                            </div>
                            <!-- 上传Logo -->
                            <div v-else-if="item.type == 'uptadeLogo'" style="width: 178px;">
                                <ml-upload
                                    accept="image/*"
                                    @on-success="onLogoSuccess"
                                    class="ml-upload"
                                    uploadUrl="/picture/upload"
                                >
                                    <template #trigger>
                                        <div
                                            class="avatar-box"
                                            :class="{'is-error':item.isError}"
                                            v-if="confData[item.key]"
                                            @click="item.isError = false"
                                        >
                                            <mlLogo class="avatar" :logoUrl="confData[item.key]" />
                                        </div>
                                        <el-icon
                                            @click="item.isError = false"
                                            v-else
                                            class="avatar-uploader-icon"
                                            :class="{'is-error':item.isError}"
                                        >
                                            <ElIconPlus />
                                        </el-icon>
                                    </template>
                                </ml-upload>
                            </div>
                        </el-descriptions-item>
                    </el-descriptions>
                </el-tab-pane>
            </el-tabs>
            <div class="footer mt-20">
                <el-button type="primary" style="width: 100px;" @click="onSubmit">保存</el-button>
            </div>
        </el-card>
    </div>
</template>

<script setup>
import { ElMessage } from "element-plus";
import { inject, nextTick, onMounted, reactive, ref } from "vue";
import { getSettingInfo, updateSysSetting } from "@/api/setting";
import commonConfig from "@/config/commonConfig";
const $TOOL = inject("$TOOL");
// import config from "@/config/table";
onMounted(() => {
    initData();
});

/**
 * *************************************** 字段定义
 */

// 配置信息
let confList = ref();
// 当前tab
let activeName = ref("common");
// 表单数据
let confData = reactive({});
// 加载状态
let loading = ref(false);

/**
 * *************************************** 初始化数据
 */

// 短信字段
let smsFields = ref(["smsappId", "smsappKey", "smssignature"]);
// 邮箱字段
let emailFields = ref(["appId", "appKey", "from", "fromName", "cc"]);

const initData = async () => {
    confList.value = [...commonConfig];
    loading.value = true;
    let res = await getSettingInfo();
    if (res) {
        let resData = res.data ? res.data : {};
        confData = Object.assign(confData, resData);
        let { emailSetting, smsSetting } = confData;

        // 格式化短信
        confData.smsOpen = smsSetting.openStatus;
        for (const key in smsSetting) {
            if (Object.hasOwnProperty.call(smsSetting, key)) {
                const element = smsSetting[key];
                confData["sms" + key] = element;
            }
        }
        // 格式化邮箱
        confData.emailOpen = emailSetting.openStatus;
        for (const key in emailSetting) {
            if (Object.hasOwnProperty.call(emailSetting, key)) {
                const element = emailSetting[key];
                confData[key] = element;
            }
        }

        // 初始化LOGO
        if (!confData.logo) {
            confData.logo = "/src/assets/imgs/logo.png";
        }
    }
    loading.value = false;
};

/**
 * *************************************** 功能集合
 */

// logo上传成功
const onLogoSuccess = (data) => {
    confData.logo = data;
};

// 是否禁用
const isDisabled = (card, item) => {
    // 如果是短信与邮箱 且 没有开启短信
    if (
        card.code == "sms&email" &&
        !confData.smsOpen &&
        smsFields.value.includes(item.key)
    ) {
        return true;
    }
    // 如果是短信与邮箱 且 没有开启邮箱

    if (
        card.code == "sms&email" &&
        !confData.emailOpen &&
        emailFields.value.includes(item.key)
    ) {
        return true;
    }
    return false;
};

/**
 * *************************************** 保存数据
 */
// 保存执行
const onSubmit = async () => {
    if (!checkOnSave()) {
        return;
    }
    // 如果短信是开启的
    if (confData.smsOpen) {
        for (const key in confData.smsSetting) {
            if (Object.hasOwnProperty.call(confData.smsSetting, key)) {
                confData.smsSetting[key] = confData["sms" + key];
            }
        }
    }
    confData.smsSetting.openStatus = confData.smsOpen;
    // 如果邮箱是开启的
    if (confData.emailOpen) {
        for (const key in confData.emailSetting) {
            if (Object.hasOwnProperty.call(confData.emailSetting, key)) {
                confData.emailSetting[key] = confData[key];
            }
        }
    }
    confData.emailSetting.openStatus = confData.emailOpen;
    let res = await updateSysSetting(confData);
    if (res) {
        ElMessage.success("保存成功");
        nextTick(() => {
            location.reload();
        });
    } else {
        loading.value = false;
    }
};

// 错误类型
const MsgType = reactive({
    input: "请输入",
    uptade: "请上传",
    uptadeLogo: "请上传",
    radio: "请选择",
    checkbox: "请选择",
});

// 保存前校验必填
const checkOnSave = () => {
    // 校验必填字段是否都有值
    // 1 循环tab
    for (let index = 0; index < confList.value.length; index++) {
        const el = confList.value[index];
        // 循环当前tab下的字段集
        for (let subInx = 0; subInx < el.confs.length; subInx++) {
            const subEl = el.confs[subInx];
            // 如果字段是必填的，且该字段没有值 并且该字段不属于短信 或者 邮箱
            if (
                subEl.required &&
                !confData[subEl.key] &&
                !smsFields.value.includes(subEl.key) &&
                !emailFields.value.includes(subEl.key)
            ) {
                subEl.isError = true;
                activeName.value = el.code;
                ElMessage.warning(MsgType[subEl.type] + subEl.label);
                return false;
            }
            // 如果字段是必填的，且该字段没有值 并且该字段属于短信 并且短息是开启的
            if (
                subEl.required &&
                !confData[subEl.key] &&
                smsFields.value.includes(subEl.key) &&
                confData.smsOpen
            ) {
                subEl.isError = true;
                activeName.value = el.code;
                ElMessage.warning(MsgType[subEl.type] + subEl.label);
                return false;
            }
            // 如果字段是必填的，且该字段没有值 并且该字段属于邮箱 并且邮箱是开启的
            if (
                subEl.required &&
                !confData[subEl.key] &&
                emailFields.value.includes(subEl.key) &&
                confData.emailOpen
            ) {
                subEl.isError = true;
                activeName.value = el.code;
                ElMessage.warning(MsgType[subEl.type] + subEl.label);
                return false;
            }
        }
    }
    return true;
};

// 获取公开系统配置
const queryPublicSetting = async () => {
    let res = await getPublicSetting();
    if (res) {
        $TOOL.data.set("APP_NAME", res.data.appName);
        $TOOL.data.set("APP_VER", res.data.dbVersion);
        $TOOL.data.set("APP_LOGO", res.data.logo);
        $TOOL.data.set("APP_PAGE_FOOTER", res.data.pageFooter);
        $TOOL.data.set("APP_TITLE", res.data.appTitle);
        $TOOL.data.set("APP_SUB_TITLE", res.data.appSubtitle);
        $TOOL.data.set("APP_INTRO", res.data.appIntro);
        $TOOL.data.set("APP_WATERMARK", res.data.watermark);
        $TOOL.data.set("APP_PLUGINID", res.data.pluginIdList);
        colorPrimary(res.data.themeColor);
    }
};

const colorPrimary = (val) => {
    if (!val) {
        val = "#409EFF";
    }
    document.documentElement.style.setProperty("--el-color-primary", val);
    document.documentElement.style.setProperty("--vf-color-primary", val); //同步主题色
    for (let i = 1; i <= 9; i++) {
        document.documentElement.style.setProperty(
            `--el-color-primary-light-${i}`,
            colorTool.lighten(val, i / 10)
        );
    }
    for (let i = 1; i <= 9; i++) {
        document.documentElement.style.setProperty(
            `--el-color-primary-dark-${i}`,
            colorTool.darken(val, i / 10)
        );
    }
    $TOOL.data.set("APP_COLOR", val);
};
</script>
<style lang='scss' scoped>
.common-config {
    padding: 20px;
    padding-bottom: 0;
    .config-label {
        position: relative;
        .is-required {
            position: absolute;
            color: #f56c6c;
            left: -8px;
            font-size: 16px;
        }
    }
    .footer {
        text-align: center;
    }
    .avatar-box {
        position: relative;
        box-sizing: border-box;
        width: 178px;
        height: 178px;
        border: 1px dashed var(--el-border-color);
        padding: 10px;
        transition: var(--el-transition-duration-fast);
        img {
            width: 100%;
            height: 100%;
        }
        &:hover {
            border-color: var(--el-color-primary);
        }
        &.is-error {
            border-color: var(--el-color-error);
        }
    }
    .avatar-uploader-icon {
        border: 1px dashed var(--el-border-color);
        font-size: 28px;
        color: #8c939d;
        width: 178px;
        height: 178px;
        text-align: center;
        transition: var(--el-transition-duration-fast);
        &:hover {
            border-color: var(--el-color-primary);
        }
        &.is-error {
            border-color: var(--el-color-error);
        }
    }
}
:deep(.el-descriptions__label) {
    width: 200px;
}
</style>