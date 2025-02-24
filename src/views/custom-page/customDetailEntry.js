/**
 * 自定义实体入口文件
 */



/**
 * 自定义详情入口
 * 1. 引入组件看 importStep_1、importStep_2、importStep_3
 * 2. 如果你多个实体想用同一个你自定义的详情组件。 
 *    2.1 先完成1
 *    2.2 然后看 useSingleStep_1
 * 3. 如果你所有实体都想用同一个组件。
 *    3.1 先完成1
 *    2.2 然后看 useComStep_1
 */
// 默认实体详情
import defaultEntityDetail from "@/views/customize-menu/detail.vue";
// importStep_1. 引入你的自定义实体详情
import TestDetail from './TestDetail.vue';
// 自定义用户详情
import UserDetail from './Organizational/UserDetail.vue';

// 详情组件映射关系
const detailCmpMapping = {
    default: defaultEntityDetail.name,
    // importStep_2. 映射你的实体详情，实体名称:组件名称
    TestDetail: TestDetail.name,
    UserDetail: UserDetail.name,
}

// 多实体通用某一个详情组件映射
const comDetailCmpMapping = {
    // useComStep_1 代表所有实体用这一个详情组件， 详情组件名称:["*"]   *=>匹配所有，包括初始的详情
    // Sadasaduo: ["*"],
    // useSingleStep_1 详情组件名称:[对应的实体名称]
    TestDetail: ['DemoCompany', 'Sadasaduo'],
    UserDetail: ['User'],
};

// 返回映射详情组件名称
export function getDetailCmpByEntityName(entityName) {
    // 取通用详情组件映射Key
    let comKeys = Object.keys(comDetailCmpMapping);
    // 反转keys 
    let newComKeys = comKeys.reverse();
    // 遍历keys查找对应的详情组件
    for (let index = 0; index < newComKeys.length; index++) {
        const key = newComKeys[index];
        // 如果有返回对应的组件 或者 有通用的
        if(comDetailCmpMapping[key].includes(entityName) || comDetailCmpMapping[key].includes("*")){
            return detailCmpMapping[key];
        }
    }
    // 没有通用的就返回初始的
    return detailCmpMapping[entityName]
}

// 注册详情组件
export function registerCustomDetailCmp(app) {
    // 引入默认实体详情
    app.component(defaultEntityDetail.name, defaultEntityDetail);
    // importStep_3 注册你的实体详情组件  组件名称,组件
    app.component(TestDetail.name, TestDetail);
    // 注册用户详情
    app.component(UserDetail.name, UserDetail);
}




