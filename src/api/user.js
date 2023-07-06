import http from '@/utils/request'

export function login(data) {
  return http.post('user/login', data)
}

export function logout() {
  return http.post('user/logout')
}

export function saveUser(entity, id, formModel) {
  return http.post('user/saveUser', formModel, {
    params: {entity, id}
  })
}

export function deleteUserById(userId) {
  return http.post('user/deleteUser', {}, {
    params: { userId }
  })
}

export function getDepartmentTree() {
  return http.get('department/treeData')
}

export function saveDepartment(entity, id, formModel) {
  return http.post('department/saveDepartment', formModel, {
    params: {entity, id}
  })
}

export function deleteDepartmentById(departmentId) {
  return http.post('department/deleteDepartment', {}, {
    params: { departmentId }
  })
}

export function getBlankRoleData() {
  return http.get('role/getBlankRoleData')
}

export function getRoleData(roleId) {
  return http.get('role/getRoleData', { roleId })
}


export function saveRoleData(roleDTO) {
  return http.post('role/saveRole', roleDTO)
}

export function deleteRoleById(roleId) {
  return http.post('role/deleteRole', {}, {
    params: { roleId }
  })
}

export function listRole() {
  return http.get('role/listRole')
}
