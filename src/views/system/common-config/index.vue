<template>
    <div class="common-config">
        <el-card shadow="never" v-loading="loading">
            <el-tabs v-model="activeName">
                <template v-for="(card,cardInx) of confList" :key="cardInx">
                    <el-tab-pane :name="card.code" :label="card.label" v-if="!card.isHide">
                        <el-descriptions :border="true" :column="1">
                            <template v-for="(item,inx) of card.config" :key="inx">
                                <el-descriptions-item v-if="item.show ? item.show(confData) : true">
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
                                    <div 
                                        v-else-if="(item.type == 'input' || item.type == 'passwordInput')"
                                    >
                                        <form @submit.prevent>
                                            <div @click="item.needCopy ? copyValue(item) : ''">
                                                <el-input
                                                    :class="{'is-error':item.isError}"
                                                    @focus="item.isError = false"
                                                    v-model="confData[item.key]"
                                                    clearable
                                                    :disabled="isDisabled(card,item) || item.disabled"
                                                    :placeholder="'请输入' + item.label"
                                                    :type="item.type == 'input' ? 'text' : 'password'"
                                                    :show-password="item.type == 'passwordInput'"
                                                    :maxlength="item.maxLength"
                                                ></el-input>
                                            </div>
                                        </form>
                                        <div class="info-text" v-if="item.subLabel">{{ item.subLabel }}</div>
                                    </div>
                                    <!-- 选择框 -->
                                    <div v-else-if="item.type == 'select'">
                                        <el-select 
                                            v-model="confData[item.key]" 
                                            :placeholder="item.placeholder" 
                                            :style="{'width': item.selectWidth }"
                                            @change="item.onChange"
                                        >
                                            <el-option
                                                v-for="op in item.options"
                                                :key="op.value"
                                                :label="op.label"
                                                :value="op.value"
                                            />
                                        </el-select>
                                    </div>
                                    <!-- 单选框 -->
                                    <div v-else-if="item.type == 'radio'">
                                        <el-radio-group v-model="confData[item.key]" :disabled="isDisabled(card,item)">
                                            <el-radio v-for="op in item.options" :key="op.value" :label="op.value" :value="op.value">{{ op.label }}</el-radio>
                                        </el-radio-group>
                                    </div>
                                    <!-- 复选框 -->
                                    <div v-else-if="item.type == 'checkbox'">
                                        <el-checkbox 
                                            v-model="confData[item.key]" 
                                            :disabled="isDisabled(card,item)"
                                            @change="item.onChange ? item.onChange(confData) : ''"
                                        >
                                            {{ item.checkBoxLabel || item.label }}
                                        </el-checkbox>
                                    </div>
                                    <!-- 开关 -->
                                    <div v-else-if="item.type == 'switch'" class="switch-box">
                                        <el-tooltip
                                            class="box-item"
                                            effect="dark"
                                            content="需要先开启短信服务"
                                            placement="top"
                                            v-if="item.key == 'mobilePhoneLogin' && !confData.smsOpen"
                                        >
                                            <el-switch v-model="confData[item.key]" disabled />
                                        </el-tooltip>
                                        <el-switch v-else-if="item.key == 'autoBackup'" :beforeChange="openAutoBackup" v-model="confData[item.key]" />
                                        <el-switch v-else v-model="confData[item.key]" :disabled="isDisabled(card,item)"/>
                                        <span class="info-text ml-10" v-if="item.subLabel">{{ item.subLabel }}</span>
                                    </div>
                                    <!-- 颜色选择器 -->
                                    <div v-else-if="item.type == 'picker'">
                                        <el-color-picker v-model="confData[item.key]" show-alpha :predefine="getElColorPickerPredefineColors()" />
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
                                    <!-- 飞书集成用户选择框 -->
                                    <div v-else-if="item.type == 'mlSelectUser' && item.key == 'larkNodeRole'">
                                        <mlSelectUser
                                            type="Role"
                                            v-model="confData.larkNodeRole"
                                            clearable
                                            :disabled="!confData.larkOpen"
                                        />
                                    </div>
                                    <!-- 数字类型输入框 -->
                                    <div v-else-if="item.type == 'numInput'">
                                        <el-input-number
                                            v-model="confData[item.key]"
                                            :min="0"
                                            :max="99999"
                                            v-if="item.key == 'triggerLogRetentionTime'"
                                        />
                                        <el-input-number
                                            v-model="confData[item.key]"
                                            :min="1"
                                            :max="99999"
                                            v-else
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
                                    <!-- 立即同步 -->
                                    <div v-else-if="item.type == 'autoSync3'">
                                        <el-tooltip
                                            popper-class="conmon-tooltip"
                                            effect="dark"
                                            :content="errorMessage3 || 'error'"
                                            placement="top"
                                            v-if="errorMessage3"
                                            style="width: 300px;"
                                        >
                                            <el-button
                                                :loading="autoSyncLoading3"
                                                :disabled="isDisabled(card,item)"
                                                @click="autoSync3"
                                            >
                                                <el-icon v-if="!autoSyncLoading3">
                                                    <ElIconRefresh />
                                                </el-icon>
                                                <span class="ml-2">同步失败</span>
                                            </el-button>
                                        </el-tooltip>
                                        <el-button
                                            v-else
                                            :loading="autoSyncLoading3"
                                            :disabled="isDisabled(card,item)"
                                            @click="autoSync3"
                                        >
                                            <el-icon v-if="!autoSyncLoading3">
                                                <ElIconRefresh />
                                            </el-icon>
                                            <span class="ml-2">立即同步</span>
                                        </el-button>
                                    </div>
                                    <!-- 上传Logo -->
                                    <div class="upload-logo-div" v-else-if="item.type == 'uploadLogo'" style="width: 178px;">
                                        <ml-upload
                                            accept="image/*"
                                            @on-success="(data) => onLogoSuccess(data, item.key)"
                                            class="ml-upload"
                                            uploadUrl="/picture/upload?publicPicture=true"
                                        >
                                            <template #trigger>
                                                <div
                                                    class="avatar-box"
                                                    :class="{'is-error':item.isError}"
                                                    v-if="confData[item.key]"
                                                    @click="item.isError = false"
                                                >
                                                    <mlLogo class="avatar" :logoUrl="getLogoUrl(item)"></mlLogo>
                                                    <div class="remove-logo">
                                                        <span class="remove-logo-icon" @click.stop="removeLogo(item.key)">
                                                            <el-icon size="30">
                                                                <ElIconDelete />
                                                            </el-icon>
                                                        </span>
                                                    </div>
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
                                        <div class="info-text" v-if="item.subLabel">{{ item.subLabel }}</div>
                                    </div>
                                </el-descriptions-item>
                            </template>
                            
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
import { nextTick, onMounted, reactive, ref, onUnmounted } from "vue";
import {
    getSettingInfo,
    updateSysSetting,
    getDingtalkSyncUser,
    getWxWorkSyncUser,
    getLarkSyncUser,
    getHeavyTask,
} from "@/api/setting";
import commonConfig from "@/config/commonConfig";
import ActivateAuth from "./components/ActivateAuth.vue";

