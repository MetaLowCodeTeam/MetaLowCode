<!--
 * @Descripttion: 处理iframe持久化，涉及store(VUEX)
 * @version: 1.0
 * @Author: sakuya
 * @Date: 2021年6月30日13:20:41
 * @LastEditors:
 * @LastEditTime:
-->

<template>
    <div v-show="$route.meta.type=='iframe'" class="iframe-pages">
        <iframe
            v-for="item in iframeList"
            :key="item.meta.url"
            v-show="$route.meta.url==item.meta.url"
            :src="item.meta.url"
            frameborder="0"
        ></iframe>
    </div>
</template>

<script>
import useIframeStore from "@/sotre/modules/iframe";
import useGlobalStore from "@/sotre/modules/global";
import { storeToRefs } from 'pinia';
const iframeStore = useIframeStore();
const { iframeList } = storeToRefs(useIframeStore());
const { setIframeList, pushIframeList, clearIframeList } = iframeStore;
const { ismobile,layoutTags } = storeToRefs(useGlobalStore());
export default {
    data() {
        return {};
    },
    watch: {
        $route(e) {
            this.push(e);
        },
    },
    data(){
        return {
            ismobile:ismobile.value,
            layoutTags:layoutTags.value
        }
    },
    created() {
        this.push(this.$route);
    },
    computed:{
        iframeList(){
            return iframeList.value
        },
        ismobile(){
            return ismobile.value
        },
        layoutTags(){
            return layoutTags.value
        }
    },
    mounted() {},
    methods: {
        push(route) {
            if (route.meta.type == "iframe") {
                if (this.ismobile || !this.layoutTags) {
                    setIframeList(route);
                } else {
                    pushIframeList(route);
                }
            } else {
                if (this.ismobile || !this.layoutTags) {
                    clearIframeList();
                }
            }
        },
    },
};
</script>

<style scoped>
.iframe-pages {
    width: 100%;
    height: 100%;
    background: #fff;
}
iframe {
    border: 0;
    width: 100%;
    height: 100%;
    display: block;
}
</style>
