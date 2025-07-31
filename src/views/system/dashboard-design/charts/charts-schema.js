export const dashboard_container_schema = {
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
			setDimensional: "",
		},
	},

]

// topBar按钮配置
const topBarBtnConfig = {
    show: false,
    type: 'primary',
    size: 'small',
    icon: '',
    text: 'Button',
    onClick: '',
}


export const ext_charts_widgets = [
    // 统计数值
    {
        type: 'statistic',
        icon: 'statistic',
        formItemFlag: false,
        options: {
            name: '',
            value: 13232.12,
            label: '统计数值',
            // 数据实体
            dataEntity: "",
            // 维度指标设置
            setDimensional: {
                // 维度
                dimension: [],
                // 指标
                metrics: [],
            },
            // 图表样式
            setChartStyle: {
                // 颜色选择
                useTextColor: "#000000",
                // 货币符号
                currencySymbol: "",
                // 货币符号尺寸
                currencySymbolSize: 14,
            },
            // 图表设置
            setChartConf: {
                // 数值显示
                numShow: true,
                // 图例显示
                chartShow: true,
                // 使用全部数据
                useAllData: true,
            },
            // 过滤条件
            setChartFilter: {
                equation: "OR",
                items: [],
            },
            showHeader: true,
            showFullscreen: false,
            showRefresh: false,
            showCollapse: false,
            topBarBtnConfig,
            customClass: [],
            // 是否使用数据源
            dsEnabled: false,
            // 数据源名称
            dsName: "",
            // 数据集名称
            dataSetName: "",
            x: 0,
            y: 0,
            w: 4,
            h: 4,
        }
    },
    // 进度条
    {
        type: 'progressbar',
        icon: 'progressbar',
        formItemFlag: false,
        options: {
            name: '',
            value: 13232.12,
            label: '进度条',
            // 数据实体
            dataEntity: "",
            // 维度指标设置
            setDimensional: {
                dimension: [],
                // 指标
                metrics: [],
                // 目标值
                targetValue: 1,
            },
            // 图表样式
            chartStyle: 1,

            // 图表设置
            setChartConf: {
                // 数值显示
                numShow: true,
                // 图例显示
                chartShow: true,
                // 使用全部数据
                useAllData: true,
            },
            // 过滤条件
            setChartFilter: {
                equation: "OR",
                items: [],
            },
            showHeader: true,
            showFullscreen: false,
            showRefresh: false,
            showCollapse: false,
            topBarBtnConfig,
            customClass: [],
            // 是否使用数据源
            dsEnabled: false,
            // 数据源名称
            dsName: "",
            // 数据集名称
            dataSetName: "",
            x: 0,
            y: 0,
            w: 4,
            h: 4,
        }
    },
    // 柱状图
    {
        type: 'barChart',
        icon: 'barChart',
        formItemFlag: false,
        options: {
            name: '',
            value: 13232.12,
            label: '柱状图',
            // 数据实体
            dataEntity: "",
            // 维度指标设置
            setDimensional: {
                // 维度
                dimension: [],
                // 指标
                metrics: [],
            },
            // 图表样式
            chartStyle: 1,

            // 图表设置
            setChartConf: {
                // 数值显示
                numShow: true,
                // 图例显示
                chartShow: true,
                // 使用全部数据
                useAllData: true,
            },
            // 过滤条件
            setChartFilter: {
                equation: "OR",
                items: [],
            },
            // 添加Y轴坐标设置
            axisCoordinates: {
                // 最大值
                max: 0,
                // 最小值
                min: 0,
            },
            showHeader: true,
            showFullscreen: false,
            showRefresh: false,
            showCollapse: false,
            topBarBtnConfig,
            customClass: [],
            // 是否使用数据源
            dsEnabled: false,
            // 数据源名称
            dsName: "",
            // 数据集名称
            dataSetName: "",
            x: 0,
            y: 0,
            w: 4,
            h: 4,
        }
    },
    // 条形图
    {
        type: 'barXChart',
        icon: 'barXChart',
        formItemFlag: false,
        options: {
            name: '',
            value: 13232.12,
            label: '条形图',
            // 数据实体
            dataEntity: "",
            // 维度指标设置
            setDimensional: {
                // 维度
                dimension: [],
                // 指标
                metrics: [],
            },
            // 图表样式
            chartStyle: 1,

            // 图表设置
            setChartConf: {
                // 数值显示
                numShow: true,
                // 图例显示
                chartShow: true,
                // 使用全部数据
                useAllData: true,
            },
            // 添加Y轴坐标设置
            axisCoordinates: {
                // 最大值
                max: 0,
                // 最小值
                min: 0,
            },
            // 过滤条件
            setChartFilter: {
                equation: "OR",
                items: [],
            },
            showHeader: true,
            showFullscreen: false,
            showRefresh: false,
            showCollapse: false,
            topBarBtnConfig,
            customClass: [],
            // 是否使用数据源
            dsEnabled: false,
            // 数据源名称
            dsName: "",
            // 数据集名称
            dataSetName: "",
            x: 0,
            y: 0,
            w: 4,
            h: 4,
        }
    },
    // 折线图
    {
        type: 'lineChart',
        icon: 'lineChart',
        formItemFlag: false,
        options: {
            name: '',
            value: 13232.12,
            label: '折线图',
            // 数据实体
            dataEntity: "",
            // 维度指标设置
            setDimensional: {
                // 维度
                dimension: [],
                // 指标
                metrics: [],
            },
            // 图表样式
            chartStyle: 1,

            // 图表设置
            setChartConf: {
                // 数值显示
                numShow: true,
                // 图例显示
                chartShow: true,
                // 使用全部数据
                useAllData: true,
            },
            // 添加Y轴坐标设置
            axisCoordinates: {
                // 最大值
                max: 0,
                // 最小值
                min: 0,
            },
            // 过滤条件
            setChartFilter: {
                equation: "OR",
                items: [],
            },
            showHeader: true,
            showFullscreen: false,
            showRefresh: false,
            showCollapse: false,
            topBarBtnConfig,
            customClass: [],
            // 是否使用数据源
            dsEnabled: false,
            // 数据源名称
            dsName: "",
            // 数据集名称
            dataSetName: "",
            x: 0,
            y: 0,
            w: 4,
            h: 4,
        }
    },
    // 漏斗图
    {
        type: 'funnelChart',
        icon: 'funnelChart',
        formItemFlag: false,
        options: {
            name: '',
            value: 13232.12,
            label: '漏斗图',
            // 数据实体
            dataEntity: "",
            // 维度指标设置
            setDimensional: {
                // 维度
                dimension: [],
                // 指标
                metrics: [],
            },

            // 图表设置
            setChartConf: {
                // 数值显示
                numShow: true,
                // 图例显示
                chartShow: true,
                // 使用全部数据
                useAllData: true,
            },
            // 过滤条件
            setChartFilter: {
                equation: "OR",
                items: [],
            },
            showHeader: true,
            showFullscreen: false,
            showRefresh: false,
            showCollapse: false,
            topBarBtnConfig,
            customClass: [],
            // 是否使用数据源
            dsEnabled: false,
            // 数据源名称
            dsName: "",
            // 数据集名称
            dataSetName: "",
            x: 0,
            y: 0,
            w: 4,
            h: 8,
        }
    },
    // 饼图
    {
        type: 'pieChart',
        icon: 'pieChart',
        formItemFlag: false,
        options: {
            name: '',
            value: 13232.12,
            label: '饼图',
            // 数据实体
            dataEntity: "",
            // 维度指标设置
            setDimensional: {
                // 维度
                dimension: [],
                // 指标
                metrics: [],
            },
            chartStyle: 1,

            // 图表设置
            setChartConf: {
                // 数值显示
                numShow: true,
                // 图例显示
                chartShow: true,
                // 使用全部数据
                useAllData: true,
            },
            // 过滤条件
            setChartFilter: {
                equation: "OR",
                items: [],
            },
            showHeader: true,
            showFullscreen: false,
            showRefresh: false,
            showCollapse: false,
            topBarBtnConfig,
            customClass: [],
            // 是否使用数据源
            dsEnabled: false,
            // 数据源名称
            dsName: "",
            // 数据集名称
            dataSetName: "",
            x: 0,
            y: 0,
            w: 4,
            h: 7,
        }
    },
    // 雷达图
    {
        type: 'radarChart',
        icon: 'radarChart',
        formItemFlag: false,
        options: {
            name: '',
            value: 13232.12,
            label: '雷达图',
            // 数据实体
            dataEntity: "",
            // 维度指标设置
            setDimensional: {
                // 维度
                dimension: [],
                // 指标
                metrics: [],
            },
            // 图表设置
            setChartConf: {
                // 数值显示
                numShow: true,
                // 图例显示
                chartShow: true,
                // 使用全部数据
                useAllData: true,
            },
            // 过滤条件
            setChartFilter: {
                equation: "OR",
                items: [],
            },
            showHeader: true,
            showFullscreen: false,
            showRefresh: false,
            showCollapse: false,
            topBarBtnConfig,
            customClass: [],
            // 是否使用数据源
            dsEnabled: false,
            // 数据源名称
            dsName: "",
            // 数据集名称
            dataSetName: "",
            x: 0,
            y: 0,
            w: 6,
            h: 7,
        }
    },
    // 透视表
    {
        type: 'pivotTable',
        icon: 'pivotTable',
        formItemFlag: false,
        options: {
            name: '',
            value: 13232.12,
            label: '透视表',
            // 数据实体
            dataEntity: "",
            // 维度指标设置
            setDimensional: {
                // 维度行
                dimensionRow: [],
                // 维度列
                dimensionCol: [],
                // 指标
                metrics: [],
            },
            // 图表设置
            setChartConf: {
                // 汇总行显示
                showSummary: false,
                // 汇总列显示
                showSumcol: false,
                // 使用全部数据
                useAllData: true,
            },
            // 过滤条件
            setChartFilter: {
                equation: "OR",
                items: [],
            },
            showHeader: true,
            showFullscreen: false,
            showRefresh: false,
            showCollapse: false,
            topBarBtnConfig,
            customClass: [],
            // 是否使用数据源
            dsEnabled: false,
            // 数据源名称
            dsName: "",
            // 数据集名称
            dataSetName: "",
            x: 0,
            y: 0,
            w: 12,
            h: 6,
        }
    },
    // 数据列表
    {
        type: 'listTable',
        icon: 'listTable',
        formItemFlag: false,
        options: {
            name: '',
            value: 13232.12,
            label: '数据列表',
            // 数据实体
            dataEntity: "",
            // 维度指标设置
            setDimensional: {
                // 显示字段
                showFields: [],
            },
            // 图表设置
            setChartConf: {
                // 最大展示条数
                pageSize: 999,
                // 汇总行显示
                showSummary: false,
                // 汇总列显示
                showSumcol: false,
                // 使用全部数据
                useAllData: true,
            },
            // 过滤条件
            setChartFilter: {
                equation: "OR",
                items: [],
            },
            // 查询面板
            setQueryPanel: {
                // 是否显示查询面板
                isShow: false,
                // 查询面板配置
                queryPanelConf: {},
            },
            showHeader: true,
            showFullscreen: false,
            showRefresh: false,
            showCollapse: false,
            showTablePagination: false,
            topBarBtnConfig,
            customClass: [],
            // 是否使用数据源
            dsEnabled: false,
            // 数据源名称
            dsName: "",
            // 数据集名称
            dataSetName: "",
            x: 0,
            y: 0,
            w: 12,
            h: 6,
            onRowClick: '',
        }
    },
    // 快捷导航
    {
        type: 'quickNav',
        icon: 'quickNav',
        formItemFlag: false,
        options: {
            name: '',
            value: 13232.12,
            label: '快捷导航',
            showHeader: true,
            showHeaderss: true,
            showFullscreen: false,
            showRefresh: false,
            showCollapse: false,
            // 显示入口样式
            setQuickNavConf: {
                // 1 列表  2卡片
                type: 1,
                // 入口
                inletList: [],
                // 宽度
                itemWidth: 200,
                // 移动端宽度栅格  1 = 12   2 =24
                itemCol:1,
                // 边框颜色
                borderColor:"#ddd",
            },
            topBarBtnConfig,
            customClass: [],
            // dsEnabled: false,
            // dsName: "",
            x: 0,
            y: 0,
            w: 12,
            h: 6,
        }
    }
    // ...initChaer()
]
