// import showHeaderEditor from "@/views/system/dashboard-design/charts/property-editor/showHeader-editor.vue";
// import titleEditor from "@/views/system/dashboard-design/charts/property-editor/title-editor.vue";
// import showFullscreenEditor from "@/views/system/dashboard-design/charts/property-editor/showFullscreen-editor.vue";
// import showRefreshEditor from "@/views/system/dashboard-design/charts/property-editor/showRefresh-editor.vue";
// import showCollapseEditor from "@/views/system/dashboard-design/charts/property-editor/showCollapse-editorvue.vue";
// import showIconEditor from "@/views/system/dashboard-design/charts/property-editor/showIcon-editor.vue";
// import showDataEnitiyEditor from "@/views/system/dashboard-design/charts/property-editor/dataEnitiy-editor.vue";


export const registerChartLibProperties = (app, PERegister) => {
    // PERegister.registerCommonProperty('showHeader', 'showHeader-editor')
    // PERegister.registerCommonProperty('title', 'title-editor')
    // PERegister.registerCommonProperty('fullscreen', 'fullscreen-editor')
    // PERegister.registerCommonProperty('showRefresh', 'showRefresh-editor')
    // PERegister.registerCommonProperty('showCollapse', 'showCollapse-editor')
    // PERegister.registerCPEditor(app, 'showDataEnitiy', 'showDataEnitiy-editor', showDataEnitiyEditor)
    // PERegister.registerCPEditor(app, 'showHeader', 'showHeader-editor', showHeaderEditor)
    // PERegister.registerCPEditor(app, 'title', 'title-editor', titleEditor)
    // PERegister.registerCPEditor(app, 'showFullscreen', 'showFullscreen-editor', showFullscreenEditor)
    // PERegister.registerCPEditor(app, 'showRefresh', 'showRefresh-editor', showRefreshEditor)
    // PERegister.registerCPEditor(app, 'showCollapse', 'showCollapse-editor', showCollapseEditor)
    // PERegister.registerCPEditor(app, 'showIcon', 'showIcon-editor', showIconEditor)

    // 组件排序
    let comOrder = ['dataEntity', 'setDimensional', 'showHeader', 'showFullscreen', 'showRefresh'];
    let newCom = [];
    const modules = import.meta.globEager('./**/*.vue')
    for (const path in modules) {
        let cname = modules[path].default.name

        let alias = cname.split("-")[0]
        let com = {};
        let inx = comOrder.indexOf(alias);
        if (inx != -1) {
            com.alias = alias;
            com.cname = cname;
            com.default = modules[path].default;
            newCom[inx] = com
        }
    }
    newCom.forEach(el => {
        PERegister.registerCPEditor(app, el.alias, el.cname, el.default)
    })
}


export const registerPEWidgets = (app) => {
    const modules = import.meta.globEager('./**/*.vue')
    for (const path in modules) {
        let cname = modules[path].default.name
        app.component(cname, modules[path].default)
    }
}
