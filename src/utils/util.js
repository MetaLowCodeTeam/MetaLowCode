import dayjs from "dayjs";
import 'dayjs/locale/zh-cn';
import calenderPlugin from 'dayjs/plugin/calendar';
import updateLocale from 'dayjs/plugin/updateLocale';
import relativeTime from 'dayjs/plugin/relativeTime'
import { pinyin } from 'pinyin-pro'
import JSEncrypt from 'jsencrypt';
import http from "@/utils/request";
import { RuleFunctions } from "@/utils/ruleFunctions";
import { ElMessage } from 'element-plus';

// 注册插件
dayjs.extend(updateLocale);
dayjs.extend(calenderPlugin);
dayjs.extend(relativeTime);

// 修改语言配置
dayjs.updateLocale('zh-cn', {
    // A : 上午/下午/晚上 , dddd: 星期
    calendar: {
        lastDay: '[昨天] A h:mm',
        sameDay: '[今天] A h:mm',
        nextDay: '[明天] A h:mm',
        lastWeek: 'A h:mm [上]',
        nextWeek: 'A h:mm [下]',
        sameElse: 'A h:mm',
    },
});

dayjs.locale('zh-cn');
// dayjs().calendar(null,{
//     sameDay: '[今天]LT',
//     nextDay: '[明天]LT',
//     nextWeek: '[下]ddddLT',
//     lastDay: '[昨天]LT',
//     lastWeek: '[上]ddddLT',
//     sameElse: 'L'
// })

// moment.locale('zh-cn', {
//     months: '一月_二月_三月_四月_五月_六月_七月_八月_九月_十月_十一月_十二月'.split('_'),
//     monthsShort: '1月_2月_3月_4月_5月_6月_7月_8月_9月_10月_11月_12月'.split('_'),
//     weekdays: '星期日_星期一_星期二_星期三_星期四_星期五_星期六'.split('_'),
//     weekdaysShort: '周日_周一_周二_周三_周四_周五_周六'.split('_'),
//     weekdaysMin: '日_一_二_三_四_五_六'.split('_'),
//     longDateFormat: {
//         LT: 'HH:mm',
//         LTS: 'HH:mm:ss',
//         L: 'YYYY-MM-DD',
//         LL: 'YYYY年MM月DD日',
//         LLL: 'YYYY年MM月DD日Ah点mm分',
//         LLLL: 'YYYY年MM月DD日ddddAh点mm分',
//         l: 'YYYY-M-D',
//         ll: 'YYYY年M月D日',
//         lll: 'YYYY年M月D日 HH:mm',
//         llll: 'YYYY年M月D日dddd HH:mm'
//     },
//     meridiemParse: /凌晨|早上|上午|中午|下午|晚上/,
//     meridiemHour: function (hour, meridiem) {
//         if (hour === 12) {
//             hour = 0;
//         }
//         if (meridiem === '凌晨' || meridiem === '早上' ||
//             meridiem === '上午') {
//             return hour;
//         } else if (meridiem === '下午' || meridiem === '晚上') {
//             return hour + 12;
//         } else {
//             // '中午'
//             return hour >= 11 ? hour : hour + 12;
//         }
//     },
//     meridiem: function (hour, minute, isLower) {
//         const hm = hour * 100 + minute;
//         if (hm < 600) {
//             return '凌晨';
//         } else if (hm < 900) {
//             return '早上';
//         } else if (hm < 1130) {
//             return '上午';
//         } else if (hm < 1230) {
//             return '中午';
//         } else if (hm < 1800) {
//             return '下午';
//         } else {
//             return '晚上';
//         }
//     },
//     calendar: {
//         sameDay: '[今天]LT',
//         nextDay: '[明天]LT',
//         nextWeek: '[下]ddddLT',
//         lastDay: '[昨天]LT',
//         lastWeek: '[上]ddddLT',
//         sameElse: 'L'
//     },
//     dayOfMonthOrdinalParse: /\d{1,2}(日|月|周)/,
//     ordinal: function (number, period) {
//         switch (period) {
//             case 'd':
//             case 'D':
//             case 'DDD':
//                 return number + '日';
//             case 'M':
//                 return number + '月';
//             case 'w':
//             case 'W':
//                 return number + '周';
//             default:
//                 return number;
//         }
//     },
//     relativeTime: {
//         future: '%s内',
//         past: '%s前',
//         s: '几秒',
//         ss: '%d秒',
//         m: '1分钟',
//         mm: '%d分钟',
//         h: '1小时',
//         hh: '%d小时',
//         d: '1天',
//         dd: '%d天',
//         M: '1个月',
//         MM: '%d个月',
//         y: '1年',
//         yy: '%d年'
//     },
//     week: {
//         // GB/T 7408-1994《数据元和交换格式·信息交换·日期和时间表示法》与ISO 8601:1988等效
//         dow: 1, // Monday is the first day of the week.
//         doy: 4  // The week that contains Jan 4th is the first week of the year.
//     }
// })


