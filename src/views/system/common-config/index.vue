<template>
    <div class="common-config">
        <el-card shadow="never" v-loading="loading">
            <el-tabs v-model="activeName">
                <template v-for="(card,cardInx) of confList" :key="cardInx">
                    <el-tab-pane :name="card.code" :label="card.label" v-if="!card.isHide">
                        <el-descriptions :border="true" :column="1">
                            <el-descriptions-item v-for="(item,inx) of card.confs" :key="inx">
                                <template #label>
                                    <div class="config-label">
                                        <div>
                                            <span class="is-required" v-if="item.required">*</span>
                                            {{ item.label }}
                                        </div>
                                    </div>
                                </template>
                                <!-- 文本框 -->
                                <div v-if="item.type == 'text'">
                                    <span
                                        v-if="item.keyFrom"
                                    >{{ confData[item.keyFrom] ? confData[item.keyFrom][item.key] : '--'}}</span>
                                    <span v-else>{{ confData[item.key] }}</span>
                                </div>
                                <!-- 输入框 -->
                                <div v-else-if="item.type == 'input'">
                                    <el-input
                                        :class="{'is-error':item.isError}"
                                        @focus="item.isError = false"
                                        v-model="confData[item.key]"
                                        clearable
                                        :disabled="isDisabled(card,item) || item.disabled"
                                        :placeholder="'请输入' + item.label"
                                    ></el-input>
                                    <div class="info-text">{{ item.subLabel }}</div>
                                </div>
                                <!-- 复选框 -->
                                <div v-else-if="item.type == 'switch'">
                                    <el-tooltip
                                        class="box-item"
                                        effect="dark"
                                        :content="'当前：' + publicSetting.productType?.displayName + ' 不支持该功能'"
                                        placement="top"
                                        v-if="needAuthentication.includes(item.key) && (publicSetting.productType?.value == 1 || publicSetting.productType?.value == 2)"
                                    >
                                        <el-switch v-model="confData[item.key]" disabled />
                                    </el-tooltip>
                                    <el-switch v-else v-model="confData[item.key]" />
                                </div>
                                <!-- 颜色选择器 -->
                                <div v-else-if="item.type == 'picker'">
                                    <el-color-picker v-model="confData[item.key]" />
                                </div>
                                <!-- 钉钉集成用户选择框 -->
                                <div v-else-if="item.type == 'mlSelectUser' && item.key == 'nodeRole'">
                                    <mlSelectUser
                                        type="Role"
                                        v-model="confData.nodeRole"
                                        clearable
                                        :disabled="!confData.dingTalkOpen"
                                    />
                                </div>
                                 <!-- 企业微信集成用户选择框 -->
                                 <div v-else-if="item.type == 'mlSelectUser' && item.key == 'wxWorkNodeRole'">
                                    <mlSelectUser
                                        type="Role"
                                        v-model="confData.wxWorkNodeRole"
                                        clearable
                                        :disabled="!confData.wxWorkOpen"
                                    />
                                </div>
                                <!-- 数字类型输入框 -->
                                <div v-else-if="item.type == 'numInput'">
                                    <el-input-number
                                        v-model="confData[item.key]"
                                        :min="1"
                                        :max="99999"
                                        :disabled="!confData.autoBackup"
                                    />
                                    <span v-if="item.suffixText" class="ml-10">{{ item.suffixText }}</span>
                                </div>
                                <!-- 立即同步 -->
                                <div v-else-if="item.type == 'autoSync'">
                                    <el-tooltip
                                        popper-class="conmon-tooltip"
                                        effect="dark"
                                        :content="errorMessage || 'error'"
                                        placement="top"
                                        v-if="errorMessage"
                                        style="width: 300px;"
                                    >
                                        <el-button
                                            :loading="autoSyncLoading"
                                            :disabled="isDisabled(card,item)"
                                            @click="autoSync"
                                        >
                                            <el-icon v-if="!autoSyncLoading">
                                                <ElIconRefresh />
                                            </el-icon>
                                            <span class="ml-2">同步失败</span>
                                        </el-button>
                                    </el-tooltip>
                                    <el-button
                                        v-else
                                        :loading="autoSyncLoading"
                                        :disabled="isDisabled(card,item)"
                                        @click="autoSync"
                                    >
                                        <el-icon v-if="!autoSyncLoading">
                                            <ElIconRefresh />
                                        </el-icon>
                                        <span class="ml-2">立即同步</span>
                                    </el-button>
                                </div>
                                <!-- 立即同步 -->
                                <div v-else-if="item.type == 'autoSync2'">
                                    <el-tooltip
                                        popper-class="conmon-tooltip"
                                        effect="dark"
                                        :content="errorMessage2 || 'error'"
                                        placement="top"
                                        v-if="errorMessage2"
                                        style="width: 300px;"
                                    >
                                        <el-button
                                            :loading="autoSyncLoading2"
                                            :disabled="isDisabled(card,item)"
                                            @click="autoSync2"
                                        >
                                            <el-icon v-if="!autoSyncLoading2">
                                                <ElIconRefresh />
                                            </el-icon>
                                            <span class="ml-2">同步失败</span>
                                        </el-button>
                                    </el-tooltip>
                                    <el-button
                                        v-else
                                        :loading="autoSyncLoading2"
                                        :disabled="isDisabled(card,item)"
                                        @click="autoSync2"
                                    >
                                        <el-icon v-if="!autoSyncLoading2">
                                            <ElIconRefresh />
                                        </el-icon>
                                        <span class="ml-2">立即同步</span>
                                    </el-button>
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
                                                <mlLogo class="avatar" :logoUrl="getLogoUrl(item)"></mlLogo>
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
                </template>
            </el-tabs>
            <div class="footer mt-20">
                <el-button
                    type="primary"
                    style="width: 100px;"
                    v-if="activeName == 'authLicense'"
                    @click="openActivateAuthDialog"
                >激活授权</el-button>
                <el-button type="primary" style="width: 100px;" v-else @click="onSubmit">保存</el-button>
            </div>
        </el-card>
        <ActivateAuth ref="activateAuthRefs" @registerActiveConfirm="initData" />
    </div>
