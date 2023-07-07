/**
 * @description 自动import导入所有 api 模块
 */

const modules = {}
const files = import.meta.globEager('./model/*.js')
for (const key in files) {
    modules[key.replace(/^\.\/model\/(.*)\.\w+$/, '$1')]=files[key].default
}

Object.keys(modules).forEach(item => {
  // 为每个模块添加一个前缀名，保证模块命明不冲突 
    modules[item]['namespaced'] = true
})
// const files = require.context('./model', false, /\.js$/)
// const files = import.meta.globEager("/modules/*.js");
// const files = import.meta.globEager('./modules/*.js')
// console.log(files, 'files')
// const modules = {}

// for (const key in files) {
//     modules[key.replace(/^\.\/modules\/(.*)\.\w+$/, '$1')] = files[key].default
// }

// Object.keys(modules).forEach(item => {
//     // 为每个模块添加一个前缀名，保证模块命明不冲突 
//     modules[item]['namespaced'] = true
// })

// console.log(modules, 'modules')



import approval from './approval.js'
import common from './common.js'
// 审批流程
modules.approval = approval;
modules.common = common;
export default modules