/**
 * 用Function对象实现eval函数功能
 * @param fn 函数体代码
 * @param DSV DSV变量
 * @returns {*}
 */
export const evalFn = function (fn, DSV = null) {
    let f = new Function('DSV', 'return ' + fn);
    return f(DSV);
};

export const evalFormRule = function (fn, formModel, DSV = null) {
	let f = new Function('formModel', 'DSV', 'RF', 'return ' + fn);
	return f(formModel, DSV, RuleFunctions);
};

export const generateId = function () {
    return Math.floor(Math.random() * 10000 + Math.random() * 5000);
};

export const copyObj = function (obj1, obj2) {  /* 浅拷贝对象属性 */
    for (let prop in obj1) {
        if (obj1.hasOwnProperty(prop)) {
            obj1[prop] = obj2[prop]
        }
    }
}

export function copyNew(oldObj) {  /* 深拷贝对象属性 */
    return JSON.parse(JSON.stringify(oldObj))
}

export const overwriteObj = function (obj1, obj2) {  /* 浅拷贝对象属性，obj2覆盖obj1 */
    for (let prop in obj2) {
        if (obj2.hasOwnProperty(prop)) {
            obj1[prop] = obj2[prop]
        }
    }
}

export function formatRefColumn(row, column, cellValue, index) {
    let columnName = column.property
    if (!!row[columnName] && (!!(row[columnName].name))) {
        //TODO: 是否需要添加超链接？？
        return row[columnName].name
    } else {
        return ""
    }
}

export function formatRefListColumn(row, column, cellValue, index) {
    let columnName = column.property
    if (!!row[columnName] && (row[columnName].length > 0)) {
        let columnValue = ''
        row[columnName].forEach(idName => {
            cellValue += idName.name + ', '
        })
        return columnValue
    } else {
        return ""
    }
}

export function formatOptionColumn(row, column, cellValue, index) {
    let columnName = column.property
    if (!!row[columnName] && (!!(row[columnName].label))) {
        return row[columnName].label
    } else {
        return ""
    }
}

/*
export function formatTagColumn(row, column, cellValue, index) {
  //格式化显示tag标记
  //console.log(row[column.property])
  return row[column.property]
}
*/

export function formatPercentColumn(row, column, cellValue, index) {
    //格式化显示Percent字段
    let columnName = column.property
    if (!!row[columnName]) {
        return row[columnName] + '%'
    } else {
        return ""
    }
}

export function formatBooleanColumn(row, column, cellValue, index) {
    return !!cellValue ? '是' : '-' /* TODO: 需要考虑null值的显示 */
}

