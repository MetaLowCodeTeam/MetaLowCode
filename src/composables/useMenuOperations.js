// Extracted composable for menu operations

import { reactive } from 'vue';
import { ElMessageBox } from 'element-plus';

export function useMenuOperations(
    menuData, 
    cutMenu, 
    getGroupEntityList, 
    systemEntityName, 
    systemEntityPath, 
    filterUseCustomEntity,
    ElMessage,
) {

  const getGuid = () => {
    return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = (Math.random() * 16) | 0,
        v = c == 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  };

  const defaultMenu = reactive({
    name: '未命名',
    type: 1,
    entityCode: null,
    outLink: '',
    openType: 0,
    guid: '',
    parentGuid: '',
    isOpeneds: false,
    useIcon: '',
    iconColor: '',
    chartId: '',
    useCustom: false,
    useComponent: '',
    formEntityCode: '',
    formId: '',
    pcShow: true,
    mobileShow: true,
    redirectCarrySessionId: false,
    customPageType: 1,
    customCode: '',
    reversalCustomCode: false,
  });

  const addMenu = () => {
    defaultMenu.guid = getGuid();
    menuData.list.push(Object.assign({}, defaultMenu));
    cutMenu.value = Object.assign({}, defaultMenu);
  };

  const addChildrenMenu = (menu) => {
    if (!menu.children) {
      menu.children = [];
    }
    if (!menu.guid) {
      menu.guid = getGuid();
    }
    let setMenu = Object.assign({}, defaultMenu);
    setMenu.parentGuid = menu.guid;
    setMenu.guid = getGuid();
    menu.children.push(setMenu);
    cutMenu.value = Object.assign({}, setMenu);
  };

  const delMenu = (menu, inx, subInx) => {
    ElMessageBox.confirm('是否确认删除？', '提示：').then(() => {
      if (!menu.parentGuid) {
        menuData.list.splice(inx, 1);
      } else {
        menuData.list[inx].children.splice(subInx, 1);
      }
      if (cutMenu.value && cutMenu.value.guid && menu.guid == cutMenu.value.guid) {
        cutMenu.value = null;
      }
    }).catch(() => {});
  };

  const associationChange = (entityCode, target, isInit) => {
    let linkEntity;
    for (let index = 0; index < getGroupEntityList().length; index++) {
      const element = getGroupEntityList()[index];
      for (let j = 0; j < element.options.length; j++) {
        const subEl = element.options[j];
        if (subEl.entityCode == entityCode) {
          linkEntity = subEl;
          break;
        }
      }
      if (linkEntity) break;
    }
    let shouldSkip = isInit && target === 6;
    if (!shouldSkip) {
      cutMenu.value.name = linkEntity.label;
    }
    if (target != 6) {
      cutMenu.value.entityCode = linkEntity.entityCode;
      cutMenu.value.entityName = linkEntity.name;
    }
    cutMenu.value.detailEntityFlag = linkEntity.detailEntityFlag;
    cutMenu.value.mainEntityCode = linkEntity.mainEntityCode;
    if (cutMenu.value.type == 1 && filterUseCustomEntity.includes(cutMenu.value.entityName)) {
      cutMenu.value.useComponent = '';
      // Assuming useComponentChange is defined elsewhere
      // useComponentChange();
    }
  };

  const confirmMenu = () => {
    if (cutMenu.value.type == 1 && !cutMenu.value.entityCode && (!cutMenu.value.children || cutMenu.value.children.length < 1)) {
      ElMessage.warning('请选择关联项');
      return;
    }
    if (cutMenu.value.type == 2 && !cutMenu.value.outLink) {
      ElMessage.warning('请输入外部地址');
      return;
    }
    if (cutMenu.value.type == 3 && !cutMenu.value.outLink) {
      ElMessage.warning('请输入自定义页面名称');
      return;
    }
    if (cutMenu.value.type == 6 && !cutMenu.value.formId) {
      ElMessage.warning('请选择表单');
      return;
    }
    if (cutMenu.value.type == 1 && cutMenu.value.useCustom && !cutMenu.value.useComponent) {
      ElMessage.warning('请选择自定义列表模板');
      return;
    }
    if (systemEntityName.value.includes(cutMenu.value.entityName) && cutMenu.value.type != 2) {
      cutMenu.value.type = 4;
      cutMenu.value.outLink = systemEntityPath[cutMenu.value.entityName];
    }
    
    // 如果是顶级菜单
    if (!cutMenu.value.parentGuid) {
      let inx = getMenuInx(menuData.list, cutMenu.value.guid);
      if (inx == -1) {
        menuData.list.push(Object.assign({}, cutMenu.value));
      } else {
        menuData.list[inx] = Object.assign(menuData.list[inx], cutMenu.value);
      }
    } else {
      // 使用递归方法查找并更新任意深度的菜单项
      const updated = updateMenuRecursively(menuData.list, cutMenu.value);
      if (!updated) {
        // 如果找不到父级，添加到顶级
        cutMenu.value.parentGuid = '';
        menuData.list.push(Object.assign({}, cutMenu.value));
      }
    }
    cutMenu.value = null;
  };

  // 递归更新菜单项的辅助函数
  const updateMenuRecursively = (items, targetMenu) => {
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      
      // 如果找到了目标菜单项，直接更新
      if (item.guid === targetMenu.guid) {
        items[i] = Object.assign(items[i], targetMenu);
        return true;
      }
      
      // 如果当前项是目标菜单的父级
      if (item.guid === targetMenu.parentGuid) {
        if (!item.children) item.children = [];
        
        // 在子菜单中查找目标项
        let childIndex = -1;
        for (let j = 0; j < item.children.length; j++) {
          if (item.children[j].guid === targetMenu.guid) {
            childIndex = j;
            break;
          }
        }
        
        if (childIndex !== -1) {
          // 更新现有子菜单
          item.children[childIndex] = Object.assign(item.children[childIndex], targetMenu);
        } else {
          // 添加新的子菜单
          item.children.push(Object.assign({}, targetMenu));
        }
        return true;
      }
      
      // 递归查找子菜单
      if (item.children && item.children.length > 0) {
        if (updateMenuRecursively(item.children, targetMenu)) {
          return true;
        }
      }
    }
    return false;
  };

  const getMenuInx = (array, guid) => {
    for (let index = 0; index < array.length; index++) {
      const element = array[index];
      if (element.guid == guid) {
        return index;
      }
    }
    return -1;
  };

  const formatMenuList = () => {
    const processMenu = (menuList) => {
      let saveMenu = [];
      
      menuList.forEach((el) => {
        const isValidMenu = el.formId || el.chartId || el.entityCode || el.outLink;
        const hasChildren = el.children && el.children.length > 0;
        
        let isMenu = { ...el };
        
        if (hasChildren) {
          // 递归处理子菜单
          isMenu.children = processMenu(el.children);
          
          // 如果处理后还有子菜单，设置为父级菜单
          if (isMenu.children.length > 0) {
            isMenu.entityCode = "parentMenu";
            isMenu.entityName = "parentMenu";
            saveMenu.push(isMenu);
          }
          // 如果处理后没有子菜单了，但自己是有效菜单，还是要保留（但不设置为parentMenu）
          else if (isValidMenu && el.entityCode !== "parentMenu") {
            saveMenu.push(isMenu);
          }
          // 如果处理后没有子菜单，且自己原本就是parentMenu或不是有效菜单，就删除
        } else if (isValidMenu && el.entityCode !== "parentMenu") {
          // 没有子菜单但是有效菜单，且不是parentMenu，保留
          saveMenu.push(isMenu);
        }
        // 没有子菜单也不是有效菜单，不添加（相当于删除）
      });
      
      return saveMenu;
    };
    
    return processMenu(menuData.list);
  };

  return {
    getGuid,
    defaultMenu,
    addMenu,
    addChildrenMenu,
    delMenu,
    associationChange,
    confirmMenu,
    getMenuInx,
    formatMenuList,
  };
} 