import useCommonStore from "@/store/modules/common";
import { storeToRefs } from "pinia";
const { publicSetting } = storeToRefs(useCommonStore());

import { mlShortcutkeys, getElColorPickerPredefineColors } from "@/utils/util";

// 快捷键
let mlShortcutCleanup = ref(null);


onMounted(() => {
    initData();
    mlShortcutCleanup.value = mlShortcutkeys(()=>{
        confList.value[4].isHide = !confList.value[4].isHide;
    })
});

onUnmounted(() => {
    if(mlShortcutCleanup.value){
        mlShortcutCleanup.value();
    }
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
    wxWorkNodeRole:[],
    larkNodeRole: [],
});
// 加载状态
let loading = ref(false);

// 需要版本控制的
let needAuthentication = ref([]);

/**
 * *************************************** 初始化数据
 */

// 短信字段
let smsFields = ref(["smsappId", "smsappKey", "smssignature"]);
// 邮箱字段
let emailFields = ref([
    "appId", 
    "appKey", 
    "from", 
    "fromName", 
    "cc", 
    "sendType",
    "smtpHost",
    "smtpPort",
    "smtpUseSSL",
    "smtpUseSTARTTLS",
    "smtpUsername",
    "smtpPassword",
]);

// 邮箱SUBMAIL校验字段
let emailSubmailFields = ref([
    "appId", 
    "appKey", 
    "from", 
    "fromName", 
    "cc", 
]);
// 邮箱SMTP校验字段
let emailSmtpFields = ref([
    "smtpHost",
    "smtpPort",
    "smtpUseSSL",
    "smtpUseSTARTTLS",
    "smtpUsername",
    "smtpPassword",
]);
// 云存储字段
let cloudStorageFields = ref(["accessKey", "secretKey", "bucket", "host"]);
// 钉钉字段
let dingTalkFields = ref([
    "dingTalkAppKey",
    "dingTalkAppSecret",
    "dingTalkAgentId",
    "nodeDep",
    "sendAccountCreatedMessage",
]);

