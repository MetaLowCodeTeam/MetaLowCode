import { onBeforeUnmount } from 'vue';
import eventBus from "@/utils/event-bus";

export function useRefreshDashboard(props, initOption) {
    const handleRefreshDashboard = (field) => {
        if (props.designer) {
            return;
        }
        let hasField = [];
        if(!field) {
            initOption();
            return;
        }
        if(typeof field === 'string') {
            hasField.push(field);
        }else {
            hasField = field;
        }
        if(hasField.includes(props.field.id)) {
            initOption();
        }
    };

    // 监听事件
    eventBus.$on("refresh-dashboard", handleRefreshDashboard);
    

    // 组件卸载时移除事件监听，避免内存泄漏
    onBeforeUnmount(() => {
        eventBus.$off('refresh-dashboard', handleRefreshDashboard);
    });
}