/**
 * 图标接口
 */

import http from "@/utils/request"

const ChartTypes = {
    // 统计数值
    'statistic': 'number',
    // 柱状图
    'barChart': 'axis',
    // 条形图
    'barXChart': 'axis',
    // 折线图
    'lineChart': 'axis'
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
                numericUnits: el.showNumericUnits ? el.numericUnits : "",
            }
        }
        return { ...newItem }
    })
    return items
}

// 图表数据获取接口
export function queryChartData(formModel) {
    console.log("-------------------------------- ↓↓↓ 源数据 ↓↓↓ beg --------------------------------")
    console.log({ ...formModel })
    console.log("-------------------------------- ↑↑↑ 源数据 ↑↑↑ end --------------------------------")
    let commonStore = localStorage.getItem('commonStore');
    let entityName = commonStore ? JSON.parse(commonStore).entityName : {};
    // 维度
    let latitude = formatItem(formModel?.setDimensional.dimension || [], 'latitude');
    // 指标
    let longitude = formatItem(formModel?.setDimensional.metrics || [], 'longitude');


    let param = {
        chartType: ChartTypes[formModel.type],
        entityName: entityName[formModel.dataEntity],
        latitude,
        longitude,
        noPrivileges: formModel?.setChartConf.useAllData,
    };
    // console.log("-------------------------------- ↓↓↓ 接口传参 ↓↓↓ beg --------------------------------")
    // console.log({ ...param })
    // console.log("-------------------------------- ↑↑↑ 接口传参 ↑↑↑ end --------------------------------")
    return http.post('/chart/queryChartData', param)
}
