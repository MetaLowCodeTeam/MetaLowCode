import router from '@/router';
import { defineStore } from 'pinia';
import { ref } from 'vue'

const useViewTagsStore = defineStore('viewTagsStore', () => {
    let viewTags = ref([])

    const pushViewTags = (route) => {
        let backPathIndex = viewTags.value.findIndex(item => item.fullPath == router.options.history.state.back)
        let target = viewTags.value.find((item) => item.fullPath === route.fullPath)
        let isName = route.name
        if (!target && isName) {
            if (backPathIndex == -1) {
                viewTags.value.push(route)
            } else {
                viewTags.value.splice(backPathIndex + 1, 0, route)
            }
        }
    }


    const removeViewTags = (route) => {
        viewTags.value.forEach((item, index) => {
            if (item.fullPath === route.fullPath) {
                viewTags.value.splice(index, 1)
            }
        })
    }
    const updateViewTags = (route) => {
        viewTags.value.forEach((item) => {
            if (item.fullPath == route.fullPath) {
                item = Object.assign(item, route)
            }
        })
    }
    const updateViewTagsTitle = (title = '') => {
        const nowFullPath = location.hash.substring(1)
        viewTags.value.forEach((item) => {
            if (item.fullPath == nowFullPath) {
                item.meta.title = title
            }
        })
    }
    const clearViewTags = () => {
        viewTags.value = []
    }

    return {
        viewTags,
        pushViewTags,
        removeViewTags,
        updateViewTags,
        updateViewTagsTitle,
        clearViewTags
    }
}, {
    persist: true
})

export default useViewTagsStore