// 企业微信字段
let wxWorkFields = ref([
    "wxWorkCorpId",
    "wxWorkAgentId",
    "wxWorkCorpSecret",
    "nodeDep2",
    "wxsendAccountCreatedMessage",
]);

// 飞书字段
let larkFields = ref([
    "larkappId",
    "larkappSecret",
    "nodeDep3",
    "larksendAccountCreatedMessage",
]);

// 微信字段
let wxFields = ref([
    "wxMiniAppappId",
    "wxMiniAppappSecret",
]);

// 多租户隐藏
let tenantHide = ref(["loginPage", "mobileStyleConfig", "authLicense"]);
// 多租户可配置的字段
let commonConfKeys = ref(["appName", "logo", "homeURL", "themeColor"]);

const initData = async () => {
    let { appMode, pluginIdList, tenantId } = publicSetting.value;
    confList.value = commonConfig.map((el) => {
        el.isHide = false;
        if (el.code == "authLicense" && appMode == "prod") {
            el.isHide = true;
        }
        if(pluginIdList.includes('metaTenant') && tenantId && tenantHide.value.includes(el.code)){
            el.isHide = true;
        }
        if(pluginIdList.includes('metaTenant') && tenantId && el.code == "common"){
            let newConfig = [];
            el.config.forEach(item => {
                if(commonConfKeys.value.includes(item.key)){
                    newConfig.push(item);
                }
            })
            el.config = newConfig;
        }
        return el;
    });
    loading.value = true;
    let res = await getSettingInfo();
    if (res) {
        let resData = res.data ? res.data : {};
        confData = Object.assign(confData, resData);
        confData.webVer = publicSetting.value.commonVer;
        let { 
            emailSetting, 
            smsSetting, 
            cloudStorageSetting, 
            dingTalkSetting,
            wxWorkSetting,
            wechatMiniAppSetting,
            larkSetting,
         } =
            confData;

        if(!emailSetting){
            emailSetting = {};
        }
        if(!smsSetting){
            smsSetting = {};
        }
        if(!cloudStorageSetting){
            cloudStorageSetting = {};
        }
        if(!dingTalkSetting){
            dingTalkSetting = {};
        }
        if(!wxWorkSetting){
            wxWorkSetting = {};
        }
        if(!wechatMiniAppSetting){
            wechatMiniAppSetting = {};
        }
        if(!larkSetting){
            larkSetting = {};
        }
        // 格式化短信
        confData.smsOpen = smsSetting?.openStatus;
        for (const key in smsSetting) {
            if (Object.hasOwnProperty.call(smsSetting, key)) {
                const element = smsSetting[key];
                confData["sms" + key] = element;
            }
        }
        // 格式化邮箱
        confData.emailOpen = emailSetting?.openStatus;
        confData.sendType = emailSetting?.sendType || 0;
        for (const key in emailSetting) {
            if (Object.hasOwnProperty.call(emailSetting, key)) {
                const element = emailSetting[key];
                confData[key] = element;
            }
        }
        confData.smtpUseSSL = emailSetting?.smtpUseSSL || false;
        confData.smtpUseSTARTTLS = emailSetting?.smtpUseSTARTTLS || false;

        // 格式化云存储
        confData.cloudStorageOpen = cloudStorageSetting?.openStatus;
        for (const key in cloudStorageSetting) {
            if (Object.hasOwnProperty.call(cloudStorageSetting, key)) {
                const element = cloudStorageSetting[key];
                confData[key] = element;
            }
        }

        // 格式化钉钉集成
        confData.dingTalkOpen = dingTalkSetting?.openStatus;
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
        confData.wxWorkOpen = wxWorkSetting?.openStatus;
        for (const key in wxWorkSetting) {
            if (Object.hasOwnProperty.call(wxWorkSetting, key)) {
                const element = wxWorkSetting[key];
                if(key == "sendAccountCreatedMessage"){
                    confData["wx" + key] = element;
                }else if (key == "nodeRole" ) {
                    if(!element || element.length < 1){
                        confData.wxWorkNodeRole = [];
                    }else {
                        confData.wxWorkNodeRole = Object.assign([],element);
                    }
                }else {
                    confData[key] = element;
                }
            }
        }
        // 格式化飞书集成
        confData.larkOpen = larkSetting?.openStatus;
        for (const key in larkSetting) {
            if (Object.hasOwnProperty.call(larkSetting, key)) {
                const element = larkSetting[key];
                confData["lark" + key] = element;
            }
        }
        // 格式化微信集成(小程序)
        confData.wxMiniAppOpen = wechatMiniAppSetting?.openStatus;
        for (const key in wechatMiniAppSetting) {
            if (Object.hasOwnProperty.call(wechatMiniAppSetting, key)) {
                const element = wechatMiniAppSetting[key];
                confData["wxMiniApp" + key] = element;
            }
        }

        // 初始化LOGO
        if (!confData.logo) {
            confData.logo = "/src/assets/imgs/logo.png";
        }
        // 初始化钉钉集成 应用首页地址
        confData.homeDir = confData.homeURL + "/dingTalk/userLogin";
        // 初始化企业微信 应用首页地址
        confData.wxWorkHomeDir = confData.homeURL + "/wxWork/userLogin";
        // 初始化飞书 应用首页地址
        confData.larkHomeDir = confData.homeURL + "/lark/userLogin";
        confData.larkHomeURL = confData.homeURL + "/lark/userAuth";
        // 如果存在租户ID
        if(tenantId){
            confData.homeDir += "/" + tenantId;
            confData.wxWorkHomeDir += "/" + tenantId;
        }
        // 正则替换首页地址//
        confData.homeDir = confData.homeDir.replace(/(?<!https?:)\/\/+/g, '/');
        confData.wxWorkHomeDir = confData.wxWorkHomeDir.replace(/(?<!https?:)\/\/+/g, '/');
        // 备份周期
        confData.backupCycle = confData.backupCycle * 1 || 1;
        // 初始化备份保留时间
        confData.backupOverdueDay = confData.backupOverdueDay * 1 || 30;
        // 初始化列表展示样式
        confData.mobileTableStyleType = confData.mobileTableStyleType || 'list';
        // 初始化工作台展示样式
        confData.mobileStagingStyleType = confData.mobileStagingStyleType || 'pane';
        // 初始化数据备份
        if(!confData.databaseDumpPath){
            confData.autoBackup = false;
        }
        if(!confData.layoutConfig) {
            confData.layoutConfig = 'header';
        }
    }
    loading.value = false;
};

