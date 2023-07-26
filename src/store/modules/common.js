import { defineStore } from 'pinia';
import { reactive, ref } from 'vue'
import { getEntitySet } from '@/api/system-manager'
import { ElMessage } from 'element-plus'
const useCommonStore = defineStore('commonStore', () => {
    // 所有实体label
    let entityLable = reactive({});
    // 全部实体列表
    let allEntityList = ref([]);
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
                allEntityList.value = res.data;
            }
        }).catch(res => {
            ElMessage({ message: res.message, type: 'error' })
        })
    }
    return {
        entityLable,
        getEntityLable,
        allEntityList
    }
})

export default useCommonStore