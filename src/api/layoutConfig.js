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
    useNavChang: async (layoutConfigId, cacheKey) => {
        return http.post('/user/saveUserCache', {}, {
            params: { cacheValue: layoutConfigId, cacheKey },
        })
    },
    // 删除布局配置
    deleteConfig: async (layoutConfigId) => {
        return http.post('/layout/deleteConfig', {}, {
            params: { recordId:layoutConfigId },
        })
    }
}