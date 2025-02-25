// 注册详情自定义组件
export const registerDetailTabCustomComponent = (app) => {
    const modules = import.meta.globEager('./*.vue')
    for (const path in modules) {
        let cname = modules[path].default.name
        app.component(cname, modules[path].default)
    }
}