export function setColumnFormatter(columnObj) {
    if (columnObj.type === 'Reference') {
        columnObj.formatter = formatRefColumn
    } else if (columnObj.type === 'ReferenceList') {
        columnObj.formatter = formatRefListColumn
    } else if (columnObj.type === 'Option' || columnObj.type === 'CodeOption') {
        columnObj.formatter = formatOptionColumn
    } /*else if (columnObj.type === 'Tag') {
    columnObj.formatter = formatTagColumn
  } */else if (columnObj.type === 'Percent') {
        columnObj.formatter = formatPercentColumn
    } else if (columnObj.type === 'Boolean') {
        columnObj.formatter = formatBooleanColumn
    }
}

export function isDefinedNull(value) {
    return (value !== undefined) && (value === null);
}

export function isNull(value) {
    return (value === null) || (value === undefined);
}

export function isNotNull(value) {
    return (value !== null) && (value !== undefined);
}

export function isEmptyStr(str) {
    //return (str === undefined) || (!str) || (!/[^\s]/.test(str));
    return (str === undefined) || (!str && (str !== 0) && (str !== '0')) || (!/[^\s]/.test(str));
}

export function uniqueArray(arr) {  //数组去重
    let obj = {};
    return arr.filter(function (item, index, arr) {
        return obj.hasOwnProperty(typeof item + item) ? false : (obj[typeof item + item] = true)
    })
}

export function testUniqueArray() {
    let arr = [1, 1, 'true', 'true', true, true, 15, 15, false, false, undefined, undefined, null, null, NaN, NaN, 'NaN', 0, 0, 'a', 'a', {}, {}];
    console.log(uniqueArray(arr))
}

export function arrayContain(array, obj) {
    for (let i = 0; i < array.length; i++) {
        if (array[i] === obj)
            return true;
    }
    return false;
}

export function strArrayToStr(array, separator) {
    if (!array || (array.length <= 0)) {
        return ''
    }

    let result = ''
    array.forEach((item, idx) => {
        result += (idx === array.length - 1) ? item : item + separator
    })
    return result
}

export const deepClone = function (origin) {
    if (origin === undefined) {
        return undefined
    }

    return JSON.parse(JSON.stringify(origin))
}

/**
 *
 * 更好的时间提示
 *
 */
export const $moment = function (date) {

    return dayjs(date.trim())
}

export const $fromNow = function (date, isRelativeTime = false) {
    if (!date) {
        return '暂无时间'
    }
    const m = $moment(date)
    // return Math.abs(dayjs().diff(m)) < 6000 ? '刚刚' : m.fromNow()
    // return Math.abs(dayjs().diff(m)) < 6000 ? '刚刚' : m.format('YYYY-MM-DD')
    return Math.abs(dayjs().diff(m)) < 6000 ? '刚刚' : isRelativeTime ? dayjs(date).fromNow() : dayjs(date).format('YYYY-MM-DD HH:mm:ss')
    //     sameDay: '[今天]LT',
    //     nextDay: '[明天]LT',
    //     nextWeek: '[下]ddddLT',
    //     lastDay: '[昨天]LT',
    //     lastWeek: '[上]ddddLT',
    // sameElse: 'L'
}

/**
 * 首字母大写
 * @param inStr
 * @returns {*|string}
 */
export const upperFirstLetter = (inStr) => {
    if (!inStr) {
        return ''
    }

    return inStr.slice(0, 1).toUpperCase() + inStr.slice(1)
}

/**
 * 获取汉字拼音字母
 * @param chStr
 * @returns {string}
 */
export const getSimplePinYin = (chStr) => {
    return pinyin(chStr, { toneType: 'none' }).replaceAll(' ', '').replaceAll('ü', 'v')
}


/**
 *
 * @param {*} showDecimalPlaces 是否开启小数位
 * @param {*} decimalPlaces 小数位是几
 * @param {*} thousandsSeparator 是否开启千分符
 * @param {*} val 值
 * @returns
 */
export const getPreviewNum = (showDecimalPlaces, decimalPlaces, thousandsSeparator, val) => {
    let previewStr = val;
    if (showDecimalPlaces) {
        previewStr = Number(previewStr).toFixed(decimalPlaces);
    }
    if (thousandsSeparator) {
        previewStr = numberToCurrencyNo(previewStr);
    }
    return previewStr;
};