</template>

<script setup>
import { ElMessage, ElMessageBox } from "element-plus";
import { nextTick, onMounted, reactive, ref } from "vue";
import {
    getSettingInfo,
    updateSysSetting,
    getDingtalkSyncUser,
    getWxWorkSyncUser,
    getHeavyTask,
} from "@/api/setting";
import commonConfig from "@/config/commonConfig";
import ActivateAuth from "./components/ActivateAuth.vue";

import useCommonStore from "@/store/modules/common";
import { storeToRefs } from "pinia";
const { publicSetting } = storeToRefs(useCommonStore());

import { mlShortcutkeys } from "@/utils/util";

// import config from "@/config/table";
onMounted(() => {
    initData();
    mlShortcutkeys(()=>{
        confList.value[4].isHide = !confList.value[4].isHide;
    })
});

/**
 * *************************************** 字段定义
 */

// 配置信息
let confList = ref();
// 当前tab
let activeName = ref("common");
// 表单数据
let confData = reactive({
    nodeRole: [],
    homeDir: "",
});
// 加载状态
let loading = ref(false);

// 需要版本控制的
let needAuthentication = ref(["dingTalkOpen"]);

/**
 * *************************************** 初始化数据
 */

// 短信字段
let smsFields = ref(["smsappId", "smsappKey", "smssignature"]);
// 邮箱字段
let emailFields = ref(["appId", "appKey", "from", "fromName", "cc"]);
// 云存储字段
let cloudStorageFields = ref(["accessKey", "secretKey", "bucket", "host"]);
// 钉钉字段
let dingTalkFields = ref([
    "dingTalkAppKey",
    "dingTalkAppSecret",
    "dingTalkAgentId",
    "nodeDep",
]);

