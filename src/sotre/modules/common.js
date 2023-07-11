import { defineStore } from 'pinia';
import { reactive, ref } from 'vue'
import { getEntitySet } from '@/api/system-manager'
import { ElMessage } from 'element-plus'
const useCommonStore = defineStore('commonStore', () => {
    let entityLable = reactive({});
    const getEntityLable = () => {
        getEntitySet().then(res => {
            if (res.error != null) {
                ElMessage({ message: res.error, type: 'error' })
                return
            }
            if (res.data && res.data.length > 0) {
                res.data.forEach(el => {
                    entityLable[el.entityCode] = el.label;
                })
            }
        }).catch(res => {
            ElMessage({ message: res.message, type: 'error' })
        })
    }
    return {
        entityLable,
        getEntityLable,
    }
})

export default useCommonStore