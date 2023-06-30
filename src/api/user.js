import { request } from '@/utils/request'

export function login(data) {
  return request({
    url: 'user/login',
    method: 'post',
    data
  })
}

export function logout() {
  return request({
    url: 'user/logout',
    method: 'post',
  })
}

export function saveUser(entity, id, formModel) {
  return request({
    url: 'user/saveUser',
    method: 'post',
    params: {entity, id},
    data: formModel,
  })
}

export function deleteUserById(userId) {
  return request({
    url: 'user/deleteUser',
    method: 'post',
    params: { userId }
  })
}

export function getDepartmentTree() {
  return request({
    url: 'department/treeData',
    method: 'get',
  })
}

export function saveDepartment(entity, id, formModel) {
  return request({
    url: 'department/saveDepartment',
    method: 'post',
    params: {entity, id},
    data: formModel,
  })
}

export function deleteDepartmentById(departmentId) {
  return request({
    url: 'department/deleteDepartment',
    method: 'post',
    params: { departmentId }
  })
}

export function getBlankRoleData() {
  return request({
    url: 'role/getBlankRoleData',
    method: 'get',
  })
}

export function getRoleData(roleId) {
  return request({
    url: 'role/getRoleData',
    method: 'get',
    params: { roleId }
  })
}


export function saveRoleData(roleDTO) {
  return request({
    url: 'role/saveRole',
    method: 'post',
    data: roleDTO
  })
}

export function deleteRoleById(roleId) {
  return request({
    url: 'role/deleteRole',
    method: 'post',
    params: { roleId }
  })
}

export function listRole() {
  return request({
    url: 'role/listRole',
    method: 'get',
  })
}
