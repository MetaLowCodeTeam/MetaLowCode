export const dashboard_container_schema = 	{
	type: 'dashboard-container',
	category: 'container',
	icon: 'section',
	internal: true,  /* 内部容器组件！！ */
	widgetList: [],
	options: {
		name: '',
		layout: [],
	},
}


export const ext_chart_containers = [
	dashboard_container_schema,
	{
		type: 'section',
		category: 'container',
		icon: 'section',
		widgetList: [],
		options: {
			name: '',
			title: '',
			showHeader: true,
			showFullscreen: false,
			showRefresh: false,
			showCollapse: false,
			x: 0,
			y: 0,
			w: 4,
			h: 4,
			onCreated: '',
			onMounted: '',
			onRefresh: '',
		},
	},

]

export const ext_charts_widgets = [
	{
		type: 'statistic',
		icon: 'statistic',
		formItemFlag: false,
		options: {
			name: '',
			value: 13232.12,
			title: '今年的增长',
			showHeader: true,
			showFullscreen: false,
			showRefresh: false,
			showCollapse: false,
			showIcon: false,
			icon: 'el-icon-star-on',
			iconColor: '#000',
			customClass: [],
			dsEnabled: false,
			dsName: "",
			x: 0,
			y: 0,
			w: 4,
			h: 4,
			onCreated: '',
			onMounted: '',
			onRefresh: '',
		}
	},


]
