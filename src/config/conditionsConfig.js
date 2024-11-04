import { forIn } from "lodash";

export default {
    // 所有类型
    op_type: {
        REF: "包含",
        LK: "包含",
        NLK: "不包含",
        IN: "包含",
        NIN: "不包含",
        EQ: "等于",
        DEQ: "等于",
        NEQ: "不等于",
        GT: "大于",
        LT: "小于",
        GE: "大于等于",
        LE: "小于等于",
        BW: "区间",
        NL: "为空",
        NT: "不为空",
        BFD: "..天前",
        BFM: "..月前",
        BFY: "..年前",
        AFD: "..天后",
        AFM: "..月后",
        AFY: "..年后",
        RED: "最近..天",
        REM: "最近..月",
        REY: "最近..年",
        FUD: "未来..天",
        FUM: "未来..月",
        FUY: "未来..年",
        SFU: "本人",
        SFB: "本部门",
        SFD: "本部门及子部门",
        SFT: "所在团队",
        YTA: "昨天",
        TDA: "今天",
        TTA: "明天",
        CUW: "本周",
        CUM: "本月",
        CUQ: "本季度",
        CUY: "本年",
    },
    // 所有字段
    Tag: ["LK", "NLK"],
    Email: ["LK", "NLK", "EQ", "NEQ", "NL", "NT"],
    Url: ["LK", "NLK", "EQ", "NEQ", "NL", "NT"],
    TextArea: ["LK", "NLK", "EQ", "NEQ", "NL", "NT"],
    Text: ["LK", "NLK", "EQ", "NEQ", "NL", "NT"],
    Location: ["LK", "NLK", "NL", "NT"],
    Reference: {
        All: ["EQ", "NEQ", "NL", "NT"],
        referenceFilters: ["Department", "User"],
        Department: ["EQ", "NEQ", "SFB", "SFD", "NL", "NT"],
        User: ["EQ", "NEQ", "NL", "NT", "SFU"],
    },
    Date: ["EQ", "GT", "LT", "BW", "NL", "NT", "BFD", "BFM", "BFY", "AFD", "AFM", "AFY", "RED", "REM", "REY", "FUD", "FUM", "FUY", "YTA", "TDA", "TTA", "CUW", "CUM", "CUQ", "CUY"],
    DateTime: ["DEQ", "GE",  "LE", "BW", "NL","NT", "BFD", "BFM", "BFY", "AFD", "AFM", "AFY", "RED", "REM", "REY", "FUD", "FUM", "FUY", "YTA", "TDA", "TTA", "CUW", "CUM", "CUQ", "CUY"],
    Money: ["EQ", "GT", "LT", "GE", "LE", "BW", "NL", "NT"],
    Integer: ["EQ", "GT", "LT", "GE", "LE", "BW", "NL", "NT"],
    Decimal: ["EQ", "GT", "LT", "GE", "LE", "BW", "NL", "NT"],
    Percent: ["EQ", "GT", "LT", "GE", "LE", "BW", "NL", "NT"],
    Boolean: ["EQ", "NL", "NT"],
    Option: ["EQ", "NEQ", "NL", "NT"],
    Status: ["EQ", "NEQ", "NL", "NT"],
    /**
     * 条件值组件
     */
    comList: {
        // 文本输入框
        textInput: {
            type: ["Email", "Url", "TextArea", "Text", "Location"],
            op: ["LK", "NLK", "EQ", "NEQ"],
        },
        // 日期选择器
        datePicker: {
            type: ["DateTime", "Date"],
            op: ["EQ", "GT", "LT"],
        },
        // 日期区间
        datePickerBw: {
            type: ["DateTime", "Date"],
            op: ["BW"],
        },
        // 数字输入框
        numberInput: {
            type: ["Money", "Integer", "Decimal", "Percent", "Date", "DateTime"],
            op: ["GT", "LT", "EQ", "GE", "LE", "BFD", "BFM", "BFY", "AFD", "AFM", "AFY", "RED", "REM", "REY", "FUD", "FUM", "FUY"],
        },
        // 数字区间
        numberInputBw: {
            type: ["Money", "Integer", "Decimal", "Percent"],
            op: ["BW"],
        },
        // 布尔类型
        booleanSelect: {
            type: ["Boolean"],
            op: ["EQ"],
        },
        // 用户下拉框
        userSelect: {
            type: ["Reference"],
            referTo: ["User"],
            op: ["LK", "NLK"],
        },
        // 部门下拉框
        departmentSelect: {
            type: ["Reference"],
            referTo: ["Department"],
            op: ["LK", "NLK"],
        },
        // option下拉框
        optionData: {
            type: ["Tag", "Option", "Status"],
            op: ["EQ", "NEQ", "LK", "NLK"],
        },
        // 应用类型搜索组件
        referenceSearch: {
            type: ["Reference"],
            referTo: [],
            op: ["EQ", "NEQ"],
        },
    },
    getShowCom: function (item) {
        let { type, op, referTo } = item;
        for (const key in this.comList) {
            if (Object.hasOwnProperty.call(this.comList, key)) {
                const element = this.comList[key];
                if (element.type.includes(type) && element.op.includes(op)) {
                    // 如果不是引用字段
                    if (type != 'Reference') {
                        return key
                    }
                    // 如果是引用字段
                    else {
                        // 判断有没有 referTo 且在不在  组件的 referTo里。
                        if (referTo && element.referTo && element.referTo.includes(referTo)) {
                            return key
                        } else {
                            return "referenceSearch"
                        }
                    }
                }
            }
        }
    },
}