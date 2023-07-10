import config from "@/config";
import { defineStore } from 'pinia';
import { ref } from 'vue'
// import useGlobalStore from "@/sotre/modules/global";
// const { clearViewTags } = useGlobalStore();
// const { ismobile } = storeToRefs(useGlobalStore());
const useGlobalStore = defineStore('globalStore', () => {
    //移动端布局
    let ismobile = ref(false);
    //布局
    let layout = ref(config.LAYOUT);
    //菜单是否折叠 toggle
    let menuIsCollapse = ref(config.MENU_IS_COLLAPSE);
    //多标签栏
    let layoutTags = ref(config.LAYOUT_TAGS);
    //主题 
    let theme = ref(config.THEME);

    function SET_ismobile(key) {
        ismobile.value = key
    }
    function SET_layout(key) {
        layout.value = key
    }
    function SET_theme(key) {
        theme.value = key
    }
    function TOGGLE_menuIsCollapse() {
        menuIsCollapse.value = !menuIsCollapse.value;
    }
    function TOGGLE_layoutTags() {
        layoutTags.value = !layoutTags.value
    }

    return {
        ismobile,
        layout,
        menuIsCollapse,
        layoutTags,
        theme,
        SET_ismobile,
        SET_layout,
        SET_theme,
        TOGGLE_menuIsCollapse,
        TOGGLE_layoutTags
    }

}, {
    persist: true
})

export default useGlobalStore
