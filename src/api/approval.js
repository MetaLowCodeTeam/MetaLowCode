
import http from "@/utils/request"

export default {
    // 选择用户
    selectUser: {
        getRole: async (data) => {
            return await http.get("/role/listRole", data);
        },
        getUser: async (data) => {
            return await http.get("/user/listUser", data);
        },
        getDepartment: async (data) => {
            return await http.get("/department/listDepartment", data);
        }
    },
    // 设置条件
    setConditions: {
        getFieldSet: async (data) => {
            return await http.get("/systemManager/getFieldListOfFilter", data);
        },
        initFilter: (filter) => {
            let { equation } = filter;
            if (!equation || equation === 'OR') {
                filter.type = 1;
                filter.equation = 'OR';
            } else if (equation === 'AND') {
                filter.type = 2;
                filter.equation = 'AND';
            } else {
                filter.type = 3;
            }

            return filter
        },
        // 高级表达式是否OK
        isEquation: async (data) => {
            return await http.get("/crud/testEquation", data);
        }
    },
    // 审批流程
    approval: {
        get: async (data) => {
            return await http.get("/approval/getFlowDefinitionByConfigId", data);
        },
        save: async (data) => {
            return await http.post("/approval/saveLastApprovalFlow", data);
        }
    },
}
