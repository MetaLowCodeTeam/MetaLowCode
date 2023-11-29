export default [
    {
        label: "通用配置",
        code: "common",
        confs: [
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
                type: "uptadeLogo",
                required: true,
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
                label: "版本号",
                key: "dbVersion",
                type: "input",
            },
            {
                label: "页面水印",
                key: "watermark",
                type: "switch",
            },
        ],
    },
    {
        label: "登录页配置",
        code: "loginPage",
        confs: [
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
        ],
    },
    {
        label: "服务集成",
        code: "serviceIntegration",
        confs: [
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
                type: "input",
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
                label: "APPID",
                key: "appId",
                type: "input",
                required: true,
                isError: false,
            },
            {
                label: "APPKEY",
                key: "appKey",
                type: "input",
                required: true,
                isError: false,
            },
            {
                label: "发件人地址",
                key: "from",
                type: "input",
                required: true,
                isError: false,
            },
            {
                label: "发件人名称",
                key: "fromName",
                type: "input",
                required: true,
                isError: false,
            },
            {
                label: "抄送地址",
                key: "cc",
                type: "input",
            },
            {
                label: "启用云存储 (七牛云)",
                key: "cloudStorageOpen",
                type: "switch",
            },
            {
                label: "ACCESSKEY",
                key: "accessKey",
                type: "input",
                required: true,
                isError: false,
            },
            {
                label: "SECRETKEY",
                key: "secretKey",
                type: "input",
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
        confs: [
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
                type: "input",
                required: true,
                isError: false,
            },
            {
                label: "APPSECRET",
                key: "dingTalkAppSecret",
                type: "input",
                required: true,
                isError: false,
            },
        ],
    },

    {
        label: "授权许可",
        code: 'authLicense',
        confs: [
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