// 企业微信字段
let wxWorkFields = ref([
    "wxWorkCorpId",
    "wxWorkAgentId",
    "wxWorkCorpSecret",
    "nodeDep2",
]);



const initData = async () => {
    confList.value = commonConfig.map((el) => {
        if (el.code == "authLicense" && publicSetting.value.appMode == "prod") {
            el.isHide = true;
        }
        return el;
    });
    loading.value = true;
    let res = await getSettingInfo();
    if (res) {
        let resData = res.data ? res.data : {};
        confData = Object.assign(confData, resData);
        confData.webVer = publicSetting.value.webVer;
        let { 
            emailSetting, 
            smsSetting, 
            cloudStorageSetting, 
            dingTalkSetting,
            wxWorkSetting
         } =
            confData;

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

        // 格式化云存储
        confData.cloudStorageOpen = cloudStorageSetting.openStatus;
        for (const key in cloudStorageSetting) {
            if (Object.hasOwnProperty.call(cloudStorageSetting, key)) {
                const element = cloudStorageSetting[key];
                confData[key] = element;
            }
        }

        // 格式化钉钉集成
        confData.dingTalkOpen = dingTalkSetting.openStatus;
        for (const key in dingTalkSetting) {
            if (Object.hasOwnProperty.call(dingTalkSetting, key)) {
                const element = dingTalkSetting[key];
                confData[key] = element;
                if (key == "nodeRole" && !element) {
                    confData[key] = [];
                }
            }
        }

        // 格式化企业微信集成
        confData.wxWorkOpen = wxWorkSetting.openStatus;
        for (const key in wxWorkSetting) {
            if (Object.hasOwnProperty.call(wxWorkSetting, key)) {
                const element = wxWorkSetting[key];
                confData[key] = element;
                if (key == "nodeRole" && (!element || element.length < 1)) {
                    confData.wxWorkNodeRole = [];
                }
            }
        }


        // 初始化LOGO
        if (!confData.logo) {
            confData.logo = "/src/assets/imgs/logo.png";
        }
        // 初始化应用首页地址
        confData.homeDir = confData.homeURL + "/dingTalk/userLogin";
        // 备份周期
        confData.backupCycle = confData.backupCycle * 1 || 1;
        // 初始化备份保留时间
        confData.backupOverdueDay = confData.backupOverdueDay * 1 || 30;
    }
    loading.value = false;
};

/**
 * *************************************** 功能集合
 */

// logo上传成功
const onLogoSuccess = (data) => {
    console.log(data, "data");
    confData.logo = data.url;
};

