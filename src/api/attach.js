/**
 * 附件API
 */
import http from "@/utils/request"
/**
 * 查询目录树
 *
 * @param entityCode 实体code
 * @return
 */
export function queryAttachmentDirectory(entityCode) {
    return http.get('/attach/queryAttachmentDirectory', { entityCode })
}
/**
 * 查看指定记录的附件
 *
 * @param recordId      记录id
 * @param fileDirectory 指定目录
 * @param searchValue   文件名称搜索
 * @param sort          排序
 * @param pageNo        当前页码
 * @param pageSize      每页数量
 * @return
 */
export function queryAttachmentFile(param) {
    return http.get('/attach/queryAttachmentFile', { ...param })
}

/**
 * 新增修改附件
 *
 * @param attachment
 * @return
 */

export function saveAttachment(param) {
    return http.post('/attach/saveAttachment', param)
}

/**
 * 删除指定附件
 *
 * @param attachmentId 附件id
 * @return
 */

export function deleteAttachment(attachmentId) {
    return http.get('/attach/deleteAttachment', {attachmentId})
}