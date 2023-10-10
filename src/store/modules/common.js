import { defineStore } from 'pinia';
import { reactive, ref } from 'vue'
import { getEntitySet } from '@/api/system-manager'
import { ElMessage } from 'element-plus'
const useCommonStore = defineStore('commonStore', () => {
    // 所有实体label
    let entityLable = reactive({});
    // 所有实体Name
    let entityName = reactive({});
    // 所有实体Code
    let entityCode = reactive({});
    // 审核弹框选择应用实体---已过滤
    let approveDialogEntityList = ref([]);
    const getEntityLable = () => {
        getEntitySet().then(res => {
            if (res.error != null) {
                ElMessage({ message: res.error, type: 'error' })
                return
            }
            if (res.data && res.data.length > 0) {
                approveDialogEntityList.value = [];
                res.data.forEach(el => {
                    entityLable[el.entityCode] = el.label;
                    entityName[el.entityCode] = el.name;
                    entityCode[el.name] = el.entityCode;
                    if (!el.systemEntityFlag) {
                        approveDialogEntityList.value.push(el);
                    }
                })
            }
        }).catch(res => {
            ElMessage({ message: res.message, type: 'error' })
        })
    }
    return {
        entityLable,
        getEntityLable,
        approveDialogEntityList,
        entityName
    }
}, {
    persist: true
})

export default useCommonStore