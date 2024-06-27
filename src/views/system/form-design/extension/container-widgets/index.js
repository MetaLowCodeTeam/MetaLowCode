/* 注意：扩展容器组件应在VForm 3 Pro源码项目中增加，否则MetaLowCode_Mobile项目必须引入designer.umd.js，
        因为容器组件依赖VFormSDK！！ */
export const registerContainerWidgets = (app) => {
    const modules = import.meta.globEager('./*.vue')
    for (const path in modules) {
        let cname = modules[path].default.name
        app.component(cname, modules[path].default)
    }
}