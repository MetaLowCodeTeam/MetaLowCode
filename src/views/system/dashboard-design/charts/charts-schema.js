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

const chartsList = [
    {
        type: "progressbar",
        title: "进度条"
    },
    {
        type: "barChart",
        title: "柱状图"
    },
    {
        type: "barXChart",
        title: "条形图"
    },
    {
        type: "lineChart",
        title: "折线图"
    },
    {
        type: "funnelChart",
        title: "漏斗图"
    },
    {
        type: "pieChart",
        title: "饼图"
    },
    {
        type: "radarChart",
        title: "雷达图"
    },
    {
        type: "pivotTable",
        title: "透视表"
    },
    {
        type: "listTable",
        title: "数据列表"
    }
];


// 拥有图标样式的图表
const hasChartStyleType = [
    "barChart",
    "barXChart",
    "lineChart",
    "pieChart",
    "progressbar",
];

// 拥有设置轴坐标的图表
const hasAxisCoordinates = ["barChart", "barXChart", "lineChart"];

const initChaer = () => {
    let newChartList = [];
    chartsList.forEach(el => {
        let chartObj = {
            type: el.type,
            icon: el.type,
            formItemFlag: false,
            options: {
                type: el.type,
                name: '',
                value: 13232.12,
                title: el.title,
                loading: false,
                // 数据实体
                dataEntity: "",
                // 维度指标设置
                setDimensional: {
                    // 维度
                    dimension: [],
                    // 指标
                    metrics: [],
                    // 目标值
                    targetValue: [],
                    // 显示字段
                    showFields: [],
                    // 维度行
                    dimensionRow: [],
                    // 维度列
                    dimensionCol: [],
                },
                // 过滤条件
                setChartFilter: {
                    equation: "OR",
                    items: [],
                },
                // 图表设置
                setChartConf: {
                    // 数值显示
                    numShow: true,
                    // 图例显示
                    chartShow: true,
                    // 使用全部数据
                    useAllData: true,
                    // 汇总行显示
                    showSummary: false,
                    // 汇总列显示
                    showSumcol: false,
                    // 最大展示条数
                    pageSize: 999,
                },
                showHeader: true,
                showFullscreen: false,
                showRefresh: false,
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
        };
        // 添加图表样式设置
        if (hasChartStyleType.includes(el.type)) {
            chartObj.options.chartStyle = 1;
        }
        // 添加Y轴坐标设置
        if (hasAxisCoordinates.includes(el.type)) {
            chartObj.options.axisCoordinates = {
                // 最大值
                max: 0,
                // 最小值
                min: 0,
            };
        }
        // 如果是表
        if (el.type == 'pivotTable' || el.type == 'listTable') {
            chartObj.options.w = 12
            chartObj.options.h = 6
        }
        // 如果是漏斗图
        if (el.type == 'funnelChart') {
            chartObj.options.h = 8
        }
        // 如果是饼图
        if (el.type == 'pieChart') {
            chartObj.options.h = 7
        }
        // 如果是雷达图
        if (el.type == 'radarChart') {
            chartObj.options.h = 8
            chartObj.options.w = 6
        }
        newChartList.push(chartObj)
    })
    return newChartList
}

export const ext_charts_widgets = [
    {
        type: 'statistic',
        icon: 'statistic',
        formItemFlag: false,
        options: {
            type: 'statistic',
            name: '',
            value: 13232.12,
            title: '统计数值',
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
    ...initChaer()
]
