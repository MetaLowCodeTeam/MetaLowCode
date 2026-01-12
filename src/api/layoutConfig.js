import http from "@/utils/request"
import { getModelName } from "@/utils/util";
export default {
    // 添加布局配置
    saveConfig: async (recordId, applyType, formModel, modelName) => {
        formModel.modelName = modelName || getModelName();
        return http.post('/layout/saveConfig', formModel, {
            params: { recordId, applyType },
        })
    },
    // 获取导航配置
    getNavigationList: async () => {
        return await http.get("/layout/getNavigationList");
    },
    // 切换使用导航
    saveUserLayoutCache: async (cacheKey, cacheValue, newModelName) => {
        let modelName = newModelName || getModelName();
        return http.post('/layout/saveUserLayoutCache', {}, {
            params: { cacheKey, cacheValue, modelName },
        })
    },
    // 删除布局配置
    deleteConfig: async (layoutConfigId) => {
        return http.post('/layout/deleteConfig', {}, {
            params: { recordId: layoutConfigId },
        })
    },
    // 获取实体布局配置
    getLayoutList: async (entityName, newModelName, isTabFilter) => {
        let modelName = newModelName || getModelName(entityName);
        // 如果不需要modelName，则设置为空
        if(newModelName == 'noModelName'){
            modelName = "";
        }
        return await http.get("/layout/getLayoutList", { entityName, modelName, isTabFilter });
    },
    // 数据导出
    excelDataExcel: async (formModel) => {
        return http.post('/excelData/exportExcel', formModel)
    },
    // 获取导航数据
    getNavigationById: async (layoutConfigId) => {
        return await http.get("/layout/getNavigationById", { layoutConfigId });
    },
    // 添加收藏
    saveFavoritesConfig: async (recordId, applyType, formModel) => {
        return http.post('/layout/saveFavoritesConfig', formModel, {
            params: { recordId, applyType },
        })
    },
    // 删除收藏
    deleteFavoritesConfig: async (recordId) => {
        return http.post('/layout/deleteFavoritesConfig', {}, { params: { recordId } })
    }
}


export function checkTables(body, recordId) {
    return http.post('/layout/checkTables', body, { params: { recordId } })
}


// 获取自定义按钮过滤条件
export function checkCustomButtonFilters(body) {
    return http.post('/layout/checkFilters', body)
}


// 获取实体下的所有模型名称
export function getModelNameList(entityName) {
    return http.get('/layout/getModelNameList', { entityName })
}
