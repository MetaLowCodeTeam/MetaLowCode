


/**
 * 自定义实体列表模板
 */

export const customListEntry = [
    {
        // 模板名称
        label: "自定义测试实体模板",
        // 对应的模板组件， 该组件指向  views\custom-page\TestList.vue
        // 也就是说你要先建立一个 TestList.vue，再来这里写名字  
        value: "TestList"
    },
    {
        // 模板名称
        label: "自定义组织架构模板",
        // 对应的模板组件， 该组件指向  views\custom-page\TestList2.vue
        // 也就是说你要先建立一个 TestList2.vue，再来这里写名字  
        value: "TestList2"
    },
    {
        // 模板名称
        label: "自定义列表卡片模板",
        // 对应的模板组件， 该组件指向  views\custom-page\ListCard.vue
        // 也就是说你要先建立一个 ListCard.vue，再来这里写名字  
        value: "ListCard"
    },
    {
        label: "自定义列表日历模板",
        value: "ListViewCmp/FullCalendarView",
        // 是否支持移动端
        // 日历视图用的：FullCalendar，对移动端适配不友好，不建议开放
        isMobileSupported: false,
    },
];


