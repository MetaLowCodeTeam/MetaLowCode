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
        label: "短信与邮件",
        code: "sms&email",
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
                label: "发件人地址",
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

        ],
    }
]