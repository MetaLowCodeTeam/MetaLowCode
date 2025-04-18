


/**
 * 自定义新建编辑入口
 * 使用方式同详情入口
 */
// 默认新建编辑
import defaultEntityEdit from "@/views/customize-menu/edit.vue";
// 1. 引入你的自定义新建编辑组件
import TestEdit from './TestEdit.vue';
// 自定义流程表单编辑弹框
import CustomFlowForm from './ListVFormCmp/components/CustomFlowForm.vue'

const editCmpMapping = {
    default: defaultEntityEdit.name,
    // 2. 映射你的编辑组件，自定义组件名称:你引入组件的.name
    // 3. 注册组件在最下面 --------------------------------
    TestEdit: TestEdit.name,
    CustomFlowForm: CustomFlowForm.name
}

// 多实体通用某一个编辑组件映射
const comEditCmpMapping = {
    // useComStep_1 代表所有实体用这一个编辑组件， 编辑组件名称:["*"]   *=>匹配所有，包括初始的详情
    Sadasaduo: ["*"],
    // useSingleStep_1 自定义组件名称组件名称:[实体名称]  你哪个实体要用这个组件就加哪个实体的名称
    TestEdit: ['Ceshichufaqi',],
};


// 映射新建编辑组件名称
export function getEditCmpByEntityName(entityName) {
    // 取通用详情组件映射Key
    let comKeys = Object.keys(comEditCmpMapping);
    // 反转keys 
    let newComKeys = comKeys.reverse();
    // 遍历keys查找对应的详情组件
    for (let index = 0; index < newComKeys.length; index++) {
        const key = newComKeys[index];
        // 如果有返回对应的组件 或者 有通用的
        if(comEditCmpMapping[key].includes(entityName) || comEditCmpMapping[key].includes("*")){
            return editCmpMapping[key];
        }
    }
    return editCmpMapping[entityName]
}

// 注册编辑组件
export function registerCustomEditCmp(app) {
    // 引入默认实体详情
    app.component(defaultEntityEdit.name, defaultEntityEdit);
    // 3 注册你的实体详情组件  组件名称,组件
    app.component(TestEdit.name, TestEdit);
    app.component(CustomFlowForm.name, CustomFlowForm);
}
