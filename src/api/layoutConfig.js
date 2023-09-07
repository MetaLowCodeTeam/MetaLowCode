import http from "@/utils/request"
export default {
    // 添加布局配置
    saveConfig: async (recordId, applyType, formModel) => {
        return http.post('/layout/saveConfig', formModel, {
            params: { recordId, applyType },
        })
    },
    // 获取导航配置
    getNavigationList: async () => {
        return await http.get("/layout/getNavigationList");
    },
    // 切换使用导航
    saveUserLayoutCache: async (cacheKey, cacheValue) => {
        return http.post('/layout/saveUserLayoutCache', {}, {
            params: { cacheKey, cacheValue },
        })
    },
    // 删除布局配置
    deleteConfig: async (layoutConfigId) => {
        return http.post('/layout/deleteConfig', {}, {
            params: { recordId: layoutConfigId },
        })
    },
    // 获取实体布局配置
    getLayoutList: async (entityName) => {
        return await http.get("/layout/getLayoutList", { entityName });
    },

}