const numberToCurrencyNo = (value) => {
    if (!value) return 0;
    // 获取整数部分
    const intPart = Math.trunc(value);
    // 整数部分处理，增加,
    const intPartFormat = intPart
        .toString()
        .replace(/(\d)(?=(?:\d{3})+$)/g, "$1,");
    // 预定义小数部分
    let floatPart = "";
    // 将数值截取为小数部分和整数部分
    const valueArray = value.toString().split(".");
    if (valueArray.length === 2) {
        // 有小数部分
        floatPart = valueArray[1].toString(); // 取得小数部分
        return intPartFormat + "." + floatPart;
    }
    return intPartFormat + floatPart;
};



/**
 * 快捷键
 * Windows系统快捷键：
 * Shift + Alt + M + L
 *
 * Mac系统 快捷键：
 * Shift + Option + M + L
 */
export const mlShortcutkeys = (callback) => {
    let shiftKeyFlag = false;
    let altOrOptionKeyFlag = false;
    let mKeyFlag = false;
    let lKeyFlag = false;

    // 检测是否是 Mac 系统
    const isMac = /Mac|iPod|iPhone|iPad/.test(navigator.platform);
    const handleKeyDown = (e) => {
        const { key, keyCode, shiftKey, altKey, metaKey } = e;

        // 更新按键状态
        if (key === "Shift" || keyCode === 16) shiftKeyFlag = true;
        if (isMac ? (key === "Option" || keyCode === 18) : (key === "Alt" || keyCode === 18)) {
            altOrOptionKeyFlag = true;
        }
        if (key.toLowerCase() === "m") mKeyFlag = true;
        if (key.toLowerCase() === "l") lKeyFlag = true;
        // 检查是否满足快捷键组合
        const isShortcutPressed = shiftKeyFlag && altOrOptionKeyFlag && mKeyFlag && lKeyFlag;
        if (isShortcutPressed) {
            e.preventDefault(); // 阻止默认行为（如 Mac 的 Option+M 可能触发特殊字符）
            callback();
        }
    };

    const handleKeyUp = (e) => {
        const { key, keyCode } = e;

        // 重置按键状态
        if (key === "Shift" || keyCode === 16) shiftKeyFlag = false;
        if (isMac ? (key === "Option" || keyCode === 18) : (key === "Alt" || keyCode === 18)) {
            altOrOptionKeyFlag = false;
        }
        if (key.toLowerCase() === "m") mKeyFlag = false;
        if (key.toLowerCase() === "l") lKeyFlag = false;
    };

    // 添加事件监听
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);

    // 返回清理函数（用于组件卸载时移除监听）
    return () => {
        document.removeEventListener("keydown", handleKeyDown);
        document.removeEventListener("keyup", handleKeyUp);
    };
};
/**
 * 高级筛选条件排查
 */

// 不需要输入框的条件
const op_no_value = [
    "NL",
    "NT",
    "SFU",
    "SFB",
    "SFD",
    "YTA",
    "TDA",
    "TTA",
    "CUW",
    "CUM",
    "CUQ",
    "CUY",
];
// 检测条件值
export const checkConditionList = (data) => {
    let flag = true;
    if (data.length > 0) {
        data.forEach((el) => {
            if (
                !el.value &&
                el.value !== 0 &&
                !op_no_value.includes(el.op)
            ) {
                flag = false;
                el.isError = true;
            }
            // 区间
            if (el.op === "BW" && (!el.value || !el.value2)) {
                flag = false;
                el.isError = true;
            }
        });
        if (!flag) {
            return false;
        }
    }
    return flag;
}

// 是否区分顶部导航和左侧导航 默认false 不区分
// PS：此设置只对自定义相关列表生效，默认实体无效，默认实体没有 modelName 这个概念，所以默认是不区分的
// 区分 意味着你左侧导航和顶部导航的modelName 不一样 会导致左侧导航和顶部导航的配置不一致
// 不区分 则相反，无论你在左侧或者顶部导航修改相关配置，都会同步
let isDistinguishTopNav = false;

