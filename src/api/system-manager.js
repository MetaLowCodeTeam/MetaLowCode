import { request } from '@/utils/request'
import config from "@/config"

const SERVER_URL = config.FILE_SERVER_URL

export function getEntitySet() {
  return request({
    url: `${config.SERVER_API_URL}/systemManager/getEntitySet`,
    method: 'get'
  })
}

export function getFieldSet(entity) {
  return request({
    url: 'systemManager/getFieldSet',
    method: 'get',
    params: { entity: entity }
  })
}

export function getFieldListOfEntity(entity) {
  return request({
    url: 'systemManager/getFieldListOfEntity',
    method: 'get',
    params: { entity: entity }
  })
}

export function getEntityProps(entity) {
  return request({
    url: 'systemManager/getEntityProps',
    method: 'get',
    params: { entity: entity }
  })
}

export function createEntity(entity, maineEntityName) {
  return request({
    url: 'systemManager/createEntity',
    method: 'post',
    params: {'mainEntity': maineEntityName},
    data: entity
  })
}

export function updateEntityLabel(entity, entityLabel) {
  return request({
    url: 'systemManager/updateEntityLabel',
    method: 'post',
    params: {entity, entityLabel},
  })
}

export function entityCanBeDeleted(entity) {
  return request({
    url: 'systemManager/entityCanBeDeleted',
    method: 'get',
    params: {entity},
  })
}

export function deleteEntity(entity) {
  return request({
    url: 'systemManager/deleteEntity',
    method: 'post',
    params: {entity},
  })
}

export function getTextFieldList(entity) {
  return request({
    url: 'systemManager/getTextFieldListOfEntity',
    method: 'get',
    params: {entity},
  })
}

export function updateEntityNameField(entity, nameField) {
  return request({
    url: 'systemManager/updateEntityNameField',
    method: 'post',
    params: {entity, nameField},
  })
}

export function addField(field, entity) {
  return request({
    url: 'systemManager/addField',
    method: 'post',
    params: {'entity': entity},
    data: field
  })
}

export function updateField(field, entity) {
  return request({
    url: 'systemManager/updateField',
    method: 'post',
    params: {'entity': entity},
    data: field
  })
}

export function fieldCanBeEdited(field, entity) {
  return request({
    url: 'systemManager/fieldCanBeEdited',
    method: 'get',
    params: {entity, field},
  })
}

export function fieldCanBeDeleted(field, entity) {
  return request({
    url: 'systemManager/fieldCanBeDeleted',
    method: 'get',
    params: {entity, field},
  })
}

export function deleteField(field, entity) {
  return request({
    url: 'systemManager/deleteField',
    method: 'post',
    params: {entity, field},
  })
}

export function addOptionField(field, entity, optionList) {
  return request({
    url: 'systemManager/addOptionField',
    method: 'post',
    params: {'entity': entity},
    data: {'field': field, 'optionList': optionList}
  })
}

export function updateOptionField(field, entity, optionList) {
  return request({
    url: 'systemManager/updateOptionField',
    method: 'post',
    params: {'entity': entity},
    data: {'field': field, 'optionList': optionList}
  })
}

export function addTagField(field, entity, tagList) {
  return request({
    url: 'systemManager/addTagField',
    method: 'post',
    params: {'entity': entity},
    data: {'field': field, 'tagList': tagList}
  })
}

export function updateTagField(field, entity, tagList) {
  return request({
    url: 'systemManager/updateTagField',
    method: 'post',
    params: {'entity': entity},
    data: {'field': field, 'tagList': tagList}
  })
}

export function addRefField(field, entity, refEntity) {
  return request({
    url: 'systemManager/addRefField',
    method: 'post',
    params: {'entity': entity, 'refEntity': refEntity},
    data: field
  })
}

export function addAnyRefField(field, entity, referTo) {
  return request({
    url: 'systemManager/addAnyRefField',
    method: 'post',
    params: {'entity': entity, 'referTo': referTo},
    data: field
  })
}

export function updateRefField(field, entity, refEntity) {
  return request({
    url: 'systemManager/updateRefField',
    method: 'post',
    params: {'entity': entity, 'refEntity': refEntity},
    data: field
  })
}

export function updateAnyRefField(field, entity, referTo) {
  return request({
    url: 'systemManager/updateAnyRefField',
    method: 'post',
    params: {'entity': entity, 'referTo': referTo},
    data: field
  })
}

export function getField(field, entity) {
  return request({
    url: 'systemManager/getField',
    method: 'get',
    params: {'entity': entity, 'field': field},
  })
}

export function getRefFieldExtras(field, entity) {
  return request({
    url: 'systemManager/getRefFieldExtras',
    method: 'get',
    params: {'entity': entity, 'field': field},
  })
}


export function createFormLayout(entity, layoutJson) {
  return request({
    url: 'formLayout/save',
    method: 'post',
    params: {'entity': entity},
    data: layoutJson
  })
}

export function updateFormLayout(layoutId, layoutJson) {
  return request({
    url: 'formLayout/update',
    method: 'post',
    params: {'layoutId': layoutId},
    data: layoutJson
  })
}

export function getFormLayout(entity) {
  return request({
    url: 'formLayout/get',
    method: 'get',
    params: { entity: entity }
  })
}

export function previewLayout(entity) {
  return request({
    url: 'formLayout/previewLayout',
    method: 'get',
    params: { entity: entity }
  })
}

export function getOptionFields() {
  return request({
    url: 'systemManager/getOptionFields',
    method: 'get'
  })
}

export function getOptionItems(entity, field) {
  return request({
    url: 'systemManager/getOptionItems',
    method: 'get',
    params: { entity: entity, field: field }
  })
}

export function saveOptionItems(entity, field, optionItems) {
  return request({
    url: 'systemManager/saveOptionItems',
    method: 'post',
    params: { entity: entity, field: field },
    data: optionItems
  })
}

export function getTagFields(entity) {
  return request({
    url: 'systemManager/getTagFields',
    method: 'get'
  })
}

export function getTagItems(entity, field) {
  return request({
    url: 'systemManager/getTagItems',
    method: 'get',
    params: { entity: entity, field: field }
  })
}

export function saveTagItems(entity, field, tagItems) {
  return request({
    url: 'systemManager/saveTagItems',
    method: 'post',
    params: { entity: entity, field: field },
    data: tagItems
  })
}

export function getPictureUploadAction() {
  return process.env.VUE_APP_BASE_API + '/picture/upload'
}

export function getPictureUrlPrefix() {
  return SERVER_URL + '/picture/get'
}

export function getFileUploadAction() {
  return process.env.VUE_APP_BASE_API + '/file/upload'
}

export function getFileUrlPrefix() {
  return SERVER_URL + '/file/get'
}
