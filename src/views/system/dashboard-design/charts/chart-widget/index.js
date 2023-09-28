//import comps from "@/components/form-designer/form-widget/field-widget";

export const registerChartWidgets = (app) => {
  const modules = import.meta.globEager('./*.vue')
  for (const path in modules) {
    let cname = modules[path].default.name
    //comps[cname] = modules[path].default
    app.component(cname, modules[path].default)
  }
}