// 获取配置ModelName
export const getModelName = (paramEntityName) => {
    let modelName = null;
    let pathname = location.pathname;
    // --- 新增逻辑开始 ---
    // 1. 优先检查 URL 中是否有 modelName 查询参数
    const urlParams = new URLSearchParams(location.search);
    const urlModelName = urlParams.get('modelName');
    if (urlModelName) {
        return urlModelName; // 如果存在，直接返回这个值
    }
    if (pathname.indexOf('/custom-page/') !== -1) {
        let splitPathname = pathname.split("/");

        let checkGuid = splitPathname[splitPathname.length - 1];
        if(hasGuid(checkGuid) && !isDistinguishTopNav) {
            splitPathname.splice(splitPathname.length - 1, 1)
        }
        // 如果url的实体不是当前的实体，则返回空
        if(paramEntityName && splitPathname[splitPathname.length - 1] != paramEntityName){
            return "";
        }

        let newSplitName = [];
        splitPathname.forEach((item, inx) => {
            if (inx > 2) {
                newSplitName.push(item)
            }
        })
        modelName = newSplitName.join("-")
    }
    return modelName;
}

// 格式化modelName
export const formatModelName = (modelName, tabModelName) => {
    if(tabModelName && tabModelName != 'default'){
        return modelName + '_' + tabModelName;
    }
    return modelName;
}

// 判断是否是 GUID
const hasGuid = (str) => {
    const guidPattern = /^[0-9a-f]{12}4[0-9a-f]{3}[89ab][0-9a-f]{15}$/;
    return guidPattern.test(str);
};


