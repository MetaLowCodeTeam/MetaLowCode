/**
 * 图标接口
 */

import http from "@/utils/request"

const ChartTypes = {
    // 统计数值
    'statistic': 'number'
};



// 图表数据获取接口
export function queryChartData(formModel) {
    console.log(formModel, 'formModel')
    let commonStore = localStorage.getItem('commonStore');
    let entityName = commonStore ? JSON.parse(commonStore).entityName : {};
    // 维度
    let latitude = formModel?.setDimensional.dimension || [];
    // 指标
    let longitude = [];
    // 统计数值
    if (formModel.type == 'statistic') {
        let metrics = formModel?.setDimensional.metrics || [];
        longitude = metrics.map(el => {
            let formatItem = {
                calcMode: el.calcMode,
                fieldName: el.fieldName,
                label: el.alias,
                sort:el.sort,
                axisFormat: {
                    thousandsSeparator: el.thousandsSeparator,
                    decimalPlaces: el.showDecimalPlaces ? el.decimalPlaces : 0,
                    numericUnits: el.showNumericUnits ? el.numericUnits : "",
                },
            };
            return { ...formatItem }
        });
    }

    let param = {
        chartType: ChartTypes[formModel.type],
        entityName: entityName[formModel.dataEntity],
        latitude,
        longitude,
        noPrivileges: formModel.useAllData,
    };
    return http.post('/chart/queryChartData', param)
}

