import { nextTick  } from 'vue'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import router from '@/router'
import store from '@/store'

import useViewTagsStore from "@/store/modules/viewTags";
import useKeepAliveStore from "@/store/modules/keepAlive";
import useIframeStore from "@/store/modules/iframe";
import { storeToRefs } from "pinia";
const { viewTags } = storeToRefs(viewTagsStore);
const viewTagsStore = useViewTagsStore();
const keepAliveStore = useKeepAliveStore();
const iframeStore = useIframeStore();
const { removeViewTags,updateViewTagsTitle } = viewTagsStore;
const { pushKeepLive,removeKeepLive,setRouteShow } = keepAliveStore;
const { removeIframeList } = iframeStore;


export default {
	//刷新标签
	refresh() {
		NProgress.start()
		const route = router.currentRoute.value
		removeKeepLive(route.name)
		setRouteShow(false)
		nextTick(() => {
			pushKeepLive(route.name)
			setRouteShow(true)
			NProgress.done()
		})
	},
	//关闭标签
	close(tag) {
		const route = tag || router.currentRoute.value
        removeViewTags(route);
		removeIframeList(route)
		removeKeepLive(route.name)
		const tagList = viewTags.value;
		const latestView = tagList.slice(-1)[0]
		if (latestView) {
			router.push(latestView)
		} else {
			router.push('/')
		}
	},
	//关闭标签后处理
	closeNext(next) {
		const route = router.currentRoute.value
		removeViewTags(route);
		removeIframeList(route)
		removeKeepLive(route.name)
		if(next){
			const tagList = viewTags.value;
			next(tagList)
		}
	},
	//关闭其他
	closeOther() {
		const route = router.currentRoute.value
		const tagList = [...viewTags.value]
		tagList.forEach(tag => {
			if(tag.meta&&tag.meta.affix || route.fullPath==tag.fullPath){
				return true
			}else{
				this.close(tag)
			}
		})
	},
	//设置标题
	setTitle(title){
        updateViewTagsTitle(title)
	}
}
