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
     * 
     * 通用查询接口
     * @param {*} mainEntity 实体名称
     * @param {*} fieldsList 要显示的字段名称
     * @param {*} pageSize 默认页数大小
     * @param {*} pageNo 页数大小
     * @param {*} filter { equation="AND", items:[{  "fieldName": "flowName", "op": "LK", "value": "修改"}] }  过滤
     * @param {*} sortFields [{   "fieldName": "entityCode","type": "desc" }] 排序
     */
    getGeneralQuery: async (
        mainEntity = "",
        fieldsList = "",
        pageSize = 10,
        pageNo = 1,
        filter = {},
        sortFields = []
    ) => {
        let params = {
            mainEntity,
            fieldsList,
            pageSize,
            pageNo,
            filter,
            sortFields
        }
        return await http.post("/crud/listQuery", params);
    }

}