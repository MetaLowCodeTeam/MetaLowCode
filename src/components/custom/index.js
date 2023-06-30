import RichTextEditor from './RichTextEditor/index'
import AreaCascadeSelect from './AreaCascadeSelect/index'

export default {
  install(Vue) {
    Vue.component('RichTextEditor', RichTextEditor)
    Vue.component('AreaCascadeSelect', AreaCascadeSelect)
  }
}

const componentList = [
  {
    name: 'RichTextEditor',
    label: '富文本编辑器',
    description: '为显示美观，该组件应尽量占据整行宽度（即24栅格）',
  },
  {
    name: 'AreaCascadeSelect',
    label: '地区级联选择',
    description: '该组件需要绑定三个文本字段，字段先后顺序分别对应省/市/区',
  },
]

export function allComponentNames() {
  let result = new Array(0)
  componentList.forEach(cmp => {
    result.push({
      name: cmp.name,
      label: cmp.label
    })
  })
  return result
}

export function getComponentDescription(componentName) {
  if (!componentName) {
    return ''
  }

  let description = ''
  componentList.forEach(cmp => {
    if (cmp.name === componentName) {
      description = cmp.description
    }
  })
  return description;
}
