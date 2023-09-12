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


import approval from './approval.js'
import common from './common.js'
import reportTemplates from './reportTemplates.js';
import trigger from './trigger.js';
import layoutConfig from './layoutConfig.js';
import upload from './upload.js';
// 审批流程
modules.approval = approval;
// 通用接口
modules.common = common;
// 报表模板
modules.reportTemplates = reportTemplates;
// 触发器
modules.trigger = trigger;
// 界面设置
modules.layoutConfig = layoutConfig;
// 上传相关
modules.upload = upload;
export default modules
