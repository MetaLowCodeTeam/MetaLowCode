const reg = /(_createElementBlock\d*\("svg", _hoisted_\d+, )(_hoisted_\d+)/g;
export default () => ({
    name: "fix_hoistStatic",
    transform(code, id) {
        if (id.includes("@element-plus/icons-vue/dist/index.js")) {
            code = code.replace(reg, "$1[...$2]");
            return code;
        }
    },
});

