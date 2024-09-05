import http, { request } from '@/utils/request'
import config from "@/config"

const SERVER_URL = config.FILE_SERVER_URL

export function getEntitySet() {
    return http.get('systemManager/getEntitySet')
}

export function filterEntitySet(keyword) {
    return http.get('systemManager/filterEntitySet', { keyword })
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



export function getAllTagsOfEntity() {
    return http.get('systemManager/getAllTagsOfEntity')
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


export function createFormLayout(entity, layoutJson, layoutName, shareTo) {
    return http.post('formLayout/save', {
        layoutJson:JSON.stringify(layoutJson),
        shareTo,
    }, {
        params: { entity, layoutName, }
    })
}

export function updateFormLayout(layoutId, layoutJson) {
    return http.post('formLayout/update', layoutJson, {
        params: { layoutId }
    })
}

export function updateNameFormLayout(layoutId, layoutName, shareTo) {
    return http.post('formLayout/updateName', { shareTo }, {
        params: { layoutId, layoutName, }
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

export function getOptionFields() {
    return http.get('systemManager/getOptionFields')
}

export function getOptionItems(entity, field) {
    return http.get('systemManager/getOptionItems', { entity, field })
}

export function saveOptionItems(entity, field, optionItems) {
    return http.post('systemManager/saveOptionItems', optionItems, {
        params: { entity, field }
    })
}

export function getTagFields(entity) {
    return http.get('systemManager/getTagFields')
}

export function getTagItems(entity, field) {
    return http.get('systemManager/getTagItems', { entity, field })
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
