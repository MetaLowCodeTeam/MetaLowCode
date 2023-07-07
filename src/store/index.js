/**
 * @description 自动import导入所有 vuex 模块
 */

import { createStore } from 'vuex';

const modules = {}

const files = import.meta.globEager('./modules/*.js')
for (const key in files) {
    modules[key.replace(/^\.\/modules\/(.*)\.\w+$/, '$1')]=files[key].default
}
export default createStore({
	modules
});
