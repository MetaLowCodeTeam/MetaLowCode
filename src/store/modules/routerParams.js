import { defineStore } from 'pinia';
import { ref } from 'vue'

const routerParamsStore = defineStore('routerParams', () => {
    let routerParams = ref({});
    const setRouterParams = (v) => {
        routerParams.value = v;
    }
    return {
        routerParams,
        setRouterParams
    }
})

export default routerParamsStore