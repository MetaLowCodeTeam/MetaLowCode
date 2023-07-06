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
    }
}