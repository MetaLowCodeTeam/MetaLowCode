/**
 * 团队接口
 */

import http from "@/utils/request"

// 获取团队成员
export function getTeamMembers(teamId) {
    return http.get('/team/teamUsers', { id: teamId })
}

// 添加团队成员
export function addTeamMembers(body) {
    return http.post('/team/addTeamUsers', body)
}

// 删除团队成员
export function delTeamMembers(teamId, userId) {
    return http.get('/team/delTeamUser', { teamId, userId })
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