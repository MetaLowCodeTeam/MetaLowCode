/**
 * 官网： https://cn.eslint.org/docs/user-guide/getting-started
 * 规则查阅：https://cn.eslint.org/docs/rules/
 * 参考资料：
 http://tech.tea-culture.top/code/eslint/#eslint-%E8%A7%84%E5%88%99%E6%80%BB%E8%A7%88
 https://blog.csdn.net/image_fzx/article/details/118195141
 https://blog.csdn.net/weixin_57649833/article/details/120757938
 */
module.exports = {
    root: true,
    env: {
        node: true
    },
    extends: [
        'plugin:vue/vue3-essential'
    ],
    parserOptions: {
        parser: '@babel/eslint-parser'
    },
    rules: {
        'no-unused-vars': 'off',
        'vue/no-mutating-props': 'off',
        'vue/no-unused-components': 'off',
        'no-console': import.meta.env.VITE_NODE_ENV === 'production' ? 'warn' : 'off',
        'no-debugger': import.meta.env.VITE_NODE_ENV === 'production' ? 'warn' : 'off',
        // 关闭驼峰命名规则
        'vue/multi-word-component-names': 0

    }
}
