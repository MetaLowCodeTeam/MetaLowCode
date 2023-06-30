import {generateId} from '@/utils/util'
import {Message, ElMessageBox as MessageBox} from 'element-plus'

export function createLayoutObj(eventBus) {

  const actEventName = 'actEvent'
  const layoutChangedEventName = 'layoutChangedEvent'
  const actTabElement = 'tab'
  const actSectionElement = 'section'
  const actRowElement = 'row'
  const actFieldWrapperElement = 'fieldWrapper'
  let eventHub = eventBus

  return {
    tabNames: [],
    formTabs: [],
    activeTab: null,
    activeTabName: null,
    activeSection: null, /* 注意：activeSection指向的不是LayoutSection组件，而是指向layoutObj的sections数组中的元素!! */
    activeRow: null, /* 注意：activeRow指向的不是ElRow组件，而是指向layoutObj的rows数组中的元素!! */
    activeCell: null,
    activeFieldWrapper: null,
    activeFieldLabelWidth: 0,
    //eventHub: eventBus, /* 引入该对象，会导致JSON序列化时出现Converting circular structure to JSON错误!! */
    labelAlign: 'label-left-align',
    labelPosition: 'left',
    labelWidth: 75,
    lineSpacing: 16,  //默认行间距6像素
    hideOnlyTabTitle: false,

    eventHubHandler(elementName) {
      //console.log(elementName)
      if (elementName === actTabElement) {
        this.cancelActivateSection()
        this.cancelActivateRow()
        this.cancelActivateFieldWrapper()
      } else if (elementName === actSectionElement) {
        this.cancelActivateRow()
        this.cancelActivateFieldWrapper()
      } else if (elementName === actRowElement) {
        this.cancelActivateSection()
        this.cancelActivateFieldWrapper()
      } else if (elementName === actFieldWrapperElement) {
        this.cancelActivateSection()
        this.cancelActivateRow()
      }
    },

    createRowCells () {
      const rowCells = [
        { id: 'cell' + generateId(), span: 12, fields: [] },
        { id: 'cell' + generateId(), span: 12, fields: [] }
        // {'id': 'cell' + generateId(), 'span': 6, fields: []}
      ]
      return rowCells
    },

    createRow () {
      const newRow = {
        title: '新增行',
        id: 'row' + generateId(),
        gutter: 12,  //默认列间距12像素
        cells: []
      }
      newRow.cells.push(...this.createRowCells())
      return newRow
    },

    createSection () {
      const newSection = {
        title: '新增区块',
        name: 'sec1',
        id: 'section' + generateId(),
        rows: []
      }
      newSection.rows.push(this.createRow())
      return newSection
    },

    addTab (newTabTitle, skipSaveTip) {
      let tabTitle = newTabTitle
      if (!tabTitle) {
        MessageBox.prompt('请输入页签名称', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          //inputPattern: /^\w+$/, /* 匹配由数字、26个英文字母或者下划线组成的字符串 */
          inputPattern: /^[A-Za-z\d\u4e00-\u9fa5]+$/, /* 匹配由数字、26个英文字母或者中文组成的字符串 */
          inputErrorMessage: '输入不正确'
        }).then(({ value }) => {
          tabTitle = value
          this.doAddNewTab(tabTitle)
        }).catch((e) => {
          console.log(e)
          Message.info('已取消')
        })
      } else {
        this.doAddNewTab(tabTitle, skipSaveTip)
      }
    },

    /*
    //TODO: 是否需要增加调整页签前后顺序功能？？
     */

    doAddNewTab (tabTitle, skipSaveTip) {
      const newTab = {
        title: tabTitle,
        id: 'tab' + generateId(),
        sections: []
      }
      newTab.sections.push(this.createSection())

      newTab.name = 'tabName' + generateId()
      this.tabNames.push(newTab.name)
      this.formTabs.push(newTab)
      this.activeTabName = newTab.name
      this.activeTab = this.formTabs[this.formTabs.length - 1]

      eventHub.$emit(actEventName, actTabElement)
      if (!skipSaveTip) {
        eventHub.$emit(layoutChangedEventName)
      }
    },

    activateTab (tab) {
      this.activeTabName = tab.name
      const activeTabIndex = this.tabNames.indexOf(tab.name)
      this.activeTab = this.formTabs[activeTabIndex]

      eventHub.$emit(actEventName, actTabElement)
    },

    removeTab (targetName) {
      if (this.formTabs.length === 1) {
        Message.info('至少保留一个页签')
        return
      }

      MessageBox.confirm('确定删除该页签?', '提示').then(() => {
        const tabs = this.formTabs
        let activeName = this.activeTabName
        if (activeName === targetName) {
          tabs.forEach((tab, index) => {
            if (tab.name === targetName) {
              const nextTab = tabs[index + 1] || tabs[index - 1]
              if (nextTab) {
                activeName = nextTab.name
              }
            }
          })
        }

        this.activeTabName = activeName
        this.formTabs = tabs.filter(tab => tab.name !== targetName)

        // 重新设置activeTab
        this.tabNames = this.tabNames.filter(tabName => tabName !== targetName)
        const newActiveTabIndex = this.tabNames.indexOf(activeName)
        this.activeTab = this.formTabs[newActiveTabIndex]

        eventHub.$emit(actEventName, actTabElement)
        eventHub.$emit(layoutChangedEventName)
      }).catch(() => {
        //
      })
    },

    addSection () {
      const newSection = this.createSection()
      this.activeTab.sections.push(newSection)
      eventHub.$emit(layoutChangedEventName)
    },

    activateSection (sectionItem, parentTabItem) {
      this.activeSection = sectionItem
      eventHub.$emit(actEventName, actSectionElement)
    },

    cancelActivateSection () {
      this.activeSection = null
    },

    upSection (sectionItem, parentTabItem) {
      const sectionIndex = parentTabItem.sections.indexOf(sectionItem)
      if (sectionIndex > 0) { /* 交换位置 */
        const tempSection = parentTabItem.sections[sectionIndex]
        tempSection.id = 'section' + generateId() // 更新key对应的id值，让DOM元素自动更新
        parentTabItem.sections[sectionIndex] = parentTabItem.sections[sectionIndex - 1]
        parentTabItem.sections[sectionIndex].id = 'section' + generateId() // 更新key对应的id值，让DOM元素自动更新
        parentTabItem.sections[sectionIndex - 1] = tempSection
        eventHub.$emit(layoutChangedEventName)
      } else {
        Message.info('已到最上')
      }
    },

    downSection (sectionItem, parentTabItem) {
      const sectionIndex = parentTabItem.sections.indexOf(sectionItem)
      if (sectionIndex < parentTabItem.sections.length - 1) { /* 交换位置 */
        const tempSection = parentTabItem.sections[sectionIndex]
        tempSection.id = 'section' + generateId() // 更新key对应的id值，让DOM元素自动更新
        parentTabItem.sections[sectionIndex] = parentTabItem.sections[sectionIndex + 1]
        parentTabItem.sections[sectionIndex].id = 'section' + generateId() // 更新key对应的id值，让DOM元素自动更新
        parentTabItem.sections[sectionIndex + 1] = tempSection
        eventHub.$emit(layoutChangedEventName)
      } else {
        Message.info('已到最下')
      }
    },

    deleteSection (sectionItem, parentTabItem) {
      MessageBox.confirm('确定删除该区块?', '提示').then(() => {
        const sectionIndex = parentTabItem.sections.indexOf(sectionItem)
        parentTabItem.sections.splice(sectionIndex, 1)
        Message.success('已删除')
        eventHub.$emit(layoutChangedEventName)
      }).catch(() => {
        //
      })
    },

    activateRow (rowItem, parentSectionItem) {
      this.activeRow = rowItem
      eventHub.$emit(actEventName, actRowElement)
    },

    cancelActivateRow () {
      this.activeRow = null
    },

    activateFieldWrapper (fieldWrapper) {
      this.activeFieldWrapper = fieldWrapper
      this.activeFieldLabelWidth = (!!fieldWrapper.labelWidth) ? fieldWrapper.labelWidth : (!!this.labelWidth ? this.labelWidth: 75)
      eventHub.$emit(actEventName, actFieldWrapperElement)
    },

    cancelActivateFieldWrapper () {
      this.activeFieldWrapper = null
      this.activeFieldLabelWidth = 0
    },

    insertNewRow (rowItem, parentSectionItem) {
      const insertPos = parentSectionItem.rows.indexOf(rowItem)
      const newRow = this.createRow()
      parentSectionItem.rows.splice(insertPos + 1, 0, newRow)
      eventHub.$emit(layoutChangedEventName)
    },

    upRow (rowItem, parentSectionItem) {
      const rowIndex = parentSectionItem.rows.indexOf(rowItem)
      if (rowIndex > 0) {
        const tempRow = parentSectionItem.rows[rowIndex]
        tempRow.id = 'row' + generateId()
        parentSectionItem.rows[rowIndex] = parentSectionItem.rows[rowIndex - 1]
        parentSectionItem.rows[rowIndex].id = 'row' + generateId()
        parentSectionItem.rows[rowIndex - 1] = tempRow
        eventHub.$emit(layoutChangedEventName)
      } else {
        Message.info('已到最上')
      }
    },

    downRow (rowItem, parentSectionItem) {
      const rowIndex = parentSectionItem.rows.indexOf(rowItem)
      if (rowIndex < parentSectionItem.rows.length - 1) {
        const tempRow = parentSectionItem.rows[rowIndex]
        tempRow.id = 'row' + generateId()
        parentSectionItem.rows[rowIndex] = parentSectionItem.rows[rowIndex + 1]
        parentSectionItem.rows[rowIndex].id = 'row' + generateId()
        parentSectionItem.rows[rowIndex + 1] = tempRow
        eventHub.$emit(layoutChangedEventName)
      } else {
        Message.info('已到最下')
      }
    },

    deleteRow (rowItem, parentSectionItem) {
      if (parentSectionItem.rows.length === 1) {
        Message.info('该区块仅剩一行，如需删除行请直接删除该区块')
        return
      }

      MessageBox.confirm('确定删除该行?', '提示').then(() => {
        const rowIndex = parentSectionItem.rows.indexOf(rowItem)
        parentSectionItem.rows.splice(rowIndex, 1)
        Message.success('已删除')
        eventHub.$emit(layoutChangedEventName)
      }).catch(() => {
        //
      })
    },

    deleteFieldWrapper (cellItem, fieldWrapper, callbackFunc) {
      MessageBox.confirm('确定删除字段?', '提示').then(() => {
        if (cellItem.fields[0]) {
          cellItem.fields.splice(0, 1)
          callbackFunc()
          eventHub.$emit(layoutChangedEventName)
        }
      }).catch(() => {
        //
      })
    },

    deleteSlotWrapperWithoutConfirm(cellItem) {
      if (!!cellItem && cellItem.fields[0]) {
        cellItem.fields.splice(0, 1)
      }
    },

    getAllLayoutFields() {
      let layoutFields = []
      for (let i = 0; i < this.formTabs.length; i++) {
        let tab = this.formTabs[i]
        for (let j = 0; j < tab.sections.length; j++) {
          let section = tab.sections[j]
          for (let k = 0; k < section.rows.length; k++) {
            let row = section.rows[k]
            for (let l = 0; l < row.cells.length; l++) {
              let cell = row.cells[l]
              for (let m = 0; m < cell.fields.length; m++) {
                if ((cell.fields[m].type !== 'Slot') && !cell.fields[m].type.startsWith('Custom')) { //排除插槽字段和自定义组件
                  layoutFields.push(cell.fields[m].name)
                }
              }
            }
          }
        }
      }

      return layoutFields
    },

    getAllLayoutFieldWrappers() {
      let fieldWrappers = []
      for (let i = 0; i < this.formTabs.length; i++) {
        let tab = this.formTabs[i]
        for (let j = 0; j < tab.sections.length; j++) {
          let section = tab.sections[j]
          for (let k = 0; k < section.rows.length; k++) {
            let row = section.rows[k]
            for (let l = 0; l < row.cells.length; l++) {
              let cell = row.cells[l]
              for (let m = 0; m < cell.fields.length; m++) {
                if ((cell.fields[m].type !== 'Slot') && !cell.fields[m].type.startsWith('Custom')) { //排除插槽字段
                  fieldWrappers.push(cell.fields[m])
                }
              }
            }
          }
        }
      }

      return fieldWrappers
    },

    getSavableLayout() {
      return {
        tabNames: this.tabNames,
        formTabs: this.formTabs,
        labelPosition: this.labelPosition,
        labelAlign: this.labelAlign,
        labelWidth: this.labelWidth,
        lineSpacing: this.lineSpacing,
        hideOnlyTabTitle: this.hideOnlyTabTitle,
      }
    },

    setLayoutPropsFromServer(responseData) {
      let oldLayout = JSON.parse(responseData.data.layoutJson)
      this.tabNames = oldLayout.tabNames
      this.formTabs = oldLayout.formTabs
      this.labelPosition = !(oldLayout.labelPosition) ? 'left' : oldLayout.labelPosition
      this.labelAlign = !(oldLayout.labelAlign) ? 'label-left-align' : oldLayout.labelAlign
      this.labelWidth = !(oldLayout.labelWidth) ? '75' : oldLayout.labelWidth
      this.lineSpacing = !(oldLayout.lineSpacing) ? '6' : oldLayout.lineSpacing
      this.hideOnlyTabTitle = !!oldLayout.hideOnlyTabTitle
      //激活第一个页签
      this.activateTab(this.formTabs[0])
    },

    emitLayoutChangeEvent() {
      eventHub.$emit(layoutChangedEventName)
    },

    getDragToCell(tabIdx, sectionIdx, rowIdx, cellIdx) {
      let dragTab = this.formTabs[tabIdx]
      if (!!dragTab) {
        let dragSection = dragTab.sections[sectionIdx]
        if (!!dragSection) {
          let dragRow = dragSection.rows[rowIdx]
          if (!!dragRow) {
            return dragRow.cells[cellIdx]
          }
        }
      }

      return null
    },

    checkSlotNameExist(slotName) {
      //let result = true
      for (let i = 0; i < this.formTabs.length; i++) {
        let tab = this.formTabs[i]
        for (let j = 0; j < tab.sections.length; j++) {
          let section = tab.sections[j]
          for (let k = 0; k < section.rows.length; k++) {
            let row = section.rows[k]
            for (let l = 0; l < row.cells.length; l++) {
              let cell = row.cells[l]
              for (let m = 0; m < cell.fields.length; m++) {
                if (/*(cell.fields[m].type === 'Slot') &&*/ (!!cell.fields[m].name) &&
                    (cell.fields[m].name.toLowerCase() === slotName.toLowerCase())) {
                  //result = false
                  return false
                }
              }
            }
          }
        }
      }

      return true
    },

    findFieldWrapper(fieldName) {
      for (let i = 0; i < this.formTabs.length; i++) {
        let tab = this.formTabs[i]
        for (let j = 0; j < tab.sections.length; j++) {
          let section = tab.sections[j]
          for (let k = 0; k < section.rows.length; k++) {
            let row = section.rows[k]
            for (let l = 0; l < row.cells.length; l++) {
              let cell = row.cells[l]
              for (let m = 0; m < cell.fields.length; m++) {
                if ((!!cell.fields[m].name) &&
                    (cell.fields[m].name.toLowerCase() === fieldName.toLowerCase())) {
                  return cell.fields[m]
                }
              }
            }
          }
        }
      }

      return null
    },

  }
}
