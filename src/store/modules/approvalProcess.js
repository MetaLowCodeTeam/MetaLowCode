import { defineStore } from 'pinia';
import { ref } from 'vue'
// import usePpprovalProcessStore from "@/store/modules/approvalProcess";
// const { changeStyle } = useGlobalStore();
// import { storeToRefs } from 'pinia';
// const { style } = storeToRefs(usePpprovalProcessStore());
const usePpprovalProcessStore = defineStore('approvalProcessStore', () => {
    // 风格
    let style = ref('default');
    return {
        style
    }
})

export default usePpprovalProcessStore