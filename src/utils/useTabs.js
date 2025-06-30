import { nextTick  } from 'vue'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import router from '@/router'


import useViewTagsStore from "@/store/modules/viewTags";
import useKeepAliveStore from "@/store/modules/keepAlive";


export default {
	//刷新标签
	// refresh() {
	// 	NProgress.start()
	// 	const route = router.currentRoute.value
	// 	removeKeepLive(route.name)
	// 	setRouteShow(false)
	// 	nextTick(() => {
	// 		pushKeepLive(route.name)
	// 		setRouteShow(true)
	// 		NProgress.done()
	// 	})
	// },
	//关闭标签
	close(tag) {
        const viewTagsStore = useViewTagsStore();
        const keepAliveStore = useKeepAliveStore();
        const { removeViewTags, getViewTags } = viewTagsStore;
        const { removeKeepLive } = keepAliveStore;
		const route = tag || router.currentRoute.value
        const tagList = getViewTags();
        let tagIndex = tagList.findIndex(item => item.fullPath === route.fullPath);
        removeViewTags(route);
		removeKeepLive(route.name)
		const latestView = tagList[tagIndex - 1]
		if (latestView) {
			router.push(latestView)
		} else {
			router.push('/')
		}
	},
    // 刷新标签
    refresh(route) {
        const keepAliveStore = useKeepAliveStore();
        const { removeKeepLive, setRouteShow, pushKeepLive } = keepAliveStore;
        removeKeepLive(route.name)
        setRouteShow(false);
        nextTick(() => {
            pushKeepLive(route.name)
            setRouteShow(true)
        })
    },
	//关闭标签后处理
	// closeNext(next) {
	// 	const route = router.currentRoute.value
	// 	removeViewTags(route);
	// 	removeIframeList(route)
	// 	removeKeepLive(route.name)
	// 	if(next){
	// 		const tagList = viewTags.value;
	// 		next(tagList)
	// 	}
	// },
	//关闭其他
	// closeOther() {
	// 	const route = router.currentRoute.value
	// 	const tagList = [...viewTags.value]
	// 	tagList.forEach(tag => {
	// 		if(tag.meta&&tag.meta.affix || route.fullPath==tag.fullPath){
	// 			return true
	// 		}else{
	// 			this.close(tag)
	// 		}
	// 	})
	// },
	//设置标题
	// setTitle(title){
    //     updateViewTagsTitle(title)
	// }
}
