import { defineStore } from 'pinia';
import { ref } from 'vue'
// import useCheckStatusStore from "@/store/modules/checkStatus";
// const { changeStyle } = useCheckStatusStore();
// import { storeToRefs } from 'pinia';
// const { newMsgNum } = storeToRefs(useCheckStatusStore());
const useCheckStatusStore = defineStore('checkStatusStore', () => {
    // 新消息数量
    let newMsgNum = ref(0);
    const setNewMsgNum = (v)=>{
        newMsgNum.value = v;
    }
    return {
        newMsgNum,
        setNewMsgNum
    }
}, {
    persist: true
})

export default useCheckStatusStore