/**
 * *************************************** 功能集合
 */

// logo上传成功
const onLogoSuccess = (data, key) => {
    confData[key] = data.url;
};

// 删除logo
const removeLogo = (key) => {
    confData[key] = "";
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
    // 如果是飞书集成 且 没有开启飞书服务
    if (
        card.code == "larkIntegration" &&
        !confData.larkOpen &&
        larkFields.value.includes(item.key)
    ) {
        return true;
    }
    // 如果是微信集成 且 没有开启小程序登录
    if (
        card.code == "wxIntegration" &&
        !confData.wxMiniAppOpen &&
        wxFields.value.includes(item.key)
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
    // 赋值短信对象
    for (const key in confData.smsSetting) {
        if (Object.hasOwnProperty.call(confData.smsSetting, key)) {
            confData.smsSetting[key] = confData["sms" + key];
        }
    }
    // 重新赋值短信开关
    confData.smsSetting.openStatus = confData.smsOpen;

    // 赋值邮箱对象
    for (const key in confData.emailSetting) {
        if (Object.hasOwnProperty.call(confData.emailSetting, key)) {
            confData.emailSetting[key] = confData[key];
        }
    }
    // 重新赋值邮箱开关
    confData.emailSetting.openStatus = confData.emailOpen;

    // 赋值云存储对象
    for (const key in confData.cloudStorageSetting) {
        if (Object.hasOwnProperty.call(confData.cloudStorageSetting, key)) {
            confData.cloudStorageSetting[key] = confData[key];
        }
    }
    // 重新赋值云存储开关
    confData.cloudStorageSetting.openStatus = confData.cloudStorageOpen;

    // 赋值钉钉对象
    for (const key in confData.dingTalkSetting) {
        if (Object.hasOwnProperty.call(confData.dingTalkSetting, key)) {
            confData.dingTalkSetting[key] = confData[key];
        }
    }
    // 重新赋值钉钉集成开关
    confData.dingTalkSetting.openStatus = confData.dingTalkOpen;
    if(!confData.wxWorkSetting){
        confData.wxWorkSetting = {};
    }
    // 赋值企业微信对象
    for (const key in confData.wxWorkSetting) {
        if (Object.hasOwnProperty.call(confData.wxWorkSetting, key)) {
            if(key == "sendAccountCreatedMessage"){
                confData.wxWorkSetting[key] = confData['wx' + key];
            }else {
                confData.wxWorkSetting[key] = confData[key];
            }
        }
    }
    // 赋值企业微信角色
    confData.wxWorkSetting.nodeRole = confData.wxWorkNodeRole;
    
    // 重新赋值企业微信集成开关
    confData.wxWorkSetting.openStatus = confData.wxWorkOpen;
    if(!confData.wechatMiniAppSetting){
        confData.wechatMiniAppSetting = {
            appId: null,
            appSecret: null,
        };
    }

    // 赋值飞书对象
    if(!confData.larkSetting){
        confData.larkSetting = {};
    }
    for (const key in confData.larkSetting) {
        if (Object.hasOwnProperty.call(confData.larkSetting, key)) {
            confData.larkSetting[key] = confData["lark" + key];
        }
    }

    // 赋值飞书角色
    confData.larkSetting.nodeRole = confData.larkNodeRole;


    // 重新赋值飞书集成开关
    confData.larkSetting.openStatus = confData.larkOpen;
    

    // 赋值微信对象
    for (const key in confData.wechatMiniAppSetting) {
        if (Object.hasOwnProperty.call(confData.wechatMiniAppSetting, key)) {
            confData.wechatMiniAppSetting[key] = confData["wxMiniApp" + key];
        }
    }
    // 重新赋值短信开关
    confData.wechatMiniAppSetting.openStatus = confData.wxMiniAppOpen;

    loading.value = true;;
    let res = await updateSysSetting(confData);
    if (res) {
        ElMessage.success("保存成功，即将自动刷新页面");
        setTimeout(() => {
            location.reload();
        }, 1000);
        // nextTick(() => {
        //     location.reload();
        // });
    } 
    loading.value = false;
};

// 错误类型
const MsgType = reactive({
    input: "请输入",
    uptade: "请上传",
    uploadLogo: "请上传",
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
        for (let subInx = 0; subInx < el.config.length; subInx++) {
            const subEl = el.config[subInx];
            if (
                subEl.validation == "url" &&
                confData[subEl.key] &&
                confData[subEl.key].indexOf("http://") == -1 &&
                confData[subEl.key].indexOf("https://") == -1
            ) {
                subEl.isError = true;
                activeName.value = el.code;
                ElMessage.error("请输入有效域名");
                return false;
            }
            let otherRequiredFields = ["appName", "appTitle"];
            if (
                subEl.required &&
                !confData[subEl.key] &&
                otherRequiredFields.includes(subEl.key)
            ) {
                subEl.isError = true;
                activeName.value = el.code;
                ElMessage.error(MsgType[subEl.type] + subEl.label);
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
                ElMessage.error(MsgType[subEl.type] + subEl.label);
                return false;
            }
            // 如果字段是必填的，且该字段没有值 并且该字段属于邮箱 并且邮箱是开启的
            // 如果是 邮箱SUBMAIL校验字段
            if(
                subEl.required &&
                !confData[subEl.key] &&
                emailSubmailFields.value.includes(subEl.key) && 
                confData.sendType === 0 &&
                confData.emailOpen
            ) {
                subEl.isError = true;
                activeName.value = el.code;
                ElMessage.error(MsgType[subEl.type] + subEl.label);
                return false;
            }
            // 如果是 邮箱SMTP校验字段
            if(
                subEl.required &&
                !confData[subEl.key] &&
                emailSmtpFields.value.includes(subEl.key) && 
                confData.sendType === 1 &&
                confData.emailOpen
            ) {
                subEl.isError = true;
                activeName.value = el.code;
                ElMessage.error(MsgType[subEl.type] + subEl.label);
                return false;
            }
            // 如果是 邮箱的 rules 字段
            if(
                subEl.rules &&
                confData.sendType === 1
            ) {
                if(!subEl.rules(confData, subEl, ElMessage)){
                    return false;
                }
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
                ElMessage.error(MsgType[subEl.type] + subEl.label);
                return false;
            }
            // 如果字段是必填的，且该字段没有值 并且该字段属于钉钉集成
            if (
                subEl.required &&
                !confData[subEl.key] &&
                dingTalkFields.value.includes(subEl.key) &&
                confData.dingTalkOpen
            ) {
                subEl.isError = true;
                activeName.value = el.code;
                ElMessage.error(MsgType[subEl.type] + subEl.label);
                return false;
            }
            // 如果字段是必填的，且该字段没有值 并且该字段属于企业微信集成
            if (
                subEl.required &&
                !confData[subEl.key] &&
                wxWorkFields.value.includes(subEl.key) &&
                confData.wxWorkOpen
            ) {
                subEl.isError = true;
                activeName.value = el.code;
                ElMessage.error(MsgType[subEl.type] + subEl.label);
                return false;
            }
            // 如果字段是必填的，且该字段没有值 并且该字段属于飞书集成
            if (
                subEl.required &&
                !confData[subEl.key] &&
                larkFields.value.includes(subEl.key) &&
                confData.larkOpen
            ) {
                subEl.isError = true;
                activeName.value = el.code;
                ElMessage.error(MsgType[subEl.type] + subEl.label);
                return false;
            }
            // 如果字段是必填的，且该字段没有值 并且该字段属于微信集成
            if (
                subEl.required &&
                !confData[subEl.key] &&
                wxFields.value.includes(subEl.key) &&
                confData.wxMiniAppOpen
            ) {
                subEl.isError = true;
                activeName.value = el.code;
                ElMessage.error(MsgType[subEl.type] + subEl.label);
                return false;
            }
        }
    }
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
    let res = await getDingtalkSyncUser(defaultRole, confData.sendAccountCreatedMessage);
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
    let res = await getWxWorkSyncUser(defaultRole, confData.wxsendAccountCreatedMessage);
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

// 飞书同步
let autoSyncLoading3 = ref(false);
let cutTaskId3 = ref();
let isFinish3 = ref(false);
let errorMessage3 = ref("");

const autoSync3 = async () => {
    autoSyncLoading3.value = true;
    let defaultRole = confData.larkNodeRole[0] ? confData.larkNodeRole[0].id : null;
    let res = await getLarkSyncUser(defaultRole, confData.larksendAccountCreatedMessage);
    if (res && res.data) {
        cutTaskId3.value = res.data;
        getHeavyTaskApi3();
    } else {
        autoSyncLoading3.value = false;
    }
};

const getHeavyTaskApi3 = async () => {
    let taskRes3 = await getHeavyTask(cutTaskId3.value);
    if (taskRes3 && taskRes3.data) {
        isFinish3.value = taskRes3.data.finish;
        errorMessage3.value = taskRes3.data.errorMessage;
        if (!isFinish3.value) {
            setTimeout(() => {
                getHeavyTaskApi3();
            }, 5000);
        }
    } else {
        autoSyncLoading3.value = true;
    }
    if (isFinish3.value) {
        autoSyncLoading3.value = false;
        if (errorMessage3.value) {
            ElMessage.error("同步失败");
        } else {
            ElMessage.success("同步成功");
        }
    }
};


// 数据自动备份
const openAutoBackup = () => {
    return new Promise((resolve) => {
        if(!confData.databaseDumpPath){
            confList.value[0].config[8].isError = true
            ElMessage.error("请填写备份命令地址")
            return resolve(false)
        }
        return resolve(true)
    })
}

// 复制值
const copyValue = (item) => {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(confData[item.key]);
        ElMessage.success("复制成功");
    } else if (document.execCommand) {
        const textarea = document.createElement('textarea');
        textarea.value = confData[item.key];
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        ElMessage.success("复制成功");
    } else {
        ElMessage.warning("您的浏览器不支持自动复制功能，请手动连续双击全选复制。");
    }
};

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
        border-radius: 3px;
        .remove-logo {
            display: none;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 100%;
            position: absolute;
            top: 0;
            left: 0;
            background-color: rgba(0, 0, 0, 0.5);
            color: #fff;
            cursor: default;
            border-radius: 3px;
            .remove-logo-icon {
                cursor: pointer;
            }
        }
        img {
            width: 100%;
            height: 100%;
        }
        &:hover {
            border-color: var(--el-color-primary);
            img {
                opacity: 0.5;
            }
            .remove-logo {
                display: flex;
            }
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
.switch-box {
    display: flex;
    align-items: center;
}
</style>