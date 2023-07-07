import {markRaw} from 'vue';
const resultComps = {}
// let requireComponent = require.context(
// 	'./', // 在当前目录下查找
// 	false, // 不遍历子文件夹
// 	/\.vue$/ // 正则匹配 以 .vue结尾的文件
// )
// requireComponent.keys().forEach(fileName => {
// 	let comp = requireComponent(fileName)
// 	resultComps[fileName.replace(/^\.\/(.*)\.\w+$/, '$1')] = comp.default
// })

const files = import.meta.globEager('./*.vue')
for (const key in files) {
    resultComps[key.replace(/^\.\/(.*)\.\w+$/, '$1')]=files[key].default
}

Object.keys(resultComps).forEach(item => {
  // 为每个模块添加一个前缀名，保证模块命明不冲突 
  resultComps[item]['namespaced'] = true
})


// const resultComps = {}
// const files = import.meta.globEager('./*.vue')
// console.log(files,'files')
// for (const key in files) {
//     resultComps[key.replace(/^\.\/(.*)\.\w+$/, '$1')]=files[key].default
// }

// Object.keys(modules).forEach(item => {
//   // 为每个模块添加一个前缀名，保证模块命明不冲突 
//     modules[item]['namespaced'] = true
// })
export default markRaw(resultComps)
