


/**
 * 自定义列表入口
 * 使用方式同详情入口
 */
// 默认列表
import defaultEntityList from "./DefaultListSubForm.vue";
// 1. 引入你的自定义列表组件
import TestSubList from './TestListSubForm.vue';

const ListSubFormCmpMapping = {
    default: defaultEntityList.name,
    // 2. 映射你的实体详情，实体名称:组件名称
    TestSubList: TestSubList.name,
}

// 多实体通用某一个编辑组件映射
const comListSubFormCmpMapping = {
    // useComStep_1 代表所有实体用这一个详情组件， 详情组件名称:["*"]   *=>匹配所有，包括初始的详情
    // Sadasaduo: ["*"],
    // useSingleStep_1 详情组件名称:[对应的实体名称]
    TestSubList: ['Kaohemingxi'],
};


// 映射列表组件名称
export function getListSubFormCmpByEntityName(entityName) {
    // 取通用详情组件映射Key
    let comKeys = Object.keys(comListSubFormCmpMapping);
    // 反转keys 
    let newComKeys = comKeys.reverse();
    // 遍历keys查找对应的详情组件
    for (let index = 0; index < newComKeys.length; index++) {
        const key = newComKeys[index];
        // 如果有返回对应的组件 或者 有通用的
        if(comListSubFormCmpMapping[key].includes(entityName) || comListSubFormCmpMapping[key].includes("*")){
            return ListSubFormCmpMapping[key];
        }
    }
    return ListSubFormCmpMapping[entityName]
}

// 注册详情组件
export function registerCustomListSubFormCmp(app) {
    // 引入默认实体详情
    app.component(defaultEntityList.name, defaultEntityList);
    // 3 注册你的实体详情组件  组件名称,组件
    app.component(TestSubList.name, TestSubList);
}
