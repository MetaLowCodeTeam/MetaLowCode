import http from "@/utils/request"
export default {
    // 获取角色信息
    getRole: async (data) => {
        return await http.get("/role/listRole", data);
    },
    // 获取用户信息
    getUser: async (data) => {
        return await http.get("/user/listUser", data);
    },
    // 获取部门信息
    getDepartment: async (data) => {
        return await http.get("/department/listDepartment", data);
    },
    // 查询条件专用获取字段接口
    getFieldListOfFilter: async (data) => {
        return await http.get("/systemManager/getFieldListOfFilter", data);
    },
    // 审批流程获取实体接口
    getFieldListOfEntity: async (data) => {
        return await http.get("/systemManager/getFieldListOfEntity", data);
    },
    // 高级表达式是否OK
    isEquation: async (data) => {
        return await http.get("/crud/testEquation", data);
    },
    /**
     * 获取主实体相关实体数据
     *
     * @param entityCode      实体code
     * @param queryMain       是否查询出主实体
     * @param queryReference  是否查询主实体引用的实体
     * @param queryReferenced 是否查询引用主实体的实体
     * @param querySystem     是否查询系统实体
     * */
    queryEntityList: async (entityCode, queryMain = false, queryReference = false, queryReferenced = false, querySystem = false) => {
        return http.get('/systemManager/queryEntityList', { entityCode, queryMain, queryReference, queryReferenced, querySystem })
    }
}