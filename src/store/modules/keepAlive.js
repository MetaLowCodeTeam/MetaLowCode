
import { defineStore } from 'pinia';
import { ref } from 'vue'


const useKeepAliveStore = defineStore('keepAliveStore', () => {
    let keepLiveRoute = ref([]);
    let routeShow = ref(true);
    function pushKeepLive(component) {
        if (!keepLiveRoute.value.includes(component)) {
            keepLiveRoute.value.push(component)
        }
    }
    function removeKeepLive(component) {
        var index = keepLiveRoute.value.indexOf(component);
        if (index !== -1) {
            keepLiveRoute.value.splice(index, 1);
        }
    }
    function clearKeepLive(state) {
        keepLiveRoute.value = []
    }
    function setRouteShow(key) {
        routeShow.value = key
    }
    return {
        keepLiveRoute,
        routeShow,
        pushKeepLive,
        removeKeepLive,
        clearKeepLive,
        setRouteShow
    }
})

export default useKeepAliveStore