import { defineStore } from 'pinia';
import { reactive, ref } from 'vue'
import { getEntitySet } from '@/api/system-manager'
import { ElMessage } from 'element-plus'
const useCommonStore = defineStore('commonStore', () => {
    // 所有实体label
    let allEntityLabel = reactive({});
    // 所有实体Name
    let allEntityName = reactive({});
    // 所有实体Code
    let allEntityCode = reactive({});
    // 非系统实体
    let unSystemEntityList = ref([]);
    const getEntityList = () => {
        getEntitySet().then(res => {
            if (res.error != null) {
                ElMessage({ message: res.error, type: 'error' })
                return
            }
            if (res.data && res.data.length > 0) {
                refreshCache(res.data)
            }
        }).catch(res => {
            ElMessage({ message: res.message, type: 'error' })
        })
    }
    const refreshCache = (list) => {
        unSystemEntityList.value = [];
        list.forEach(el => {
            allEntityLabel[el.entityCode] = el.label;
            allEntityName[el.entityCode] = el.name;
            allEntityCode[el.name] = el.entityCode;
            if (!el.systemEntityFlag) {
                unSystemEntityList.value.push(el);
            }
        })
    }
    return {
        allEntityLabel,
        getEntityList,
        unSystemEntityList,
        refreshCache,
        allEntityName,
        allEntityCode
    }
}, {
    persist: true
})

export default useCommonStore