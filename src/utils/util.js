import moment from 'moment'
import { pinyin } from 'pinyin-pro'

moment.locale('zh-cn', {
    months: '一月_二月_三月_四月_五月_六月_七月_八月_九月_十月_十一月_十二月'.split('_'),
    monthsShort: '1月_2月_3月_4月_5月_6月_7月_8月_9月_10月_11月_12月'.split('_'),
    weekdays: '星期日_星期一_星期二_星期三_星期四_星期五_星期六'.split('_'),
    weekdaysShort: '周日_周一_周二_周三_周四_周五_周六'.split('_'),
    weekdaysMin: '日_一_二_三_四_五_六'.split('_'),
    longDateFormat: {
        LT: 'HH:mm',
        LTS: 'HH:mm:ss',
        L: 'YYYY-MM-DD',
        LL: 'YYYY年MM月DD日',
        LLL: 'YYYY年MM月DD日Ah点mm分',
        LLLL: 'YYYY年MM月DD日ddddAh点mm分',
        l: 'YYYY-M-D',
        ll: 'YYYY年M月D日',
        lll: 'YYYY年M月D日 HH:mm',
        llll: 'YYYY年M月D日dddd HH:mm'
    },
    meridiemParse: /凌晨|早上|上午|中午|下午|晚上/,
    meridiemHour: function (hour, meridiem) {
        if (hour === 12) {
            hour = 0;
        }
        if (meridiem === '凌晨' || meridiem === '早上' ||
            meridiem === '上午') {
            return hour;
        } else if (meridiem === '下午' || meridiem === '晚上') {
            return hour + 12;
        } else {
            // '中午'
            return hour >= 11 ? hour : hour + 12;
        }
    },
    meridiem: function (hour, minute, isLower) {
        const hm = hour * 100 + minute;
        if (hm < 600) {
            return '凌晨';
        } else if (hm < 900) {
            return '早上';
        } else if (hm < 1130) {
            return '上午';
        } else if (hm < 1230) {
            return '中午';
        } else if (hm < 1800) {
            return '下午';
        } else {
            return '晚上';
        }
    },
    calendar: {
        sameDay: '[今天]LT',
        nextDay: '[明天]LT',
        nextWeek: '[下]ddddLT',
        lastDay: '[昨天]LT',
        lastWeek: '[上]ddddLT',
        sameElse: 'L'
    },
    dayOfMonthOrdinalParse: /\d{1,2}(日|月|周)/,
    ordinal: function (number, period) {
        switch (period) {
            case 'd':
            case 'D':
            case 'DDD':
                return number + '日';
            case 'M':
                return number + '月';
            case 'w':
            case 'W':
                return number + '周';
            default:
                return number;
        }
    },
    relativeTime: {
        future: '%s内',
        past: '%s前',
        s: '几秒',
        ss: '%d秒',
        m: '1分钟',
        mm: '%d分钟',
        h: '1小时',
        hh: '%d小时',
        d: '1天',
        dd: '%d天',
        M: '1个月',
        MM: '%d个月',
        y: '1年',
        yy: '%d年'
    },
    week: {
        // GB/T 7408-1994《数据元和交换格式·信息交换·日期和时间表示法》与ISO 8601:1988等效
        dow: 1, // Monday is the first day of the week.
        doy: 4  // The week that contains Jan 4th is the first week of the year.
    }
})
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
    if (!!row[columnName] && (row[columnName].size() > 0)) {
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
    } else if (columnObj.type === 'Option') {
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
    return moment(date.trim())
}

export const $fromNow = function (date) {
    if(!date){
        return '暂无时间'
    }
    const m = $moment(date)
    return Math.abs(moment().diff(m)) < 6000 ? '刚刚' : m.fromNow()
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
 * 获取汉字简拼
 * @param chStr
 * @returns {string}
 */
export const getSimplePinYin = (chStr) => {
	return pinyin(chStr, { toneType: 'none' }).replaceAll(' ', '')
}
