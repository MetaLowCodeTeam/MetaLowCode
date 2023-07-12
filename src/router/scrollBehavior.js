import { nextTick } from 'vue'
import useViewTagsStore from '@/store/modules/viewTags';
import { storeToRefs } from "pinia";

export function beforeEach(to, from) {
    var adminMain = document.querySelector('#adminui-main')
    if (!adminMain) { return false }
    const viewTagsStore = useViewTagsStore();
    const { updateViewTags } = viewTagsStore;
    updateViewTags({
        fullPath: from.fullPath,
        scrollTop: adminMain.scrollTop
    })
}

export function afterEach(to) {
    var adminMain = document.querySelector('#adminui-main')
    if (!adminMain) { return false }
    nextTick(() => {
        const viewTagsStore = useViewTagsStore();
        const { viewTags } = storeToRefs(viewTagsStore);
        var beforeRoute = viewTags.value.filter(v => v.fullPath == to.fullPath)[0]
        if (beforeRoute) {
            adminMain.scrollTop = beforeRoute.scrollTop || 0
        }
    })
}