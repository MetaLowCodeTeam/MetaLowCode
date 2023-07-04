
import http from "@/utils/request"

export default {
	menu: {
		myMenus: {
			//url: `system/menu/my/1.6.1`,
			url: `/systemManager/getNavMenus`,
			name: "获取我的菜单",
			get: async function(){
				return await http.get(this.url);
			}
		},
		list: {
			url: `system/menu/list`,
			name: "获取菜单",
			get: async function(){
				return await http.get(this.url);
			}
		}
	},
	dic: {
		tree: {
			url: `system/dic/tree`,
			name: "获取字典树",
			get: async function(){
				return await http.get(this.url);
			}
		},
		list: {
			url: `system/dic/list`,
			name: "字典明细",
			get: async function(params){
				return await http.get(this.url, params);
			}
		},
		get: {
			url: `system/dic/get`,
			name: "获取字典数据",
			get: async function(params){
				return await http.get(this.url, params);
			}
		}
	},
	role: {
		list: {
			url: `system/role/list2`,
			name: "获取角色列表",
			get: async function(params){
				return await http.get(this.url, params);
			}
		}
	},
	dept: {
		list: {
			url: `system/dept/list`,
			name: "获取部门列表",
			get: async function(params){
				return await http.get(this.url, params);
			}
		}
	},
	user: {
		list: {
			url: `system/user/list`,
			name: "获取用户列表",
			get: async function(params){
				return await http.get(this.url, params);
			}
		}
	},
	app: {
		list: {
			url: `system/app/list`,
			name: "应用列表",
			get: async function(){
				return await http.get(this.url);
			}
		}
	},
	log: {
		list: {
			url: `system/log/list`,
			name: "日志列表",
			get: async function(params){
				return await http.get(this.url, params);
			}
		}
	},
	table: {
		list: {
			url: `system/table/list`,
			name: "表格列管理列表",
			get: async function(params){
				return await http.get(this.url, params);
			}
		},
		info: {
			url: `system/table/info`,
			name: "表格列管理详情",
			get: async function(params){
				return await http.get(this.url, params);
			}
		}
	},
	tasks: {
		list: {
			url: `system/tasks/list`,
			name: "系统任务管理",
			get: async function(params){
				return await http.get(this.url, params);
			}
		}
	},
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
            return await http.get("/systemManager/getFieldSet", data);
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