// 格式化文件大小
export const formatFileSize = (bytes) => {
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${Math.round(bytes / Math.pow(1024, i), 2)} ${sizes[i]}`;
}

// 格式化 sessionId重定向
export const formatOutLink = (meta) => {
    let { outLink, redirectCarrySessionId } = meta;
    if (redirectCarrySessionId) {
        return import.meta.env.VITE_APP_BASE_API + "/open/redirectCarrySessionId?url=" + encodeURIComponent(outLink)
    } else {
        return outLink
    }
}



export const downloadBase64 = async (base64, fileName) => {
	let blob = base64ToBlob(base64);
	let downloadElement = document.createElement("a");
	let href = window.URL.createObjectURL(blob);
	downloadElement.href = href;
	downloadElement.download = fileName;
	document.body.appendChild(downloadElement);
	downloadElement.click();
    // 清理创建的 URL 对象
	URL.revokeObjectURL(href);
};

const base64ToBlob = (base64) => {
	let baseContent = base64;
	let mime = baseContent.match(/:(.*?);/); //获取分割后的base64前缀中的类型
	let bstr = window.atob(baseContent);
	let n = bstr.length;
	let u8arr = new Uint8Array(n);
	while (n--) {
		u8arr[n] = bstr.charCodeAt(n);
	}
	return new Blob([u8arr], { type: mime });
};
// 表单DSV默认配置
export const globalDsvDefaultData = () => {
    let data = {
        uploadServer: import.meta.env.VITE_APP_BASE_API,
        baseApi: import.meta.env.VITE_APP_BASE_API,
        SERVER_API: import.meta.env.VITE_APP_BASE_API,
        APP_PATH: import.meta.env.VITE_APP_PATH,

		/* 根据ID值回填表单字段 */
		findByIdThenFill: (idFieldWidget, idValue, fieldMapping) => {
			if (!idFieldWidget.getValue() || !idFieldWidget.getValue().id) {
				return
			}

			let recordId = idFieldWidget.getValue().id
			let queryUrl = import.meta.env.VITE_APP_BASE_API + '/crud/queryById?entityId=' + recordId
			http.post(queryUrl).then(res => {
				const foundRecord = res.data.data
				Object.keys(fieldMapping).forEach(fieldKey => {
					if (foundRecord.hasOwnProperty(fieldKey)) {
						const targetWidgetRef = idFieldWidget.getWidgetRef(fieldMapping[fieldKey])
						if (targetWidgetRef) {
							targetWidgetRef.setValue(foundRecord[fieldKey])
						}
					}
				})
			})
		},
    }
    return JSON.parse(JSON.stringify(data))
}

// 加密
export const encrypt = async (password) => {
    const res = await http.get('/user/getPublicKey');
    if (res && res.code == 200) {
        const encrypt = new JSEncrypt()
        let param = {
            password: password,
            loginToken: res.data.loginToken
        }
        encrypt.setPublicKey(res.data.publicKey)
        return encrypt.encrypt(JSON.stringify(param))
    };
}

// 提取公共方法用于格式化带有点号的字段
export const formatFormVirtualField = (data) => {
    let newData = JSON.parse(JSON.stringify(data));
    for (let key in newData) {
        if (key.includes('.')) {
            let newKey = key.replace('.', '##');
            newData[newKey] = newData[key];
            delete newData[key];
        } else if (Array.isArray(newData[key])) {
            newData[key].forEach((item) => {
                if (typeof item === 'object') {
                    for (let objKey in item) {
                        if (objKey.includes('.')) {
                            let newObjKey = objKey.replace('.', '##');
                            item[newObjKey] = item[objKey];
                            delete item[objKey];
                        }
                    }
                }
            });
        }
    }
    return newData;
}


// 格式化queryById入参数
export const formatQueryByIdParam = (formFieldSchema) => {
    let queryDetailList = [];
    let fieldNames = "";
    for (let key in formFieldSchema) {
        if (key == 'main') {
            fieldNames = formFieldSchema[key].join(',').replace(/\#\#/g, '.');
        } else {
            queryDetailList.push({
                entityName: key,
                queryFields: formFieldSchema[key].join(',').replace(/\#\#/g, '.'),
            })
        }
    }
    return { queryDetailList, fieldNames }
}


// 检测审批相关前置事件
export const checkApprovalPreEvent = (preEvent, vFormRef, elMessage) => {
    // 如果没有前置事件 直接返回 通过
    if(!preEvent){
        return true;
    }
    let newFunc = new Function('data','vFormRef', 'ElMessage', preEvent)(vFormRef.getFormData(false), vFormRef, elMessage);
    return newFunc;
}

// 检测是否子表单
export const checkIsSubForm = (type) => {
    return type == "sub-form" || type == "grid-sub-form" || type == "table-sub-form";
}

// 复制文本
export const copyText = (text, errorMsg = "复制失败，请重试刷新页面") => {
    let textarea = document.createElement("textarea");
    textarea.readOnly = "readonly";
    textarea.style.position = "absolute";
    textarea.style.left = "-9999px";
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    textarea.setSelectionRange(0, textarea.value.length);
    const result = document.execCommand("Copy");
    if (result) {
        ElMessage.success("复制成功");
    }else {
        ElMessage.error(errorMsg);
    }
    document.body.removeChild(textarea);
}


// 格式化过滤条件转base64
export const formatFilterToBase64 = (filter) => {
    if(!filter) {
        return filter;
    }
    let newFilter = JSON.parse(JSON.stringify(filter));
    if(newFilter && newFilter.items && newFilter.items.length > 0) {
        newFilter.items.forEach(item => {
            if(item.op == 'SQL') {
                item.value = unicodeToBase64(item.value);
            }
        })
    }
    return newFilter
}

// 字符串转base64
export const unicodeToBase64 = (str) => {
    return btoa(
        encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) => {
            return String.fromCharCode('0x' + p1);
        })
    );
}

// 获取Guid
export const getGuid = () => {
    return "xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx".replace(/[xy]/g, function (c) {
        var r = (Math.random() * 16) | 0, v = c == "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}
