import sysConfig from "@/config"
import tool from '@/utils/tool'
import { createI18n } from 'vue-i18n'
import el_zh_cn from 'element-plus/es/locale/lang/zh-cn'
import el_en from 'element-plus/es/locale/lang/en'
import zh_cn from './lang/zh-cn.js'
import en from './lang/en.js'

const messages = {
	'zh-cn': {
		el: el_zh_cn,
		...zh_cn
	},
	'en': {
		el: el_en,
		...en
	}
}
const i18n = createI18n({
	locale: tool.data.get("APP_LANG") || sysConfig.LANG || 'zh-cn',
	fallbackLocale: 'zh-cn',
	globalInjection: true,
	messages,
})

export default i18n;

export const t = (key) => {
    return i18n.global.t(key)
}
