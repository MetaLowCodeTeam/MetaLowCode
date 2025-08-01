import http, { request } from '@/utils/request'
import config from "@/config"

const SERVER_URL = config.FILE_SERVER_URL

export function getEntitySet(appAbbr) {
    return http.get('systemManager/getEntitySet', { appAbbr })
}

export function filterEntitySet(keyword, appAbbr) {
    return http.get('systemManager/filterEntitySet', { keyword, appAbbr })
}

export function getFieldSet(entity) {
    return http.get('systemManager/getFieldSet', { entity })
}

export function getFieldListOfEntity(entity) {
    return http.get('systemManager/getFieldListOfEntity', { entity })
}

export function getMDFieldList(entity) {
    return http.get('systemManager/getMDFieldList', { entity })
}

export function getEntityProps(entity) {
    return http.get('systemManager/getEntityProps', { entity })
}

export function hasDetailEntity(entity) {
    return http.get('systemManager/hasDetailEntity', { entity })
}



export function getAllTagsOfEntity(appAbbr) {
    return http.get('systemManager/getAllTagsOfEntity', { appAbbr })
}

export function createEntity(entity, maineEntityName) {
    return http.post('systemManager/createEntity', entity, {
        params: { 'mainEntity': maineEntityName }
    })
}

export function copyEntity(entity) {
    return http.post('/systemManager/copyEntity', entity)
}

export function updateEntityLabel(entity, entityLabel) {
    return http.post('systemManager/updateEntityLabel', {}, {
        params: { entity, entityLabel }
    })
}

export function updateEntityTags(entity, tags) {
    return http.post('systemManager/updateEntityTags', {}, {
        params: { entity, tags }
    })
}

export function entityCanBeDeleted(entity) {
    return http.get('systemManager/entityCanBeDeleted', { entity })
}

export function deleteEntity(entity) {
    return http.post('systemManager/deleteEntity', {}, {
        params: { entity }
    })
}

export function getTextFieldList(entity) {
    return http.get('systemManager/getTextFieldListOfEntity', { entity })
}

export function updateEntityNameField(entity, nameField) {
    return http.post('systemManager/updateEntityNameField', {}, {
        params: { entity, nameField }
    })
}

export function updateDisplayOrderField(entityName, fieldName, autoDisplayOrder, displayOrderIsAsc) {
    return http.post('systemManager/updateDisplayOrderField', {}, {
        params: { entityName, fieldName, autoDisplayOrder, displayOrderIsAsc }
    })
}

export function addField(field, entity) {
    return http.post('systemManager/addField', field, {
        params: { entity }
    })
}

export function updateField(field, entity) {
    return http.post('systemManager/updateField', field, {
        params: { entity }
    })
}

export function fieldCanBeEdited(field, entity) {
    return http.get('systemManager/fieldCanBeEdited', { entity, field })
}

export function fieldCanBeDeleted(field, entity) {
    return http.get('systemManager/fieldCanBeDeleted', { entity, field })
}

export function deleteField(field, entity) {
    return http.post('systemManager/deleteField', {}, {
        params: { entity, field }
    })
}

export function addOptionField(field, entity, optionList) {
    return http.post('systemManager/addOptionField', { field, optionList }, {
        params: { entity }
    })
}

export function updateOptionField(field, entity, optionList) {
    return http.post('systemManager/updateOptionField', { field, optionList }, {
        params: { entity }
    })
}

export function addCodeOptionField(field, entity, codeOptionList) {
    return http.post('systemManager/addCodeOptionField', { field, codeOptionList }, {
        params: { entity }
    })
}

export function updateCodeOptionField(field, entity, codeOptionList) {
    return http.post('systemManager/updateCodeOptionField', { field, codeOptionList }, {
        params: { entity }
    })
}

export function addTagField(field, entity, tagList) {
    return http.post('systemManager/addTagField', { field, tagList }, {
        params: { entity }
    })
}

export function updateTagField(field, entity, tagList) {
    return http.post('systemManager/updateTagField', { field, tagList }, {
        params: { entity }
    })
}

export function addRefField(field, entity, refEntity) {
    return http.post('systemManager/addRefField', field, {
        params: { entity, refEntity }
    })
}

export function addAnyRefField(field, entity, referTo) {
    return http.post('systemManager/addAnyRefField', field, {
        params: { entity, referTo }
    })
}

export function updateRefField(field, entity, refEntity) {
    return http.post('systemManager/updateRefField', field, {
        params: { entity, refEntity }
    })
}

