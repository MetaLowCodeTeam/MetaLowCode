import { defineStore } from 'pinia';
import { ref } from 'vue'
// import useLayoutConfigStore from "@/store/modules/layoutConfig";
// const { setNavigationList } = useLayoutConfigStore();
// import { storeToRefs } from 'pinia';
// const { newMsgNum } = storeToRefs(useLayoutConfigStore());
const useLayoutConfigStore = defineStore('layoutConfig', () => {
    // 导航列表
    let navigationList = ref([]);
    const setNavigationList = (list) => {
        navigationList.value = list;
    }
    return {
        navigationList,
        setNavigationList
    }
}, {
    persist: true
})

export default useLayoutConfigStore