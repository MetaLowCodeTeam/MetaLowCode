/**
 * 团队接口
 */

import http from "@/utils/request"

// 获取团队成员
export function getTeamMembers(teamId) {
    return http.get('/user/teamOrRoleUsers', { id: teamId })
}

// 添加团队成员
export function addTeamMembers(body) {
    return http.post('/user/addTeamOrRoleUsers', body)
}

// 删除团队成员
export function delTeamMembers(id, userId) {
    return http.get('/user/delTeamOrRoleUsersUser', { id, userId })
}

// 删除团队
export function delTeam(teamId) {
    return http.get('/team/delTeam', { teamId })
}

// 保存团队
export function saveTeam(entity, id, formModel) {
    return http.post('/team/saveTeam', formModel, {
        params: { entity, id },
    })
}