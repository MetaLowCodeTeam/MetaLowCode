import showHeaderEditor from "@/views/system/dashboard-design/charts/property-editor/showHeader-editor.vue";
import titleEditor from "@/views/system/dashboard-design/charts/property-editor/title-editor.vue";
import showFullscreenEditor from "@/views/system/dashboard-design/charts/property-editor/showFullscreen-editor.vue";
import showRefreshEditor from "@/views/system/dashboard-design/charts/property-editor/showRefresh-editor.vue";
import showCollapseEditor from "@/views/system/dashboard-design/charts/property-editor/showCollapse-editorvue.vue";
import showIconEditor from "@/views/system/dashboard-design/charts/property-editor/showIcon-editor.vue";

export const registerChartLibProperties = (app, PERegister) => {
	// PERegister.registerCommonProperty('showHeader', 'showHeader-editor')
	// PERegister.registerCommonProperty('title', 'title-editor')
	// PERegister.registerCommonProperty('fullscreen', 'fullscreen-editor')
	// PERegister.registerCommonProperty('showRefresh', 'showRefresh-editor')
	// PERegister.registerCommonProperty('showCollapse', 'showCollapse-editor')

	PERegister.registerCPEditor(app, 'showHeader', 'showHeader-editor', showHeaderEditor)
	PERegister.registerCPEditor(app, 'title', 'title-editor', titleEditor)
	PERegister.registerCPEditor(app, 'showFullscreen', 'showFullscreen-editor', showFullscreenEditor)
	PERegister.registerCPEditor(app, 'showRefresh', 'showRefresh-editor', showRefreshEditor)
	PERegister.registerCPEditor(app, 'showCollapse', 'showCollapse-editor', showCollapseEditor)
	PERegister.registerCPEditor(app, 'showIcon', 'showIcon-editor', showIconEditor)
}

export const registerPEWidgets = (app) => {
  const modules = import.meta.globEager('./**/*.vue')
  for (const path in modules) {
	  let cname = modules[path].default.name
	  app.component(cname, modules[path].default)
  }
}
