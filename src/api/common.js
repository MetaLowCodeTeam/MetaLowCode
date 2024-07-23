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
    // 获取团队信息
    getTeam: async (data) => {
        return await http.get("/team/listTeam", data);
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
     * @param queryBuiltIn    是否查询内置实体
     * @param queryLevel      往下查几层
     * */
    queryEntityList: async (entityCode, queryMain = false, queryReference = false, queryReferenced = false, querySystem = false, queryBuiltIn = false, queryLevel = null) => {
        return http.get('/systemManager/queryEntityList', { entityCode, queryMain, queryReference, queryReferenced, querySystem, queryBuiltIn, queryLevel })
    }
}