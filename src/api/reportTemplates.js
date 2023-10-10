
/**
 * 报表模板Api
 */
import http from "@/utils/request"

export default {
    detial: {
       
    },
    list: {
        // 获取实体列表
        getEntityList: async (data) => {
            return await http.get("/plugins/mannerReport/getEntityCode", data);
        },
    },
}
