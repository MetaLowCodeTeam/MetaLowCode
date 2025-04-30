import { 
    getModelName,
    formatFilterToBase64,
    unicodeToBase64
} from "@/utils/util";

import http, { request } from '@/utils/request'

export function refFieldQuery(entity, field, pageNo, pageSize, queryText, extraFilter, formFilter) {
    return http.post(
        'crud/refFieldQuery',
        formFilter,
        {
            params: { entity, 'refField': field, pageNo, pageSize, queryText, extraFilter }
        }
    );
}

export function saveRefFilterPanel(entity, field, filter) {
    return http.post(
        'crud/saveRefFilterPanel',
        filter,
        {
            params: { entity, 'refField': field}
        }
    );
}

export function refFieldQuery2(entity, field, pageNo, pageSize, extraFilter, formFilter, formFilter2, sort) {
	return http.post(
		'crud/refFieldQuery2',
		[formFilter, formFilter2],
		{
			params: { entity, 'refField': field, pageNo, pageSize, extraFilter, sort }
		}
	);
}

export function createRecord(entity) {
    return http.get('crud/formCreateQuery', { entity })
}

export function updateRecord(entity, id) {
    return http.get('crud/formUpdateQuery', { entity, id })
}

export function saveRecord(entity, id, formModel) {
    return http.post('crud/saveRecord', formModel, {
        params: { entity, id },
    })
}

export function saveRecordAndStartProcess(entity, id, approvalConfigId, formModel) {
    return http.post('crud/saveRecordAndStartProcess', formModel, {
        params: { entity, id, approvalConfigId },
    })
}

export function deleteRecord(id) {
    return http.post('crud/deleteRecord', {
        recordIds: [id],
        cascades: []
    })
}

export function deleteRecords(body) {
    return http.post('crud/deleteRecord', body)
}

/**
*
* 通用查询接口
* @param {*} mainEntity 实体名称
* @param {*} fieldsList 要显示的字段名称
* @param {*} filter { equation="AND", items:[{  "fieldName": "flowName", "op": "LK", "value": "修改"}] }  过滤
* @param {*} pageSize 默认页数大小
* @param {*} pageNo 页数大小
* @param {*} sortFields [{   "fieldName": "entityCode","type": "desc" }] 排序
* @param {*} advFilter { equation="AND", items:[{  "fieldName": "flowName", "op": "LK", "value": "修改"}] }  常用查询
* @param {*} quickFilter ""  快速查询
* @param {*} builtInFilter ""  { equation="AND", items:[{  "fieldName": "flowName", "op": "LK", "value": "修改"}] } 参数查询
* @param {*} statistics ""
* @param {*} filterEasySql ""  自定义SQL查询
* @param {*} defaultFilter ""  默认查询
* @param {*} modelName ""  模型名称
* @param {*} otherFilters [] 其他过滤

*/
export function getDataList(entity, fields, filter, pageSize, pageNo, sortFields, advFilter, quickFilter, builtInFilter, statistics, filterEasySql, defaultFilter, modelName, otherFilters) {
    return http.post('crud/listQuery', {
        'mainEntity': entity,
        'fieldsList': fields,
        filter: formatFilterToBase64(filter), 
        pageSize, 
        pageNo, 
        sortFields, 
        advFilter: formatFilterToBase64(advFilter), 
        quickFilter, 
        builtInFilter: formatFilterToBase64(builtInFilter), 
        statistics, 
        filterEasySql: filterEasySql ? unicodeToBase64(filterEasySql) : null, 
        defaultFilter: formatFilterToBase64(defaultFilter), 
        modelName: modelName || getModelName(),
        otherFilters: otherFilters ? otherFilters.map(item => formatFilterToBase64(item)) : null
    })
}

export function initDataList(entity) {
    return http.get('crud/initDataList', { entity })
}


/**
 * 通用获取实体列表接口（实体+列表页面的实体列表）
 * @param {*} entityName 实体名称
 */
export function getEntityCodeList(entityName, appAbbr) {
    return http.get('/crud/getEntityCodeList', { entityName, appAbbr })
}

/**
 * 通用查询详情接口
 * @param {*} entityId 实体ID
 * @param {*} fieldNames 需要获取的字段名称
 * @param {*} body 请求体
 */
