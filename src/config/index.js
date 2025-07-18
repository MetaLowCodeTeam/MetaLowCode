
const DEFAULT_CONFIG = {
	//标题
	APP_NAME: import.meta.env.VITE_APP_TITLE,

	//首页地址
	// DASHBOARD_URL: import.meta.env.VITE_APP_PATH + "custom-home-page/home1",
	DASHBOARD_URL: import.meta.env.VITE_APP_PATH + "dashboard",

	//请求超时
	//TIMEOUT: 10000,
	TIMEOUT: 200000,

	//TokenName
	TOKEN_NAME: "LoginToken",

	//Token前缀，注意最后有个空格，如不需要需设置空字符串
	TOKEN_PREFIX: "Bearer ",

	//追加其他头
	HEADERS: {},

	//请求是否开启缓存
	REQUEST_CACHE: false,

	

	//菜单是否折叠
	MENU_IS_COLLAPSE: false,

	//菜单是否启用手风琴效果
	MENU_UNIQUE_OPENED: false,

	//是否开启多标签
	LAYOUT_TAGS: true,



	//是否加密localStorage, 为空不加密，可填写AES(模式ECB,移位Pkcs7)加密
	LS_ENCRYPTION: '',

	//localStorageAES加密秘钥，位数建议填写8的倍数
	LS_ENCRYPTION_key: '2XNN4K8LC0ELVWN4',

	
}

// 如果生产模式，就合并动态的APP_CONFIG
// public/config.js
if(import.meta.env.VITE_NODE_ENV === 'production'){
	Object.assign(DEFAULT_CONFIG, APP_CONFIG)
}

export default DEFAULT_CONFIG