// 是否禁用
const isDisabled = (card, item) => {
    // 如果是短信与邮箱 且 没有开启短信
    if (
        card.code == "serviceIntegration" &&
        !confData.smsOpen &&
        smsFields.value.includes(item.key)
    ) {
        return true;
    }
    // 如果是短信与邮箱 且 没有开启邮箱
    if (
        card.code == "serviceIntegration" &&
        !confData.emailOpen &&
        emailFields.value.includes(item.key)
    ) {
        return true;
    }
    // 如果是短信与邮箱 且 没有开启云存储
    if (
        card.code == "serviceIntegration" &&
        !confData.cloudStorageOpen &&
        cloudStorageFields.value.includes(item.key)
    ) {
        return true;
    }
    // 如果是钉钉集成 且 没有开启钉钉服务
    if (
        card.code == "dingTalkIntegration" &&
        !confData.dingTalkOpen &&
        dingTalkFields.value.includes(item.key)
    ) {
        return true;
    }
    // 如果是企业微信集成 且 没有开启企业微信服务
    if (
        card.code == "wxWorkIntegration" &&
        !confData.wxWorkOpen &&
        wxWorkFields.value.includes(item.key)
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
    if (publicSetting.value.trialVersionFlag) {
        ElMessageBox.alert(
            `近期有多名不怎么可爱的用户恶意修改美乐演示版本内容，因此该功能在演示版本已被禁用！<br />
            如需体验该功能，请联系美乐官网客服为您安排单独的体验环境，或者官网下载免费版使用。<br />
            谢谢理解！`,
            "提示",
            {
                dangerouslyUseHTMLString: true,
                confirmButtonText: "确认",
                type: "warning",
                callback: () => {},
            }
        );
        return;
    }
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
    // 重新赋值短信开关
    confData.smsSetting.openStatus = confData.smsOpen;

    // 如果邮箱是开启的
    if (confData.emailOpen) {
        for (const key in confData.emailSetting) {
            if (Object.hasOwnProperty.call(confData.emailSetting, key)) {
                confData.emailSetting[key] = confData[key];
            }
        }
    }
    // 重新赋值邮箱开关
    confData.emailSetting.openStatus = confData.emailOpen;

    // 如果云存储是开启的
    if (confData.cloudStorageOpen) {
        for (const key in confData.cloudStorageSetting) {
            if (Object.hasOwnProperty.call(confData.cloudStorageSetting, key)) {
                confData.cloudStorageSetting[key] = confData[key];
            }
        }
    }
    // 重新赋值云存储开关
    confData.cloudStorageSetting.openStatus = confData.cloudStorageOpen;

    // 如果钉钉是开启的
    if (confData.dingTalkOpen) {
        for (const key in confData.dingTalkSetting) {
            if (Object.hasOwnProperty.call(confData.dingTalkSetting, key)) {
                confData.dingTalkSetting[key] = confData[key];
            }
        }
    }
    // 重新赋值钉钉集成开关
    confData.dingTalkSetting.openStatus = confData.dingTalkOpen;

    // 如果企业微信集成是开启的
    if (confData.wxWorkOpen) {
        for (const key in confData.wxWorkSetting) {
            if (Object.hasOwnProperty.call(confData.wxWorkSetting, key)) {
                confData.wxWorkSetting[key] = confData[key];
            }
        }
        confData.wxWorkSetting.nodeRole = confData.wxWorkNodeRole;
    }
    // 重新赋值企业微信集成开关
    confData.wxWorkSetting.openStatus = confData.wxWorkOpen;
    loading.value = true;;
    let res = await updateSysSetting(confData);
    if (res) {
        ElMessage.success("保存成功");
        nextTick(() => {
            location.reload();
        });
    } 
    loading.value = false;
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
            if (
                subEl.validation == "url" &&
                confData[subEl.key] &&
                confData[subEl.key].indexOf("http://") == -1 &&
                confData[subEl.key].indexOf("https://") == -1
            ) {
                subEl.isError = true;
                activeName.value = el.code;
                ElMessage.warning("请输入有效域名");
                return false;
            }
            // 如果字段是必填的，且该字段没有值 并且该字段不属于短信 或者 邮箱
            if (
                subEl.required &&
                !confData[subEl.key] &&
                !smsFields.value.includes(subEl.key) &&
                !emailFields.value.includes(subEl.key) &&
                !cloudStorageFields.value.includes(subEl.key) &&
                !dingTalkFields.value.includes(subEl.key) &&
                !wxWorkFields.value.includes(subEl.key)
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
            // 如果字段是必填的，且该字段没有值 并且该字段属于七牛云 并且七牛云是开启的
            if (
                subEl.required &&
                !confData[subEl.key] &&
                cloudStorageFields.value.includes(subEl.key) &&
                confData.cloudStorageOpen
            ) {
                subEl.isError = true;
                activeName.value = el.code;
                ElMessage.warning(MsgType[subEl.type] + subEl.label);
                return false;
            }
            // 如果字段是必填的，且该字段没有值 并且该字段属于云存储 并且邮箱是开启的
            if (
                subEl.required &&
                !confData[subEl.key] &&
                dingTalkFields.value.includes(subEl.key) &&
                wxWorkFields.value.includes(subEl.key) &&
                confData.dingTalkOpen
            ) {
                subEl.isError = true;
                activeName.value = el.code;
                ElMessage.warning(MsgType[subEl.type] + subEl.label);
                return false;
            }
        }
    }
    // if(confData.homeURL && confData.homeURL.indexOf('http://') == -1 && confData.homeURL.indexOf('https://') == -1){
    //     ElMessage.warning("请输入有效域名");
    //     confList.value[0].
    //     return false
    // }
    return true;
};