export function queryById(entityId, fieldNames, body) {
    return http.post('/crud/queryById', body, { params: { entityId, fieldNames } })
}


/**
 * 通用查询-获取实体字段
 * @param {*} entityCode 实体
 * @param {*} queryReference 是否查询引用实体的字段（单引用）  true or false 默认 false
 * @param {*} queryReserved 是否查询系统字段  true or false 默认 false
 * @param {*} firstReference 是否查询引用字段（不包含引用实体字段）  true or false 默认 false
 * @param {*} queryReferenceList 是否查询多引用字段（不包含引用实体字段）  true or false 默认 false
 * @param queryAnyReference 是否查询任意引用
 */
export function queryEntityFields(entityCode, queryReference, queryReserved, firstReference, queryReferenceList, queryAnyReference) {
    return http.get('/crud/queryEntityFields', { entityCode, queryReference, queryReserved, firstReference, queryReferenceList, queryAnyReference })
}

/**
 * 通用查询- 实体名称+实体自动 查引用实体的所有字段
 * @param {*} entityName 实体名称
 * @param {*} fieldName 实体字段
 * @param {*} queryReference 是否查询引用实体的字段（单引用）  true or false 默认 false
 * @param {*} queryReserved 是否查询系统字段  true or false 默认 false
 * @param {*} firstReference 是否查询引用字段（不包含引用实体字段）  true or false 默认 false
 */
export function queryReferToEntityFields(entityName, fieldName, queryReference, queryReserved, firstReference) {
    return http.get('/crud/queryReferToEntityFields', { entityName, fieldName, queryReference, queryReserved, firstReference })
}

export function queryRecordTree(entityName, parentFieldName) {
    return http.get('/crud/queryRecordTree', { entityName, parentFieldName })
}



/**
 * 通用查询-获取实体字段
 * @param {*} entityCodes 实体
 * @param {*} queryReference 是否查询引用实体的字段（单引用）  true or false 默认 false
 * @param {*} queryReserved 是否查询系统字段  true or false 默认 false
 * @param {*} firstReference 是否查询引用字段（不包含引用实体字段）  true or false 默认 false
 */
export function queryEntityListFields(entityCodes, queryReference, queryReserved, firstReference) {
    return http.post('/crud/queryEntityListFields', [...entityCodes], { params: { queryReference, queryReserved, firstReference } })
}

// 列显示
export function queryEntityListableFields(entityCode) {
    return http.get('/crud/queryEntityListableFields', { entityCode})
}

// 引用组件列显示
export function queryEntityListableFieldsByRefField(field, entity) {
    return http.get('/crud/queryEntityListableFieldsByRefField', { field, entity})
}

/**
 * 分配
 */
export function assignRecord(body) {
    return http.post('/crud/assignRecord', body)
}
/**
 * 共享
 */
export function shareRecord(body) {
    return http.post('/crud/shareRecord', body)
}
/**
 * 取消共享
 */
export function cancelShareRecord(body, userType) {
    return http.post('/crud/cancelShareRecord', body, { params: { userType } })
}

/**
 * 复制
 */
export function cloneRecord(body) {
    return http.post('/crud/cloneRecord', body)
}


/**
 * 删除
 */
// export function deleteRecord(body) {
//     return http.post('/crud/deleteRecord', body)
// }


/**
 * 分组查询
 */
export function groupTreeQuery(body) {
    return http.post('/crud/groupTreeQuery', body)
}


/**
 * 批量编辑
 */
export function updateRecordList(body) {
    return http.post('/crud/updateRecordList', body)
}





// 根据 entityCode 获取关联的引用实体
export function queryDetailEntityFields(entityName) {
    return http.get('/crud/queryDetailEntityFields', { entityName })
}

// 详情-修改历史
export function queryByRecordId(recordId, pageNo, pageSize) {
    return http.get('/revisionHistory/queryByRecordId', { recordId, pageNo, pageSize })
}
// 修改历史-修改记录详情
export function revisionHistoryDetailsById(revisionHistoryId) {
    return http.get('/revisionHistory/detailsById', { revisionHistoryId })
}