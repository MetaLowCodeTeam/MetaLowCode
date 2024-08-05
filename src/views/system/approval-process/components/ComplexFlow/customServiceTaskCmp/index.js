


/**
 * 自定义服务任务组件
 */

/**
 * 1. 引入你自己开发的自定义服务任务组件
 */
import ServiceTaskTest1 from './ServiceTaskTest1.vue'
import ServiceTaskTest2 from './ServiceTaskTest2.vue'

// 注册服务组件
export function registerCustomServiceTaskCmp(app) {
    /**
     * 2 注册你的组件
     * param1 注册的组件name, 同步 下面：customServiceTaskCmpMapping 映射的 value
     * param2 注册你引入的组件
     */
    app.component('ServiceTaskTest1', ServiceTaskTest1);
    app.component('ServiceTaskTest2', ServiceTaskTest2);
}



// 服务任务组件映射
export const customServiceTaskCmpMapping = [
    {
        // 模板名称
        label: "自定义服务任务1",
        value: "ServiceTaskTest1"
    },
    {
        // 模板名称
        label: "自定义服务任务2",
        value: "ServiceTaskTest2"
    },
];

