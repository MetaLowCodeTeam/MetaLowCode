/**
 * @description 自动import导入所有 api 模块
 */

const files = require.context('./model', false, /\.js$/)
const modules = {}
files.keys().forEach((key) => {
	modules[key.replace(/(\.\/|\.js)/g, '')] = files(key).default
})

// 审批流程
const approval = require('./approval');
modules.approval = approval.default;
export default modules
