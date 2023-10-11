/**
 * 团队接口
 */

import http from "@/utils/request"

// 获取团队成员
export function getTeamMembers(teamld) {
    return http.get('/team/teamUsers', { id:teamld })
}