export function updateAnyRefField(field, entity, referTo) {
    return http.post('systemManager/updateAnyRefField', field, {
        params: { entity, referTo }
    })
}

export function getField(field, entity) {
    return http.get('systemManager/getField', { entity, field })
}

export function getRefFieldExtras(field, entity) {
    return http.get('systemManager/getRefFieldExtras', { entity, field })
}


/**
 * 
 * @param {*} entityName          实体名称
 * @param {*} recordId            数据ID
 * @param {*} layoutName          表单名称
 * @param {*} shareTo             分享给
 * @param {*} layoutJson          表单布局
 * @param {*} originalTextMap     原始文本映射
 * @returns 
 */

export function saveFormLayout(entityName, recordId, layoutName, shareTo, layoutJson, originalTextMap) {
    return http.post('formLayout/save', {
        entityName,
        recordId,
        layoutName,
        shareTo,
        layoutJson:JSON.stringify(layoutJson),
        originalTextMap,
    })
}

export function deleteFormLayout(layoutId) {
    return http.post('formLayout/delete', {}, {
        params: { layoutId }
    })
}


export function getFormLayout(entity, formId, forcefully) {
    return http.get('formLayout/get', { entity, formId, forcefully })
}


export function getFormLayoutList(entity) {
    return http.get('/formLayout/getList', { entity })
}

export function previewLayout(entity) {
    return http.get('formLayout/previewLayout', { entity })
}

export function getOptionFields(appAbbr, fieldType) {
    return http.get('systemManager/getOptionFields', { appAbbr, fieldType })
}

export function getOptionItems(entity, field) {
    return http.get('systemManager/getOptionItems', { entity, field })
}

export function getCodeOptionItems(entity, field) {
    return http.get('systemManager/getCodeOptionItems', { entity, field })
}

export function getCascaderOptionTree(entity, field) {
    return http.get('systemManager/getCascaderOptionTree', { entity, field })
}


export function optionCanBeDeleted(entity, field, value) {
    return http.get('systemManager/optionCanBeDeleted', { entity, field, value })
}

export function codeOptionCanBeDeleted(entity, field, value) {
    return http.get('systemManager/codeOptionCanBeDeleted', { entity, field, value })
}

export function saveOptionItems(entity, field, optionItems) {
    return http.post('systemManager/saveOptionItems', optionItems, {
        params: { entity, field }
    })
}

export function saveCodeOptionItems(entity, field, codeOptionItems) {
    return http.post('systemManager/saveCodeOptionItems', codeOptionItems, {
        params: { entity, field }
    })
}

export function saveCascaderOptionItem(entity, field, recordId, item) {
    return http.post('systemManager/saveCascaderOptionItem', item, {
        params: { entity, field, recordId }
    })
}

export function deletedCascaderOptionItem(recordId) {
    return http.post('systemManager/deletedCascaderOption', null, {
        params: { recordId }
    })
}


export function getTagFields(appAbbr) {
    return http.get('systemManager/getTagFields', { appAbbr })
}

export function getTagItems(entity, field) {
    return http.get('systemManager/getTagItems', { entity, field })
}

export function getSystemConstantTree() {
    return http.get('systemManager/getSystemConstantTree')
}

export function getSystemConstants(systemName) {
    return http.get('systemManager/getSystemConstants', { systemName })
}

export function saveSystemConstants(systemName, systemConstants) {
    return http.post('systemManager/saveSystemConstants', systemConstants, {
        params: { systemName }
    })
}

export function systemConstantCanBeDeleted(systemName, systemValue) {
    return http.get('systemManager/systemConstantCanBeDeleted', { systemName, systemValue })
}

export function queryEntityListByReferenceField(entityName, fieldName) {
    return http.get('/systemManager/queryEntityListByReferenceField', { entityName, fieldName })
}

export function saveTagItems(entity, field, tagItems) {
    return http.post('systemManager/saveTagItems', tagItems, {
        params: { entity, field }
    })
}

export function getPictureUploadAction() {
    return import.meta.env.VITE_APP_BASE_API + '/picture/upload'
}

export function getPictureUrlPrefix() {
    return SERVER_URL + '/picture/get'
}

export function getFileUploadAction() {
    return import.meta.env.VITE_APP_BASE_API + '/file/upload'
}

export function getFileUrlPrefix() {
    return SERVER_URL + '/file/get'
}


export function postBackupDB() {
    return http.post('/systemManager/backupDB')
}


export function exportEntityData(entityList) {
    return http.post('/systemManager/exportEntityData', entityList)
}



export function importEntityData(file, config = {}) {
    return http.post('/systemManager/importEntityData', file, config)
}