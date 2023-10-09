/**
 * 图标接口
 */

import http from "@/utils/request"

const ChartTypes = {
    // 统计数值
    'statistic': 'number',
    // 进度条
    'progressbar': 'number',
    // 柱状图
    'barChart': 'axis',
    // 条形图
    'barXChart': 'axis',
    // 折线图
    'lineChart': 'axis',
    // 漏斗图
    'funnelChart': 'pie',
    // 漏斗图
    'pieChart': 'pie',
    // 雷达图
    'radarChart': 'axis',
    // 数据列表
    'listTable': 'table',
    // 透视表
    'pivotTable': 'table',
};

const formatItem = (list, target) => {
    let items = list.map(el => {
        let newItem = {
            fieldName: el.fieldName,
            label: el.alias,
            sort: el.sort,
        };
        if (target == 'longitude') {
            newItem.calcMode = el.calcMode;
            newItem.axisFormat = {
                thousandsSeparator: el.thousandsSeparator,
                decimalPlaces: el.showDecimalPlaces ? el.decimalPlaces : 0,
                numericUnits: el.showNumericUnits && el.numericUnits != '无' ? el.numericUnits : "",
            }
        }
        return { ...newItem }
    })
    return items
}

// 图表数据获取接口
export function queryChartData(formModel,type) {
    let commonStore = localStorage.getItem('commonStore');
    let entityName = commonStore ? JSON.parse(commonStore).entityName : {};
    // 维度
    let latitude = formatItem(formModel?.setDimensional.dimension || [], 'latitude');
    // 指标
    let longitude = formatItem(formModel?.setDimensional.metrics || [], 'longitude');

    if (type == 'pivotTable') {
        latitude = formatItem(formModel?.setDimensional.dimensionRow || [], 'latitude');
        let dimensionCol = formatItem(formModel?.setDimensional.dimensionCol || [], 'latitude');
        dimensionCol.forEach(el => {
            el.columns = true;
            latitude.push(el)
        })
    }

    let param = {
        chartType: ChartTypes[type],
        entityName: entityName[formModel.dataEntity],
        latitude,
        longitude,
        noPrivileges: formModel?.setChartConf.useAllData,
        filter: formModel.setChartFilter
    };
    return http.post('/chart/queryChartData', param)
}

