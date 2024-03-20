// http://stackoverflow.com/a/3943023/112731
// https://codepen.io/znak/pen/aOvMOd
/**
 * 根据当前的背景颜色确认适合背景色的文本颜色 (文本仅仅支持黑 和 白)
 * 场景: 适用于标签等用户自己定制颜色，文本颜色自适应
 */

const colorByBgColor = new Map()

const rgbRegex = /^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/

const hex = (x) => ("0" + parseInt(x).toString(16)).slice(-2);

function convertRGBToHex(rgb) {
    const bg = rgb.match(rgbRegex);
    if (!bg) {
        return ''
    }
    return ("#" + hex(bg[1]) + hex(bg[2]) + hex(bg[3])).toUpperCase();
}

const CACHE_ERROR = 'error'

/**
 * @param backgroundColor 字符串  #FFFBBC | rgb(222,33,44) 均可
 */
export function contrastTextColor(backgroundColor) {
    if(!backgroundColor){
        return ""
    }
    const cacheColor = colorByBgColor.get(backgroundColor)
    if (cacheColor) {
        if (cacheColor === CACHE_ERROR) {
            throw new Error('Invalid background color.' + backgroundColor);
        }
        return colorByBgColor.get(backgroundColor)
    }

    // 均转换为 hex 格式
    const backgroundHexColor = backgroundColor.length > 7 ? convertRGBToHex(backgroundColor) : backgroundColor

    let hex = backgroundHexColor
    if (hex.startsWith('#')) {
        hex = hex.substring(1);
    }
    if (hex.length === 3) {
        hex = [hex[0], hex[0], hex[1], hex[1], hex[2], hex[2]].join('')
    }

    if (hex.length !== 6) {
        colorByBgColor.set(backgroundColor, CACHE_ERROR)
        throw new Error('Invalid background color.' + backgroundColor);
    }

    const r = parseInt(hex.slice(0, 2), 16)
    const g = parseInt(hex.slice(2, 4), 16)
    const b = parseInt(hex.slice(4, 6), 16)

    if ([r, g, b].some(x => Number.isNaN(x))) {
        colorByBgColor.set(backgroundColor, CACHE_ERROR)
        throw new Error('Invalid background color.' + backgroundColor);
    }

    const textColor = (r * 0.299 + g * 0.587 + b * 0.114) > 186 ? '#000' : '#FFF'
    colorByBgColor.set(backgroundColor, textColor)
    return textColor
}
