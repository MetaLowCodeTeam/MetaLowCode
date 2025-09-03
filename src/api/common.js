import http from "@/utils/request"
export default {
    // 获取角色信息
    getRole: async (params, bodyData = {}) => {
        return await http.post("/role/listRole", bodyData, { params });
    },
    // 获取用户信息
    getUser: async (params, bodyData = {}) => {
        return await http.post("/user/listUser", bodyData, { params });
    },
    // 获取部门信息
    getDepartment: async (params, bodyData = {}) => {
        return await http.post("/department/listDepartment", bodyData, { params });
    },
    // 获取团队信息
    getTeam: async (params, bodyData = {}) => {
        return await http.post("/team/listTeam", bodyData, { params });
    },
    // 获取岗位信息
    getJobPosition: async (params, bodyData = {}) => {
        return await http.post("/job/listJobPosition", bodyData, { params });
    },
    // 查询条件专用获取字段接口
    getFieldListOfFilter: async (data) => {
        return await http.get("/systemManager/getFieldListOfFilter", data);
    },
    // 多引用字段设置查询参数接口
    getFieldListByRefField: async (data) => {
        return await http.get("/systemManager/getFieldListByRefField", data);
    },
    // 审批流程获取实体接口
    getFieldListOfEntity: async (data) => {
        return await http.get("/systemManager/getFieldListOfEntity", data);
    },
    // 高级表达式是否OK
    isEquation: async (data) => {
        return await http.get("/crud/testEquation", data);
    },
    // 获取用户树形数据
    getUserTreeData: async (data) => {
        return await http.get("/user/treeData", data);
    },
    // 获取部门树形数据
    getDepartmentTreeData: async (data) => {
        return await http.get("/department/treeData", data);
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