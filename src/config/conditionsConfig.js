
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
        REFD: "包含本部门",
        REFU: "包含本人",
        BTD: "属于",
        REFNL: "为空",
        REFNT: "不为空",
        CASCADER_IN: "包含",
        CASCADER_NIN: "不包含",
    },
    // 所有字段
    Tag: ["LK", "NLK"],
    Email: ["LK", "NLK", "EQ", "NEQ", "NL", "NT"],
    Url: ["LK", "NLK", "EQ", "NEQ", "NL", "NT"],
    TextArea: ["LK", "NLK", "EQ", "NEQ", "NL", "NT"],
    Text: ["LK", "NLK", "EQ", "NEQ", "NL", "NT"],
    // OuterReference: ["LK", "NLK", "EQ", "NEQ", "NL", "NT"],
    OuterReference: ["NL", "NT"],
    Location: ["LK", "NLK", "NL", "NT"],
    AreaSelect: ["LK", "NLK", "NL", "NT"],
    Reference: {
        All: ["EQ", "NEQ", "NL", "NT"],
        referenceFilters: ["Department", "User"],
        Department: ["EQ", "NEQ", "BTD", "SFB", "SFD", "NL", "NT"],
        User: ["EQ", "NEQ", "NL", "NT", "SFU"],
    },
    ReferenceList: {
        All: ["REF", "REFNL", "REFNT" ],
        referenceFilters: ["Department", "User"],
        Department: ["REF","REFNL", "REFNT", "REFD"],
        User: ["REF", "REFNL", "REFNT", "REFU"],
    },
    Date: ["EQ", "GT", "LT", "BW", "NL", "NT", "BFD", "BFM", "BFY", "AFD", "AFM", "AFY", "RED", "REM", "REY", "FUD", "FUM", "FUY", "YTA", "TDA", "TTA", "CUW", "CUM", "CUQ", "CUY"],
    DateTime: ["DEQ", "GE",  "LE", "BW", "NL","NT", "BFD", "BFM", "BFY", "AFD", "AFM", "AFY", "RED", "REM", "REY", "FUD", "FUM", "FUY", "YTA", "TDA", "TTA", "CUW", "CUM", "CUQ", "CUY"],
    Money: ["EQ", "GT", "LT", "GE", "LE", "BW", "NL", "NT"],
    Integer: ["EQ", "GT", "LT", "GE", "LE", "BW", "NL", "NT"],
    Decimal: ["EQ", "GT", "LT", "GE", "LE", "BW", "NL", "NT"],
    Percent: ["EQ", "GT", "LT", "GE", "LE", "BW", "NL", "NT"],
    Boolean: ["EQ", "NL", "NT"],
    Option: ["EQ", "NEQ", "NL", "NT"],
    CodeOption: ["EQ", "NEQ", "NL", "NT"],
    Status: ["EQ", "NEQ", "NL", "NT"],
    File: ["NL", "NT"],
    Picture: ["NL", "NT"],
    Cascader: ["LK", "NLK", "NL", "NT"],
    /**
     * 条件值组件
     */
    comList: {
        // 文本输入框
        textInput: {
            type: ["Email", "Url", "TextArea", "Text", "Location", "AreaSelect", "OuterReference"],
            op: ["LK", "NLK", "EQ", "NEQ"],
        },
        // 日期选择器
        datePicker: {
            type: ["DateTime", "Date"],
            op: ["DEQ", "EQ", "GT", "LT"],
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
        // option下拉框
        optionData: {
            type: ["Tag", "Option", "Status", "CodeOption"],
            op: ["EQ", "NEQ", "LK", "NLK"],
        },
        // 应用类型搜索组件
        referenceSearch: {
            type: ["Reference", "ReferenceList"],
            referTo: [],
            op: ["EQ", "NEQ", "REF", "BTD"],
        },
        // 级联
        cascader: {
            type: ["Cascader"],
            op: ["LK", "NLK"],
        },
    },
    getShowCom: function (item) {
        let { type, op, referTo } = item;
        if(this.comList.numberInput.type.includes(type)) {
            if(item.value == '') {
                item.value = 0;
            }
            if(item.op == 'BW' && item.value2 == '') {
                item.value2 = 0;
            }
        }

        for (const key in this.comList) {
            if (Object.hasOwnProperty.call(this.comList, key)) {
                const element = this.comList[key];
                if (element.type.includes(type) && element.op.includes(op)) {
                    // 如果不是引用字段
                    if (type != 'Reference' && type != 'ReferenceList') {
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