/**
 * ***************************************** 激活授权
 */

let activateAuthRefs = ref();

const openActivateAuthDialog = () => {
    activateAuthRefs.value.openDailog(confData.licenseInfo);
};

// 获取logourl
const getLogoUrl = (item) => {
    return confData[item.key];
};

/**
 * ***************************** 自动同步
 */

// 钉钉同步
let autoSyncLoading = ref(false);
let cutTaskId = ref();
let isFinish = ref(false);
let errorMessage = ref("");


const autoSync = async () => {
    autoSyncLoading.value = true;
    let defaultRole = confData.nodeRole[0] ? confData.nodeRole[0].id : null;
    let res = await getDingtalkSyncUser(defaultRole);
    if (res && res.data) {
        cutTaskId.value = res.data;
        getHeavyTaskApi();
    } else {
        autoSyncLoading.value = false;
    }
};

const getHeavyTaskApi = async () => {
    let taskRes = await getHeavyTask(cutTaskId.value);
    if (taskRes && taskRes.data) {
        isFinish.value = taskRes.data.finish;
        errorMessage.value = taskRes.data.errorMessage;
        if (!isFinish.value) {
            setTimeout(() => {
                getHeavyTaskApi();
            }, 5000);
        }
    } else {
        autoSyncLoading.value = true;
    }
    if (isFinish.value) {
        autoSyncLoading.value = false;
        if (errorMessage.value) {
            ElMessage.error("同步失败");
        } else {
            ElMessage.success("同步成功");
        }
    }
};


// 企业微信同步
let autoSyncLoading2 = ref(false);
let cutTaskId2 = ref();
let isFinish2 = ref(false);
let errorMessage2 = ref("");

const autoSync2 = async () => {
    autoSyncLoading2.value = true;
    let defaultRole = confData.wxWorkNodeRole[0] ? confData.wxWorkNodeRole[0].id : null;
    let res = await getWxWorkSyncUser(defaultRole);
    if (res && res.data) {
        cutTaskId2.value = res.data;
        getHeavyTaskApi2();
    } else {
        autoSyncLoading2.value = false;
    }
};

const getHeavyTaskApi2 = async () => {
    let taskRes2 = await getHeavyTask(cutTaskId2.value);
    if (taskRes2 && taskRes2.data) {
        isFinish2.value = taskRes2.data.finish;
        errorMessage2.value = taskRes2.data.errorMessage;
        if (!isFinish2.value) {
            setTimeout(() => {
                getHeavyTaskApi2();
            }, 5000);
        }
    } else {
        autoSyncLoading2.value = true;
    }
    if (isFinish2.value) {
        autoSyncLoading2.value = false;
        if (errorMessage2.value) {
            ElMessage.error("同步失败");
        } else {
            ElMessage.success("同步成功");
        }
    }
};

// 

// 页签显示
const showTab = (code) => {
    return code != "authLicense" || publicSetting.value.appMode != "prod";
};
</script>
<style lang='scss' scoped>
.info-text {
    margin-top: 5px;
    font-size: 12px;
    padding-left: 5px;
}

.err-meg {
    color: #f56c6c;
}
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
    width: 220px;
}
</style>