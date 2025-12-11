
const APP_CONFIG = {
    // 标题
    APP_NAME: "",
    HOME_PAGE_URL: "",
};

// 挂到 window，供业务代码读取
window.APP_CONFIG = APP_CONFIG;

// 如果主应用已经提供了合并函数，则立即把配置合并进去
if (window.__APPLY_APP_CONFIG__) {
    window.__APPLY_APP_CONFIG__(APP_CONFIG);
}
