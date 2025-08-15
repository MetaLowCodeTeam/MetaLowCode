import { passwordRuleOptions } from "@/hooks/usePasswordStrength";
export default [
    {
        label: "通用配置",
        code: "common",
        config: [
            {
                label: "当前版本号",
                key: "webVer",
                type: "text",
            },
            {
                label: "名称",
                key: "appName",
                type: "input",
                required: true,
                isError: false,
            },
            {
                label: "LOGO",
                key: "logo",
                type: "uploadLogo",
                required: true,
                isError: false,
            },
            {
                label: "主页地址/域名",
                key: "homeURL",
                type: "input",
                validation: "url",
                isError: false,
            },
            {
                label: "主色调",
                key: "themeColor",
                type: "picker",
                required: true,
                isError: false,
            },
            {
                label: "主导航菜单位置",
                key: "layoutConfig",
                type: "select",
                options: [
                    { label: "居左", value: "header" },
                    { label: "顶部", value: "dock" },
                ],
            },
            {
                label: "详情页签位置",
                key: "detailTabsPosition",
                type: "select",
                options: [
                    { label: "顶部", value: "top" },
                    { label: "居左", value: "left" },
                ],
            },
            {
                label: "版本号",
                key: "dbVersion",
                type: "input",
            },
            {
                label: "是否开启岗位模块",
                key: "openJobPosition",
                type: "switch",
            },
            {
                label: "外置文件预览服务",
                key: "fileOnlinePreviewPath",
                type: "input",
                subLabel: "系统内置的文件预览仅支持.docx、.xlsx、.pdf、.pptx格式，如果需要预览其他格式文件，需要配置第三方文件预览服务地址。例： http://域名/onlinePreview"
            },
            {
                label: "页面水印",
                key: "watermark",
                type: "switch",
            },
            {
                label: "数据自动备份",
                key: "autoBackup",
                type: "switch",
            },
            {
                label: "备份命令地址",
                key: "databaseDumpPath",
                type: "input",
            },
            {
                label: "备份周期",
                key: "backupCycle",
                required: true,
                type: "numInput",
                suffixText: "天备份一次"
            },
            {
                label: "备份保留时间(天)",
                key: "backupOverdueDay",
                required: true,
                type: "numInput",
            },

        ],
    },
    {
        label: "登录页配置",
        code: "loginPage",
        config: [
            {
                label: "标题",
                key: "appTitle",
                type: "input",
                required: true,
                isError: false,
            },
            {
                label: "子标题",
                key: "appSubtitle",
                type: "input",
            },
            {
                label: "简介",
                key: "appIntro",
                type: "input",
            },
            {
                label: "页脚",
                key: "pageFooter",
                type: "input",
            },
            {
                label: "大图配置(PC)",
                subLabel: "推荐尺寸：640*1080",
                key: "pcLoginPicture",
                type: "uploadLogo",
            },
            {
                label: "大图配置(Mobile)",
                subLabel: "推荐尺寸：750*1400",
                key: "mobileLoginPicture",
                type: "uploadLogo",
            },
            {
                label: "手机号登录",
                key: "mobilePhoneLogin",
                type: "switch",
            },
            {
                label: "账密登录开启图片验证码",
                key: "verificationCodeLogin",
                type: "switch",
            },
            {
                label: "首次登录强制用户修改密码",
                key: "forcefullyChangingPassword",
                type: "switch",
            },
            {
                label: "密码强度等级",
                key: "userPasswordRuleLevel",
                type: "select",
                selectWidth: "360px",
                placeholder: "请选择密码强度等级",
                options: passwordRuleOptions,
                show: (confData) => confData.forcefullyChangingPassword,
            },
            {
                label: "会话指纹验证",
                key: "sessionFingerprintCheck",
                type: "switch",
            },
            {
                label: "禁止账号多开",
                subLabel: "禁止账号多开后同一账号不能多地同时登录使用。",
                key: "singleLoginSwitch",
                type: "switch",
            },
        ],
    },
    {
        label: "服务集成",
        code: "serviceIntegration",
        config: [
            {
                label: "启用短信服务 (SUBMAIL)",
                key: "smsOpen",
                type: "switch",
            },
            {
                label: "APPID",
                key: "smsappId",
                type: "input",
                required: true,
                isError: false,
            },
            {
                label: "APPKEY",
                key: "smsappKey",
                type: "passwordInput",
                required: true,
                isError: false,
            },
            {
                label: "短信签名",
                key: "smssignature",
                type: "input",
                required: true,
                isError: false,
            },
            {
                label: "启用邮件服务 (SUBMAIL/SMTP)",
                key: "emailOpen",
                type: "switch",
            },
            {
                label: "服务器类型",
                key: "sendType",
                type: "radio",
                options: [
                    { label: "SUBMAIL", value: 0 },
                    { label: "SMTP", value: 1 },
                ],
            },
            {
                label: "APPID",
                key: "appId",
                type: "input",
                required: true,
                isError: false,
                show: (confData) => confData.sendType === 0
            },
            {
                label: "APPKEY",
                key: "appKey",
                type: "passwordInput",
                required: true,
                isError: false,
                show: (confData) => confData.sendType === 0
            },
            {
                label: "发件人地址",
                key: "from",
                type: "input",
                required: true,
                isError: false,
                show: (confData) => confData.sendType === 0
            },
            {
                label: "发件人名称",
                key: "fromName",
                type: "input",
                required: true,
                isError: false,
                show: (confData) => confData.sendType === 0
            },
            {
                label: "抄送地址",
                key: "cc",
                type: "input",
                show: (confData) => confData.sendType === 0
            },
            {
                label: "邮箱发送账号",
                key: "smtpUsername",
                type: "input",
                required: true,
                isError: false,
                show: (confData) => confData.sendType === 1
            },
            {
                label: "发送账号密码",
                key: "smtpPassword",
                type: "passwordInput",
                required: true,
                isError: false,
                show: (confData) => confData.sendType === 1
            },
            {
                label: "SMTP服务器",
                key: "smtpHost",
                type: "input",
                required: true,
                isError: false,
                show: (confData) => confData.sendType === 1
            },
            {
                label: "SMTP端口",
                key: "smtpPort",
                type: "input",
                required: true,
                isError: false,
                show: (confData) => confData.sendType === 1,
                maxLength: 5,
                rules: (confData, item, ElMessage) => {
                    let reg = /^[0-9]*$/;
                    if(!reg.test(confData.smtpPort)) {
                        item.isError = true;
                        ElMessage.error('SMTP端口：请输入0-65535的数字');
                        return false;
                    }
                    if (confData[item.key] <= 0 || confData[item.key] > 65535) {
                        item.isError = true;
                        ElMessage.error('SMTP端口：请输入0-65535的数字');
                        return false;
                    }
                    return true;
                }
            },
            {
                label: "SSL",
                key: "smtpUseSSL",
                type: "checkbox",
                show: (confData) => confData.sendType === 1,
                onChange: (confData) => {
                    if(confData.smtpUseSSL) {
                        confData.smtpUseSTARTTLS = false;
                    }
                }
            },
            {
                label: "STARTTLS加密传输",
                checkBoxLabel: "如果服务器支持，就使用STARTTLS加密传输",
                key: "smtpUseSTARTTLS",
                type: "checkbox",
                show: (confData) => confData.sendType === 1,
                onChange: (confData) => {
                    if(confData.smtpUseSTARTTLS) {
                        confData.smtpUseSSL = false;
                    }
                }
            },
            {
                label: "启用云存储 (七牛云)",
                key: "cloudStorageOpen",
                type: "switch",
            },
            {
                label: "ACCESSKEY",
                key: "accessKey",
                type: "passwordInput",
                required: true,
                isError: false,
            },
            {
                label: "SECRETKEY",
                key: "secretKey",
                type: "passwordInput",
                required: true,
                isError: false,
            },
            {
                label: "存储空间",
                subLabel: "存储空间变更需你自行迁移原有数据",
                key: "bucket",
                type: "input",
                required: true,
                isError: false,
            },
            {
                label: "访问域名",
                key: "host",
                type: "input",
                required: true,
                isError: false,
            },
        ],
    },
    {
        label: "钉钉集成",
        code: "dingTalkIntegration",
        config: [
            {
                label: "启用钉钉服务",
                key: "dingTalkOpen",
                type: "switch",
            },
            {
                label: "AGENTID",
                key: "dingTalkAgentId",
                type: "input",
                required: true,
                isError: false,
            },
            {
                label: "APPKEY",
                key: "dingTalkAppKey",
                type: "passwordInput",
                required: true,
                isError: false,
            },
            {
                label: "APPSECRET",
                key: "dingTalkAppSecret",
                type: "passwordInput",
                required: true,
                isError: false,
            },
            {
                label: "应用首页地址",
                subLabel: "请复制地址至钉钉相关配置",
                key: "homeDir",
                type: "input",
                disabled: true,
                needCopy: true,
            },
            {
                label: "回调域名",
                subLabel: "请复制地址至钉钉相关配置",
                key: "homeURL",
                type: "input",
                disabled: true,
                needCopy: true,
            },
            {
                label: "用户默认角色",
                key: "nodeRole",
                type: "mlSelectUser",
            },
            {
                label: "自动同步部门用户",
                key: "nodeDep",
                type: "autoSync",
            },
        ],
    },
    {
        label: "企业微信集成",
        code: "wxWorkIntegration",
        config: [
            {
                label: "启用企业微信服务",
                key: "wxWorkOpen",
                type: "switch",
            },
            {
                label: "企业微信id",
                key: "wxWorkCorpId",
                type: "input",
                required: true,
                isError: false,
            },
            {
                label: "企业微信应用id",
                key: "wxWorkAgentId",
                type: "input",
                required: true,
                isError: false,
            },
            {
                label: "企业微信应用密钥",
                key: "wxWorkCorpSecret",
                type: "passwordInput",
                required: true,
                isError: false,
            },
            {
                label: "应用首页地址",
                subLabel: "请复制地址至企业微信相关配置",
                key: "wxWorkHomeDir",
                type: "input",
                disabled: true,
                needCopy: true,
            },
            {
                label: "回调域名",
                subLabel: "请复制地址至企业微信相关配置",
                key: "homeURL",
                type: "input",
                disabled: true,
                needCopy: true,
            },
            {
                label: "用户默认角色",
                key: "wxWorkNodeRole",
                type: "mlSelectUser",
            },
            {
                label: "自动同步企业微信组织架构",
                key: "nodeDep2",
                type: "autoSync2",
            },
        ],
    },
    {
        label: "飞书集成",
        code: "larkIntegration",
        config: [
            {
                label: "启用飞书服务",
                key: "larkOpen",
                type: "switch",
            },
            {
                label: "APPID",
                key: "larkappId",
                type: "input",
                required: true,
                isError: false,
            },
            {
                label: "APPSECRET",
                key: "larkappSecret",
                type: "passwordInput",
                required: true,
                isError: false,
            },
            {
                label: "应用首页地址",
                subLabel: "请复制地址至飞书相关配置",
                key: "larkHomeDir",
                type: "input",
                disabled: true,
                needCopy: true,
            },
            {
                label: "回调域名",
                subLabel: "请复制地址至飞书相关配置",
                key: "larkHomeURL",
                type: "input",
                disabled: true,
                needCopy: true,
            },
            {
                label: "用户默认角色",
                key: "larkNodeRole",
                type: "mlSelectUser",
            },
            {
                label: "自动同步飞书组织架构",
                key: "nodeDep3",
                type: "autoSync3",
            },
        ]
    },
    {
        label: "微信集成",
        code: "wxIntegration",
        config: [
            {
                label: "启用小程序登录",
                key: "wxMiniAppOpen",
                type: "switch",
            },
            {
                label: "AppId(小程序ID)",
                key: "wxMiniAppappId",
                type: "input",
                required: true,
                isError: false,
            },
            {
                label: "AppSecret(小程序密钥)",
                key: "wxMiniAppappSecret",
                type: "passwordInput",
                required: true,
                isError: false,
            },
        ],
    },
    {
        label: "移动端样式配置",
        code: "mobileStyleConfig",
        config: [
            {
                label: "列表展示样式",
                key: "mobileTableStyleType",
                type: "select",
                selectWidth: "200px",
                placeholder: "请选择列表展示样式",
                options: [
                    { label: "列表", value: "list" },
                    { label: "卡片", value: "card" },
                ],

            },
            {
                label: "列表是否显示操作按钮",
                key: "mobileTableButtonIsShow",
                type: "switch",
                subLabel: "如果不显示操作按钮，点击内容区域则跳转详情页",
            },
            {
                label: "工作台展示样式",
                key: "mobileStagingStyleType",
                type: "select",
                selectWidth: "200px",
                placeholder: "请选择工作台展示样式",
                options: [
                    { label: "长方块图标样式", value: "pane" },
                    { label: "圆角图标样式", value: "round" },
                ],
            },
            {
                label: "工作台图标底色",
                key: "mobileStagingIconBgc",
                type: "picker",
            },
        ],
    },
    {
        label: "授权许可",
        code: 'authLicense',
        config: [
            {
                label: "公司名称",
                key: "companyName",
                keyFrom: "licenseInfo",
                type: 'text'
            },
            {
                label: "账号",
                key: "account",
                keyFrom: "licenseInfo",
                type: 'text'
            },
            {
                label: "实体数量",
                key: "entityLimit",
                keyFrom: "licenseInfo",
                type: 'text'
            },
            {
                label: "产品类型",
                key: "productType",
                keyFrom: "licenseInfo",
                type: 'text'
            },
            {
                label: "设备号",
                key: "deviceNo",
                keyFrom: "licenseInfo",
                type: 'text'
            },
        ],
    },
]
