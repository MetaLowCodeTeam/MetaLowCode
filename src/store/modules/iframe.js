
import { defineStore } from 'pinia';
import { ref } from 'vue'

const useIframeStore = defineStore('iframeStore', () => {
    let iframeList = ref([]);
    function setIframeList(route) {
        iframeList.value = []
        iframeList.value.push(route)
    }
    function pushIframeList(route) {
        let target = iframeList.value.find((item) => item.path === route.path)
        if (!target) {
            iframeList.value.push(route)
        }
    }
    function removeIframeList(route) {
        iframeList.value.forEach((item, index) => {
            if (item.path === route.path) {
                iframeList.value.splice(index, 1)
            }
        })
    }
    function refreshIframe(route) {
        iframeList.value.forEach((item) => {
            if (item.path == route.path) {
                var url = route.meta.url;
                item.meta.url = '';
                setTimeout(function () {
                    item.meta.url = url
                }, 200);
            }
        })
    }
    function clearIframeList() {
        iframeList.value = []
    }
    return {
        iframeList,
        setIframeList,
        pushIframeList,
        removeIframeList,
        refreshIframe,
        clearIframeList
    }
}, {
    persist: true
})

export default useIframeStore
