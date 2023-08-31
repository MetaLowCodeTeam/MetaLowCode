import http from "@/utils/request"
export default {
    // 添加布局配置
    saveConfig: async (recordId) => {
        return await http.post("/layout/saveConfig", recordId);
    },
    // 获取导航配置
    getNavigationList: async () => {
        return await http.get("/layout/getNavigationList");
    },
    // 切换使用导航
    useNavChang: async (layoutConfigId) => {
        return await http.post("/user/saveUserCache?cacheKey=NAV&cacheValue=" + layoutConfigId);
    },
    // 删除布局配置
    deleteConfig: async (layoutConfigId) => {
        return await http.post("/layout/deleteConfig?recordId=" + layoutConfigId);
    }
}